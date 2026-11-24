import type { Match, NewsItem, PortalMeta, Team, User } from './types';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const res = await fetch(path, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
    }
    return data as T;
  }

  getMeta() {
    return this.request<PortalMeta>('/api/meta');
  }

  register(payload: { name: string; email: string; password: string }) {
    return this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  login(payload: { email: string; password: string }) {
    return this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  bootstrapAdmin(payload: { name: string; email: string; password: string }) {
    return this.request<{ token: string; user: User }>('/api/admin/bootstrap', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getTeams(params?: { sport?: string; search?: string }) {
    const qs = new URLSearchParams();
    if (params?.sport && params.sport !== 'all') qs.set('sport', params.sport);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return this.request<{ teams: Team[] }>(`/api/teams${q ? `?${q}` : ''}`);
  }

  createTeam(payload: {
    name: string;
    short_code: string;
    sport: string;
    city: string;
    logo_color: string;
    roster: Array<{ number: number; name: string; position: string }>;
  }) {
    return this.request<{ team: Team }>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  updateTeam(
    id: number,
    payload: {
      name: string;
      short_code: string;
      sport: string;
      city: string;
      logo_color: string;
      roster: Array<{ number: number; name: string; position: string }>;
    }
  ) {
    return this.request<{ ok: boolean }>(`/api/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  deleteTeam(id: number) {
    return this.request<{ ok: boolean }>(`/api/teams/${id}`, {
      method: 'DELETE',
    });
  }

  getMatches(params?: { sport?: string; status?: string; search?: string }) {
    const qs = new URLSearchParams();
    if (params?.sport && params.sport !== 'all') qs.set('sport', params.sport);
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return this.request<{ matches: Match[] }>(`/api/matches${q ? `?${q}` : ''}`);
  }

  createMatch(payload: {
    tournament_name: string;
    sport: string;
    match_date: string;
    match_time: string;
    venue: string;
    home_team_id: number;
    away_team_id: number;
    home_score?: number | null;
    away_score?: number | null;
    status: string;
    round_label?: string;
  }) {
    return this.request<{ id: number }>('/api/matches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  updateMatch(
    id: number,
    payload: Partial<{
      tournament_name: string;
      sport: string;
      match_date: string;
      match_time: string;
      venue: string;
      home_team_id: number;
      away_team_id: number;
      home_score: number | null;
      away_score: number | null;
      status: string;
      round_label: string;
    }>
  ) {
    return this.request<{ ok: boolean }>(`/api/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  deleteMatch(id: number) {
    return this.request<{ ok: boolean }>(`/api/matches/${id}`, {
      method: 'DELETE',
    });
  }

  getNews(params?: { sport?: string; search?: string }) {
    const qs = new URLSearchParams();
    if (params?.sport && params.sport !== 'all') qs.set('sport', params.sport);
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return this.request<{ news: NewsItem[] }>(`/api/news${q ? `?${q}` : ''}`);
  }

  createNews(payload: {
    title_kaa: string;
    title_uz?: string;
    title_en?: string;
    summary_kaa: string;
    summary_uz?: string;
    summary_en?: string;
    content_kaa?: string;
    content_uz?: string;
    content_en?: string;
    sport: string;
    image_url: string;
    author_name?: string;
  }) {
    return this.request<{ id: number }>('/api/news', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  deleteNews(id: number) {
    return this.request<{ ok: boolean }>(`/api/news/${id}`, {
      method: 'DELETE',
    });
  }

  getFavorites() {
    return this.request<{ favorites: number[] }>('/api/favorites');
  }

  toggleFavorite(teamId: number) {
    return this.request<{ subscribed: boolean; favorites: number[] }>(`/api/favorites/${teamId}`, {
      method: 'POST',
    });
  }

  syncExternalSportsFeed() {
    return this.request<{
      synced: boolean;
      source: string;
      upsertedCount?: number;
      lastSync?: string;
      message?: string;
    }>('/api/sports-feed/sync', {
      method: 'POST',
    });
  }

  resetDemo() {
    return this.request<{ ok: boolean }>('/api/admin/reset-demo', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
