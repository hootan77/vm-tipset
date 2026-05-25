import { useAuth } from '../context/AuthContext';

export default function Header({ view, setView }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">VM Tips 2026</h1>
            <p className="text-blue-200 mt-1 text-sm sm:text-base">
              Inloggad som <span className="font-semibold text-white">{user?.name}</span>
              {user?.isAdmin && <span className="ml-2 bg-amber-500 text-xs px-2 py-0.5 rounded-full">Admin</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <NavButton active={view === 'predict'} onClick={() => setView('predict')}>
                Tippa
              </NavButton>
              <NavButton active={view === 'leaderboard'} onClick={() => setView('leaderboard')}>
                Ställning
              </NavButton>
              <NavButton active={view === 'venues'} onClick={() => setView('venues')}>
                VM Arenor
              </NavButton>
              <NavButton active={view === 'funfacts'} onClick={() => setView('funfacts')}>
                Fun Facts
              </NavButton>
              <NavButton active={view === 'balls'} onClick={() => setView('balls')}>
                VM Bollar
              </NavButton>
              {user?.isAdmin && (
                <NavButton active={view === 'admin'} onClick={() => setView('admin')}>
                  Admin
                </NavButton>
              )}
            </div>
            <div className="w-px h-6 bg-white/20 hidden sm:block mx-2" />
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-red-500/80 transition-colors"
            >
              Logga ut
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-blue-900'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );
}
