import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Linkedin, Lock, AlertCircle } from 'lucide-react';
import './ConnectModal.css';

function ConnectModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('github');

    // GitHub App Configuration
    const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

    const handleGitHubConnect = () => {
        if (!GITHUB_CLIENT_ID) {
            alert('VITE_GITHUB_CLIENT_ID is missing in .env');
            return;
        }
        // Redirect to GitHub OAuth
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo,read:user`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="connect-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="connect-modal"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="connect-modal-header">
                        <h3>Link Account</h3>
                        <button onClick={onClose} className="close-btn"><X size={20} /></button>
                    </div>

                    <div className="connect-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'github' ? 'active' : ''}`}
                            onClick={() => setActiveTab('github')}
                        >
                            <Github size={18} /> GitHub
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'linkedin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('linkedin')}
                        >
                            <Linkedin size={18} /> LinkedIn
                        </button>
                    </div>

                    <div className="connect-content">
                        {activeTab === 'github' && (
                            <div className="tab-content">
                                <p className="tab-desc">Connect to access your repositories, including private ones. You will be redirected to GitHub.</p>

                                <button
                                    className="btn btn-primary full-width connect-social-btn"
                                    onClick={handleGitHubConnect}
                                >
                                    <Github size={20} />
                                    Connect with GitHub
                                </button>

                                <p className="secure-note">
                                    <Lock size={12} /> Securely authenticated via GitHub App
                                </p>
                            </div>
                        )}

                        {activeTab === 'linkedin' && (
                            <div className="tab-content">
                                <div className="coming-soon">
                                    <Linkedin size={48} className="muted-icon" />
                                    <h4>LinkedIn Integration</h4>
                                    <p>Direct posting and analytics are coming soon.</p>
                                    <button className="btn btn-secondary" disabled>Connect (Coming Soon)</button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ConnectModal;
