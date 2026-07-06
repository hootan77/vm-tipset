import { useState, useEffect, useCallback } from 'react';
import { API, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TEAMS, GROUP_NAMES, getGroupMatchesForGroup } from '../data/teams';
import { getFlag, getTeamName } from '../data/flags';
import { calculateStandings, sortStandings, getBestThirdPlaced } from '../logic/standings';
import { buildRoundOf32, buildFullBracket, getMatchWinner } from '../logic/knockout';
import { scoreGroupMatch, scoreKnockoutMatch } from '../logic/scoring';

// Knockout team-advancement points per round (matches the server scoring)
const ROUND_TEAM_POINTS = { r32: 5, r16: 5, qf: 10, sf: 15, final: 20 };
const CHAMPION_POINTS = 50;
const BRONZE_POINTS = 20;

function teamsInRound(bracket, round) {
  const s = new Set();
  for (const m of bracket[round] || []) { if (m.home) s.add(m.home); if (m.away) s.add(m.away); }
  return s;
}

function PointsBadge({ points }) {
  if (points == null) return null;
  const cls = points >= 5 ? 'bg-green-100 text-green-700'
    : points >= 2 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-500';
  return (
    <span className={`inline-flex items-center justify-center min-w-[1.6rem] px-1 py-0.5 rounded text-[10px] font-bold ${cls}`}>
      {points}p
    </span>
  );
}

