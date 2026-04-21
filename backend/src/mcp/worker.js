/**
 * Simple In-Memory Background Worker for MCP Tasks
 * In production, replace this with BullMQ/Redis
 */

class MCPWorker {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.interval = null;
    }

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => this.processQueue(), 5000); // Check every 5 seconds
        console.log("[MCP Worker] Started background worker");
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    addTask(taskName, payload) {
        this.queue.push({ taskName, payload, timestamp: Date.now() });
        console.log(`[MCP Worker] Task added: ${taskName}`);
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const task = this.queue.shift();

        try {
            console.log(`[MCP Worker] Processing task: ${task.taskName}`);

            // This is where we would switch on taskName and call appropriate tools/services
            // For now, we utilize the Event System to handle the actual logic if it's event-driven,
            // or directly call tools if it's a direct task.

            // Example:
            // if (task.taskName === 'GenerateWeeklyReport') { ... }

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`[MCP Worker] Finished task: ${task.taskName}`);

        } catch (error) {
            console.error(`[MCP Worker] Error processing task ${task.taskName}:`, error);
        } finally {
            this.processing = false;
            // Optionally process next immediately if queue not empty
            if (this.queue.length > 0) this.processQueue();
        }
    }
}

const worker = new MCPWorker();
export default worker;
