import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Institution from '../models/Institution.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const institutions = [
    {
        name: 'Anna University',
        country: 'India',
        state: 'Tamil Nadu',
        city: 'Chennai',
        type: 'University'
    },
    {
        name: 'IIT Madras',
        country: 'India',
        state: 'Tamil Nadu',
        city: 'Chennai',
        type: 'University'
    },
    {
        name: 'Stanford University',
        country: 'USA',
        state: 'California',
        city: 'Stanford',
        type: 'University'
    },
    {
        name: 'PSG College of Technology',
        country: 'India',
        state: 'Tamil Nadu',
        city: 'Coimbatore',
        type: 'College'
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Institution.deleteMany({});
        console.log('Cleared existing institutions');

        await Institution.insertMany(institutions);
        console.log('Seeded institutions');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
