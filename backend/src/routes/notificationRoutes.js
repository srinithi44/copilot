import express from 'express';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    getNotificationHistory,
    testNotification,
    triggerStreakCheck
} from '../controllers/NotificationController.js';

const router = express.Router();

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Update notification preferences
router.post('/preferences', updateNotificationPreferences);

// Get notification history
router.get('/history', getNotificationHistory);

// Send test notification
router.post('/test', testNotification);

// Manually trigger streak check
router.post('/check-streaks', triggerStreakCheck);

export default router;
