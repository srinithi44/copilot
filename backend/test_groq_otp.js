// Test script for OTP email generation with Groq
import fetch from 'node-fetch';

const testEmail = 'studyplancopilot@gmail.com'; // Use verified email
const testOTP = '123456';

console.log('🧪 Testing OTP Email Generation with Groq API...\n');

async function testOTPEndpoint() {
    try {
        console.log(`📧 Sending OTP request to: http://localhost:5000/api/send-otp`);
        console.log(`   Email: ${testEmail}`);
        console.log(`   OTP: ${testOTP}\n`);

        const response = await fetch('http://localhost:5000/api/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                otp: testOTP,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS! OTP email sent successfully');
            console.log('📨 Response:', JSON.stringify(data, null, 2));
            console.log('\n✨ Groq AI successfully generated personalized email content!');
            console.log('📬 Check the email inbox for:', testEmail);
        } else {
            console.log('❌ FAILED! Error sending OTP');
            console.log('📨 Error Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.log('\n💡 Make sure the backend server is running on port 5000');
    }
}

testOTPEndpoint();
