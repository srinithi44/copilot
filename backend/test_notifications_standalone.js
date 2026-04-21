
import NotificationService from './src/services/NotificationService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testNotifications() {
    console.log("Testing Notification Service...");

    // 1. Test Email (Should use Resend if key exists)
    console.log("\n--- Testing Email ---");
    const emailResult = await NotificationService.sendEmail(
        "test@example.com",
        "Test Subject",
        "Test Message Body"
    );
    console.log("Email Result:", emailResult);

    // 2. Test SMS (Should simulate if no keys)
    console.log("\n--- Testing SMS ---");
    const smsResult = await NotificationService.sendSMS(
        "+1234567890",
        "Test SMS Message"
    );
    console.log("SMS Result:", smsResult);
}

testNotifications();
