import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Key, Github, Download, Upload, Trash2, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { getSettings, saveSettings, exportData, importData, clearAllData } from '../utils/storage';
import { validateApiKey } from '../utils/ai';
import './Settings.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

function Settings() {
    const [settings, setSettings] = useState({ groqApiKey: '', githubUsername: '', defaultTone: 'professional' });
    const [saved, setSaved] = useState(false);
    const [validating, setValidating] = useState(false);
    const [apiValid, setApiValid] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => { setSettings(getSettings()); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((s) => ({ ...s, [name]: value }));
        setSaved(false);
        if (name === 'groqApiKey') setApiValid(null);
    };

    const handleSave = () => {
        saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleValidate = async () => {
        if (!settings.groqApiKey) { setError('Enter API key first'); return; }
        setValidating(true);
        setError('');
        setApiValid(null);
        try {
            const valid = await validateApiKey(settings.groqApiKey);
            setApiValid(valid);
            if (!valid) setError('Validation failed. Save anyway and try generating.');
        } catch (err) {
            setError('Could not validate. Save and try generating.');
        }
        setValidating(false);
    };

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `linkedin-autopilot-${Date.now()}.json`;
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                importData(JSON.parse(ev.target.result));
                setSettings(getSettings());
                alert('Data imported!');
            } catch { alert('Invalid file'); }
        };
        reader.readAsText(file);
    };

    const handleClear = () => {
        if (confirm('Delete all data? This cannot be undone.')) {
            clearAllData();
            setSettings({ groqApiKey: '', githubUsername: '', defaultTone: 'professional' });
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Configure your LinkedIn Autopilot</p>
            </div>

            <motion.div
                className="settings-sections"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* API */}
                <motion.section className="settings-section card" variants={itemVariants}>
                    <div className="section-icon api">
                        <Key size={24} />
                    </div>
                    <div className="section-content">
                        <h3>API Configuration</h3>
                        <p>Add your Groq API key for AI-powered generation</p>
                        <div className="form-group">
                            <label className="form-label">Groq API Key</label>
                            <div className="input-row">
                                <input type="password" name="groqApiKey" value={settings.groqApiKey} onChange={handleChange} placeholder="gsk_..." className="input" />
                                <motion.button
                                    className="btn btn-secondary"
                                    onClick={handleValidate}
                                    disabled={validating}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {validating ? 'Checking...' : 'Validate'}
                                </motion.button>
                            </div>
                            {apiValid === true && <span className="success-text"><Check size={14} />Valid</span>}
                            {error && <span className="error-text"><AlertCircle size={14} />{error}</span>}
                            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="help-link">
                                Get free API key <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* GitHub */}
                <motion.section className="settings-section card" variants={itemVariants}>
                    <div className="section-icon github">
                        <Github size={24} />
                    </div>
                    <div className="section-content">
                        <h3>GitHub</h3>
                        <p>Connected GitHub account</p>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input type="text" name="githubUsername" value={settings.githubUsername} onChange={handleChange} placeholder="username" className="input" />
                        </div>
                    </div>
                </motion.section>

                {/* Data Management */}
                <motion.section className="settings-section card" variants={itemVariants}>
                    <div className="section-icon data">
                        <Download size={24} />
                    </div>
                    <div className="section-content">
                        <h3>Data Management</h3>
                        <p>Export, import, or clear your data</p>
                        <div className="data-actions">
                            <motion.button
                                className="btn btn-secondary"
                                onClick={handleExport}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Download size={16} />Export
                            </motion.button>
                            <label className="btn btn-secondary">
                                <Upload size={16} />Import
                                <input type="file" accept=".json" onChange={handleImport} hidden />
                            </label>
                            <motion.button
                                className="btn btn-secondary danger-text"
                                onClick={handleClear}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Trash2 size={16} />Clear All
                            </motion.button>
                        </div>
                    </div>
                </motion.section>
            </motion.div>

            {/* Save Button */}
            <div className="save-bar">
                <motion.button
                    className={`btn ${saved ? 'btn-success' : 'btn-primary'} btn-lg`}
                    onClick={handleSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {saved ? <><Check size={18} />Saved!</> : <><Save size={18} />Save Settings</>}
                </motion.button>
            </div>
        </div>
    );
}

export default Settings;
