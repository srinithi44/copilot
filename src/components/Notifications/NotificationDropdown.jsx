import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationDropdown({ isOpen, onClose }) {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    if (!isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-700">Notifications</h3>
                <button
                    onClick={markAllAsRead}
                    className="text-xs text-[var(--primary-color)] hover:underline font-medium"
                >
                    Mark all read
                </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                        No notifications
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer relative group ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                        >
                            <div className="flex gap-3">
                                <div className="mt-1 shrink-0">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">{notif.title}</h4>
                                    <p className="text-xs text-slate-500 leading-snug mb-1">{notif.message}</p>
                                    <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                                </div>
                                {!notif.read && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-800 font-medium w-full py-1">
                    Close
                </button>
            </div>
        </div>
    );
}
