import React from 'react';
import { motion } from 'framer-motion';

const Input = ({
    type = 'text',
    label,
    id,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    error,
    icon: Icon,
    className = "",
    inputClassName = "",
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-semibold text-[var(--text-secondary)] mb-0.5"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative group">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary-color)] transition-colors">
                        <Icon size={18} />
                    </div>
                )}

                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`
                        w-full 
                        h-[46px] /* Standard height */
                        ${Icon ? 'pl-10' : 'pl-4'} 
                        pr-4 
                        bg-[var(--surface-color)] 
                        border 
                        rounded-xl 
                        text-[var(--text-primary)] 
                        placeholder-[var(--text-muted)] 
                        transition-all duration-200
                        outline-none
                        ${error
                            ? 'border-[var(--error-color)] focus:ring-[var(--error-color)]'
                            : 'border-[var(--border-color)] hover:border-slate-300 dark:hover:border-slate-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20'
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed
                        ${inputClassName}
                    `}
                    {...props}
                />
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-[var(--error-color)] font-medium mt-0.5"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input;
