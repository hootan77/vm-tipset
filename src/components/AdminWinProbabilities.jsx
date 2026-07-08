import { useState } from 'react';
import { API, useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getFlag, getTeamName } from '../data/flags';

const ORG_ORDER = ['Alla', 'Enskede', 'QBank', 'Friends', 'MNO'];

export default function AdminWinProbabilities() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sims, setSims] = useState(2000);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/win-probabilities?adminId=${user?.id}&sims=${sims}`);
      setData(await res.json());
    } catch {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-white font-bold text-xl">{t('wp.title')}</h3>
          <p className="text-fuchsia-100 text-sm">{t('wp.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sims}
            onChange={e => setSims(parseInt(e.target.value))}
            className="text-xs rounded px-2 py-1.5 bg-white/20 text-white border border-white/30 outline-none"
          >
            {[1000, 2000, 5000].map(n => <option key={n} value={n} className="text-gray-800">{n} {t('wp.simsWord')}</option>)}
          </select>
          <button
            onClick={run}
            disabled={loading}
            className="bg-white text-purple-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors disabled:opacity-60"
          >
            {loading ? t('wp.computing') : t('wp.compute')}
          </button>
        </div>
      </div>

      <div className="p-4">
        {!data ? (
          <p className="text-gray-400 text-sm text-center py-6">{t('wp.hint')}</p>
        ) : data.error ? (
          <p className="text-red-500 text-sm text-center py-6">{t('wp.error')}</p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{data.sims} {t('wp.simsRan')} · {t('wp.note')}</p>

            {data.qfTeams?.length > 0 && (
              <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 font-semibold text-sm border-b border-gray-200">🏆 {t('wp.qfTitle')}</div>
                <ul className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {data.qfTeams.map(q => {
                    const max = Math.max(...data.qfTeams.map(x => x.pct), 1);
                    return (
                      <li key={q.team} className="flex items-center gap-2">
                        <span className="w-32 truncate text-xs text-gray-700 shrink-0">{getFlag(q.team)} {getTeamName(q.team, lang)}</span>
                        <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                          <div className="h-full bg-amber-500/80 rounded" style={{ width: `${(q.pct / max) * 100}%` }} />
                        </div>
                        <span className="w-20 text-right text-xs font-semibold text-gray-700 shrink-0" title={`${q.wins} / ${data.sims}`}>
                          {q.wins} <span className="font-normal text-gray-400">({q.pct.toFixed(0)}%)</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {ORG_ORDER.filter(o => data.orgs?.[o]?.length).map(org => {
                const list = data.orgs[org];
                const max = Math.max(...list.map(p => p.winPct), 1);
                return (
                  <div key={org} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 font-semibold text-sm border-b border-gray-200 flex items-center justify-between">
                      <span>{org === 'Alla' ? t('lb.all') : org}</span>
                      <span className="text-xs text-gray-400 font-normal">{list.length} {t('ps.players')}</span>
                    </div>
                    <ul className="p-2 space-y-1.5">
                      {list.map(p => (
                        <li key={p.id} className="flex items-center gap-2">
                          <span className="w-24 sm:w-28 truncate text-xs text-gray-700 shrink-0">{p.name}</span>
                          <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                            <div
                              className={`h-full rounded ${p.winPct > 0 ? 'bg-fuchsia-500/80' : ''}`}
                              style={{ width: `${(p.winPct / max) * 100}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-xs font-semibold text-gray-700 shrink-0">{p.winPct.toFixed(1)}%</span>
                          <span
                            className="w-20 text-right text-xs text-gray-500 shrink-0"
                            title={`${t('wp.range')}: ${p.lowPoints}–${p.highPoints}p`}
                          >
                            ~{p.avgPoints}p
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
