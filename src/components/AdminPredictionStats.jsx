import { useState, useEffect, useMemo } from 'react';
import { API } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getFlag, getTeamName } from '../data/flags';

const ORG_KEYS = ['Alla', 'Enskede', 'QBank', 'Friends', 'MNO'];

// Count occurrences of a value across records, return sorted [ [value, count], ... ]
function tally(records, getValue) {
  const counts = {};
  for (const r of records) {
    const values = getValue(r);
    for (const v of values) {
      if (!v) continue;
      counts[v] = (counts[v] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function StatCard({ title, rows, total, isTeam, lang, t }) {
  const max = rows.length ? rows[0][1] : 0;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <span className="text-xs text-gray-400">{total} {t('ps.players')}</span>
      </div>
      <div className="p-3">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-2 text-center">{t('ps.noData')}</p>
        ) : (
          <ul className="space-y-1.5">
            {rows.map(([value, count]) => (
              <li key={value} className="flex items-center gap-2">
                <span className="w-40 truncate text-sm text-gray-700 shrink-0">
                  {isTeam ? `${getFlag(value)} ${getTeamName(value, lang)}` : value}
                </span>
                <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500/80 rounded"
                    style={{ width: `${max ? (count / max) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-14 text-right text-sm font-semibold text-gray-700 shrink-0">
                  {count} <span className="font-normal text-gray-400 text-xs">{t('ps.votes')}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminPredictionStats() {
  const { t, lang } = useLanguage();
  const [records, setRecords] = useState(null);
  const [orgFilter, setOrgFilter] = useState('Alla');

  useEffect(() => {
    fetch(`${API}/admin/prediction-stats`)
      .then(r => r.json())
      .then(d => setRecords(d.records || []))
      .catch(() => setRecords([]));
  }, []);

  const filtered = useMemo(() => {
    if (!records) return [];
    if (orgFilter === 'Alla') return records;
    return records.filter(r => r.org && r.org.split(',').includes(orgFilter));
  }, [records, orgFilter]);

  const stats = useMemo(() => {
    const withBracket = filtered.filter(r => r.champion || (r.finalists && r.finalists.length));
    return {
      champion: { rows: tally(filtered, r => [r.champion]), total: withBracket.length },
      finalists: { rows: tally(filtered, r => r.finalists || []), total: withBracket.length },
      bronze: { rows: tally(filtered, r => [r.bronzeWinner]), total: withBracket.length },
      topScorer: { rows: tally(filtered, r => [r.topScorer]), total: filtered.filter(r => r.topScorer).length },
      firstRedCard: { rows: tally(filtered, r => [r.firstRedCardNation]), total: filtered.filter(r => r.firstRedCardNation).length },
      goldenGlove: { rows: tally(filtered, r => [r.goldenGlove]), total: filtered.filter(r => r.goldenGlove).length },
    };
  }, [filtered]);

  if (!records) return <p className="text-gray-500 p-4">{t('vp.loading')}</p>;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-4">
        <h3 className="text-white font-bold text-xl">{t('ps.title')}</h3>
        <p className="text-emerald-100 text-sm">{t('ps.subtitle')}</p>
      </div>

      <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-1">{t('um.org')}:</span>
        {ORG_KEYS.map(o => (
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

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard title={`🏆 ${t('ps.champion')}`} rows={stats.champion.rows} total={stats.champion.total} isTeam lang={lang} t={t} />
        <StatCard title={`🥈 ${t('ps.finalists')}`} rows={stats.finalists.rows} total={stats.finalists.total} isTeam lang={lang} t={t} />
        <StatCard title={`🥉 ${t('ps.bronze')}`} rows={stats.bronze.rows} total={stats.bronze.total} isTeam lang={lang} t={t} />
        <StatCard title={`🏅 ${t('ps.topScorer')}`} rows={stats.topScorer.rows} total={stats.topScorer.total} lang={lang} t={t} />
        <StatCard title={`🟥 ${t('ps.firstRedCard')}`} rows={stats.firstRedCard.rows} total={stats.firstRedCard.total} lang={lang} t={t} />
        <StatCard title={`🧤 ${t('ps.goldenGlove')}`} rows={stats.goldenGlove.rows} total={stats.goldenGlove.total} lang={lang} t={t} />
      </div>

      <p className="px-4 pb-4 text-xs text-gray-400">{t('ps.incompleteNote')}</p>
    </div>
  );
}
