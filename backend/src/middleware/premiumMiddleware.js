import User from '../models/User.js';

export const premiumMiddleware = async (req, res, next) => {
    try {
        // req.user is expected to be populated by previous auth middleware
        // If not, we might need to fetch it or check req.user exists
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Fetch fresh user data to check status (in case req.user is stale from token)
        const user = await User.findOne({ uid: req.user.uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isPremium && user.role !== 'super_admin') {
            return res.status(403).json({ message: "Upgrade to Premium to access this feature" });
        }

        // Check expiry
        if (user.subscriptionExpiry && new Date() > new Date(user.subscriptionExpiry)) {
            // Downgrade if expired
            user.isPremium = false;
            user.subscriptionExpiry = null;
            await user.save();
            return res.status(403).json({ message: "Premium subscription expired" });
        }

        next();
    } catch (error) {
        console.error("Premium Middleware Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
