import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate personalized OTP email content using Groq AI
 * @param {string} email - User's email address
 * @param {string} otp - The OTP code to include
 * @returns {Promise<{subject: string, html: string}>} Email subject and HTML content
 */
export async function generateOTPEmailContent(email, otp) {
    try {
        const prompt = `Generate a professional, friendly, and secure-looking HTML email for an OTP verification code. 

Email recipient: ${email}
OTP Code: ${otp}

Requirements:
1. Create a modern, visually appealing HTML email template
2. Use a clean design with StudyPlanCopilot branding (primary color: #FAB400 - golden yellow)
3. Make the OTP code prominently displayed and easy to read
4. Include security tips (don't share code, expires in 10 minutes)
5. Add a friendly, encouraging message for students
6. Keep it professional but warm in tone
7. Include proper HTML structure with inline CSS for email compatibility

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "subject": "Your StudyPlanCopilot Verification Code",
  "html": "<complete HTML email content here>"
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert email designer creating professional, secure OTP verification emails. Always return valid JSON only, no markdown formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2000,
        });

        const responseText = completion.choices[0]?.message?.content?.trim();

        if (!responseText) {
            throw new Error('Empty response from Groq');
        }

        // Parse the JSON response
        const emailContent = JSON.parse(responseText);

        // Validate the response structure
        if (!emailContent.subject || !emailContent.html) {
            throw new Error('Invalid response structure from Groq');
        }

        return emailContent;

    } catch (error) {
        console.error('Groq API Error:', error);

        // Fallback to a default template if Groq fails
        return {
            subject: 'Your StudyPlanCopilot Verification Code',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fb;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fb; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #FAB400 0%, #E5A500 100%); padding: 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #1A1A1A; font-size: 28px; font-weight: 800;">StudyPlan<span style="color: #ffffff;">Copilot</span></h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="margin: 0 0 20px 0; color: #1A1A1A; font-size: 24px; font-weight: 700;">Verify Your Account</h2>
                                            <p style="margin: 0 0 20px 0; color: #6B7280; font-size: 16px; line-height: 1.6;">
                                                Welcome to StudyPlanCopilot! 🎓 Use the verification code below to complete your sign-in:
                                            </p>
                                            
                                            <!-- OTP Box -->
                                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                                <tr>
                                                    <td align="center" style="background-color: #FFF9E6; border: 2px dashed #FAB400; border-radius: 12px; padding: 30px;">
                                                        <div style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #1A1A1A; font-family: 'Courier New', monospace;">
                                                            ${otp}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Security Notice -->
                                            <div style="background-color: #F3F4F6; border-left: 4px solid #FAB400; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                                                    🔒 <strong>Security Tip:</strong> This code expires in 10 minutes. Never share it with anyone, even StudyPlanCopilot staff.
                                                </p>
                                            </div>
                                            
                                            <p style="margin: 20px 0 0 0; color: #9CA3AF; font-size: 14px; line-height: 1.5;">
                                                If you didn't request this code, please ignore this email or contact support if you have concerns.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #F9FAFB; padding: 20px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                                            <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                                © ${new Date().getFullYear()} StudyPlanCopilot. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };
    }
}

export default {
    generateOTPEmailContent
};
