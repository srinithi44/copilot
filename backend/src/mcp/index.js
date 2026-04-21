import registry from './registry.js';
import mcpEvents from './events.js';
import worker from './worker.js';
import * as schemas from './schema.js';
import { getStudentMarks, detectWeakSubjects } from './tools/studentData.js';
import { generateRecoveryPlan, rescheduleTasks, generateQuizFromSyllabus } from './tools/academic.js';

/**
 * Initialize MCP Service
 * Registers tools and starts workers
 */
export function initMCP() {
    console.log("[MCP] Initializing Model Context Protocol Layer...");

    // 1. Register Tools
    registry.register('getStudentMarks', schemas.getStudentMarksSchema, getStudentMarks, 'Get recent quiz marks for a student');
    registry.register('detectWeakSubjects', schemas.detectWeakSubjectsSchema, detectWeakSubjects, 'Analyze student performance to find weak subjects');
    registry.register('generateRecoveryPlan', schemas.generateRecoveryPlanSchema, generateRecoveryPlan, 'Generate a study plan for weak subjects');
    registry.register('rescheduleTasks', schemas.rescheduleTasksSchema, rescheduleTasks, 'Reschedule study tasks based on new events');
    registry.register('generateQuizFromSyllabus', schemas.generateQuizFromSyllabusSchema, generateQuizFromSyllabus, 'Generate a quiz based on a topic');

    // 2. Start Background Worker
    worker.start();

    console.log("[MCP] Initialization Complete. Tools Registered:", registry.getToolDefinitions().map(t => t.name).join(', '));
}

/**
 * Handle AI Request
 * Takes a user query, interacts with LLM (mocked or real), and executes tools.
 * Implements a loop mechanism to prevent infinite cycles.
 */
export async function handleAIRequest(userId, userQuery, maxIterations = 5) {
    // 1. Get Tool Definitions
    const tools = registry.getToolDefinitions();

    // In a real generic implementation, this would be a loop:
    // while (iterations < maxIterations) { calls LLM -> gets actions -> executes -> feeds back }

    let iterations = 0;

    console.log(`[MCP AI] Reasoning for: "${userQuery}"`);

    // SAFEGUARD: Infinite Loop Prevention
    if (iterations >= maxIterations) {
        return { text: "I'm thinking too hard without a solution. Let's try a different question." };
    }

    // MOCK AI DECISION LOGIC
    let response = { text: "I'm not sure how to help with that." };

    try {
        if (userQuery.toLowerCase().includes("marks") || userQuery.toLowerCase().includes("score")) {
            const marks = await registry.execute('getStudentMarks', { userId });
            response = {
                text: `Here are your recent marks: ${marks.map(m => `${m.subject}: ${m.score}/${m.totalQuestions}`).join(', ')}`,
                data: marks
            };
        } else if (userQuery.toLowerCase().includes("plan") || userQuery.toLowerCase().includes("weak")) {
            const weak = await registry.execute('detectWeakSubjects', { userId });
            if (weak.weakSubjects.length > 0) {
                const subjects = weak.weakSubjects.map(s => s.subject);
                const plan = await registry.execute('generateRecoveryPlan', { userId, subjects });
                response = {
                    text: `I detected weak performance in ${subjects.join(', ')}. Here is a recovery plan: ${plan.message}`,
                    data: plan
                };
            } else {
                response = { text: "Your performance looks good! No weak subjects detected." };
            }
        } else if (userQuery.toLowerCase().includes("quiz") || userQuery.toLowerCase().includes("generate")) {
            const topic = userQuery.split("quiz")[1]?.trim() || "General Knowledge";
            const quiz = await registry.execute('generateQuizFromSyllabus', { topic, difficulty: "medium" });
            response = {
                text: `I've generated a quiz on ${topic}. Valid options: ${quiz.questions[0].options.join(', ')}`,
                data: quiz
            };
        }
    } catch (error) {
        console.error("AI processing error:", error);
        response = { text: "I encountered an error processing your request." };
    }

    return response;
}

export { registry, mcpEvents, worker };
