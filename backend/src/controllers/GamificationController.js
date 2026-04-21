import User from '../models/User.js';
import FocusSession from '../models/FocusSession.js';

// Level Constants
const LEVELS = [
    { name: 'Beginner', min: 0, max: 200 },
    { name: 'Intermediate', min: 201, max: 500 },
    { name: 'Advanced', min: 501, max: 1000 },
    { name: 'Master', min: 1001, max: Infinity }
];

// Helper to determine level
const calculateLevel = (points) => {
    const levelObj = LEVELS.find(l => points >= l.min && points <= l.max);
    return levelObj ? levelObj.name : 'Beginner';
};

// Update Points & Check for Trophies
export const updatePoints = async (req, res) => {
    try {
        const { uid, action, pointsAdded } = req.body;

        if (!uid || !pointsAdded) {
            return res.status(400).json({ error: "UID and pointsAdded are required" });
        }

        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Update Points
        user.points = (user.points || 0) + pointsAdded;

        // Auto-update Level
        const newLevel = calculateLevel(user.points);
        if (user.level !== newLevel) {
            user.level = newLevel;
            // Could add a notification/trophy for leveling up here
        }

        // Trophy Logic (Basic Checks)
        const newTrophies = [];

        // 1. Point Milestones
        if (user.points >= 100 && !user.trophies.some(t => t.name === 'Century Scorer')) {
            newTrophies.push({ name: 'Century Scorer', icon: '💯' });
        }

        // 2. Action Specific (passed from frontend/other controllers)
        // ideally checking streak or specific counts requires more DB fields (e.g. quizzesCompleted)
        // For now, we trust the 'action' or just adding generic value
        if (action === 'STREAK_7_DAYS' && !user.trophies.some(t => t.name === '7-Day Streak')) {
            newTrophies.push({ name: '7-Day Streak', icon: '🔥' });
        }

        if (newTrophies.length > 0) {
            user.trophies.push(...newTrophies);
        }

        await user.save();

        res.json({
            success: true,
            points: user.points,
            level: user.level,
            newTrophies
        });

    } catch (error) {
        console.error("Gamification Error:", error);
        res.status(500).json({ error: "Failed to update points" });
    }
};

// Get Leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const { type, country, state } = req.query; // type: 'global', 'country', 'state'
        const { uid } = req.query; // Current user to show their rank

        let query = {};

        // Location Filters
        if (type === 'country' && country) {
            query['location.country'] = country;
        } else if (type === 'state' && state) {
            query['location.state'] = state; // Assuming stored as state string matching input
            // If country is also provided, can refine: query['location.country'] = country;
        }

        // Fetch Top 50 Users
        const leaderboard = await User.find(query)
            .sort({ points: -1 })
            .limit(50)
            .select('uid name points level trophies location email'); // email maybe for gravatar/id

        // Calculate Rank for Response
        const rankedList = leaderboard.map((u, index) => ({
            ...u.toObject(),
            rank: index + 1
        }));

        // Get Current User Rank (if not in top 50, fetch rank count)
        let currentUserRank = null;
        if (uid) {
            // Check if user is in top 50
            const inTop = rankedList.find(u => u.uid === uid);
            if (inTop) {
                currentUserRank = inTop;
            } else {
                // Determine rank by counting users with more points
                const user = await User.findOne({ uid });
                if (user) {
                    // Check logic: Count users in SAME category with MORE points
                    const count = await User.countDocuments({
                        ...query,
                        points: { $gt: user.points }
                    });
                    currentUserRank = {
                        ...user.toObject(),
                        rank: count + 1
                    };
                }
            }
        }

        res.json({
            leaderboard: rankedList,
            userRank: currentUserRank
        });

    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
};

// Log Focus Session
export const logSession = async (req, res) => {
    try {
        const { uid, durationMinutes, type } = req.body;

        if (!uid || !durationMinutes) {
            return res.status(400).json({ error: "UID and duration are required" });
        }

        // 1. Create Session
        const newSession = new FocusSession({
            userId: uid,
            durationMinutes,
            type
        });
        await newSession.save();

        // 2. Award Points (e.g., 5 points per 25 mins of work)
        let pointsEarned = 0;
        if (type === 'work') {
            pointsEarned = Math.floor(durationMinutes / 5); // 1 point per 5 mins
        }

        if (pointsEarned > 0) {
            const user = await User.findOne({ uid });
            if (user) {
                user.points = (user.points || 0) + pointsEarned;
                await user.save();
            }
        }

        res.json({ success: true, pointsEarned });

    } catch (error) {
        console.error("Log Session Error:", error);
        res.status(500).json({ error: "Failed to log session" });
    }
};
