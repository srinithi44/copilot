import axios from 'axios';
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';

const MOCK_USERS = [
    { uid: 'u1', name: 'Alice', points: 1500, location: { country: 'India', state: 'Tamil Nadu' } },
    { uid: 'u2', name: 'Bob', points: 800, location: { country: 'USA', state: 'California' } },
    { uid: 'u3', name: 'Charlie', points: 1200, location: { country: 'India', state: 'Karnataka' } },
    { uid: 'u4', name: 'David', points: 300, location: { country: 'India', state: 'Tamil Nadu' } },
    { uid: 'u5', name: 'Eve', points: 2000, location: { country: 'UK', state: 'London' } }
];

async function verifyLeaderboard() {
    try {
        console.log('🚀 Starting Leaderboard Verification...');

        // 1. Connect DB (to seed data directly)
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for seeding.');

        // 2. Seed Users
        console.log('🌱 Seeding mock users...');
        for (const u of MOCK_USERS) {
            await User.findOneAndUpdate(
                { uid: u.uid },
                {
                    ...u,
                    email: `${u.uid}@example.com`,
                    level: u.points > 1000 ? 'Master' : 'Beginner', // Simple mock logic
                    trophies: []
                },
                { upsert: true, new: true }
            );
        }
        console.log('✅ Seeding complete.');

        // 3. Test Global Leaderboard
        console.log('\n🌍 Testing Global Leaderboard (Expected: Eve > Alice > Charlie > Bob > David)');
        const globalRes = await axios.get(`${API_URL}/gamification/leaderboard?type=global`);
        const globalRanking = globalRes.data.leaderboard.map(u => `${u.name} (${u.points})`);
        console.log('Result:', globalRanking.join(' > '));

        if (globalRanking[0].includes('Eve')) {
            console.log('✅ Global Rank 1 matches expected.');
        } else {
            console.log('❌ Global Ranking mismatch.');
        }

        // 4. Test Country Leaderboard (India)
        console.log('\n🇮🇳 Testing Country Leaderboard (India) (Expected: Alice > Charlie > David)');
        const countryRes = await axios.get(`${API_URL}/gamification/leaderboard?type=country&country=India`);
        const countryRanking = countryRes.data.leaderboard.map(u => `${u.name} (${u.points})`);
        console.log('Result:', countryRanking.join(' > '));

        if (countryRanking.length === 3 && countryRanking[0].includes('Alice')) {
            console.log('✅ Country Filtering works.');
        } else {
            console.log('❌ Country Filtering failed.');
        }

        // 5. Test State Leaderboard (Tamil Nadu)
        console.log('\n🗺️ Testing State Leaderboard (Tamil Nadu) (Expected: Alice > David)');
        const stateRes = await axios.get(`${API_URL}/gamification/leaderboard?type=state&state=Tamil Nadu`);
        const stateRanking = stateRes.data.leaderboard.map(u => `${u.name} (${u.points})`);
        console.log('Result:', stateRanking.join(' > '));

        if (stateRanking.length === 2 && stateRanking[0].includes('Alice')) {
            console.log('✅ State Filtering works.');
        } else {
            console.log('❌ State Filtering failed.');
        }

        // Cleanup (Optional: remove mock users)
        // await User.deleteMany({ uid: { $in: MOCK_USERS.map(u => u.uid) } });

        console.log('\n🎉 Leaderboard Verification Complete!');
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
        if (error.response) console.error(error.response.data);
        process.exit(1);
    }
}

verifyLeaderboard();
