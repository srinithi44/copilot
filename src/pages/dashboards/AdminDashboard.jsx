import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Building2, Users, ShieldAlert, Activity } from 'lucide-react';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';

export default function AdminDashboard() {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) fetchUsers();
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${API_BASE_URL}/users/list?uid=${currentUser.uid}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
                        <p className="text-[var(--text-secondary)]">Institution Overview & Management</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Institution</p>
                                <h3 className="text-lg font-bold text-slate-800">Anna University</h3>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Total Users</p>
                                <h3 className="text-lg font-bold text-slate-800">{users.length}</h3>
                            </div>
                        </div>
                    </Card>
                    {/* ... other cards ... */}
                </div>

                <Card className="p-6 min-h-[400px]">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">User Management</h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                <th className="py-3">Name</th>
                                <th className="py-3">Email</th>
                                <th className="py-3">Role</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 font-medium text-slate-800">{user.location?.city || 'User'}</td>
                                    <td className="py-3 text-slate-500 text-sm">{user.email}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize 
                                            ${user.role === 'student' ? 'bg-blue-100 text-blue-700' :
                                                user.role === 'professor' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 text-green-600 font-bold text-sm">Active</td>
                                </tr>
                            ))}
                            {loading && <tr><td colSpan="4" className="py-4 text-center">Loading...</td></tr>}
                        </tbody>
                    </table>
                </Card>
            </div>
        </DashboardLayout>
    );
}
