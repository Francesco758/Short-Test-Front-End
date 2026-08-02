import React, { useState, useEffect } from "react";
import { FaRobot, FaSave, FaSun, FaMoon, FaChevronDown, FaChevronUp, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaDatabase } from "react-icons/fa";
import { useSidebar } from '../../components/layout/AdminLayout';
import { api } from "../../utils/api";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";

export default function AdminTransforMachinePage() {
  const { toggleSidebar, isLightTheme, toggleTheme } = useSidebar();

  const themeClasses = {
    container: isLightTheme ? 'bg-white' : 'bg-black',
    card: isLightTheme ? 'bg-white border-[#D6DEE5] shadow-sm' : 'bg-[#18181B] border-gray-700',
    input: isLightTheme ? 'bg-white border-gray-300 text-gray-700 placeholder-gray-500' : 'bg-black border-gray-700 text-gray-200 placeholder-gray-500',
    inputFocus: 'focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
    text: isLightTheme ? 'text-gray-700' : 'text-gray-200',
    textMuted: isLightTheme ? 'text-gray-600' : 'text-gray-400',
    textSecondary: isLightTheme ? 'text-gray-500' : 'text-gray-500',
    buttonSuccess: isLightTheme ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20',
    buttonSecondary: isLightTheme ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-black border-gray-700 text-gray-300 hover:bg-gray-800',
    errorBg: isLightTheme ? 'bg-red-50 border-red-300' : 'bg-red-500/10 border-red-500/20',
    successBg: isLightTheme ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-500/10 border-emerald-500/30',
    previewBg: isLightTheme ? 'bg-gray-50 border-gray-300 text-gray-700 placeholder-gray-400' : 'bg-black border-gray-700 text-gray-200 placeholder-gray-500',
  };

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });

  useEffect(() => {
    fetchPrompt();
  }, []);

  async function fetchPrompt() {
    try {
      setLoading(true);
      setError(null);
      const data = await api("/api/admin/settings/transformachine");
      setPrompt(data?.prompt || "");
    } catch (err) {
      setError(err?.error || err?.message || "Failed to load TransforMachine prompt");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      await api("/api/admin/settings/transformachine", {
        method: "PUT",
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      setSuccessNotification({
        isOpen: true,
        title: "TransforMachine Updated",
        message: "Manager AI reasoning prompt has been updated successfully!"
      });
    } catch (err) {
      setError(err?.error || err?.message || "Failed to save TransforMachine prompt");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`min-h-screen overflow-y-auto ${themeClasses.container} selection:bg-emerald-500/30 px-[min(4vw,16px)] md:px-[min(3vw,24px)] lg:px-[min(2vw,32px)] py-4 md:py-6 lg:pt-2 lg:pb-2 font-montserrat lg:min-h-0 lg:h-screen`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
      `}</style>
      <div className="flex flex-col gap-4">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isLightTheme ? 'hover:bg-gray-100' : 'hover:bg-[#18181B]'}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 lg:w-[18px] lg:h-[18px] ${isLightTheme ? 'text-[#334155]' : 'text-gray-400'}`}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
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
                <FaSun className={`w-5 h-5 lg:w-[18px] lg:h-[18px] text-gray-400`} />
              )}
            </button>
          </div>
        </header>

        <div className="max-w-3xl">
          <div className={`${themeClasses.card} rounded-xl border-[1.5px] p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,16px)]`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 lg:w-[min(2.5vw,44px)] lg:h-[min(2.5vw,44px)] rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow">
                <FaRobot className="w-5 h-5 lg:w-[min(1.2vw,22px)] lg:h-[min(1.2vw,22px)]" />
              </div>
              <div>
                <h2 className="text-[min(4vw,24px)] sm:text-[min(3vw,22px)] md:text-[min(1.8vw,16px)] lg:text-[1.5vw] xl:text-[1.4vw] 2xl:text-[1.3vw] font-extrabold tracking-[0.25em] text-emerald-500 uppercase">
                  TransforMachine
                </h2>
                <p className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.textMuted}`}>
                  Configure how the AI reasons when answering manager queries in the company dashboard.
                </p>
              </div>
            </div>

            <p className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] mb-4 ${themeClasses.textSecondary}`}>
              The prompt below is injected as a reasoning layer between the manager's question and the GPT response.
              It guides <strong>how</strong> the AI should analyze data, identify patterns, assess risks, and recommend actions — without changing the dashboard UI.
            </p>

            {error && (
              <div className={`mb-4 p-4 rounded-lg text-red-500 text-sm ${themeClasses.errorBg}`}>
                {error}
              </div>
            )}

            {/* Guide Section */}
            <div className={`mb-4 rounded-lg border ${isLightTheme ? 'border-emerald-200 bg-emerald-50/50' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
              <button
                onClick={() => setGuideOpen(!guideOpen)}
                className={`w-full flex items-center justify-between p-4 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] font-semibold ${isLightTheme ? 'text-emerald-800 hover:text-emerald-900' : 'text-emerald-400 hover:text-emerald-300'}`}
              >
                <span className="flex items-center gap-2">
                  <FaLightbulb className="w-4 h-4" />
                  Prompt Writing Guide
                </span>
                {guideOpen ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
              </button>
              {guideOpen && (
                <div className={`px-4 pb-4 space-y-4 text-[min(3.2vw,15px)] sm:text-[min(2.3vw,14px)] md:text-[min(1.5vw,13px)] lg:text-[min(0.85vw,13px)] ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>
                  <div className={`p-3 rounded-lg ${isLightTheme ? 'bg-emerald-100/70' : 'bg-emerald-500/10'}`}>
                    <h4 className={`flex items-center gap-2 font-bold mb-2 ${isLightTheme ? 'text-emerald-800' : 'text-emerald-400'}`}>
                      <FaDatabase className="w-3.5 h-3.5" />
                      What the AI can actually see
                    </h4>
                    <p>When a manager asks a question, the AI receives this data about their company only:</p>
                    <ul className="list-disc ml-5 mt-1 space-y-0.5">
                      <li><strong>Users</strong> — names, roles (e.g. Manager, Employee)</li>
                      <li><strong>Tests assigned</strong> — test names and their status</li>
                      <li><strong>Assignments</strong> — who took which test, status (Completed / In Progress / Assigned), CKPI score (0–100)</li>
                      <li><strong>CKPI trend</strong> — average scores over months</li>
                      <li><strong>Problem & Solution clusters</strong> — names of common issues/ideas and how many reports mention them, plus feasibility/impact ratings</li>
                    </ul>
                    <p className="mt-1">The AI has <strong>no access</strong> to individual test answers, chat messages, employee salaries, HR records, or any data outside this list.</p>
                  </div>

                  <div className={`p-3 rounded-lg ${isLightTheme ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                    <h4 className={`flex items-center gap-2 font-bold mb-2 ${isLightTheme ? 'text-amber-700' : 'text-amber-400'}`}>
                      <FaExclamationTriangle className="w-3.5 h-3.5" />
                      What to avoid
                    </h4>
                    <ul className="list-disc ml-5 space-y-0.5">
                      <li><strong>Asking for data that doesn't exist.</strong> If your prompt tells the AI to analyze "behavioral patterns," "employee engagement," "organizational culture," or "workflow bottlenecks" — the AI will <em>make up</em> answers because no such data is available.</li>
                      <li><strong>Forcing a strict response format.</strong> Avoid templates like "Step 1: X, Step 2: Y" or "Pattern → Blocker → Action." These conflict with the base Markdown format and can break chart/image generation.</li>
                      <li><strong>Word limits under 500.</strong> Managers may ask for lists of users with scores. A short word limit will cut off real data.</li>
                      <li><strong>Contradicting default behavior.</strong> The base system already says "Use ONLY the provided dataset" and "If information is missing, say so clearly." Overriding these causes hallucinations.</li>
                    </ul>
                  </div>

                  <div className={`p-3 rounded-lg ${isLightTheme ? 'bg-emerald-100/70' : 'bg-emerald-500/10'}`}>
                    <h4 className={`flex items-center gap-2 font-bold mb-2 ${isLightTheme ? 'text-emerald-800' : 'text-emerald-400'}`}>
                      <FaCheckCircle className="w-3.5 h-3.5" />
                      What works well
                    </h4>
                    <p className="mb-1">Your prompt should guide <strong>how</strong> the AI should interpret the data, not invent new data. Effective prompts:</p>
                    <ul className="list-disc ml-5 space-y-0.5">
                      <li><strong>Set analytical priorities.</strong> "When analyzing scores, prioritize recent results over old ones."</li>
                      <li><strong>Define criteria.</strong> "A good score is above 70. Flag users below 40 for attention."</li>
                      <li><strong>Customize recommendations.</strong> "When suggesting solutions, prefer ones with feasibility above 50."</li>
                      <li><strong>Add context.</strong> "Our company focuses on sales skills — emphasize sales-related problems."</li>
                      <li><strong>Reference available data only.</strong> Stick to what the AI can see (users, tests, scores, problems, solutions).</li>
                      <li><strong>Keep the response format flexible.</strong> Let the AI use Markdown freely, so charts and tables still work.</li>
                    </ul>
                  </div>

                  <div className={`p-3 rounded-lg ${isLightTheme ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                    <h4 className={`flex items-center gap-2 font-bold mb-2 ${isLightTheme ? 'text-blue-700' : 'text-blue-400'}`}>
                      <FaLightbulb className="w-3.5 h-3.5" />
                      Good vs. problematic example
                    </h4>
                    <div className="space-y-2 mt-1">
                      <div>
                        <p className="font-semibold text-red-500">Problematic prompt:</p>
                        <p className={`italic ${isLightTheme ? 'bg-white' : 'bg-black'} p-2 rounded border ${isLightTheme ? 'border-red-200' : 'border-red-500/30'} text-xs leading-relaxed`}>
                          "Analyze employee engagement and identify change blockers. Use a Pattern → Blocker → Action format. 200 words max."
                        </p>
                        <p className="text-xs mt-0.5">The AI will fabricate "engagement" analysis (no such data) and break the response format.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-500">Effective prompt:</p>
                        <p className={`italic ${isLightTheme ? 'bg-white' : 'bg-black'} p-2 rounded border ${isLightTheme ? 'border-emerald-200' : 'border-emerald-500/30'} text-xs leading-relaxed`}>
                          "When answering, highlight users with CKPI below 40 as needing support. Emphasize practical solutions with feasibility scores above 50. If historical data exists, mention trends."
                        </p>
                        <p className="text-xs mt-0.5">Guides interpretation using real data — scores, feasibility, trends — without inventing facts.</p>
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs ${isLightTheme ? 'text-gray-500' : 'text-gray-500'}`}>
                    <strong>Tip:</strong> Leave the prompt empty to use default AI behavior. The prompt only affects manager queries in the company dashboard — admin dashboard is not affected.
                  </p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={12}
                  className={`w-full p-4 border rounded-lg text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] font-mono leading-relaxed focus:outline-none ${themeClasses.inputFocus} ${themeClasses.previewBg}`}
                  placeholder="Enter reasoning instructions for the AI when answering manager queries..."
                />
                <div className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.8vw,11px)] mt-2 ${themeClasses.textSecondary}`}>
                  Character count: {prompt.length}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 px-6 py-3 lg:px-[min(1.5vw,24px)] lg:py-[min(0.55vw,10px)] rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest disabled:opacity-50 transition-colors ${themeClasses.buttonSuccess}`}
                  >
                    <FaSave className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" />
                    {saving ? "Saving..." : "Save Prompt"}
                  </button>
                  <span className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.8vw,11px)] ${themeClasses.textSecondary}`}>
                    Leave empty to disable custom reasoning (uses default AI behavior).
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <SuccessNotificationModal
        isOpen={successNotification.isOpen}
        onClose={() => setSuccessNotification({ isOpen: false, title: "", message: "" })}
        title={successNotification.title}
        message={successNotification.message}
        type={successNotification.type || "success"}
        duration={3000}
      />
    </div>
  );
}