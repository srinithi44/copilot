import openai from '../config/openai.js';
import { generateEmbeddings, embeddingConfig } from './EmbeddingService.js';
import pinecone from '../config/pinecone.js';
import groq from '../config/groq.js';
import dotenv from 'dotenv';
import SarvamService from './SarvamService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

// Initialize Gemini if key is available
let geminiModel = null;
if (process.env.GEMINI_API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        console.log('[AIService] Gemini fallback initialized');
    } catch (e) {
        console.warn('[AIService] Gemini init failed:', e.message);
    }
}

class AIService {

    /**
     * Retrieves relevant context from Pinecone based on user query.
     * @param {string} query 
     * @param {string} userId 
     * @returns {Promise<string>}
     */
    async getContext(query, userId) {
        try {
            // 1. Embed query (OpenAI or Google fallback)
            const [vector] = await generateEmbeddings([query]);

            // 2. Search Pinecone
            const index = pinecone.index(embeddingConfig.indexName);
            const queryResponse = await index.query({
                vector: vector,
                topK: 5,
                filter: { userId: userId }, // Isolate user data
                includeMetadata: true
            });

            // 3. Extract text
            const context = queryResponse.matches
                .map(match => match.metadata.text)
                .join("\n\n---\n\n");

            return context;
        } catch (error) {
            console.error("Context Retrieval Error:", error);
            // Return empty context on failure rather than crashing, 
            // allowing the LLM to try answering with general knowledge if acceptable
            return "";
        }
    }

