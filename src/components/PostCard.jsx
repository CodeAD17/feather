import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Edit3, Trash2, Check, Copy, Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import './PostCard.css';

function PostCard({ post, onEdit, onDelete, onApprove }) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);

    const getSourceEmoji = () => {
        switch (post.source) {
            case 'certificate': return '🎓';
            case 'github': return '💻';
            default: return '✍️';
        }
    };

    const handleCopy = async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(post.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.article
            className="post-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="post-avatar">
                {getSourceEmoji()}
            </div>

            <div className="post-main">
                <div className="post-header">
                    <div className="post-meta">
                        <span className="post-source">
                            {post.source === 'certificate' && 'Certificate'}
                            {post.source === 'github' && 'GitHub'}
                            {post.source === 'custom' && 'Custom'}
                        </span>
                        <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className={`badge badge-${post.status}`}>{post.status}</span>
                    </div>

                    <div className="post-menu-wrapper">
                        <motion.button
                            className="btn btn-ghost btn-icon"
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            whileHover={{ scale: 1.1 }}
                        >
                            <MoreHorizontal size={18} />
                        </motion.button>

                        {showMenu && (
                            <>
                                <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
                                <motion.div
                                    className="post-menu"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(post); setShowMenu(false); }}>
                                        <Edit3 size={18} /> Edit
                                    </button>
                                    <button onClick={handleCopy}>
                                        <Copy size={18} /> {copied ? 'Copied!' : 'Copy text'}
                                    </button>
                                    <button className="danger" onClick={(e) => { e.stopPropagation(); onDelete(post.id); setShowMenu(false); }}>
                                        <Trash2 size={18} /> Delete
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>

                <div className="post-content">
                    <p>{post.content}</p>
                </div>

                <div className="post-actions">
                    <motion.button className="action-btn" whileTap={{ scale: 0.9 }}>
                        <MessageCircle size={18} />
                    </motion.button>
                    <motion.button className="action-btn" whileTap={{ scale: 0.9 }}>
                        <Repeat2 size={18} />
                    </motion.button>
                    <motion.button
                        className={`action-btn ${liked ? 'liked' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    </motion.button>
                    <motion.button className="action-btn" onClick={handleCopy} whileTap={{ scale: 0.9 }}>
                        <Share size={18} />
                    </motion.button>

                    {post.status === 'draft' && (
                        <motion.button
                            className="btn btn-primary btn-sm approve-btn"
                            onClick={(e) => { e.stopPropagation(); onApprove(post.id); }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Check size={14} /> Approve
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

export default PostCard;
