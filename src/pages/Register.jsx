import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';
import { saveAuth } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FaChevronDown, FaArrowLeft } from 'react-icons/fa';

const organizationTypes = [
  { value: 'COMPANY', label: 'Company' },
  { value: 'TEAM', label: 'Team' },
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'CLASSROOM', label: 'Classroom' }
];

const organizationSizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
];

const countries = [
  'Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahrain','Bangladesh',
  'Belarus','Belgium','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria','Cambodia','Canada',
  'Chile','China','Colombia','Costa Rica','Croatia','Cuba','Czech Republic','Denmark','Dominican Republic',
  'Ecuador','Egypt','Estonia','Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece',
  'Guatemala','Honduras','Hong Kong','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Latvia','Lebanon',
  'Lithuania','Luxembourg','Malaysia','Mexico','Morocco','Nepal','Netherlands','New Zealand','Nigeria',
  'North Macedonia','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Poland',
  'Portugal','Qatar','Romania','Russia','Saudi Arabia','Senegal','Serbia','Singapore','Slovakia',
  'Slovenia','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Taiwan',
  'Tanzania','Thailand','Tunisia','Turkey','UAE','Uganda','Ukraine','United Kingdom','United States',
  'Uruguay','Uzbekistan','Venezuela','Vietnam','Zimbabwe'
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    organizationType: 'COMPANY',
    organizationSize: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('authTheme') || 'dark');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const isLightTheme = theme === 'light';

  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = formData.country
    ? countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('authTheme', next);
      return next;
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        companyName: formData.companyName.trim(),
        organizationType: formData.organizationType,
        organizationSize: formData.organizationSize || null,
        country: formData.country || null
      };

      const data = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      saveAuth({ token: data.token, user: data.user });
      login({ token: data.token, user: data.user });
      navigate('/company');
    } catch (err) {
      setError(err?.error || err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex flex-col ${isLightTheme ? 'bg-white' : 'bg-[#0d1117]'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b ${isLightTheme ? 'border-emerald-700' : 'border-gray-800'}`}>
        <div className="flex items-center gap-3">
          <Link to="/" className={`${isLightTheme ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-400 hover:text-white'} transition-colors`}>
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <Link to="/" className={`text-xs sm:text-sm font-medium tracking-widest ${isLightTheme ? 'text-emerald-700' : 'text-gray-400'}`}>
            R E G I S T R A T I O N
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

      {/* Main Content */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Card */}
          <div className={`border rounded-xl p-4 sm:p-6 md:p-8 lg:p-10 ${isLightTheme ? 'bg-white border-emerald-700' : 'bg-[#161b22] border-gray-800'}`}>
            {/* Title */}
            <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 ${isLightTheme ? 'text-[#0F172A]' : 'text-white'}`}>
              Create Organization Profile
            </h1>
            <p className={`text-xs sm:text-sm mb-6 sm:mb-8 ${isLightTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              Complete all fields.
            </p>

            {/* Error */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-xs sm:text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={submit}>
              {/* Organization Type */}
              <div className="mb-4 sm:mb-6">
                <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                  Organization type
                </label>
                <div className="relative">
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full min-h-[44px] appearance-none border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors cursor-pointer focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A]' : 'bg-[#0d1117] border-[#30363d] text-white'}`}
                  >
                    {organizationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>

              {/* Organization Size */}
              <div className="mb-4 sm:mb-6">
                <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                  Organization size
                </label>
                <div className="relative">
                  <select
                    name="organizationSize"
                    value={formData.organizationSize}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full min-h-[44px] appearance-none border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors cursor-pointer focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A]' : 'bg-[#0d1117] border-[#30363d] text-white'}`}
                  >
                    <option value="">Select size</option>
                    {organizationSizes.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>

              {/* Country (searchable) */}
              <div className="mb-4 sm:mb-6 relative" ref={countryRef}>
                <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                  Country
                </label>
                <input
                  type="text"
                  value={countryOpen ? countrySearch : formData.country}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setCountryOpen(true);
                    if (formData.country) setFormData(prev => ({ ...prev, country: '' }));
                  }}
                  onFocus={() => {
                    setCountrySearch('');
                    setCountryOpen(true);
                  }}
                  placeholder={formData.country || 'Search country...'}
                  disabled={loading}
                  className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600'}`}
                />
                {formData.country && !countryOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, country: '' }));
                      setCountrySearch('');
                    }}
                    className={`absolute right-3 top-[38px] text-xs ${isLightTheme ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    ✕
                  </button>
                )}
                {countryOpen && (
                  <div className={`absolute top-full left-0 right-0 mt-1 z-50 max-h-[200px] overflow-y-auto rounded-lg border shadow-xl ${isLightTheme ? 'bg-white border-gray-200' : 'bg-[#161b22] border-[#30363d]'}`}>
                    {filteredCountries.length === 0 && (
                      <div className={`px-3 py-2 text-xs ${isLightTheme ? 'text-gray-400' : 'text-gray-500'}`}>No results</div>
                    )}
                    {filteredCountries.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, country: c }));
                          setCountrySearch('');
                          setCountryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${formData.country === c
                          ? (isLightTheme ? 'bg-emerald-50 text-emerald-700 font-medium' : 'bg-emerald-500/10 text-emerald-400 font-medium')
                          : (isLightTheme ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-[#27272A]')
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Organization Name */}
                <div>
                  <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                    Organization name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ex: Horizon Labs"
                    disabled={loading}
                    className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600'}`}
                  />
                </div>

                {/* Manager Full Name */}
                <div>
                  <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                    Manager full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name and surname"
                    disabled={loading}
                    className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600'}`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@organization.com"
                    disabled={loading}
                    className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600'}`}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-xs sm:text-sm mb-2 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="*******"
                    minLength="6"
                    disabled={loading}
                    className={`w-full min-h-[44px] border text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] ${isLightTheme ? 'bg-white border-emerald-700 text-[#0F172A] placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600'}`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] bg-[#00d4aa] hover:bg-[#00b894] text-[#0d1117] font-semibold text-xs sm:text-sm uppercase tracking-wide py-2.5 sm:py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <p className={`text-center text-xs sm:text-sm mt-4 sm:mt-6 ${isLightTheme ? 'text-emerald-700' : 'text-gray-500'}`}>
            Already have an account?{' '}
            <a href="/login" className="text-[#00d4aa] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
