import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Clock, BookOpen, Check, X, Send } from 'lucide-react';
import notificationService from '../../services/notificationService';
import './NotificationSettings.css';

const NotificationSettings = ({ userId }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [enableEmail, setEnableEmail] = useState(true);
    const [enableSMS, setEnableSMS] = useState(false);
    const [preferredTime, setPreferredTime] = useState('09:00');
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const availableSubjects = ['Java', 'Python', 'JavaScript', 'DSA', 'Web Development', 'Machine Learning'];

    useEffect(() => {
        loadPreferences();
    }, [userId]);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotificationPreferences(userId);
            setPhoneNumber(data.phoneNumber || '');
            setEnableEmail(data.notificationPreferences?.enableEmail ?? true);
            setEnableSMS(data.notificationPreferences?.enableSMS ?? false);
            setPreferredTime(data.notificationPreferences?.preferredTime || '09:00');
            setSubjects(data.notificationPreferences?.subjects || []);
        } catch (error) {
            showMessage('error', 'Failed to load preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await notificationService.updateNotificationPreferences(userId, phoneNumber, {
                enableEmail,
                enableSMS,
                preferredTime,
                subjects
            });
            showMessage('success', 'Preferences saved successfully!');
        } catch (error) {
            showMessage('error', 'Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleTestNotification = async (type) => {
        try {
            const result = await notificationService.sendTestNotification(userId, type);
            if (result.success) {
                showMessage('success', `Test ${type} sent successfully!`);
            } else {
                showMessage('error', result.error || `Failed to send test ${type}`);
            }
        } catch (error) {
            showMessage('error', `Failed to send test ${type}`);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const toggleSubject = (subject) => {
        setSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    if (loading) {
        return (
            <div className="notification-settings-modern">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading preferences...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="notification-settings-modern"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="settings-header">
                <div>
                    <h2 className="settings-title">Notification Preferences</h2>
                    <p className="settings-subtitle">Manage how you receive streak reminders</p>
                </div>
            </div>

            {/* Alert Message */}
            {message.text && (
                <motion.div
                    className={`alert-message ${message.type}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
                    <span>{message.text}</span>
                </motion.div>
            )}

            {/* Notification Methods */}
            <div className="settings-card">
                <h3 className="card-heading">Delivery Methods</h3>

                <div className="method-option">
                    <div className="method-info">
                        <div className="method-icon email">
                            <Mail size={20} />
                        </div>
                        <div>
                            <div className="method-title">Email Notifications</div>
                            <div className="method-description">Receive reminders via email</div>
                        </div>
                    </div>
                    <label className="modern-toggle">
                        <input
                            type="checkbox"
                            checked={enableEmail}
                            onChange={(e) => setEnableEmail(e.target.checked)}
                        />
                        <span className="toggle-track">
                            <span className="toggle-thumb"></span>
                        </span>
                    </label>
                </div>

                {enableEmail && (
                    <motion.button
                        className="test-btn"
                        onClick={() => handleTestNotification('email')}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <Send size={16} />
                        Send Test Email
                    </motion.button>
                )}

                <div className="method-option">
                    <div className="method-info">
                        <div className="method-icon sms">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <div className="method-title">SMS Notifications</div>
                            <div className="method-description">Receive reminders via text message</div>
                        </div>
                    </div>
                    <label className="modern-toggle">
                        <input
                            type="checkbox"
                            checked={enableSMS}
                            onChange={(e) => setEnableSMS(e.target.checked)}
                        />
                        <span className="toggle-track">
                            <span className="toggle-thumb"></span>
                        </span>
                    </label>
                </div>

                {enableSMS && (
                    <motion.div
                        className="phone-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <input
                            type="tel"
                            className="modern-input"
                            placeholder="+1 234 567 8900"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <button
                            className="test-btn"
                            onClick={() => handleTestNotification('sms')}
                            disabled={!phoneNumber}
                        >
                            <Send size={16} />
                            Send Test SMS
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Preferred Time */}
            <div className="settings-card">
                <h3 className="card-heading">
                    <Clock size={18} />
                    Preferred Time
                </h3>
                <p className="card-description">When should we send you reminders?</p>
                <input
                    type="time"
                    className="modern-input time-input"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                />
            </div>

            {/* Subjects */}
            <div className="settings-card">
                <h3 className="card-heading">
                    <BookOpen size={18} />
                    Subjects
                </h3>
                <p className="card-description">Select subjects you want reminders for</p>
                <div className="subjects-container">
                    {availableSubjects.map(subject => (
                        <button
                            key={subject}
                            className={`subject-tag ${subjects.includes(subject) ? 'active' : ''}`}
                            onClick={() => toggleSubject(subject)}
                        >
                            {subjects.includes(subject) && <Check size={14} />}
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <button
                className="save-btn-modern"
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <>
                        <div className="btn-spinner"></div>
                        Saving...
                    </>
                ) : (
                    <>
                        <Check size={18} />
                        Save Preferences
                    </>
                )}
            </button>
        </motion.div>
    );
};

export default NotificationSettings;
