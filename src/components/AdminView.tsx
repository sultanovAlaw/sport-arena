import {
  CheckCircle2,
  Edit3,
  Newspaper,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { api } from '../api';
import { getNewsLocalized, SPORTS_LIST, TRANSLATIONS } from '../i18n';
import type {
  Language,
  Match,
  MatchStatus,
  NewsItem,
  PortalMeta,
  SportType,
  Team,
  User,
} from '../types';
import { TeamCrest } from './SportIcon';

interface AdminViewProps {
  lang: Language;
  user: User | null;
  meta: PortalMeta | null;
  teams: Team[];
  matches: Match[];
  news: NewsItem[];
  onAuthenticated: (token: string, user: User) => void;
  onDataChanged: () => Promise<void>;
  onSyncExternalApi: () => Promise<void>;
}

const NEWS_IMAGES = [
  { label: 'Stadium Arena', url: '/src/assets/images/hero_stadium_arena_1795530617564.jpg' },
  { label: 'Football Match', url: '/src/assets/images/news_football_match_1795530617785.jpg' },
  { label: 'Basketball Court', url: '/src/assets/images/news_basketball_court_1795530619079.jpg' },
  { label: 'Boxing / Wrestling', url: '/src/assets/images/news_combat_boxing_1795530618721.jpg' },
  { label: 'Chess Championship', url: '/src/assets/images/news_chess_championship_1795530618998.jpg' },
];

export function AdminView({
  lang,
  user,
  meta,
  teams,
  matches,
  news,
  onAuthenticated,
  onDataChanged,
  onSyncExternalApi,
}: AdminViewProps) {
  const t = TRANSLATIONS[lang];

  // Auth / First-run setup form state
  const [authName, setAuthName] = useState('Arena Admin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Admin workspace tabs
  const [activeTab, setActiveTab] = useState<'matches' | 'scores' | 'teams' | 'news'>('matches');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Match Form State
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [tournamentName, setTournamentName] = useState('');
  const [matchSport, setMatchSport] = useState<SportType>('football');
  const [matchDate, setMatchDate] = useState('2026-11-29');
  const [matchTime, setMatchTime] = useState('18:00');
  const [venue, setVenue] = useState('');
  const [roundLabel, setRoundLabel] = useState('');
  const [homeTeamId, setHomeTeamId] = useState<number>(0);
  const [awayTeamId, setAwayTeamId] = useState<number>(0);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('upcoming');
  const [homeScoreInput, setHomeScoreInput] = useState<string>('');
  const [awayScoreInput, setAwayScoreInput] = useState<string>('');

  // Quick Score Editor State (keyed by match id)
  const [scoreEdits, setScoreEdits] = useState<
    Record<number, { home: string; away: string; status: MatchStatus }>
  >({});

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [teamSport, setTeamSport] = useState<SportType>('football');
  const [teamCity, setTeamCity] = useState('');
  const [teamColor, setTeamColor] = useState('#2563EB');
  const [rosterText, setRosterText] = useState('1, Azamat, GK\n10, Timur, FW');

  // News Form State
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsSport, setNewsSport] = useState<SportType>('football');
  const [newsImage, setNewsImage] = useState(NEWS_IMAGES[1].url);

  const showSuccess = (msg: string) => {
    setErrorMsg(null);
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  // First-run admin claim or login
  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const needsClaim = meta && !meta.hasAdmin && !meta.envAdminConfigured;
      const res = needsClaim
        ? await api.bootstrapAdmin({ name: authName, email: authEmail, password: authPassword })
        : await api.login({ email: authEmail, password: authPassword });

      if (res.user.role !== 'admin') {
        setAuthError(t.admin.notAdminError);
        return;
      }
      onAuthenticated(res.token, res.user);
      setAuthPassword('');
      await onDataChanged();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    const needsFirstRunClaim = meta && !meta.hasAdmin && !meta.envAdminConfigured;
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white">
              {needsFirstRunClaim ? t.admin.claimTitle : t.admin.loginTitle}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {needsFirstRunClaim ? t.admin.claimSubtitle : t.admin.loginSubtitle}
            </p>
          </div>

          {user && user.role !== 'admin' && (
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t.admin.notAdminError}</span>
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
            {needsFirstRunClaim && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.auth.name}
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.auth.email}
              </label>
              <input
                type="email"
                required
                placeholder="admin@sportarena.uz"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.auth.password}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {authLoading
                ? t.common.loading
                : needsFirstRunClaim
                  ? t.admin.claimButton
                  : t.auth.submitLogin}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter teams matching selected match sport (or fallback to all teams)
  const sportTeams = teams.filter((tm) => tm.sport === matchSport);
  const availableTeams = sportTeams.length >= 2 ? sportTeams : teams;

  const resetMatchForm = () => {
    setEditingMatchId(null);
    setTournamentName('');
    setVenue('');
    setRoundLabel('');
    setHomeScoreInput('');
    setAwayScoreInput('');
    setMatchStatus('upcoming');
  };

  const handleEditMatch = (m: Match) => {
    setEditingMatchId(m.id);
    setTournamentName(m.tournament_name);
    setMatchSport(m.sport);
    setMatchDate(m.match_date);
    setMatchTime(m.match_time);
    setVenue(m.venue);
    setRoundLabel(m.round_label || '');
    setHomeTeamId(m.home_team_id);
    setAwayTeamId(m.away_team_id);
    setMatchStatus(m.status);
    setHomeScoreInput(m.home_score !== null ? String(m.home_score) : '');
    setAwayScoreInput(m.away_score !== null ? String(m.away_score) : '');
    setActiveTab('matches');
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const chosenHome = homeTeamId || availableTeams[0]?.id;
    const chosenAway =
      awayTeamId || availableTeams.find((tm) => tm.id !== chosenHome)?.id || availableTeams[1]?.id;

    if (!chosenHome || !chosenAway || chosenHome === chosenAway) {
      setErrorMsg('Select two different teams');
      return;
    }

    try {
      const payload = {
        tournament_name: tournamentName,
        sport: matchSport,
        match_date: matchDate,
        match_time: matchTime,
        venue,
        round_label: roundLabel,
        home_team_id: chosenHome,
        away_team_id: chosenAway,
        status: matchStatus,
        home_score: homeScoreInput === '' ? null : Number(homeScoreInput),
        away_score: awayScoreInput === '' ? null : Number(awayScoreInput),
      };

      if (editingMatchId) {
        await api.updateMatch(editingMatchId, payload);
      } else {
        await api.createMatch(payload);
      }
      resetMatchForm();
      await onDataChanged();
      showSuccess(t.admin.savedNotice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save match');
    }
  };

  const handleDeleteMatch = async (id: number) => {
    try {
      await api.deleteMatch(id);
      await onDataChanged();
      showSuccess(t.admin.savedNotice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleQuickScoreSave = async (m: Match) => {
    const edit = scoreEdits[m.id] || {
      home: m.home_score !== null ? String(m.home_score) : '0',
      away: m.away_score !== null ? String(m.away_score) : '0',
      status: m.status,
    };

    try {
      await api.updateMatch(m.id, {
        home_score: edit.home === '' ? null : Number(edit.home),
        away_score: edit.away === '' ? null : Number(edit.away),
        status: edit.status,
      });
      await onDataChanged();
      showSuccess(t.admin.savedNotice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Score update failed');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsedRoster = rosterText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split(',').map((s) => s.trim());
        return {
          number: Number(parts[0]) || idx + 1,
          name: parts[1] || parts[0] || `Player ${idx + 1}`,
          position: parts[2] || 'Player',
        };
      });

    try {
      await api.createTeam({
        name: teamName,
        short_code: shortCode,
        sport: teamSport,
        city: teamCity,
        logo_color: teamColor,
        roster: parsedRoster,
      });
      setTeamName('');
      setShortCode('');
      setTeamCity('');
      await onDataChanged();
      showSuccess(t.admin.savedNotice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create team');
    }
  };

  const handleDeleteTeam = async (id: number) => {
    try {
      await api.deleteTeam(id);
      await onDataChanged();
      showSuccess(t.admin.savedNotice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await api.createNews({
        title_kaa: newsTitle,
        summary_kaa: newsSummary,
        content_kaa: newsContent || newsSummary,
        sport: newsSport,
        image_url: newsImage,
        author_name: user.name,
      });
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      await onDataChanged();
      showSuccess(t.admin.savedNotice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to publish news');
    }
  };

  const handleDeleteNews = async (id: number) => {
    try {
      await api.deleteNews(id);
      await onDataChanged();
      showSuccess(t.admin.savedNotice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      await onDataChanged();
      showSuccess(t.admin.savedNotice);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Reset failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
            {t.admin.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.admin.subtitle}
          </p>
        </div>

        {/* Admin Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800">
          {(
            [
              { id: 'matches', label: t.admin.tabs.matches, icon: Plus },
              { id: 'scores', label: t.admin.tabs.scores, icon: Trophy },
              { id: 'teams', label: t.admin.tabs.teams, icon: Users },
              { id: 'news', label: t.admin.tabs.news, icon: Newspaper },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-sm text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* TAB 1: Matches & Schedule CRUD */}
      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleSaveMatch}
            className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white">
              {editingMatchId ? t.admin.editMatch : t.admin.addMatch}
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                {t.schedule.tournament}
              </label>
              <input
                type="text"
                required
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Qaraqalpaqstan Super Ligası"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Sport
                </label>
                <select
                  value={matchSport}
                  onChange={(e) => {
                    const nextSport = e.target.value as SportType;
                    setMatchSport(nextSport);
                    const matching = teams.filter((tm) => tm.sport === nextSport);
                    if (matching.length >= 2) {
                      setHomeTeamId(matching[0].id);
                      setAwayTeamId(matching[1].id);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {SPORTS_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {t.sports[sp]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.schedule.status}
                </label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value as MatchStatus)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {(['upcoming', 'live', 'completed'] as MatchStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {t.statuses[st]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.homeTeam}
                </label>
                <select
                  value={homeTeamId || availableTeams[0]?.id || ''}
                  onChange={(e) => setHomeTeamId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {availableTeams.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.awayTeam}
                </label>
                <select
                  value={awayTeamId || availableTeams[1]?.id || ''}
                  onChange={(e) => setAwayTeamId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {availableTeams.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.schedule.date}
                </label>
                <input
                  type="date"
                  required
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.schedule.time}
                </label>
                <input
                  type="time"
                  required
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.schedule.venue}
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Turon Stadionı, Nókis"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.roundLabel}
                </label>
                <input
                  type="text"
                  value={roundLabel}
                  onChange={(e) => setRoundLabel(e.target.value)}
                  placeholder="15-tur"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.homeTeam} Score
                </label>
                <input
                  type="number"
                  min={0}
                  value={homeScoreInput}
                  onChange={(e) => setHomeScoreInput(e.target.value)}
                  placeholder="—"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.awayTeam} Score
                </label>
                <input
                  type="number"
                  min={0}
                  value={awayScoreInput}
                  onChange={(e) => setAwayScoreInput(e.target.value)}
                  placeholder="—"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              >
                {t.admin.saveMatch}
              </button>
              {editingMatchId && (
                <button
                  type="button"
                  onClick={resetMatchForm}
                  className="py-2.5 px-4 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {t.admin.cancelEdit}
                </button>
              )}
            </div>
          </form>

          {/* Existing Matches List */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] divide-y divide-slate-200 dark:divide-slate-800">
            {matches.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.sports[m.sport]} · {m.tournament_name} ·{' '}
                    <span className="font-mono tabular-nums">
                      {m.match_date} {m.match_time}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-white truncate">
                    {m.home_team_name}{' '}
                    <span className="font-mono text-blue-600 dark:text-blue-400 mx-1">
                      {m.home_score !== null && m.away_score !== null
                        ? `${m.home_score}:${m.away_score}`
                        : 'vs'}
                    </span>{' '}
                    {m.away_team_name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.statuses[m.status]} · {m.venue}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditMatch(m)}
                    aria-label={t.common.edit}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMatch(m.id)}
                    aria-label={t.common.delete}
                    className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Quick Score Entry */}
      {activeTab === 'scores' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] divide-y divide-slate-200 dark:divide-slate-800">
          {matches.map((m) => {
            const current = scoreEdits[m.id] || {
              home: m.home_score !== null ? String(m.home_score) : '0',
              away: m.away_score !== null ? String(m.away_score) : '0',
              status: m.status,
            };

            return (
              <div
                key={m.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.sports[m.sport]} · {m.tournament_name} · {m.match_date}
                  </div>
                  <div className="text-sm font-bold text-slate-950 dark:text-white mt-0.5">
                    {m.home_team_name} — {m.away_team_name}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <input
                    type="number"
                    min={0}
                    aria-label={m.home_team_name}
                    value={current.home}
                    onChange={(e) =>
                      setScoreEdits((prev) => ({
                        ...prev,
                        [m.id]: { ...current, home: e.target.value },
                      }))
                    }
                    className="w-16 px-2.5 py-1.5 text-center font-mono tabular-nums text-sm font-bold rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <span className="font-mono font-bold text-slate-400">:</span>
                  <input
                    type="number"
                    min={0}
                    aria-label={m.away_team_name}
                    value={current.away}
                    onChange={(e) =>
                      setScoreEdits((prev) => ({
                        ...prev,
                        [m.id]: { ...current, away: e.target.value },
                      }))
                    }
                    className="w-16 px-2.5 py-1.5 text-center font-mono tabular-nums text-sm font-bold rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />

                  <select
                    value={current.status}
                    onChange={(e) =>
                      setScoreEdits((prev) => ({
                        ...prev,
                        [m.id]: { ...current, status: e.target.value as MatchStatus },
                      }))
                    }
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {(['upcoming', 'live', 'completed'] as MatchStatus[]).map((st) => (
                      <option key={st} value={st}>
                        {t.statuses[st]}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleQuickScoreSave(m)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                  >
                    {t.admin.updateScore}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Teams Management */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleCreateTeam}
            className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white">
              {t.admin.addTeam}
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                {t.admin.teamName}
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Qaraqalpaqstan FK"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.shortCode}
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                  placeholder="QRK"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.teams.city}
                </label>
                <input
                  type="text"
                  required
                  value={teamCity}
                  onChange={(e) => setTeamCity(e.target.value)}
                  placeholder="Nókis"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Sport
                </label>
                <select
                  value={teamSport}
                  onChange={(e) => setTeamSport(e.target.value as SportType)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {SPORTS_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {t.sports[sp]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.teamColor}
                </label>
                <input
                  type="color"
                  value={teamColor}
                  onChange={(e) => setTeamColor(e.target.value)}
                  className="w-full h-9 p-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                {t.admin.rosterInput}
              </label>
              <textarea
                rows={4}
                value={rosterText}
                onChange={(e) => setRosterText(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400">{t.admin.rosterHint}</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              {t.common.save}
            </button>
          </form>

          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] divide-y divide-slate-200 dark:divide-slate-800">
            {teams.map((tm) => (
              <div key={tm.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <TeamCrest shortCode={tm.short_code} color={tm.logo_color} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-950 dark:text-white truncate">
                      {tm.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t.sports[tm.sport]} · {tm.city} ·{' '}
                      <span className="font-mono tabular-nums">
                        {tm.wins}W-{tm.draws}D-{tm.losses}L ({tm.points} {t.teams.points})
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTeam(tm.id)}
                  aria-label={t.common.delete}
                  className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: News & Live API Controls */}
      {activeTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-5">
            <form
              onSubmit={handlePublishNews}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 space-y-4"
            >
              <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white">
                {t.admin.publishNews}
              </h2>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.newsTitle}
                </label>
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Sport
                  </label>
                  <select
                    value={newsSport}
                    onChange={(e) => setNewsSport(e.target.value as SportType)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {SPORTS_LIST.map((sp) => (
                      <option key={sp} value={sp}>
                        {t.sports[sp]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    {t.admin.newsImage}
                  </label>
                  <select
                    value={newsImage}
                    onChange={(e) => setNewsImage(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {NEWS_IMAGES.map((img) => (
                      <option key={img.url} value={img.url}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.newsSummary}
                </label>
                <input
                  type="text"
                  required
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {t.admin.newsContent}
                </label>
                <textarea
                  rows={4}
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              >
                {t.admin.publishNews}
              </button>
            </form>

            {/* Data Feed & Reset Controls */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 space-y-3">
              <button
                type="button"
                onClick={onSyncExternalApi}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg bg-blue-600/10 border border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-600/20 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.admin.syncExternal}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDemo}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.admin.resetDemo}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] divide-y divide-slate-200 dark:divide-slate-800">
            {news.map((item) => {
              const loc = getNewsLocalized(item, lang);
              return (
                <div key={item.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t.sports[item.sport]} · <span className="font-mono">{item.published_at}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-950 dark:text-white">
                      {loc.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {loc.summary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNews(item.id)}
                    aria-label={t.common.delete}
                    className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
