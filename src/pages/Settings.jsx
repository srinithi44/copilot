import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LocationSelector from '../components/LocationSelector';
import NotificationSettings from '../components/Settings/NotificationSettings';
import { User, Shield, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
    const { currentUser } = useAuth();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
                    <p className="text-[var(--text-secondary)]">Manage your account preferences and institution</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Institution Selection */}
                    <LocationSelector />

                    {/* Notification Settings */}
                    {/* Notification Settings - Hidden for Students */}
                    {currentUser?.role !== 'student' && (
                        <NotificationSettings userId={currentUser?.uid} />
                    )}

                    {/* Placeholder for other settings */}
                    <div className="bg-[var(--surface-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-6 opacity-60 pointer-events-none grayscale">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <User size={20} /> Profile Details
                            </h3>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Coming Soon</span>
                        </div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
