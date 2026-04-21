
import axios from 'axios';

async function testCopilotAPI() {
    console.log("Testing StudyPlan Copilot API...");
    try {
        const response = await axios.post('http://localhost:5000/api/copilot/chat', {
            message: "Explain the concept of photosynthesis in simple terms.",
            language: "English",
            subject: "Biology"
        });

        console.log("\n--- API Response ---");
        console.log(response.data.response);
        console.log("--------------------");
        console.log("Success: true");
    } catch (error) {
        console.error("API Test Failed:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error(error.message);
        }
    }
}

testCopilotAPI();
