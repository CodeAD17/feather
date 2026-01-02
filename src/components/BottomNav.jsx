import { NavLink } from 'react-router-dom';
import { Home, Github, Linkedin, FileText, Settings } from 'lucide-react';
import './BottomNav.css';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/github', icon: Github, label: 'GitHub' },
    { path: '/linkedin', icon: Linkedin, label: 'LinkedIn' },
    { path: '/queue', icon: FileText, label: 'Queue' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

function BottomNav() {
    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={24} strokeWidth={2} />
                    </NavLink>
                );
            })}
        </nav>
    );
}

export default BottomNav;
