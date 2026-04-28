import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env from current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log('Testing Email with Key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');

    // Use a hardcoded test email - likely the one the user is using or their own
    // We'll try to send to "nithish@example.com" (dummy) first to see the error,
    // or better, print a prompt.
    // Actually, I'll try to send to 'delivered@resend.dev' which is a special test address that ALWAYS succeeds
    // to verify API key validity.

    try {
        console.log('Attempting to send to farmoranindia@gmail.com...');
        const { data, error } = await resend.emails.send({
            from: 'StudyPlanCopilot <support@srinithi.online>',
            to: ['farmoranindia@gmail.com'],
            subject: 'Test Email',
            html: '<p>Test</p>'
        });

        if (error) {
            console.error('Test 1 Failed:', error);
        } else {
            console.log('Test 1 Success (API Key is valid):', data);
        }

    } catch (e) {
        console.error('Test 1 Exception:', e);
    }
}

testEmail();
