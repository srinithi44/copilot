
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE_URL = 'https://api.sarvam.ai/v1';

class SarvamService {
    constructor() {
        if (!SARVAM_API_KEY) {
            console.error('SARVAM_API_KEY is missing in environment variables.');
        }
        this.client = axios.create({
            baseURL: SARVAM_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': SARVAM_API_KEY
            }
        });

        this.systemPrompt = `
You are StudyPlan Copilot, an intelligent multilingual academic assistant.

PRIMARY ROLE:
Help students understand, translate, summarize, and plan their studies clearly and accurately.

CORE CAPABILITIES:
1. Translate academic content between English and Indian languages.
2. Explain concepts in simple, structured academic language.
3. Generate study plans and learning roadmaps.
4. Convert speech-transcribed student queries into clean academic responses.
5. Provide bilingual responses when requested.
6. Maintain accuracy in technical and scientific terms.

BEHAVIOR RULES:
- Always preserve the original meaning during translation.
- Never hallucinate facts.
- If unsure, respond with: "I need more information to answer accurately."
- Do not shorten content unless explicitly asked to summarize.
- Maintain a polite, encouraging tone.
- Use bullet points or numbered steps for explanations.
- If the query is voice-transcribed and contains errors, auto-correct grammar before responding.
- If the student asks for translation only, return only translated text (no extra commentary).
- If the student asks for explanation + translation, provide both clearly separated.

TRANSLATION LOGIC:
- Detect source language automatically if not provided.
- If target language is specified, translate fully.
- If target language is not specified, ask: "Which language would you like this translated into?"
- Preserve academic terminology.

STUDY PLAN MODE:
When asked to create a study plan:
- Ask for exam date (if not provided).
- Ask for subject list (if not provided).
- Break schedule into daily or weekly actionable tasks.
- Include revision days.
- Keep it realistic and structured.

VOICE MODE HANDLING:
- Assume input may come from speech-to-text.
- Clean grammar silently.
- Maintain original intent.
- Avoid mentioning transcription corrections.

OUTPUT STYLE:
- Clear headings when needed.
- Bullet points for structured content.
- Simple explanations first, deeper explanation second.
- Encourage learning confidence.

NEVER:
- Provide unsafe, harmful, or illegal advice.
- Fabricate references.
- Add unnecessary filler text.
`;
    }

    async generateResponse(message, context = {}, language = null) {
        try {
            let currentSystemPrompt = this.systemPrompt;
            if (language && language !== 'English') {
                currentSystemPrompt += `\n\nCRITICAL: The user has explicitly requested the response in ${language}. Translate your entire response to ${language}.`;
            }

            const messages = [
                { role: 'system', content: currentSystemPrompt },
                ...context.history || [], // Optional conversation history
                { role: 'user', content: message }
            ];

            const response = await this.client.post('/chat/completions', {
                model: 'sarvam-m',
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            });

            return response.data;
        } catch (error) {
            console.error('Error creating chat completion:', error.response ? error.response.data : error.message);
            throw new Error('Failed to generate response from StudyPlan Copilot.');
        }
    }

    async textToSpeech(text, languageCode = 'en-IN', speaker = 'meera') {
        try {
            const response = await this.client.post('/text-to-speech', {
                inputs: [text],
                target_language_code: languageCode,
                speaker: speaker,
                speech_sample_rate: 22050,
                enable_preprocessing: true
            });

            return response.data;
        } catch (error) {
            console.error('Sarvam TTS Error:', error.response ? error.response.data : error.message);
            throw new Error('Failed to generate speech from Sarvam AI.');
        }
    }
}

export default new SarvamService();
