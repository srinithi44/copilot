import EventEmitter from 'events';
import registry from './registry.js';

class MCPEventManager extends EventEmitter {
    constructor() {
        super();
        this.setupListeners();
    }

    setupListeners() {
        // Event: Marks Updated -> Trigger Weak Subject Detection
        this.on('MARKS_UPDATED', async ({ userId, quizId, score }) => {
            console.log(`[MCP Event] MARKS_UPDATED for User: ${userId}`);

            try {
                // 1. Detect Weak Subjects
                const weakSubjectsResult = await registry.execute('detectWeakSubjects', { userId });

                if (weakSubjectsResult.weakSubjects.length > 0) {
                    console.log(`[MCP Event] Weak subjects detected: ${weakSubjectsResult.weakSubjects.map(s => s.subject).join(', ')}`);

                    // 2. Trigger automated recovery plan generation (Background Task)
                    this.emit('TRIGGER_RECOVERY_PLAN', {
                        userId,
                        subjects: weakSubjectsResult.weakSubjects.map(s => s.subject)
                    });
                }
            } catch (error) {
                console.error("[MCP Event Error]", error);
            }
        });

        // Event: Trigger Recovery Plan -> Run the tool
        this.on('TRIGGER_RECOVERY_PLAN', async ({ userId, subjects }) => {
            console.log(`[MCP Event] Generating Recovery Plan for ${userId}`);
            try {
                const plan = await registry.execute('generateRecoveryPlan', { userId, subjects, hoursAvailable: 5 });
                console.log("[MCP Event] Recovery Plan Generated:", JSON.stringify(plan, null, 2));
                // TODO: Save this plan to DB or notify user via NotificationService
            } catch (error) {
                console.error("[MCP Event Error] Recovery Plan Generation Failed", error);
            }
        });

        // Event: Exam Added -> Reschedule Tasks
        this.on('EXAM_ADDED', async ({ userId, examDate, subject }) => {
            console.log(`[MCP Event] EXAM_ADDED for ${userId}: ${subject} on ${examDate}`);
            try {
                const result = await registry.execute('rescheduleTasks', { userId, reason: `Exam added for ${subject}` });
                console.log("[MCP Event] Reschedule Result:", result);
            } catch (error) {
                console.error("[MCP Event Error] Rescheduling Failed", error);
            }
        });
    }
}

const mcpEvents = new MCPEventManager();
export default mcpEvents;
