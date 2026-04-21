import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Institution from '../models/Institution.js'; // Adjust path as needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Connection Error:', error);
        process.exit(1);
    }
};

const seedInstitutions = async () => {
    await connectDB();

    const institutions = [
        { name: "IIT Bombay", country: "India", state: "Maharashtra", city: "Mumbai", type: "University" },
        { name: "Mumbai University", country: "India", state: "Maharashtra", city: "Mumbai", type: "University" },
        { name: "Pune University", country: "India", state: "Maharashtra", city: "Pune", type: "University" },
        { name: "IISc Bangalore", country: "India", state: "Karnataka", city: "Bangalore", type: "University" },
        { name: "Delhi University", country: "India", state: "Delhi", city: "New Delhi", type: "University" },
        { name: "Anna University", country: "India", state: "Tamil Nadu", city: "Chennai", type: "University" },
        { name: "UCLA", country: "USA", state: "California", city: "Los Angeles", type: "University" },
        { name: "USC", country: "USA", state: "California", city: "Los Angeles", type: "University" },
        { name: "Stanford", country: "USA", state: "California", city: "San Francisco", type: "University" }, // Close enough for demo
        { name: "NYU", country: "USA", state: "New York", city: "New York City", type: "University" },
        { name: "UT Austin", country: "USA", state: "Texas", city: "Austin", type: "University" }
    ];

    try {
        // Optional: clear existing to avoid duplicates if running multiple times
        // await Institution.deleteMany({}); 

        for (const inst of institutions) {
            const exists = await Institution.findOne({ name: inst.name, city: inst.city });
            if (!exists) {
                await Institution.create(inst);
                console.log(`Created: ${inst.name}`);
            } else {
                console.log(`Skipped: ${inst.name} (Exists)`);
            }
        }

        console.log('Seeding Complete');
    } catch (error) {
        console.error('Seeding Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedInstitutions();
