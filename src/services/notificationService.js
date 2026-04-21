import { API_BASE_URL } from '../config/api';

class NotificationService {
    /**
     * Get user's notification preferences
     */
    async getNotificationPreferences(userId) {
        try {
            if (!userId) return null;
            const response = await fetch(`${API_BASE_URL}/notifications/preferences?userId=${userId}`);
            if (!response.ok) {
                console.warn('Failed to fetch notification preferences:', response.status);
                return null;
            }
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch preferences aborted');
            } else {
                console.error('Error fetching notification preferences:', error);
            }
            return null;
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
            if (!userId) return [];
            const response = await fetch(`${API_BASE_URL}/notifications/history?userId=${userId}`);
            if (!response.ok) {
                console.warn('Failed to fetch notification history:', response.status);
                return [];
            }
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch history aborted');
            } else {
                console.error('Error fetching notification history:', error);
            }
            return [];
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
