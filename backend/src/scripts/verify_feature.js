import mongoose from 'mongoose';
import Institution from '../models/Institution.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create Institution
        console.log('Creating Test Institution...');
        let inst = await Institution.findOne({ name: 'Test University' });
        if (!inst) {
            inst = new Institution({
                name: 'Test University',
                country: 'India',
                state: 'Maharashtra',
                city: 'Mumbai',
                type: 'University'
            });
            await inst.save();
            console.log('Institution Created:', inst._id);
        } else {
            console.log('Institution Exists:', inst._id);
        }

        // 2. Create/Update User
        console.log('Updating Test User...');
        let user = await User.findOne({ uid: 'verify_user_1' });
        if (!user) {
            user = new User({
                uid: 'verify_user_1',
                email: 'test@example.com',
                role: 'teacher',
                institutionId: inst._id,
                location: { country: 'India', state: 'Maharashtra', city: 'Mumbai' }
            });
        } else {
            user.institutionId = inst._id;
        }
        await user.save();
        console.log('User Updated with Institution:', user.institutionId);

        // 3. Create Quiz (Simulate Controller Logic)
        console.log('Creating Quiz...');
        const quiz = new Quiz({
            userId: user.uid,
            institutionId: user.institutionId,
            title: 'Verification Quiz',
            difficulty: 'Easy',
            questions: [{
                question: 'Test Q?',
                options: ['A', 'B'],
                correctAnswer: 'A',
                explanation: 'Test'
            }]
        });
        await quiz.save();
        console.log('Quiz Created:', quiz._id);

        // 4. Verify Filtering
        console.log('Verifying Quiz Filtering...');
        // Match
        const match = await Quiz.find({ institutionId: inst._id });
        console.log(`Quizzes found for Institution ${inst.name}:`, match.length);

        // No Match
        const noMatch = await Quiz.find({ institutionId: new mongoose.Types.ObjectId() });
        console.log(`Quizzes found for Random Institution:`, noMatch.length);

        if (match.length > 0 && noMatch.length === 0) {
            console.log('✅ VERIFICATION PASSED');
        } else {
            console.log('❌ VERIFICATION FAILED');
        }

    } catch (error) {
        console.error('Verification Error:', error);
        // Write to error file for debugging
        import('fs').then(fs => fs.writeFileSync('verification_error.txt', error.toString()));
    } finally {
        await mongoose.disconnect();
    }
};

verify();
