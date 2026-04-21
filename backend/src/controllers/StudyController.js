import StudySession from '../models/StudySession.js';
import StudyGoal from '../models/StudyGoal.js';
import StudyStreak from '../models/StudyStreak.js';
import TimeTable from '../models/TimeTable.js';
import User from '../models/User.js';
import eventBus from '../mcp/automation/eventBus.js';

// Helper: Get start of current week (Monday)
const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Helper: Get User ObjectId from UID
const getUserObjectId = async (uid) => {
    const user = await User.findOne({ uid });
    if (!user) return null;
    return user._id;
};

// Helper: Update Streak
const updateStreak = async (userId, studyDate) => {
    let streak = await StudyStreak.findOne({ userId });

    if (!streak) {
        streak = await StudyStreak.create({ userId, currentStreak: 1, longestStreak: 1, lastStudyDate: studyDate });
        return streak;
    }

    const lastDate = new Date(streak.lastStudyDate);
    const today = new Date(studyDate);

    // Reset hours to compare dates only
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Already studied today, do nothing
    } else if (diffDays === 1) {
        // Consecutive day
        streak.currentStreak += 1;
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }
        streak.lastStudyDate = studyDate;
    } else {
        // Broken streak
        streak.currentStreak = 1;
        streak.lastStudyDate = studyDate;
    }

    await streak.save();
    return streak;
};

// Helper: Update Goal Progress
const updateGoalProgress = async (userId, subject, durationMinutes, date) => {
    const weekStart = getStartOfWeek(date);
    const durationHours = durationMinutes / 60;

    // Find goal for this week
    // Note: In a real app, we might create goals for new weeks automatically based on prev preferences
    // For now, we update if it exists
    const goal = await StudyGoal.findOne({
        userId,
        subject,
        weekStartDate: weekStart
    });

    if (goal) {
        goal.completedHours += durationHours;
        await goal.save();
    }
};

export const logSession = async (req, res) => {
    try {
        const { userId: uid, subject, topic, duration, notes, relatedDocumentId, studyDate, references } = req.body;

        const userId = await getUserObjectId(uid);

        const session = await StudySession.create({
            userId,
            subject,
            topic,
            duration,
            studyDate: studyDate || new Date(),
            notes,
            relatedDocumentId,
            references: req.body.references || []
        });

        // Async updates for side effects
        await updateStreak(userId, session.studyDate);
        await updateGoalProgress(userId, subject, duration, session.studyDate);

        res.status(201).json(session);
    } catch (error) {
        console.error('Log Session Error:', error);
        res.status(500).json({ error: 'Failed to log session' });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const { userId: uid } = req.query;
        const userId = await getUserObjectId(uid);

        if (!userId) {
            return res.json({
                totalHours: 0,
                currentStreak: 0,
                longestStreak: 0,
                subjectDistribution: []
            });
        }

        // 1. Total Stats
        const sessions = await StudySession.find({ userId });
        const totalMinutes = sessions.reduce((acc, curr) => acc + curr.duration, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);

        // 2. Streak
        const streak = await StudyStreak.findOne({ userId });

        // 3. Subject Distribution
        const subjectStats = {};
        sessions.forEach(s => {
            if (!subjectStats[s.subject]) subjectStats[s.subject] = 0;
            subjectStats[s.subject] += s.duration;
        });

        const subjectChartData = Object.entries(subjectStats).map(([name, value]) => ({
            name,
            value: Number((value / 60).toFixed(1))
        }));

        res.json({
            totalHours,
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0,
            subjectDistribution: subjectChartData
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getGoals = async (req, res) => {
    try {
        const { userId: uid } = req.query;
        const userId = await getUserObjectId(uid);
        if (!userId) return res.json([]);

        // Get goals for current week
        const weekStart = getStartOfWeek();

        const goals = await StudyGoal.find({
            userId,
            weekStartDate: weekStart
        });

        res.json(goals);
    } catch (error) {
        console.error('Get Goals Error:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
};

export const setGoal = async (req, res) => {
    try {
        const { userId: uid, subject, weeklyTargetHours } = req.body;
        const userId = await getUserObjectId(uid);
        const weekStart = getStartOfWeek();

        const goal = await StudyGoal.findOneAndUpdate(
            { userId, subject, weekStartDate: weekStart },
            { weeklyTargetHours },
            { new: true, upsert: true } // Create if not exists
        );

        res.json(goal);
    } catch (error) {
        console.error('Set Goal Error:', error);
        res.status(500).json({ error: 'Failed to set goal' });
    }
};

export const getHistory = async (req, res) => {
    try {
        const { userId: uid } = req.query;
        const userId = await getUserObjectId(uid);
        if (!userId) return res.json([]);

        const sessions = await StudySession.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20); // Last 20 sessions for history table
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
}

// Time Table Logic

export const getTimeTable = async (req, res) => {
    try {
        const { userId: uid } = req.query;
        const userId = await getUserObjectId(uid);

        const timetable = await TimeTable.findOne({ userId });
        res.json(timetable ? timetable.schedule : []);
    } catch (error) {
        console.error('Get TimeTable Error:', error);
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
};

export const saveTimeTable = async (req, res) => {
    try {
        const { userId: uid, schedule } = req.body;
        const userId = await getUserObjectId(uid);

        const timetable = await TimeTable.findOneAndUpdate(
            { userId },
            { schedule, lastUpdated: new Date() },
            { new: true, upsert: true }
        );

        res.json(timetable.schedule);
    } catch (error) {
        console.error('Save TimeTable Error:', error);
        res.status(500).json({ error: 'Failed to save timetable' });
    }
};

export const addExam = async (req, res) => {
    try {
        const { userId: uid, subject, date, syllabus } = req.body;
        const userId = await getUserObjectId(uid);
        if (!userId) return res.status(404).json({ error: "User not found" });

        // Logic to save exam would go here (e.g. Exam model)
        // For now, we simulate the save and trigger the event
        console.log(`[StudyController] Exam added for ${subject} on ${date}`);

        // Trigger Automation Event
        // Trigger Automation Event
        eventBus.publish('EXAM_ADDED', {
            userId: userId.toString(), // Pass resolved Mongo ID
            subject,
            date,
            syllabus
        });

        res.status(201).json({ message: "Exam added and scheduler notified" });
    } catch (error) {
        console.error('Add Exam Error:', error);
        res.status(500).json({ error: 'Failed to add exam' });
    }
};

export const summarizeSessionNotes = async (req, res) => {
    try {
        const { notes } = req.body;
        if (!notes) return res.status(400).json({ error: "Notes are required" });

        // Use AIService found in AIController logic or import it directly if moved to shared service
        // Since AIService is available, we import it at the top of this file
        // Note: We need to ensure AIService is imported.

        // Dynamic import if circular dependency is an issue, or just assume it is imported
        const AIService = (await import('../services/AIService.js')).default;

        const summary = await AIService.summarizeNotes(notes);
        res.json({ summary });
    } catch (error) {
        console.error('Summarize Notes Error:', error);
        res.status(500).json({ error: 'Failed to summarize notes' });
    }
};
