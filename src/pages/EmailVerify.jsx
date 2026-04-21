import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { Mail, ArrowRight, CheckCircle, Shield, RotateCcw, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("EmailVerify Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FB]">
                    <div className="p-8 bg-white rounded-xl shadow-xl border border-red-200 max-w-lg w-full">
                        <h1 className="text-2xl font-bold text-red-700 mb-4">Something went wrong.</h1>
                        <details className="text-sm text-red-600 bg-red-50 p-4 rounded-lg overflow-auto max-h-60 mb-6 font-mono">
                            <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

function EmailVerifyContent() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const inputRefs = useRef([]);

    // Use defensive auth access
    const authContext = useAuth();
    const { mockLogin, currentUser, setIs2faVerified } = authContext || {};

    const navigate = useNavigate();
    const location = useLocation();

    // Auto-fill email if logged in (2FA mode)
    useEffect(() => {
        if (currentUser && currentUser.email) {
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    // Timer countdown effect
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    if (!authContext) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
                <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
            </div>
        );
    }

    async function handleSendOtp(e) {
        if (e) e.preventDefault();
        setError('');

        if (!email) {
            return setError('Please enter a valid email address.');
        }

        setLoading(true);

        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        window.localStorage.setItem('debug_otp', code); // Persist for refresh
        // console.log("Generated OTP:", code); // Hidden for security

        try {
            // Call our secure backend instead of EmailJS
            const response = await fetch(`${API_BASE_URL}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    otp: code,
                }),
            });

            let result;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await response.json();
            } else {
                const text = await response.text();
                // console.error("Non-JSON Response:", text); // Suppress log for cleaner console
                throw new Error("Server returned a non-JSON response. Is the backend running?");
            }

            if (!response.ok) {
                const errorMessage = result.error || 'Failed to send verification email';
                throw new Error(errorMessage);
            }

            setStep(2);
            setTimer(60);
        } catch (err) {
            console.error("Resend Integration Error:", err);
            setError(err.message || "Failed to send verification email. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(e) {
        e.preventDefault();
        setError('');

        const otpString = otp.join('');
        const storedOtp = window.localStorage.getItem('debug_otp');
        // console.log("Input:", otpString, "Stored:", storedOtp, "State:", generatedOtp);

        if (otpString !== generatedOtp && otpString !== storedOtp) {
            return setError('Invalid OTP. Please check the code and try again.');
        }

        try {
            setLoading(true);

            // If we are already logged in (2FA flow), just mark verified
            if (currentUser) {
                // Ensure the setter exists before calling
                if (typeof setIs2faVerified === 'function') {
                    setIs2faVerified(true);
                } else {
                    console.warn("setIs2faVerified is missing from context!", authContext);
                }
            } else {
                // If not logged in (Email-only flow), do the mock login
                if (typeof mockLogin === 'function') {
                    await mockLogin();
                } else {
                    throw new Error("mockLogin function missing from context");
                }
            }

            window.localStorage.removeItem('debug_otp'); // Cleanup

            // Persist verification status in MongoDB
            if (currentUser) {
                try {
                    await fetch(`${API_BASE_URL}/users/verify-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: currentUser.uid })
                    });
                } catch (persistError) {
                    console.error("Failed to persist verification status:", persistError);
                    // Continue anyway, as the user is verified in the current session
                }
            }

            const destination = location.state?.from || '/dashboard';
            navigate(destination);
        } catch (err) {
            console.error(err);
            setError('Failed to log in. ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Auto move to next input
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

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
                    {/* Join Community Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="absolute top-10 left-0 p-4 bg-white/65 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl w-[200px]"
                    >
                        <div className="flex -space-x-2 mb-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600`}>
                                    U{i}
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-500 flex items-center justify-center text-[10px] font-bold text-white">
                                +2k
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-800">Verified Students</p>
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
                                <Shield size={16} className="text-primary-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-800 mb-1">Secure Login</p>
                                <p className="text-xs text-slate-600 leading-relaxed">Your account security is our top priority.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Success Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="absolute bottom-20 right-0 p-4 bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl w-[180px]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Protected</p>
                                <p className="text-xs text-slate-600">Encrypted Data</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Verification Form */}
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
                                <Shield className="w-6 h-6 text-primary-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
                                {currentUser ? 'Security Check' : 'Email Verification'}
                            </h2>
                            <p className="text-[#6B7280]">
                                {step === 1
                                    ? (currentUser ? `Verify identity for ${email}` : 'Sign in securely with a one-time code')
                                    : `Enter the code sent to ${email}`
                                }
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

                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <motion.div whileFocusWithin={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                                    <Input
                                        id="email"
                                        type="email"
                                        label="Email Address"
                                        icon={Mail}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        disabled={!!currentUser}
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
                                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold shadow-lg shadow-primary/10 border-none h-[52px] rounded-xl"
                                    >
                                        Send Verification Code
                                    </Button>
                                </motion.div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-8">
                                <div className="flex justify-between gap-2 max-w-[360px] mx-auto">
                                    {otp.map((data, index) => (
                                        <motion.input
                                            key={index}
                                            whileFocus={{ scale: 1.1, borderColor: 'var(--primary-color)' }}
                                            type="text"
                                            name="otp"
                                            maxLength="1"
                                            value={data}
                                            ref={el => inputRefs.current[index] = el}
                                            onChange={e => handleOtpChange(e.target, index)}
                                            onKeyDown={e => handleKeyDown(e, index)}
                                            onFocus={e => e.target.select()}
                                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border border-slate-200 bg-white/80 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all text-[#1A1A1A] shadow-inner"
                                        />
                                    ))}
                                </div>

                                <div className="text-center">
                                    {timer > 0 ? (
                                        <p className="text-sm text-[#6B7280] font-medium">
                                            Resend code in <span className="text-primary-500 font-bold">{timer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center justify-center gap-2 mx-auto transition-colors"
                                        >
                                            <RotateCcw size={16} /> Resend Create
                                        </button>
                                    )}
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="submit"
                                        width="full"
                                        size="lg"
                                        loading={loading}
                                        icon={CheckCircle}
                                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold shadow-lg shadow-primary/10 border-none h-[52px] rounded-xl"
                                    >
                                        Verify & Sign In
                                    </Button>
                                </motion.div>

                                {!currentUser && (
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-sm text-[#6B7280] hover:text-[#1A1A1A] font-medium transition-colors"
                                        >
                                            Change Email Address
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}

                        <div className="mt-8 text-center pt-6 border-t border-slate-300/60">
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

export default function EmailVerify() {
    return (
        <ErrorBoundary>
            <EmailVerifyContent />
        </ErrorBoundary>
    );
}
