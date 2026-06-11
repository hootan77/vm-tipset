import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { TEAMS, GROUP_NAMES, getGroupMatchesForGroup } from '../data/teams';
import { calculateStandings, sortStandings, getBestThirdPlaced } from '../logic/standings';
import { buildRoundOf32, buildFullBracket } from '../logic/knockout';
import { useAuth, API } from './AuthContext';
import { useLanguage } from './LanguageContext';

const LOCK_DATE = new Date('2026-06-11T18:00:00Z');

const TournamentContext = createContext();

function buildEmptyGroupMatches() {
  const groupMatches = {};
  for (const group of GROUP_NAMES) {
    groupMatches[group] = getGroupMatchesForGroup(group).map(m => ({
      ...m, homeGoals: null, awayGoals: null,
    }));
  }
  return groupMatches;
}

function initState() {
  return {
    groupMatches: buildEmptyGroupMatches(),
    adminGroupMatches: buildEmptyGroupMatches(),
    knockoutPredictions: {},
    adminKnockoutPredictions: {},
    topScorer: '',
    adminTopScorer: '',
    firstRedCardNation: '',
    adminFirstRedCardNation: '',
    goldenGlove: '',
    adminGoldenGlove: '',
    tiebreaker: null,
    adminTiebreaker: null,
    loaded: false,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_GROUP_PREDICTIONS': {
      const matches = buildEmptyGroupMatches();
      for (const [group, preds] of Object.entries(action.data)) {
        for (const [idx, pred] of Object.entries(preds)) {
          const i = parseInt(idx);
          if (matches[group]?.[i]) {
            matches[group][i].homeGoals = pred.homeGoals;
            matches[group][i].awayGoals = pred.awayGoals;
          }
        }
      }
      return { ...state, groupMatches: matches, loaded: true };
    }
    case 'LOAD_ADMIN_GROUPS': {
      const matches = buildEmptyGroupMatches();
      for (const [group, preds] of Object.entries(action.data)) {
        for (const [idx, pred] of Object.entries(preds)) {
          const i = parseInt(idx);
          if (matches[group]?.[i]) {
            matches[group][i].homeGoals = pred.homeGoals;
            matches[group][i].awayGoals = pred.awayGoals;
          }
        }
      }
      return { ...state, adminGroupMatches: matches };
    }
    case 'LOAD_KNOCKOUT_PREDICTIONS':
      return { ...state, knockoutPredictions: action.data };
    case 'LOAD_ADMIN_KNOCKOUT':
      return { ...state, adminKnockoutPredictions: action.data };
    case 'SET_GROUP_SCORE': {
      const { group, matchIndex, field, value, isAdmin } = action;
      const key = isAdmin ? 'adminGroupMatches' : 'groupMatches';
      const matches = [...state[key][group]];
      matches[matchIndex] = { ...matches[matchIndex], [field]: value };
      return { ...state, [key]: { ...state[key], [group]: matches } };
    }
    case 'SET_KNOCKOUT_SCORE': {
      const { matchId, field, value, isAdmin } = action;
      const key = isAdmin ? 'adminKnockoutPredictions' : 'knockoutPredictions';
      const current = state[key][matchId] || {};
      const updated = { ...current, [field]: value };
      if (field === 'homeGoals' || field === 'awayGoals') {
        const h = updated.homeGoals != null ? parseInt(updated.homeGoals) : null;
        const a = updated.awayGoals != null ? parseInt(updated.awayGoals) : null;
        if (h == null || a == null || h !== a) {
          updated.penaltyWinner = null;
        }
      }
      return { ...state, [key]: { ...state[key], [matchId]: updated } };
    }
    case 'SET_TOP_SCORER':
      return { ...state, [action.isAdmin ? 'adminTopScorer' : 'topScorer']: action.value };
    case 'LOAD_TOP_SCORER':
      return { ...state, topScorer: action.data };
    case 'LOAD_ADMIN_TOP_SCORER':
      return { ...state, adminTopScorer: action.data };
    case 'SET_BONUS_FIELD':
      return { ...state, [action.field]: action.value };
    case 'LOAD_BONUS':
      return { ...state, firstRedCardNation: action.data.firstRedCardNation, goldenGlove: action.data.goldenGlove, tiebreaker: action.data.tiebreaker };
    case 'LOAD_ADMIN_BONUS':
      return { ...state, adminFirstRedCardNation: action.data.firstRedCardNation, adminGoldenGlove: action.data.goldenGlove, adminTiebreaker: action.data.tiebreaker };
    default:
      return state;
  }
}

