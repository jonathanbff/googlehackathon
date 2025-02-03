import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart3, Home, User, Settings, Activity, Diamond } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from './components/LanguageSwitcher';
import LandingPage from './pages/LandingPage';
import GameAnalysis from './pages/GameAnalysis';
import PlayerStats from './pages/PlayerStats';
import PlayerDashboard from './pages/PlayerDashboard';
import PlayerProfile from './pages/PlayerProfile';
import CommentarySettings from './pages/CommentarySettings';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="min-h-screen bg-[#0A1A2F] text-white">
        <nav className="fixed top-0 w-full z-50 bg-[#0A1A2F]/95 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Diamond className="w-8 h-8 text-[#00FFC2]" />
                <span className="font-bold text-xl">HighlightIQ</span>
              </Link>
              
              <div className="hidden md:flex space-x-8">
                <NavLink to="/" icon={<Home className="w-4 h-4" />} text={t('navigation.home')} />
                <NavLink to="/analysis" icon={<Activity className="w-4 h-4" />} text={t('navigation.liveAnalysis')} />
                <NavLink to="/stats" icon={<BarChart3 className="w-4 h-4" />} text={t('navigation.stats')} />
                <NavLink to="/players" icon={<User className="w-4 h-4" />} text={t('navigation.players')} />
                <NavLink to="/settings" icon={<Settings className="w-4 h-4" />} text={t('navigation.settings')} />
              </div>

              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <button className="bg-[#00FFC2] text-[#0A1A2F] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#00FFC2]/90 transition-all">
                  {t('auth.signIn')}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-16">
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFC2]"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/analysis" element={<GameAnalysis />} />
              <Route path="/stats" element={<PlayerStats />} />
              <Route path="/players" element={<PlayerDashboard />} />
              <Route path="/players/:id" element={<PlayerProfile />} />
              <Route path="/settings" element={<CommentarySettings />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, text }: NavLinkProps) {
  return (
    <Link 
      to={to} 
      className="flex items-center space-x-1 text-gray-300 hover:text-[#00FFC2] transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

export default App;