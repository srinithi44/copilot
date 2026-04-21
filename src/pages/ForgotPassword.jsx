import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, ArrowRight, CheckCircle2, MessageSquare, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(email);
            setMessage('Check your inbox for further instructions');
        } catch (err) {
            console.error(err);
            setError('Failed to reset password. ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex relative overflow-hidden font-sans text-[#1A1A1A]">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-bg-final.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 bg-white/30 lg:bg-white/10 backdrop-blur-sm lg:backdrop-blur-none" />
            </div>

            {/* Left Side: Floating UI Cards */}
            <div className="hidden lg:flex w-1/2 relative z-10 flex-col items-center justify-center p-12">
                <div className="absolute top-10 left-10">
                    <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        StudyPlan <span className="text-primary-500">Copilot</span>
                    </h1>
                </div>

                <div className="relative w-full max-w-[500px] h-[500px]">
                    {/* Study Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="absolute top-0 left-0 p-4 bg-white/65 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl w-[200px]"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold text-slate-600">Study Progress</span>
                            <div className="w-2 h-2 rounded-full bg-green-400 ml-auto" />
                        </div>
                        <div className="flex gap-1 items-end h-[40px] mb-2">
                            {[40, 60, 30, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-primary-400 to-primary-300 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.8 + (i * 0.05) }} />
                            ))}
                        </div>
                        <p className="text-xs font-bold text-slate-800">78% Completed</p>
                    </motion.div>

                    {/* AI Assistant Bubble */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="absolute top-[40%] left-[-20px] p-4 bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl rounded-tr-none w-[220px]"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary-500/20 rounded-full">
                                <MessageSquare size={16} className="text-primary-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-800 mb-1">AI Assistant</p>
                                <p className="text-xs text-slate-600 leading-relaxed">How can I assist you with your calculus revision today?</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Weekly Goals Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="absolute bottom-10 right-0 p-5 bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl w-[240px]"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-primary-500 rounded-lg">
                                <CheckCircle2 size={16} className="text-white" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">Weekly Goals</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-primary-500 flex items-center justify-center">
                                    <CheckCircle2 size={10} className="text-white" />
                                </div>
                                <span className="text-xs text-slate-700 font-medium">5/6 Tasks Done</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                                <div className="w-[85%] h-full bg-primary-500 rounded-full" />
                            </div>
                            <div className="space-y-1.5 mt-2">
                                <div className="h-2 w-3/4 bg-slate-400/20 rounded-full" />
                                <div className="h-2 w-1/2 bg-slate-400/20 rounded-full" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Forgot Password Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[450px]"
                >
                    {/* Glassmorphism Form Container */}
                    <div
                        className="p-8 sm:p-10 rounded-[16px] border border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-[18px]"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.65)' }}
                    >
                        <div className="mb-8 text-center sm:text-left">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-xl mx-auto sm:mx-0 mb-4 flex items-center justify-center">
                                <KeyRound className="w-6 h-6 text-primary-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
                                Password Recovery
                            </h2>
                            <p className="text-[#6B7280]">
                                Enter your email to reset your account password
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 flex items-start gap-3 border border-red-100"
                            >
                                <span>⚠️</span>
                                {error}
                            </motion.div>
                        )}

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-medium mb-6 flex items-start gap-3 border border-green-100"
                            >
                                <span>✅</span>
                                {message}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div whileFocusWithin={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                                <Input
                                    id="email"
                                    type="email"
                                    label="Email Address"
                                    icon={Mail}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@company.com"
                                    inputClassName="bg-white/80 border-slate-200 focus:border-primary-500 focus:ring-primary-500/30 text-[#1A1A1A] rounded-xl h-[50px] shadow-inner"
                                />
                            </motion.div>

                            <motion.div
                                className="pt-4"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    width="full"
                                    size="lg"
                                    loading={loading}
                                    icon={ArrowRight}
                                    iconPosition="right"
                                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-[#1A1A1A] font-bold shadow-lg shadow-primary-500/10 border-none h-[52px] rounded-xl"
                                >
                                    Send Recovery Link
                                </Button>
                            </motion.div>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300/60"></div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link to="/login" className="text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-2">
                                <span>←</span> Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
