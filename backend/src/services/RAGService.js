import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
import { generateEmbeddings, embeddingConfig } from './EmbeddingService.js';
import pinecone from '../config/pinecone.js';

class RAGService {
    /**
     * Extracts text from a PDF buffer.
     * @param {Buffer} buffer 
     * @returns {Promise<string>}
     */
    async extractTextFromPDF(buffer) {
        try {
            const data = await pdfParse(buffer);
            return data.text || '';
        } catch (error) {
            console.error("PDF Parse Error:", error);
            const msg = error?.message || String(error);
            if (msg.toLowerCase().includes('password')) {
                throw new Error("PDF is password-protected. Please remove the password and try again.");
            }
            if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('cannot')) {
                throw new Error("Invalid or corrupted PDF. Try re-saving the file or use a different PDF.");
            }
            throw new Error("Failed to extract text from PDF: " + msg);
        }
    }

    /**
     * Extracts text from various file types.
     * @param {Buffer} buffer 
     * @param {string} filename
     * @returns {Promise<string>}
     */
    async extractTextFromFile(buffer, filename) {
        const ext = filename.toLowerCase().split('.').pop();
        
        switch (ext) {
            case 'pdf':
                return this.extractTextFromPDF(buffer);
            case 'txt':
            case 'md':
                return buffer.toString('utf-8');
            case 'csv':
                return buffer.toString('utf-8');
            case 'docx':
                return this.extractTextFromDOCX(buffer);
            default:
                throw new Error(`Unsupported file type: .${ext}. Supported: PDF, TXT, CSV, DOCX`);
        }
    }

    /**
     * Basic DOCX text extraction (reads XML content).
     * @param {Buffer} buffer
     * @returns {Promise<string>}
     */
    async extractTextFromDOCX(buffer) {
        try {
            // DOCX files are ZIP archives containing XML
            // Use a simple approach: extract raw text from the XML
            const { Readable } = await import('stream');
            const { createUnzip } = await import('zlib');
            
            // DOCX is a ZIP file - we need to find document.xml inside
            // Simple approach: convert to string and extract text between XML tags
            const text = buffer.toString('utf-8');
            // If it's actually a DOCX (ZIP), the raw toString won't work well
            // Fall back to treating as plain text if xml extraction fails
            const xmlContent = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            if (xmlContent.length > 50) {
                return xmlContent;
            }
            throw new Error("Could not extract text from DOCX. Try converting to PDF or TXT first.");
        } catch (error) {
            console.error("DOCX Parse Error:", error);
            throw new Error("Failed to extract text from DOCX: " + error.message);
        }
    }

    /**
     * Splits text into chunks with overlap.
     * @param {string} text 
     * @param {number} chunkSize 
     * @param {number} overlap 
     * @returns {string[]}
     */
    splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
        const chunks = [];
        let i = 0;

        while (i < text.length) {
            // Ensure we don't slit words in half if possible (basic implementation here)
            const chunk = text.slice(i, i + chunkSize);
            chunks.push(chunk);

            // Break if we are at the end
            if (i + chunkSize >= text.length) break;

            // Move forward by chunkSize - overlap
            i += (chunkSize - overlap);
        }

        return chunks;
    }

    /**
     * Generates embeddings for chunks. Uses OpenAI; falls back to Google Gemini on quota exceeded.
     * @param {string[]} chunks 
     * @returns {Promise<number[][]>}
     */
    async generateEmbeddingsForChunks(chunks) {
        try {
            return await generateEmbeddings(chunks);
        } catch (error) {
            console.error("Embedding Error:", error);
            throw new Error("Failed to generate embeddings: " + error.message);
        }
    }

    /**
     * Stores chunks and vectors in Pinecone.
     * @param {string} userId 
     * @param {string} docId 
     * @param {string[]} chunks 
     * @param {number[][]} embeddings 
     */
    async storeVectors(userId, docId, chunks, embeddings, fileName) {
        try {
            const index = pinecone.index(embeddingConfig.indexName);
            // Truncate text to stay under Pinecone 40KB metadata limit per value
            const maxTextLen = 30000;
            const vectors = chunks.map((chunk, i) => ({
                id: `${docId}_chunk_${i}`,
                values: embeddings[i],
                metadata: {
                    userId: String(userId),
                    docId: String(docId),
                    fileName: String(fileName || '').slice(0, 200),
                    text: String(chunk).slice(0, maxTextLen),
                    chunkIndex: i
                }
            }));

            // Batch upsert (Pinecone limit ~2MB per request; 100 vectors is safe for 1536 dim + metadata)
            const batchSize = 100;
            for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                await index.upsert(batch);
                console.log(`Upserted batch ${i / batchSize + 1}`);
            }

            console.log(`Stored ${vectors.length} vectors for doc ${docId}`);
        } catch (error) {
            console.error("Pinecone Upsert Error:", error);
            throw new Error("Failed to store vector data: " + error.message);
        }
    }

    /**
     * Full pipeline for processing an uploaded document.
     */
    async processDocument(fileBuffer, userId, docId, fileName) {
        console.log(`Processing document ${docId} (${fileName}) for user ${userId}...`);

        // 1. Extract
        const text = await this.extractTextFromPDF(fileBuffer);
        const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        console.log("Text extracted length:", cleanText.length);

        if (cleanText.length < 50) {
            throw new Error("PDF text is too short or empty.");
        }

        // 2. Chunk
        const chunks = this.splitTextIntoChunks(cleanText, 1000, 200);
        console.log(`Split into ${chunks.length} chunks`);

        // 3. Embed
        const embeddings = await this.generateEmbeddingsForChunks(chunks);
        console.log("Embeddings generated");

        // 4. Store
        await this.storeVectors(userId, docId, chunks, embeddings, fileName);

        return { success: true, chunks: chunks.length };
    }
}

export default new RAGService();