export default function ViewUserPredictions({ viewUser, onBack }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/users/${viewUser.id}/predictions`)
      .then(r => r.json())
      .then(setData);
  }, [viewUser.id]);

  const toggleOverride = useCallback(async (field, currentlyAwarded) => {
    if (!isAdmin) return;
    const newVal = !currentlyAwarded;
    // Optimistic update
    setData(prev => ({
      ...prev,
      overrides: { ...prev.overrides, [field]: newVal },
    }));
    await fetch(`${API}/admin/bonus-overrides/${viewUser.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, awarded: newVal, adminId: user.id }),
    });
  }, [viewUser.id, isAdmin, user]);

  if (!data) return <p className="text-gray-500 p-8">{t('vp.loading')}</p>;

  const groupMatches = {};
  for (const group of GROUP_NAMES) {
    groupMatches[group] = getGroupMatchesForGroup(group).map((m, i) => {
      const pred = data.groups[group]?.[i];
      return { ...m, homeGoals: pred?.homeGoals ?? null, awayGoals: pred?.awayGoals ?? null };
    });
  }

  const overrides = data.overrides || {};
  const admin = data.adminAnswers || {};

  const bonusQuestions = [
    { key: 'topScorer', emoji: '🏅', label: t('predict.topScorer'), points: '50p', userVal: data.topScorer, adminVal: admin.topScorer },
    { key: 'firstRedCardNation', emoji: '🟥', label: t('predict.redCard'), points: '20p', userVal: data.firstRedCardNation, adminVal: admin.firstRedCardNation },
    { key: 'goldenGlove', emoji: '🧤', label: t('predict.goldenGlove'), points: '40p', userVal: data.goldenGlove, adminVal: admin.goldenGlove },
  ];

  // Check if answers match automatically (case-insensitive)
  function autoMatch(userVal, adminVal) {
    if (!userVal || !adminVal) return false;
    return userVal.trim().toLowerCase() === adminVal.trim().toLowerCase();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
        >
          {t('vp.back')}
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {t('vp.tipsBy')} {viewUser.name}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800">
          <h3 className="text-white font-bold text-lg">{t('rules.bonus')}</h3>
        </div>
        <div className="p-4 space-y-3">
          {bonusQuestions.map(({ key, emoji, label, points, userVal, adminVal }) => {
            const isAutoMatch = autoMatch(userVal, adminVal);
            const isOverridden = !!overrides[key];
            const isAwarded = isAutoMatch || isOverridden;

            return (
              <div key={key} className={`rounded-lg border p-3 ${isAwarded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{emoji}</span>
                    <span className="font-semibold text-gray-800">{label}</span>
                    <span className="text-xs text-purple-500">({points})</span>
                  </div>
                  {isAwarded && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      ✓ {t('bo.awarded')}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-xs text-gray-500">{t('bo.userAnswer')}</span>
                    <p className={`font-medium ${userVal ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                      {userVal || t('bo.noAnswer')}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t('bo.adminAnswer')}</span>
                    <p className={`font-medium ${adminVal ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                      {adminVal || t('bo.noAnswer')}
                    </p>
                  </div>
                </div>
                {isAdmin && !isAutoMatch && userVal && (
                  <button
                    onClick={() => toggleOverride(key, isOverridden)}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                      isOverridden
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
                    }`}
                  >
                    {isOverridden ? `✕ ${t('bo.revoke')}` : `✓ ${t('bo.award')}`}
                  </button>
                )}
              </div>
            );
          })}

          {/* Tiebreaker - display only, no override */}
          <div className="rounded-lg border bg-gray-50 border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span>🎯</span>
              <span className="font-semibold text-gray-800">{t('predict.tiebreaker')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">{t('bo.userAnswer')}</span>
                <p className={`font-medium ${data.tiebreaker != null ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                  {data.tiebreaker != null ? data.tiebreaker.toLocaleString() : t('bo.noAnswer')}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">{t('bo.adminAnswer')}</span>
                <p className={`font-medium ${admin.tiebreaker != null ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                  {admin.tiebreaker != null ? admin.tiebreaker.toLocaleString() : t('bo.noAnswer')}
                </p>
              </div>
            </div>
            {data.tiebreaker != null && admin.tiebreaker != null && (
              <p className="text-xs text-gray-500 mt-1">
                Diff: {Math.abs(data.tiebreaker - admin.tiebreaker).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {GROUP_NAMES.map(group => {
          const matches = groupMatches[group];
          const standings = sortStandings(
            calculateStandings(TEAMS[group], matches),
            matches
          );
          return (
            <ReadOnlyGroupCard key={group} group={group} matches={matches} standings={standings} adminGroup={data.adminGroups?.[group]} />
          );
        })}
      </div>

      <KnockoutSummary groupMatches={groupMatches} knockoutData={data.knockout} adminGroups={data.adminGroups} adminKnockout={data.adminKnockout} />
    </div>
  );
}

function ReadOnlyGroupCard({ group, matches, standings, adminGroup }) {
  const { t, lang } = useLanguage();
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700">
        <h3 className="text-white font-bold text-lg">{t('group.title')} {group}</h3>
      </div>
      <div className="p-4 space-y-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="text-left py-1 px-1">{t('vp.col.rank')}</th>
              <th className="text-left py-1 px-1">{t('vp.col.team')}</th>
              <th className="py-1 px-1 font-bold">{t('vp.col.points')}</th>
              <th className="py-1 px-1">{t('vp.col.gd')}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.team} className={`border-b last:border-0 ${i < 2 ? 'bg-green-50' : ''}`}>
                <td className="py-1 px-1 text-gray-500">{i + 1}</td>
                <td className="py-1 px-1 font-medium text-gray-800 whitespace-nowrap">{getFlag(row.team)} {getTeamName(row.team, lang)}</td>
                <td className="py-1 px-1 text-center font-bold">{row.points}</td>
                <td className="py-1 px-1 text-center">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1">
          {matches.map((m, i) => {
            const actual = adminGroup?.[i];
            const pts = (actual && actual.homeGoals != null && actual.awayGoals != null)
              ? scoreGroupMatch(m, actual) : null;
            return (
              <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 bg-gray-50 rounded">
                <span className="flex-1 text-right truncate">{getFlag(m.home)} {getTeamName(m.home, lang)}</span>
                <span className={`font-bold px-1 min-w-[2rem] text-center ${m.homeGoals != null ? 'text-gray-800' : 'text-gray-300'}`}>
                  {m.homeGoals ?? '-'} – {m.awayGoals ?? '-'}
                </span>
                <span className="flex-1 text-left truncate">{getFlag(m.away)} {getTeamName(m.away, lang)}</span>
                {pts != null && (
                  <span title={`${t('predict.realResult')}: ${actual.homeGoals}–${actual.awayGoals}`}>
                    <PointsBadge points={pts} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Build a full bracket from a group-matches map + a knockout predictions map
function bracketFrom(groupMatches, knockoutMap) {
  const standings = {};
  for (const group of GROUP_NAMES) {
    standings[group] = sortStandings(calculateStandings(TEAMS[group], groupMatches[group]), groupMatches[group]);
  }
  const bestThirds = getBestThirdPlaced(standings);
  return buildFullBracket(buildRoundOf32(standings, bestThirds), knockoutMap);
}

function KnockoutSummary({ groupMatches, knockoutData, adminGroups, adminKnockout }) {
  const { t, lang } = useLanguage();

  // User bracket
  const knockoutMap = {};
  for (const [matchId, pred] of Object.entries(knockoutData || {})) {
    knockoutMap[matchId] = { homeGoals: pred.homeGoals, awayGoals: pred.awayGoals, penaltyWinner: pred.penaltyWinner || null };
  }
  const bracket = bracketFrom(groupMatches, knockoutMap);

  // Admin (facit) bracket, for team-advancement points per round
  const adminGroupMatches = {};
  for (const group of GROUP_NAMES) {
    adminGroupMatches[group] = getGroupMatchesForGroup(group).map((m, i) => {
      const p = adminGroups?.[group]?.[i];
      return { ...m, homeGoals: p?.homeGoals ?? null, awayGoals: p?.awayGoals ?? null };
    });
  }
  const adminBracket = bracketFrom(adminGroupMatches, adminKnockout || {});

  // Team-advancement points only count once both the player and admin filled all 72 group matches
  const countFilled = (gm) => GROUP_NAMES.reduce((n, g) => n + gm[g].filter(m => m.homeGoals != null && m.awayGoals != null).length, 0);
  const allGroupsComplete = countFilled(groupMatches) >= 72 && countFilled(adminGroupMatches) >= 72;

  // Points earned in a round: match-result points + correct-team points
  const roundInfo = (round) => {
    let matchPoints = 0;
    for (const m of bracket[round] || []) {
      const a = adminKnockout?.[m.id];
      if (a && a.homeGoals != null && a.awayGoals != null) {
        const p = scoreKnockoutMatch({ homeGoals: m.homeGoals, awayGoals: m.awayGoals }, a);
        if (p) matchPoints += p;
      }
    }
    let correctTeams = 0, teamPoints = 0;
    if (allGroupsComplete && ROUND_TEAM_POINTS[round]) {
      const adminTeams = teamsInRound(adminBracket, round);
      for (const team of teamsInRound(bracket, round)) {
        if (adminTeams.has(team)) { correctTeams++; teamPoints += ROUND_TEAM_POINTS[round]; }
      }
    }
    return { matchPoints, teamPoints, correctTeams, total: matchPoints + teamPoints };
  };

  // Champion / bronze bonus (counted in bonus points on the server)
  const adminChampion = allGroupsComplete && adminBracket.final?.[0] ? getMatchWinner(adminBracket.final[0]) : null;
  const userChampion = bracket.final?.[0] ? getMatchWinner(bracket.final[0]) : null;
  const championPts = adminChampion && userChampion === adminChampion ? CHAMPION_POINTS : 0;
  const adminBronze = allGroupsComplete && adminBracket.bronze?.[0] ? getMatchWinner(adminBracket.bronze[0]) : null;
  const userBronze = bracket.bronze?.[0] ? getMatchWinner(bracket.bronze[0]) : null;
  const bronzePts = adminBronze && userBronze === adminBronze ? BRONZE_POINTS : 0;

  const roundOrder = ['r32', 'r16', 'qf', 'sf', 'bronze', 'final'];
  const roundLabels = {
    r32: t('ko.r32'), r16: t('ko.r16'), qf: t('ko.qf'),
    sf: t('ko.sf'), bronze: t('ko.bronze'), final: t('ko.final'),
  };

  const hasAnyMatches = roundOrder.some(round =>
    bracket[round]?.some(m => m.home || m.away)
  );

  if (!hasAnyMatches) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-gray-500 text-sm">
        {t('vp.noKnockout')}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700">
        <h3 className="text-white font-bold text-lg">{t('vp.knockoutTitle')}</h3>
      </div>
      <div className="p-4 space-y-4">
        {roundOrder.map(round => {
          const matches = bracket[round];
          if (!matches || matches.length === 0) return null;
          const hasData = matches.some(m => m.home || m.away);
          if (!hasData) return null;

          const info = roundInfo(round);
          return (
            <div key={round}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{roundLabels[round]}</h4>
                <div className="flex items-center gap-2">
                  {info.teamPoints > 0 && (
                    <span className="text-[10px] text-gray-400">{info.correctTeams} {t('vp.correctTeams')} · {info.teamPoints}p</span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${info.total > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {info.total}p
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {matches.map(m => {
                  const actual = adminKnockout?.[m.id];
                  const pts = (actual && actual.homeGoals != null && actual.awayGoals != null)
                    ? scoreKnockoutMatch({ homeGoals: m.homeGoals, awayGoals: m.awayGoals }, actual) : null;
                  return (
                  <div key={m.id} className="flex items-center gap-2 text-xs py-1.5 px-3 bg-gray-50 rounded-lg">
                    {m.matchNum && <span className="text-[10px] text-gray-400 font-semibold w-12 shrink-0">{t('lb.match')} {m.matchNum}</span>}
                    <span className="flex-1 text-right truncate font-medium">
                      {m.home ? `${getFlag(m.home)} ${getTeamName(m.home, lang)}` : '—'}
                    </span>
                    <span className={`font-bold px-2 min-w-[3rem] text-center ${m.homeGoals != null ? 'text-gray-800' : 'text-gray-300'}`}>
                      {m.homeGoals ?? '-'} – {m.awayGoals ?? '-'}
                    </span>
                    <span className="flex-1 text-left truncate font-medium">
                      {m.away ? `${getFlag(m.away)} ${getTeamName(m.away, lang)}` : '—'}
                    </span>
                    {m.penaltyWinner && (
                      <span className="text-[10px] text-gray-400 ml-1">
                        (pen: {getFlag(m.penaltyWinner)})
                      </span>
                    )}
                    {pts != null && (
                      <span title={`${t('predict.realResult')}: ${actual.homeGoals}–${actual.awayGoals}`}>
                        <PointsBadge points={pts} />
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {allGroupsComplete && (adminChampion || adminBronze) && (
          <div className="border-t pt-3 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">🏆 {t('rules.winner')}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${championPts > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>{championPts}p</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">🥉 {t('rules.bronze')}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${bronzePts > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>{bronzePts}p</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
