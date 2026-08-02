import React, { useState, useEffect } from "react";
import { FaChartPie, FaSun, FaMoon, FaSpinner, FaDatabase, FaDollarSign, FaRobot } from "react-icons/fa";
import { useSidebar } from '../../components/layout/AdminLayout';
import { api } from "../../utils/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAiUsagePage() {
  const { toggleSidebar, isLightTheme, toggleTheme } = useSidebar();

  const themeClasses = {
    container: isLightTheme ? 'bg-white' : 'bg-black',
    card: isLightTheme ? 'bg-white border-gray-300 shadow-sm' : 'bg-[#18181B] border-gray-700',
    cardHover: isLightTheme ? 'hover:bg-[#ECEFF1]' : 'hover:bg-[#202025]',
    text: isLightTheme ? 'text-gray-700' : 'text-gray-200',
    textMuted: isLightTheme ? 'text-gray-600' : 'text-gray-400',
    textSecondary: isLightTheme ? 'text-gray-500' : 'text-gray-500',
    tableHeader: isLightTheme ? 'bg-gray-50 text-gray-600' : 'bg-[#202025] text-gray-400',
    tableRow: isLightTheme ? 'border-gray-100 hover:bg-gray-50' : 'border-[#27272A] hover:bg-[#202025] text-gray-400',
  };

  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const [summary, setSummary] = useState(null);
  const [byCompany, setByCompany] = useState([]);
  const [byUser, setByUser] = useState([]);
  const [bySource, setBySource] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!loading) {
      const id = setTimeout(() => setChartReady(true), 100);
      return () => clearTimeout(id);
    }
    setChartReady(false);
  }, [loading]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [summaryData, companyData, userData, sourceData, trendsData] = await Promise.all([
        api('/api/admin/usage/summary'),
        api('/api/admin/usage/by-company'),
        api('/api/admin/usage/by-user'),
        api('/api/admin/usage/by-source'),
        api('/api/admin/usage/trends?days=30'),
      ]);
      setSummary(summaryData);
      setByCompany(companyData || []);
      setByUser(userData || []);
      setBySource(sourceData || []);
      setTrends(trendsData || []);
    } catch (err) {
      console.error('Failed to load AI usage data:', err);
    } finally {
      setLoading(false);
    }
  }

  function fmt(n) {
    if (n == null) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  }

  function fmtCost(n) {
    if (n == null) return '$0.00';
    const num = Number(n);
    if (isNaN(num)) return '$0.00';
    if (num < 0.01) return '< $0.01';
    return '$' + num.toFixed(2);
  }

  function fmtDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const sourceLabels = {
    manager_query: 'Manager Queries',
    admin_query: 'Admin Queries',
    test_message: 'Test Messages',
    test_evaluation: 'Test Evaluations',
    image_generation: 'Image Generation',
    svg_generation: 'SVG Generation',
  };

  return (
    <div className={`min-h-screen ${themeClasses.container} selection:bg-emerald-500/30 px-[min(4vw,16px)] md:px-[min(3vw,24px)] lg:px-[min(2vw,32px)] py-4 md:py-6 lg:pt-2 lg:pb-2 font-montserrat`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');`}</style>

      <div className="space-y-4 sm:space-y-5">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-[min(2.2vw,40px)] lg:h-[min(2.2vw,40px)] rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow">
              <FaChartPie className="w-5 h-5 lg:w-[min(1.2vw,22px)] lg:h-[min(1.2vw,22px)]" />
            </div>
            <h1 className={`text-[min(4.5vw,28px)] sm:text-[min(3.5vw,24px)] md:text-[min(2vw,20px)] lg:text-[min(1.3vw,18px)] font-black tracking-[0.25em] uppercase ${isLightTheme ? 'text-[#334155]' : 'text-gray-200'}`}>
              AI Usage
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-[#18181B]'}`}
              title={isLightTheme ? 'Switch to Dark' : 'Switch to Light'}
            >
              {isLightTheme ? (
                <FaMoon className={`w-5 h-5 lg:w-[18px] lg:h-[18px] text-[#334155]`} />
              ) : (
                <FaSun className={`w-5 h-5 lg:w-[18px] lg:h-[18px] text-white`} />
              )}
            </button>
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-[#18181B]'}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 lg:w-[18px] lg:h-[18px] ${isLightTheme ? 'text-[#334155]' : 'text-gray-400'}`}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className={`w-8 h-8 animate-spin ${isLightTheme ? 'text-emerald-600' : 'text-emerald-500'}`} />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {[
                { label: 'Total Tokens', value: fmt(summary?.totalTokens || 0), icon: FaDatabase, color: 'emerald' },
                { label: 'Total Cost', value: fmtCost(summary?.totalCost || 0), icon: FaDollarSign, color: 'amber' },
                { label: 'Total Requests', value: fmt(summary?.totalRequests || 0), icon: FaRobot, color: 'violet' },
                { label: 'Avg Tokens/Req', value: fmt(summary?.totalRequests > 0 ? Math.round(summary.totalTokens / summary.totalRequests) : 0), icon: FaChartPie, color: 'blue' },
              ].map((card, idx) => (
                <div key={idx} className={`${themeClasses.card} rounded-xl border p-[min(3vw,16px)] md:p-[min(2vw,20px)] lg:p-[min(0.8vw,16px)] transition-colors`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 lg:w-[min(1.8vw,32px)] lg:h-[min(1.8vw,32px)] rounded-lg flex items-center justify-center ${
                      card.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                      card.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                      card.color === 'violet' ? 'bg-violet-500/10 text-violet-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      <card.icon className="w-4 h-4 lg:w-[min(0.9vw,16px)] lg:h-[min(0.9vw,16px)]" />
                    </div>
                    <span className={`text-[min(3vw,14px)] sm:text-[min(2vw,13px)] md:text-[min(1.2vw,12px)] lg:text-[min(0.8vw,11px)] font-bold uppercase tracking-widest ${themeClasses.textSecondary}`}>
                      {card.label}
                    </span>
                  </div>
                  <div className="text-[min(6vw,36px)] sm:text-[min(4.5vw,32px)] md:text-[min(3vw,28px)] lg:text-[min(1.8vw,24px)] font-black text-emerald-500 tabular-nums leading-none pl-[2%]">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Trend Chart */}
            {trends.length > 0 && (
              <div className={`${themeClasses.card} rounded-xl border p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,16px)]`}>
                <h3 className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,13px)] font-black uppercase tracking-[0.25em] mb-4 ${isLightTheme ? 'text-gray-700' : 'text-gray-200'}`}>
                  Daily Token Usage (30 Days)
                </h3>
                <div className="w-full h-[160px] sm:h-[200px] md:h-[220px] lg:h-[260px] min-h-[160px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[260px] relative">
                  {trends.length > 0 && chartReady && (
                    <ResponsiveContainer width="100%" height="100%" key={isLightTheme ? 'light' : 'dark'}>
                      <BarChart data={trends}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: isLightTheme ? '#64748B' : '#94A3B8' }} tickFormatter={fmtDate} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: isLightTheme ? '#64748B' : '#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isLightTheme ? '#fff' : '#18181B',
                            border: `1px solid ${isLightTheme ? '#D6DEE5' : '#27272A'}`,
                            borderRadius: '8px',
                            color: isLightTheme ? '#334155' : '#E2E8F0',
                            fontSize: '12px'
                          }}
                          formatter={(value) => [value.toLocaleString(), 'Tokens']}
                          labelFormatter={fmtDate}
                        />
                        <Bar dataKey="totalTokens" fill="#22C58B" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Source Breakdown */}
            <div className={`${themeClasses.card} rounded-xl border p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,16px)]`}>
              <h3 className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,13px)] font-black uppercase tracking-[0.25em] mb-4 ${isLightTheme ? 'text-gray-700' : 'text-gray-200'}`}>
                Usage by Source
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${themeClasses.tableHeader} text-[min(2.8vw,13px)] sm:text-[min(2vw,12px)] md:text-[min(1.2vw,11px)] lg:text-[min(0.7vw,10px)] font-bold uppercase tracking-wider`}>
                      <th className="px-3 py-2 rounded-l-lg">Source</th>
                      <th className="px-3 py-2 text-right">Tokens</th>
                      <th className="px-3 py-2 text-right">Prompt</th>
                      <th className="px-3 py-2 text-right">Completion</th>
                      <th className="px-3 py-2 text-right">Cost</th>
                      <th className="px-3 py-2 text-right rounded-r-lg">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bySource.map((s, idx) => (
                      <tr key={s.source} className={`border-b ${themeClasses.tableRow} text-[min(2.8vw,13px)] sm:text-[min(2vw,12px)] md:text-[min(1.2vw,11px)] lg:text-[min(0.7vw,10px)]`}>
                        <td className="px-3 py-2.5 font-semibold">{sourceLabels[s.source] || s.source}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s.totalTokens)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s.promptTokens)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(s.completionTokens)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtCost(s.totalCost)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{s.totalRequests}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Company */}
            <div className={`${themeClasses.card} rounded-xl border p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,16px)]`}>
              <h3 className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,13px)] font-black uppercase tracking-[0.25em] mb-4 ${isLightTheme ? 'text-gray-700' : 'text-gray-200'}`}>
                Usage by Company
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${themeClasses.tableHeader} text-[min(2.8vw,13px)] sm:text-[min(2vw,12px)] md:text-[min(1.2vw,11px)] lg:text-[min(0.7vw,10px)] font-bold uppercase tracking-wider`}>
                      <th className="px-3 py-2 rounded-l-lg">Company</th>
                      <th className="px-3 py-2 text-right">Tokens</th>
                      <th className="px-3 py-2 text-right">Prompt</th>
                      <th className="px-3 py-2 text-right">Completion</th>
                      <th className="px-3 py-2 text-right">Cost</th>
                      <th className="px-3 py-2 text-right rounded-r-lg">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byCompany.map((c, idx) => (
                      <tr key={c.companyId} className={`border-b ${themeClasses.tableRow} text-[min(2.8vw,13px)] sm:text-[min(2vw,12px)] md:text-[min(1.2vw,11px)] lg:text-[min(0.7vw,10px)]`}>
                        <td className="px-3 py-2.5 font-semibold">{c.companyName}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(c.totalTokens)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(c.promptTokens)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(c.completionTokens)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtCost(c.totalCost)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{c.totalRequests}</td>
                      </tr>
                    ))}
                    {byCompany.length === 0 && (
                      <tr>
                        <td colSpan="6" className={`px-3 py-6 text-center ${themeClasses.textMuted} text-[min(3vw,14px)]`}>No company usage data yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By User */}
            <div className={`${themeClasses.card} rounded-xl border p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,16px)]`}>
              <h3 className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,13px)] font-black uppercase tracking-[0.25em] mb-4 ${isLightTheme ? 'text-gray-700' : 'text-gray-200'}`}>
                Usage by User
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${themeClasses.tableHeader} text-[min(2.8vw,13px)] sm:text-[min(2vw,12px)] md:text-[min(1.2vw,11px)] lg:text-[min(0.7vw,10px)] font-bold uppercase tracking-wider`}>
                      <th className="px-3 py-2 rounded-l-lg">User</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Company</th>
                      <th className="px-3 py-2 text-right">Tokens</th>
                      <th className="px-3 py-2 text-right">Cost</th>
                      <th className="px-3 py-2 text-right rounded-r-lg">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byUser.map((u, idx) => (
                      <tr key={u.userId} className={`border-b ${themeClasses.tableRow} text-[min(2.8vw,13px)] sm:text-[min(2vw,12px)] md:text-[min(1.2vw,11px)] lg:text-[min(0.7vw,10px)]`}>
                        <td className="px-3 py-2.5 font-semibold">{u.userName}</td>
                        <td className={`px-3 py-2.5 ${themeClasses.textMuted}`}>{u.userEmail}</td>
                        <td className={`px-3 py-2.5 ${themeClasses.textMuted}`}>{u.companyName}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(u.totalTokens)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{fmtCost(u.totalCost)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{u.totalRequests}</td>
                      </tr>
                    ))}
                    {byUser.length === 0 && (
                      <tr>
                        <td colSpan="6" className={`px-3 py-6 text-center ${themeClasses.textMuted} text-[min(3vw,14px)]`}>No user usage data yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
