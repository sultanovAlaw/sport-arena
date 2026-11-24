import type { Language, MatchStatus, SportType } from './types';

export const SPORTS_LIST: SportType[] = [
  'football',
  'basketball',
  'volleyball',
  'tennis',
  'wrestling',
  'boxing',
  'chess',
];

export const TRANSLATIONS: Record<
  Language,
  {
    brand: string;
    nav: {
      dashboard: string;
      schedule: string;
      results: string;
      teams: string;
      admin: string;
    };
    auth: {
      login: string;
      register: string;
      logout: string;
      account: string;
      name: string;
      email: string;
      password: string;
      submitLogin: string;
      submitRegister: string;
      switchToRegister: string;
      switchToLogin: string;
      welcomeBack: string;
      createAccount: string;
      authSubtitle: string;
    };
    toolbar: {
      searchPlaceholder: string;
      allSports: string;
      autoRefresh: string;
      autoRefreshOn: string;
      autoRefreshOff: string;
      syncApi: string;
      syncing: string;
      darkMode: string;
      lightMode: string;
    };
    dataBanner: {
      demoNotice: string;
      hybridNotice: string;
      lastSync: string;
    };
    dashboard: {
      heroKicker: string;
      heroTitle: string;
      heroSubtitle: string;
      viewSchedule: string;
      viewResults: string;
      featuredMatch: string;
      sportsDirectory: string;
      upcomingTitle: string;
      recentResultsTitle: string;
      latestNewsTitle: string;
      seeAll: string;
      readMore: string;
      matchesCount: string;
    };
    schedule: {
      title: string;
      subtitle: string;
      allStatuses: string;
      date: string;
      time: string;
      matchup: string;
      venue: string;
      status: string;
      tournament: string;
      noMatches: string;
    };
    results: {
      title: string;
      subtitle: string;
      winner: string;
      draw: string;
      liveNow: string;
      historyTitle: string;
      noResults: string;
    };
    teams: {
      title: string;
      subtitle: string;
      allTeams: string;
      favoritesOnly: string;
      wins: string;
      draws: string;
      losses: string;
      points: string;
      roster: string;
      follow: string;
      following: string;
      loginToFollow: string;
      city: string;
      playersCount: string;
      noTeams: string;
      teamDetails: string;
      playerNumber: string;
      playerName: string;
      playerPosition: string;
    };
    admin: {
      title: string;
      subtitle: string;
      loginTitle: string;
      loginSubtitle: string;
      claimTitle: string;
      claimSubtitle: string;
      claimButton: string;
      notAdminError: string;
      tabs: {
        matches: string;
        scores: string;
        teams: string;
        news: string;
      };
      addMatch: string;
      editMatch: string;
      saveMatch: string;
      cancelEdit: string;
      deleteConfirm: string;
      homeTeam: string;
      awayTeam: string;
      roundLabel: string;
      updateScore: string;
      addTeam: string;
      teamName: string;
      shortCode: string;
      teamColor: string;
      rosterInput: string;
      rosterHint: string;
      publishNews: string;
      newsTitle: string;
      newsSummary: string;
      newsContent: string;
      newsImage: string;
      resetDemo: string;
      syncExternal: string;
      savedNotice: string;
    };
    sports: Record<SportType, string>;
    statuses: Record<MatchStatus, string>;
    common: {
      close: string;
      save: string;
      edit: string;
      delete: string;
      cancel: string;
      loading: string;
      demoTag: string;
      liveApiTag: string;
      adminTag: string;
    };
  }
