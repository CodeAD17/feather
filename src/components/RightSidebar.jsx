import { Search } from 'lucide-react';
import './RightSidebar.css';

function RightSidebar({ children }) {
    return (
        <aside className="right-sidebar">
            {/* Search */}
            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search"
                    className="search-input"
                />
            </div>

            {/* Dynamic Content */}
            {children}
        </aside>
    );
}

export default RightSidebar;