export function TournamentProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, null, initState);
  const [locked, setLocked] = useState(false);
  const [lockToast, setLockToast] = useState(false);
  const lockToastTimer = useRef(null);

  useEffect(() => {
    function checkLock() {
      fetch(`${API}/settings`).then(r => r.json()).then(d => setLocked(d.locked));
    }
    checkLock();
    const interval = setInterval(checkLock, 30000);
    return () => clearInterval(interval);
  }, []);

  // POST a save; if the server rejects it because the tournament is locked,
  // lock the UI and show a transient warning so the player knows it wasn't saved.
  const postSave = useCallback((url, body) => {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(res => {
        if (res.status === 403) {
          setLocked(true);
          setLockToast(true);
          if (lockToastTimer.current) clearTimeout(lockToastTimer.current);
          lockToastTimer.current = setTimeout(() => setLockToast(false), 6000);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [groupRes, knockoutRes, adminGroupRes, adminKnockoutRes, tsRes, adminTsRes, bonusRes, adminBonusRes] = await Promise.all([
        fetch(`${API}/predictions/${user.id}/groups`),
        fetch(`${API}/predictions/${user.id}/knockout`),
        fetch(`${API}/admin/groups`),
        fetch(`${API}/admin/knockout`),
        fetch(`${API}/predictions/${user.id}/top-scorer`),
        fetch(`${API}/admin/top-scorer`),
        fetch(`${API}/predictions/${user.id}/bonus`),
        fetch(`${API}/admin/bonus`),
      ]);
      dispatch({ type: 'LOAD_GROUP_PREDICTIONS', data: await groupRes.json() });
      dispatch({ type: 'LOAD_KNOCKOUT_PREDICTIONS', data: await knockoutRes.json() });
      dispatch({ type: 'LOAD_ADMIN_GROUPS', data: await adminGroupRes.json() });
      dispatch({ type: 'LOAD_ADMIN_KNOCKOUT', data: await adminKnockoutRes.json() });
      const ts = await tsRes.json();
      dispatch({ type: 'LOAD_TOP_SCORER', data: ts.playerName || '' });
      const ats = await adminTsRes.json();
      dispatch({ type: 'LOAD_ADMIN_TOP_SCORER', data: ats.playerName || '' });
      dispatch({ type: 'LOAD_BONUS', data: await bonusRes.json() });
      dispatch({ type: 'LOAD_ADMIN_BONUS', data: await adminBonusRes.json() });
    }
    load();
  }, [user]);

  const saveGroupScore = useCallback((group, matchIndex, field, value, isAdmin) => {
    dispatch({ type: 'SET_GROUP_SCORE', group, matchIndex, field, value, isAdmin });

    // Send only the changed field so concurrent saves can't clobber each other
    const url = isAdmin ? `${API}/admin/groups` : `${API}/predictions/${user.id}/groups`;
    postSave(url, { group, matchIndex, field, value });
  }, [user, postSave]);

  const saveKnockoutScore = useCallback((matchId, field, value, isAdmin) => {
    dispatch({ type: 'SET_KNOCKOUT_SCORE', matchId, field, value, isAdmin });

    // Send only the changed field; the server clears penalty winner when no longer a draw
    const url = isAdmin ? `${API}/admin/knockout` : `${API}/predictions/${user.id}/knockout`;
    postSave(url, { matchId, field, value });
  }, [user, postSave]);

  const saveTopScorer = useCallback((value, isAdmin) => {
    dispatch({ type: 'SET_TOP_SCORER', value, isAdmin });
    const url = isAdmin ? `${API}/admin/top-scorer` : `${API}/predictions/${user.id}/top-scorer`;
    postSave(url, { playerName: value });
  }, [user, postSave]);

  const saveBonusField = useCallback((field, value, isAdmin) => {
    const fieldMap = { firstRedCardNation: 'adminFirstRedCardNation', goldenGlove: 'adminGoldenGlove', tiebreaker: 'adminTiebreaker' };
    const stateField = isAdmin ? (fieldMap[field] || field) : field;
    dispatch({ type: 'SET_BONUS_FIELD', field: stateField, value });

    const currentState = isAdmin
      ? { firstRedCardNation: state.adminFirstRedCardNation, goldenGlove: state.adminGoldenGlove, tiebreaker: state.adminTiebreaker }
      : { firstRedCardNation: state.firstRedCardNation, goldenGlove: state.goldenGlove, tiebreaker: state.tiebreaker };
    const updated = { ...currentState, [field]: value };

    const url = isAdmin ? `${API}/admin/bonus` : `${API}/predictions/${user.id}/bonus`;
    postSave(url, updated);
  }, [state, user, postSave]);

  const toggleLock = useCallback(async () => {
    const newVal = !locked;
    setLocked(newVal);
    await fetch(`${API}/admin/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked: newVal }),
    });
  }, [locked]);

  const computeStandings = useCallback((source) => {
    const allStandings = {};
    for (const group of GROUP_NAMES) {
      const table = calculateStandings(TEAMS[group], state[source][group]);
      allStandings[group] = sortStandings(table, state[source][group]);
    }
    return allStandings;
  }, [state]);

  const computed = useMemo(() => {
    const userStandings = computeStandings('groupMatches');
    const adminStandings = computeStandings('adminGroupMatches');

    const userBestThirds = getBestThirdPlaced(userStandings);
    const userR32 = buildRoundOf32(userStandings, userBestThirds);
    const userBracket = buildFullBracket(userR32, state.knockoutPredictions);

    const adminBestThirds = getBestThirdPlaced(adminStandings);
    const adminR32 = buildRoundOf32(adminStandings, adminBestThirds);
    const adminBracket = buildFullBracket(adminR32, state.adminKnockoutPredictions);

    const allUserGroupsComplete = GROUP_NAMES.every(g =>
      state.groupMatches[g].every(m => m.homeGoals != null && m.awayGoals != null)
    );
    const allAdminGroupsComplete = GROUP_NAMES.every(g =>
      state.adminGroupMatches[g].every(m => m.homeGoals != null && m.awayGoals != null)
    );

    return {
      userStandings, adminStandings,
      userBestThirds, adminBestThirds,
      userBracket, adminBracket,
      allUserGroupsComplete, allAdminGroupsComplete,
    };
  }, [state, computeStandings]);

  return (
    <TournamentContext.Provider value={{ state, dispatch, computed, saveGroupScore, saveKnockoutScore, saveTopScorer, saveBonusField, locked, toggleLock, lockToast }}>
      {children}
      <LockToast />
    </TournamentContext.Provider>
  );
}

function LockToast() {
  const { lockToast } = useTournament();
  const { t } = useLanguage();
  if (!lockToast) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] bg-red-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
      <span className="text-xl shrink-0">🔒</span>
      <div className="text-sm">
        <p className="font-semibold">{t('predict.locked')}</p>
        <p className="text-red-100">{t('predict.lockedToast')}</p>
      </div>
    </div>
  );
}

export function useTournament() {
  return useContext(TournamentContext);
}
