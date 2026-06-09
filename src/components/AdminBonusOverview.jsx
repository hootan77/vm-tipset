import { useState, useEffect, useCallback } from 'react';
import { API } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const BONUS_FIELDS = [
  { key: 'topScorer', emoji: '🏅', points: '50p' },
  { key: 'firstRedCardNation', emoji: '🟥', points: '20p' },
  { key: 'goldenGlove', emoji: '🧤', points: '40p' },
];

export default function AdminBonusOverview() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);

  const loadData = useCallback(() => {
    fetch(`${API}/admin/all-bonus`).then(r => r.json()).then(setData);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleOverride = async (userId, field, currentlyAwarded) => {
    const newVal = !currentlyAwarded;
    // Optimistic update
    setData(prev => ({
      ...prev,
      users: prev.users.map(u =>
        u.id === userId ? { ...u, overrides: { ...u.overrides, [field]: newVal } } : u
      ),
    }));
    await fetch(`${API}/admin/bonus-overrides/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, awarded: newVal }),
    });
  };

  if (!data) return <p className="text-gray-500 p-4">{t('vp.loading')}</p>;

  const admin = data.admin;

  function autoMatch(userVal, adminVal) {
    if (!userVal || !adminVal) return false;
    return userVal.trim().toLowerCase() === adminVal.trim().toLowerCase();
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4">
        <h3 className="text-white font-bold text-xl">{t('rules.bonus')} — {t('lb.title')}</h3>
        <p className="text-purple-200 text-sm">{t('dm.subtitle')}</p>
      </div>

      {/* Admin answers (facit) */}
      <div className="px-4 py-3 bg-purple-50 border-b border-purple-200 flex flex-wrap gap-4 text-sm">
        <span className="font-semibold text-purple-700">{t('bo.adminAnswer')}</span>
        {BONUS_FIELDS.map(({ key, emoji }) => (
          <span key={key} className="text-purple-600">
            {emoji} {admin[key] || <span className="italic text-purple-400">{t('bo.noAnswer')}</span>}
          </span>
        ))}
        <span className="text-purple-600">
          🎯 {admin.tiebreaker != null ? admin.tiebreaker.toLocaleString() : <span className="italic text-purple-400">{t('bo.noAnswer')}</span>}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left py-3 px-4">{t('um.name')}</th>
              {BONUS_FIELDS.map(({ key, emoji, points }) => (
                <th key={key} className="text-left py-3 px-3">
                  {emoji} <span className="text-purple-500">({points})</span>
                </th>
              ))}
              <th className="text-left py-3 px-3">🎯</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(user => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 px-4 font-semibold text-gray-800 whitespace-nowrap">{user.name}</td>
                {BONUS_FIELDS.map(({ key }) => {
                  const userVal = user[key];
                  const adminVal = admin[key];
                  const isAuto = autoMatch(userVal, adminVal);
                  const isOverridden = !!user.overrides[key];
                  const isAwarded = isAuto || isOverridden;

                  return (
                    <td key={key} className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${userVal ? (isAwarded ? 'text-green-700 font-medium' : 'text-gray-700') : 'text-gray-300 italic'}`}>
                          {userVal || '—'}
                        </span>
                        {isAuto && (
                          <span className="text-green-500 text-xs">✓</span>
                        )}
                        {!isAuto && userVal && (
                          <button
                            onClick={() => toggleOverride(user.id, key, isOverridden)}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                              isOverridden
                                ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-green-100 hover:text-green-700 hover:border-green-200'
                            }`}
                          >
                            {isOverridden ? '✓' : '○'}
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="py-2 px-3 text-xs text-gray-600">
                  {user.tiebreaker != null ? (
                    <span>
                      {user.tiebreaker.toLocaleString()}
                      {admin.tiebreaker != null && (
                        <span className="text-gray-400 ml-1">
                          (±{Math.abs(user.tiebreaker - admin.tiebreaker).toLocaleString()})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
