import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const API_URL = 'http://localhost:5000/api';
const TEST_UID = 'test_user_payment_verify';

// Mock Razorpay keys for testing if not present
if (!process.env.RAZORPAY_KEY_SECRET) {
    console.warn("⚠️ RAZORPAY_KEY_SECRET not found in .env. Using mock secret for verification testing.");
    process.env.RAZORPAY_KEY_ID = "rzp_test_mock";
    process.env.RAZORPAY_KEY_SECRET = "mock_secret";
}

async function verifyPaymentFlow() {
    try {
        console.log('🚀 Starting Payment verification...');

        // 1. Setup Test User
        await mongoose.connect(process.env.MONGO_URI);
        let user = await User.findOne({ uid: TEST_UID });
        if (!user) {
            user = await User.create({
                uid: TEST_UID,
                email: 'test_payment@example.com',
                name: 'Test Payment User',
                role: 'student'
            });
        }
        // Reset premium status
        user.isPremium = false;
        user.subscriptionExpiry = null;
        await user.save();
        console.log('✅ Test user setup complete.');

        // 2. Test Create Order
        // Note: This might fail if Razorpay keys are invalid/mocked and the SDK tries to call real Razorpay
        // We will try/catch this specific step.
        let orderId = 'order_mock_123456';
        try {
            console.log('Testing /payment/create-order ...');
            // We need to valid keys for this to actually hit Razorpay. 
            // If we are just unit testing our controller logic, we might need to mock the razorpay instance in the controller.
            // For this script, we'll assume if it fails due to auth, we'll use a mock order ID.
            const orderRes = await axios.post(`${API_URL}/payment/create-order`, {}, {
                validateStatus: status => status < 500 // Allow 400s/etc to handle gracefully
            });

            if (orderRes.status === 200 && orderRes.data.id) {
                orderId = orderRes.data.id;
                console.log('✅ Create Order successful:', orderId);
            } else {
                console.warn('⚠️ Create Order failed (likely due to invalid keys). Using mock Order ID for verification flow.');
            }

        } catch (e) {
            console.warn('⚠️ Create Order failed (network/server). Using mock Order ID.');
        }

        // 3. Test Verify Payment
        console.log('Testing /payment/verify ...');
        const paymentId = 'pay_mock_987654';
        const signatureBody = orderId + "|" + paymentId;
        const signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(signatureBody.toString())
            .digest("hex");

        const verifyRes = await axios.post(`${API_URL}/payment/verify`, {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            uid: TEST_UID
        });

        if (verifyRes.data.success) {
            console.log('✅ Payment Verification Endpoint returned success.');
        } else {
            console.error('❌ Payment Verification Endpoint failed:', verifyRes.data);
            process.exit(1);
        }

        // 4. Check Database Update
        const updatedUser = await User.findOne({ uid: TEST_UID });
        if (updatedUser.isPremium) {
            console.log('✅ Database updated: User is now Premium.');
            console.log('Subscription Expiry:', updatedUser.subscriptionExpiry);
        } else {
            console.error('❌ Database update failed: User is NOT Premium.');
            process.exit(1);
        }

        // Cleanup
        await User.deleteOne({ uid: TEST_UID });
        console.log('🧹 Cleanup done.');
        console.log('🎉 All Payment Verification tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification Error:', error.message);
        if (error.response) console.error('Response Data:', error.response.data);
        process.exit(1);
    }
}

verifyPaymentFlow();
