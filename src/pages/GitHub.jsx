import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Loader2, Sparkles, Copy, Check, AlertCircle, Users, BookOpen, Wand2, Send, Search, Lock } from 'lucide-react';
import GitHubCard from '../components/GitHubCard';
import { fetchUserProfile, fetchUserRepos, getWeeklyActivitySummary, formatRepoData } from '../utils/github';
import { generateGitHubPost } from '../utils/ai';
import { saveDraft, getSettings, saveSettings, getGitHubData, saveGitHubData } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import './GitHub.css';

function GitHub() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [profile, setProfile] = useState(null);
    const [repos, setRepos] = useState([]);
    const [selectedRepos, setSelectedRepos] = useState([]);
    const [activitySummary, setActivitySummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generatedPost, setGeneratedPost] = useState('');
    const [error, setError] = useState('');
    const [focus, setFocus] = useState('');
    const [copied, setCopied] = useState(false);
    const [tone, setTone] = useState('professional');
    const [repoSearch, setRepoSearch] = useState('');
    const [githubToken, setGithubToken] = useState('');
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        const settings = getSettings();
        if (settings.githubUsername) setUsername(settings.githubUsername);
        if (settings.githubToken) setGithubToken(settings.githubToken);
        const cached = getGitHubData();
        if (cached) {
            setProfile(cached.profile);
            setRepos(cached.repos);
            setActivitySummary(cached.activitySummary);
        }
    }, []);

    const handleConnect = async () => {
        if (!username.trim()) { setError('Enter a GitHub username'); return; }
        setError('');
        setLoading(true);
        try {
            const [userProfile, userRepos, summary] = await Promise.all([
                fetchUserProfile(username),
                fetchUserRepos(username),
                getWeeklyActivitySummary(username),
            ]);
            const formatted = userRepos.map(formatRepoData);
            setProfile(userProfile);
            setRepos(formatted);
            setActivitySummary(summary);
            saveGitHubData({ profile: userProfile, repos: formatted, activitySummary: summary });
            saveSettings({ githubUsername: username, githubToken: githubToken });
        } catch (err) {
            setError('User not found');
        } finally {
            setLoading(false);
        }
    };

    const handleRepoSelect = (repo) => {
        setSelectedRepos((prev) => {
            const exists = prev.find((r) => r.id === repo.id);
            return exists ? prev.filter((r) => r.id !== repo.id) : [...prev, repo];
        });
    };

    const handleGenerate = async () => {
        if (!selectedRepos.length) { setError('Select repositories from the right panel'); return; }
        const settings = getSettings();
        if (!settings.groqApiKey) { setError('Add your Groq API key in Settings'); return; }
        setError('');
        setGenerating(true);
        try {
            const post = await generateGitHubPost({ summary: activitySummary, selectedRepos, focus, tone });
            setGeneratedPost(post);
        } catch (err) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = () => {
        saveDraft({ content: generatedPost, source: 'github', metadata: { username, repos: selectedRepos.map((r) => r.name) } });
        navigate('/queue');
    };

    const handleDisconnect = () => {
        setProfile(null);
        setRepos([]);
        setSelectedRepos([]);
        setGeneratedPost('');
    };

    // Not connected
    if (!profile) {
        return (
            <div className="github-page">
                <div className="page-header">
                    <h1 className="page-title">GitHub</h1>
                    <p className="page-subtitle">Share your coding journey</p>
                </div>
                <motion.div className="connect-section" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <div className="connect-card">
                        <div className="connect-icon"><Github size={48} /></div>
                        <h2>Connect your GitHub</h2>
                        <p>Import your activity and create posts</p>
                        <div className="connect-form">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="input"
                                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                            />
                            <motion.button className="btn btn-primary" onClick={handleConnect} disabled={loading} whileTap={{ scale: 0.98 }}>
                                {loading ? <Loader2 size={18} className="spinning" /> : 'Connect'}
                            </motion.button>
                        </div>

                        {/* Token section */}
                        <div className="token-section">
                            <button className="token-toggle" onClick={() => setShowToken(!showToken)}>
                                <Lock size={14} />
                                {showToken ? 'Hide' : 'Add'} token for private repos
                            </button>
                            {showToken && (
                                <motion.div
                                    className="token-input-wrapper"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                >
                                    <input
                                        type="password"
                                        value={githubToken}
                                        onChange={(e) => setGithubToken(e.target.value)}
                                        placeholder="GitHub personal access token"
                                        className="input token-input"
                                    />
                                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="token-link">
                                        Get token →
                                    </a>
                                </motion.div>
                            )}
                        </div>

                        {error && <div className="error-msg"><AlertCircle size={16} />{error}</div>}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Connected - Main content shows profile + generate
    return (
        <div className="github-page github-connected">
            <div className="page-header">
                <h1 className="page-title">GitHub</h1>
                <p className="page-subtitle">Generate posts from your coding activity</p>
            </div>

            {/* Profile Card */}
            <motion.div className="github-profile-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="profile-row">
                    <img src={profile.avatar_url} alt={profile.login} className="profile-avatar" />
                    <div className="profile-info">
                        <h2>{profile.name || profile.login}</h2>
                        <span className="profile-handle">@{profile.login}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={handleDisconnect}>Disconnect</button>
                </div>
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                <div className="profile-meta">
                    <span><BookOpen size={14} /> {profile.public_repos} repos</span>
                    <span><Users size={14} /> {profile.followers} followers</span>
                </div>
            </motion.div>

            {/* Activity Stats */}
            {activitySummary && (
                <div className="stats-row">
                    <div className="stat-box">
                        <span className="stat-num">{activitySummary.pushEvents}</span>
                        <span className="stat-text">Pushes</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num">{activitySummary.pullRequests}</span>
                        <span className="stat-text">PRs</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-num">{activitySummary.commits.length}</span>
                        <span className="stat-text">Commits</span>
                    </div>
                </div>
            )}

            {/* Generate Section */}
            <div className="generate-card">
                <div className="generate-header">
                    <Wand2 size={20} />
                    <h3>Generate Post</h3>
                </div>

                {/* Selected repos */}
                <div className="selected-repos">
                    <label>Selected Repositories</label>
                    {selectedRepos.length === 0 ? (
                        <p className="no-repos">Select repositories from the right panel →</p>
                    ) : (
                        <div className="repo-tags">
                            {selectedRepos.map((repo) => (
                                <span key={repo.id} className="repo-tag">
                                    {repo.name}
                                    <button onClick={() => handleRepoSelect(repo)}>×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Focus input */}
                <div className="form-group">
                    <label className="form-label">Focus Area (optional)</label>
                    <input
                        type="text"
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                        placeholder="e.g., API development, React hooks, performance optimization"
                        className="input"
                    />
                </div>

                {/* Tone selector */}
                <div className="form-group">
                    <label className="form-label">Tone</label>
                    <div className="tone-options">
                        {['professional', 'casual', 'enthusiastic'].map((t) => (
                            <button
                                key={t}
                                className={`tone-btn ${tone === t ? 'active' : ''}`}
                                onClick={() => setTone(t)}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className="error-msg"><AlertCircle size={16} />{error}</div>}

                <motion.button
                    className="btn btn-primary btn-lg generate-btn"
                    onClick={handleGenerate}
                    disabled={generating || !selectedRepos.length}
                    whileTap={{ scale: 0.98 }}
                >
                    {generating ? (
                        <><Loader2 size={20} className="spinning" />Generating...</>
                    ) : (
                        <><Sparkles size={20} />Generate Post</>
                    )}
                </motion.button>
            </div>

            {/* Generated Post */}
            {generatedPost && (
                <motion.div className="result-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <div className="result-header">
                        <h3>Your Post</h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(generatedPost); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                        </button>
                    </div>
                    <div className="result-content">
                        <textarea
                            value={generatedPost}
                            onChange={(e) => setGeneratedPost(e.target.value)}
                            className="result-textarea"
                        />
                        <div className="result-footer">
                            <span className="char-count">{generatedPost.length} characters</span>
                        </div>
                    </div>
                    <div className="result-actions">
                        <button className="btn btn-secondary" onClick={handleGenerate} disabled={generating}>
                            <Sparkles size={16} /> Regenerate
                        </button>
                        <motion.button className="btn btn-success btn-lg" onClick={handleSave} whileTap={{ scale: 0.98 }}>
                            <Send size={18} /> Save to Queue
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Repos Panel - Right Sidebar */}
            <aside className="repos-sidebar">
                <div className="repos-header">
                    <h4>Repositories</h4>
                    <span className="repos-count">{selectedRepos.length} selected</span>
                </div>
                <div className="repos-search">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        placeholder="Search repos..."
                        className="search-input"
                    />
                </div>
                <div className="repos-list">
                    {repos
                        .filter((repo) => repo.name.toLowerCase().includes(repoSearch.toLowerCase()))
                        .slice(0, 20)
                        .map((repo, index) => (
                            <motion.div
                                key={repo.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <GitHubCard
                                    repo={repo}
                                    selected={selectedRepos.some((r) => r.id === repo.id)}
                                    onSelect={handleRepoSelect}
                                />
                            </motion.div>
                        ))}
                </div>
            </aside>
        </div>
    );
}

export default GitHub;
