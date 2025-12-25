import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Github, ChevronRight, Target, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { getDrafts, getSettings } from '../utils/storage';
import './Dashboard.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

function Dashboard() {
    const [drafts, setDrafts] = useState([]);
    const [settings, setSettings] = useState({});
    const [stats, setStats] = useState({ total: 0, pending: 0, scheduled: 0, posted: 0 });

    useEffect(() => {
        const allDrafts = getDrafts();
        const userSettings = getSettings();
        setDrafts(allDrafts);
        setSettings(userSettings);
        setStats({
            total: allDrafts.length,
            pending: allDrafts.filter((d) => d.status === 'draft').length,
            scheduled: allDrafts.filter((d) => d.status === 'scheduled').length,
            posted: allDrafts.filter((d) => d.status === 'posted').length,
        });
    }, []);

    const isNewUser = !settings.groqApiKey;

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Home</h1>
            </div>

            {/* Welcome */}
            <motion.div
                className="welcome-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="welcome-text">What's happening</div>
                <div className="welcome-sub">Create LinkedIn posts from your achievements</div>
            </motion.div>

            {/* Quick Actions */}
            <div className="actions-grid">
                <Link to="/upload" className="action-card">
                    <div className="action-icon">
                        <Sparkles size={24} />
                    </div>
                    <div className="action-content">
                        <h3>Create post</h3>
                        <p>From certificate or event</p>
                    </div>
                </Link>
                <Link to="/github" className="action-card">
                    <div className="action-icon">
                        <Github size={24} />
                    </div>
                    <div className="action-content">
                        <h3>GitHub activity</h3>
                        <p>Build in public posts</p>
                    </div>
                </Link>
            </div>

            {/* Stats */}
            <motion.div
                className="stats-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {[
                    { icon: Target, value: stats.total, label: 'Total', color: '' },
                    { icon: Zap, value: stats.pending, label: 'Drafts', color: 'pending' },
                    { icon: TrendingUp, value: stats.scheduled, label: 'Scheduled', color: 'scheduled' },
                    { icon: CheckCircle, value: stats.posted, label: 'Posted', color: 'posted' },
                ].map((stat) => (
                    <motion.div key={stat.label} className="stat-card" variants={itemVariants}>
                        <div className={`stat-icon ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Onboarding for new users */}
            {isNewUser && (
                <motion.div
                    className="onboarding-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="section-header">
                        <h2 className="section-title">Get started</h2>
                    </div>
                    <div className="steps-list">
                        {[
                            { path: '/settings', num: '1', title: 'Add API key', desc: 'Get your free Groq API key' },
                            { path: '/upload', num: '2', title: 'Create a post', desc: 'From certificate or achievement' },
                            { path: '/github', num: '3', title: 'Connect GitHub', desc: 'Build in public updates' },
                        ].map((step, i) => (
                            <motion.div key={step.num} variants={itemVariants}>
                                <Link to={step.path} className="step-item">
                                    <div className="step-num">{step.num}</div>
                                    <div className="step-text">
                                        <h3>{step.title}</h3>
                                        <p>{step.desc}</p>
                                    </div>
                                    <ChevronRight size={20} className="step-arrow" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recent Drafts */}
            {drafts.length > 0 && (
                <div className="drafts-section">
                    <div className="section-header">
                        <h2 className="section-title">Recent drafts</h2>
                        <Link to="/queue" className="view-all">View all</Link>
                    </div>
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        {drafts.slice(0, 3).map((draft) => (
                            <motion.div key={draft.id} className="draft-item" variants={itemVariants}>
                                <div className="draft-avatar">
                                    {draft.source === 'certificate' && '🎓'}
                                    {draft.source === 'github' && '💻'}
                                    {draft.source === 'custom' && '✍️'}
                                </div>
                                <div className="draft-content">
                                    <div className="draft-header">
                                        <span className="draft-source">
                                            {draft.source === 'certificate' && 'Certificate'}
                                            {draft.source === 'github' && 'GitHub'}
                                            {draft.source === 'custom' && 'Custom'}
                                        </span>
                                        <span className="draft-date">· {new Date(draft.createdAt).toLocaleDateString()}</span>
                                        <span className={`badge badge-${draft.status}`}>{draft.status}</span>
                                    </div>
                                    <p className="draft-preview">{draft.content.slice(0, 100)}...</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
