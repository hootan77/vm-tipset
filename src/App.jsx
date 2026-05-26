import { useState, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useTournament } from './context/TournamentContext';
import { useLanguage } from './context/LanguageContext';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import GroupStage from './components/GroupStage';
import BestThirds from './components/BestThirds';
import KnockoutBracket from './components/KnockoutBracket';
import Leaderboard from './components/Leaderboard';
import Venues from './components/Venues';
import FunFacts from './components/FunFacts';
import WorldCupBalls from './components/WorldCupBalls';
import UserManager from './components/UserManager';
import ViewUserPredictions from './components/ViewUserPredictions';

function TopScorerInput({ isAdmin }) {
  const { state, saveTopScorer, locked } = useTournament();
  const { t } = useLanguage();
  const readOnly = !isAdmin && locked;
  const value = isAdmin ? state.adminTopScorer : state.topScorer;

  const handleChange = (e) => {
    if (readOnly) return;
    saveTopScorer(e.target.value, isAdmin);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className={`px-4 py-3 ${isAdmin ? 'bg-gradient-to-r from-amber-600 to-amber-800' : 'bg-gradient-to-r from-purple-600 to-purple-800'}`}>
        <h3 className="text-white font-bold text-lg">{t('predict.topScorer')}</h3>
      </div>
      <div className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isAdmin ? t('predict.topScorerAdmin') : t('predict.topScorerUser')}
        </label>
        <input
          type="text"
          disabled={readOnly}
          placeholder={t('predict.topScorerPlaceholder')}
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
  const { t } = useLanguage();
  if (!locked) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
      <span className="text-2xl">🔒</span>
      <div>
        <p className="font-semibold text-red-800">{t('predict.locked')}</p>
        <p className="text-sm text-red-600">{t('predict.lockedDesc')}</p>
      </div>
    </div>
  );
}

function AdminLockButton() {
  const { locked, toggleLock } = useTournament();
  const { t } = useLanguage();
  return (
    <button
      onClick={toggleLock}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        locked
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {locked ? `🔒 ${t('predict.unlock')}` : `🔓 ${t('predict.lock')}`}
    </button>
  );
}

function ScoringRulesButton() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 bg-white rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('rules.title')}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{t('rules.title')}</h3>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">{t('rules.groupStage')}</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.exactResult')}</span><span className="font-bold text-emerald-600">5 {t('rules.points')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.correctOutcome')}</span><span className="font-bold text-emerald-600">2 {t('rules.points')}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">{t('rules.knockoutMatch')}</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.exactResult')}</span><span className="font-bold text-emerald-600">5 {t('rules.points')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.correctOutcome')}</span><span className="font-bold text-emerald-600">2 {t('rules.points')}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">{t('rules.knockoutTeams')}</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.r32')}</span><span className="font-bold text-emerald-600">5 {t('rules.perTeam')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.r16')}</span><span className="font-bold text-emerald-600">5 {t('rules.perTeam')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.qf')}</span><span className="font-bold text-emerald-600">5 {t('rules.perTeam')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.sf')}</span><span className="font-bold text-emerald-600">10 {t('rules.perTeam')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.final')}</span><span className="font-bold text-emerald-600">20 {t('rules.perTeam')}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">{t('rules.bonus')}</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.winner')}</span><span className="font-bold text-amber-600">40 {t('rules.points')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.bronze')}</span><span className="font-bold text-amber-600">20 {t('rules.points')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.topScorer')}</span><span className="font-bold text-amber-600">50 {t('rules.points')}</span></div>
                </div>
              </div>
              <div className="text-xs text-gray-400 pt-2 border-t">{t('rules.tiebreaker')}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MainApp() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{t('predict.groupTitle')}</h2>
                <ScoringRulesButton />
              </div>
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
        {view === 'balls' && <WorldCupBalls />}

        {view === 'admin' && user.isAdmin && (
          <>
            <section className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{t('admin.title')}</h2>
                <p className="text-gray-500">{t('admin.subtitle')}</p>
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
