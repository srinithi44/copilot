# StudyPlanCopilot Backend

This is a secure Node.js backend for sending emails via Resend and document processing.

## Setup

1. Make sure you have Node.js installed.
2. **MongoDB** must be running (local or Atlas). Default: `mongodb://127.0.0.1:27017/studyplancopilot`
3. Configure `.env` with `OPENAI_API_KEY`, `PINECONE_API_KEY`, and `MONGO_URI` (if needed).
   - **Embeddings fallback**: If OpenAI quota is exceeded (429), add `GOOGLE_GEMINI_API_KEY` to use Google's free embedding API.
4. **Create Pinecone index** (required for document upload):
   ```bash
   node src/scripts/initPinecone.js
   ```
5. Run the server:
   ```bash
   node index.js
   ```

The server will run on `http://localhost:5000`.

## API Endpoints

### POST /api/send-otp
Sends a 6-digit verification code to the specified email.
**Body:** `{ "email": "user@example.com", "otp": "123456" }`
