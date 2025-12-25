import { motion } from 'framer-motion';
import { Star, GitFork, Circle, Check } from 'lucide-react';
import { getLanguageColor } from '../utils/github';
import './GitHubCard.css';

function GitHubCard({ repo, selected, onSelect }) {
    return (
        <motion.div
            className={`repo-card ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(repo)}
            whileTap={{ scale: 0.99 }}
        >
            <div className="repo-check">
                <Check size={14} />
            </div>
            <div className="repo-info">
                <h3 className="repo-name">{repo.name}</h3>
                <p className="repo-description">{repo.description || 'No description'}</p>
                <div className="repo-meta">
                    {repo.language && (
                        <span className="repo-language">
                            <Circle size={10} fill={getLanguageColor(repo.language)} stroke="none" />
                            {repo.language}
                        </span>
                    )}
                    <span className="repo-stat"><Star size={14} />{repo.stars}</span>
                    <span className="repo-stat"><GitFork size={14} />{repo.forks}</span>
                </div>
            </div>
        </motion.div>
    );
}

export default GitHubCard;
