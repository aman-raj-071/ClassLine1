import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, GraduationCap, Bell, LogOut, Focus, LogIn, Users } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps { onOpenLogin: (role?: UserRole) => void; }

export const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const {
    currentUser,
    activeView,
    setActiveView,
    focusMode,
    setFocusMode,
    logout,
    showToast,
    notifications,
    markNotificationsRead,
  } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const roleNotifications = currentUser ? notifications.filter((notification) => notification.recipientRole === currentUser.role) : [];
  const unreadNotificationCount = roleNotifications.filter((notification) => !notification.read).length;

  // Notifications remain available from the bell, but the panel should never
  // obstruct the workspace after it has been opened.
  useEffect(() => {
    if (!showNotifications) return;
    const timer = window.setTimeout(() => setShowNotifications(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showNotifications]);

  useEffect(() => setShowNotifications(false), [activeView, currentUser?.username]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fcf9f4]/95 backdrop-blur-md border-b border-[#d4cdc4]/60 shadow-[0_1px_8px_rgba(27,37,51,0.04)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Term Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2.5 text-left group"
            title="ClassLine Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1a1410] flex items-center justify-center text-[#d4e8da] group-hover:bg-[#2e2620] transition-colors shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-lg font-medium text-[#1a1410] leading-none tracking-tight block">
                ClassLine
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-[#6b5a48] mt-0.5">
                Home & School Ledger
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8e2d8] text-xs font-semibold text-[#6b5a48]">
            <GraduationCap className="w-3.5 h-3.5 text-[#2a4a35]" />
            <span>Academic Session 2026–27 &bull; Saraswati Vidya Mandir</span>
          </div>
        </div>

        {/* Center: Navigation Strip */}
        <nav className="hidden md:flex items-center p-1 bg-[#e8e2d8] rounded-full shadow-inner" aria-label="Main Navigation">
          <button
            onClick={() => setActiveView('landing')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeView === 'landing'
                ? 'bg-[#1a1410] text-[#f7f3ed] shadow-sm'
                : 'text-[#5a4f45] hover:text-[#1a1410]'
            }`}
          >
            Overview
          </button>

          <button
            hidden={Boolean(currentUser && currentUser.role !== 'parent')}
            onClick={() => {
              if (!currentUser) {
                onOpenLogin('parent');
              } else if (currentUser.role === 'parent') {
                setActiveView('parent');
              }
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'parent'
                ? 'bg-[#1a1410] text-[#f7f3ed] shadow-sm'
                : 'text-[#5a4f45] hover:text-[#1a1410]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Parent</span> Timeline
          </button>

          <button
            hidden={Boolean(currentUser && currentUser.role !== 'teacher')}
            onClick={() => {
              if (!currentUser) {
                onOpenLogin('teacher');
              } else if (currentUser.role === 'teacher') {
                setActiveView('teacher');
              }
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'teacher'
                ? 'bg-[#1a1410] text-[#f7f3ed] shadow-sm'
                : 'text-[#5a4f45] hover:text-[#1a1410]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Teacher</span> Desk
          </button>
        </nav>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Focus Mode button (Visible in Parent view) */}
          {activeView === 'parent' && (
            <button
              id="focusModeToggle"
              type="button"
              onClick={() => {
                setFocusMode((prev) => !prev);
                showToast(focusMode ? 'Focus mode deactivated.' : 'Focus mode active — cards spotlit!', 'info');
              }}
              aria-pressed={focusMode}
              title="Focus Mode: highlights one card at a time (Press 'F')"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                focusMode
                  ? 'bg-[#1a1410] text-[#f7f3ed] border-[#1a1410] shadow-sm'
                  : 'bg-[#f7f3ed] text-[#6b5a48] border-[#d4cdc4] hover:border-[#1a1410] hover:text-[#1a1410]'
              }`}
            >
              <Focus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus</span>
              {!focusMode && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#3d6b4f] animate-pulse" />
              )}
            </button>
          )}

          {/* Notifications button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!currentUser) { onOpenLogin(); return; }
                setShowNotifications((open) => !open);
                markNotificationsRead(currentUser.role);
              }}
              aria-label="View notifications"
              aria-expanded={showNotifications}
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f3ed] text-[#6b5a48] transition-colors hover:bg-[#ede4d9] hover:text-[#1a1410]"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9b2c2c] px-1 text-[9px] font-bold text-white ring-2 ring-[#fcf9f4]">{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span>}
            </button>
            {showNotifications && currentUser && (
              <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-xl border border-[#d4cdc4] bg-[#fdfaf6] shadow-xl">
                <div className="border-b border-[#e8e2d8] px-4 py-3"><p className="font-serif text-base text-[#1a1410]">Notifications</p><p className="mt-0.5 text-[11px] text-[#6b5a48]">{currentUser.role === 'teacher' ? 'Parent activity and replies' : 'Updates from your teacher'}</p></div>
                <div className="max-h-80 overflow-y-auto">
                  {roleNotifications.length ? roleNotifications.map((notification) => <article key={notification.id} className="border-b border-[#e8e2d8] px-4 py-3 last:border-b-0"><p className="text-xs font-bold text-[#1a1410]">{notification.title}</p><p className="mt-1 text-[11px] leading-relaxed text-[#5a4f45]">{notification.body}</p><p className="mt-1.5 text-[10px] font-semibold text-[#8a6f5a]">{notification.createdAt}</p></article>) : <p className="px-4 py-6 text-center text-xs text-[#6b5a48]">No notifications yet.</p>}
                </div>
              </div>
            )}
          </div>

          {currentUser ? (
            <>
              {/* Profile Pill */}
              <div className="flex items-center gap-2 pl-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
                  style={{
                    backgroundColor: currentUser.role === 'teacher' ? '#d4e8da' : '#ede4d9',
                    color: currentUser.role === 'teacher' ? '#1e3828' : '#4a3c30',
                  }}
                >
                  {getInitials(currentUser.name)}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#1a1410] leading-none">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#6b5a48] mt-0.5">
                    {currentUser.role === 'teacher' ? `Teacher • ${currentUser.class || 'Assigned class'}` : 'Parent account'}
                  </span>
                </div>
              </div>

              {/* Logout button */}
              <button
                id="logoutBtn"
                type="button"
                onClick={logout}
                aria-label="Sign out"
                title="Sign out of ClassLine"
                className="w-8 h-8 rounded-full bg-[#f7f3ed] hover:bg-[#ede4d9] text-[#6b5a48] hover:text-[#9b2c2c] flex items-center justify-center transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#1a1410] text-[#f7f3ed] hover:bg-[#2e2620] shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
