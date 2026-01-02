import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Linkedin, Lock, AlertCircle } from 'lucide-react';
import './ConnectModal.css';

function ConnectModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('github');

    // GitHub App Configuration
    const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

    // LinkedIn App Configuration
    const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;

    // Dynamic redirect URI based on environment
    const isProduction = window.location.hostname !== 'localhost';
    const GITHUB_REDIRECT_URI = isProduction
        ? `${window.location.origin}/api/auth/callback`
        : 'http://localhost:3000/api/auth/callback';

    const LINKEDIN_REDIRECT_URI = isProduction
        ? `${window.location.origin}/api/linkedin/callback`
        : 'http://localhost:3000/api/linkedin/callback';

    const handleGitHubConnect = () => {
        if (!GITHUB_CLIENT_ID) {
            alert('VITE_GITHUB_CLIENT_ID is missing in .env');
            return;
        }
        // Redirect to GitHub OAuth
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=repo,read:user`;
    };

    const handleLinkedInConnect = () => {
        if (!LINKEDIN_CLIENT_ID) {
            alert('VITE_LINKEDIN_CLIENT_ID is missing in .env');
            return;
        }
        // Redirect to LinkedIn OAuth
        // Scopes: openid (sign in), profile (user info), w_member_social (posting)
        const scopes = 'openid profile w_member_social';
        window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;
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
                                <p className="tab-desc">Connect to post directly to your LinkedIn profile. You will be redirected to LinkedIn.</p>

                                <button
                                    className="btn btn-linkedin full-width connect-social-btn"
                                    onClick={handleLinkedInConnect}
                                >
                                    <Linkedin size={20} />
                                    Connect with LinkedIn
                                </button>

                                <p className="secure-note">
                                    <Lock size={12} /> Securely authenticated via LinkedIn OAuth
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ConnectModal;
