import { Calendar, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { TRANSLATIONS } from '../i18n';
import type { Language, Match, MatchStatus } from '../types';
import { SportIcon, TeamCrest } from './SportIcon';

interface ScheduleViewProps {
  lang: Language;
  matches: Match[];
}

export function ScheduleView({ lang, matches }: ScheduleViewProps) {
  const t = TRANSLATIONS[lang];
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'all'>('all');

  const filtered = matches.filter((m) =>
    statusFilter === 'all' ? true : m.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
            {t.schedule.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.schedule.subtitle}
          </p>
        </div>

        {/* Segmented Status Filter */}
        <div
          role="group"
          aria-label="Match Status"
          className="inline-flex items-center p-1 rounded-lg bg-slate-200/70 dark:bg-[#0D1424] border border-slate-200 dark:border-slate-800 self-start sm:self-auto"
        >
          {(['all', 'upcoming', 'live', 'completed'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {status === 'all' ? t.schedule.allStatuses : t.statuses[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Data Table + Mobile Card List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          {t.schedule.noMatches}
        </div>
      ) : (
        <>
          <div className="hidden lg:block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0A101D]">
                  <th className="py-3.5 px-4">{t.schedule.date} / {t.schedule.time}</th>
                  <th className="py-3.5 px-4">{t.schedule.tournament}</th>
                  <th className="py-3.5 px-4">{t.schedule.matchup}</th>
                  <th className="py-3.5 px-4">{t.schedule.venue}</th>
                  <th className="py-3.5 px-4 text-right">{t.schedule.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{m.match_date}</div>
                      <div>{m.match_time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                        <SportIcon sport={m.sport} className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{m.tournament_name}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.sports[m.sport]} {m.round_label ? `· ${m.round_label}` : ''} · {m.data_source === 'thesportsdb' ? t.common.liveApiTag : t.common.demoTag}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <TeamCrest shortCode={m.home_team_code} color={m.home_team_color} size="sm" />
                          <span className="font-semibold text-slate-950 dark:text-white truncate">
                            {m.home_team_name}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                          {m.home_score !== null && m.away_score !== null
                            ? `${m.home_score} : ${m.away_score}`
                            : 'vs'}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <TeamCrest shortCode={m.away_team_code} color={m.away_team_color} size="sm" />
                          <span className="font-semibold text-slate-950 dark:text-white truncate">
                            {m.away_team_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {m.venue}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold ${
                          m.status === 'live'
                            ? 'text-blue-600 dark:text-blue-400'
                            : m.status === 'completed'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t.statuses[m.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                    {t.sports[m.sport]} · {m.tournament_name}
                  </span>
                  <span
                    className={`font-semibold shrink-0 ${
                      m.status === 'live'
                        ? 'text-blue-600 dark:text-blue-400'
                        : m.status === 'completed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {t.statuses[m.status]}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamCrest shortCode={m.home_team_code} color={m.home_team_color} size="sm" />
                    <span className="text-sm font-semibold text-slate-950 dark:text-white truncate">
                      {m.home_team_name}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white shrink-0">
                    {m.home_score !== null && m.away_score !== null
                      ? `${m.home_score} : ${m.away_score}`
                      : 'vs'}
                  </span>
                  <div className="flex items-center justify-end gap-2 min-w-0">
                    <span className="text-sm font-semibold text-slate-950 dark:text-white truncate text-right">
                      {m.away_team_name}
                    </span>
                    <TeamCrest shortCode={m.away_team_code} color={m.away_team_color} size="sm" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <Calendar className="w-3.5 h-3.5" />
                    {m.match_date}
                    <Clock className="w-3.5 h-3.5 ml-1" />
                    {m.match_time}
                  </span>
                  <span className="inline-flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {m.venue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
