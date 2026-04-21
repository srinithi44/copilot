/**
 * MCP Tool Registry
 * Manages registration and discovery of tools for the AI agent.
 */

class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }

    /**
     * Register a new tool
     * @param {string} name - Unique name of the tool
     * @param {object} schema - JSON schema for the tool's input
     * @param {function} handler - Function to execute when tool is called
     * @param {string} description - Description of what the tool does
     */
    register(name, schema, handler, description) {
        if (this.tools.has(name)) {
            console.warn(`Tool ${name} is already registered. Overwriting.`);
        }
        this.tools.set(name, {
            name,
            schema,
            handler,
            description
        });
        console.log(`[MCP] Registered tool: ${name}`);
    }

    /**
     * Get a tool by name
     * @param {string} name 
     */
    getTool(name) {
        return this.tools.get(name);
    }

    /**
     * Get all tool definitions (for LLM context)
     */
    getToolDefinitions() {
        return Array.from(this.tools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.schema
        }));
    }

    /**
     * Execute a tool
     * @param {string} name 
     * @param {object} args 
     */
    async execute(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool ${name} not found`);
        }
        try {
            console.log(`[MCP] Executing ${name} with args:`, JSON.stringify(args));
            const result = await tool.handler(args);
            return result;
        } catch (error) {
            console.error(`[MCP] Error executing ${name}:`, error);
            throw error;
        }
    }
}

// Singleton instance
const registry = new ToolRegistry();
export default registry;
