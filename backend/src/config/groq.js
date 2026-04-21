import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
    console.warn("Missing GROQ_API_KEY in environment variables");
}

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export default groq;
