import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function LoginLanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      <button
        onClick={() => setLang('sv')}
        className={`text-2xl transition-transform ${lang === 'sv' ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
        title="Svenska"
      >
        🇸🇪
      </button>
      <button
        onClick={() => setLang('en')}
        className={`text-2xl transition-transform ${lang === 'en' ? 'scale-125' : 'opacity-50 hover:opacity-100'}`}
        title="English"
      >
        🇬🇧
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login, register, error, setError } = useAuth();
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      setError(t('login.passwordMismatch'));
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
        <LoginLanguageSwitcher />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">VM Tips 2026</h1>
          <p className="text-gray-500 mt-2">
            {isRegister ? t('login.subtitle.register') : t('login.subtitle.login')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.name')}</label>
              <input
                type="text"
                value={displayName}
                onChange={e => { setDisplayName(e.target.value); clearError(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder={t('login.namePlaceholder')}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.username')}</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); clearError(); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={t('login.usernamePlaceholder')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={t('login.passwordPlaceholder')}
              required
            />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); clearError(); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder={t('login.confirmPlaceholder')}
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
            {loading ? '...' : isRegister ? t('login.createAccount') : t('login.login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-blue-600 text-sm hover:underline"
          >
            {isRegister ? t('login.hasAccount') : t('login.noAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
