import { useNavigate } from 'react-router-dom';
import { getGitHubData } from '../utils/storage';
import './MobileHeader.css';

function MobileHeader() {
    const navigate = useNavigate();
    const githubData = getGitHubData();
    const user = githubData?.profile || null;
    const avatarUrl = user?.avatar_url || 'https://github.com/shadcn.png';

    return (
        <header className="mobile-header">
            <div className="mobile-header-left">
                <div onClick={() => navigate('/settings')} className="mobile-avatar-container">
                    <img src={avatarUrl} alt="User" className="mobile-avatar" />
                </div>
            </div>

            <div className="mobile-header-center">
                <img src="/logo.png" alt="Feather" className="mobile-logo" />
            </div>

            <div className="mobile-header-right">
                {/* Placeholder for future actions or settings icon */}
                <div style={{ width: 32 }}></div>
            </div>
        </header>
    );
}

export default MobileHeader;
