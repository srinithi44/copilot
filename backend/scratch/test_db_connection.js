import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing MongoDB connection to:', MONGO_URI);

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        });
        console.log('✅ Connection Successful!');
        
        // Try a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        process.exit(1);
    }
}

testConnection();
