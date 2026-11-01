import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { saveAuth } from '../utils/auth';
import { api } from '../utils/api';
import { FaEye, FaEyeSlash, FaArrowLeft, FaGlobe } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [guestCompanies, setGuestCompanies] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('authTheme') || 'dark');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const isLightTheme = theme === 'light';

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('authTheme', next);
      return next;
    });
  };

  useEffect(() => {
    api('/api/company/tests/guest-companies')
      .then(setGuestCompanies)
      .catch(() => {});
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });

      saveAuth({ token: data.token, user: data.user });
      login({ token: data.token, user: data.user });

      const userRole = (data.user.role || 'USER').toUpperCase();

      switch (userRole) {
        case 'SUPER_ADMIN':
          navigate('/dashboard');
          break;
        case 'COMPANY_ADMIN':
          navigate('/company');
          break;
        case 'USER':
          navigate('/test');
          break;
        default:
          navigate('/test');
      }
    } catch (err) {
      setError(err?.error || err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin(e) {
    e.preventDefault();
    setError(null);

    if (!guestName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!selectedCompanyId) {
      setError('Please select a company');
      return;
    }

    setGuestLoading(true);

    try {
      const data = await api('/api/auth/guest-login', {
        method: 'POST',
        body: JSON.stringify({ name: guestName.trim(), companyId: selectedCompanyId })
      });

      saveAuth({ token: data.token, user: data.user });
      login({ token: data.token, user: data.user });
      navigate('/test');
    } catch (err) {
      setError(err?.error || err?.message || 'Guest login failed');
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex flex-col ${isLightTheme ? 'bg-white' : 'bg-[#0d1117]'}`}>
      <header className={`flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b ${isLightTheme ? 'border-emerald-700' : 'border-gray-800'}`}>
        <div className="flex items-center gap-3">
          <RouterLink to="/" className={`${isLightTheme ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-400 hover:text-white'} transition-colors`}>
            <FaArrowLeft className="w-4 h-4" />
          </RouterLink>
          <Link to="/" className="text-xs sm:text-sm font-bold tracking-widest">
            <span className={isLightTheme ? 'text-[#0F172A]' : 'text-white'}>SHOR</span><span className="text-[#00d4aa]">TEST</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-md transition-colors ${isLightTheme ? 'bg-white border border-emerald-700 text-gray-900 hover:bg-gray-50' : 'text-gray-300 bg-[#1c2128] border border-gray-700 hover:bg-[#262c36]'}`}
          >
            <span className="hidden sm:inline">THEME: </span>{isLightTheme ? 'DARK' : 'LIGHT'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        <div className="w-full max-w-2xl mx-auto">

          {showGuestForm ? (
            /* Guest Login Form */
            <div className={`border rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 ${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#161b22] border-gray-800'}`}>
              <button
                onClick={() => { setShowGuestForm(false); setError(null); }}
                className={`flex items-center gap-2 text-xs sm:text-sm mb-4 transition-colors ${isLightTheme ? 'text-gray-500 hover:text-[#0F172A]' : 'text-gray-400 hover:text-white'}`}
              >
                <FaArrowLeft className="w-3 h-3" />
                Back to Sign In
              </button>

              <div className="flex items-center gap-3 mb-4">
                <FaGlobe className="w-6 h-6 text-[#00d4aa]" />
                <h2 className={`text-xl sm:text-2xl font-bold ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                  Guest Access
                </h2>
              </div>
              <p className={`text-xs sm:text-sm mb-6 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                Enter your name and select a company to start testing. No email or password required.
              </p>

              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleGuestLogin}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>Your Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      disabled={guestLoading}
                      className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>Company</label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      disabled={guestLoading}
                      className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A]' : 'bg-[#0d1117] border-[#30363d] text-white'}`}
                    >
                      <option value="">Select a company</option>
                      {guestCompanies.filter(c => c.name !== 'Adnan').length === 0 && (
                        <option value="" disabled>No companies available for guest access</option>
                      )}
                      {guestCompanies.filter(c => c.name !== 'Adnan').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={guestLoading || !guestName.trim() || !selectedCompanyId}
                  className="w-full min-h-[44px] bg-[#00d4aa] hover:bg-[#00b894] text-[#0d1117] font-semibold text-xs sm:text-sm uppercase tracking-wide py-2.5 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guestLoading ? 'Logging in...' : 'Login as Guest'}
                </button>
              </form>
            </div>
          ) : (
            /* Regular Login Form */
            <div className={`border rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 ${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#161b22] border-gray-800'}`}>
              <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
                Sign In to Your Account
              </h1>
              <p className={`text-xs sm:text-sm mb-6 sm:mb-8 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                Enter your credentials to access your account.
              </p>

              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-800 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@organization.com"
                      disabled={loading}
                      className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="*******"
                        disabled={loading}
                        className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pr-10 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isLightTheme ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-400'}`}
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] bg-[#00d4aa] hover:bg-[#00b894] text-[#0d1117] font-semibold text-xs sm:text-sm uppercase tracking-wide py-2.5 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Guest Login Button (always visible when NOT in guest form) */}
          {!showGuestForm && (
            <div className="mt-4 text-center">
              <button
                onClick={() => { setShowGuestForm(true); setError(null); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-[#00d4aa] text-[#00d4aa] hover:bg-[#00d4aa]/10 rounded-lg text-sm font-semibold transition-colors"
              >
                <FaGlobe className="w-4 h-4" />
                Login As Guest
              </button>
              <p className={`text-xs mt-2 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                No email or password required. Just pick a name and start.
              </p>
            </div>
          )}

          {/* Links */}
          {!showGuestForm && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-6">
              <p className={`text-center text-xs sm:text-sm ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                Don&apos;t have an account?{' '}
                <Link to="/register" className={`hover:underline ${isLightTheme ? 'text-emerald-700' : 'text-[#00d4aa]'}`}>
                  Register
                </Link>
              </p>
              <span className={`hidden sm:block ${isLightTheme ? 'text-gray-300' : 'text-gray-600'}`}>|</span>
              <Link to="/" className={`text-xs sm:text-sm transition-colors ${isLightTheme ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-400'}`}>
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </main>
      <footer className="px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className={`text-xs ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`}>The information will be used exclusively for educational purposes.</p>
      </footer>
    </div>
  );
}
