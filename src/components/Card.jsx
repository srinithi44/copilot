import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    className = "",
    hover = true,
    padding = "p-6",
    onClick
}) => {
    return (
        <motion.div
            className={`
                bg-[var(--surface-color)] 
                rounded-[var(--border-radius-lg)] 
                border border-[var(--border-color)] 
                shadow-sm 
                transition-all duration-300
                ${hover ? 'hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800' : ''}
                ${padding}
                ${className}
            `}
            onClick={onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

export default Card;
