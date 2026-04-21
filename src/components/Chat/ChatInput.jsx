import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'; // Reset height
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    }, [message]);

    return (
        <div className="w-full relative">
            <form
                onSubmit={handleSubmit}
                className={`
                    relative flex items-end gap-2 bg-[var(--background-color)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-2 shadow-sm transition-all duration-200
                    focus-within:border-[var(--primary-color)] focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20
                `}
            >
                <div className="flex gap-1 pb-1">
                    <button
                        type="button"
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                        title="Attach file"
                    >
                        <Paperclip size={20} />
                    </button>
                </div>

                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a doubt..."
                    disabled={disabled}
                    rows={1}
                    className="flex-1 border-none outline-none resize-none max-h-40 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-transparent leading-relaxed text-base min-h-[44px]"
                />

                <div className="flex gap-1 pb-1">
                    {!message.trim() && (
                        <button
                            type="button"
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                        >
                            <Mic size={20} />
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={!message.trim() || disabled}
                        className={`
                            p-2 rounded-lg flex items-center justify-center transition-all duration-200
                            ${!message.trim() || disabled
                                ? 'bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-not-allowed'
                                : 'bg-[var(--primary-color)] text-white shadow-md hover:bg-[var(--primary-hover)] group'
                            }
                        `}
                    >
                        <Send size={18} className={message.trim() && !disabled ? "ml-0.5" : ""} />
                    </button>
                </div>
            </form>
            <div className="text-center text-[10px] text-[var(--text-muted)] mt-2 font-medium">
                Copilot can make mistakes. Check important info.
            </div>
        </div>
    );
}
