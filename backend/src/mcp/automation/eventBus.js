import EventEmitter from 'events';

class AutomationEventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20); // Prevent memory leak warnings if we scale listeners
    }

    /**
     * Publish an event to the system
     * @param {string} eventName - Name of the event (e.g., 'MARKS_UPDATED')
     * @param {object} payload - Data associated with the event
     */
    publish(eventName, payload) {
        console.log(`[AutoEventBus] Publishing: ${eventName}`, payload?.userId ? `for User ${payload.userId}` : '');
        this.emit(eventName, payload);
    }

    /**
     * Subscribe to an event
     * @param {string} eventName 
     * @param {function} handler 
     */
    subscribe(eventName, handler) {
        this.on(eventName, async (payload) => {
            try {
                await handler(payload);
            } catch (error) {
                console.error(`[AutoEventBus] Error in handler for ${eventName}:`, error);
            }
        });
    }
}

// Singleton instance
const eventBus = new AutomationEventBus();
export default eventBus;
