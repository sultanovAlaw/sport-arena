import { ArrowRight, Calendar, Clock, Info, MapPin, Trophy } from 'lucide-react';
import { useState } from 'react';
import { getNewsLocalized, SPORTS_LIST, TRANSLATIONS } from '../i18n';
import type { Language, Match, NewsItem, PageView, PortalMeta, SportType } from '../types';
import { SportIcon, TeamCrest } from './SportIcon';

interface DashboardViewProps {
  lang: Language;
  matches: Match[];
  news: NewsItem[];
  meta: PortalMeta | null;
  selectedSport: SportType | 'all';
  onSelectSport: (sport: SportType | 'all') => void;
  onNavigate: (view: PageView) => void;
  onSelectNews: (item: NewsItem) => void;
  apiSyncNotice: string | null;
}

export function DashboardView({
  lang,
  matches,
  news,
  meta,
  selectedSport,
  onSelectSport,
  onNavigate,
  onSelectNews,
  apiSyncNotice,
}: DashboardViewProps) {
  const t = TRANSLATIONS[lang];
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [failedNewsImages, setFailedNewsImages] = useState<Record<number, boolean>>({});

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming').slice(0, 4);
  const recentResults = matches.filter((m) => m.status === 'completed').slice(0, 4);
  const featuredMatch = liveMatches[0] || upcomingMatches[0] || matches[0];

  const getSportCount = (sport: SportType) =>
    matches.filter((m) => m.sport === sport).length;

  return (
    <div className="space-y-10">
      {/* Data Source Transparency Notice */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            {apiSyncNotice
              ? apiSyncNotice
              : meta && meta.apiMatchCount > 0
                ? t.dataBanner.hybridNotice
                : t.dataBanner.demoNotice}
          </p>
        </div>
        {meta?.lastSync && (
          <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            {t.dataBanner.lastSync}: {new Date(meta.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Hero Showcase */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 min-h-[340px] lg:min-h-[380px] flex items-stretch">
        {!heroImgFailed ? (
          <img
            src="/src/assets/images/hero_stadium_arena_1795530617564.jpg"
            alt="SPORT ARENA stadium"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#070B14] via-[#0F1E3E] to-[#1D4ED8]/40"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#070B14]/95 via-[#070B14]/80 to-[#070B14]/55"
        />

        <div className="relative z-10 w-full p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-medium tracking-wide text-blue-300">
              {t.dashboard.heroKicker}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.12] text-white [text-wrap:balance]">
              {t.dashboard.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {t.dashboard.heroSubtitle}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('schedule')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{t.dashboard.viewSchedule}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('results')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{t.dashboard.viewResults}</span>
              </button>
            </div>
          </div>

          {/* Featured Match Spotlight */}
          {featuredMatch && (
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-white/15 bg-[#0B1221]/90 backdrop-blur-md p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
                  <span className="font-medium text-blue-300 truncate">
                    {t.dashboard.featuredMatch}
                  </span>
                  <span className="font-mono tabular-nums text-slate-400 shrink-0">
                    {featuredMatch.status === 'live'
                      ? `${t.statuses.live} · ${featuredMatch.round_label}`
                      : `${featuredMatch.match_date} · ${featuredMatch.match_time}`}
                  </span>
                </div>

                <div className="text-xs text-slate-400 truncate">
                  {t.sports[featuredMatch.sport]} · {featuredMatch.tournament_name}
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TeamCrest
                      shortCode={featuredMatch.home_team_code}
                      color={featuredMatch.home_team_color}
                      size="md"
                    />
                    <span className="text-sm font-semibold text-white truncate">
                      {featuredMatch.home_team_name}
                    </span>
                  </div>

                  <div className="font-mono tabular-nums text-2xl font-bold text-white px-2">
                    {featuredMatch.home_score !== null && featuredMatch.away_score !== null
                      ? `${featuredMatch.home_score} : ${featuredMatch.away_score}`
                      : featuredMatch.match_time}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 min-w-0 text-right">
                    <span className="text-sm font-semibold text-white truncate">
                      {featuredMatch.away_team_name}
                    </span>
                    <TeamCrest
                      shortCode={featuredMatch.away_team_code}
                      color={featuredMatch.away_team_color}
                      size="md"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1 border-t border-white/10">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{featuredMatch.venue}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sports Directory (7 Disciplines) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
            {t.dashboard.sportsDirectory}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {SPORTS_LIST.map((sport) => {
            const active = selectedSport === sport;
            const count = getSportCount(sport);
            return (
              <button
                key={sport}
                type="button"
                onClick={() => onSelectSport(active ? 'all' : sport)}
                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white dark:bg-[#0D1424] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <SportIcon
                    sport={sport}
                    className={`w-5 h-5 ${
                      active ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                  <span
                    className={`font-mono tabular-nums text-xs ${
                      active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div className="text-sm font-semibold truncate">{t.sports[sport]}</div>
                <div
                  className={`text-xs mt-0.5 ${
                    active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count} {t.dashboard.matchesCount}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Upcoming Fixtures & Recent Results Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Competitions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">
              {t.dashboard.upcomingTitle}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.dashboard.seeAll}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] divide-y divide-slate-200 dark:divide-slate-800">
            {upcomingMatches.length === 0 ? (
              <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                {t.schedule.noMatches}
              </div>
            ) : (
              upcomingMatches.map((m) => (
                <div key={m.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">
                      {t.sports[m.sport]} · {m.tournament_name}
                    </span>
                    <span className="font-mono tabular-nums shrink-0 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {m.match_date} · {m.match_time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TeamCrest shortCode={m.home_team_code} color={m.home_team_color} size="sm" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {m.home_team_name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-400 shrink-0">vs</span>
                    <div className="flex items-center justify-end gap-2.5 min-w-0">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate text-right">
                        {m.away_team_name}
                      </span>
                      <TeamCrest shortCode={m.away_team_code} color={m.away_team_color} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">{m.venue}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium shrink-0">
                      {t.statuses[m.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-slate-950 dark:text-white">
              {t.dashboard.recentResultsTitle}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('results')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.dashboard.seeAll}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] divide-y divide-slate-200 dark:divide-slate-800">
            {[...liveMatches, ...recentResults].slice(0, 4).length === 0 ? (
              <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                {t.results.noResults}
              </div>
            ) : (
              [...liveMatches, ...recentResults].slice(0, 4).map((m) => (
                <div key={m.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">
                      {t.sports[m.sport]} · {m.tournament_name}
                    </span>
                    <span
                      className={`font-medium shrink-0 ${
                        m.status === 'live'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t.statuses[m.status]} · {m.match_date}
                    </span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TeamCrest shortCode={m.home_team_code} color={m.home_team_color} size="sm" />
                      <span
                        className={`text-sm truncate ${
                          m.winner_team_id === m.home_team_id
                            ? 'font-bold text-slate-950 dark:text-white'
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m.home_team_name}
                      </span>
                    </div>

                    <div className="font-mono tabular-nums text-base font-bold text-slate-950 dark:text-white px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80">
                      {m.home_score ?? '-'} : {m.away_score ?? '-'}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 min-w-0">
                      <span
                        className={`text-sm truncate text-right ${
                          m.winner_team_id === m.away_team_id
                            ? 'font-bold text-slate-950 dark:text-white'
                            : 'font-medium text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m.away_team_name}
                      </span>
                      <TeamCrest shortCode={m.away_team_code} color={m.away_team_color} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {m.round_label || m.match_time}
                    </span>
                    {m.winner_team_name ? (
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium shrink-0">
                        <Trophy className="w-3.5 h-3.5" />
                        {m.winner_team_name}
                      </span>
                    ) : m.status === 'completed' ? (
                      <span className="shrink-0">{t.results.draw}</span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Sports News */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
            {t.dashboard.latestNewsTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {news.map((item) => {
            const loc = getNewsLocalized(item, lang);
            const imgFailed = failedNewsImages[item.id];
            return (
              <article
                key={item.id}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900 relative">
                  {!imgFailed ? (
                    <img
                      src={item.image_url}
                      alt={loc.title}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedNewsImages((prev) => ({ ...prev, [item.id]: true }))
                      }
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 text-blue-300 p-4 text-center">
                      <SportIcon sport={item.sport} className="w-8 h-8 mb-2" />
                      <span className="text-xs font-medium">{t.sports[item.sport]}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t.sports[item.sport]} · <span className="font-mono tabular-nums">{item.published_at}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-950 dark:text-white leading-snug line-clamp-2">
                      {loc.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {loc.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectNews(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 cursor-pointer self-start"
                  >
                    <span>{t.dashboard.readMore}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
