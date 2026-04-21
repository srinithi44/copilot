import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    width = 'auto',
    icon: Icon,
    iconPosition = 'left',
    onClick,
    disabled,
    className = '',
    loading = false
}) => {

    // Base Styles
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed";

    // Size Variants
    const sizes = {
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-[46px] px-6 text-base rounded-xl", /* Standard SaaS Height */
        lg: "h-12 px-8 text-lg rounded-xl",
        icon: "h-[40px] w-[40px] p-0 rounded-lg"
    };

    // Style Variants
    const variants = {
        primary: "bg-[var(--primary-color)] text-[#1A1A1A] hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md active:translate-y-[1px]",
        secondary: "bg-white text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--surface-hover)] dark:bg-[var(--surface-color)] dark:border-[var(--border-color)] dark:hover:bg-[var(--surface-hover)] shadow-sm hover:shadow-md",
        ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary-color)]",
        danger: "bg-[var(--error-color)] text-white hover:bg-red-600 shadow-sm",
        google: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700 shadow-sm transition-all",
    };

    const widthClass = width === 'full' ? 'w-full' : '';

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                ${baseStyles} 
                ${sizes[size]} 
                ${variants[variant]} 
                ${widthClass} 
                ${className}
            `}
            whileTap={{ scale: 0.98 }}
        >
            {loading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : 20} className="mr-2.5" />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : 20} className="ml-2.5" />}
                </>
            )}
        </motion.button>
    );
};

export default Button;
