import { useState, useEffect, useCallback } from 'react';
import { API } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDataManager() {
  const { t } = useLanguage();
  const [knockoutData, setKnockoutData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [koRes, grRes] = await Promise.all([
      fetch(`${API}/admin/knockout-results`),
      fetch(`${API}/admin/group-results`),
    ]);
    setKnockoutData(await koRes.json());
    setGroupData(await grRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  async function clearKnockout() {
    if (!window.confirm(t('dm.confirm'))) return;
    await fetch(`${API}/admin/knockout-results`, { method: 'DELETE' });
    showMessage(t('dm.cleared'));
    loadData();
  }

  async function clearGroups() {
    if (!window.confirm(t('dm.confirm'))) return;
    await fetch(`${API}/admin/group-results`, { method: 'DELETE' });
    showMessage(t('dm.cleared'));
    loadData();
  }

  async function deleteKnockoutMatch(matchId) {
    await fetch(`${API}/admin/knockout-results/${matchId}`, { method: 'DELETE' });
    showMessage(t('dm.cleared'));
    loadData();
  }

  // Group knockout matches by round
  const knockoutByRound = {};
  for (const row of knockoutData) {
    const round = row.match_id.split('_')[0];
    if (!knockoutByRound[round]) knockoutByRound[round] = [];
    knockoutByRound[round].push(row);
  }

  const roundLabels = {
    r32: t('ko.r32'), r16: t('ko.r16'), qf: t('ko.qf'),
    sf: t('ko.sf'), bronze: t('ko.bronze'), final: t('ko.final'),
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4">
        <h3 className="text-white font-bold text-xl">{t('dm.title')}</h3>
        <p className="text-red-100 text-sm">{t('dm.subtitle')}</p>
      </div>

      {message && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm font-medium">
          ✓ {message}
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Knockout Results */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-800">
              {t('dm.knockoutResults')}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({knockoutData.length} {t('dm.entries')})
              </span>
            </h4>
            {knockoutData.length > 0 && (
              <button
                onClick={clearKnockout}
                className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
              >
                🗑️ {t('dm.clearKnockout')}
              </button>
            )}
          </div>

          {knockoutData.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{t('dm.noData')}</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(knockoutByRound).map(([round, matches]) => (
                <div key={round}>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {roundLabels[round] || round}
                  </h5>
                  <div className="space-y-1">
                    {matches.map(m => (
                      <div key={m.match_id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <div>
                          <span className="font-mono text-gray-500 text-xs mr-2">{m.match_id}</span>
                          <span className="font-bold">
                            {m.home_goals ?? '-'} – {m.away_goals ?? '-'}
                          </span>
                          {m.penalty_winner && (
                            <span className="ml-2 text-xs text-gray-500">
                              (pen: {m.penalty_winner})
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteKnockoutMatch(m.match_id)}
                          className="text-red-400 hover:text-red-600 text-xs px-2 py-1 hover:bg-red-50 rounded transition-colors"
                        >
                          {t('dm.delete')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group Results */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-800">
              {t('dm.groupResults')}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({groupData.length} {t('dm.entries')})
              </span>
            </h4>
            {groupData.length > 0 && (
              <button
                onClick={clearGroups}
                className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
              >
                🗑️ {t('dm.clearGroups')}
              </button>
            )}
          </div>

          {groupData.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{t('dm.noData')}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              {groupData.map(m => (
                <div key={`${m.group_name}-${m.match_index}`} className="bg-gray-50 rounded px-2 py-1 text-xs text-center">
                  <span className="text-gray-500">{t('group.title')} {m.group_name} M{m.match_index + 1}:</span>{' '}
                  <span className="font-bold">{m.home_goals ?? '-'} – {m.away_goals ?? '-'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
