import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaKey, FaRobot, FaSave, FaUser, FaSun, FaMoon } from "react-icons/fa";
import { useSidebar } from '../../components/layout/AdminLayout';
import { api, getUserProfile, updateUserProfile, changeUserPassword } from "../../utils/api";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";

export default function AdminSettingsPage() {
  const { toggleSidebar, isLightTheme, toggleTheme } = useSidebar();

  // Theme-aware class helper
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
    statusBadge: isLightTheme ? 'bg-gray-200 text-gray-600' : 'bg-black text-gray-400 border-gray-700',
  };

  useEffect(() => {
  }, []);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // OpenAI settings state
  const [openAiModel, setOpenAiModel] = useState("");
  const [openAiKeyPreview, setOpenAiKeyPreview] = useState("");
  const [openAiKeyInput, setOpenAiKeyInput] = useState("");
  const [savingOpenAI, setSavingOpenAI] = useState(false);
  const [openAiError, setOpenAiError] = useState(null);
  const [openAiKeyFull, setOpenAiKeyFull] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState(null);
  
  // Success notification state
  const [successNotification, setSuccessNotification] = useState({
    isOpen: false,
    title: "",
    message: ""
  });

  // Load account info
  useEffect(() => {
    (async () => {
      try {
        const profile = await getUserProfile();
        setEmail(profile?.email || "");
        setName(profile?.name || "");
      } catch (err) {
        setAccountError(err?.error || err?.message || "Failed to load account information");
      }
    })();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation (preserved)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await changeUserPassword({ currentPassword, newPassword });

      setMessage({ type: "success", text: "Password changed successfully!" });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change failed:", error);
      setMessage({ type: "error", text: error?.error || error?.message || "Failed to change password. Please check your current password." });
    } finally {
      setLoading(false);
    }
  };

  // Fetch OpenAI settings
  useEffect(() => {
    (async () => {
      try {
        setOpenAiError(null);
        const data = await api("/api/admin/settings/openai");
        setOpenAiModel(data?.model || "");
        setOpenAiKeyPreview(data?.apiKeyPreview || "");
        setOpenAiKeyFull(data?.apiKey || "");
      } catch (err) {
        setOpenAiError(err?.error || err?.message || "Failed to load OpenAI settings");
      }
    })();
  }, []);

  async function handleSaveOpenAI() {
    try {
      setSavingOpenAI(true);
      setOpenAiError(null);
      const updated = await api("/api/admin/settings/openai", {
        method: "PUT",
        body: JSON.stringify({
          model: openAiModel,
          apiKey: openAiKeyInput || undefined
        })
      });
      setOpenAiModel(updated?.model || "");
      setOpenAiKeyPreview(updated?.apiKeyPreview || "");
      setOpenAiKeyFull(updated?.apiKey || "");
      setOpenAiKeyInput("");
      setSuccessNotification({
        isOpen: true,
        title: "OpenAI Configuration",
        message: "OpenAI configuration updated successfully!"
      });
    } catch (err) {
      setOpenAiError(err?.error || err?.message || "Failed to save OpenAI settings");
    } finally {
      setSavingOpenAI(false);
    }
  }
  
  function copyApiKey() {
    if (!openAiKeyFull) return;
    navigator.clipboard.writeText(openAiKeyFull).then(() => {
      setSuccessNotification({
        isOpen: true,
        title: "API Key Copied",
        message: "API key copied to clipboard successfully!"
      });
    });
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Account Information Section */}
          <section className="flex flex-col gap-4">
            <div className={`${themeClasses.card} rounded-xl border-[1.5px] p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)]`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-11 h-11 lg:w-[min(2.5vw,44px)] lg:h-[min(2.5vw,44px)] rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow">
                  <FaUser className="w-5 h-5 lg:w-[min(1.2vw,22px)] lg:h-[min(1.2vw,22px)]" />
                </div>
                <div>
                  <h2 className="text-[min(4vw,24px)] sm:text-[min(3vw,22px)] md:text-[min(1.8vw,16px)] lg:text-[1.5vw] xl:text-[1.4vw] 2xl:text-[1.3vw] font-extrabold tracking-[0.25em] text-emerald-500 uppercase">
                    Account Information
                  </h2>
                  <p className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.textMuted}`}>Manage your profile and security settings</p>
                </div>
              </div>

              {accountError && (
                <div className={`mb-4 p-4 rounded-lg text-red-500 text-sm ${themeClasses.errorBg}`}>
                  {accountError}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setAccountSaving(true);
                    setAccountError(null);
                    const updated = await updateUserProfile({ email: email.trim(), name: name.trim() });
                    setEmail(updated?.email || email);
                    setName(updated?.name || name);
                  } catch (err) {
                    setAccountError(err?.error || err?.message || "Failed to update account");
                  } finally {
                    setAccountSaving(false);
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`mt-2 w-full rounded-lg border px-4 py-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] focus:outline-none ${themeClasses.input} ${themeClasses.inputFocus}`}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-2 w-full rounded-lg border px-4 py-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] focus:outline-none ${themeClasses.input} ${themeClasses.inputFocus}`}
                    placeholder="admin@company.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={accountSaving}
                    className={`inline-flex items-center gap-2 px-4 py-3 lg:px-[min(1vw,16px)] lg:py-[min(0.55vw,10px)] rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest disabled:opacity-50 transition-colors ${themeClasses.buttonSuccess}`}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Settings Column */}
          <section className="flex flex-col gap-4">
            <div className={`${themeClasses.card} rounded-xl border-[1.5px] p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)]`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-11 h-11 lg:w-[min(2.5vw,44px)] lg:h-[min(2.5vw,44px)] rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow">
                  <FaKey className="w-5 h-5 lg:w-[min(1.2vw,22px)] lg:h-[min(1.2vw,22px)]" />
                </div>
                <div>
                  <h2 className="text-[min(4vw,24px)] sm:text-[min(3vw,22px)] md:text-[min(1.8vw,16px)] lg:text-[1.5vw] xl:text-[1.4vw] 2xl:text-[1.3vw] font-extrabold tracking-[0.25em] text-emerald-500 uppercase">
                    Change Password
                  </h2>
                  <p className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.textMuted}`}>Update your password regularly to keep your account secure.</p>
                </div>
              </div>

              {message.text && (
                <div className={`mb-6 rounded-lg p-3 border text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${message.type === "success" ? themeClasses.successBg + ' text-emerald-600' : themeClasses.errorBg + ' text-red-500'}`}>
                  <div>{message.text}</div>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label htmlFor="currentPassword" className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>Current Password</label>
                  <div className="relative mt-2">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] focus:outline-none pr-10 ${themeClasses.input} ${themeClasses.inputFocus}`}
                      placeholder="Enter your current password"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((s) => !s)}
                      aria-label="Toggle current password visibility"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${themeClasses.textSecondary} hover:${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}
                      disabled={loading}
                    >
                      {showCurrentPassword ? <FaEyeSlash className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" /> : <FaEye className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>New Password</label>
                  <div className="relative mt-2">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] focus:outline-none pr-10 ${themeClasses.input} ${themeClasses.inputFocus}`}
                      placeholder="Enter new password (min. 6 characters)"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((s) => !s)}
                      aria-label="Toggle new password visibility"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${themeClasses.textSecondary} hover:${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}
                      disabled={loading}
                    >
                      {showNewPassword ? <FaEyeSlash className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" /> : <FaEye className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>Confirm New Password</label>
                  <div className="relative mt-2">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] focus:outline-none pr-10 ${themeClasses.input} ${themeClasses.inputFocus}`}
                      placeholder="Confirm your new password"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      aria-label="Toggle confirm password visibility"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${themeClasses.textSecondary} hover:${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" /> : <FaEye className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex items-center justify-center gap-3 rounded-xl px-4 py-3 lg:px-[min(1vw,16px)] lg:py-[min(0.55vw,10px)] text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${themeClasses.buttonSuccess}`}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block" />
                        <span>Changing Password...</span>
                      </>
                    ) : (
                      <>
                        <FaKey className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* OpenAI Settings */}
            <div className={`${themeClasses.card} rounded-xl border-[1.5px] p-[min(4vw,16px)] md:p-[min(3vw,20px)] lg:p-[min(0.8vw,12px)]`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-11 h-11 lg:w-[min(2.5vw,44px)] lg:h-[min(2.5vw,44px)] rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow">
                  <FaRobot className="w-5 h-5 lg:w-[min(1.2vw,22px)] lg:h-[min(1.2vw,22px)]" />
                </div>
                <div>
                  <h2 className="text-[min(4vw,24px)] sm:text-[min(3vw,22px)] md:text-[min(1.8vw,16px)] lg:text-[1.5vw] xl:text-[1.4vw] 2xl:text-[1.3vw] font-extrabold tracking-[0.25em] text-emerald-500 uppercase">
                    OpenAI Configuration
                  </h2>
                  <p className={`text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.textMuted}`}>Manage API key and default model used by the system.</p>
                </div>
              </div>
              {openAiError && (
                <div className={`mb-4 p-3 rounded-lg text-red-500 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,12px)] ${themeClasses.errorBg}`}>{openAiError}</div>
              )}
              <div className="space-y-5">
                <div>
                  <label className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>Default Model</label>
                  <div className="relative mt-2">
                    <input
                      value={openAiModel}
                      onChange={(e) => setOpenAiModel(e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] focus:outline-none ${themeClasses.input} ${themeClasses.inputFocus}`}
                      placeholder="e.g., gpt-4o-mini"
                    />
                  </div>
                </div>
                <div>
                  <label className={`text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-medium ${isLightTheme ? 'text-gray-700' : 'text-gray-300'}`}>API Key</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      value={openAiKeyInput}
                      onChange={(e) => setOpenAiKeyInput(e.target.value)}
                      className={`flex-1 rounded-lg border px-4 py-3 text-[min(3.5vw,16px)] sm:text-[min(2.5vw,15px)] md:text-[min(1.6vw,14px)] lg:text-[min(0.9vw,14px)] focus:outline-none ${themeClasses.input} ${themeClasses.inputFocus}`}
                      placeholder={openAiKeyPreview ? `Current: ${openAiKeyPreview}` : "Enter new API key"}
                    />
                    <button
                      onClick={handleSaveOpenAI}
                      disabled={savingOpenAI}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 lg:px-[min(1vw,16px)] lg:py-[min(0.55vw,10px)] rounded-xl text-[min(3.5vw,14px)] sm:text-[min(2.5vw,13px)] md:text-[min(1.6vw,12px)] lg:text-[min(0.9vw,12px)] font-black uppercase tracking-widest disabled:opacity-50 transition-colors ${themeClasses.buttonSuccess}`}
                    >
                      <FaSave className="w-4 h-4 lg:w-[min(0.8vw,16px)] lg:h-[min(0.8vw,16px)]" />
                      Save
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.8vw,11px)] font-mono rounded px-2 py-1 ${themeClasses.statusBadge}`}>****</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!openAiKeyFull) return;
                        navigator.clipboard.writeText(openAiKeyFull).then(() => {
                          setSuccessNotification({
                            isOpen: true,
                            title: "API Key Copied",
                            message: "API key copied to clipboard successfully!"
                          });
                        });
                      }}
                      className={`text-[min(3vw,12px)] sm:text-[min(2.2vw,11px)] md:text-[min(1.4vw,11px)] lg:text-[min(0.8vw,11px)] px-2 py-1 rounded transition-colors ${themeClasses.buttonSecondary}`}
                    >
                      Copy current key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
