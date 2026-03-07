import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';
import { saveAuth } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import AOS from 'aos';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaRocket, 
  FaShieldAlt,
  FaArrowRight,
  FaExclamationTriangle,
  FaUserPlus,
  FaBuilding
} from 'react-icons/fa';

export default function Register() {
  useEffect(() => {
    AOS.refresh();
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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

    // Validation - Company registration requires all fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.companyName.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Updated payload to match backend expectations
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        companyName: formData.companyName.trim()
        // Removed isCompany flag - backend automatically detects COMPANY_ADMIN from companyName
      };

      const data = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      // Save auth data and update context
      saveAuth({ token: data.token, user: data.user });
      login({ token: data.token, user: data.user });
      
      // Redirect COMPANY_ADMIN to company dashboard
      navigate('/company');
      
    } catch (err) {
      // Handle backend errors
      setError(err?.error || err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center" data-aos="fade-down" data-aos-delay="100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md" data-aos="zoom-in" data-aos-delay="150">
                <FaBuilding className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold text-gray-900" data-aos="fade-right" data-aos-delay="200">shorTest</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" data-aos="fade-up" data-aos-delay="250">
            Create Company Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600" data-aos="fade-up" data-aos-delay="300">
            Register your company to start using shorTest
          </p>
        </div>

        {/* Register Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-up" data-aos-delay="400">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200/60 backdrop-blur-sm">
            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" data-aos="zoom-in" data-aos-delay="450">
              <div className="flex items-start gap-3">
                <FaBuilding className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Company Registration Only</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Individual users will be added by company administrators. This registration is for company administrators only.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              {/* Company Name Field */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="My Company LLC"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Admin Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Administrator Email *
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
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="admin@company.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="At least 6 characters"
                    required
                    disabled={loading}
                    minLength="6"
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                </div>
                <label htmlFor="terms" className="block text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating company account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="w-4 h-4" />
                      <span>Create Company Account</span>
                      <FaArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
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

          {/* Login Link */}
          <div className="mt-6 text-center" data-aos="fade-up" data-aos-delay="550">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
              >
                Sign in here
              </Link>
            </p>
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