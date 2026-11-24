import { Heart, MapPin, Users, X } from 'lucide-react';
import { useState } from 'react';
import { TRANSLATIONS } from '../i18n';
import type { Language, Team, User } from '../types';
import { SportIcon, TeamCrest } from './SportIcon';

interface TeamsViewProps {
  lang: Language;
  teams: Team[];
  favorites: number[];
  user: User | null;
  onToggleFavorite: (teamId: number) => void;
  onRequireLogin: () => void;
}

export function TeamsView({
  lang,
  teams,
  favorites,
  user,
  onToggleFavorite,
  onRequireLogin,
}: TeamsViewProps) {
  const t = TRANSLATIONS[lang];
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const visibleTeams = onlyFavorites
    ? teams.filter((team) => favorites.includes(team.id))
    : teams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
            {t.teams.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.teams.subtitle}
          </p>
        </div>

        <div className="inline-flex items-center p-1 rounded-lg bg-slate-200/70 dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setOnlyFavorites(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !onlyFavorites
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            {t.teams.allTeams}
          </button>
          <button
            type="button"
            onClick={() => setOnlyFavorites(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              onlyFavorites
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            {t.teams.favoritesOnly} ({favorites.length})
          </button>
        </div>
      </div>

      {visibleTeams.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          {t.teams.noTeams}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleTeams.map((team) => {
            const isFav = favorites.includes(team.id);
            const totalPlayed = team.wins + team.draws + team.losses;
            const winPct = totalPlayed > 0 ? Math.round((team.wins / totalPlayed) * 100) : 0;

            return (
              <div
                key={team.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamCrest shortCode={team.short_code} color={team.logo_color} size="lg" />
                      <div className="min-w-0">
                        <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white truncate">
                          {team.name}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <SportIcon sport={team.sport} className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{t.sports[team.sport]}</span>
                          <span>·</span>
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{team.city}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => (user ? onToggleFavorite(team.id) : onRequireLogin())}
                      aria-label={isFav ? t.teams.following : t.teams.follow}
                      title={user ? (isFav ? t.teams.following : t.teams.follow) : t.teams.loginToFollow}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 cursor-pointer ${
                        isFav
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline">
                        {isFav ? t.teams.following : t.teams.follow}
                      </span>
                    </button>
                  </div>

                  {/* Team Stats Grid (Tabular Numerals) */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <div className="font-mono tabular-nums text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {team.wins}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.teams.wins}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono tabular-nums text-lg font-bold text-slate-700 dark:text-slate-300">
                        {team.draws}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.teams.draws}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono tabular-nums text-lg font-bold text-rose-600 dark:text-rose-400">
                        {team.losses}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.teams.losses}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono tabular-nums text-lg font-bold text-blue-600 dark:text-blue-400">
                        {team.points}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.teams.points}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {team.roster.length} {t.teams.playersCount} · {winPct}% Win
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTeam(team)}
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.teams.roster}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Roster & Stats Modal */}
      {selectedTeam && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <TeamCrest
                  shortCode={selectedTeam.short_code}
                  color={selectedTeam.logo_color}
                  size="md"
                />
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white truncate">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.sports[selectedTeam.sport]} · {selectedTeam.city}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                aria-label={t.common.close}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 text-center">
                <div>
                  <div className="font-mono tabular-nums text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedTeam.wins}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.teams.wins}
                  </div>
                </div>
                <div>
                  <div className="font-mono tabular-nums text-base font-bold text-slate-700 dark:text-slate-300">
                    {selectedTeam.draws}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.teams.draws}
                  </div>
                </div>
                <div>
                  <div className="font-mono tabular-nums text-base font-bold text-rose-600 dark:text-rose-400">
                    {selectedTeam.losses}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.teams.losses}
                  </div>
                </div>
                <div>
                  <div className="font-mono tabular-nums text-base font-bold text-blue-600 dark:text-blue-400">
                    {selectedTeam.points}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.teams.points}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {t.teams.roster}
                </h3>
                {selectedTeam.roster.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    —
                  </p>
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/70 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <th className="py-2 px-3 w-14">{t.teams.playerNumber}</th>
                          <th className="py-2 px-3">{t.teams.playerName}</th>
                          <th className="py-2 px-3 text-right">{t.teams.playerPosition}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {selectedTeam.roster.map((player, idx) => (
                          <tr key={`${player.number}-${idx}`}>
                            <td className="py-2.5 px-3 font-mono tabular-nums text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {player.number}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                              {player.name}
                            </td>
                            <td className="py-2.5 px-3 text-right text-xs text-slate-500 dark:text-slate-400">
                              {player.position}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
