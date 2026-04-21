import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Set custom DNS server (Google DNS) for the internal resolver
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing MongoDB connection (with Custom DNS 8.8.8.8) to:', MONGO_URI);

async function testConnection() {
    try {
        console.log('Attempting to resolve SRV record manually...');
        const srv = await dns.promises.resolveSrv('_mongodb._tcp.cluster0.xbdbsto.mongodb.net');
        console.log('Resolved SRV Hostnames:', srv.map(s => s.name));
        
        console.log('Attempting to connect with Mongoose...');
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connection Successful!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error(err.message);
        process.exit(1);
    }
}

testConnection();
