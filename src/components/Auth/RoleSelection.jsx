import React from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Shield } from 'lucide-react';

const roles = [
    { id: 'student', label: 'Student', icon: User, desc: 'Access study tools, quizzes, and track progress.' },
    { id: 'professor', label: 'Professor', icon: BookOpen, desc: 'Create quizzes, manage students, and view analytics.' },
    { id: 'admin', label: 'Admin', icon: Shield, desc: 'Manage institution, users, and overall reports.' }
];

export default function RoleSelection({ onSelect, selectedRole, email }) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-center text-[var(--text-primary)]">Select Your Role</h3>
            <div className="grid grid-cols-1 gap-4">
                {roles.map((role) => {
                    // Restrict Professor and Admin roles to specific email
                    if ((role.id === 'admin' || role.id === 'professor') && email !== 'farmoraindia@gmail.com') {
                        return null;
                    }

                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                        <motion.button
                            key={role.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(role.id)}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all w-full text-left
                                ${isSelected
                                    ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 shadow-md'
                                    : 'border-transparent bg-white/50 hover:bg-white/80 hover:border-slate-200'
                                }
                            `}
                        >
                            <div className={`p-3 rounded-full mr-4 ${isSelected ? 'bg-[var(--primary-color)] text-white' : 'bg-slate-200 text-slate-600'}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h4 className={`font-bold ${isSelected ? 'text-[var(--primary-color)]' : 'text-slate-800'}`}>{role.label}</h4>
                                <p className="text-xs text-slate-500">{role.desc}</p>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
