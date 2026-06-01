import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLang('sv')}
        className={`text-xl leading-none rounded transition-transform ${lang === 'sv' ? 'scale-125 drop-shadow-lg' : 'opacity-60 hover:opacity-100'}`}
        title="Svenska"
      >
        🇸🇪
      </button>
      <button
        onClick={() => setLang('en')}
        className={`text-xl leading-none rounded transition-transform ${lang === 'en' ? 'scale-125 drop-shadow-lg' : 'opacity-60 hover:opacity-100'}`}
        title="English"
      >
        🇬🇧
      </button>
    </div>
  );
}

export default function Header({ view, setView, remainingCount }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">VM Tips 2026</h1>
            <p className="text-blue-200 mt-1 text-sm sm:text-base">
              {t('header.loggedInAs')} <span className="font-semibold text-white">{user?.name}</span>
              {user?.isAdmin && <span className="ml-2 bg-amber-500 text-xs px-2 py-0.5 rounded-full">Admin</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <NavButton active={view === 'predict'} onClick={() => setView('predict')} badge={remainingCount > 0 ? remainingCount : null}>
                {t('nav.predict')}
              </NavButton>
              <NavButton active={view === 'leaderboard'} onClick={() => setView('leaderboard')}>
                {t('nav.leaderboard')}
              </NavButton>
              <NavButton active={view === 'venues'} onClick={() => setView('venues')}>
                {t('nav.venues')}
              </NavButton>
              <NavButton active={view === 'funfacts'} onClick={() => setView('funfacts')}>
                {t('nav.funfacts')}
              </NavButton>
              <NavButton active={view === 'balls'} onClick={() => setView('balls')}>
                {t('nav.balls')}
              </NavButton>
              {user?.isAdmin && (
                <NavButton active={view === 'admin'} onClick={() => setView('admin')}>
                  {t('nav.admin')}
                </NavButton>
              )}
            </div>
            <div className="w-px h-6 bg-white/20 hidden sm:block mx-2" />
            <LanguageSwitcher />
            <div className="w-px h-6 bg-white/20 hidden sm:block mx-1" />
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-red-500/80 transition-colors"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavButton({ active, onClick, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-blue-900'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {children}
      {badge != null && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {badge}
        </span>
      )}
    </button>
  );
}
