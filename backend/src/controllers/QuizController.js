import Quiz from '../models/Quiz.js';
import Score from '../models/Score.js';
import User from '../models/User.js';
import eventBus from '../mcp/automation/eventBus.js';

// Create a new Quiz (Professor only)
export const createQuiz = async (req, res) => {
    try {
        const { title, questions, duration, totalMarks } = req.body;
        const { uid } = req.query; // Passed from auth middleware or query for now

        // Find user to get institutionId
        const user = await User.findOne({ uid });
        if (!user || user.role !== 'professor') {
            return res.status(403).json({ error: "Unauthorized. Only professors can create quizzes." });
        }

        const quiz = new Quiz({
            title,
            collegeId: user.institutionId,
            createdBy: user._id,
            questions,
            duration,
            totalMarks
        });

        await quiz.save();
        res.status(201).json({ message: "Quiz created successfully", quiz });
    } catch (error) {
        console.error("Create Quiz Error:", error);
        res.status(500).json({ error: "Failed to create quiz" });
    }
};

// Get Quizzes for Student/Professor's Institution
export const getQuizzes = async (req, res) => {
    try {
        const { uid } = req.query;
        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ error: "User not found" });

        const quizzes = await Quiz.find({ collegeId: user.institutionId })
            .select('-questions.correctAnswer') // Hide answers
            .sort({ createdAt: -1 });

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quizzes" });
    }
};

// Get Single Quiz (for attempting)
export const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer');
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quiz" });
    }
};

// Submit Quiz & Calculate Score
export const submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; // answers: { questionId: optionIndex/Text } or array of indices
        const { uid } = req.query;

        const user = await User.findOne({ uid });
        const quiz = await Quiz.findById(quizId);

        if (!user || !quiz) return res.status(404).json({ error: "User or Quiz not found" });

        let score = 0;

        // Simple scoring logic: index based for now
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                score += q.marks;
            }
            // For text based, create basic equality check logic if needed later
        });

        const newScore = new Score({
            userId: user._id,
            collegeId: user.institutionId,
            quizId: quiz._id,
            score,
            totalMarks: quiz.totalMarks
        });

        await newScore.save();

        // Trigger Automation Event
        eventBus.publish('MARKS_UPDATED', {
            userId: user._id.toString(), // Pass resolved Mongo ID
            quizId: quiz._id,
            score,
            total: quiz.totalMarks
        });

        res.json({ message: "Quiz submitted", score, totalMarks: quiz.totalMarks });

    } catch (error) {
        console.error("Submit Quiz Error:", error);
        res.status(500).json({ error: "Failed to submit quiz" });
    }
};

// Get Leaderboard for Institution
export const getLeaderboard = async (req, res) => {
    try {
        const { uid } = req.query;
        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Aggregate scores: Sum of best scores per user? Or just total points?
        // For now: Total cumulative score of all quizzes
        const leaderboard = await Score.aggregate([
            { $match: { collegeId: user.institutionId } },
            {
                $group: {
                    _id: "$userId",
                    totalScore: { $sum: "$score" },
                    quizzesTaken: { $sum: 1 }
                }
            },
            { $sort: { totalScore: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    name: "$userDetails.name",
                    totalScore: 1,
                    quizzesTaken: 1
                }
            }
        ]);

        res.json(leaderboard);
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
};
