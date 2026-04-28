import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: 'Student'
    },
    role: {
        type: String,
        enum: ['student', 'professor', 'admin', 'super_admin'],
        default: 'student'
    },
    institutionId: {
        type: String, // Changed from ObjectId to String to support Google Place IDs
        required: false,
        default: null
    },
    institutionName: {
        type: String,
        default: 'Unknown'
    },
    location: {
        country: String,
        state: String,
        city: String
    },
    phoneNumber: {
        type: String,
        default: null
    },
    notificationPreferences: {
        enableEmail: {
            type: Boolean,
            default: true
        },
        enableSMS: {
            type: Boolean,
            default: false
        },
        preferredTime: {
            type: String,
            default: '09:00'
        },
        subjects: {
            type: [String],
            default: []
        }
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    subscriptionId: {
        type: String,
        default: null
    },
    paymentId: {
        type: String,
        default: null
    },
    subscriptionExpiry: {
        type: Date,
        default: null
    },
    points: {
        type: Number,
        default: 0
    },
    level: {
        type: String,
        default: "Beginner"
    },
    trophies: [{
        name: String,
        icon: String,
        awardedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActivePath: {
        type: String,
        default: '/dashboard'
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);

export default User;
