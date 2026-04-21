import { API_BASE_URL } from '../config/api';

class NotificationService {
    /**
     * Get user's notification preferences
     */
    async getNotificationPreferences(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/preferences?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch notification preferences');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            throw error;
        }
    }

    /**
     * Update user's notification preferences
     */
    async updateNotificationPreferences(userId, phoneNumber, notificationPreferences) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    phoneNumber,
                    notificationPreferences
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update notification preferences');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }

    /**
     * Get notification history
     */
    async getNotificationHistory(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/history?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch notification history');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching notification history:', error);
            throw error;
        }
    }

    /**
     * Send test notification
     */
    async sendTestNotification(userId, type) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    type
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send test notification');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending test notification:', error);
            throw error;
        }
    }
}

export default new NotificationService();
