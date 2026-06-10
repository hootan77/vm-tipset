import { useState, useRef, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { useTournament } from './context/TournamentContext';
import { useLanguage } from './context/LanguageContext';
import { GROUP_NAMES } from './data/teams';
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
import AdminDataManager from './components/AdminDataManager';
import AdminBonusOverview from './components/AdminBonusOverview';
import AdminPredictionStats from './components/AdminPredictionStats';

function BonusQuestions({ isAdmin }) {
  const { state, saveTopScorer, saveBonusField, locked } = useTournament();
  const { t } = useLanguage();
  const readOnly = !isAdmin && locked;

  const topScorer = isAdmin ? state.adminTopScorer : state.topScorer;
  const redCard = isAdmin ? state.adminFirstRedCardNation : state.firstRedCardNation;
  const goldenGlove = isAdmin ? state.adminGoldenGlove : state.goldenGlove;
  const tiebreaker = isAdmin ? state.adminTiebreaker : state.tiebreaker;

  const inputClass = `w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className={`px-4 py-3 ${isAdmin ? 'bg-gradient-to-r from-amber-600 to-amber-800' : 'bg-gradient-to-r from-purple-600 to-purple-800'}`}>
        <h3 className="text-white font-bold text-lg">{t('rules.bonus')}</h3>
      </div>
      <div className="p-4 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🏅 {t('predict.topScorer')} <span className="text-purple-500 text-xs font-normal">(50p)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">{isAdmin ? t('predict.topScorerAdmin') : t('predict.topScorerUser')}</p>
          <input type="text" disabled={readOnly} placeholder={t('predict.topScorerPlaceholder')} className={inputClass}
            value={topScorer} onChange={e => { if (!readOnly) saveTopScorer(e.target.value, isAdmin); }} />
        </div>
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🟥 {t('predict.redCard')} <span className="text-purple-500 text-xs font-normal">(20p)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">{isAdmin ? t('predict.redCardAdmin') : t('predict.redCardUser')}</p>
          <input type="text" disabled={readOnly} placeholder={t('predict.redCardPlaceholder')} className={inputClass}
            value={redCard} onChange={e => { if (!readOnly) saveBonusField('firstRedCardNation', e.target.value, isAdmin); }} />
        </div>
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🧤 {t('predict.goldenGlove')} <span className="text-purple-500 text-xs font-normal">(40p)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">{isAdmin ? t('predict.goldenGloveAdmin') : t('predict.goldenGloveUser')}</p>
          <input type="text" disabled={readOnly} placeholder={t('predict.goldenGlovePlaceholder')} className={inputClass}
            value={goldenGlove} onChange={e => { if (!readOnly) saveBonusField('goldenGlove', e.target.value, isAdmin); }} />
        </div>
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🎯 {t('predict.tiebreaker')}
          </label>
          <p className="text-xs text-gray-500 mb-1 font-medium">{t('predict.tiebreakerQuestion')}</p>
          <p className="text-xs text-gray-500 mb-2">{isAdmin ? t('predict.tiebreakerAdmin') : t('predict.tiebreakerUser')}</p>
          <input type="number" disabled={readOnly} placeholder={t('predict.tiebreakerPlaceholder')} className={inputClass}
            value={tiebreaker ?? ''} onChange={e => { if (!readOnly) saveBonusField('tiebreaker', e.target.value ? parseInt(e.target.value) : null, isAdmin); }} />
        </div>
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
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.redCard')}</span><span className="font-bold text-amber-600">20 {t('rules.points')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.goldenGlove')}</span><span className="font-bold text-amber-600">40 {t('rules.points')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">{t('rules.topScorer')}</span><span className="font-bold text-amber-600">50 {t('rules.points')}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">{t('rules.tiebreakerTitle')}</h4>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  {t('rules.tiebreakerDesc')}
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

function useRemainingPredictions() {
  const { state, computed } = useTournament();

  return useMemo(() => {
    // Group matches: 72 total
    let missingGroups = 0;
    for (const group of GROUP_NAMES) {
      for (const m of state.groupMatches[group]) {
        if (m.homeGoals == null || m.awayGoals == null) missingGroups++;
      }
    }

    // Knockout matches: 32 total (r32:16, r16:8, qf:4, sf:2, final:1, bronze:1)
    const KNOCKOUT_TOTAL = { r32: 16, r16: 8, qf: 4, sf: 2, final: 1, bronze: 1 };
    const roundLabels = { r32: '16-del', r16: 'Åttondel', qf: 'Kvart', sf: 'Semi', final: 'Final', bronze: 'Brons' };
    let filledKnockout = 0;
    const missingRounds = [];
    const ko = state.knockoutPredictions;
    for (const [round, expected] of Object.entries(KNOCKOUT_TOTAL)) {
      let filledInRound = 0;
      for (const [matchId, pred] of Object.entries(ko)) {
        if (matchId.startsWith(round + '_') && pred.homeGoals != null && pred.awayGoals != null) {
          filledInRound++;
        }
      }
      filledKnockout += filledInRound;
      if (filledInRound < expected) missingRounds.push(roundLabels[round]);
    }
    const missingKnockout = 32 - filledKnockout;

    // Bonus questions: top scorer, red card, golden glove, tiebreaker
    let missingBonus = 0;
    const missingBonusNames = [];
    if (!state.topScorer) { missingBonus++; missingBonusNames.push('Skyttekung'); }
    if (!state.firstRedCardNation) { missingBonus++; missingBonusNames.push('Röda kort'); }
    if (!state.goldenGlove) { missingBonus++; missingBonusNames.push('Golden Glove'); }
    if (state.tiebreaker == null) { missingBonus++; missingBonusNames.push('Utslagsfråga'); }

    const total = missingGroups + missingKnockout + missingBonus;
    return { total, missingGroups, missingKnockout, missingBonus, missingRounds, missingBonusNames };
  }, [state, computed]);
}

function PredictionProgress() {
  const { t } = useLanguage();
  const remaining = useRemainingPredictions();

  if (remaining.total === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <p className="font-semibold text-green-800">{t('predict.allDone')}</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">📝</span>
        <p className="font-semibold text-amber-800">
          {remaining.total} {t('predict.remaining')}
        </p>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        {remaining.missingGroups > 0 && (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">
            ⚽ {remaining.missingGroups} {t('predict.missingGroups')}
          </span>
        )}
        {remaining.missingKnockout > 0 && (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">
            🏆 {remaining.missingKnockout} {t('predict.missingKnockout')}
            {remaining.missingRounds.length > 0 && (
              <span className="text-xs ml-1">({remaining.missingRounds.join(', ')})</span>
            )}
          </span>
        )}
        {remaining.missingBonus > 0 && (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">
            🎯 {remaining.missingBonus} {t('predict.missingBonus')}
            {remaining.missingBonusNames.length > 0 && (
              <span className="text-xs ml-1">({remaining.missingBonusNames.join(', ')})</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [view, setView] = useState('predict');
  const [viewUser, setViewUser] = useState(null);
  const remaining = useRemainingPredictions();

  if (viewUser) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header view={view} setView={(v) => { setViewUser(null); setView(v); }} remainingCount={remaining.total} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <ViewUserPredictions viewUser={viewUser} onBack={() => setViewUser(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header view={view} setView={setView} remainingCount={remaining.total} />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {view === 'predict' && (
          <>
            <LockBanner />
            <PredictionProgress />
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
            <BonusQuestions isAdmin={false} />
          </>
        )}

        {view === 'leaderboard' && <Leaderboard onViewUser={setViewUser} />}
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
            <BonusQuestions isAdmin={true} />
            <AdminPredictionStats />
            <UserManager onViewUser={setViewUser} />
            <AdminBonusOverview />
            <AdminDataManager />
            <section className="border-t pt-8">
              <Leaderboard onViewUser={setViewUser} />
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
