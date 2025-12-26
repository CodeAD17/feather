import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import './RepoSelector.css';

function RepoSelector({ isOpen, onClose, repos, selectedRepos, onToggle }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="repo-selector-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="repo-selector-modal"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="repo-selector-header">
                        <h3>Select Repositories</h3>
                        <button onClick={onClose} className="close-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="repo-selector-list">
                        {repos.map((repo) => {
                            const isSelected = selectedRepos.some(r => r.id === repo.id);
                            return (
                                <div
                                    key={repo.id}
                                    className={`selector-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => onToggle(repo)}
                                >
                                    <div className="selector-item-info">
                                        <span className="repo-name">{repo.name}</span>
                                        <span className="repo-desc text-truncate">{repo.description || 'No description'}</span>
                                    </div>
                                    {isSelected && <Check size={18} className="check-icon" />}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default RepoSelector;
