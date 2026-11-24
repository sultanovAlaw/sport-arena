import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  type AuthenticatedRequest,
  hasAnyAdmin,
  hasDbAdmin,
  hashPassword,
  isEnvAdminConfigured,
  requireAdmin,
  requireAuth,
  signToken,
  verifyPassword,
} from './server/auth.ts';
import { db, initSchema, recalculateTeamStats, seedDemoData } from './server/db.ts';

initSchema();
seedDemoData(false);

const app = express();
app.use(express.json({ limit: '256kb' }));

const VALID_SPORTS = new Set([
  'football',
  'basketball',
  'volleyball',
  'tennis',
  'wrestling',
  'boxing',
  'chess',
]);

const VALID_STATUSES = new Set(['upcoming', 'live', 'completed']);

function safeString(val: unknown, maxLen = 200): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function safeImageUrl(val: unknown): string {
  const s = safeString(val, 500);
  if (s.startsWith('/src/assets/images/') || s.startsWith('https://')) {
    return s;
  }
  return '/src/assets/images/news_football_match_1795530617785.jpg';
}

function timingSafeCompareText(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Health & Meta
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/meta', (_req, res) => {
  const lastSyncRow = db
    .prepare("SELECT value FROM sync_meta WHERE key = 'last_sync'")
    .get() as { value: string } | undefined;
  const lastSourceRow = db
    .prepare("SELECT value FROM sync_meta WHERE key = 'last_source'")
    .get() as { value: string } | undefined;
  const demoMatches = db
    .prepare("SELECT COUNT(*) as cnt FROM matches WHERE data_source = 'demo'")
    .get() as { cnt: number };
  const apiMatches = db
    .prepare("SELECT COUNT(*) as cnt FROM matches WHERE data_source != 'demo'")
    .get() as { cnt: number };

  res.json({
    hasAdmin: hasAnyAdmin(),
    envAdminConfigured: isEnvAdminConfigured(),
    lastSync: lastSyncRow?.value ?? null,
    lastSource: lastSourceRow?.value ?? 'demo',
    demoMatchCount: demoMatches.cnt,
    apiMatchCount: apiMatches.cnt,
  });
});

