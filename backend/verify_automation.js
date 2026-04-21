import eventBus from './src/mcp/automation/eventBus.js';
import engine from './src/mcp/automation/engine.js';
import registry from './src/mcp/registry.js';
import * as schemas from './src/mcp/schema.js';
import { getStudentMarks, detectWeakSubjects } from './src/mcp/tools/studentData.js';
import { generateRecoveryPlan, rescheduleTasks, generateQuizFromSyllabus } from './src/mcp/tools/academic.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

import StudyGoal from './src/models/StudyGoal.js';
import TimeTable from './src/models/TimeTable.js';

async function verifyAutomation() {
    console.log("=== Verifying Automation System ===");
    await connectDB();

    // 1. Init Tools (Engine needs them for AI Decision)
    registry.register('getStudentMarks', schemas.getStudentMarksSchema, getStudentMarks, 'Get marks');
    registry.register('detectWeakSubjects', schemas.detectWeakSubjectsSchema, detectWeakSubjects, 'Detect weak');
    registry.register('generateRecoveryPlan', schemas.generateRecoveryPlanSchema, generateRecoveryPlan, 'Recovery plan');
    registry.register('rescheduleTasks', schemas.rescheduleTasksSchema, rescheduleTasks, 'Reschedule');

    // 2. Init Engine
    engine.init();

    // 3. Simulate MARKS_UPDATED (Low Score)
    console.log("\n--- TRIGER: MARKS_UPDATED (Score 30%) ---");
    eventBus.publish('MARKS_UPDATED', {
        userId: '507f1f77bcf86cd799439011',
        quizId: '507f1f77bcf86cd799439012',
        score: 30,
        total: 100
    });

    // 4. Simulate EXAM_ADDED
    console.log("\n--- TRIGGER: EXAM_ADDED ---");
    eventBus.publish('EXAM_ADDED', {
        userId: '507f1f77bcf86cd799439011',
        subject: 'Physics',
        date: '2025-12-01'
    });

    console.log("\nWaiting for async processing...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("\n--- VERIFYING PERSISTENCE ---");

    // Check Goals
    const goals = await StudyGoal.find({ userId: '507f1f77bcf86cd799439011' });
    console.log(`Study Goals Created: ${goals.length}`);
    if (goals.length > 0) {
        console.log(`- Goal 1: ${goals[0].subject} (${goals[0].weeklyTargetHours} hours)`);
        console.log("✅ Recovery Plan Persisted");
    } else {
        console.log("❌ Recovery Plan NOT Persisted");
    }

    // Check TimeTable
    const timetable = await TimeTable.findOne({ userId: '507f1f77bcf86cd799439011' });
    if (timetable && timetable.schedule.some(s => s.subject.includes('Revision'))) {
        console.log(`- TimeTable Updated with: ${timetable.schedule.find(s => s.subject.includes('Revision')).subject}`);
        console.log("✅ Schedule Adjustment Persisted");
    } else {
        console.log("❌ Schedule Adjustment NOT Persisted");
    }

    console.log("=== Verification Complete ===");
    process.exit(0);
}

verifyAutomation().catch(err => {
    console.error(err);
    process.exit(1);
});
