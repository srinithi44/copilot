import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['School', 'College', 'University'],
        default: 'University'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for efficient location filtering
institutionSchema.index({ country: 1, state: 1, city: 1 });

const Institution = mongoose.model('Institution', institutionSchema);

export default Institution;
