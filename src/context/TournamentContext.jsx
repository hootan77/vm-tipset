import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import { TEAMS, GROUP_NAMES, getGroupMatchesForGroup } from '../data/teams';
import { calculateStandings, sortStandings, getBestThirdPlaced } from '../logic/standings';
import { buildRoundOf32, buildFullBracket } from '../logic/knockout';
import { useAuth, API } from './AuthContext';

const LOCK_DATE = new Date('2026-06-11T07:00:00Z');

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
      return { ...state, firstRedCardNation: action.data.firstRedCardNation, goldenGlove: action.data.goldenGlove };
    case 'LOAD_ADMIN_BONUS':
      return { ...state, adminFirstRedCardNation: action.data.firstRedCardNation, adminGoldenGlove: action.data.goldenGlove };
    default:
      return state;
  }
}

export function TournamentProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, null, initState);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    fetch(`${API}/settings`).then(r => r.json()).then(d => {
      const timeLocked = Date.now() >= LOCK_DATE.getTime();
      setLocked(d.locked || timeLocked);
    });
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

  const saveGroupScore = useCallback(async (group, matchIndex, field, value, isAdmin) => {
    dispatch({ type: 'SET_GROUP_SCORE', group, matchIndex, field, value, isAdmin });

    const key = isAdmin ? 'adminGroupMatches' : 'groupMatches';
    const match = state[key][group][matchIndex];
    const updated = { ...match, [field]: value };

    const url = isAdmin ? `${API}/admin/groups` : `${API}/predictions/${user.id}/groups`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group,
        matchIndex,
        homeGoals: updated.homeGoals,
        awayGoals: updated.awayGoals,
      }),
    });
  }, [state, user]);

  const saveKnockoutScore = useCallback(async (matchId, field, value, isAdmin) => {
    dispatch({ type: 'SET_KNOCKOUT_SCORE', matchId, field, value, isAdmin });

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

    const url = isAdmin ? `${API}/admin/knockout` : `${API}/predictions/${user.id}/knockout`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        homeGoals: updated.homeGoals,
        awayGoals: updated.awayGoals,
        penaltyWinner: updated.penaltyWinner || null,
      }),
    });
  }, [state, user]);

  const saveTopScorer = useCallback((value, isAdmin) => {
    dispatch({ type: 'SET_TOP_SCORER', value, isAdmin });
    const url = isAdmin ? `${API}/admin/top-scorer` : `${API}/predictions/${user.id}/top-scorer`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: value }),
    });
  }, [user]);

  const saveBonusField = useCallback((field, value, isAdmin) => {
    const stateField = isAdmin
      ? (field === 'firstRedCardNation' ? 'adminFirstRedCardNation' : 'adminGoldenGlove')
      : field;
    dispatch({ type: 'SET_BONUS_FIELD', field: stateField, value });

    // Debounce: save both fields together
    const currentState = isAdmin
      ? { firstRedCardNation: state.adminFirstRedCardNation, goldenGlove: state.adminGoldenGlove }
      : { firstRedCardNation: state.firstRedCardNation, goldenGlove: state.goldenGlove };
    const updated = { ...currentState, [field]: value };

    const url = isAdmin ? `${API}/admin/bonus` : `${API}/predictions/${user.id}/bonus`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }, [state, user]);

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
    <TournamentContext.Provider value={{ state, dispatch, computed, saveGroupScore, saveKnockoutScore, saveTopScorer, saveBonusField, locked, toggleLock }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  return useContext(TournamentContext);
}
