import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/api';

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const { currentUser: user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // console.log("NotificationProvider Mounted. User:", currentUser); // Removed for security
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications/history?userId=${user.uid}`);
            setNotifications(response.data.map(n => ({
                id: n._id,
                type: n.type || (n.notificationType === 'sms' ? 'success' : 'info'),
                title: n.title || n.subject || 'Notification',
                message: n.message,
                time: new Date(n.createdAt || n.sentAt).toLocaleString(),
                read: n.isRead || false
            })));
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new automation alerts
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    const addNotification = (type, title, message) => {
        const newNotif = {
            id: Date.now(),
            type,
            title,
            message,
            time: 'Just now',
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}
