export type Language = 'kaa' | 'uz' | 'en';

export type SportType =
  | 'football'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'wrestling'
  | 'boxing'
  | 'chess';

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export type PageView = 'dashboard' | 'schedule' | 'results' | 'teams' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Player {
  number: number;
  name: string;
  position: string;
}

export interface Team {
  id: number;
  name: string;
  short_code: string;
  sport: SportType;
  city: string;
  logo_color: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  roster: Player[];
  data_source: string;
}

export interface Match {
  id: number;
  tournament_name: string;
  sport: SportType;
  match_date: string;
  match_time: string;
  venue: string;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  home_team_code: string;
  home_team_color: string;
  home_team_city: string;
  away_team_name: string;
  away_team_code: string;
  away_team_color: string;
  away_team_city: string;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  winner_team_id: number | null;
  winner_team_name: string | null;
  round_label: string;
  data_source: string;
  updated_at: string;
}

export interface NewsItem {
  id: number;
  title_kaa: string;
  title_uz: string;
  title_en: string;
  summary_kaa: string;
  summary_uz: string;
  summary_en: string;
  content_kaa: string;
  content_uz: string;
  content_en: string;
  sport: SportType;
  image_url: string;
  author_name: string;
  published_at: string;
  data_source: string;
}

export interface PortalMeta {
  hasAdmin: boolean;
  envAdminConfigured: boolean;
  lastSync: string | null;
  lastSource: string;
  demoMatchCount: number;
  apiMatchCount: number;
}
