import { Moon, RefreshCw, Search, Sun, Wifi } from 'lucide-react';
import { SPORTS_LIST, TRANSLATIONS } from '../i18n';
import type { Language, SportType } from '../types';

interface WorkspaceToolbarProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSport: SportType | 'all';
  onSelectSport: (sport: SportType | 'all') => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  syncingApi: boolean;
  onSyncApi: () => void;
}

export function WorkspaceToolbar({
  lang,
  onChangeLang,
  theme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  selectedSport,
  onSelectSport,
  autoRefresh,
  onToggleAutoRefresh,
  syncingApi,
  onSyncApi,
}: WorkspaceToolbarProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3">
        {/* Top Row: Search + Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.toolbar.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Auto-Refresh Toggle */}
            <button
              type="button"
              onClick={onToggleAutoRefresh}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                autoRefresh
                  ? 'bg-blue-600/10 border-blue-500/40 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>{autoRefresh ? t.toolbar.autoRefreshOn : t.toolbar.autoRefreshOff}</span>
            </button>

            {/* Real External API Sync */}
            <button
              type="button"
              onClick={onSyncApi}
              disabled={syncingApi}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingApi ? 'animate-spin' : ''}`} />
              <span>{syncingApi ? t.toolbar.syncing : t.toolbar.syncApi}</span>
            </button>

            {/* Language Selector */}
            <div
              role="group"
              aria-label="Language"
              className="inline-flex items-center p-0.5 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800"
            >
              {(['kaa', 'uz', 'en'] as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    lang === code
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? t.toolbar.lightMode : t.toolbar.darkMode}
              title={theme === 'dark' ? t.toolbar.lightMode : t.toolbar.darkMode}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500/50 transition-colors shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Sport Filter Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => onSelectSport('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedSport === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40'
            }`}
          >
            {t.toolbar.allSports}
          </button>
          {SPORTS_LIST.map((sport) => (
            <button
              key={sport}
              type="button"
              onClick={() => onSelectSport(sport)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSport === sport
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40'
              }`}
            >
              {t.sports[sport]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
