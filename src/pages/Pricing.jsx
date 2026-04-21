import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, Star, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const Pricing = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const loadRazorpayStub = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const API_URL = API_BASE_URL;

    const handleUpgrade = async () => {
        const res = await loadRazorpayStub();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order
            const orderUrl = `${API_URL}/payment/create-order`;
            const response = await fetch(orderUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const orderData = await response.json();

            if (!response.ok || !orderData.id) {
                alert(orderData.error || 'Server error creating order.');
                setLoading(false);
                return;
            }

            // 2. Options
            // Note: In production, use process.env.VITE_RAZORPAY_KEY_ID
            const options = {
                key: "rzp_test_SCMClPIQXztzx8", // Hardcoded to ensure it loads
                amount: orderData.amount,
                currency: orderData.currency,
                name: "StudyPlan Co-Pilot",
                description: "Premium Subscription",
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    const verifyUrl = `${API_URL}/payment/verify`;
                    const verifyRes = await fetch(verifyUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            uid: currentUser.uid
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        alert("Payment Successful! You are now a Premium Member.");
                        // Force reload to update user context from backend
                        window.location.href = '/dashboard';
                    } else {
                        alert("Payment verification failed.");
                    }
                },
                prefill: {
                    name: currentUser?.displayName || currentUser?.email,
                    email: currentUser?.email,
                    contact: currentUser?.phoneNumber || ""
                },
                theme: {
                    color: "#38BDF8"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Upgrade to Premium
                </h1>
                <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                    Unlock advanced study tools, unlimited flowchart generation, and personalized AI analytics.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center mt-12">
                {/* Free Plan */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[var(--surface-color)] p-8 rounded-2xl border border-[var(--border-color)] space-y-6"
                >
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">Free Plan</h3>
                        <p className="text-[var(--text-secondary)]">Basic study essentials</p>
                    </div>
                    <div className="text-3xl font-bold text-[var(--text-primary)]">
                        ₹0 <span className="text-base font-medium text-[var(--text-muted)]">/month</span>
                    </div>
                    <ul className="space-y-4">
                        <FeatureItem text="Basic Study Plans" />
                        <FeatureItem text="Access to Daily Quizzes" />
                        <FeatureItem text="Limited AI Queries" />
                        <FeatureItem text="Standard Support" />
                    </ul>
                    <button className="w-full py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] font-medium cursor-default">
                        Current Plan
                    </button>
                </motion.div>

                {/* Premium Plan */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative bg-[var(--surface-color)] p-8 rounded-2xl border border-primary-500/50 shadow-2xl shadow-primary-500/10 space-y-6 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary to-secondary text-white text-xs font-bold px-4 py-2 rounded-bl-xl">
                        RECOMMENDED
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">Premium</h3>
                        <p className="text-[var(--text-secondary)]">Unlock your full potential</p>
                    </div>
                    <div className="text-3xl font-bold text-[var(--text-primary)]">
                        ₹99<span className="text-base font-medium text-[var(--text-muted)]">/month</span>
                    </div>
                    <ul className="space-y-4">
                        <FeatureItem text="Unlimited AI Flowcharts" checkColor="text-primary-500" />
                        <FeatureItem text="Advanced Analytics Dashboard" checkColor="text-primary-500" />
                        <FeatureItem text="Personalized Revision Planner" checkColor="text-primary-500" />
                        <FeatureItem text="Priority Support" checkColor="text-primary-500" />
                    </ul>

                    {currentUser?.isPremium ? (
                        <button className="w-full py-3 rounded-xl bg-green-500/10 text-green-600 font-bold border border-green-500/20 cursor-default">
                            Active Subscription
                        </button>
                    ) : (
                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Zap size={18} fill="currentColor" /> Upgrade Now
                                </>
                            )}
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text, checkColor = "text-[var(--primary-color)]" }) => (
    <li className="flex items-center gap-3 text-[var(--text-secondary)]">
        <div className={`p-1 rounded-full bg-[var(--surface-hover)] ${checkColor}`}>
            <Check size={14} strokeWidth={3} />
        </div>
        {text}
    </li>
);

export default Pricing;
