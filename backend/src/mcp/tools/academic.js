import StudyGoal from '../../models/StudyGoal.js';
import TimeTable from '../../models/TimeTable.js';

/**
 * Generate a recovery plan for weak subjects
 * NOTE: In a full system, this might call an LLM again, but for this tool function
 * we return a structured object that the *calling* AI can communicate to the user,
 * or save to the DB.
 */
export async function generateRecoveryPlan({ userId, subjects, hoursAvailable }) {
    // Logic: Distribute available hours among weak subjects
    const hoursPerSubject = hoursAvailable / subjects.length;

    // Helper to get Monday of current week
    const getMonday = (d) => {
        d = new Date(d);
        const day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };
    const weekStart = getMonday(new Date());

    const plan = [];

    for (const subject of subjects) {
        const suggestedHours = Math.floor(hoursPerSubject * 10) / 10;

        // Persist to DB
        await StudyGoal.findOneAndUpdate(
            { userId, subject, weekStartDate: weekStart },
            {
                $set: { weeklyTargetHours: suggestedHours },
                $setOnInsert: { completedHours: 0 }
            },
            { upsert: true, new: true }
        );

        plan.push({
            subject,
            suggestedHours,
            focusAreas: ["Review recent quizzes", "Read chapter summaries", "Practice key terms"]
        });
    }

    return {
        userId,
        plan,
        totalHoursScheduled: hoursAvailable,
        message: "Recovery plan generated and saved to your Study Goals."
    };
}

/**
 * Reschedule tasks based on reason
 */
export const rescheduleTasks = async ({ reason, currentSchedule, userId }) => {
    try {
        console.log(`[MCP-Academic] Rescheduling tasks for User: ${userId} due to: ${reason}`);

        if (!userId) {
            throw new Error("UserId is missing in rescheduleTasks");
        }

        let timetable = await TimeTable.findOne({ userId });

        if (!timetable) {
            console.log("[MCP-Academic] No timetable found, creating new one.");
            timetable = new TimeTable({
                userId,
                schedule: [
                    { day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'General Study' },
                    { day: 'Wednesday', startTime: '09:00', endTime: '10:00', subject: 'General Study' },
                    { day: 'Friday', startTime: '09:00', endTime: '10:00', subject: 'General Study' }
                ]
            });
        } else {
            console.log(`[MCP-Academic] Found existing timetable with ${timetable.schedule.length} slots.`);
        }

        const subjectMatch = reason.match(/for (.*?) on/);
        const subject = subjectMatch ? subjectMatch[1] : 'General';

        console.log(`[MCP-Academic] Identifying slot for ${subject} Revision.`);

        // Detect if revision slot already exists
        const exists = timetable.schedule.find(s => s.subject.includes(subject) && s.subject.includes('Revision'));
        if (exists) {
            console.log(`[MCP-Academic] Revision slot for ${subject} already exists. Skipping.`);
            return `Schedule already optimized for ${subject}.`;
        }

        // Logic: Add to Saturday if not present, else Sunday
        const satSlotData = { day: 'Saturday', startTime: '10:00', endTime: '12:00', subject: `${subject} Revision` };

        // Check if Sat 10-12 is free (basic check)
        const isSatTaken = timetable.schedule.some(s => s.day === 'Saturday' && s.startTime === '10:00');

        if (!isSatTaken) {
            console.log("[MCP-Academic] Adding Revision to Saturday 10:00");
            timetable.schedule.push(satSlotData);
        } else {
            console.log("[MCP-Academic] Saturday taken, adding to Sunday 10:00");
            timetable.schedule.push({ day: 'Sunday', startTime: '10:00', endTime: '12:00', subject: `${subject} Revision` });
        }

        // Mark as modified if using findOne (Mongoose sometimes needs this for arrays)
        timetable.markModified('schedule');

        const saved = await timetable.save();
        console.log(`[MCP-Academic] Timetable saved. Total slots: ${saved.schedule.length}`);

        return `Prioritized ${subject} revision in your schedule for this weekend.`;
    } catch (error) {
        console.error("[MCP-Academic] Error in rescheduleTasks:", error);
        return "Failed to reschedule tasks due to internal error.";
    }
};

/**
 * Generate a quiz from syllabus
 */
export async function generateQuizFromSyllabus({ topic, difficulty, questionCount = 5 }) {
    // Mock logic - in a real app, this would call the LLM to generate questions
    const questions = [];
    for (let i = 1; i <= questionCount; i++) {
        questions.push({
            id: i,
            question: `Sample question ${i} about ${topic} (${difficulty})`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A"
        });
    }

    return {
        topic,
        difficulty,
        questions,
        message: `Generated ${questionCount} questions for ${topic}`
    };
}
