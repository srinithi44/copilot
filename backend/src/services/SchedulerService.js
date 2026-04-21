import cron from 'node-cron';
import StreakCheckerService from './StreakCheckerService.js';

class SchedulerService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Initialize all scheduled tasks
     */
    init() {
        console.log('[Scheduler] Initializing scheduled tasks...');

        // Run streak check daily at 9 AM
        // Cron format: minute hour day month weekday
        // '0 9 * * *' = Every day at 9:00 AM
        const streakCheckJob = cron.schedule('0 9 * * *', async () => {
            console.log('[Scheduler] Running daily streak check...');
            try {
                await StreakCheckerService.checkAllStreaks();
            } catch (error) {
                console.error('[Scheduler] Error in streak check job:', error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata" // Adjust to your timezone
        });

        this.jobs.push({ name: 'Daily Streak Check', job: streakCheckJob });

        // Optional: Run a check every 3 hours for users who prefer different times
        const frequentCheckJob = cron.schedule('0 */3 * * *', async () => {
            console.log('[Scheduler] Running periodic streak check...');
            try {
                await StreakCheckerService.checkAllStreaks();
            } catch (error) {
                console.error('[Scheduler] Error in periodic streak check:', error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });

        this.jobs.push({ name: 'Periodic Streak Check', job: frequentCheckJob });

        console.log(`[Scheduler] ${this.jobs.length} jobs scheduled successfully`);
    }

    /**
     * Stop all scheduled jobs
     */
    stopAll() {
        console.log('[Scheduler] Stopping all scheduled jobs...');
        this.jobs.forEach(({ name, job }) => {
            job.stop();
            console.log(`[Scheduler] Stopped: ${name}`);
        });
    }

    /**
     * Get status of all jobs
     */
    getStatus() {
        return this.jobs.map(({ name, job }) => ({
            name,
            running: job.running || false
        }));
    }
}

export default new SchedulerService();
