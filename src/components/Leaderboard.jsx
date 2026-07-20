import { useState, useEffect } from 'react';
import { useAuth, API } from '../context/AuthContext';
import { useTournament } from '../context/TournamentContext';
import { useLanguage } from '../context/LanguageContext';
import { getFlag, getTeamName } from '../data/flags';

const ROLE_KEYS = ['Alla', 'Spelare', 'Ledare', 'Familj'];
const ORG_KEYS = ['Alla', 'Enskede', 'QBank', 'Friends', 'MNO'];

export default function Leaderboard({ onViewUser }) {
  const { user, refreshUser } = useAuth();
  const { locked } = useTournament();
  const { t, lang } = useLanguage();
  const [data, setData] = useState([]);
  const [nextMatch, setNextMatch] = useState(null);
  const [lastThreeMatches, setLastThreeMatches] = useState([]);
  const [adminTiebreaker, setAdminTiebreaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('Alla');
  const [orgFilter, setOrgFilter] = useState('Alla');
  const [sortKey, setSortKey] = useState(null); // null = default standings order
  const [sortDir, setSortDir] = useState('desc');

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      // closest tiebreaker first (asc), names asc, everything else desc
      setSortDir(key === 'name' || key === 'role' || key === 'tiebreakerDiff' ? 'asc' : 'desc');
    }
  }

  function applyData(d) {
    // Endpoint returns { players, nextMatch, lastThreeMatches, adminTiebreaker }; tolerate a bare array too
    if (Array.isArray(d)) { setData(d); setNextMatch(null); setLastThreeMatches([]); setAdminTiebreaker(null); }
    else { setData(d.players || []); setNextMatch(d.nextMatch || null); setLastThreeMatches(d.lastThreeMatches || []); setAdminTiebreaker(d.adminTiebreaker ?? null); }
  }

  useEffect(() => {
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(d => { applyData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function refresh() {
    setLoading(true);
    refreshUser();
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(d => { applyData(d); setLoading(false); });
  }

  const roleLabel = (role) => {
    if (role === 'Alla') return t('lb.all');
    return t(`role.${role.toLowerCase()}`) || role;
  };

  // Show the official (CEST) date + time string, matching how matches appear elsewhere
  const formatKickoff = (m) => {
    if (!m?.date) return '';
    const ds = new Date(m.date + 'T00:00:00').toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', { day: 'numeric', month: 'short' });
    return `${ds} ${m.time || ''}`.trim();
  };

  const nextTeam = (team) => team ? `${getFlag(team)} ${getTeamName(team, lang)}` : t('lb.tbd');
  const roundLabel = (round) => {
    const map = { r32: t('ko.r32'), r16: t('ko.r16'), qf: t('ko.qf'), sf: t('ko.sf'), bronze: t('ko.bronze'), final: t('ko.final') };
    return map[round] || '';
  };
  const matchLabel = (m) => m ? `${getTeamName(m.home, lang)} ${m.homeGoals}–${m.awayGoals} ${getTeamName(m.away, lang)}` : '';
  const pointBadgeClass = (pts) =>
    pts == null ? 'bg-gray-100 text-gray-300'
    : pts >= 5 ? 'bg-green-100 text-green-700'
    : pts >= 2 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-500';

  const isAdmin = !!user?.isAdmin;
  const userOrgs = user?.org ? user.org.split(',') : [];
  const isMultiOrg = userOrgs.length > 1;
  const showRoleFilter = isAdmin || userOrgs.includes('Enskede');
  const showOrgFilter = isAdmin || isMultiOrg;
  // Admin can filter on all orgs; a multi-org player only on their own orgs
  const orgOptions = isAdmin ? ORG_KEYS : ['Alla', ...userOrgs];
  const showViewButton = locked || isAdmin;

  // Filtering logic
  let filtered = data;

  if (isAdmin) {
    if (orgFilter !== 'Alla') {
      filtered = filtered.filter(r => r.org && r.org.split(',').includes(orgFilter));
    }
  } else if (userOrgs.length) {
    // Restrict to the player's own orgs, optionally narrowed to one selected org
    const orgsToShow = orgFilter !== 'Alla' && userOrgs.includes(orgFilter) ? [orgFilter] : userOrgs;
    filtered = filtered.filter(r => r.org && r.org.split(',').some(o => orgsToShow.includes(o)));
  } else {
    filtered = filtered.filter(r => r.id === user?.id);
  }

  if (roleFilter !== 'Alla' && showRoleFilter) {
    filtered = filtered.filter(r => r.role === roleFilter);
  }

  // Assign standings rank from the (total-sorted) filtered order, then optionally re-sort
  // by a chosen column for display — the rank/medal column keeps the true standings position.
  const ranked = filtered.map((r, i) => ({ ...r, _rank: i + 1 }));
  let displayed = ranked;
  if (sortKey) {
    displayed = [...ranked].sort((a, b) => {
      if (sortKey === 'name' || sortKey === 'role') {
        const av = (a[sortKey] || '').toLowerCase();
        const bv = (b[sortKey] || '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const fallback = sortKey === 'tiebreakerDiff' ? Infinity : 0; // missing tiebreaker guess sorts last
      const av = a[sortKey] ?? fallback;
      const bv = b[sortKey] ?? fallback;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }

  const sortArrow = (key) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  const fmtNum = (n) => (n == null ? '' : n.toLocaleString(lang === 'sv' ? 'sv-SE' : 'en-US'));
  // The player closest on the tiebreaker (once the admin has entered the actual figure)
  const closestId = adminTiebreaker != null
    ? filtered.reduce((best, r) => (r.tiebreakerDiff != null && (best == null || r.tiebreakerDiff < best.diff) ? { id: r.id, diff: r.tiebreakerDiff } : best), null)?.id ?? null
    : null;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
        <p className="text-gray-500">{t('lb.loading')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-xl">{t('lb.title')}</h3>
          <p className="text-emerald-100 text-sm">{t('lb.subtitle')}</p>
        </div>
        <button
          onClick={refresh}
          className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
        >
          {t('lb.refresh')}
        </button>
      </div>

      {(showOrgFilter || showRoleFilter) && (
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-4 flex-wrap">
          {showOrgFilter && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('um.org')}:</span>
              {orgOptions.map(o => (
                <button
                  key={o}
                  onClick={() => setOrgFilter(o)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    orgFilter === o
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {o === 'Alla' ? t('lb.all') : o}
                </button>
              ))}
            </div>
          )}
          {showRoleFilter && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lb.filter')}</span>
              {ROLE_KEYS.map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    roleFilter === r
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {roleLabel(r)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {data.length === 0 ? t('lb.empty') : t('lb.noRole')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                <th onClick={() => setSortKey(null)} className="text-left py-3 px-4 cursor-pointer hover:text-gray-700 select-none" title={t('lb.sortReset')}>{t('lb.col.rank')}</th>
                <th onClick={() => toggleSort('name')} className="text-left py-3 px-4 cursor-pointer hover:text-gray-700 select-none">{t('lb.col.player')}{sortArrow('name')}</th>
                <th onClick={() => toggleSort('role')} className="text-left py-3 px-4 cursor-pointer hover:text-gray-700 select-none">{t('lb.col.role')}{sortArrow('role')}</th>
                <th onClick={() => toggleSort('groupPoints')} className="text-center py-3 px-4 cursor-pointer hover:text-gray-700 select-none">{t('lb.col.group')}{sortArrow('groupPoints')}</th>
                <th onClick={() => toggleSort('knockoutPoints')} className="text-center py-3 px-4 cursor-pointer hover:text-gray-700 select-none">{t('lb.col.knockout')}{sortArrow('knockoutPoints')}</th>
                <th onClick={() => toggleSort('bonusPoints')} className="text-center py-3 px-4 cursor-pointer hover:text-gray-700 select-none">{t('lb.col.bonus')}{sortArrow('bonusPoints')}</th>
                <th onClick={() => toggleSort('total')} className="text-center py-3 px-4 font-bold cursor-pointer hover:text-gray-700 select-none">{t('lb.col.total')}{sortArrow('total')}</th>
                <th onClick={() => toggleSort('exactResults')} className="text-center py-3 px-4 cursor-pointer hover:text-gray-700 select-none">{t('lb.col.exact')}{sortArrow('exactResults')}</th>
                <th onClick={() => toggleSort('correctOutcomes')} className="text-center py-3 px-4 cursor-pointer hover:text-gray-700 select-none">{t('lb.col.outcome')}{sortArrow('correctOutcomes')}</th>
                <th onClick={() => toggleSort('totalPredictions')} className="text-center py-3 px-4 cursor-pointer hover:text-gray-700 select-none">{t('lb.col.tips')}{sortArrow('totalPredictions')}</th>
                {showViewButton && (
                  <th onClick={() => toggleSort('tiebreakerDiff')} className="text-center py-3 px-4 cursor-pointer hover:text-gray-700 select-none normal-case">
                    <div className="uppercase tracking-wider">{t('lb.tiebreaker')}{sortArrow('tiebreakerDiff')}</div>
                    {adminTiebreaker != null && (
                      <div className="text-[10px] text-gray-400 font-normal normal-case">{t('lb.facit')}: {fmtNum(adminTiebreaker)}</div>
                    )}
                  </th>
                )}
                {lastThreeMatches.length > 0 && (
                  <th className="text-center py-3 px-4 normal-case">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{t('lb.lastThree')}</div>
                    <div className="flex justify-center gap-1 mt-1">
                      {lastThreeMatches.map((m, idx) => (
                        <span key={idx} title={matchLabel(m)} className="text-[13px] cursor-help">
                          {getFlag(m.home)}{getFlag(m.away)}
                        </span>
                      ))}
                    </div>
                  </th>
                )}
                {showViewButton && nextMatch && (
                  <th className="text-center py-3 px-4 normal-case">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      {t('lb.nextMatch')}{nextMatch.matchNumber != null ? ` · ${t('lb.match')} ${nextMatch.matchNumber}` : ''}
                    </div>
                    <div className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {nextTeam(nextMatch.home)} – {nextTeam(nextMatch.away)}
                    </div>
                    <div className="text-[10px] text-gray-400 font-normal normal-case">
                      {nextMatch.round && nextMatch.round !== 'group' ? `${roundLabel(nextMatch.round)} · ` : ''}{formatKickoff(nextMatch)}
                    </div>
                  </th>
                )}
                {showViewButton && onViewUser && (
                  <th className="text-center py-3 px-4"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayed.map((row) => {
                const clickable = showViewButton && onViewUser;
                const rank = row._rank;
                return (
                <tr
                  key={row.id}
                  onClick={clickable ? () => onViewUser({ id: row.id, name: row.name }) : undefined}
                  className={`border-b last:border-0 ${rank === 1 ? 'bg-yellow-50' : rank === 2 ? 'bg-gray-50' : rank === 3 ? 'bg-orange-50' : ''} ${clickable ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                >
                  <td className="py-3 px-4">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{row.name}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{t(`role.${(row.role || 'Spelare').toLowerCase()}`) || row.role}</td>
                  <td className="py-3 px-4 text-center">{row.groupPoints}</td>
                  <td className="py-3 px-4 text-center">{row.knockoutPoints}</td>
                  <td className="py-3 px-4 text-center">{row.bonusPoints || 0}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 text-lg">{row.total}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.exactResults}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.correctOutcomes}</td>
                  <td className="py-3 px-4 text-center text-gray-400">{row.totalPredictions}/108</td>
                  {showViewButton && (
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {row.tiebreaker != null ? (
                        <span className={row.id === closestId ? 'text-emerald-700 font-bold' : 'text-gray-600'}>
                          {row.id === closestId ? '🎯 ' : ''}{fmtNum(row.tiebreaker)}
                          {row.tiebreakerDiff != null && (
                            <span className="text-gray-400 text-xs font-normal"> (±{fmtNum(row.tiebreakerDiff)})</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                  )}
                  {lastThreeMatches.length > 0 && (
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-1">
                        {lastThreeMatches.map((m, idx) => {
                          const pts = row.lastThreePoints?.[idx];
                          return (
                            <span
                              key={idx}
                              title={matchLabel(m)}
                              className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${pointBadgeClass(pts)}`}
                            >
                              {pts == null ? '–' : pts}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  )}
                  {showViewButton && nextMatch && (
                    <td className="py-3 px-4 text-center">
                      {row.nextMatchPrediction
                        ? <span className="font-semibold text-gray-800">{row.nextMatchPrediction.homeGoals} – {row.nextMatchPrediction.awayGoals}</span>
                        : <span className="text-gray-300">–</span>}
                    </td>
                  )}
                  {clickable && (
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewUser({ id: row.id, name: row.name }); }}
                        className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs hover:bg-blue-100 transition-colors"
                      >
                        {t('um.view')}
                      </button>
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
