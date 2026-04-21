
import AIService from '../services/AIService.js';

async function testPlan() {
    console.log("Testing Study Plan Generation...");
    try {
        const plan = await AIService.generateStudyPlan("test-user", {
            examDate: "2025-12-01",
            subjects: "Mathematics",
            goal: "Score 90%+",
            hoursPerDay: "2"
        }, "Sample syllabus content about Algebra and Geometry.");

        console.log("Plan Generated Successfully:", JSON.stringify(plan, null, 2));
    } catch (error) {
        console.error("Plan Generation Failed:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
    }
}

testPlan();
