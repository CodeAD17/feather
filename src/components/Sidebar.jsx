import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, PenSquare, Github, FileText, Settings, MoreHorizontal } from 'lucide-react';
import { getGitHubData } from '../utils/storage';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: PenSquare, label: 'Create' },
    { path: '/github', icon: Github, label: 'GitHub' },
    { path: '/queue', icon: FileText, label: 'Queue' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar() {
    const location = useLocation();
    const githubData = getGitHubData();
    const user = githubData?.profile || null;

    // Use placeholder if no user connected
    const displayName = user?.name || user?.login || 'Demo User';
    const displayHandle = user?.login ? `@${user.login}` : '@demouser';
    const displayAvatar = user?.avatar_url || 'https://github.com/shadcn.png';

    return (
        <aside className="sidebar">
            {/* Logo */}
            <motion.div
                className="sidebar-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="logo-mark">
                    <img src="/logo.png" alt="Autopilot" className="logo-img" />
                </div>
            </motion.div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <NavLink
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <div className="nav-icon">
                                    <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Post Button */}
            <div className="sidebar-cta">
                <NavLink to="/upload">
                    <motion.button
                        className="btn btn-primary"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <PenSquare size={20} />
                        <span>Post</span>
                    </motion.button>
                </NavLink>
            </div>

            {/* Footer */}
            {/* Footer / User Profile */}
            <div className="sidebar-footer">
                <div className="sidebar-profile">
                    <div className="profile-info">
                        <div className="profile-avatar">
                            <img src={displayAvatar} alt="User" />
                        </div>
                        <div className="profile-text">
                            <div className="profile-name">{displayName}</div>
                            <div className="profile-handle">{displayHandle}</div>
                        </div>
                    </div>
                    <button className="profile-more">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
