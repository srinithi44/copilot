import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { Mail, Lock, User, UserPlus, ArrowRight, CheckCircle2, MessageSquare, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleSelection from '../components/Auth/RoleSelection';
import LocationInstitutionPicker from '../components/Auth/LocationInstitutionPicker';

import { API_BASE_URL } from '../config/api';

// API base URL
const API_URL = API_BASE_URL;

export default function Signup() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', passwordConfirm: '',
        role: '', institution: null
    });

    // Auth State
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, googleSignIn, currentUser } = useAuth();
    const navigate = useNavigate();

    // Step 1: Account Creation (Firebase)
    async function handleSignup(e) {
        if (e) e.preventDefault();

        if (formData.password !== formData.passwordConfirm) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(formData.email, formData.password);
            // On success, move to Step 2
            setStep(2);
        } catch (err) {
            console.error(err);
            setError('Failed to create an account. ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            // Google Sign In success -> Step 2
            setStep(2);
        } catch (err) {
            console.error(err);
            setError('Failed to sign in with Google.');
        } finally {
            setLoading(false);
        }
    }

    // Step 3: Finalize Registration (Backend)
    async function finalizeRegistration() {
        if (!formData.institution || !formData.role) {
            return setError("Please complete all selections.");
        }

        try {
            setLoading(true);
            const user = currentUser; // Firebase user should be logged in now

            // Check if this is from Geoapify or manual entry (not a MongoDB ObjectId)
            // MongoDB ObjectIds are 24 hex characters, anything else is from Geoapify or manual
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(formData.institution._id);

            const payload = {
                uid: user.uid,
                email: user.email,
                name: formData.name || user.displayName || 'Student',
                role: formData.role,
                institutionId: isValidObjectId ? formData.institution._id : null,
                institutionName: formData.institution.name,
                location: {
                    country: formData.institution.country,
                    state: formData.institution.state,
                    city: formData.institution.city
                }
            };

            // console.log('Registration payload:', payload);

            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.details || "Backend registration failed");
            }

            // Redirect to email-verify for 2FA/Verification
            navigate('/email-verify');

            /* Previous Dashboard Logic
            if (formData.role === 'professor') navigate('/dashboard/professor');
            else if (formData.role === 'admin') navigate('/dashboard/admin');
            else navigate('/dashboard'); // Student (default)
            */

        } catch (err) {
            console.error(err);
            setError('Registration failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    // Step Handlers
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="min-h-screen w-full flex relative overflow-hidden font-sans text-[#1A1A1A]">
            {/* Background (Same as before) */}
            <div className="absolute inset-0 z-0">
                <img src="/login-bg-final.jpg" alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 bg-white/30 lg:bg-white/10 backdrop-blur-sm lg:backdrop-blur-none" />
            </div>

            {/* Left Side (Same as before) */}
            <div className="hidden lg:flex w-1/2 relative z-10 flex-col items-center justify-center p-12">
                <div className="absolute top-10 left-10">
                    <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        StudyPlan <span className="text-primary-500">Copilot</span>
                    </h1>
                </div>
                {/* Reusing existing floating cards logic if needed, omitted for brevity but keeping structure */}
                <div className="relative w-full max-w-[500px] h-[500px]">
                    <div className="absolute top-[40%] left-[20%] text-white text-4xl font-bold drop-shadow-lg">
                        {step === 1 && "Start Your Journey 🚀"}
                        {step === 2 && "Who are you? 🎓"}
                        {step === 3 && "Where do you study? 🏫"}
                    </div>
                </div>
            </div>

            {/* Right Side: Multi-step Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-[500px]"
                >
                    <div className="p-8 sm:p-10 rounded-[16px] border border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-[18px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>

                        {/* Progress Indicator */}
                        <div className="flex justify-between mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-2 flex-1 rounded-full mx-1 transition-all ${step >= i ? 'bg-[var(--primary-color)]' : 'bg-slate-200'}`} />
                            ))}
                        </div>

                        <div className="mb-6 text-center sm:text-left">
                            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                                {step === 1 ? 'Create Account' : step === 2 ? 'Select Role' : 'Select Institution'}
                            </h2>
                            <p className="text-[#6B7280]">
                                {step === 1 ? 'Start your journey to smarter learning.' : step === 2 ? 'Tell us how you will use the platform.' : 'Find your college to join your peers.'}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 flex items-start gap-3 border border-red-100">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {/* STEP 1: Basic Auth */}
                        {step === 1 && (
                            <>
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <Input
                                        label="Full Name" icon={User}
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                    <Input
                                        type="email" label="Email" icon={Mail}
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required placeholder="you@example.com"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            type="password" label="Password" icon={Lock}
                                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            required placeholder="********"
                                        />
                                        <Input
                                            type="password" label="Confirm" icon={Lock}
                                            value={formData.passwordConfirm} onChange={e => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                            required placeholder="********"
                                        />
                                    </div>
                                    <Button type="submit" width="full" size="lg" loading={loading} className="mt-4 bg-[var(--primary-color)] text-[#1A1A1A] hover:brightness-110">
                                        Next Step <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </form>
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-slate-500 mb-4">Or sign up with</p>
                                    <Button variant="secondary" onClick={handleGoogleSignIn} width="full" className="bg-white border-slate-200">
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-3" />
                                        Continue with Google
                                    </Button>
                                </div>
                                <div className="text-center mt-6">
                                    <p className="text-sm text-[#6B7280]">
                                        Already a member? <Link to="/login" className="font-bold text-primary-500">Log in</Link>
                                    </p>
                                </div>
                            </>
                        )}

                        {/* STEP 2: Role Selection */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <RoleSelection
                                    selectedRole={formData.role}
                                    onSelect={(role) => setFormData({ ...formData, role })}
                                />
                                <div className="flex gap-4 pt-4">
                                    <Button variant="secondary" onClick={prevStep} width="full">Back</Button>
                                    <Button
                                        onClick={nextStep}
                                        width="full"
                                        disabled={!formData.role}
                                        className="bg-[var(--primary-color)] text-[#1A1A1A]"
                                    >
                                        Next <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Institution Selection */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <LocationInstitutionPicker
                                    selectedInstitution={formData.institution}
                                    onSelect={(inst) => setFormData({ ...formData, institution: inst })}
                                />
                                <div className="flex gap-4 pt-4">
                                    <Button variant="secondary" onClick={prevStep} width="full">Back</Button>
                                    <Button
                                        onClick={finalizeRegistration}
                                        width="full"
                                        loading={loading}
                                        disabled={!formData.institution}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Finish & Join <CheckCircle2 size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            </div>
        </div>
    );
}

