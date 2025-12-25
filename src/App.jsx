import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import PageLoader from './components/PageLoader';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import GitHub from './pages/GitHub';
import Queue from './pages/Queue';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Link } from 'react-router-dom';
import { Lightbulb, TrendingUp, Sparkles, ExternalLink } from 'lucide-react';
import './App.css';

// Context for GitHub repos sidebar
export const GitHubContext = createContext(null);

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [onRepoSelect, setOnRepoSelect] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic right sidebar content based on current page
  const getRightSidebarContent = () => {
    switch (location.pathname) {
      case '/':
        return (
          <>
            <div className="tip-card">
              <div className="tip-icon"><Lightbulb size={20} /></div>
              <div className="tip-content">
                <h4>Pro Tip</h4>
                <p>Post consistently 2-3 times per week for maximum LinkedIn visibility.</p>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">What's happening</div>
              <Link to="/upload" className="panel-item">
                <div className="panel-item-title">Create your first post</div>
                <div className="panel-item-subtitle">Turn certificates into content</div>
              </Link>
              <Link to="/github" className="panel-item">
                <div className="panel-item-title">Build in public</div>
                <div className="panel-item-subtitle">Share your GitHub activity</div>
              </Link>
              <Link to="/settings" className="panel-item">
                <div className="panel-item-title">Setup API key</div>
                <div className="panel-item-subtitle">Required for AI generation</div>
              </Link>
            </div>
            <div className="panel">
              <div className="panel-header">Trending topics</div>
              <div className="panel-item">
                <div className="panel-item-meta"><span className="panel-item-subtitle">Technology</span></div>
                <div className="panel-item-title">#BuildInPublic</div>
                <div className="panel-item-subtitle">12.5K posts</div>
              </div>
              <div className="panel-item">
                <div className="panel-item-meta"><span className="panel-item-subtitle">Career</span></div>
                <div className="panel-item-title">#OpenToWork</div>
                <div className="panel-item-subtitle">8.2K posts</div>
              </div>
            </div>
          </>
        );

      case '/upload':
        return (
          <>
            <div className="tip-card">
              <div className="tip-icon"><Sparkles size={20} /></div>
              <div className="tip-content">
                <h4>Writing tips</h4>
                <p>Include specific skills and how they'll help your career.</p>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">Post checklist</div>
              <div className="panel-item">
                <div className="panel-item-title">✓ Hook in first line</div>
                <div className="panel-item-subtitle">Grab attention immediately</div>
              </div>
              <div className="panel-item">
                <div className="panel-item-title">✓ Add personal story</div>
                <div className="panel-item-subtitle">Make it relatable</div>
              </div>
              <div className="panel-item">
                <div className="panel-item-title">✓ Clear call-to-action</div>
                <div className="panel-item-subtitle">Encourage engagement</div>
              </div>
            </div>
          </>
        );

      case '/queue':
        return (
          <>
            <div className="panel">
              <div className="panel-header">Queue tips</div>
              <div className="panel-item">
                <div className="panel-item-title">Best posting times</div>
                <div className="panel-item-subtitle">Tue-Thu, 8-10am or 12pm</div>
              </div>
              <div className="panel-item">
                <div className="panel-item-title">Engagement window</div>
                <div className="panel-item-subtitle">Reply to comments in first hour</div>
              </div>
            </div>
            <div className="tip-card">
              <div className="tip-icon"><TrendingUp size={20} /></div>
              <div className="tip-content">
                <h4>Boost reach</h4>
                <p>Edit posts before publishing to add personal touches.</p>
              </div>
            </div>
          </>
        );

      case '/settings':
        return (
          <>
            <div className="panel">
              <div className="panel-header">Resources</div>
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="panel-item">
                <div className="panel-item-title">Get Groq API Key <ExternalLink size={14} style={{ marginLeft: 4 }} /></div>
                <div className="panel-item-subtitle">Free tier available</div>
              </a>
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="panel-item">
                <div className="panel-item-title">GitHub Tokens <ExternalLink size={14} style={{ marginLeft: 4 }} /></div>
                <div className="panel-item-subtitle">For private repos (optional)</div>
              </a>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {loading && <PageLoader />}
      </AnimatePresence>

      {!loading && (
        <GitHubContext.Provider value={{ githubRepos, setGithubRepos, selectedRepos, setSelectedRepos, onRepoSelect, setOnRepoSelect }}>
          {location.pathname === '/login' ? (
            <Routes>
              <Route path="/login" element={<Login />} />
            </Routes>
          ) : (
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/github" element={<GitHub />} />
                  <Route path="/queue" element={<Queue />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* Redirect any unknown route to home (or 404) */}
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </main>
              <RightSidebar>
                {getRightSidebarContent()}
              </RightSidebar>
            </div>
          )}
        </GitHubContext.Provider>
      )}
    </>
  );
}

export default App;
