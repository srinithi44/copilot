import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fixUserEmail() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const result = await db.collection('users').updateOne(
            { email: 'farmoraindia@gmail.com' },
            { $set: { email: 'farmoranindia@gmail.com' } }
        );
        
        if (result.modifiedCount > 0) {
            console.log('Successfully updated email from farmoraindia@gmail.com to farmoranindia@gmail.com');
        } else {
            console.log('No user found with email farmoraindia@gmail.com or email already updated.');
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fixUserEmail();
