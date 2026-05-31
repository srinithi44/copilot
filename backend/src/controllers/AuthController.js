import User from '../models/User.js';

// Register User (First time login / Additional details)
export const registerUser = async (req, res) => {
    try {
        const { uid, email, name, role, institutionId, location, institutionName } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ error: "UID and Email are required" });
        }

        // Enforce Role Restriction: only farmoraindia@gmail.com can be professor or admin
        let assignedRole = role || 'student';
        if ((assignedRole === 'admin' || assignedRole === 'professor') && email !== 'farmoraindia@gmail.com') {
            assignedRole = 'student';
        }

        console.log('[Register] Request:', { uid, email, role: assignedRole });

        // First, check if user exists by UID
        let user = await User.findOne({ uid });

        if (user) {
            console.log('[Register] User found by UID, updating...');
            // Update existing user metadata if provided
            if (name) user.name = name;
            if (assignedRole) user.role = assignedRole;
            if (institutionId) user.institutionId = institutionId;
            if (institutionName) user.institutionName = institutionName;
            if (location) user.location = location;

            await user.save();
            return res.json({ message: "User updated", user });
        }

        // If not found by UID, check by email
        user = await User.findOne({ email });

        if (user) {
            console.log('[Register] User found by email, updating UID...');
            // User exists with this email but different UID
            // This can happen if they previously signed up with email/password
            // and now are signing in with Google
            user.uid = uid;
            if (name) user.name = name;
            if (assignedRole) user.role = assignedRole;
            if (institutionId) user.institutionId = institutionId;
            if (institutionName) user.institutionName = institutionName;
            if (location) user.location = location;

            await user.save();
            return res.json({ message: "User updated with new UID", user });
        }

        // Create new user - neither UID nor email exists
        console.log('[Register] Creating new user');
        user = new User({
            uid,
            email,
            name: name || 'Student',
            role: assignedRole,
            institutionId: institutionId || null,
            institutionName: institutionName || 'Unknown',
            location: location || {}
        });

        await user.save();
        console.log('[Register] User created successfully');
        res.status(201).json({ message: "User registered", user });

    } catch (error) {
        console.error("[Register] Error:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            // This should rarely happen now, but just in case
            console.log('[Register] Duplicate key error, user likely already exists');
            return res.status(409).json({
                error: "User already exists",
                details: "This account is already registered."
            });
        }

        res.status(500).json({ error: "Registration failed", details: error.message });
    }
};

// Get Current User Profile
export const getProfile = async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: "UID required" });

        const user = await User.findOne({ uid }).populate('institutionId');
        if (!user) {
            // Return 200 with flag to avoid console 404 errors during fresh signup
            return res.json({ exists: false });
        }

        // Check subscription expiry
        if (user.isPremium && user.subscriptionExpiry && new Date() > new Date(user.subscriptionExpiry)) {
            user.isPremium = false;
            user.subscriptionExpiry = null;
            await user.save();
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Update User State (Last Active Path)
export const updateState = async (req, res) => {
    try {
        const { uid, lastActivePath } = req.body;

        // Basic validation
        if (!uid || !lastActivePath) {
            return res.status(400).json({ error: "UID and Path are required" });
        }

        // Update only the lastActivePath field
        await User.findOneAndUpdate(
            { uid },
            { lastActivePath },
            { new: true } // Return updated doc (optional, but good for debugging)
        );

        res.json({ success: true });
    } catch (error) {
        console.error("[Update State] Error:", error);
        res.status(500).json({ error: "Failed to update state" });
    }
};
