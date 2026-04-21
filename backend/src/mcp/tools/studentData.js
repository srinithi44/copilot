import Score from '../../models/Score.js';
import QuizAttempt from '../../models/QuizAttempt.js';
import User from '../../models/User.js';

/**
 * Fetch student marks from both Score and QuizAttempt models
 */
export async function getStudentMarks({ userId, limit = 10 }) {
    // Try to find user to get correct ObjectId if needed
    // Note: Inputs might come as string ID.

    // Fetching from QuizAttempt (assuming userId is stored as string there based on schema)
    const attempts = await QuizAttempt.find({ userId: userId })
        .sort({ completedAt: -1 })
        .limit(limit)
        .populate('quizId', 'title subject'); // Assuming Quiz has title and subject

    // Start transforming to a common format
    const results = attempts.map(a => ({
        source: 'QuizAttempt',
        quizTitle: a.quizId?.title || 'Unknown Quiz',
        subject: a.quizId?.subject || 'General',
        score: a.score,
        totalQuestions: a.totalQuestions,
        percentage: (a.score / a.totalQuestions) * 100,
        date: a.completedAt
    }));

    return results;
}

/**
 * Detect weak subjects based on average scores
 */
export async function detectWeakSubjects({ userId, threshold = 60 }) {
    const attempts = await QuizAttempt.find({ userId: userId })
        .populate('quizId', 'subject');

    const subjectScores = {};

    attempts.forEach(attempt => {
        const subject = attempt.quizId?.subject || 'Unknown';
        const percentage = (attempt.score / attempt.totalQuestions) * 100;

        if (!subjectScores[subject]) {
            subjectScores[subject] = { total: 0, count: 0 };
        }
        subjectScores[subject].total += percentage;
        subjectScores[subject].count += 1;
    });

    const weakSubjects = [];
    for (const [subject, data] of Object.entries(subjectScores)) {
        const average = data.total / data.count;
        if (average < threshold) {
            weakSubjects.push({
                subject,
                averageScore: average.toFixed(2),
                attempts: data.count
            });
        }
    }

    return {
        userId,
        weakSubjects,
        thresholdUsed: threshold
    };
}
