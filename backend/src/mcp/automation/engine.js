import eventBus from './eventBus.js';
import { processAIDecision } from './aiDecision.js';

/**
 * Automation Engine
 * Listens for system events and triggers AI workflows.
 */
class AutomationEngine {
    constructor() {
        this.rules = [];
    }

    init() {
        console.log("[AutomationEngine] Initializing Rules...");

        // Rule 1: Marks Updated -> Check for Weak Subjects
        eventBus.subscribe('MARKS_UPDATED', async ({ userId, quizId, score, total }) => {
            const percentage = (score / total) * 100;
            console.log(`[AutomationEngine] Evaluating Rule: Low Marks Check (${percentage}%)`);

            if (percentage < 40) {
                console.log("[AutomationEngine] Triggering: Recovery Plan Generation");
                await processAIDecision(userId, 'MARKS_CRITICAL', { score, total, quizId });
            }
        });

        // Rule 2: Exam Added -> Reschedule
        eventBus.subscribe('EXAM_ADDED', async ({ userId, subject, date }) => {
            console.log("[AutomationEngine] Triggering: Schedule Adjustment");
            await processAIDecision(userId, 'EXAM_ADDED', { subject, date });
        });

        // Rule 3: Attendance Dropped -> Alert
        eventBus.subscribe('ATTENDANCE_DROPPED', async ({ userId, subject, percentage }) => {
            if (percentage < 75) {
                console.log("[AutomationEngine] Triggering: Attendance Alert");
                await processAIDecision(userId, 'ATTENDANCE_LOW', { subject, percentage });
            }
        });

        console.log("[AutomationEngine] Modules Loaded.");
    }
}

const engine = new AutomationEngine();
export default engine;
