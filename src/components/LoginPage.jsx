import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, error, setError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      setError('Lösenorden matchar inte');
      return;
    }
    setLoading(true);
    if (isRegister) {
      await register(displayName, username, password);
    } else {
      await login(username, password);
    }
    setLoading(false);
  }

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">VM Tips 2026</h1>
          <p className="text-gray-500 mt-2">
            {isRegister ? 'Skapa ett konto för att börja tippa' : 'Logga in för att tippa'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
              <input
                type="text"
                value={displayName}
                onChange={e => { setDisplayName(e.target.value); clearError(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Ditt riktiga namn"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Användarnamn</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); clearError(); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ditt användarnamn"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lösenord</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ditt lösenord"
              required
            />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bekräfta lösenord</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); clearError(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Upprepa lösenord"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : isRegister ? 'Skapa konto' : 'Logga in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-blue-600 text-sm hover:underline"
          >
            {isRegister ? 'Har redan ett konto? Logga in' : 'Inget konto? Registrera dig'}
          </button>
        </div>
      </div>
    </div>
  );
}
