import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Lock, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleSignIn } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);

            // Step 1: Firebase login
            const userCredential = await login(email, password);
            const user = userCredential.user;

            // Step 2: Check if user exists in backend database
            try {
                const response = await fetch(`${API_BASE_URL}/users/profile?uid=${user.uid}`);

                if (response.ok) {
                    // User exists in backend (or 200 OK with exists:false)
                    const userData = await response.json();

                    // Existing users skip OTP
                    if (userData.role === 'professor') {
                        return navigate('/dashboard/professor');
                    } else if (userData.role === 'admin' || userData.role === 'super_admin') {
                        return navigate('/dashboard/admin');
                    }
                    return navigate('/dashboard');

                } else {
                    // User not found in backend - assume successful auth
                    navigate('/dashboard');
                }
            } catch (backendError) {
                console.error('Backend check failed:', backendError);
                // If backend check fails, default to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to log in. ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);

            // Step 1: Google Sign In
            const userCredential = await googleSignIn();
            const user = userCredential.user;

            console.log('[Google Sign-In] User authenticated:', user.email);

            // Step 2: Check if user exists in backend database
            try {
                const response = await fetch(`${API_BASE_URL}/users/profile?uid=${user.uid}`);

                if (response.ok) {
                    // User exists in backend - redirect to appropriate dashboard
                    const userData = await response.json();
                    console.log('[Google Sign-In] Existing user found:', userData.role);

                    // Existing Google users skip OTP
                    if (userData.role === 'professor') {
                        return navigate('/dashboard/professor');
                    } else if (userData.role === 'admin' || userData.role === 'super_admin') {
                        return navigate('/dashboard/admin');
                    }
                    return navigate('/dashboard');

                } else {
                    // User not found in backend - auto-register as student
                    console.log('[Google Sign-In] New user - auto-registering...');

                    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName || 'Student',
                            role: 'student', // Default role for Google Sign-In
                            institutionId: null,
                            institutionName: 'Not Specified',
                            location: {
                                country: null,
                                state: null,
                                city: null
                            }
                        })
                    });

                    if (registerResponse.ok) {
                        console.log('[Google Sign-In] User registered successfully');
                        // Redirect directly to dashboard 
                        navigate('/dashboard');
                    } else if (registerResponse.status === 409) {
                        // User already exists (duplicate email) - try to fetch and redirect
                        console.log('[Google Sign-In] User already exists, fetching profile...');
                        const retryResponse = await fetch(`${API_BASE_URL}/users/profile?uid=${user.uid}`);
                        if (retryResponse.ok) {
                            const userData = await retryResponse.json();

                            if (userData.role === 'professor') {
                                return navigate('/dashboard/professor');
                            } else if (userData.role === 'admin' || userData.role === 'super_admin') {
                                return navigate('/dashboard/admin');
                            }
                            return navigate('/dashboard');
                        } else {
                            // Fallback to dashboard
                            navigate('/dashboard');
                        }
                    } else {
                        const errorData = await registerResponse.json();
                        throw new Error(errorData.details || 'Failed to register user');
                    }
                }
            } catch (backendError) {
                console.error('[Google Sign-In] Backend error:', backendError);
                setError('Failed to complete sign-in: ' + backendError.message);
            }
        } catch (err) {
            console.error('[Google Sign-In] Authentication error:', err);
            setError('Failed to sign in with Google: ' + err.message);
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
                                <div key={i} className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.8 + (i * 0.05) }} />
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

            {/* Right Side: Login Form */}
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
                            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-[#6B7280]">
                                Enter your details to access your personalized study plan.
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
                                    placeholder="name@example.com"
                                    inputClassName="bg-white/80 border-slate-200 focus:border-primary-500 focus:ring-primary-500/30 text-[#1A1A1A] rounded-xl h-[50px] shadow-inner"
                                />
                            </motion.div>

                            <motion.div whileFocusWithin={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                                <Input
                                    id="password"
                                    type="password"
                                    label="Password"
                                    icon={Lock}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    inputClassName="bg-white/80 border-slate-200 focus:border-primary-500 focus:ring-primary-500/30 text-[#1A1A1A] rounded-xl h-[50px] shadow-inner"
                                />
                                <div className="flex items-center justify-between mt-3">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                                        />
                                        <span className="text-sm text-[#6B7280] group-hover:text-[#1A1A1A] transition-colors">Remember me</span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
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
                                    Sign In
                                </Button>
                            </motion.div>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300/60"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-slate-500 font-medium" style={{ backgroundColor: 'transparent' }}>Or continue with</span>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            width="full"
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold shadow-sm hover:shadow-md transition-all h-[52px] rounded-xl justify-center"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </Button>

                        <div className="text-center mt-8">
                            <p className="text-sm text-[#6B7280]">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-bold text-primary-500 hover:text-primary-600 transition-colors">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
