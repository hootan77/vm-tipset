import { useState, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useTournament } from './context/TournamentContext';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import GroupStage from './components/GroupStage';
import BestThirds from './components/BestThirds';
import KnockoutBracket from './components/KnockoutBracket';
import Leaderboard from './components/Leaderboard';
import Venues from './components/Venues';
import FunFacts from './components/FunFacts';
import UserManager from './components/UserManager';
import ViewUserPredictions from './components/ViewUserPredictions';

function TopScorerInput({ isAdmin }) {
  const { state, saveTopScorer, locked } = useTournament();
  const readOnly = !isAdmin && locked;
  const value = isAdmin ? state.adminTopScorer : state.topScorer;
  const timerRef = useRef(null);

  const handleChange = (e) => {
    if (readOnly) return;
    const v = e.target.value;
    saveTopScorer(v, isAdmin);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className={`px-4 py-3 ${isAdmin ? 'bg-gradient-to-r from-amber-600 to-amber-800' : 'bg-gradient-to-r from-purple-600 to-purple-800'}`}>
        <h3 className="text-white font-bold text-lg">Skyttekung</h3>
      </div>
      <div className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isAdmin ? 'Ange den verkliga skyttekungen' : 'Vem tror du blir skyttekung?'}
        </label>
        <input
          type="text"
          disabled={readOnly}
          placeholder="T.ex. Kylian Mbappé"
          className={`w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

function LockBanner() {
  const { locked } = useTournament();
  if (!locked) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
      <span className="text-2xl">🔒</span>
      <div>
        <p className="font-semibold text-red-800">Tippningen är låst</p>
        <p className="text-sm text-red-600">Du kan inte längre ändra dina tips.</p>
      </div>
    </div>
  );
}

function AdminLockButton() {
  const { locked, toggleLock } = useTournament();
  return (
    <button
      onClick={toggleLock}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        locked
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {locked ? '🔒 Lås upp tippning' : '🔓 Lås tippning'}
    </button>
  );
}

function MainApp() {
  const { user } = useAuth();
  const [view, setView] = useState('predict');
  const [viewUser, setViewUser] = useState(null);

  if (viewUser) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header view={view} setView={(v) => { setViewUser(null); setView(v); }} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <ViewUserPredictions viewUser={viewUser} onBack={() => setViewUser(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header view={view} setView={setView} />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {view === 'predict' && (
          <>
            <LockBanner />
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Gruppspel — Dina tips</h2>
              <GroupStage isAdmin={false} />
            </section>
            <BestThirds isAdmin={false} />
            <section>
              <KnockoutBracket isAdmin={false} />
            </section>
            <TopScorerInput isAdmin={false} />
          </>
        )}

        {view === 'leaderboard' && <Leaderboard />}

        {view === 'venues' && <Venues />}

        {view === 'funfacts' && <FunFacts />}

        {view === 'admin' && user.isAdmin && (
          <>
            <section className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Admin — Verkliga resultat</h2>
                <p className="text-gray-500">Fyll i de riktiga matchresultaten. Poäng beräknas automatiskt.</p>
              </div>
              <AdminLockButton />
            </section>
            <GroupStage isAdmin={true} />
            <BestThirds isAdmin={true} />
            <section>
              <KnockoutBracket isAdmin={true} />
            </section>
            <TopScorerInput isAdmin={true} />
            <UserManager onViewUser={setViewUser} />
            <section className="border-t pt-8">
              <Leaderboard />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <MainApp />;
}
