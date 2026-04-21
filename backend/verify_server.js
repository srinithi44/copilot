import fetch from 'node-fetch';

async function verifyServer() {
    try {
        const response = await fetch('http://localhost:5000/api/ai/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: "test_verification",
                examDate: "2026-05-01",
                subjects: "Biology",
                goal: "Pass",
                hoursPerDay: 4
            })
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Connection failed:", e.message);
    }
}

verifyServer();
