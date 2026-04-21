import React from 'react';
import { motion } from 'framer-motion';

const animations = {
    initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

const AnimatedPage = ({ children, className = '' }) => {
    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                mass: 0.5,
            }}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;
