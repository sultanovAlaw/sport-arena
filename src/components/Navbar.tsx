import { Calendar, Home, LogIn, LogOut, ShieldCheck, Trophy, Users } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';
import type { Language, PageView, User } from '../types';

interface NavbarProps {
  lang: Language;
  activeView: PageView;
  onNavigate: (view: PageView) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Navbar({
  lang,
  activeView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
}: NavbarProps) {
  const t = TRANSLATIONS[lang];

  const navItems: Array<{ id: PageView; label: string }> = [
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'schedule', label: t.nav.schedule },
    { id: 'results', label: t.nav.results },
    { id: 'teams', label: t.nav.teams },
    { id: 'admin', label: t.nav.admin },
  ];

  const mobileTabs: Array<{ id: PageView; label: string; icon: typeof Home }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Home },
    { id: 'schedule', label: t.nav.schedule, icon: Calendar },
    { id: 'results', label: t.nav.results, icon: Trophy },
    { id: 'teams', label: t.nav.teams, icon: Users },
    { id: 'admin', label: t.nav.admin, icon: ShieldCheck },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="font-display text-lg md:text-xl font-extrabold tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
          >
            <svg
              viewBox="0 0 28 28"
              className="w-7 h-7 text-blue-600 dark:text-blue-500 shrink-0"
              fill="none"
              aria-hidden="true"
            >
              <rect width="28" height="28" rx="6" fill="currentColor" />
              <path
                d="M7 18.5L11.5 9.5L15.5 16L18.5 11.5L21 18.5H7Z"
                fill="white"
              />
            </svg>
            <span>{t.brand}</span>
          </button>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7"
          >
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            {user ? (
              <button
                type="button"
                onClick={onLogout}
                title={`${user.name} (${user.email})`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="max-w-[120px] truncate">{user.name}</span>
                <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.auth.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Thumb Zone) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
      >
        <div className="grid grid-cols-5 h-14">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-medium transition-colors ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="truncate max-w-[64px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
