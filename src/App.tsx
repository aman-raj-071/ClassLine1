import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { FeaturesSection } from './components/FeaturesSection';
import { StatsBand } from './components/StatsBand';
import { RolesSection } from './components/RolesSection';
import { TeamSection } from './components/TeamSection';
import { ParentTimeline } from './components/ParentTimeline';
import { TeacherDesk } from './components/TeacherDesk';
import { LoginModal } from './components/LoginModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { WebsiteAssistantWidget } from './components/WebsiteAssistantWidget';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { activeView, currentUser } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<UserRole>('parent');

  const handleOpenLogin = (role: UserRole = 'parent') => {
    setModalRole(role);
    setIsLoginModalOpen(true);
  };

  // A successful sign-in opens a new workspace, so start it at its heading
  // instead of retaining the landing page's previous scroll position.
  useEffect(() => {
    if (!currentUser) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentUser?.username, activeView]);

  const showAccessCodeRoleChoices = () => {
    document.getElementById('access-code-role-choices')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f3ed] text-[#1a1410]">
      {/* Top Header */}
      <Header onOpenLogin={handleOpenLogin} />

      {/* Main View Area */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <div className="animate-in fade-in duration-300">
            <LandingHero onOpenLogin={showAccessCodeRoleChoices} />
            <FeaturesSection />
            <StatsBand />
            <RolesSection onSelectRoleLogin={handleOpenLogin} />
            <TeamSection />
          </div>
        )}

        {activeView === 'parent' && currentUser?.role === 'parent' && (
          <div className="animate-in fade-in duration-300">
            <ParentTimeline />
          </div>
        )}

        {activeView === 'teacher' && currentUser?.role === 'teacher' && (
          <div className="animate-in fade-in duration-300">
            <TeacherDesk />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Login Dialog Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} defaultRole={modalRole} />

      {/* Floating System Toast */}
      <Toast />

      {/* Website-grounded help bot; not used for private parent-teacher chat. */}
      <WebsiteAssistantWidget />
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
