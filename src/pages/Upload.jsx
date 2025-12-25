import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Copy, Check, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { generateCertificatePost } from '../utils/ai';
import { saveDraft, getSettings } from '../utils/storage';
import './Upload.css';

function Upload() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        issuer: '',
        skills: '',
        context: '',
        tone: 'professional',
    });
    const [generatedPost, setGeneratedPost] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        if (!formData.title || !formData.issuer) {
            setError('Please fill in the certificate title and issuer');
            return;
        }

        const settings = getSettings();
        if (!settings.groqApiKey) {
            setError('Please add your Groq API key in Settings first');
            return;
        }

        setError('');
        setIsGenerating(true);

        try {
            const post = await generateCertificatePost(formData);
            setGeneratedPost(post);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to generate post');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generatedPost);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        saveDraft({
            content: generatedPost,
            source: 'certificate',
            metadata: { title: formData.title, issuer: formData.issuer },
        });
        navigate('/queue');
    };

    return (
        <div className="upload-page">
            {/* Progress Steps */}
            <div className="progress-steps">
                <motion.div
                    className={`progress-step ${step >= 1 ? 'active' : ''}`}
                    animate={{ scale: step === 1 ? 1.05 : 1 }}
                >
                    <span className="step-num">01</span>
                    <span className="step-label">Details</span>
                </motion.div>
                <div className="progress-line" />
                <motion.div
                    className={`progress-step ${step >= 2 ? 'active' : ''}`}
                    animate={{ scale: step === 2 ? 1.05 : 1 }}
                >
                    <span className="step-num">02</span>
                    <span className="step-label">Review</span>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="form"
                        className="upload-form"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="form-header">
                            <h2>Create from Certificate</h2>
                            <p>Fill in the details and let AI craft your LinkedIn post</p>
                        </div>

                        {/* File Upload */}
                        <div className="form-section">
                            <FileUpload onFileSelect={setFiles} />
                        </div>

                        {/* Form Fields */}
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Certificate Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="AWS Solutions Architect"
                                    className="input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Issuer *</label>
                                <input
                                    type="text"
                                    name="issuer"
                                    value={formData.issuer}
                                    onChange={handleChange}
                                    placeholder="Amazon Web Services"
                                    className="input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Skills Learned</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="Cloud, EC2, S3, Lambda..."
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Your Story</label>
                            <textarea
                                name="context"
                                value={formData.context}
                                onChange={handleChange}
                                placeholder="Share your journey, challenges, or insights..."
                                className="textarea"
                                rows={4}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tone</label>
                            <div className="tone-selector">
                                {['professional', 'casual', 'storytelling'].map((t) => (
                                    <motion.button
                                        key={t}
                                        type="button"
                                        className={`tone-option ${formData.tone === t ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, tone: t })}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {t === 'professional' && '💼'}
                                        {t === 'casual' && '😊'}
                                        {t === 'storytelling' && '📖'}
                                        <span>{t}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                className="error-message"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            className="btn btn-primary btn-lg generate-btn"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={20} className="spinning" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate Post
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="preview"
                        className="preview-section"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="preview-header">
                            <h2>Your Generated Post</h2>
                            <div className="preview-actions">
                                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                                    Back
                                </button>
                                <button className="btn btn-ghost btn-icon" onClick={handleGenerate}>
                                    <RefreshCw size={18} />
                                </button>
                                <button className="btn btn-ghost btn-icon" onClick={handleCopy}>
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="preview-card card">
                            <textarea
                                className="preview-textarea"
                                value={generatedPost}
                                onChange={(e) => setGeneratedPost(e.target.value)}
                                rows={14}
                            />
                        </div>

                        <div className="preview-footer">
                            <span className="char-count">{generatedPost.length} characters</span>
                            <motion.button
                                className="btn btn-primary btn-lg"
                                onClick={handleSave}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Check size={18} />
                                Save to Queue
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Upload;
