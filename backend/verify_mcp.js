import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { initMCP, handleAIRequest, mcpEvents, worker } from './src/mcp/index.js';
import Score from './src/models/Score.js';
import User from './src/models/User.js';

dotenv.config();

const logFile = './verify_mcp.log';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function runTest() {
    log("=== Starting MCP Verification ===");

    // 1. Connect to DB
    try {
        log("Connecting to DB...");
        // Ensure MONGO_URI is available
        if (!process.env.MONGO_URI) {
            log("ERROR: MONGO_URI is missing from environment variables.");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        log("DB Connected");
    } catch (err) {
        log("DB Connection Failed: " + err.message);
        process.exit(1);
    }

    // 2. Init MCP
    initMCP();
    log("MCP Initialized");

    // 3. Test Direct AI Request (Mock)
    log("\n--- Testing 'handleAIRequest' ---");

    // We try to find a user, or use a mock ID
    const user = await User.findOne();
    const userId = user ? user.uid : "test-uid";
    log(`Using User ID: ${userId}`);

    const response = await handleAIRequest(userId, "I need a plan for my weak subjects");
    log("AI Response: " + JSON.stringify(response, null, 2));

    // 4. Test Event System
    log("\n--- Testing Event System ---");
    log("Emitting MARKS_UPDATED event...");
    // Mock user ID needs to be valid ObjectId for Score/QuizAttempt if tools use it that way
    // But our mock tools logic for 'detectWeakSubjects' queries QuizAttempt with 'userId' string

    mcpEvents.emit('MARKS_UPDATED', { userId: userId, quizId: 'test-quiz', score: 30 });

    // Wait for async background work
    log("Waiting for events to process...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    log("\n=== Verification Complete ===");

    // Stop worker to allow clean exit
    worker.stop();
    await mongoose.disconnect();
    process.exit(0);
}

// Clear log file
try { fs.unlinkSync(logFile); } catch (e) { }

runTest().catch(err => {
    log("Unhandled Error: " + err);
    process.exit(1);
});
