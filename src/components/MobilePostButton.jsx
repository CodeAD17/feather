import { NavLink } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import './BottomNav.css'; // Reusing the CSS file

function MobilePostButton() {
    return (
        <NavLink to="/upload" className="mobile-fab">
            <PenSquare size={24} />
        </NavLink>
    );
}

export default MobilePostButton;
