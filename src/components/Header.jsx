import { motion } from 'framer-motion';
import { Menu, Bell, Search } from 'lucide-react';
import './Header.css';

function Header({ title, onMenuClick }) {
    return (
        <motion.header
            className="header"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <div className="header-left">
                <button className="btn btn-ghost btn-icon mobile-menu" onClick={onMenuClick}>
                    <Menu size={20} />
                </button>
                <div className="header-title">
                    <h1>{title}</h1>
                    <div className="breadcrumb">
                        <span>Autopilot</span>
                        <span className="separator">/</span>
                        <span className="current">{title}</span>
                    </div>
                </div>
            </div>

            <div className="header-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search posts, repos..."
                    className="search-input"
                />
                <kbd className="search-shortcut">⌘K</kbd>
            </div>

            <div className="header-right">
                <button className="btn btn-ghost btn-icon notification-btn">
                    <Bell size={20} />
                    <span className="notification-dot" />
                </button>
                <div className="header-avatar">
                    <span>A</span>
                </div>
            </div>
        </motion.header>
    );
}

export default Header;
