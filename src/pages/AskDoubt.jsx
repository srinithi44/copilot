import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { chatWithAI, uploadFileForChat, chatWithFile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
    Search,
    History,
    Plus,
    MoreHorizontal,
    Mic,
    Paperclip,
    Send,
    FileText,
    Brain,
    Zap,
    HelpCircle,
    Flame,
    ExternalLink,
    Calendar,
    X,
    Upload,
    File,
    Image,
    AlertCircle,
    RefreshCw,
    Loader2,
    Copy,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALLOWED_TYPES = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'image/png': '.png',
    'image/jpeg': '.jpg',
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AskDoubt = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    const [messages, setMessages] = useState([
        {
            role: 'model',
            content: "Hi! I'm your AI Study Assistant. I can help you summarize notes, create quizzes, explain complex topics, or **analyze uploaded files**. What's on your mind today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            id: 'welcome'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [attachedFile, setAttachedFile] = useState(null); // { file, name, type, extractedText }
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const userName = currentUser?.displayName?.split(' ')[0] || 'Student';

    useEffect(() => {
        if (location.state?.initialQuery) {
            handleSend(location.state.initialQuery);
        }
    }, [location.state]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleFileSelect = useCallback(async (file) => {
        // Validate type
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const validExts = ['.pdf', '.docx', '.txt', '.csv', '.png', '.jpg', '.jpeg'];
        if (!validExts.includes(ext)) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: `❌ Unsupported file type: **${ext}**. Supported formats: PDF, DOCX, TXT, CSV, PNG, JPG.`,
                id: Date.now(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            return;
        }

        // Validate size
        if (file.size > MAX_FILE_SIZE) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: `❌ File too large: **${(file.size / 1024 / 1024).toFixed(1)}MB**. Maximum size is 10MB.`,
                id: Date.now(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            return;
        }

        // Upload and extract text
        setIsUploading(true);
        setUploadProgress(0);
        try {
            const userId = currentUser?.uid || "guest";
            const result = await uploadFileForChat(file, userId, (progress) => {
                setUploadProgress(progress);
            });

            setAttachedFile({
                file,
                name: file.name,
                type: result.fileType,
                extractedText: result.extractedText,
                size: file.size
            });

            setMessages(prev => [...prev, {
                role: 'model',
                content: `📎 File **${file.name}** uploaded successfully! (${(file.size / 1024).toFixed(1)}KB)\n\nYou can now ask me questions about this file. For example:\n- "Summarize this document"\n- "What are the key points?"\n- "Explain the main concepts"`,
                id: Date.now(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: `❌ Failed to upload file: ${error.message}`,
                id: Date.now(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [currentUser]);

    const handleSend = async (text) => {
        if (!text.trim() && !attachedFile) return;
        const msgText = text.trim() || (attachedFile ? `Analyze the uploaded file: ${attachedFile.name}` : '');

        const newUserMsg = {
            role: 'user',
            content: msgText,
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            file: attachedFile ? { name: attachedFile.name, type: attachedFile.type } : null
        };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue("");
        setLoading(true);

        try {
            const userId = currentUser?.uid || "guest";
            let responseText;

            if (attachedFile?.extractedText) {
                // Chat with file context
                responseText = await chatWithFile(
                    msgText, userId, 'English',
                    attachedFile.extractedText, attachedFile.name
                );
            } else {
                // Regular chat
                responseText = await chatWithAI(msgText, userId, 'English');
            }

            const newAiMsg = {
                role: 'model',
                content: responseText,
                id: Date.now() + 1,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newAiMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                content: `⚠️ ${error.message || "Sorry, I'm having trouble connecting. Please try again."}`,
                id: Date.now() + 2,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([
            {
                role: 'model',
                content: `Hi ${userName}! Ready for a new study session. What should we focus on?`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                id: Date.now()
            }
        ]);
        setAttachedFile(null);
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Drag and drop handlers
    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const fileIcon = (type) => {
        if (type === 'image') return <Image size={14} />;
        return <File size={14} />;
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-100px)] flex gap-4 lg:gap-6 font-['Inter',_sans-serif]">

                {/* Main: Chat Interface */}
                <div
                    className={`flex-1 bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden transition-colors ${dragOver ? 'border-primary bg-sky-50/30' : 'border-slate-100'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Chat Header */}
                    <div className="px-4 md:px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                <Brain size={18} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    AI Learning Assistant
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline">Online</span>
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleNewChat}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md active:scale-95 transition-all"
                            >
                                <Plus size={14} /> New Chat
                            </button>
                        </div>
                    </div>

                    {/* Drag overlay */}
                    <AnimatePresence>
                        {dragOver && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-orange-50/90 rounded-3xl flex items-center justify-center pointer-events-none"
                            >
                                <div className="text-center">
                                    <Upload size={48} className="text-primary mx-auto mb-3" />
                                    <p className="font-bold text-slate-900">Drop file here</p>
                                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT, CSV, or Images</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Messages Area */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide bg-[#FDFDFD]">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-2 mb-1.5 px-2">
                                    {msg.role === 'model' && (
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                            <Brain size={12} className="text-orange-500" /> AI Assistant
                                        </div>
                                    )}
                                    <span className="text-[10px] font-bold text-slate-300">{msg.time}</span>
                                    {msg.role === 'user' && <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">You</span>}
                                </div>

                                {/* File attachment badge */}
                                {msg.file && (
                                    <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-orange-50 rounded-lg text-xs font-medium text-orange-700 border border-orange-100">
                                        {fileIcon(msg.file.type)}
                                        {msg.file.name}
                                    </div>
                                )}

                                <div className={`max-w-[90%] md:max-w-[85%] p-4 md:p-5 rounded-3xl leading-relaxed text-[14px] md:text-[15px] ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-none shadow-blue-200/50 shadow-lg font-medium'
                                    : msg.isError
                                        ? 'bg-red-50 border border-red-100 text-red-700 rounded-tl-none shadow-sm'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    ) : (
                                        <div className="prose prose-sm prose-slate max-w-none
                                            prose-headings:text-slate-800 prose-headings:font-bold prose-headings:mb-2
                                            prose-p:my-1.5 prose-li:my-0.5
                                            prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-orange-600
                                            prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:my-3
                                            prose-strong:text-slate-900
                                            prose-ul:my-2 prose-ol:my-2
                                        ">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}

                                    {msg.plan && (
                                        <div className="mt-6 space-y-4">
                                            {msg.plan.map((day, i) => (
                                                <div key={i} className="bg-orange-50/50 border-l-4 border-orange-400 p-4 rounded-xl">
                                                    <h4 className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                                                        <Calendar size={14} /> {day.day}
                                                    </h4>
                                                    <ul className="space-y-1.5 ml-2">
                                                        {day.tasks.map((task, j) => (
                                                            <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                                                                <span className="mt-1.5 w-1 h-1 bg-slate-400 rounded-full flex-shrink-0"></span>
                                                                {task}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions for AI messages */}
                                {msg.role === 'model' && !msg.isError && msg.id !== 'welcome' && (
                                    <div className="flex items-center gap-1 mt-1.5 px-2 opacity-0 hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCopy(msg.content, msg.id)}
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                                            {copiedId === msg.id ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                )}

                                {/* Retry for error messages */}
                                {msg.isError && (
                                    <button
                                        onClick={() => {
                                            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                                            if (lastUserMsg) handleSend(lastUserMsg.content);
                                        }}
                                        className="flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <RefreshCw size={12} /> Try Again
                                    </button>
                                )}
                            </motion.div>
                        ))}

                        {/* Loading indicator */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 px-2"
                            >
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <Brain size={14} className="text-orange-500" />
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">Thinking...</span>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Attached file preview */}
                    <AnimatePresence>
                        {attachedFile && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-6 overflow-hidden"
                            >
                                <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-50 rounded-xl border border-orange-100 mb-2">
                                    {fileIcon(attachedFile.type)}
                                    <span className="text-sm font-medium text-slate-700 flex-1 truncate">{attachedFile.name}</span>
                                    <span className="text-[10px] text-slate-400">{(attachedFile.size / 1024).toFixed(0)}KB</span>
                                    <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Upload progress */}
                    {isUploading && (
                        <div className="px-6 pb-2">
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                <Loader2 size={14} className="text-blue-500 animate-spin" />
                                <span className="text-sm font-medium text-blue-700">Uploading... {uploadProgress}%</span>
                                <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Input Area */}
                    <div className="p-4 md:p-6 border-t border-slate-50">
                        <div className="flex items-center bg-[#F8FAFC] rounded-2xl p-2 group focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                    if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                                    e.target.value = '';
                                }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="p-3 text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                                title="Upload a file (PDF, DOCX, TXT, CSV, or Image)"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(inputValue)}
                                placeholder={attachedFile ? `Ask about ${attachedFile.name}...` : "Ask anything about your studies..."}
                                disabled={loading}
                                className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium text-slate-700 placeholder-slate-400 disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleSend(inputValue)}
                                disabled={loading || (!inputValue.trim() && !attachedFile)}
                                className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-3">
                            AI Tutor · Supports file uploads · PDF, DOCX, TXT, CSV, Images
                        </p>
                    </div>
                </div>

                {/* Right: Context & Actions — hidden on mobile */}
                <div className="w-[320px] hidden lg:flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-2">
                    {/* Current Context */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Context</h3>
                            <MoreHorizontal size={14} className="text-slate-300" />
                        </div>
                        {attachedFile ? (
                            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-orange-200 rounded-lg text-orange-700">
                                        {fileIcon(attachedFile.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">{attachedFile.name}</h4>
                                        <span className="text-[10px] text-slate-400 font-bold">{(attachedFile.size / 1024).toFixed(0)}KB • {attachedFile.type}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAttachedFile(null)}
                                    className="mt-3 w-full text-xs text-red-500 font-bold py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition"
                                >
                                    Remove File
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                <p className="text-xs text-slate-400">No file attached</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2 text-xs font-bold text-orange-500 hover:text-orange-600"
                                >
                                    Upload a file
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</h3>
                        <div className="space-y-2">
                            {[
                                { label: "summarize", sub: "Summarize my notes", icon: FileText, query: "Can you summarize my last study notes?" },
                                { label: "quiz", sub: "Create a Quiz", icon: Brain, query: "Create a quick 5-question quiz on my recent topics." },
                                { label: "optimize", sub: "Optimize Schedule", icon: Zap, query: "How can I optimize my study schedule for this week?" },
                                { label: "explain", sub: "Explain a Concept", icon: HelpCircle, query: "Can you explain the most important concept from my syllabus?" },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(action.query)}
                                    disabled={loading}
                                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all group text-left active:scale-95 disabled:opacity-50"
                                >
                                    <div className="text-[11px] font-bold text-slate-400 uppercase w-16 group-hover:text-orange-500 transition-colors">{action.label}</div>
                                    <span className="text-xs font-bold text-slate-600">{action.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* File Upload Tips */}
                    <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-3">
                        <h4 className="font-bold text-orange-800 text-sm flex items-center gap-2">
                            <Upload size={14} /> File Upload
                        </h4>
                        <p className="text-[11px] text-orange-700 font-medium leading-relaxed">
                            Upload PDFs, DOCX, TXT, CSV, or images. The AI can analyze, summarize, and answer questions about your files.
                        </p>
                        <p className="text-[10px] text-orange-600 font-bold">
                            Drag & drop or click 📎 to upload
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AskDoubt;
