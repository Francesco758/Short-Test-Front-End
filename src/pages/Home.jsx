import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlay,
  FaChartBar,
  FaArrowRight,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaChartLine,
} from 'react-icons/fa';
import Footer from './Footer';
import AOS from 'aos';

export default function Home() {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>

        {/* Animated Background Elements */}
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          data-aos="zoom-in"
          data-aos-delay="200"
        ></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
          data-aos="zoom-in"
          data-aos-delay="400"
        ></div>
        <div
          className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
          data-aos="zoom-in"
          data-aos-delay="600"
        ></div>

        <div className="relative px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-7xl mx-auto">
            {/* Simple Header */}
            <div
              className="flex justify-between items-center py-6 mb-12"
              data-aos="fade-down"
              data-aos-delay="100"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center"
                  data-aos="zoom-in"
                  data-aos-delay="150"
                >
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <span
                  className="text-2xl font-bold text-gray-900"
                  data-aos="fade-right"
                  data-aos-delay="200"
                >
                  shorTest
                </span>
              </div>

              <div
                className="flex items-center space-x-4"
                data-aos="fade-left"
                data-aos-delay="250"
              >
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>

            <div className="text-center">
              {/* Enhanced Badge */}
              <div
                className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 text-sm font-medium mb-8 shadow-sm"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                🚀 Live Demo - shorTest Assessment Platform v2.0
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                  NEW
                </span>
              </div>

              {/* Main Content */}
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <span
                  className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  data-aos="fade-up"
                  data-aos-delay="450"
                >
                  Conversational
                </span>
                <span
                  className="block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                  data-aos="fade-up"
                  data-aos-delay="500"
                >
                  Assessment
                </span>
                <span
                  className="block text-lg md:text-xl lg:text-2xl text-gray-600 mt-4 font-normal"
                  data-aos="fade-up"
                  data-aos-delay="550"
                >
                  Powered by AI • Built with React • Deployed for Performance
                </span>
              </h1>

              {/* Enhanced Subtitle */}
              <p
                className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed font-light"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                A sophisticated{' '}
                <span className="font-semibold text-blue-600">
                  6-phase conversational assessment
                </span>{' '}
                platform that transforms candidate evaluation through
                intelligent dialogue and real-time analytics.
              </p>

              {/* Enhanced Stats */}
              <div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto"
                data-aos="fade-up"
                data-aos-delay="650"
              >
                <div
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
                  data-aos="zoom-in"
                  data-aos-delay="700"
                >
                  <FaUsers className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Candidates</div>
                </div>
                <div
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
                  data-aos="zoom-in"
                  data-aos-delay="750"
                >
                  <FaClock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">15min</div>
                  <div className="text-sm text-gray-600">Avg. Test Time</div>
                </div>
                <div
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
                  data-aos="zoom-in"
                  data-aos-delay="800"
                >
                  <FaCheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
                  data-aos="zoom-in"
                  data-aos-delay="850"
                >
                  <FaChartLine className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-sm text-gray-600">Assessment Phases</div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
                data-aos="fade-up"
                data-aos-delay="900"
              >
                <Link
                  to="/login"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                  data-aos="zoom-in"
                  data-aos-delay="950"
                >
                  <FaPlay className="w-5 h-5 mr-3 relative z-10" />
                  <span className="relative z-10">Start Assessment</span>
                  <FaArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform relative z-10" />
                </Link>

                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  data-aos="zoom-in"
                  data-aos-delay="1000"
                >
                  <FaChartBar className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span>Manager Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-gradient-to-b from-white to-gray-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div
            className="text-center mb-16"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              data-aos="fade-up"
              data-aos-delay="250"
            >
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose shorTest?
              </span>
            </h2>
            <p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              Experience the next generation of candidate assessment with our
              AI-powered conversational platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              data-aos="fade-right"
              data-aos-delay="350"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Smart Candidate Matching
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI algorithms match candidates with ideal roles based on
                conversational patterns and skill assessments.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <FaChartLine className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Real-time Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant insights into candidate performance with detailed
                analytics and comprehensive reporting.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              data-aos="fade-left"
              data-aos-delay="450"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <FaClock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Time-efficient
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Complete comprehensive assessments in just 15 minutes without
                compromising on evaluation quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 py-20"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            Ready to Transform Your Hiring?
          </h2>
          <p
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Join thousands of companies using shorTest to make smarter hiring
            decisions faster.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            data-aos="fade-up"
            data-aos-delay="350"
          >
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
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
