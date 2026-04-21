/**
 * JSON Schemas for MCP Tools
 * Defines the input structure for each tool.
 */

export const getStudentMarksSchema = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            description: "The ID of the student to fetch marks for"
        },
        limit: {
            type: "number",
            description: "Max number of records to return",
            default: 10
        }
    },
    required: ["userId"]
};

export const detectWeakSubjectsSchema = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            description: "The ID of the student to analyze"
        },
        threshold: {
            type: "number",
            description: "The percentage score below which a subject is considered weak",
            default: 60
        }
    },
    required: ["userId"]
};

export const generateRecoveryPlanSchema = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            description: "The ID of the student"
        },
        subjects: {
            type: "array",
            items: { type: "string" },
            description: "List of subjects to create a plan for"
        },
        hoursAvailable: {
            type: "number",
            description: "Hours available per week for recovery",
            default: 5
        }
    },
    required: ["userId", "subjects"]
};

export const rescheduleTasksSchema = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            description: "The ID of the student"
        },
        reason: {
            type: "string",
            description: "Reason for rescheduling (e.g., 'sick', 'exam')"
        }
    },
    required: ["userId"]
};
