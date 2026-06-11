import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ROLES = ['Spelare', 'Ledare', 'Familj'];
const ORGS = ['Enskede', 'QBank', 'Friends', 'MNO'];

export default function UserManager({ onViewUser }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [feedback, setFeedback] = useState({});
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetch(`${API}/users`).then(r => r.json()).then(setUsers);
  }, []);

  const changePassword = async (userId) => {
    const pw = passwords[userId];
    if (!pw || pw.length < 4) {
      setFeedback(f => ({ ...f, [userId]: t('um.minChars') }));
      return;
    }
    const res = await fetch(`${API}/users/${userId}/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      setFeedback(f => ({ ...f, [userId]: t('um.saved') }));
      setPasswords(p => ({ ...p, [userId]: '' }));
      setTimeout(() => setFeedback(f => ({ ...f, [userId]: '' })), 2000);
    }
  };

  const changeRole = async (userId, role) => {
    const res = await fetch(`${API}/users/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    }
  };

  const toggleOrg = async (userId, orgName, currentOrg) => {
    const current = currentOrg ? currentOrg.split(',') : [];
    const updated = current.includes(orgName)
      ? current.filter(o => o !== orgName)
      : [...current, orgName];
    const res = await fetch(`${API}/users/${userId}/org`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgs: updated }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, org: updated.length ? updated.join(',') : null } : u));
    }
  };

  const deleteUser = async (user) => {
    const msg = t('um.confirmDelete').replace('{name}', user.name);
    if (!window.confirm(msg)) return;
    const res = await fetch(`${API}/users/${user.id}/delete`, { method: 'POST' });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, deleted: true, deletedAt: new Date().toISOString() } : u));
    }
  };

  const restoreUser = async (user) => {
    const msg = t('um.confirmRestore').replace('{name}', user.name);
    if (!window.confirm(msg)) return;
    const res = await fetch(`${API}/users/${user.id}/restore`, { method: 'POST' });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, deleted: false, deletedAt: null } : u));
    }
  };

  const isSaved = (msg) => msg === t('um.saved') || msg === 'Sparat!' || msg === 'Saved!';

  const deletedCount = users.filter(u => u.deleted).length;
  const visibleUsers = showDeleted ? users : users.filter(u => !u.deleted);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-xl">{t('um.title')}</h3>
          <p className="text-indigo-200 text-sm">{t('um.subtitle')}</p>
        </div>
        {deletedCount > 0 && (
          <button
            onClick={() => setShowDeleted(v => !v)}
            className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors whitespace-nowrap"
          >
            {showDeleted ? t('um.hideDeleted') : `${t('um.showDeleted')} (${deletedCount})`}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left py-3 px-4">{t('um.name')}</th>
              <th className="text-left py-3 px-4">{t('um.role')}</th>
              <th className="text-left py-3 px-4">{t('um.org')}</th>
              <th className="text-left py-3 px-4">{t('um.registered')}</th>
              <th className="text-left py-3 px-4">{t('um.newPassword')}</th>
              <th className="text-center py-3 px-4">{t('um.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map(u => (
              <tr key={u.id} className={`border-b last:border-0 ${u.deleted ? 'bg-red-50/40 opacity-60' : 'hover:bg-gray-50'}`}>
                <td className="py-3 px-4">
                  <div className="font-semibold text-gray-800 flex items-center gap-2">
                    {u.name}
                    {u.deleted && (
                      <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">{t('um.deleted')}</span>
                    )}
                  </div>
                  {u.username && u.username !== u.name && (
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {u.isAdmin ? (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Admin</span>
                  ) : (
                    <select
                      value={u.role || 'Spelare'}
                      onChange={e => changeRole(u.id, e.target.value)}
                      disabled={u.deleted}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{t(`role.${r.toLowerCase()}`) || r}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {ORGS.map(o => (
                      <label key={o} className={`flex items-center gap-1 text-xs ${u.deleted ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          checked={(u.org || '').split(',').includes(o)}
                          onChange={() => toggleOrg(u.id, o, u.org)}
                          disabled={u.deleted}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        {o}
                      </label>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('sv-SE') : ''}
                </td>
                <td className="py-3 px-4">
                  {!u.deleted && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={t('um.newPassword')}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                        value={passwords[u.id] || ''}
                        onChange={e => setPasswords(p => ({ ...p, [u.id]: e.target.value }))}
                      />
                      <button
                        onClick={() => changePassword(u.id)}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                      >
                        {t('um.save')}
                      </button>
                      {feedback[u.id] && (
                        <span className={`text-xs ${isSaved(feedback[u.id]) ? 'text-green-600' : 'text-red-500'}`}>
                          {feedback[u.id]}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {u.deleted ? (
                      <button
                        onClick={() => restoreUser(u)}
                        className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs hover:bg-green-100 transition-colors"
                      >
                        {t('um.restore')}
                      </button>
                    ) : (
                      <>
                        {!u.isAdmin && (
                          <button
                            onClick={() => onViewUser(u)}
                            className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs hover:bg-blue-100 transition-colors"
                          >
                            {t('um.view')}
                          </button>
                        )}
                        {!u.isAdmin && (
                          <button
                            onClick={() => deleteUser(u)}
                            className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs hover:bg-red-100 transition-colors"
                          >
                            {t('um.delete')}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
