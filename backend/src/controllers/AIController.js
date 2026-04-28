import AIService from '../services/AIService.js';
import SarvamService from '../services/SarvamService.js';

// Map language names to Google Translate codes
const GT_CODE = {
    Hindi: 'hi', Tamil: 'ta', Telugu: 'te', Malayalam: 'ml',
    Kannada: 'kn', Bengali: 'bn', Marathi: 'mr',
    French: 'fr', German: 'de', Japanese: 'ja',
};

/**
 * Translate a single text string from English to the target language
 * using the Google Translate free API (no key needed).
 */
async function translateText(text, targetCode) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx` +
        `&sl=en&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://translate.google.com/' }
        });
        const data = await res.json();
        // data[0] is an array of translation chunks: [[translated, original, ...], ...]
        return data[0].map(c => c[0]).join('');
    } catch (e) {
        console.warn('Translation failed, using original text:', e.message);
        return text; // safe fallback
    }
}

export const chatWithAI = async (req, res) => {
    try {
        const { query, userId, language } = req.body;
        const uid = userId || req.user?.uid || "dev_user";
        if (!query) return res.status(400).json({ error: "Query is required" });
        const response = await AIService.chat(query, uid, language);
        res.status(200).json({ response });
    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: "AI Chat failed", details: error.message });
    }
};

export const generatePlan = async (req, res) => {
    try {
        const { examDate, subjects, goal, hoursPerDay, userId } = req.body;
        const uid = userId || req.user?.uid || "dev_user";
        const plan = await AIService.generateStudyPlan(uid, { examDate, subjects, goal, hoursPerDay });
        res.status(200).json({ plan });
    } catch (error) {
        console.error("Plan Controller Error:", error);
        res.status(500).json({ error: "Plan generation failed", details: error.message });
    }
};

export const generateTest = async (req, res) => {
    try {
        const { topic, difficulty, questionCount, userId } = req.body;
        const uid = userId || req.user?.uid || "dev_user";
        const test = await AIService.generateMockTest(uid, { topic, difficulty, questionCount });
        res.status(200).json({ test });
    } catch (error) {
        console.error("Test Controller Error:", error);
        res.status(500).json({ error: "Test generation failed" });
    }
};

export const createPodcast = async (req, res) => {
    console.log("[AIController] createPodcast hit!");
    try {
        const { topic, userId, language = 'English', fileContext } = req.body;
        const uid = userId || req.user?.uid || "dev_user";

        if (!topic) return res.status(400).json({ error: "Topic is required" });

        console.log(`[AIController] Podcast: topic="${topic}", language=${language}`);

        // 1. Always generate in English (AI is reliable in English)
        const script = await AIService.generatePodcastScript(uid, topic, fileContext);

        // 2. Translate to target language if needed
        const gtCode = GT_CODE[language];
        let segments = script.segments;

        if (gtCode) {
            console.log(`[AIController] Translating ${segments.length} segments to ${language} (${gtCode})...`);
            segments = await Promise.all(
                segments.map(async (seg) => ({
                    ...seg,
                    text: await translateText(seg.text, gtCode),
                }))
            );
            console.log(`[AIController] Translation complete.`);
        }

        res.status(200).json({
            title: gtCode ? await translateText(script.title, gtCode) : script.title,
            segments,
            language,
        });

    } catch (error) {
        console.error("Podcast Controller Error:", error);
        res.status(500).json({ error: "Podcast generation failed", details: error.message });
    }
};



export const createFlowchart = async (req, res) => {
    try {
        const { topic, userId } = req.body;
        const uid = userId || req.user?.uid || "dev_user";

        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const flowchartData = await AIService.generateFlowchartData(uid, topic);
        res.status(200).json(flowchartData);

    } catch (error) {
        console.error("Flowchart Controller Error:", error);
        res.status(500).json({ error: "Flowchart generation failed", details: error.message });
    }
};
