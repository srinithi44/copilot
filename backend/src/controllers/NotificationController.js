import User from '../models/User.js';
import StreakNotification from '../models/StreakNotification.js';
import StudyStreak from '../models/StudyStreak.js';
import Notification from '../models/Notification.js';
import NotificationService from '../services/NotificationService.js';
import StreakCheckerService from '../services/StreakCheckerService.js';

// Helper: Get User ObjectId from UID
const getUserObjectId = async (uid) => {
    const user = await User.findOne({ uid });
    if (!user) return null;
    return user._id;
};

/**
 * Get user's notification preferences
 */
export const getNotificationPreferences = async (req, res) => {
    try {
        const { userId: uid } = req.query;
        const userId = await getUserObjectId(uid);

        if (!userId) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = await User.findById(userId);

        res.json({
            phoneNumber: user.phoneNumber,
            notificationPreferences: user.notificationPreferences || {
                enableEmail: true,
                enableSMS: false,
                preferredTime: '09:00',
                subjects: []
            }
        });
    } catch (error) {
        console.error('Get Notification Preferences Error:', error);
        res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
};

/**
 * Update user's notification preferences
 */
export const updateNotificationPreferences = async (req, res) => {
    try {
        const { userId: uid, phoneNumber, notificationPreferences } = req.body;
        const userId = await getUserObjectId(uid);

        if (!userId) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updateData = {};

        if (phoneNumber !== undefined) {
            updateData.phoneNumber = phoneNumber;
        }

        if (notificationPreferences) {
            updateData.notificationPreferences = notificationPreferences;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        res.json({
            phoneNumber: user.phoneNumber,
            notificationPreferences: user.notificationPreferences
        });
    } catch (error) {
        console.error('Update Notification Preferences Error:', error);
        res.status(500).json({ error: 'Failed to update notification preferences' });
    }
};

/**
 * Get notification history for user
 */
/**
 * Get notification history for user
 */
export const getNotificationHistory = async (req, res) => {
    try {
        const { userId: uid } = req.query;
        const userId = await getUserObjectId(uid);

        if (!userId) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch Streak Notifications
        const streakNotifications = await StreakNotification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Fetch AI/System Notifications
        const systemNotifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Merge and sort
        const allNotifications = [
            ...streakNotifications.map(n => ({ ...n, source: 'streak' })),
            ...systemNotifications.map(n => ({ ...n, source: 'system' }))
        ].sort((a, b) => new Date(b.createdAt || b.sentAt) - new Date(a.createdAt || a.sentAt));

        res.json(allNotifications.slice(0, 50));
    } catch (error) {
        console.error('Get Notification History Error:', error);
        res.status(500).json({ error: 'Failed to fetch notification history' });
    }
};

/**
 * Send a test notification
 */
export const testNotification = async (req, res) => {
    try {
        const { userId: uid, type } = req.body;

        console.log('[Test Notification] Request:', { uid, type });

        const userId = await getUserObjectId(uid);

        if (!userId) {
            console.error('[Test Notification] User not found for UID:', uid);
            return res.status(404).json({ error: 'User not found' });
        }

        const user = await User.findById(userId);

        if (!user) {
            console.error('[Test Notification] User document not found for ID:', userId);
            return res.status(404).json({ error: 'User document not found' });
        }

        console.log('[Test Notification] User found:', { email: user.email, hasPhone: !!user.phoneNumber });

        const streak = await StudyStreak.findOne({ userId }) || {
            currentStreak: 0,
            longestStreak: 0
        };

        if (type === 'email' && !user.email) {
            return res.status(400).json({ error: 'Email not configured' });
        }

        if (type === 'sms' && !user.phoneNumber) {
            return res.status(400).json({ error: 'Phone number not configured' });
        }

        // Generate test message
        console.log('[Test Notification] Generating message for user:', user._id);
        const { message, subject } = await NotificationService.generateStreakMessage(user, streak);

        console.log('[Test Notification] Message generated:', { subject, messageLength: message.length });

        let result;
        if (type === 'email') {
            console.log('[Test Notification] Sending test email to:', user.email);
            result = await NotificationService.sendEmail(
                user.email,
                '🔥 Test: Keep Your Study Streak Alive!',
                message
            );
            console.log('[Test Notification] Email result:', result);
        } else if (type === 'sms') {
            console.log('[Test Notification] Sending test SMS to:', user.phoneNumber);
            result = await NotificationService.sendSMS(user.phoneNumber, message);
            console.log('[Test Notification] SMS result:', result);
        } else {
            return res.status(400).json({ error: 'Invalid notification type' });
        }

        // Log the test notification
        await StreakNotification.create({
            userId,
            notificationType: type,
            message,
            subject,
            status: result.success ? 'sent' : 'failed',
            sentAt: result.success ? new Date() : null,
            errorMessage: result.error || null
        });

        res.json({
            success: result.success,
            message: result.success ? 'Test notification sent successfully' : 'Failed to send test notification',
            error: result.error
        });
    } catch (error) {
        console.error('[Test Notification] Error:', error);
        res.status(500).json({
            error: 'Failed to send test notification',
            details: error.message
        });
    }
};

/**
 * Manually trigger streak check (admin/testing)
 */
export const triggerStreakCheck = async (req, res) => {
    try {
        const { userId: uid } = req.body;

        if (uid) {
            // Trigger for specific user
            const userId = await getUserObjectId(uid);
            if (!userId) {
                return res.status(404).json({ error: 'User not found' });
            }

            const results = await StreakCheckerService.triggerForUser(userId);
            res.json({
                success: true,
                message: 'Notification triggered for user',
                results
            });
        } else {
            // Trigger for all users
            const results = await StreakCheckerService.checkAllStreaks();
            res.json({
                success: true,
                message: `Checked all streaks, sent ${results.length} notifications`,
                results
            });
        }
    } catch (error) {
        console.error('Trigger Streak Check Error:', error);
        res.status(500).json({ error: 'Failed to trigger streak check' });
    }
};
