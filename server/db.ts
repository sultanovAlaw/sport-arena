import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'sport_arena.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      short_code TEXT NOT NULL,
      sport TEXT NOT NULL,
      city TEXT NOT NULL,
      logo_color TEXT NOT NULL DEFAULT '#2563EB',
      wins INTEGER NOT NULL DEFAULT 0,
      draws INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      points INTEGER NOT NULL DEFAULT 0,
      roster_json TEXT NOT NULL DEFAULT '[]',
      data_source TEXT NOT NULL DEFAULT 'demo',
      external_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_name TEXT NOT NULL,
      sport TEXT NOT NULL,
      match_date TEXT NOT NULL,
      match_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      home_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      away_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      home_score INTEGER,
      away_score INTEGER,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'live', 'completed')),
      winner_team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
      round_label TEXT NOT NULL DEFAULT '',
      data_source TEXT NOT NULL DEFAULT 'demo',
      external_id TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_kaa TEXT NOT NULL,
      title_uz TEXT NOT NULL,
      title_en TEXT NOT NULL,
      summary_kaa TEXT NOT NULL,
      summary_uz TEXT NOT NULL,
      summary_en TEXT NOT NULL,
      content_kaa TEXT NOT NULL,
      content_uz TEXT NOT NULL,
      content_en TEXT NOT NULL,
      sport TEXT NOT NULL,
      image_url TEXT NOT NULL,
      author_name TEXT NOT NULL,
      published_at TEXT NOT NULL,
      data_source TEXT NOT NULL DEFAULT 'demo'
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, team_id)
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function recalculateTeamStats(): void {
  const teams = db.prepare('SELECT id, sport FROM teams').all() as Array<{ id: number; sport: string }>;
  const completedMatches = db
    .prepare(
      `SELECT home_team_id, away_team_id, home_score, away_score, sport
       FROM matches
       WHERE status = 'completed' AND home_score IS NOT NULL AND away_score IS NOT NULL`
    )
    .all() as Array<{
      home_team_id: number;
      away_team_id: number;
      home_score: number;
      away_score: number;
      sport: string;
    }>;

  const statsMap = new Map<number, { wins: number; draws: number; losses: number; points: number }>();
  for (const t of teams) {
    statsMap.set(t.id, { wins: 0, draws: 0, losses: 0, points: 0 });
  }

  for (const m of completedMatches) {
    const home = statsMap.get(m.home_team_id);
    const away = statsMap.get(m.away_team_id);
    if (!home || !away) continue;

    if (m.home_score > m.away_score) {
      home.wins += 1;
      home.points += m.sport === 'basketball' ? 2 : 3;
      away.losses += 1;
      if (m.sport === 'basketball') away.points += 1;
    } else if (m.away_score > m.home_score) {
      away.wins += 1;
      away.points += m.sport === 'basketball' ? 2 : 3;
      home.losses += 1;
      if (m.sport === 'basketball') home.points += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const updateStmt = db.prepare(
    'UPDATE teams SET wins = ?, draws = ?, losses = ?, points = ? WHERE id = ?'
  );
  const tx = db.transaction(() => {
    for (const [id, s] of statsMap.entries()) {
      updateStmt.run(s.wins, s.draws, s.losses, s.points, id);
    }
  });
  tx();
}

export function seedDemoData(force = false): void {
  const existingTeams = db.prepare('SELECT COUNT(*) as cnt FROM teams').get() as { cnt: number };
  if (existingTeams.cnt > 0 && !force) {
    return;
  }

  const nowIso = new Date().toISOString();

  const tx = db.transaction(() => {
    if (force) {
      db.prepare('DELETE FROM favorites').run();
      db.prepare('DELETE FROM matches').run();
      db.prepare('DELETE FROM teams').run();
      db.prepare('DELETE FROM news').run();
    }

    const insertTeam = db.prepare(`
      INSERT INTO teams (name, short_code, sport, city, logo_color, wins, draws, losses, points, roster_json, data_source, created_at)
      VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, ?, 'demo', ?)
    `);

    const teamSeeds = [
      // Football (4 teams)
      {
        name: 'Aral FK',
        short_code: 'ARL',
        sport: 'football',
        city: 'Nókis',
        logo_color: '#2563EB',
        roster: [
          { number: 1, name: 'Azamat Seytniyazov', position: 'GK' },
          { number: 4, name: 'Baxtıyar Qurbanbaev', position: 'DF' },
          { number: 8, name: 'Nurlıbek Xojanov', position: 'MF' },
          { number: 10, name: 'Timur Jumaniyazov', position: 'FW' },
          { number: 11, name: 'Dawranbek Allaniyazov', position: 'FW' },
        ],
      },
      {
        name: 'Xorezm United',
        short_code: 'XOR',
        sport: 'football',
        city: 'Úrgenish',
        logo_color: '#0284C7',
        roster: [
          { number: 1, name: 'Sardor Matyakubov', position: 'GK' },
          { number: 5, name: 'Jasur Raximov', position: 'DF' },
          { number: 7, name: 'Umidbek Sobirov', position: 'MF' },
          { number: 9, name: 'Dostonbek Karimov', position: 'FW' },
        ],
      },
      {
        name: 'Tashkent City',
        short_code: 'TSH',
        sport: 'football',
        city: 'Tashkent',
        logo_color: '#1D4ED8',
        roster: [
          { number: 1, name: 'Botir Ergashev', position: 'GK' },
          { number: 6, name: 'Alisher Saidov', position: 'MF' },
          { number: 9, name: 'Bekzod Alimov', position: 'FW' },
          { number: 19, name: 'Farrux Ikramov', position: 'MF' },
        ],
      },
      {
        name: 'Samarqand Dinamo',
        short_code: 'SAM',
        sport: 'football',
        city: 'Samarqand',
        logo_color: '#0EA5E9',
        roster: [
          { number: 12, name: 'Shohrux Rasulov', position: 'GK' },
          { number: 3, name: 'Otabek Turgunov', position: 'DF' },
          { number: 14, name: 'Islom Shukurov', position: 'FW' },
        ],
      },
      // Basketball (2 teams)
      {
        name: 'Qaraqalpaqstan Bars',
        short_code: 'BRS',
        sport: 'basketball',
        city: 'Nókis',
        logo_color: '#3B82F6',
        roster: [
          { number: 3, name: 'Berdaq Palwanov', position: 'PG' },
          { number: 12, name: 'Sanjar Qalbaev', position: 'SG' },
          { number: 23, name: 'Ruslan Dauletov', position: 'SF' },
          { number: 34, name: 'Arman Bekbergenov', position: 'C' },
        ],
      },
      {
        name: 'Almatı Legion',
        short_code: 'ALM',
        sport: 'basketball',
        city: 'Almatı',
        logo_color: '#1E40AF',
        roster: [
          { number: 5, name: 'Danil Petrov', position: 'PG' },
          { number: 15, name: 'Nursultan Tolegen', position: 'PF' },
          { number: 44, name: 'Miras Akhmetov', position: 'C' },
        ],
      },
      // Volleyball (2 teams)
      {
        name: 'Nókis Voleybol',
        short_code: 'NKV',
        sport: 'volleyball',
        city: 'Nókis',
        logo_color: '#2563EB',
        roster: [
          { number: 2, name: 'Gúlshad Embergenova', position: 'Setter' },
          { number: 7, name: 'Ayjamal Tursınbaeva', position: 'Outside Hitter' },
          { number: 10, name: 'Zulfiya Qoshqarova', position: 'Middle Blocker' },
        ],
      },
      {
        name: 'Buxara Volley',
        short_code: 'BUX',
        sport: 'volleyball',
        city: 'Buxara',
        logo_color: '#0369A1',
        roster: [
          { number: 4, name: 'Madina Sharipova', position: 'Setter' },
          { number: 9, name: 'Dilnoza Hasanova', position: 'Opposite' },
          { number: 11, name: 'Nigina Umarova', position: 'Libero' },
        ],
      },
      // Tennis (2 teams/clubs)
      {
        name: 'Amudarya Tennis Club',
        short_code: 'AMD',
        sport: 'tennis',
        city: 'Nókis',
        logo_color: '#1D4ED8',
        roster: [
          { number: 1, name: 'Kamran Saparov', position: 'Singles #1' },
          { number: 2, name: 'Diyarbek Xudaybergenov', position: 'Singles #2' },
        ],
      },
      {
        name: 'Fergana Ace',
        short_code: 'FRG',
        sport: 'tennis',
        city: 'Fergana',
        logo_color: '#0284C7',
        roster: [
          { number: 1, name: 'Javohir Abdullaev', position: 'Singles #1' },
          { number: 2, name: 'Bobur Mirzayev', position: 'Doubles' },
        ],
      },
      // Wrestling (2 teams)
      {
        name: 'Beruniy Gúres',
        short_code: 'BER',
        sport: 'wrestling',
        city: 'Beruniy',
        logo_color: '#1E3A8A',
        roster: [
          { number: 65, name: 'Qayrat Joldasbaev', position: '65 kg Freestyle' },
          { number: 74, name: 'Erkinbek Toreniyazov', position: '74 kg Freestyle' },
          { number: 86, name: 'Salamatzhan Aytmuratov', position: '86 kg Greco-Roman' },
        ],
      },
      {
        name: 'Qarshı Palwanları',
        short_code: 'QAR',
        sport: 'wrestling',
        city: 'Qarshı',
        logo_color: '#2563EB',
        roster: [
          { number: 65, name: 'Shaxboz Juraev', position: '65 kg Freestyle' },
          { number: 74, name: 'Zafarbek Muminov', position: '74 kg Freestyle' },
        ],
      },
      // Boxing (2 teams)
      {
        name: 'Xojeli Boks Klubı',
        short_code: 'XOJ',
        sport: 'boxing',
        city: 'Xojeli',
        logo_color: '#1D4ED8',
        roster: [
          { number: 63, name: 'Miraslan Atabaev', position: '63.5 kg' },
          { number: 71, name: 'Sultanbek Orazbaev', position: '71 kg' },
          { number: 80, name: 'Temur Qanatbaev', position: '80 kg' },
        ],
      },
      {
        name: 'Andijan Ring',
        short_code: 'AND',
        sport: 'boxing',
        city: 'Andijan',
        logo_color: '#0369A1',
        roster: [
          { number: 63, name: 'Dilshodbek Turdiev', position: '63.5 kg' },
          { number: 71, name: 'Ulugbek Ruziev', position: '71 kg' },
        ],
      },
      // Chess (2 teams)
      {
        name: 'Nókis Grandmasters',
        short_code: 'NGM',
        sport: 'chess',
        city: 'Nókis',
        logo_color: '#1E40AF',
        roster: [
          { number: 1, name: 'Begisbay Sultaniyazov', position: 'Board 1 · GM' },
          { number: 2, name: 'Aynura Baltabaeva', position: 'Board 2 · WIM' },
          { number: 3, name: 'Damir Utegenov', position: 'Board 3 · FM' },
        ],
      },
      {
        name: 'Tashkent Chess Academy',
        short_code: 'TCA',
        sport: 'chess',
        city: 'Tashkent',
        logo_color: '#3B82F6',
        roster: [
          { number: 1, name: 'Nodirbek Yakubov', position: 'Board 1 · GM' },
          { number: 2, name: 'Umida Omonova', position: 'Board 2 · WGM' },
          { number: 3, name: 'Sardorbek Karimov', position: 'Board 3 · IM' },
        ],
      },
    ];

    const teamIds: Record<string, number> = {};
    for (const t of teamSeeds) {
      const res = insertTeam.run(
        t.name,
        t.short_code,
        t.sport,
        t.city,
        t.logo_color,
        JSON.stringify(t.roster),
        nowIso
      );
      teamIds[t.short_code] = Number(res.lastInsertRowid);
    }

    const insertMatch = db.prepare(`
      INSERT INTO matches (
        tournament_name, sport, match_date, match_time, venue,
        home_team_id, away_team_id, home_score, away_score,
        status, winner_team_id, round_label, data_source, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo', ?)
    `);

    const matchesSeed = [
      // Live Matches
      {
        tournament: 'Qaraqalpaqstan Super Ligası',
        sport: 'football',
        date: '2026-11-24',
        time: '19:00',
        venue: 'Turon Stadionı, Nókis',
        home: 'ARL',
        away: 'TSH',
        hs: 2,
        as: 1,
        status: 'live',
        winner: null,
        round: '14-tur · 74\'',
      },
      {
        tournament: 'Oraylıq Aziya Basketbol Kubogı',
        sport: 'basketball',
        date: '2026-11-24',
        time: '18:30',
        venue: 'Nókis Sport Sarayı',
        home: 'BRS',
        away: 'ALM',
        hs: 68,
        as: 64,
        status: 'live',
        winner: null,
        round: '3-shi sherek',
      },
      // Upcoming Matches
      {
        tournament: 'Qaraqalpaqstan Super Ligası',
        sport: 'football',
        date: '2026-11-26',
        time: '17:30',
        venue: 'Xorezm Arena, Úrgenish',
        home: 'XOR',
        away: 'SAM',
        hs: null,
        as: null,
        status: 'upcoming',
        winner: null,
        round: '15-tur',
      },
      {
        tournament: 'Respublika Voleybol Chempionatı',
        sport: 'volleyball',
        date: '2026-11-27',
        time: '16:00',
        venue: 'Olimpiya Zal, Nókis',
        home: 'NKV',
        away: 'BUX',
        hs: null,
        as: null,
        status: 'upcoming',
        winner: null,
        round: 'Yarım final',
      },
      {
        tournament: 'Amudarya Open Tennis',
        sport: 'tennis',
        date: '2026-11-28',
        time: '11:00',
        venue: 'Nókis Tennis Kortı',
        home: 'AMD',
        away: 'FRG',
        hs: null,
        as: null,
        status: 'upcoming',
        winner: null,
        round: 'Final',
      },
      {
        tournament: 'Alpomish Gúres Gran-Prisi',
        sport: 'wrestling',
        date: '2026-11-29',
        time: '15:00',
        venue: 'Beruniy Sport Kompleksi',
        home: 'BER',
        away: 'QAR',
        hs: null,
        as: null,
        status: 'upcoming',
        winner: null,
        round: 'Komandalıq final',
      },
      {
        tournament: 'Boks Keshki Shou — Nókis',
        sport: 'boxing',
        date: '2026-11-30',
        time: '20:00',
        venue: 'Nókis Arena',
        home: 'XOJ',
        away: 'AND',
        hs: null,
        as: null,
        status: 'upcoming',
        winner: null,
        round: 'Tiykarǵı jekpe-jek',
      },
      {
        tournament: 'Shaxmat Komandalıq Kubogı',
        sport: 'chess',
        date: '2026-12-01',
        time: '14:00',
        venue: 'Jaslar Orayı, Nókis',
        home: 'NGM',
        away: 'TCA',
        hs: null,
        as: null,
        status: 'upcoming',
        winner: null,
        round: '7-tur',
      },
      // Completed Matches
      {
        tournament: 'Qaraqalpaqstan Super Ligası',
        sport: 'football',
        date: '2026-11-21',
        time: '18:00',
        venue: 'Turon Stadionı, Nókis',
        home: 'ARL',
        away: 'XOR',
        hs: 3,
        as: 1,
        status: 'completed',
        winner: 'ARL',
        round: '13-tur',
      },
      {
        tournament: 'Qaraqalpaqstan Super Ligası',
        sport: 'football',
        date: '2026-11-20',
        time: '17:00',
        venue: 'Dinamo Stadionı, Samarqand',
        home: 'SAM',
        away: 'TSH',
        hs: 1,
        as: 1,
        status: 'completed',
        winner: null,
        round: '13-tur',
      },
      {
        tournament: 'Oraylıq Aziya Basketbol Kubogı',
        sport: 'basketball',
        date: '2026-11-19',
        time: '19:00',
        venue: 'Almatı Arena',
        home: 'ALM',
        away: 'BRS',
        hs: 79,
        as: 84,
        status: 'completed',
        winner: 'BRS',
        round: '2-tur',
      },
      {
        tournament: 'Respublika Voleybol Chempionatı',
        sport: 'volleyball',
        date: '2026-11-18',
        time: '16:30',
        venue: 'Buxara Sport Sarayı',
        home: 'BUX',
        away: 'NKV',
        hs: 1,
        as: 3,
        status: 'completed',
        winner: 'NKV',
        round: 'Sherik final',
      },
      {
        tournament: 'Alpomish Gúres Gran-Prisi',
        sport: 'wrestling',
        date: '2026-11-16',
        time: '15:00',
        venue: 'Qarshı Arena',
        home: 'QAR',
        away: 'BER',
        hs: 4,
        as: 6,
        status: 'completed',
        winner: 'BER',
        round: 'Yarım final',
      },
      {
        tournament: 'Shaxmat Komandalıq Kubogı',
        sport: 'chess',
        date: '2026-11-15',
        time: '13:00',
        venue: 'Tashkent Shaxmat Úyi',
        home: 'TCA',
        away: 'NGM',
        hs: 2,
        as: 2,
        status: 'completed',
        winner: null,
        round: '6-tur',
      },
    ];

    for (const m of matchesSeed) {
      insertMatch.run(
        m.tournament,
        m.sport,
        m.date,
        m.time,
        m.venue,
        teamIds[m.home],
        teamIds[m.away],
        m.hs,
        m.as,
        m.status,
        m.winner ? teamIds[m.winner] : null,
        m.round,
        nowIso
      );
    }

    const insertNews = db.prepare(`
      INSERT INTO news (
        title_kaa, title_uz, title_en,
        summary_kaa, summary_uz, summary_en,
        content_kaa, content_uz, content_en,
        sport, image_url, author_name, published_at, data_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo')
    `);

    insertNews.run(
      'Aral FK Nókiste isenimli jeńiske eristi hám kestede kóshbasshıǵa aylandı',
      'Aral FK Nukusda ishonchli g‘alabaga erishdi va jadvalda peshqadamga aylandi',
      'Aral FC secures decisive home victory in Nukus to climb to the top',
      'Turon stadionında ótken tiykarǵı ushırasıwda Aral FK Xorezm komandasın 3:1 esabında jeńdi.',
      'Turon stadionida bo‘lib o‘tgan markaziy o‘yinda Aral FK Xorazm jamoasini 3:1 hisobida mag‘lub etdi.',
      'In a thrilling central fixture at Turon Stadium, Aral FC defeated Khorezm United 3–1.',
      'Nókistegi Turon stadionında 12 mıńnan aslam ıshqıpazlar kóz aldında ótken oyında Aral FK birinshi taymnan baslap basımlıqtı qolǵa aldı. Timur Jumaniyazov dubl avtorı boldı, al Dawranbek Allaniyazov oyın sońında úshinshi goldı urdı. Endi Aral FK aldaǵı turda Tashkent City komandasına qarsı maydanǵa shıǵadı.',
      'Nukusdagi Turon stadionida 12 mingdan ortiq muxlislar ko‘z o‘ngida kechgan o‘yinda Aral FK birinchi bo‘limdan ustunlikni qo‘lga oldi. Timur Jumaniyazov dubl muallifi bo‘ldi, Davronbek Allaniyazov esa uchinchi golni kiritdi.',
      'In front of over 12,000 fans in Nukus, Aral FC controlled tempo from the opening whistle. Timur Jumaniyazov netted twice before Dawranbek Allaniyazov sealed the 3-1 triumph late in the second half.',
      'football',
      '/src/assets/images/news_football_match_1795530617785.jpg',
      'SPORT ARENA Redakciyası',
      '2026-11-23',
    );

    insertNews.run(
      'Qaraqalpaqstan Bars Almatıdaǵı sırtqı oyında 84:79 esabında uttı',
      'Qoraqalpog‘iston Bars Olmaotadagi safar o‘yinida 84:79 hisobida g‘alaba qozondi',
      'Karakalpakstan Bars edge Almaty Legion 84–79 in dramatic away clash',
      'Oraylıq Aziya Basketbol Kubogınıń ekinshi turında Nókis klubı sońǵı sherekte jeńisti julıp aldı.',
      'Markaziy Osiyo Basketbol Kubogining ikkinchi turida Nukus klubi so‘nggi chorakda g‘alabani ilib ketdi.',
      'In Round 2 of the Central Asian Basketball Cup, the Nukus squad surged in the fourth quarter.',
      'Almatı Arenada ótken keskin básekide Qaraqalpaqstan Bars komandasınıń sárdarı Berdaq Palwanov 26 ochko hám 9 nátiyjeli pas berdi. Sońǵı eki minutta qorǵanıwdaǵı bekkem oyın komandamızǵa áhmiyetli eki ochko keltirdi.',
      'Olmaota Arenada o‘tgan keskin bahsda Qoraqalpog‘iston Bars sardori Berdaq Palvonov 26 ochko va 9 assist qayd etdi. So‘nggi ikki daqiqadagi mustahkam himoya g‘alabani ta’minladi.',
      'Team captain Berdaq Palwanov posted 26 points and 9 assists in Almaty, locking down the perimeter during the final two minutes to secure a crucial road victory.',
      'basketball',
      '/src/assets/images/news_basketball_court_1795530619079.jpg',
      'Azamat Saparov',
      '2026-11-22',
    );

    insertNews.run(
      'Xojeli boks mektebi hám Beruniy palwanları Respublika kubogına tayarlanbaqta',
      'Xo‘jayli boks maktabi va Beruniy polvonlari Respublika kubogiga tayyorlanmoqda',
      'Khojeli Boxing Club and Beruniy wrestlers gear up for national finals',
      'Noyabr aqırında Nókis Arena hám Beruniy sport kompleksinde áhmiyetli jekpe-jekler ótkeriledi.',
      'Noyabr oxirida Nukus Arena va Beruniy sport majmuasida muhim janglar o‘tkaziladi.',
      'Major combat sports finals are scheduled in Nukus and Beruniy at the end of November.',
      'Xojeli boks klubınıń jas juldızları Miraslan Atabaev hám Sultanbek Orazbaev Andijanǵa qarsı keshki shou ushın intensiv tayarlıqtan ótpekte. Sol waqıtta Beruniy gúres komandası Qarshıdan úlken jeńis penen qayttı.',
      'Xo‘jayli boks klubining yosh yulduzlari Miraslan Ataboyev va Sultonbek Orazboyev Andijonga qarshi jang kechasi uchun tayyorgarlik ko‘rmoqda.',
      'Rising boxing talents Miraslan Atabaev and Sultanbek Orazbaev are completing final camp sessions ahead of the Nukus fight night, while Beruniy Wrestling enters the final unbeaten.',
      'boxing',
      '/src/assets/images/news_combat_boxing_1795530618721.jpg',
      'Dilmurat Xojanov',
      '2026-11-20',
    );

    insertNews.run(
      'Nókis Grandmasters shaxmatshıları Tashkentte teńbe-teńlikke eristi',
      'Nukus Grandmasters shaxmatchilari Toshkentda durangga erishdi',
      'Nukus Grandmasters hold Tashkent Chess Academy to 2–2 draw',
      'Komandalıq kuboktıń 6-turında 4 taxtada da keskin intellektual gúres kórildi.',
      'Jamoaviy kubokning 6-turida 4 ta taxtada ham keskin intellektual kurash kechdi.',
      'Round 6 of the Team Chess Cup produced razor-sharp endgames across all four boards.',
      'Birinshi taxtada Begisbay Sultaniyazov tájiriybeli grossmeysterge qarsı qara taslar menen teńlikke eristi. Ekinshi taxtada Aynura Baltabaeva chiroylı kombinaciya menen jeńis alıp keldi. Sheshiwshi 7-tur 1-dekabr kúni Nókiste ótedi.',
      'Birinchi taxtada Begisboy Sultoniyozov qora donalarda durang o‘ynadi, ikkinchi taxtada esa Aynura Boltaboyeva g‘alaba qozondi. Hal qiluvchi tur Nukusda bo‘lib o‘tadi.',
      'On Board 1, Begisbay Sultaniyazov held with the black pieces while Aynura Baltabaeva scored a tactical victory on Board 2, setting up a decisive Round 7 in Nukus.',
      'chess',
      '/src/assets/images/news_chess_championship_1795530618998.jpg',
      'SPORT ARENA Redakciyası',
      '2026-11-18',
    );

    db.prepare(`INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_sync', ?)`).run(nowIso);
    db.prepare(`INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('last_source', 'demo')`).run();
  });

  tx();
  recalculateTeamStats();
}
