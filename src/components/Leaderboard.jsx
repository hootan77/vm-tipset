import { useState, useEffect } from 'react';
import { useAuth, API } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ROLE_KEYS = ['Alla', 'Spelare', 'Ledare', 'Förälder', 'Syskon'];

export default function Leaderboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('Alla');

  useEffect(() => {
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function refresh() {
    setLoading(true);
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }

  const roleLabel = (role) => {
    if (role === 'Alla') return t('lb.all');
    return t(`role.${role.toLowerCase()}`) || role;
  };

  const userOrgs = user?.org ? user.org.split(',') : [];
  const orgFiltered = userOrgs.length
    ? data.filter(r => r.org && r.org.split(',').some(o => userOrgs.includes(o)))
    : data;
  const showRoleFilter = userOrgs.includes('Enskede') && !userOrgs.includes('QBank') && !userOrgs.includes('Friends');
  const filtered = roleFilter === 'Alla' || !showRoleFilter ? orgFiltered : orgFiltered.filter(r => r.role === roleFilter);

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

      {showRoleFilter && (
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2 flex-wrap">
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

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {data.length === 0 ? t('lb.empty') : t('lb.noRole')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">{t('lb.col.rank')}</th>
                <th className="text-left py-3 px-4">{t('lb.col.player')}</th>
                <th className="text-left py-3 px-4">{t('lb.col.role')}</th>
                <th className="text-center py-3 px-4">{t('lb.col.group')}</th>
                <th className="text-center py-3 px-4">{t('lb.col.knockout')}</th>
                <th className="text-center py-3 px-4">{t('lb.col.bonus')}</th>
                <th className="text-center py-3 px-4 font-bold">{t('lb.col.total')}</th>
                <th className="text-center py-3 px-4">{t('lb.col.exact')}</th>
                <th className="text-center py-3 px-4">{t('lb.col.outcome')}</th>
                <th className="text-center py-3 px-4">{t('lb.col.tips')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className={`border-b last:border-0 ${i === 0 ? 'bg-yellow-50' : i === 1 ? 'bg-gray-50' : i === 2 ? 'bg-orange-50' : ''}`}>
                  <td className="py-3 px-4">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{row.name}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{t(`role.${(row.role || 'Spelare').toLowerCase()}`) || row.role}</td>
                  <td className="py-3 px-4 text-center">{row.groupPoints}</td>
                  <td className="py-3 px-4 text-center">{row.knockoutPoints}</td>
                  <td className="py-3 px-4 text-center">{row.bonusPoints || 0}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 text-lg">{row.total}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.exactResults}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.correctOutcomes}</td>
                  <td className="py-3 px-4 text-center text-gray-400">{row.totalPredictions}/72</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
