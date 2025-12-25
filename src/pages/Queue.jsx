import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Github, Sparkles } from 'lucide-react';
import PostCard from '../components/PostCard';
import { getDrafts, updateDraft, deleteDraft } from '../utils/storage';
import './Queue.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

function Queue() {
    const [drafts, setDrafts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [editingPost, setEditingPost] = useState(null);

    useEffect(() => { loadDrafts(); }, []);

    const loadDrafts = () => setDrafts(getDrafts());

    const filtered = drafts.filter((d) => filter === 'all' || d.status === filter);

    const handleEdit = (post) => setEditingPost(post);
    const handleDelete = (id) => { if (confirm('Delete this draft?')) { deleteDraft(id); loadDrafts(); } };
    const handleApprove = (id) => { updateDraft(id, { status: 'scheduled' }); loadDrafts(); };
    const handleSchedule = (post) => { updateDraft(post.id, { status: 'scheduled' }); loadDrafts(); };
    const handleSaveEdit = () => { if (editingPost) { updateDraft(editingPost.id, { content: editingPost.content }); setEditingPost(null); loadDrafts(); } };

    const counts = {
        all: drafts.length,
        draft: drafts.filter((d) => d.status === 'draft').length,
        scheduled: drafts.filter((d) => d.status === 'scheduled').length,
        posted: drafts.filter((d) => d.status === 'posted').length,
    };

    return (
        <div className="queue-page">
            <div className="page-header">
                <h1 className="page-title">Post Queue</h1>
                <p className="page-subtitle">Manage and schedule your LinkedIn posts</p>
            </div>

            {/* Tabs */}
            <div className="tabs-bar">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'draft', label: 'Drafts' },
                    { key: 'scheduled', label: 'Scheduled' },
                    { key: 'posted', label: 'Posted' },
                ].map((tab) => (
                    <motion.button
                        key={tab.key}
                        className={`tab ${filter === tab.key ? 'active' : ''}`}
                        onClick={() => setFilter(tab.key)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="tab-label">{tab.label}</span>
                        <span className="tab-count">{counts[tab.key]}</span>
                    </motion.button>
                ))}
            </div>

            {/* Feed */}
            {filtered.length > 0 ? (
                <div className="posts-feed">
                    {filtered.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <PostCard
                                post={post}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onApprove={handleApprove}
                                onSchedule={handleSchedule}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div
                    className="empty-state card"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="empty-state-icon">
                        <Sparkles size={32} />
                    </div>
                    <h3>No {filter === 'all' ? 'posts' : filter + ' posts'} yet</h3>
                    <p>Create your first post to get started</p>
                    <div className="empty-actions">
                        <Link to="/upload" className="btn btn-primary">
                            <Upload size={16} />
                            Create Post
                        </Link>
                        <Link to="/github" className="btn btn-secondary">
                            <Github size={16} />
                            Connect GitHub
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Edit Modal */}
            {editingPost && (
                <motion.div
                    className="modal-overlay"
                    onClick={() => setEditingPost(null)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="modal-header">
                            <h3>Edit Post</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setEditingPost(null)}>×</button>
                        </div>
                        <textarea
                            className="modal-textarea"
                            value={editingPost.content}
                            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                            rows={15}
                        />
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditingPost(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

export default Queue;