    /**
     * unified completion method with Fallback
     */
    async generateCompletion(messages, responseFormat = null) {
        let useOpenAI = !!process.env.OPENAI_API_KEY;

        // Try OpenAI first if available
        if (useOpenAI) {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: messages,
                    temperature: 0.2,
                    response_format: responseFormat
                });
                return completion.choices[0].message.content;
            } catch (error) {
                console.warn("OpenAI Failed, trying Groq fallback...", error.message);
                useOpenAI = false; // Fallback to Groq
            }
        }

        // Groq Fallback
        if (process.env.GROQ_API_KEY) {
            try {
                const completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: messages,
                    temperature: 0.2,
                    response_format: responseFormat
                });
                return completion.choices[0].message.content;
            } catch (error) {
                console.warn("Groq Failed, trying Gemini fallback...", error.message);
            }
        }

        // Gemini Fallback
        if (geminiModel) {
            try {
                // Convert OpenAI-style messages to Gemini format
                const prompt = messages.map(m => `${m.role === 'system' ? 'System' : m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
                const result = await geminiModel.generateContent(prompt);
                const response = result.response;
                return response.text();
            } catch (error) {
                console.error("Gemini Generation Error:", error);
                throw new Error("All AI services (OpenAI, Groq, Gemini) failed. Last Error: " + error.message);
            }
        }

        throw new Error("No valid AI API keys configuration found (OPENAI_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY).");
    }

    /**
     * Helper: wraps a promise with a timeout.
     */
    _withTimeout(promise, ms, label = 'Operation') {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
            )
        ]);
    }

    /**
     * Generates a chat response using RAG.
     */
    async chat(query, userId, language = 'English') {
        let context = await this.getContext(query, userId);
        if (!context || context.trim() === "") {
            context = "No specific syllabus content found. Answer based on general academic knowledge if possible, but prioritize syllabus.";
        }

        // Construct a prompt with RAG context
        const augmentedQuery = `You are a multilingual AI Tutor.
Context:
${context}

Student Question:
${query}

Task:
Answer the student's question based on the context.
If the answer is not in the context, say "I couldn't find the answer in the syllabus" (translated to ${language}).

CRITICAL INSTRUCTION:
1. Provide the ANSWER ONLY in **${language}**.
2. ALWAYS structure your answer using clear sections. Whenever applicable to the query, use the following exact headings:
   - **Introduction**: Brief overview of the topic.
   - **Definition**: Exact meaning or core concept.
   - **Key Characteristics** / **Key Components**: Main features (use bullet points).
   - **Importance**: Why it matters or market potential.
   - **Advantages & Limitations**: Pros and cons, or competitive edge (if relevant).
3. Keep the content within these sections highly CONCISE.
4. Cleanly format your answer using Markdown and BOLD the key terms.
`;

        // Try Sarvam first with a timeout, then fall back to generateCompletion (OpenAI → Groq → Gemini)
        try {
            console.log(`[AIService] Attempting Sarvam AI for user: ${userId}, Language: ${language}`);
            const response = await this._withTimeout(
                SarvamService.generateResponse(augmentedQuery, {}, language),
                15000,
                'Sarvam AI'
            );
            const content = response.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
            return content.replace(/<think>[\s\S]*?<\/think>\n*/gi, '').trim();
        } catch (sarvamError) {
            console.warn("[AIService] Sarvam AI failed, falling back to other providers:", sarvamError.message);
        }

        // Fallback chain: OpenAI → Groq → Gemini
        try {
            console.log(`[AIService] Using fallback chain for user: ${userId}`);
            const messages = [
                { role: 'system', content: 'You are a helpful, multilingual AI study tutor. Provide clear, well-structured academic responses.' },
                { role: 'user', content: augmentedQuery }
            ];
            const rawResponse = await this._withTimeout(
                this.generateCompletion(messages),
                30000,
                'AI completion'
            );
            return rawResponse.replace(/<think>[\s\S]*?<\/think>\n*/gi, '').trim();
        } catch (error) {
            console.error("[AIService] All AI providers failed:", error.message);
            throw new Error("Failed to generate AI response: " + error.message);
        }
    }

    /**
     * Generates a study plan based on context.
     * Updated to accept object with details.
     */
    async generateStudyPlan(userId, { examDate, subjects, goal, hoursPerDay }, extractedSyllabusText = null) {

        // 1. Get Context (RAG)
        let context = "";
        if (!extractedSyllabusText) {
            context = await this.getContext(`Syllabus for ${subjects} chapters units`, userId);
        } else {
            context = extractedSyllabusText.substring(0, 10000);
        }

        const prompt = `
You are an expert AI Study Planner and Academic Mentor.

Your task is to create a highly detailed, structured, and actionable study plan.
The user wants a schedule that can be displayed in a **Table**.

Context from Syllabus (if any): ${context}

User Details:
- Exam Date/Duration: ${examDate}
- Subjects: ${subjects}
- Goal: ${goal}
- Study Hours/Day: ${hoursPerDay}

Instructions:
1. Break down the entire duration (${examDate}) into a logical schedule (Day-by-Day or Week-by-Week).
2. If the duration is short (e.g., < 1 month), use "Day 1", "Day 2", etc.
3. If the duration is long (e.g., > 1 month), use "Week 1", "Week 2", etc.
4. For each time slot, provide specific topics and actionable tasks.
5. Include "Important Topics" that are high-yield for exams.
6. Include "Extra Resources" like specific YouTube queries, book titles, or documentation links.

Output EXACTLY this JSON format:
{
  "title": "Study Plan Title",
  "goal_summary": "One sentence summary of the goal",
  "total_estimated_time": "e.g., 2 Weeks, 40 Hours total",
  "prerequisites": ["Prereq 1", "Prereq 2"],
  "schedule": [
    {
      "day": "Day 1" (or "Week 1"),
      "focus": "Topic/Subject Focus",
      "tasks": ["Read Chapter 1", "Solve 5 problems", "Watch video on X"],
      "hours": "2 hours"
    },
    {
      "day": "Day 2",
      "focus": "Next Topic",
      "tasks": ["Task 1", "Task 2"],
      "hours": "2 hours"
    }
  ],
  "important_topics": [
    { "topic": "Topic Name", "why_important": "High exam weightage / Core concept" }
  ],
  "extra_resources": [
    { "title": "Resource Title", "type": "Video/Book/Article", "link": "URL or Search Term" }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

IMPORTANT:
- Ensure the "schedule" covers the FULL duration provided.
- Do NOT output Markdown. Output only valid JSON.
        `;

        try {
            console.log(`[AIService] Generating Study Plan for ${userId}...`);
            const messages = [{ role: "user", content: prompt }];
            const content = await this.generateCompletion(messages, { type: "json_object" });

            console.log("[AIService] Study Plan Generated. Parsing...");

            try {
                const plan = JSON.parse(content);
                // Basic validation
                if (!plan.schedule || !Array.isArray(plan.schedule)) {
                    throw new Error("Invalid plan structure: missing schedule array");
                }
                return plan;
            } catch (parseError) {
                console.error("[AIService] JSON Parse Error:", parseError);
                console.error("[AIService] Raw Content:", content);
                throw new Error("Failed to parse AI response. Raw content logged.");
            }

        } catch (error) {
            console.error("[AIService] Study Plan Error:", error);
            throw new Error("Failed to generate study plan: " + error.message);
        }
    }

    async generateMockTest(userId, { topic, difficulty, questionCount }) {
        const context = await this.getContext(`${topic} concepts`, userId);
        if (!context || context.trim().length < 50) {
            throw new Error("No syllabus content found. Please upload a PDF syllabus first.");
        }

        const prompt = `
Generate a mock test based on the syllabus.
Context: ${context}

Details:
- Topic: ${topic}
- Difficulty: ${difficulty}
- Questions: ${questionCount}

Format as JSON:
{
    "title": "Test Title",
    "questions": [
        {
            "id": 1,
            "text": "Question text?",
            "options": ["First option full text", "Second option full text", "Third option full text", "Fourth option full text"],
            "correctAnswer": "A",
            "explanation": "Why it is correct."
        }
    ]
}
IMPORTANT: options must be an array of 4 full answer texts (not just letters). correctAnswer must be "A", "B", "C", or "D" (the letter of the correct option).
        `;

        try {
            const messages = [{ role: "user", content: prompt }];
            const content = await this.generateCompletion(messages, { type: "json_object" });
            return JSON.parse(content);
        } catch (error) {
            console.error("Mock Test Error:", error);
            throw new Error("Failed to generate mock test: " + error.message);
        }
    }

    /**
     * Generates a quiz based on specific PDF context using RAG.
     */
    async generateQuiz(userId, { pdfId, difficulty, questionType, count }) {
        const query = "important concepts and definitions";

        try {
            // 1. Embed query (OpenAI or Google fallback)
            const [vector] = await generateEmbeddings([query]);

            // 2. Search Pinecone with docId filter
            const index = pinecone.index(embeddingConfig.indexName);
            const queryResponse = await index.query({
                vector: vector,
                topK: 10, // Get enough context
                filter: {
                    userId: userId,
                    docId: pdfId // Filter by specific PDF
                },
                includeMetadata: true
            });

            const context = queryResponse.matches
                .map(match => match.metadata.text)
                .join("\n\n---\n\n");

            if (!context) {
                // If precise filtering fails, maybe try fallback or throw specific error
                // For now, let's allow generation with warning or strictly fail
                // Strict failure is better for "Quiz from THIS document"
                throw new Error("No content found for this PDF.");
            }

            // 3. Generate Quiz via LLM
            const prompt = `
Using the following academic content, generate ${count} ${difficulty} level ${questionType} questions.

Content:
${context}

Instructions:
- Return ONLY valid JSON.
- The JSON must be an object with a "questions" key containing an array of questions.
- Format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct Option Text",
      "explanation": "Brief explanation"
    }
  ]
}
- Ensure questions are strictly based on the provided content.
            `;

            console.log("Sending prompt to AI Service...");

            const messages = [{ role: "user", content: prompt }];
            const content = await this.generateCompletion(messages, { type: "json_object" });

            console.log("AI Response received, parsing...");

            // Attempt to parse
            let data = JSON.parse(content);
            if (data.questions) return data.questions;
            if (Array.isArray(data)) return data;

            // Fallback
            console.warn("Unexpected JSON structure:", data);
            return data;

        } catch (error) {
            console.error("Quiz Generation Error Details:", error.message);
            throw new Error("Failed to generate quiz: " + error.message);
        }
    }

    /**
     * Summarizes study notes.
     */
    async summarizeNotes(notes) {
        const prompt = `
Summarize the following study notes into concise, bulleted key points. preserve important formulas and definitions.

Notes:
${notes}

Format:
- Bullet points
- Key Terms in bold
        `;

        try {
            const messages = [{ role: "user", content: prompt }];
            return await this.generateCompletion(messages);
        } catch (error) {
            console.error("Summarization Error:", error);
            throw new Error("Failed to summarize notes.");
        }
    }
    /**
     * Generates a conversational podcast script strictly about the given topic.
     * Always generates in English — translation is handled by the controller.
     * @param {string} userId
     * @param {string} topic   - The exact topic the user searched for
     */
    async generatePodcastScript(userId, topic) {
        const context = await this.getContext(`${topic} concepts and details`, userId);

        const prompt = `
You are an expert podcast scriptwriter. Your ONLY job is to write a podcast script STRICTLY about the topic below.
Write ONLY in English. DO NOT deviate from this topic. DO NOT add unrelated content.

TOPIC: "${topic}"
SYLLABUS CONTEXT (use if relevant):
${context || `No syllabus uploaded. Use accurate general knowledge about: ${topic}`}

TWO SPEAKERS:
- Alex (Host): Curious, asks clear questions, gives real-world examples. Friendly tone.
- Dr. Sage (Expert): Knowledgeable, explains step by step, gives structured takeaways.

STRICT RULES:
1. Every line MUST be directly about "${topic}" — nothing else.
2. Cover: definition, how it works, why it matters, real-world example, common misconceptions or exam tips.
3. Use natural conversational fillers: "That's fascinating," "Wait, so basically..." etc.
4. Write 8-12 segments (alternating Alex and Dr. Sage).
5. Each segment should be 2-4 sentences long.
6. Output ONLY valid JSON — no markdown, no explanations outside the JSON.

OUTPUT FORMAT (strict — include keyFact, emoji, and videoKeywords for every segment):
{
  "title": "Deep Dive: ${topic}",
  "segments": [
    { 
      "speaker": "Alex", 
      "text": "...", 
      "keyFact": "5-8 word key insight headline", 
      "emoji": "🔬",
      "videoKeywords": "3-5 cinematic keywords for high-quality 2D flat vector animation (e.g., '2d vector science animation, flat motion graphics, whiteboard style')"
    },
    ...
  ]
}
keyFact: A punchy, 5-8 word headline capturing the core idea of that segment.
emoji: A single relevant emoji.
videoKeywords: keywords for finding a 2D animated motion graphic clip.
`;



        try {
            const messages = [{ role: "user", content: prompt }];
            const content = await this.generateCompletion(messages, { type: "json_object" });
            const parsed = JSON.parse(content);
            // Validate structure
            if (!parsed.segments || !Array.isArray(parsed.segments)) {
                throw new Error("Invalid podcast script structure from AI");
            }
            return parsed;
        } catch (error) {
            console.error("Podcast Script Error:", error);
            throw new Error("Failed to generate podcast script.");
        }
    }


    /**
     * Sanitizes AI-generated Mermaid code to fix common syntax issues.
     * Fixes: bare parentheses in node targets, special chars that break parsing, etc.
     */
    sanitizeMermaidCode(code) {
        let lines = code.split('\n');
        let cleaned = [];
        let nodeCounter = 100;

        for (let line of lines) {
            // Fix bare parentheses nodes on arrow targets: `A --> (Label)` → `A --> N100(Label)`
            // Mermaid requires a node ID before the shape brackets
            line = line.replace(
                /(-->|---|-\.->|==>)\s*\(([^)]+)\)/g,
                (match, arrow, label) => {
                    const id = `N${nodeCounter++}`;
                    return `${arrow} ${id}(${label})`;
                }
            );

            // Fix bare bracket nodes on arrow targets: `A --> [Label]` → `A --> N101[Label]`
            line = line.replace(
                /(-->|---|-\.->|==>)\s*\[([^\]]+)\]/g,
                (match, arrow, label) => {
                    const id = `N${nodeCounter++}`;
                    return `${arrow} ${id}[${label}]`;
                }
            );

            // Fix bare curly brace nodes: `A --> {Label}` → `A --> N102{Label}`
            line = line.replace(
                /(-->|---|-\.->|==>)\s*\{([^}]+)\}/g,
                (match, arrow, label) => {
                    const id = `N${nodeCounter++}`;
                    return `${arrow} ${id}{${label}}`;
                }
            );

            // Remove problematic characters from labels inside brackets
            line = line.replace(/([\[({])([^\])}]*?)([\])}])/g, (match, open, content, close) => {
                const sanitized = content
                    .replace(/"/g, "'")
                    .replace(/`/g, "'")
                    .replace(/;/g, ',')
                    .replace(/#/g, 'No.');
                return open + sanitized + close;
            });

            cleaned.push(line);
        }

        return cleaned.join('\n');
    }

    /**
     * Generates a Mermaid.js flowchart string representing a topic.
     */
    async generateFlowchartData(userId, topic) {
        const context = await this.getContext(`${topic} structure and hierarchy`, userId);

        const prompt = `
You are an expert at creating Mermaid.js flowchart diagrams for academic topics.

Create a comprehensive, well-structured Mermaid flowchart for the following topic.
Topic: ${topic}
Context from Syllabus: ${context || 'Use general knowledge about ' + topic}

STRICT SYNTAX RULES (violations will cause errors):
1. Output ONLY valid Mermaid.js flowchart syntax. No explanations, no markdown code fences, no JSON.
2. Start with exactly: flowchart TD
3. Use 8-14 nodes maximum.
4. EVERY node MUST have an alphanumeric ID before the shape bracket.
   - CORRECT: A[Label], B(Label), C{Label}, D((Label))
   - WRONG: [Label], (Label), {Label} — these have no ID and WILL CAUSE ERRORS
5. Node IDs must be simple: A, B, C, D, E, F, G, H, etc.
6. Node labels must NOT contain parentheses (), quotes ", semicolons ;, or hash # characters.
7. Use different node shapes:
   - A[Label] for process/concept nodes (square brackets)
   - B(Label) for rounded nodes (MUST have ID before parentheses)
   - C{Label} for decision/condition nodes (curly braces)
   - D((Label)) for terminal/circle nodes (double parentheses, MUST have ID)
8. Connections use --> with optional labels: A -->|relationship| B
9. Use subgraph blocks when logical.
10. Direction: top-to-bottom (TD).

Correct example:
flowchart TD
    A[Main Topic] --> B[Sub-concept 1]
    A --> C[Sub-concept 2]
    B --> D(Detail A)
    B --> E(Detail B)
    C --> F{Decision Point}
    F -->|Yes| G[Outcome 1]
    F -->|No| H[Outcome 2]

Now generate the Mermaid flowchart for: ${topic}
`;

        try {
            const messages = [{ role: "user", content: prompt }];
            const content = await this.generateCompletion(messages);

            // Robustly extract diagrams: find the first Mermaid keyword and
            // return everything from there, discarding any code fences or
            // surrounding prose the model may have added.
            const DIAGRAM_TYPES = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie)/m;
            const match = DIAGRAM_TYPES.exec(content);
            let cleaned;
            if (match) {
                cleaned = content.slice(match.index).trim();
            } else {
                // Fallback: strip backtick fences and hope for the best
                cleaned = content
                    .replace(/```[a-zA-Z]*[\r\n]*/g, '')
                    .replace(/```/g, '')
                    .trim();
            }
            // Remove any trailing backtick fence
            cleaned = cleaned.replace(/[\r\n]+```.*$/s, '').trim();

            // Sanitize common AI syntax mistakes
            cleaned = this.sanitizeMermaidCode(cleaned);

            return { mermaidCode: cleaned };
        } catch (error) {
            console.error("Flowchart Data Error:", error);
            throw new Error("Failed to generate flowchart data.");
        }
    }
}
export default new AIService();
