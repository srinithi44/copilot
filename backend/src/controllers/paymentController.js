import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : null;

if (!razorpay) {
    console.warn("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment features will be disabled.");
}

export const createOrder = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ error: "Payment service unavailable (Server misconfiguration)" });
        }

        const options = {
            amount: 900, // 9 INR in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (error) {
        console.error("Create Order Error:", error);
        if (error.statusCode === 401) {
            return res.status(401).json({ error: "Razorpay Authentication Failed. Check API Keys." });
        }
        res.status(500).json({ error: "Failed to create order", details: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uid } = req.body;

        if (!uid) {
            return res.status(400).json({ error: "User ID (uid) is required" });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ error: "Payment service unavailable (Missing Secret)" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment successful
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30); // 30 days validity

            await User.findOneAndUpdate(
                { uid },
                {
                    isPremium: true,
                    paymentId: razorpay_payment_id,
                    subscriptionExpiry: expiryDate,
                }
            );

            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
