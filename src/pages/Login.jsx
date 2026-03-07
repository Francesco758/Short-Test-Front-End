import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { saveAuth } from '../utils/auth';
import { api } from '../utils/api';
import AOS from 'aos';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaArrowLeft,
  FaRocket,
  FaShieldAlt,
  FaUserTie
} from 'react-icons/fa';

export default function Login() {
  useEffect(() => {
    AOS.refresh();
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
          navigate('/admin');
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center" data-aos="fade-down" data-aos-delay="100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md" data-aos="zoom-in" data-aos-delay="150">
                <FaRocket className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold text-gray-900" data-aos="fade-right" data-aos-delay="200">shorTest</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" data-aos="fade-up" data-aos-delay="250">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600" data-aos="fade-up" data-aos-delay="300">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              register your company
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-up" data-aos-delay="400">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200/60 backdrop-blur-sm">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Security Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <FaShieldAlt className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Enterprise-grade security</span>
              </div>
            </div>
          </div>

          {/* Demo Badge */}
          <div className="mt-6 text-center" data-aos="fade-up" data-aos-delay="500">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200/60 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Demo - Platform v2.0
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center" data-aos="fade-up" data-aos-delay="550">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:underline"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}