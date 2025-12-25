import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './PageLoader.css';

function PageLoader() {
    return (
        <div className="page-loader">
            <motion.div
                className="loader-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Animated Logo */}
                <motion.div
                    className="loader-logo"
                    animate={{
                        y: [0, -8, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img src="/logo.png" alt="Feather" className="loader-logo-img" />
                </motion.div>

                {/* Pulse ring */}
                <motion.div
                    className="loader-ring"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Text */}
                <motion.div
                    className="loader-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="loader-title">Feather</span>
                    <motion.div
                        className="loader-dots"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                    >
                        <span>.</span><span>.</span><span>.</span>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default PageLoader;
