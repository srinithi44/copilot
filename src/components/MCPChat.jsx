import React, { useState, useRef, useEffect } from 'react';
import { sendMCPMessage } from '../services/mcpService';
import { useAuth } from "../contexts/AuthContext";
// Assuming AuthContext exists
import { FiMessageSquare, FiX, FiSend, FiCpu } from 'react-icons/fi';
import '../styles/MCPChat.css'; // We'll create this next

const MCPChat = () => {
    const { user } = useAuth(); // Get current user
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Hello! I am your Study Copilot. Ask me about your marks, weak subjects, or to generate a quiz!' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            // Call MCP Backend
            const userId = user?.uid || 'guest';
            const result = await sendMCPMessage(userId, userMsg.text);

            if (result.success) {
                const aiResponse = result.response;
                const aiMsg = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: aiResponse.text,
                    data: aiResponse.data // Structured data from tool
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Sorry, I encountered an error.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Network error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Render structured data from tools
    const renderData = (data) => {
        if (!data) return null;

        // Recovery Plan
        if (data.plan) {
            return (
                <div className="mcp-card">
                    <h4>Recovery Plan Needed</h4>
                    <ul>
                        {data.plan.map((item, idx) => (
                            <li key={idx}>
                                <strong>{item.subject}</strong>: {item.suggestedHours} hrs/week
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        // Quiz
        if (data.questions) {
            return (
                <div className="mcp-card">
                    <h4>{data.difficulty} Quiz: {data.topic}</h4>
                    <p>{data.questions.length} questions generated.</p>
                    <button className="mcp-btn" onClick={() => alert("Starting Quiz Feature (Coming Soon)")}>Start Quiz</button>
                </div>
            );
        }

        // Marks
        if (Array.isArray(data) && data[0]?.source === 'QuizAttempt') {
            return (
                <div className="mcp-card">
                    <h4>Recent Marks</h4>
                    <ul>
                        {data.map((m, idx) => (
                            <li key={idx}>{m.subject}: {m.score}/{m.totalQuestions}</li>
                        ))}
                    </ul>
                </div>
            );
        }

        return <pre className="mcp-json">{JSON.stringify(data, null, 2)}</pre>;
    };

    if (!isOpen) {
        return (
            <button className="mcp-toggle-btn" onClick={() => setIsOpen(true)}>
                <FiCpu size={24} />
            </button>
        );
    }

    return (
        <div className="mcp-chat-window">
            <div className="mcp-header">
                <div className="mcp-title">
                    <FiCpu /> Study Copilot
                </div>
                <button onClick={() => setIsOpen(false)}><FiX /></button>
            </div>

            <div className="mcp-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`mcp-message ${msg.sender}`}>
                        <div className="mcp-bubble">
                            {msg.text}
                            {msg.data && renderData(msg.data)}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="mcp-message ai"><div className="mcp-bubble">Thinking...</div></div>}
                <div ref={messagesEndRef} />
            </div>

            <form className="mcp-input-area" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about marks, plans, or quizzes..."
                />
                <button type="submit" disabled={isLoading}><FiSend /></button>
            </form>
        </div>
    );
};

export default MCPChat;
