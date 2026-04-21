import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { Smartphone, ArrowRight, CheckCircle, Shield, RotateCcw, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

export default function OTPVerify() {
    const [countryCode, setCountryCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmObj, setConfirmObj] = useState(null);
    const [timer, setTimer] = useState(0);
    const { setUpRecaptcha, verifyOtp } = useAuth();
    const navigate = useNavigate();
    const inputRefs = useRef([]);

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

    async function handleSendOtp(e) {
        e.preventDefault();
        setError('');

        if (!phoneNumber) {
            return setError('Please enter a valid phone number.');
        }

        const fullPhoneNumber = `${countryCode}${phoneNumber}`;

        try {
            setLoading(true);
            const recaptchaVerifier = await setUpRecaptcha('recaptcha-container');
            const confirmationResult = await verifyOtp(fullPhoneNumber, recaptchaVerifier);
            setConfirmObj(confirmationResult);
            setStep(2);
            setTimer(30); // 30s countdown
            setLoading(false);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/billing-not-enabled') {
                setError('Free Plan Limit: Google now requires billing for real SMS. Use a "Test Phone Number" (e.g., +1 650-555-1234) from Firebase Console.');
                alert('Google requires a sophisticated plan for real SMS. Please use a Test Phone Number defined in your Firebase Console to bypass this.');
            } else {
                setError('Failed to send OTP. ' + err.message);
            }
            setLoading(false);
            if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
        }
    }

    async function handleVerifyOtp(e) {
        e.preventDefault();
        setError('');

        const otpString = otp.join('');
        if (otpString.length !== 6) return setError('Please enter the complete 6-digit OTP code.');

        try {
            setLoading(true);
            if (confirmObj) {
                const result = await confirmObj.confirm(otpString);
                const user = result.user;

                if (user) {
                    try {
                        await fetch(`${API_BASE_URL}/users/verify-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ uid: user.uid })
                        });
                    } catch (persistError) {
                        console.error("Failed to persist verification status:", persistError);
                    }
                }

                navigate('/dashboard');
            } else {
                setError("Session expired. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError('Invalid OTP code. ' + err.message);
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
                                <Smartphone size={16} className="text-primary-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-800 mb-1">Mobile Access</p>
                                <p className="text-xs text-slate-600 leading-relaxed">Securely log in using your mobile number.</p>
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
                                <p className="text-xs text-slate-600">2FA Enabled</p>
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
                                <Smartphone className="w-6 h-6 text-primary-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
                                Phone Login
                            </h2>
                            <p className="text-[#6B7280]">
                                {step === 1 ? 'Verify your identity via SMS code' : `Enter the code sent to ${countryCode} ${phoneNumber}`}
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
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-[#1A1A1A]">
                                            Phone Number
                                        </label>
                                        <div className="flex gap-3">
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="h-[50px] px-3 rounded-xl border border-slate-200 bg-white/80 text-[#1A1A1A] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-medium transition-all shadow-inner"
                                            >
                                                <option value="+1">🇺🇸 +1</option>
                                                <option value="+91">🇮🇳 +91</option>
                                                <option value="+44">🇬🇧 +44</option>
                                                <option value="+61">🇦🇺 +61</option>
                                                <option value="+81">🇯🇵 +81</option>
                                                <option value="+49">🇩🇪 +49</option>
                                                <option value="+33">🇫🇷 +33</option>
                                                <option value="+86">🇨🇳 +86</option>
                                            </select>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="Mobile number"
                                                required
                                                className="flex-1 h-[50px] px-4 rounded-xl border border-slate-200 bg-white/80 text-[#1A1A1A] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium placeholder:text-slate-400 shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                <div id="recaptcha-container" className="flex justify-center"></div>

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
                                        Send SMS Code
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
                                            onClick={() => setStep(1)} // Basic reset for now
                                            className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center justify-center gap-2 mx-auto transition-colors"
                                        >
                                            <RotateCcw size={16} /> Resend SMS
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
                                        className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-[#1A1A1A] font-bold shadow-lg shadow-primary-500/10 border-none h-[52px] rounded-xl"
                                    >
                                        Verify & Login
                                    </Button>
                                </motion.div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm text-[#6B7280] hover:text-[#1A1A1A] font-medium transition-colors"
                                    >
                                        Change Phone Number
                                    </button>
                                </div>
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
