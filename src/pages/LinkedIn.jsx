import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Send, Loader2, Trash2, Edit3, Check, X, User, Link2, Unlink } from 'lucide-react';
import { getSettings, saveSettings, getDrafts, deleteDraft } from '../utils/storage';
import ConnectModal from '../components/ConnectModal';
import './LinkedIn.css';

function LinkedIn() {
    const [linkedinToken, setLinkedinToken] = useState('');
    const [linkedinUser, setLinkedinUser] = useState(null);
    const [drafts, setDrafts] = useState([]);
    const [posting, setPosting] = useState(null); // ID of post being sent
    const [showConnectModal, setShowConnectModal] = useState(false);

    useEffect(() => {
        // Check for LinkedIn token from OAuth redirect
        const searchParams = new URLSearchParams(window.location.search);
        const linkedinTokenFromUrl = searchParams.get('linkedin_token');
        const linkedinName = searchParams.get('linkedin_name');
        const linkedinSub = searchParams.get('linkedin_sub');
        const linkedinPicture = searchParams.get('linkedin_picture');

        if (linkedinTokenFromUrl) {
            setLinkedinToken(linkedinTokenFromUrl);
            setLinkedinUser({
                name: linkedinName,
                sub: linkedinSub,
                picture: linkedinPicture,
            });
            saveSettings({
                linkedinToken: linkedinTokenFromUrl,
                linkedinUser: { name: linkedinName, sub: linkedinSub, picture: linkedinPicture }
            });
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Load from settings
        const settings = getSettings();
        if (settings.linkedinToken) setLinkedinToken(settings.linkedinToken);
        if (settings.linkedinUser) setLinkedinUser(settings.linkedinUser);

        // Load drafts
        const allDrafts = getDrafts();
        setDrafts(allDrafts);
    }, []);

    const handleDisconnect = () => {
        setLinkedinToken('');
        setLinkedinUser(null);
        saveSettings({ linkedinToken: '', linkedinUser: null });
    };

    const handlePostNow = async (draft) => {
        if (!linkedinToken || !linkedinUser) {
            alert('Please connect your LinkedIn account first');
            return;
        }

        setPosting(draft.id);
        try {
            const response = await fetch('/api/linkedin/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: draft.content,
                    token: linkedinToken,
                    authorId: linkedinUser.sub,
                }),
            });
            const result = await response.json();
            if (result.success) {
                // Remove from drafts
                deleteDraft(draft.id);
                setDrafts(drafts.filter(d => d.id !== draft.id));
                alert('🎉 Posted successfully!');
            } else {
                alert('Failed: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setPosting(null);
        }
    };

    const handleDeleteDraft = (id) => {
        if (confirm('Delete this draft?')) {
            deleteDraft(id);
            setDrafts(drafts.filter(d => d.id !== id));
        }
    };

    return (
        <div className="linkedin-page">
            <div className="page-header">
                <h1 className="page-title">LinkedIn</h1>
                <p className="page-subtitle">Manage your LinkedIn posts</p>
            </div>

            {/* Profile Section */}
            <motion.div
                className="linkedin-profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {linkedinUser ? (
                    <>
                        <div className="profile-row">
                            {linkedinUser.picture ? (
                                <img src={linkedinUser.picture} alt={linkedinUser.name} className="profile-avatar" />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    <User size={24} />
                                </div>
                            )}
                            <div className="profile-info">
                                <h2>{linkedinUser.name || 'LinkedIn User'}</h2>
                                <span className="connection-status connected">
                                    <Check size={14} /> Connected
                                </span>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={handleDisconnect}>
                                <Unlink size={14} /> Disconnect
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="connect-prompt">
                        <div className="connect-icon">
                            <Linkedin size={48} />
                        </div>
                        <h2>Connect LinkedIn</h2>
                        <p>Link your account to post directly to LinkedIn</p>
                        <motion.button
                            className="btn btn-linkedin btn-lg"
                            onClick={() => setShowConnectModal(true)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link2 size={18} /> Connect Account
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* Post Queue */}
            <div className="queue-section">
                <div className="section-header">
                    <h3>Post Queue</h3>
                    <span className="queue-count">{drafts.length} drafts</span>
                </div>

                {drafts.length === 0 ? (
                    <div className="empty-queue">
                        <p>No posts in queue. Generate posts from the GitHub page!</p>
                    </div>
                ) : (
                    <div className="drafts-list">
                        <AnimatePresence>
                            {drafts.map((draft, index) => (
                                <motion.div
                                    key={draft.id}
                                    className="draft-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="draft-content">
                                        <p>{draft.content.slice(0, 200)}{draft.content.length > 200 ? '...' : ''}</p>
                                        <div className="draft-meta">
                                            <span className="draft-source">{draft.source || 'Manual'}</span>
                                            <span className="draft-date">
                                                {new Date(draft.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="draft-actions">
                                        <motion.button
                                            className="btn btn-linkedin btn-sm"
                                            onClick={() => handlePostNow(draft)}
                                            disabled={posting === draft.id || !linkedinToken}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {posting === draft.id ? (
                                                <Loader2 size={14} className="spinning" />
                                            ) : (
                                                <><Send size={14} /> Post</>
                                            )}
                                        </motion.button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleDeleteDraft(draft.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <ConnectModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
            />
        </div>
    );
}

export default LinkedIn;
