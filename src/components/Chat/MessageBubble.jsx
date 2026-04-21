import React from 'react';
import { User, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 group ${isUser ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar */}
            <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mt-1
                ${isUser
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-gradient-to-br from-primary-500 to-amber-600 text-[#1A1A1A]'
                }
            `}>
                {isUser ? <User size={16} /> : <Sparkles size={16} />}
            </div>

            {/* Content Box */}
            <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {isUser ? 'You' : 'Copilot'}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className={`
                    prose prose-slate dark:prose-invert max-w-none text-[15px] leading-relaxed p-4 rounded-2xl shadow-sm border
                    ${isUser
                        ? 'bg-[var(--primary-color)] text-white border-transparent'
                        : 'bg-[var(--surface-color)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }
                `} style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <ReactMarkdown
                            components={{
                                code: ({ node, inline, className, children, ...props }) => {
                                    return !inline ? (
                                        <div className="rounded-lg overflow-hidden my-4 bg-[#1e293b] text-white text-sm p-4 font-mono shadow-md">
                                            {children}
                                        </div>
                                    ) : (
                                        <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400" {...props}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>

                {/* AI Actions */}
                {!isUser && (
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                        <ActionBtn icon={Copy} />
                        <ActionBtn icon={ThumbsUp} />
                        <ActionBtn icon={ThumbsDown} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function ActionBtn({ icon: Icon }) {
    return (
        <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors">
            <Icon size={14} />
        </button>
    );
}
