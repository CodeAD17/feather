import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveSettings, getSettings, saveGitHubData } from '../utils/storage';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(null); // 'github' | 'linkedin' | null

    const handleLogin = (provider) => {
        setLoading(provider);

        // Simulating login delay
        setTimeout(() => {
            // Save mock connection status
            const currentSettings = getSettings();
            const updates = {};

            if (provider === 'github') {
                updates.githubConnected = true;
                if (!currentSettings.githubUsername) {
                    updates.githubUsername = 'demo-user';
                }

                // Save mock profile for sidebar display
                saveGitHubData({
                    profile: {
                        name: 'Aditya Codes',
                        login: 'adityacodes',
                        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4', // Use a real-ish looking placeholder
                        bio: 'Building mostly useful things.'
                    },
                    repos: [],
                    activitySummary: null
                });
            } else if (provider === 'linkedin') {
                updates.linkedinConnected = true;
            }

            saveSettings(updates);
            setLoading(null);
            navigate('/');
        }, 1500);
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="grid-bg"></div>
                <div className="ambient-light"></div>
            </div>

            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-header">
                    <div className="login-logo">
                        <img src="/logo.png" alt="Feather" />
                    </div>
                    <h1>Welcome to Feather</h1>
                    <p>Your personal brand autopilot.</p>
                </div>

                <div className="login-actions">
                    <button
                        className="social-btn github-btn"
                        onClick={() => handleLogin('github')}
                        disabled={loading}
                    >
                        {loading === 'github' ? (
                            <span className="btn-loading">Connecting...</span>
                        ) : (
                            <>
                                <Github size={20} />
                                <span>Continue with GitHub</span>
                            </>
                        )}
                    </button>

                    <button
                        className="social-btn linkedin-btn"
                        onClick={() => handleLogin('linkedin')}
                        disabled={loading}
                    >
                        {loading === 'linkedin' ? (
                            <span className="btn-loading">Connecting...</span>
                        ) : (
                            <>
                                <Linkedin size={20} />
                                <span>Continue with LinkedIn</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="login-footer">
                    <p>By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
