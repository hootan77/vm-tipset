import { useState, useEffect } from 'react';
import { useAuth, API } from '../context/AuthContext';

const ROLES = ['Alla', 'Spelare', 'Ledare', 'Förälder', 'Syskon'];

export default function Leaderboard() {
  const { user } = useAuth();
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

  const userOrgs = user?.org ? user.org.split(',') : [];
  const orgFiltered = userOrgs.length
    ? data.filter(r => r.org && r.org.split(',').some(o => userOrgs.includes(o)))
    : data;
  const filtered = roleFilter === 'Alla' ? orgFiltered : orgFiltered.filter(r => r.role === roleFilter);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Laddar leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-xl">Ställning</h3>
          <p className="text-emerald-100 text-sm">Vem leder tippningen?</p>
        </div>
        <button
          onClick={refresh}
          className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
        >
          Uppdatera
        </button>
      </div>

      {!userOrgs.includes('QBank') && (
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filtrera:</span>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {data.length === 0 ? 'Inga tippare har registrerat sig ännu.' : 'Inga tippare med den rollen.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Tippare</th>
                <th className="text-left py-3 px-4">Roll</th>
                <th className="text-center py-3 px-4">Gruppspel</th>
                <th className="text-center py-3 px-4">Slutspel</th>
                <th className="text-center py-3 px-4">Bonus</th>
                <th className="text-center py-3 px-4 font-bold">Totalt</th>
                <th className="text-center py-3 px-4">Exakta</th>
                <th className="text-center py-3 px-4">Rätt utfall</th>
                <th className="text-center py-3 px-4">Tips</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className={`border-b last:border-0 ${i === 0 ? 'bg-yellow-50' : i === 1 ? 'bg-gray-50' : i === 2 ? 'bg-orange-50' : ''}`}>
                  <td className="py-3 px-4">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{row.name}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{row.role || 'Spelare'}</td>
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
