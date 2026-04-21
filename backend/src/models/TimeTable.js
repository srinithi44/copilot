import mongoose from 'mongoose';

const timeTableSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // We'll store a simple array of slots for simplicity
    schedule: [{
        day: {
            type: String,
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: {
            type: String, // HH:mm format
            required: true
        },
        endTime: {
            type: String, // HH:mm format
            required: true
        },
        subject: {
            type: String,
            required: true
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const TimeTable = mongoose.model('TimeTable', timeTableSchema);

export default TimeTable;
