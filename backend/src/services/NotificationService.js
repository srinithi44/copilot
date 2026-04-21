import { Resend } from 'resend';
import twilio from 'twilio';
import StreakNotification from '../models/StreakNotification.js';
import StudySession from '../models/StudySession.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

class NotificationService {
    /**
     * Send email notification via Resend
     */
    async sendEmail(to, subject, message) {
        try {
            const { data, error } = await resend.emails.send({
                from: 'StudyPlan Copilot <onboarding@resend.dev>',
                to: [to],
                subject: subject,
                html: this.formatEmailHTML(message, subject)
            });

            if (error) {
                console.error('Email send error:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Email send exception:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send SMS notification (Twilio integration - requires setup)
     * For now, this is a placeholder that logs the SMS
     */
    async sendSMS(phoneNumber, message) {
        try {
            if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
                const result = await twilioClient.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                });

                return {
                    success: true,
                    data: {
                        sid: result.sid,
                        status: result.status
                    }
                };
            } else {
                // Fallback / Simulation Mode
                console.log(`[SMS SIMULATION] To: ${phoneNumber}, Message: ${message}`);
                console.log(`[SMS CONFIG] Missing Twilio credentials. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to enable real SMS.`);

                return {
                    success: true,
                    data: {
                        sid: 'SIMULATED_' + Date.now(),
                        status: 'sent'
                    }
                };
            }
        } catch (error) {
            console.error('SMS send exception:', error);
            // Don't fail the whole request for SMS failure usually, but return error status
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate personalized streak reminder message
     */
    async generateStreakMessage(user, streakData) {
        const { currentStreak, longestStreak } = streakData;

        // Get user's most studied subject
        const sessions = await StudySession.find({ userId: user._id })
            .sort({ studyDate: -1 })
            .limit(10);

        const subjectCounts = {};
        sessions.forEach(session => {
            subjectCounts[session.subject] = (subjectCounts[session.subject] || 0) + 1;
        });

        const mostStudiedSubject = Object.keys(subjectCounts).length > 0
            ? Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0][0]
            : 'your favorite subject';

        // Generate personalized message
        let message = '';

        if (currentStreak === 0) {
            message = `Hey! Ready to start a new study streak? Let's practice ${mostStudiedSubject} today! 📚`;
        } else if (currentStreak === 1) {
            message = `Don't break your streak! You studied yesterday. Keep the momentum going with ${mostStudiedSubject}! 🔥`;
        } else if (currentStreak < 7) {
            message = `Your ${currentStreak}-day streak is about to break! Let's keep it going with ${mostStudiedSubject}! 🔥`;
        } else if (currentStreak < 30) {
            message = `Amazing ${currentStreak}-day streak! Don't lose it now. Time to practice ${mostStudiedSubject}! 🔥🔥`;
        } else {
            message = `WOW! ${currentStreak} days straight! You're on fire! Keep your legendary streak alive with ${mostStudiedSubject}! 🔥🔥🔥`;
        }

        return {
            message,
            subject: mostStudiedSubject
        };
    }

    /**
     * Send streak reminder to user
     */
    async sendStreakReminder(user, streakData) {
        const { message, subject } = await this.generateStreakMessage(user, streakData);
        const results = [];

        // Send Email if enabled
        if (user.notificationPreferences?.enableEmail && user.email) {
            const emailResult = await this.sendEmail(
                user.email,
                '🔥 Keep Your Study Streak Alive!',
                message
            );

            const notification = await StreakNotification.create({
                userId: user._id,
                notificationType: 'email',
                message,
                subject,
                status: emailResult.success ? 'sent' : 'failed',
                sentAt: emailResult.success ? new Date() : null,
                errorMessage: emailResult.error || null
            });

            results.push({ type: 'email', ...emailResult, notificationId: notification._id });
        }

        // Send SMS if enabled
        if (user.notificationPreferences?.enableSMS && user.phoneNumber) {
            const smsResult = await this.sendSMS(user.phoneNumber, message);

            const notification = await StreakNotification.create({
                userId: user._id,
                notificationType: 'sms',
                message,
                subject,
                status: smsResult.success ? 'sent' : 'failed',
                sentAt: smsResult.success ? new Date() : null,
                errorMessage: smsResult.error || null
            });

            results.push({ type: 'sms', ...smsResult, notificationId: notification._id });
        }

        return results;
    }

    /**
     * Format email HTML with nice styling
     */
    formatEmailHTML(message, subject) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 10px;
                        padding: 30px;
                        color: white;
                        text-align: center;
                    }
                    .emoji {
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                    .message {
                        font-size: 18px;
                        margin-bottom: 30px;
                    }
                    .cta {
                        background: #FAB400;
                        color: #1a1a1a;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 12px;
                        color: rgba(255,255,255,0.7);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="emoji">🔥</div>
                    <h1>${subject}</h1>
                    <div class="message">${message}</div>
                    <a href="#" class="cta">Start Studying Now</a>
                    <div class="footer">
                        <p>StudyPlan Copilot - Your AI Study Companion</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

export default new NotificationService();
