import AIService from '../services/AIService.js';
import SarvamService from '../services/SarvamService.js';
import MockTestAttempt from '../models/MockTestAttempt.js';

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
        const { topic, difficulty, questionCount, userId, pdfId, questionType } = req.body;
        const uid = userId || req.user?.uid || "dev_user";
        const test = await AIService.generateMockTest(uid, {
            topic,
            difficulty,
            questionCount,
            pdfId,
            questionType
        });
        res.status(200).json({ test });
    } catch (error) {
        console.error("Test Controller Error:", error);
        res.status(500).json({ error: "Test generation failed" });
    }
};

const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const submitMockTestAttempt = async (req, res) => {
    try {
        const { userId, topic, difficulty = 'Medium', score, totalQuestions } = req.body;
        const uid = userId || req.user?.uid || "dev_user";

        if (!topic || typeof score !== 'number' || typeof totalQuestions !== 'number') {
            return res.status(400).json({ error: "topic, score and totalQuestions are required" });
        }
        if (totalQuestions <= 0) {
            return res.status(400).json({ error: "totalQuestions must be greater than 0" });
        }

        const accuracy = Number(((score / totalQuestions) * 100).toFixed(2));

        await MockTestAttempt.create({
            uid,
            topic,
            difficulty,
            score,
            totalQuestions,
            accuracy
        });

        res.status(201).json({ success: true, accuracy });
    } catch (error) {
        console.error("Submit Mock Test Attempt Error:", error);
        res.status(500).json({ error: "Failed to submit test attempt", details: error.message });
    }
};

export const getWeeklyMockTestProgress = async (req, res) => {
    try {
        const { userId } = req.query;
        const uid = userId || req.user?.uid || "dev_user";

        const weekStart = getWeekStart();
        const attempts = await MockTestAttempt.find({
            uid,
            submittedAt: { $gte: weekStart }
        }).sort({ submittedAt: -1 });

        const attemptsThisWeek = attempts.length;
        const totalCorrect = attempts.reduce((sum, item) => sum + item.score, 0);
        const totalQuestions = attempts.reduce((sum, item) => sum + item.totalQuestions, 0);
        const averageAccuracy = totalQuestions > 0
            ? Number(((totalCorrect / totalQuestions) * 100).toFixed(2))
            : 0;

        // Weekly target: 3 mock tests
        const progressPercent = Math.min(100, Math.round((attemptsThisWeek / 3) * 100));

        res.json({
            attemptsThisWeek,
            averageAccuracy,
            totalCorrect,
            totalQuestions,
            progressPercent,
            recentAttempts: attempts.slice(0, 5).map(a => ({
                id: a._id,
                topic: a.topic,
                difficulty: a.difficulty,
                score: a.score,
                totalQuestions: a.totalQuestions,
                accuracy: a.accuracy,
                submittedAt: a.submittedAt
            }))
        });
    } catch (error) {
        console.error("Weekly Mock Progress Error:", error);
        res.status(500).json({ error: "Failed to fetch weekly progress", details: error.message });
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
