import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { Navbar } from './components/Navbar';
import { NewsModal } from './components/NewsModal';
import { ResultsView } from './components/ResultsView';
import { ScheduleView } from './components/ScheduleView';
import { TeamsView } from './components/TeamsView';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { TRANSLATIONS } from './i18n';
import type {
  Language,
  Match,
  NewsItem,
  PageView,
  PortalMeta,
  SportType,
  Team,
  User,
} from './types';

export default function App() {
  const [lang, setLang] = useState<Language>('kaa');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeView, setActiveView] = useState<PageView>('dashboard');
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const [meta, setMeta] = useState<PortalMeta | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [syncingApi, setSyncingApi] = useState(false);
  const [apiSyncNotice, setApiSyncNotice] = useState<string | null>(null);

  // Keep <html> dark class synchronized with theme state
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const fetchAllData = useCallback(async () => {
    try {
      const [metaRes, teamsRes, matchesRes, newsRes] = await Promise.all([
        api.getMeta(),
        api.getTeams({ sport: selectedSport, search: searchQuery }),
        api.getMatches({ sport: selectedSport, search: searchQuery }),
        api.getNews({ sport: selectedSport, search: searchQuery }),
      ]);
      setMeta(metaRes);
      setTeams(teamsRes.teams);
      setMatches(matchesRes.matches);
      setNews(newsRes.news);
    } catch {
      // Preserve last known state on transient network hiccups
    } finally {
      setLoading(false);
    }
  }, [selectedSport, searchQuery]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Real-time 15s auto-refresh polling when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchAllData();
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchAllData]);

  const loadFavorites = useCallback(async (loggedInUser: User | null) => {
    if (!loggedInUser || loggedInUser.id <= 0) {
      setFavorites([]);
      return;
    }
    try {
      const res = await api.getFavorites();
      setFavorites(res.favorites);
    } catch {
      setFavorites([]);
    }
  }, []);

  const handleAuthenticated = (token: string, nextUser: User) => {
    api.setToken(token);
    setUser(nextUser);
    loadFavorites(nextUser);
  };

  const handleLogout = () => {
    api.setToken(null);
    setUser(null);
    setFavorites([]);
  };

  const handleToggleFavorite = async (teamId: number) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await api.toggleFavorite(teamId);
      setFavorites(res.favorites);
    } catch {
      // Ignore if guest admin without DB user id
    }
  };

  const handleSyncExternalApi = async () => {
    setSyncingApi(true);
    setApiSyncNotice(null);
    try {
      const res = await api.syncExternalSportsFeed();
      if (res.synced) {
        setApiSyncNotice(
          `TheSportsDB API: ${res.upsertedCount ?? 0} real matches synced.`
        );
      } else if (res.message) {
        setApiSyncNotice(res.message);
      }
      await fetchAllData();
    } catch (err) {
      setApiSyncNotice(
        err instanceof Error ? err.message : 'Unable to reach external sports API.'
      );
    } finally {
      setSyncingApi(false);
    }
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 pb-16 md:pb-0">
      <Navbar
        lang={lang}
        activeView={activeView}
        onNavigate={setActiveView}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <WorkspaceToolbar
        lang={lang}
        onChangeLang={setLang}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
        syncingApi={syncingApi}
        onSyncApi={handleSyncExternalApi}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800/70" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800/70" />
              ))}
            </div>
          </div>
        ) : activeView === 'dashboard' ? (
          <DashboardView
            lang={lang}
            matches={matches}
            news={news}
            meta={meta}
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
            onNavigate={setActiveView}
            onSelectNews={setSelectedNews}
            apiSyncNotice={apiSyncNotice}
          />
        ) : activeView === 'schedule' ? (
          <ScheduleView lang={lang} matches={matches} />
        ) : activeView === 'results' ? (
          <ResultsView lang={lang} matches={matches} />
        ) : activeView === 'teams' ? (
          <TeamsView
            lang={lang}
            teams={teams}
            favorites={favorites}
            user={user}
            onToggleFavorite={handleToggleFavorite}
            onRequireLogin={() => setAuthModalOpen(true)}
          />
        ) : (
          <AdminView
            lang={lang}
            user={user}
            meta={meta}
            teams={teams}
            matches={matches}
            news={news}
            onAuthenticated={handleAuthenticated}
            onDataChanged={fetchAllData}
            onSyncExternalApi={handleSyncExternalApi}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070B14] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="font-display font-semibold text-slate-700 dark:text-slate-300">
            {t.brand} · 2026
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t.nav.dashboard}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('schedule')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t.nav.schedule}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('results')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t.nav.results}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('teams')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t.nav.teams}
            </button>
          </div>
        </div>
      </footer>

      <AuthModal
        lang={lang}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      <NewsModal
        lang={lang}
        item={selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
}
