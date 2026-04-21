import StudyStreak from '../models/StudyStreak.js';
import User from '../models/User.js';
import NotificationService from './NotificationService.js';

class StreakCheckerService {
    /**
     * Check all users' streaks and send notifications to at-risk users
     */
    async checkAllStreaks() {
        try {
            console.log('[StreakChecker] Starting daily streak check...');

            const atRiskUsers = await this.identifyAtRiskUsers();
            console.log(`[StreakChecker] Found ${atRiskUsers.length} users at risk`);

            const results = [];
            for (const { user, streak } of atRiskUsers) {
                const shouldNotify = await this.shouldSendNotification(user, streak);

                if (shouldNotify) {
                    console.log(`[StreakChecker] Sending notification to user ${user.email}`);
                    const notificationResults = await NotificationService.sendStreakReminder(user, streak);

                    // Update streak tracking
                    streak.lastNotificationSent = new Date();
                    streak.notificationCount += 1;
                    streak.streakAtRisk = true;
                    await streak.save();

                    results.push({
                        userId: user._id,
                        email: user.email,
                        notifications: notificationResults
                    });
                }
            }

            console.log(`[StreakChecker] Sent ${results.length} notifications`);
            return results;
        } catch (error) {
            console.error('[StreakChecker] Error checking streaks:', error);
            throw error;
        }
    }

    /**
     * Identify users whose streaks are at risk
     */
    async identifyAtRiskUsers() {
        try {
            const now = new Date();
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);

            // Find all streaks where user hasn't studied today
            const streaks = await StudyStreak.find({
                currentStreak: { $gt: 0 }, // Only users with active streaks
                lastStudyDate: { $lt: todayStart } // Haven't studied today
            });

            const atRiskUsers = [];

            for (const streak of streaks) {
                const user = await User.findById(streak.userId);

                if (!user) continue;

                // Check if user has notifications enabled
                const hasNotificationsEnabled =
                    user.notificationPreferences?.enableEmail ||
                    user.notificationPreferences?.enableSMS;

                if (hasNotificationsEnabled) {
                    atRiskUsers.push({ user, streak });
                }
            }

            return atRiskUsers;
        } catch (error) {
            console.error('[StreakChecker] Error identifying at-risk users:', error);
            throw error;
        }
    }

    /**
     * Determine if a notification should be sent to the user
     */
    async shouldSendNotification(user, streak) {
        try {
            // Don't send if no notification methods enabled
            if (!user.notificationPreferences?.enableEmail && !user.notificationPreferences?.enableSMS) {
                return false;
            }

            // Don't spam: only send once per day
            if (streak.lastNotificationSent) {
                const lastSent = new Date(streak.lastNotificationSent);
                const now = new Date();
                const hoursSinceLastNotification = (now - lastSent) / (1000 * 60 * 60);

                if (hoursSinceLastNotification < 24) {
                    console.log(`[StreakChecker] Skipping user ${user.email} - notification sent ${hoursSinceLastNotification.toFixed(1)}h ago`);
                    return false;
                }
            }

            // Check if it's the user's preferred time (within 1 hour window)
            const preferredTime = user.notificationPreferences?.preferredTime || '09:00';
            const [preferredHour, preferredMinute] = preferredTime.split(':').map(Number);
            const now = new Date();
            const currentHour = now.getHours();

            // Send if we're within 1 hour of preferred time
            if (Math.abs(currentHour - preferredHour) <= 1) {
                return true;
            }

            // If we missed the preferred time window, send anyway (better late than never)
            if (currentHour > preferredHour + 1) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('[StreakChecker] Error checking notification eligibility:', error);
            return false;
        }
    }

    /**
     * Manual trigger for testing
     */
    async triggerForUser(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const streak = await StudyStreak.findOne({ userId });
            if (!streak) {
                throw new Error('Streak not found for user');
            }

            const results = await NotificationService.sendStreakReminder(user, streak);

            // Update streak tracking
            streak.lastNotificationSent = new Date();
            streak.notificationCount += 1;
            await streak.save();

            return results;
        } catch (error) {
            console.error('[StreakChecker] Error triggering notification:', error);
            throw error;
        }
    }
}

export default new StreakCheckerService();
