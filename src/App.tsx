import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

// Pages
import Home from './pages/Home';
import Settings from './pages/Settings';

// Feature pages  
import ReviewsScanPage from './pages/reviews-scan/ReviewsScanPage';
import ASOScanPage from './pages/aso-scan/ASOScanPage';
import IdeaScanPage from './pages/idea-scan/IdeaScanPage';
import SocialsScanPage from './pages/socials-scan/SocialsScanPage';
import OTGControlPage from './pages/otg-control/OTGControlPage';
import VoiceControlPage from './pages/voice-control/VoiceControlPage';

// Components
import UniversalHeader from './components/header/UniversalHeader';
import { useScrollToTop } from './hooks/useScrollToTop';

/**
 * Component that automatically scrolls to top on route changes
 */
function ScrollToTop() {
  useScrollToTop();
  return null;
}

/**
 * Component that manages document head elements (title, meta tags)
 * and tracks page views for analytics
 */
function DocumentHead() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    document.title = "Julian Ivaldy | Open tools";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', "Julian Ivaldy | Open tools");
    
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');
    
    let metaGooglebot = document.querySelector('meta[name="googlebot"]');
    if (!metaGooglebot) {
      metaGooglebot = document.createElement('meta');
      metaGooglebot.setAttribute('name', 'googlebot');
      document.head.appendChild(metaGooglebot);
    }
    metaGooglebot.setAttribute('content', 'noindex, nofollow');
    
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'pageview',
        page: pathname
      });
    }
  }, [pathname]);
  
  return null;
}

/**
 * Main application content component that handles routing and layout
 */
function AppContent() {
  const { pathname } = useLocation();
  
  return (
    <>
      <DocumentHead />
      <ScrollToTop />
      <UniversalHeader />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reviews-scan" element={<ReviewsScanPage />} />
          <Route path="/aso-scan" element={<ASOScanPage />} />
          <Route path="/idea-scan" element={<IdeaScanPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/socials-scan" element={<SocialsScanPage />} />
          <Route path="/otg-control" element={<OTGControlPage />} />
          <Route path="/voice-control" element={<VoiceControlPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

/**
 * Root App component that provides routing context
 */
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