// Authentication Routes
app.post('/api/auth/register', (req, res) => {
  const name = safeString(req.body?.name, 80);
  const email = safeString(req.body?.email, 120).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (name.length < 2 || !email.includes('@') || password.length < 6 || password.length > 128) {
    res.status(400).json({ error: 'Invalid registration details (password min 6 chars)' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'user', ?)"
    )
    .run(name, email, passwordHash, now);

  const userId = Number(result.lastInsertRowid);
  const token = signToken({ sub: userId, email, name, role: 'user' });

  res.status(201).json({
    token,
    user: { id: userId, name, email, role: 'user' },
  });
});

app.post('/api/auth/login', (req, res) => {
  const identifier = safeString(req.body?.email, 120).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!identifier || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  // Check env-configured admin override first
  const envAdminPass = process.env.ADMIN_PASSWORD?.trim();
  const envAdminUser = (process.env.ADMIN_USERNAME?.trim() || 'admin@sportarena.uz').toLowerCase();
  if (envAdminPass && envAdminPass.length > 0) {
    if (
      (timingSafeCompareText(identifier, envAdminUser) || timingSafeCompareText(identifier, 'admin')) &&
      timingSafeCompareText(password, envAdminPass)
    ) {
      const token = signToken({
        sub: 0,
        email: envAdminUser,
        name: 'SPORT ARENA Admin',
        role: 'admin',
      });
      res.json({
        token,
        user: { id: 0, name: 'SPORT ARENA Admin', email: envAdminUser, role: 'admin' },
      });
      return;
    }
  }

  const user = db
    .prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?')
    .get(identifier) as
    | { id: number; name: string; email: string; password_hash: string; role: 'user' | 'admin' }
    | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// One-time First-Run Admin Setup / Claim Route (when ADMIN_PASSWORD is not configured in env)
app.post('/api/admin/bootstrap', (req, res) => {
  if (isEnvAdminConfigured()) {
    res.status(403).json({ error: 'Admin password is managed by server environment' });
    return;
  }

  const name = safeString(req.body?.name, 80) || 'Arena Admin';
  const email = safeString(req.body?.email, 120).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email.includes('@') || password.length < 6 || password.length > 128) {
    res.status(400).json({ error: 'Valid admin email and password (min 6 chars) required' });
    return;
  }

  let createdAdmin: { id: number; name: string; email: string } | null = null;
  const tx = db.transaction(() => {
    if (hasDbAdmin()) {
      return;
    }
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as
      | { id: number }
      | undefined;
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    if (existingUser) {
      db.prepare("UPDATE users SET name = ?, password_hash = ?, role = 'admin' WHERE id = ?").run(
        name,
        passwordHash,
        existingUser.id
      );
      createdAdmin = { id: existingUser.id, name, email };
    } else {
      const info = db
        .prepare(
          "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?)"
        )
        .run(name, email, passwordHash, now);
      createdAdmin = { id: Number(info.lastInsertRowid), name, email };
    }
  });
  tx();

  if (!createdAdmin) {
    res.status(409).json({ error: 'Admin account already claimed. Please sign in.' });
    return;
  }

  const admin = createdAdmin as { id: number; name: string; email: string };
  const token = signToken({
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: 'admin',
  });

  res.status(201).json({
    token,
    user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// Teams Routes
app.get('/api/teams', (req, res) => {
  const sport = safeString(req.query.sport, 40);
  const search = safeString(req.query.search, 80);

  let sql = 'SELECT * FROM teams WHERE 1=1';
  const params: unknown[] = [];

  if (sport && sport !== 'all' && VALID_SPORTS.has(sport)) {
    sql += ' AND sport = ?';
    params.push(sport);
  }
  if (search) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(short_code) LIKE ?)';
    const pattern = `%${search.toLowerCase()}%`;
    params.push(pattern, pattern, pattern);
  }

  sql += ' ORDER BY points DESC, wins DESC, name ASC';
  const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>;

  const teams = rows.map((r) => {
    let roster = [];
    try {
      roster = JSON.parse(String(r.roster_json || '[]'));
    } catch {
      roster = [];
    }
    return {
      ...r,
      roster,
    };
  });

  res.json({ teams });
});

app.post('/api/teams', requireAdmin, (req, res) => {
  const name = safeString(req.body?.name, 100);
  const shortCode = safeString(req.body?.short_code, 6).toUpperCase();
  const sport = safeString(req.body?.sport, 40);
  const city = safeString(req.body?.city, 80);
  const logoColor = /^#[0-9A-Fa-f]{6}$/.test(String(req.body?.logo_color || ''))
    ? String(req.body.logo_color)
    : '#2563EB';

  let roster: Array<{ number: number; name: string; position: string }> = [];
  if (Array.isArray(req.body?.roster)) {
    roster = req.body.roster.slice(0, 30).map((p: Record<string, unknown>, idx: number) => ({
      number: Number(p?.number) || idx + 1,
      name: safeString(p?.name, 80) || 'Player',
      position: safeString(p?.position, 40) || 'Player',
    }));
  }

  if (!name || !shortCode || !VALID_SPORTS.has(sport) || !city) {
    res.status(400).json({ error: 'Valid name, short_code, sport, and city required' });
    return;
  }

  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO teams (name, short_code, sport, city, logo_color, roster_json, data_source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'admin', ?)`
    )
    .run(name, shortCode, sport, city, logoColor, JSON.stringify(roster), now);

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ team });
});

app.put('/api/teams/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid team ID' });
    return;
  }

  const existing = db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }

  const name = safeString(req.body?.name, 100);
  const shortCode = safeString(req.body?.short_code, 6).toUpperCase();
  const sport = safeString(req.body?.sport, 40);
  const city = safeString(req.body?.city, 80);
  const logoColor = /^#[0-9A-Fa-f]{6}$/.test(String(req.body?.logo_color || ''))
    ? String(req.body.logo_color)
    : '#2563EB';

  let rosterJson = (existing as { roster_json: string }).roster_json;
  if (Array.isArray(req.body?.roster)) {
    const cleanRoster = req.body.roster.slice(0, 30).map((p: Record<string, unknown>, idx: number) => ({
      number: Number(p?.number) || idx + 1,
      name: safeString(p?.name, 80) || 'Player',
      position: safeString(p?.position, 40) || 'Player',
    }));
    rosterJson = JSON.stringify(cleanRoster);
  }

  if (!name || !shortCode || !VALID_SPORTS.has(sport) || !city) {
    res.status(400).json({ error: 'Valid name, short_code, sport, and city required' });
    return;
  }

  db.prepare(
    'UPDATE teams SET name = ?, short_code = ?, sport = ?, city = ?, logo_color = ?, roster_json = ? WHERE id = ?'
  ).run(name, shortCode, sport, city, logoColor, rosterJson, id);

  res.json({ ok: true });
});

app.delete('/api/teams/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid team ID' });
    return;
  }
  db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  recalculateTeamStats();
  res.json({ ok: true });
});

// Matches & Schedule Routes
app.get('/api/matches', (req, res) => {
  const sport = safeString(req.query.sport, 40);
  const status = safeString(req.query.status, 20);
  const search = safeString(req.query.search, 80);

  let sql = `
    SELECT
      m.*,
      ht.name as home_team_name,
      ht.short_code as home_team_code,
      ht.logo_color as home_team_color,
      ht.city as home_team_city,
      at.name as away_team_name,
      at.short_code as away_team_code,
      at.logo_color as away_team_color,
      at.city as away_team_city,
      wt.name as winner_team_name
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    LEFT JOIN teams wt ON m.winner_team_id = wt.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (sport && sport !== 'all' && VALID_SPORTS.has(sport)) {
    sql += ' AND m.sport = ?';
    params.push(sport);
  }
  if (status && status !== 'all' && VALID_STATUSES.has(status)) {
    sql += ' AND m.status = ?';
    params.push(status);
  }
  if (search) {
    sql += ` AND (
      LOWER(m.tournament_name) LIKE ?
      OR LOWER(m.venue) LIKE ?
      OR LOWER(ht.name) LIKE ?
      OR LOWER(at.name) LIKE ?
    )`;
    const p = `%${search.toLowerCase()}%`;
    params.push(p, p, p, p);
  }

  sql += `
    ORDER BY
      CASE m.status WHEN 'live' THEN 0 WHEN 'upcoming' THEN 1 ELSE 2 END ASC,
      m.match_date ASC,
      m.match_time ASC
  `;

  const matches = db.prepare(sql).all(...params);
  res.json({ matches });
});

app.post('/api/matches', requireAdmin, (req, res) => {
  const tournamentName = safeString(req.body?.tournament_name, 140);
  const sport = safeString(req.body?.sport, 40);
  const matchDate = safeString(req.body?.match_date, 20);
  const matchTime = safeString(req.body?.match_time, 10);
  const venue = safeString(req.body?.venue, 120);
  const roundLabel = safeString(req.body?.round_label, 60);
  const homeTeamId = Number(req.body?.home_team_id);
  const awayTeamId = Number(req.body?.away_team_id);
  const status = VALID_STATUSES.has(String(req.body?.status)) ? String(req.body.status) : 'upcoming';

  const hasScores =
    req.body?.home_score !== null &&
    req.body?.home_score !== undefined &&
    req.body?.home_score !== '' &&
    req.body?.away_score !== null &&
    req.body?.away_score !== undefined &&
    req.body?.away_score !== '';

  const homeScore = hasScores ? Math.max(0, Math.floor(Number(req.body.home_score))) : null;
  const awayScore = hasScores ? Math.max(0, Math.floor(Number(req.body.away_score))) : null;

  if (
    !tournamentName ||
    !VALID_SPORTS.has(sport) ||
    !matchDate ||
    !matchTime ||
    !venue ||
    !Number.isInteger(homeTeamId) ||
    !Number.isInteger(awayTeamId) ||
    homeTeamId === awayTeamId
  ) {
    res.status(400).json({ error: 'Invalid match data or teams must be different' });
    return;
  }

  let winnerId: number | null = null;
  if (status === 'completed' && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winnerId = homeTeamId;
    else if (awayScore > homeScore) winnerId = awayTeamId;
  }

  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO matches (
        tournament_name, sport, match_date, match_time, venue,
        home_team_id, away_team_id, home_score, away_score,
        status, winner_team_id, round_label, data_source, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin', ?)`
    )
    .run(
      tournamentName,
      sport,
      matchDate,
      matchTime,
      venue,
      homeTeamId,
      awayTeamId,
      homeScore,
      awayScore,
      status,
      winnerId,
      roundLabel,
      now
    );

  recalculateTeamStats();
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.put('/api/matches/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid match ID' });
    return;
  }

  const existing = db.prepare('SELECT * FROM matches WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }

  const tournamentName = safeString(req.body?.tournament_name, 140) || String(existing.tournament_name);
  const sport = VALID_SPORTS.has(String(req.body?.sport)) ? String(req.body.sport) : String(existing.sport);
  const matchDate = safeString(req.body?.match_date, 20) || String(existing.match_date);
  const matchTime = safeString(req.body?.match_time, 10) || String(existing.match_time);
  const venue = safeString(req.body?.venue, 120) || String(existing.venue);
  const roundLabel =
    req.body?.round_label !== undefined
      ? safeString(req.body.round_label, 60)
      : String(existing.round_label || '');
  const homeTeamId =
    Number.isInteger(Number(req.body?.home_team_id)) && Number(req.body?.home_team_id) > 0
      ? Number(req.body.home_team_id)
      : Number(existing.home_team_id);
  const awayTeamId =
    Number.isInteger(Number(req.body?.away_team_id)) && Number(req.body?.away_team_id) > 0
      ? Number(req.body.away_team_id)
      : Number(existing.away_team_id);
  const status = VALID_STATUSES.has(String(req.body?.status))
    ? String(req.body.status)
    : String(existing.status);

  if (homeTeamId === awayTeamId) {
    res.status(400).json({ error: 'Home and away teams must be different' });
    return;
  }

  let homeScore: number | null = existing.home_score as number | null;
  let awayScore: number | null = existing.away_score as number | null;

  if (req.body?.home_score !== undefined) {
    homeScore =
      req.body.home_score === null || req.body.home_score === ''
        ? null
        : Math.max(0, Math.floor(Number(req.body.home_score)));
  }
  if (req.body?.away_score !== undefined) {
    awayScore =
      req.body.away_score === null || req.body.away_score === ''
        ? null
        : Math.max(0, Math.floor(Number(req.body.away_score)));
  }

  let winnerId: number | null = null;
  if (status === 'completed' && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winnerId = homeTeamId;
    else if (awayScore > homeScore) winnerId = awayTeamId;
  }

  db.prepare(
    `UPDATE matches SET
      tournament_name = ?, sport = ?, match_date = ?, match_time = ?, venue = ?,
      home_team_id = ?, away_team_id = ?, home_score = ?, away_score = ?,
      status = ?, winner_team_id = ?, round_label = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    tournamentName,
    sport,
    matchDate,
    matchTime,
    venue,
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    status,
    winnerId,
    roundLabel,
    new Date().toISOString(),
    id
  );

  recalculateTeamStats();
  res.json({ ok: true });
});

app.delete('/api/matches/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid match ID' });
    return;
  }
  db.prepare('DELETE FROM matches WHERE id = ?').run(id);
  recalculateTeamStats();
  res.json({ ok: true });
});

// News Routes
app.get('/api/news', (req, res) => {
  const sport = safeString(req.query.sport, 40);
  const search = safeString(req.query.search, 80);

  let sql = 'SELECT * FROM news WHERE 1=1';
  const params: unknown[] = [];

  if (sport && sport !== 'all' && VALID_SPORTS.has(sport)) {
    sql += ' AND sport = ?';
    params.push(sport);
  }
  if (search) {
    sql +=
      ' AND (LOWER(title_kaa) LIKE ? OR LOWER(title_uz) LIKE ? OR LOWER(title_en) LIKE ? OR LOWER(summary_kaa) LIKE ?)';
    const p = `%${search.toLowerCase()}%`;
    params.push(p, p, p, p);
  }

  sql += ' ORDER BY published_at DESC, id DESC';
  const news = db.prepare(sql).all(...params);
  res.json({ news });
});

app.post('/api/news', requireAdmin, (req, res) => {
  const titleKaa = safeString(req.body?.title_kaa, 180);
  const titleUz = safeString(req.body?.title_uz, 180) || titleKaa;
  const titleEn = safeString(req.body?.title_en, 180) || titleKaa;
  const summaryKaa = safeString(req.body?.summary_kaa, 320);
  const summaryUz = safeString(req.body?.summary_uz, 320) || summaryKaa;
  const summaryEn = safeString(req.body?.summary_en, 320) || summaryKaa;
  const contentKaa = safeString(req.body?.content_kaa, 3000) || summaryKaa;
  const contentUz = safeString(req.body?.content_uz, 3000) || contentKaa;
  const contentEn = safeString(req.body?.content_en, 3000) || contentKaa;
  const sport = VALID_SPORTS.has(String(req.body?.sport)) ? String(req.body.sport) : 'football';
  const imageUrl = safeImageUrl(req.body?.image_url);
  const authorName = safeString(req.body?.author_name, 80) || 'SPORT ARENA Admin';
  const publishedAt = safeString(req.body?.published_at, 20) || new Date().toISOString().slice(0, 10);

  if (!titleKaa || !summaryKaa) {
    res.status(400).json({ error: 'News title and summary are required' });
    return;
  }

  const info = db
    .prepare(
      `INSERT INTO news (
        title_kaa, title_uz, title_en,
        summary_kaa, summary_uz, summary_en,
        content_kaa, content_uz, content_en,
        sport, image_url, author_name, published_at, data_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin')`
    )
    .run(
      titleKaa,
      titleUz,
      titleEn,
      summaryKaa,
      summaryUz,
      summaryEn,
      contentKaa,
      contentUz,
      contentEn,
      sport,
      imageUrl,
      authorName,
      publishedAt
    );

  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/news/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid news ID' });
    return;
  }
  db.prepare('DELETE FROM news WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Favorites Routes (Authenticated Users)
app.get('/api/favorites', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user || req.user.sub <= 0) {
    res.json({ favorites: [] });
    return;
  }
  const rows = db
    .prepare('SELECT team_id FROM favorites WHERE user_id = ?')
    .all(req.user.sub) as Array<{ team_id: number }>;
  res.json({ favorites: rows.map((r) => r.team_id) });
});

app.post('/api/favorites/:teamId', requireAuth, (req: AuthenticatedRequest, res) => {
  const teamId = Number(req.params.teamId);
  if (!Number.isInteger(teamId) || teamId <= 0) {
    res.status(400).json({ error: 'Invalid team ID' });
    return;
  }
  if (!req.user || req.user.sub <= 0) {
    res.status(400).json({ error: 'Register or sign in with a user account to save favorites' });
    return;
  }

  const teamExists = db.prepare('SELECT id FROM teams WHERE id = ?').get(teamId);
  if (!teamExists) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }

  const existing = db
    .prepare('SELECT 1 FROM favorites WHERE user_id = ? AND team_id = ?')
    .get(req.user.sub, teamId);

  let subscribed = false;
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND team_id = ?').run(req.user.sub, teamId);
    subscribed = false;
  } else {
    db.prepare('INSERT INTO favorites (user_id, team_id, created_at) VALUES (?, ?, ?)').run(
      req.user.sub,
      teamId,
      new Date().toISOString()
    );
    subscribed = true;
  }

  const rows = db
    .prepare('SELECT team_id FROM favorites WHERE user_id = ?')
    .all(req.user.sub) as Array<{ team_id: number }>;
  res.json({ subscribed, favorites: rows.map((r) => r.team_id) });
});

// Real Sports API Sync (TheSportsDB Public Free API v1)
let lastExternalSyncMs = 0;

app.post('/api/sports-feed/sync', async (_req, res) => {
  const nowMs = Date.now();
  if (nowMs - lastExternalSyncMs < 15000) {
    res.json({
      synced: false,
      source: 'cached',
      message: 'Recently synced. Please wait a few seconds before syncing again.',
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    // Strictly allowlisted public TheSportsDB endpoint (English Premier League past & next events)
    const [pastRes, nextRes] = await Promise.all([
      fetch('https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4328', {
        signal: controller.signal,
      }),
      fetch('https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328', {
        signal: controller.signal,
      }),
    ]);
    clearTimeout(timeout);

    if (!pastRes.ok && !nextRes.ok) {
      throw new Error('Upstream API returned non-200 status');
    }

    const pastJson = (pastRes.ok ? await pastRes.json() : { events: [] }) as {
      events?: Array<Record<string, string | null>>;
    };
    const nextJson = (nextRes.ok ? await nextRes.json() : { events: [] }) as {
      events?: Array<Record<string, string | null>>;
    };

    const events = [
      ...(Array.isArray(pastJson.events) ? pastJson.events.slice(0, 4) : []),
      ...(Array.isArray(nextJson.events) ? nextJson.events.slice(0, 4) : []),
    ];

    if (events.length === 0) {
      res.json({
        synced: false,
        source: 'demo',
        message: 'External API returned empty event list; demo records remain active.',
      });
      return;
    }

    const findTeamByExt = db.prepare('SELECT id FROM teams WHERE external_id = ?');
    const findTeamByName = db.prepare('SELECT id FROM teams WHERE LOWER(name) = LOWER(?) AND sport = ?');
    const insertTeam = db.prepare(`
      INSERT INTO teams (name, short_code, sport, city, logo_color, roster_json, data_source, external_id, created_at)
      VALUES (?, ?, 'football', ?, ?, '[]', 'thesportsdb', ?, ?)
    `);

    const ensureApiTeam = (teamName: string, extTeamId: string | null): number => {
      if (extTeamId) {
        const byExt = findTeamByExt.get(`tsdb_${extTeamId}`) as { id: number } | undefined;
        if (byExt) return byExt.id;
      }
      const byName = findTeamByName.get(teamName, 'football') as { id: number } | undefined;
      if (byName) return byName.id;

      const shortCode = teamName
        .replace(/[^A-Za-z]/g, '')
        .slice(0, 3)
        .toUpperCase()
        .padEnd(3, 'X');
      const nowIso = new Date().toISOString();
      const info = insertTeam.run(
        teamName.slice(0, 100),
        shortCode,
        'International',
        '#1D4ED8',
        extTeamId ? `tsdb_${extTeamId}` : null,
        nowIso
      );
      return Number(info.lastInsertRowid);
    };

    const findMatchByExt = db.prepare('SELECT id FROM matches WHERE external_id = ?');
    const insertMatch = db.prepare(`
      INSERT INTO matches (
        tournament_name, sport, match_date, match_time, venue,
        home_team_id, away_team_id, home_score, away_score,
        status, winner_team_id, round_label, data_source, external_id, updated_at
      ) VALUES (?, 'football', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'thesportsdb', ?, ?)
    `);
    const updateMatch = db.prepare(`
      UPDATE matches SET
        home_score = ?, away_score = ?, status = ?, winner_team_id = ?, updated_at = ?
      WHERE id = ?
    `);

    let upsertedCount = 0;
    const nowIso = new Date().toISOString();

    const tx = db.transaction(() => {
      for (const ev of events) {
        const idEvent = safeString(ev.idEvent, 40);
        const homeName = safeString(ev.strHomeTeam, 90);
        const awayName = safeString(ev.strAwayTeam, 90);
        if (!idEvent || !homeName || !awayName || homeName === awayName) continue;

        const homeId = ensureApiTeam(homeName, ev.idHomeTeam ?? null);
        const awayId = ensureApiTeam(awayName, ev.idAwayTeam ?? null);
        const extMatchId = `tsdb_${idEvent}`;

        const hasScore = ev.intHomeScore !== null && ev.intAwayScore !== null && ev.intHomeScore !== '' && ev.intAwayScore !== '';
        const hs = hasScore ? Math.max(0, Number(ev.intHomeScore)) : null;
        const as = hasScore ? Math.max(0, Number(ev.intAwayScore)) : null;
        const status = hasScore ? 'completed' : 'upcoming';

        let winnerId: number | null = null;
        if (status === 'completed' && hs !== null && as !== null) {
          if (hs > as) winnerId = homeId;
          else if (as > hs) winnerId = awayId;
        }

        const existing = findMatchByExt.get(extMatchId) as { id: number } | undefined;
        if (existing) {
          updateMatch.run(hs, as, status, winnerId, nowIso, existing.id);
        } else {
          insertMatch.run(
            safeString(ev.strLeague, 100) || 'Premier League (TheSportsDB)',
            safeString(ev.dateEvent, 20) || nowIso.slice(0, 10),
            safeString(ev.strTime, 5) || '18:00',
            safeString(ev.strVenue, 100) || 'International Stadium',
            homeId,
            awayId,
            hs,
            as,
            status,
            winnerId,
            ev.intRound ? `Round ${ev.intRound}` : 'API Feed',
            extMatchId,
            nowIso
          );
        }
        upsertedCount += 1;
      }

      db.prepare(`INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_sync', ?)`).run(nowIso);
      db.prepare(`INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_source', 'thesportsdb')`).run();
    });
    tx();

    recalculateTeamStats();
    lastExternalSyncMs = nowMs;

    res.json({
      synced: true,
      source: 'thesportsdb',
      upsertedCount,
      lastSync: nowIso,
    });
  } catch (err) {
    res.status(200).json({
      synced: false,
      source: 'demo',
      message: 'Live external sports feed is currently unreachable; displaying local SQLite demo records.',
      detail: err instanceof Error ? err.message : 'Network error',
    });
  }
});

app.post('/api/admin/reset-demo', requireAdmin, (_req, res) => {
  seedDemoData(true);
  res.json({ ok: true });
});

async function startServer(): Promise<void> {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SPORT ARENA server listening on http://localhost:${PORT}`);
  });
}

startServer();
