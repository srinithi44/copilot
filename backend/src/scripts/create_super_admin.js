import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const emailToPromote = process.argv[2];

if (!emailToPromote) {
    console.log("Usage: node src/scripts/create_super_admin.js <email>");
    process.exit(1);
}

async function promoteToSuperAdmin() {
    try {
        console.log(`🚀 Promoting ${emailToPromote} to Super Admin...`);
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({ email: emailToPromote });

        if (!user) {
            console.error(`❌ User with email ${emailToPromote} not found.`);
            process.exit(1);
        }

        user.role = 'super_admin';
        // Optional: give them points/trophies too
        user.points = 99999;
        user.level = 'Master';

        await user.save();
        console.log(`✅ Success! ${user.name} (${user.email}) is now a Super Admin.`);
        console.log("NOTE: You may need to re-login on the frontend for changes to take effect.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

promoteToSuperAdmin();
