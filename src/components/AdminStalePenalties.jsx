import { useState, useEffect, useCallback } from 'react';
import { API, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getFlag, getTeamName } from '../data/flags';

export default function AdminStalePenalties() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [data, setData] = useState(null);

  const load = useCallback(() => {
    fetch(`${API}/admin/stale-penalties`).then(r => r.json()).then(setData).catch(() => setData({ users: [] }));
  }, []);

  useEffect(() => { load(); }, [load]);

  const setPenalty = async (userId, matchId, value) => {
    await fetch(`${API}/admin/users/${userId}/knockout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, field: 'penaltyWinner', value, adminId: user?.id }),
    });
    // Re-fetch: fixing one match can reveal a stale penalty further down the tree
    load();
  };

  if (!data) return <p className="text-gray-500 p-4">{t('vp.loading')}</p>;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-rose-600 to-red-700 px-6 py-4">
        <h3 className="text-white font-bold text-xl">{t('sp.title')}</h3>
        <p className="text-rose-100 text-sm">{t('sp.subtitle')}</p>
      </div>

      {data.users.length === 0 ? (
        <p className="p-6 text-center text-gray-500">{t('sp.none')}</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {data.users.map(u => (
            <div key={u.userId} className="p-4">
              <h4 className="font-semibold text-gray-800 mb-2">{u.name}</h4>
              <div className="space-y-3">
                {u.matches.map(m => (
                  <div key={m.matchId} className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{m.roundLabel}</span>
                      <span className="font-medium text-gray-800">
                        {getFlag(m.home)} {getTeamName(m.home, lang)}
                        <span className="font-bold mx-1">{m.homeGoals} – {m.awayGoals}</span>
                        {getTeamName(m.away, lang)} {getFlag(m.away)}
                      </span>
                      <span className="text-xs text-rose-600">
                        {t('sp.staleWas')}: <span className="font-medium">{m.stalePenaltyWinner}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">{t('sp.pickWinner')}</span>
                      <button
                        onClick={() => setPenalty(u.userId, m.matchId, m.home)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-white border border-gray-300 hover:bg-green-100 hover:border-green-300 transition-colors"
                      >
                        {getFlag(m.home)} {getTeamName(m.home, lang)}
                      </button>
                      <button
                        onClick={() => setPenalty(u.userId, m.matchId, m.away)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-white border border-gray-300 hover:bg-green-100 hover:border-green-300 transition-colors"
                      >
                        {getFlag(m.away)} {getTeamName(m.away, lang)}
                      </button>
                      <button
                        onClick={() => setPenalty(u.userId, m.matchId, null)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        {t('sp.clear')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
