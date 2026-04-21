import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/copilot';

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const users = await User.find({}).select('email role location.city createdAt').lean();

        if (users.length === 0) {
            console.log('❌ No users found in the database.');
            console.log('\n💡 You need to create accounts by signing up at: http://localhost:5173/signup\n');
        } else {
            console.log(`📊 Found ${users.length} user(s) in the database:\n`);
            console.log('═'.repeat(80));

            const professors = users.filter(u => u.role === 'professor');
            const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin');
            const students = users.filter(u => u.role === 'student');

            if (professors.length > 0) {
                console.log('\n👨‍🏫 PROFESSORS:');
                professors.forEach((user, idx) => {
                    console.log(`  ${idx + 1}. Email: ${user.email || 'N/A'}`);
                    console.log(`     Location: ${user.location?.city || 'N/A'}`);
                    console.log(`     Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
                    console.log('');
                });
                console.log(`   ✅ You can login with any of these emails to access:`);
                console.log(`      http://localhost:5173/dashboard/professor\n`);
            } else {
                console.log('\n👨‍🏫 PROFESSORS: None found');
                console.log('   ⚠️  Create a professor account at: http://localhost:5173/signup\n');
            }

            if (admins.length > 0) {
                console.log('🏛️  ADMINS:');
                admins.forEach((user, idx) => {
                    console.log(`  ${idx + 1}. Email: ${user.email || 'N/A'}`);
                    console.log(`     Role: ${user.role}`);
                    console.log(`     Location: ${user.location?.city || 'N/A'}`);
                    console.log(`     Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
                    console.log('');
                });
                console.log(`   ✅ You can login with any of these emails to access:`);
                console.log(`      http://localhost:5173/dashboard/admin\n`);
            } else {
                console.log('🏛️  ADMINS: None found');
                console.log('   ⚠️  Create an admin account at: http://localhost:5173/signup\n');
            }

            if (students.length > 0) {
                console.log(`👨‍🎓 STUDENTS: ${students.length} found`);
                console.log(`   Access student dashboard at: http://localhost:5173/dashboard\n`);
            }

            console.log('═'.repeat(80));
            console.log('\n📝 Summary:');
            console.log(`   Professors: ${professors.length}`);
            console.log(`   Admins: ${admins.length}`);
            console.log(`   Students: ${students.length}`);
            console.log(`   Total Users: ${users.length}\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.');
    }
}

checkUsers();
