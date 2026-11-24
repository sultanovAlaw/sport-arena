import { Calendar, MapPin, Trophy } from 'lucide-react';
import { TRANSLATIONS } from '../i18n';
import type { Language, Match } from '../types';
import { TeamCrest } from './SportIcon';

interface ResultsViewProps {
  lang: Language;
  matches: Match[];
}

export function ResultsView({ lang, matches }: ResultsViewProps) {
  const t = TRANSLATIONS[lang];

  const liveMatches = matches.filter((m) => m.status === 'live');
  const completedMatches = matches.filter((m) => m.status === 'completed');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
          {t.results.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t.results.subtitle}
        </p>
      </div>

      {/* Live Scoreboards */}
      {liveMatches.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-blue-600 dark:text-blue-400">
            {t.results.liveNow}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {liveMatches.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-blue-500/40 bg-white dark:bg-[#0D1424] p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium truncate">
                    {t.sports[m.sport]} · {m.tournament_name}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    {t.statuses.live} {m.round_label ? `· ${m.round_label}` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamCrest shortCode={m.home_team_code} color={m.home_team_color} size="md" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-950 dark:text-white truncate">
                        {m.home_team_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {m.home_team_city}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {m.home_score ?? 0} : {m.away_score ?? 0}
                  </div>

                  <div className="flex items-center justify-end gap-3 min-w-0 text-right">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-950 dark:text-white truncate">
                        {m.away_team_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {m.away_team_city}
                      </div>
                    </div>
                    <TeamCrest shortCode={m.away_team_code} color={m.away_team_color} size="md" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {m.venue}
                  </span>
                  <span className="font-mono tabular-nums shrink-0">
                    {m.match_date} · {m.match_time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Match History */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-950 dark:text-white">
          {t.results.historyTitle}
        </h2>

        {completedMatches.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {t.results.noResults}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedMatches.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate">
                    {t.sports[m.sport]} · {m.tournament_name}
                  </span>
                  <span className="font-mono tabular-nums inline-flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {m.match_date} · {m.match_time}
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TeamCrest shortCode={m.home_team_code} color={m.home_team_color} size="sm" />
                    <span
                      className={`text-sm truncate ${
                        m.winner_team_id === m.home_team_id
                          ? 'font-bold text-slate-950 dark:text-white'
                          : 'font-medium text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.home_team_name}
                    </span>
                  </div>

                  <div className="font-mono tabular-nums text-xl font-bold text-slate-950 dark:text-white px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {m.home_score ?? '-'} : {m.away_score ?? '-'}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 min-w-0 text-right">
                    <span
                      className={`text-sm truncate ${
                        m.winner_team_id === m.away_team_id
                          ? 'font-bold text-slate-950 dark:text-white'
                          : 'font-medium text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.away_team_name}
                    </span>
                    <TeamCrest shortCode={m.away_team_code} color={m.away_team_color} size="sm" />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 truncate">
                    {m.venue} {m.round_label ? `· ${m.round_label}` : ''}
                  </span>
                  {m.winner_team_name ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>
                        {t.results.winner}: {m.winner_team_name}
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">
                      {t.results.draw}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
