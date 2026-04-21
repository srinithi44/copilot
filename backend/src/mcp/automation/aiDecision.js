import registry from '../registry.js';
import Notification from '../../models/Notification.js';

/**
 * Headless AI Decision Maker
 * Takes an event context, decides on tools, and executes them.
 * 
 * @param {string} userId 
 * @param {string} triggerType - 'MARKS_CRITICAL', 'EXAM_ADDED', etc.
 * @param {object} contextData - Data relevant to the event
 */
export async function processAIDecision(userId, triggerType, contextData) {
    console.log(`[AI-Auto] Processing ${triggerType} for ${userId}`);

    try {
        if (triggerType === 'MARKS_CRITICAL') {
            // STEP 1: Detect specific weak areas
            const weakAnalysis = await registry.execute('detectWeakSubjects', { userId, threshold: 40 });

            if (weakAnalysis.weakSubjects.length > 0) {
                // STEP 2: Generate Plan
                const subjects = weakAnalysis.weakSubjects.map(s => s.subject);
                const plan = await registry.execute('generateRecoveryPlan', { userId, subjects });

                // STEP 3: Notify
                const msg = `Computed recovery plan for: ${subjects.join(', ')}`;
                console.log(`[AI-Auto] ACTION TAKEN: ${msg}`);

                await Notification.create({
                    userId,
                    title: "AI Copilot Action",
                    message: "I detected low marks. A recovery plan has been generated for you.",
                    type: 'ai_action'
                });
            }
        }

        else if (triggerType === 'EXAM_ADDED') {
            // STEP 1: Reschedule
            const result = await registry.execute('rescheduleTasks', {
                userId,
                reason: `Exam added for ${contextData.subject} on ${contextData.date}`
            });

            const msg = `Rescheduled tasks due to ${contextData.subject} exam.`;
            console.log(`[AI-Auto] ACTION TAKEN: ${msg}`);

            await Notification.create({
                userId,
                title: "Schedule Updated",
                message: `I optimized your schedule for the upcoming ${contextData.subject} exam.`,
                type: 'ai_action'
            });
        }

        else if (triggerType === 'ATTENDANCE_LOW') {
            console.log(`[AI-Auto] ACTION TAKEN: Sent alert for low attendance in ${contextData.subject}`);

            await Notification.create({
                userId,
                title: "Attendance Alert",
                message: `Warning: Your attendance in ${contextData.subject} is below 75%.`,
                type: 'warning'
            });
        }

    } catch (error) {
        console.error(`[AI-Auto] Error processing decision for ${triggerType}:`, error);
    }
}
