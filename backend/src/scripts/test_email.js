import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

const testEmail = async () => {
    console.log("Testing Resend with Key:", process.env.RESEND_API_KEY ? "EXISTS" : "MISSING");

    // Check if key starts with 're_'
    if (!process.env.RESEND_API_KEY?.startsWith('re_')) {
        console.error("INVALID API KEY FORMAT. Must start with 're_'.");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'StudyPlanCopilot <support@srinithi.online>',
            to: ['nithish@example.com'], // Replace with user's verified email if in test mode
            subject: 'Test Email from Debugger',
            html: '<p>If you see this, email sending works!</p>'
        });

        if (error) {
            console.error('Email Send Error:', error);
        } else {
            console.log('Email Sent Successfully:', data);
        }
    } catch (e) {
        console.error('Script Error:', e);
    }
};

testEmail();
