import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// .env is in the parent directory c:\Copilot\copilot\backend
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkUserEmail() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        
        console.log('Users in database:');
        users.forEach(u => console.log(`- ID: ${u._id}, Email: ${u.email}`));
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUserEmail();