> = {
  kaa: {
    brand: 'SPORT ARENA',
    nav: {
      dashboard: 'Bas bet',
      schedule: 'Keste',
      results: 'Nátiyjeler',
      teams: 'Komandalar',
      admin: 'Admin',
    },
    auth: {
      login: 'Kiriw',
      register: 'Dizimnen ótiw',
      logout: 'Shıǵıw',
      account: 'Profil',
      name: 'Tolıq atıńız',
      email: 'Elektron pochta',
      password: 'Parol',
      submitLogin: 'Akkauntqa kiriw',
      submitRegister: 'Dizimnen ótiw',
      switchToRegister: 'Akkauntıńız joq pa? Dizimnen ótiń',
      switchToLogin: 'Akkauntıńız bar ma? Kiriń',
      welcomeBack: 'SPORT ARENA portalına xosh keldińiz',
      createAccount: 'Jańa paydalanıwshı jaratıw',
      authSubtitle: 'Favorit komandalarǵa jazılıw ushın akkauntıńızǵa kiriń.',
    },
    toolbar: {
      searchPlaceholder: 'Jarıs, komanda yamasa stadion izlew...',
      allSports: 'Barlıq sportlar',
      autoRefresh: 'Avto-jańalaw',
      autoRefreshOn: 'Janlı (15s)',
      autoRefreshOff: 'Óshirilgen',
      syncApi: 'API-dan jańalaw',
      syncing: 'Júklenbekte...',
      darkMode: 'Qara rejim',
      lightMode: 'Jaqtı rejim',
    },
    dataBanner: {
      demoNotice:
        'Demo maǵlıwmatlar (SQLite bazasında saqlanǵan). Real sport nátiyjelerin alıw ushın "API-dan jańalaw" túymesin basıń yamasa Admin panel arqalı ózgertiń.',
      hybridNotice:
        'Portalda jergilikli demo jarıslar menen birge TheSportsDB ashıq API-dan alınǵan real futbol maǵlıwmatları da kórsetilmekte.',
      lastSync: 'Sońǵı jańalanıw',
    },
    dashboard: {
      heroKicker: 'Online Sport Portalı · 7 Sport Túri',
      heroTitle: 'Sport jarısları, keste hám nátiyjeler bir arenada',
      heroSubtitle:
        'Qaraqalpaqstan hám xalıqaralıq chempionatlardıń dawam etip atırǵan oyınların, aldaǵı kestesin hám komandalar statistikasın real waqıtta baqlań.',
      viewSchedule: 'Jarıslar kestesi',
      viewResults: 'Sońǵı nátiyjeler',
      featuredMatch: 'Oraylıq ushırasıw',
      sportsDirectory: 'Sport túrleri boyınsha bólimler',
      upcomingTitle: 'Alda bolatuǵın jarıslar',
      recentResultsTitle: 'Sońǵı oyınlar nátiyjeleri',
      latestNewsTitle: 'Eń jańa sport xabarları',
      seeAll: 'Bársin kóriw',
      readMore: 'Tolıq oqıw',
      matchesCount: 'oyın',
    },
    schedule: {
      title: 'Jarıslar kestesi',
      subtitle: 'Barlıq sport túrleri boyınsha ótkeriletuǵın jarıslardıń sáne, waqıt hám statusı.',
      allStatuses: 'Barlıq statuslar',
      date: 'Sáne',
      time: 'Waqıt',
      matchup: 'Qatnasıwshılar',
      venue: 'Ótkeriletuǵın orın',
      status: 'Status',
      tournament: 'Jarıs atı',
      noMatches: 'Tańlanǵan filtr boyınsha jarıs tabılmadı.',
    },
    results: {
      title: 'Oyın nátiyjeleri',
      subtitle: 'Tamamlanǵan hám dawam etip atırǵan oyınlardıń anıq esapları menen jeńimpazları.',
      winner: 'Jeńimpaz',
      draw: 'Teńbe-teń',
      liveNow: 'Dawam etpekte',
      historyTitle: 'Tamamlanǵan oyınlar tariyxı',
      noResults: 'Házirshe nátiyjeler tabılmadı.',
    },
    teams: {
      title: 'Komandalar hám statistika',
      subtitle: 'Klublar quramı, oyınshılar dizimi hám jeńis-jeńilis kórsetkishleri.',
      allTeams: 'Barlıq komandalar',
      favoritesOnly: 'Meniń favoritlarım',
      wins: 'Jeńis',
      draws: 'Teń',
      losses: 'Jeńilis',
      points: 'Ochko',
      roster: 'Oyınshılar dizimi',
      follow: 'Favoritqa qosıw',
      following: 'Jazılǵan',
      loginToFollow: 'Jazılıw ushın kiriń',
      city: 'Qala',
      playersCount: 'oyınshı',
      noTeams: 'Komanda tabılmadı.',
      teamDetails: 'Komanda maǵlıwmatları',
      playerNumber: '№',
      playerName: 'Oyınshı',
      playerPosition: 'Poziciya',
    },
    admin: {
      title: 'Admin basqarıw paneli',
      subtitle: 'Jarıslardı, oyın nátiyjelerin, komandalardı hám xabarlardı tikkeley basqarıń.',
      loginTitle: 'Admin paneline kiriw',
      loginSubtitle: 'Ózgerisler kirgiziw ushın administrator login hám parolin kiritiń.',
      claimTitle: 'Birinshi ret Admin akkauntın ornatıw',
      claimSubtitle:
        'Serverde ele administrator paroli belgilenbegen. Tómende birinshi admin parolin ornatıp, basqarıw huqıqın alıń.',
      claimButton: 'Admin akkauntın jaratıw',
      notAdminError: 'Bul bólim tek administratorlar ushın. Admin akkauntı menen kiriń.',
      tabs: {
        matches: 'Jarıslar & Keste',
        scores: 'Nátiyje kirgiziw',
        teams: 'Komandalar',
        news: 'Xabarlar & API',
      },
      addMatch: 'Jańa jarıs qosıw',
      editMatch: 'Jarıstı ózgertiw',
      saveMatch: 'Jarıstı saqlaw',
      cancelEdit: 'Biykarlaw',
      deleteConfirm: 'Bul maǵlıwmattı óshiresiz be?',
      homeTeam: 'Úy komandası',
      awayTeam: 'Miyman komanda',
      roundLabel: 'Tur / Basqısh',
      updateScore: 'Esaptı saqlaw',
      addTeam: 'Jańa komanda qosıw',
      teamName: 'Komanda atı',
      shortCode: 'Qısqa kod (3 hárip)',
      teamColor: 'Klub reńi',
      rosterInput: 'Oyınshılar (hár qatarda: Nomer, Atı, Poziciya)',
      rosterHint: 'Mısal: 10, Timur Jumaniyazov, FW',
      publishNews: 'Jańa xabar járiyalaw',
      newsTitle: 'Xabar ataması',
      newsSummary: 'Qısqasha mazmunı',
      newsContent: 'Tolıq tekst',
      newsImage: 'Súwret tańlaw',
      resetDemo: 'Demo maǵlıwmatlardı qayta tiklew',
      syncExternal: 'TheSportsDB API sinxronizaciyası',
      savedNotice: 'Maǵlıwmatlar bazada sátti saqlandı hám bas bette jańalandı.',
    },
    sports: {
      football: 'Futbol',
      basketball: 'Basketbol',
      volleyball: 'Voleybol',
      tennis: 'Tennis',
      wrestling: 'Gúres',
      boxing: 'Boks',
      chess: 'Shaxmat',
    },
    statuses: {
      upcoming: 'Alda',
      live: 'Dawam etpekte',
      completed: 'Tamamlandı',
    },
    common: {
      close: 'Jabıw',
      save: 'Saqlaw',
      edit: 'Ózgertiw',
      delete: 'Óshiriw',
      cancel: 'Biykarlaw',
      loading: 'Júklenbekte...',
      demoTag: 'Demo',
      liveApiTag: 'TheSportsDB API',
      adminTag: 'Admin',
    },
  },
  uz: {
    brand: 'SPORT ARENA',
    nav: {
      dashboard: 'Bosh sahifa',
      schedule: 'Jadval',
      results: 'Natijalar',
      teams: 'Jamoalar',
      admin: 'Admin',
    },
    auth: {
      login: 'Kirish',
      register: 'Ro‘yxatdan o‘tish',
      logout: 'Chiqish',
      account: 'Profil',
      name: 'To‘liq ismingiz',
      email: 'Elektron pochta',
      password: 'Parol',
      submitLogin: 'Hisobga kirish',
      submitRegister: 'Ro‘yxatdan o‘tish',
      switchToRegister: 'Hisobingiz yo‘qmi? Ro‘yxatdan o‘ting',
      switchToLogin: 'Hisobingiz bormi? Kiring',
      welcomeBack: 'SPORT ARENA portaliga xush kelibsiz',
      createAccount: 'Yangi foydalanuvchi yaratish',
      authSubtitle: 'Sevimli jamoalarga obuna bo‘lish uchun hisobingizga kiring.',
    },
    toolbar: {
      searchPlaceholder: 'Musobaqa, jamoa yoki stadion qidirish...',
      allSports: 'Barcha sportlar',
      autoRefresh: 'Avto-yangilash',
      autoRefreshOn: 'Jonli (15s)',
      autoRefreshOff: 'O‘chirilgan',
      syncApi: 'API dan yangilash',
      syncing: 'Yuklanmoqda...',
      darkMode: 'Tungi rejim',
      lightMode: 'Yorug‘ rejim',
    },
    dataBanner: {
      demoNotice:
        'Demo ma’lumotlar (SQLite bazasida saqlangan). Haqiqiy sport natijalarini olish uchun "API dan yangilash" tugmasini bosing yoki Admin panel orqali tahrirlang.',
      hybridNotice:
        'Portalda mahalliy demo musobaqalar bilan birga TheSportsDB ochiq API dan olingan haqiqiy futbol ma’lumotlari ham ko‘rsatilmoqda.',
      lastSync: 'Oxirgi yangilanish',
    },
    dashboard: {
      heroKicker: 'Online Sport Portali · 7 Sport Turi',
      heroTitle: 'Sport musobaqalari, jadval va natijalar bir arenada',
      heroSubtitle:
        'Qoraqalpog‘iston va xalqaro chempionatlarning jonli o‘yinlarini, bo‘lajak jadvalni va jamoalar statistikasini real vaqtda kuzating.',
      viewSchedule: 'Musobaqalar jadvali',
      viewResults: 'Oxirgi natijalar',
      featuredMatch: 'Markaziy uchrashuv',
      sportsDirectory: 'Sport turlari bo‘yicha bo‘limlar',
      upcomingTitle: 'Bo‘lajak musobaqalar',
      recentResultsTitle: 'Oxirgi o‘yinlar natijalari',
      latestNewsTitle: 'Eng so‘nggi sport yangiliklari',
      seeAll: 'Barchasini ko‘rish',
      readMore: 'Batafsil o‘qish',
      matchesCount: 'o‘yin',
    },
    schedule: {
      title: 'Musobaqalar jadvali',
      subtitle: 'Barcha sport turlari bo‘yicha o‘tkaziladigan musobaqalarning sana, vaqt va holati.',
      allStatuses: 'Barcha holatlar',
      date: 'Sana',
      time: 'Vaqt',
      matchup: 'Ishtirokchilar',
      venue: 'O‘tkazilish joyi',
      status: 'Holat',
      tournament: 'Musobaqa nomi',
      noMatches: 'Tanlangan filtr bo‘yicha musobaqa topilmadi.',
    },
    results: {
      title: 'O‘yin natijalari',
      subtitle: 'Yakunlangan va davom etayotgan o‘yinlarning aniq hisoblari va g‘oliblari.',
      winner: 'G‘olib',
      draw: 'Durang',
      liveNow: 'Davom etmoqda',
      historyTitle: 'Yakunlangan o‘yinlar tarixi',
      noResults: 'Hozircha natijalar topilmadi.',
    },
    teams: {
      title: 'Jamoalar va statistika',
      subtitle: 'Klublar tarkibi, o‘yinchilar ro‘yxati va g‘alaba-mag‘lubiyat ko‘rsatkichlari.',
      allTeams: 'Barcha jamoalar',
      favoritesOnly: 'Mening sevimlilarim',
      wins: 'G‘alaba',
      draws: 'Durang',
      losses: 'Mag‘lubiyat',
      points: 'Ochko',
      roster: 'O‘yinchilar ro‘yxati',
      follow: 'Sevimliga qo‘shish',
      following: 'Obuna bo‘lingan',
      loginToFollow: 'Obuna uchun kiring',
      city: 'Shahar',
      playersCount: 'o‘yinchi',
      noTeams: 'Jamoa topilmadi.',
      teamDetails: 'Jamoa ma’lumotlari',
      playerNumber: '№',
      playerName: 'O‘yinchi',
      playerPosition: 'Pozitsiya',
    },
    admin: {
      title: 'Admin boshqaruv paneli',
      subtitle: 'Musobaqalar, o‘yin natijalari, jamoalar va yangiliklarni boshqaring.',
      loginTitle: 'Admin paneliga kirish',
      loginSubtitle: 'O‘zgartirish kiritish uchun administrator login va parolini kiriting.',
      claimTitle: 'Birinchi marta Admin hisobini yaratish',
      claimSubtitle:
        'Serverda hali administrator paroli o‘rnatilmagan. Quyida birinchi admin parolini o‘rnating.',
      claimButton: 'Admin hisobini yaratish',
      notAdminError: 'Bu bo‘lim faqat administratorlar uchun. Admin hisobi bilan kiring.',
      tabs: {
        matches: 'Musobaqa & Jadval',
        scores: 'Natija kiritish',
        teams: 'Jamoalar',
        news: 'Yangiliklar & API',
      },
      addMatch: 'Yangi musobaqa qo‘shish',
      editMatch: 'Musobaqani tahrirlash',
      saveMatch: 'Saqlash',
      cancelEdit: 'Bekor qilish',
      deleteConfirm: 'Ushbu ma’lumotni o‘chirasizmi?',
      homeTeam: 'Mezbon jamoa',
      awayTeam: 'Mehmon jamoa',
      roundLabel: 'Tur / Bosqich',
      updateScore: 'Hisobni saqlash',
      addTeam: 'Yangi jamoa qo‘shish',
      teamName: 'Jamoa nomi',
      shortCode: 'Qisqa kod (3 harf)',
      teamColor: 'Klub rangi',
      rosterInput: 'O‘yinchilar (har qatorda: Raqam, Ism, Pozitsiya)',
      rosterHint: 'Misol: 10, Timur Jumaniyazov, FW',
      publishNews: 'Yangilik chop etish',
      newsTitle: 'Yangilik sarlavhasi',
      newsSummary: 'Qisqacha mazmuni',
      newsContent: 'To‘liq matn',
      newsImage: 'Rasm tanlash',
      resetDemo: 'Demo ma’lumotlarni tiklash',
      syncExternal: 'TheSportsDB API sinxronizatsiyasi',
      savedNotice: 'Ma’lumotlar bazada saqlandi va bosh sahifada yangilandi.',
    },
    sports: {
      football: 'Futbol',
      basketball: 'Basketbol',
      volleyball: 'Voleybol',
      tennis: 'Tennis',
      wrestling: 'Kurash',
      boxing: 'Boks',
      chess: 'Shaxmat',
    },
    statuses: {
      upcoming: 'Bo‘lajak',
      live: 'Davom etmoqda',
      completed: 'Yakunlandi',
    },
    common: {
      close: 'Yopish',
      save: 'Saqlash',
      edit: 'Tahrirlash',
      delete: 'O‘chirish',
      cancel: 'Bekor qilish',
      loading: 'Yuklanmoqda...',
      demoTag: 'Demo',
      liveApiTag: 'TheSportsDB API',
      adminTag: 'Admin',
    },
  },
  en: {
    brand: 'SPORT ARENA',
    nav: {
      dashboard: 'Dashboard',
      schedule: 'Schedule',
      results: 'Results',
      teams: 'Teams',
      admin: 'Admin',
    },
    auth: {
      login: 'Sign In',
      register: 'Register',
      logout: 'Sign Out',
      account: 'Account',
      name: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      submitLogin: 'Sign In',
      submitRegister: 'Create Account',
      switchToRegister: 'New here? Create an account',
      switchToLogin: 'Already have an account? Sign in',
      welcomeBack: 'Welcome back to SPORT ARENA',
      createAccount: 'Create your fan account',
      authSubtitle: 'Sign in to follow favorite clubs and track personalized match updates.',
    },
    toolbar: {
      searchPlaceholder: 'Search tournaments, clubs, or venues...',
      allSports: 'All Sports',
      autoRefresh: 'Auto-Refresh',
      autoRefreshOn: 'Live (15s)',
      autoRefreshOff: 'Paused',
      syncApi: 'Sync Live API',
      syncing: 'Syncing...',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
    },
    dataBanner: {
      demoNotice:
        'Demo dataset stored in SQLite. Click "Sync Live API" to fetch real football fixtures from TheSportsDB or manage entries in the Admin panel.',
      hybridNotice:
        'Displaying local demo competitions alongside live international football data synced from TheSportsDB public API.',
      lastSync: 'Last updated',
    },
    dashboard: {
      heroKicker: 'Live Sports Portal · 7 Disciplines',
      heroTitle: 'Competitions, schedules, and live scores in one arena',
      heroSubtitle:
        'Follow ongoing regional and international championships, browse upcoming fixtures, and analyze club standings in real time.',
      viewSchedule: 'View Schedule',
      viewResults: 'Recent Results',
      featuredMatch: 'Featured Fixture',
      sportsDirectory: 'Browse by Sport',
      upcomingTitle: 'Upcoming Competitions',
      recentResultsTitle: 'Latest Match Results',
      latestNewsTitle: 'Latest Sports News',
      seeAll: 'View all',
      readMore: 'Read full story',
      matchesCount: 'matches',
    },
    schedule: {
      title: 'Competition Schedule',
      subtitle: 'Dates, kickoff times, venues, and live status across all seven sports.',
      allStatuses: 'All Statuses',
      date: 'Date',
      time: 'Time',
      matchup: 'Matchup',
      venue: 'Venue',
      status: 'Status',
      tournament: 'Tournament',
      noMatches: 'No fixtures match your current search or filter.',
    },
    results: {
      title: 'Match Results',
      subtitle: 'Verified final scores, live scoreboards, and official match winners.',
      winner: 'Winner',
      draw: 'Draw',
      liveNow: 'In Progress',
      historyTitle: 'Completed Match History',
      noResults: 'No match results found.',
    },
    teams: {
      title: 'Teams & Standings',
      subtitle: 'Club rosters, player numbers, and win-loss statistics.',
      allTeams: 'All Teams',
      favoritesOnly: 'My Favorites',
      wins: 'W',
      draws: 'D',
      losses: 'L',
      points: 'Pts',
      roster: 'Team Roster',
      follow: 'Follow Team',
      following: 'Following',
      loginToFollow: 'Sign in to follow',
      city: 'City',
      playersCount: 'players',
      noTeams: 'No teams match your filter.',
      teamDetails: 'Club Profile',
      playerNumber: '#',
      playerName: 'Player',
      playerPosition: 'Role',
    },
    admin: {
      title: 'Admin Control Panel',
      subtitle: 'Manage tournaments, live scores, club rosters, and news publications.',
      loginTitle: 'Admin Sign In',
      loginSubtitle: 'Enter administrator credentials to manage portal records.',
      claimTitle: 'First-Run Admin Setup',
      claimSubtitle:
        'No administrator password is configured yet. Claim admin access below to protect management routes.',
      claimButton: 'Claim Admin Access',
      notAdminError: 'Administrator privileges are required to access this workspace.',
      tabs: {
        matches: 'Fixtures & Schedule',
        scores: 'Score Entry',
        teams: 'Teams',
        news: 'News & API',
      },
      addMatch: 'Add New Fixture',
      editMatch: 'Edit Fixture',
      saveMatch: 'Save Fixture',
      cancelEdit: 'Cancel',
      deleteConfirm: 'Delete this record permanently?',
      homeTeam: 'Home Team',
      awayTeam: 'Away Team',
      roundLabel: 'Round / Stage',
      updateScore: 'Save Score',
      addTeam: 'Add New Team',
      teamName: 'Team Name',
      shortCode: 'Short Code (3 letters)',
      teamColor: 'Club Color',
      rosterInput: 'Players (one per line: Number, Name, Position)',
      rosterHint: 'Example: 10, Timur Jumaniyazov, FW',
      publishNews: 'Publish Sports Article',
      newsTitle: 'Article Headline',
      newsSummary: 'Summary',
      newsContent: 'Full Content',
      newsImage: 'Select Image',
      resetDemo: 'Reset Demo Dataset',
      syncExternal: 'Sync TheSportsDB API',
      savedNotice: 'Saved to SQLite database and updated on the portal.',
    },
    sports: {
      football: 'Football',
      basketball: 'Basketball',
      volleyball: 'Volleyball',
      tennis: 'Tennis',
      wrestling: 'Wrestling',
      boxing: 'Boxing',
      chess: 'Chess',
    },
    statuses: {
      upcoming: 'Upcoming',
      live: 'Live',
      completed: 'Completed',
    },
    common: {
      close: 'Close',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      loading: 'Loading...',
      demoTag: 'Demo',
      liveApiTag: 'TheSportsDB API',
      adminTag: 'Admin',
    },
  },
};

export function getNewsLocalized(
  item: {
    title_kaa: string;
    title_uz: string;
    title_en: string;
    summary_kaa: string;
    summary_uz: string;
    summary_en: string;
    content_kaa: string;
    content_uz: string;
    content_en: string;
  },
  lang: Language
) {
  if (lang === 'uz') {
    return { title: item.title_uz, summary: item.summary_uz, content: item.content_uz };
  }
  if (lang === 'en') {
    return { title: item.title_en, summary: item.summary_en, content: item.content_en };
  }
  return { title: item.title_kaa, summary: item.summary_kaa, content: item.content_kaa };
}
