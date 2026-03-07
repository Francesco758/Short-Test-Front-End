import React, { useState, useEffect } from "react";
import AOS from 'aos';
import { FaEye, FaEyeSlash, FaKey, FaRobot, FaSave } from "react-icons/fa";
import { api, getUserProfile, updateUserProfile, changeUserPassword } from "../../utils/api";
import SuccessNotificationModal from "../../models/SuccessNotificationModal";

export default function AdminSettingsPage() {
  useEffect(() => {
    AOS.refresh();
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Manage account information and security settings for your administrator account.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              <p className="text-sm text-gray-500">Update your name and email.</p>
            </div>
            {accountError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{accountError}</div>
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
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@company.com"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={accountSaving}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </section>
        {/* Settings form */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-600 to-green-500 flex items-center justify-center text-white shadow">
                <FaKey className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Update your password regularly to keep your account secure.</p>
              </div>
            </div>

            {message.text && (
              <div className={`mb-6 rounded-lg p-3 border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                <div className="text-sm">{message.text}</div>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</label>
                <div className="relative mt-2">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-10"
                    placeholder="Enter your current password"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((s) => !s)}
                    aria-label="Toggle current password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showCurrentPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative mt-2">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-10"
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    aria-label="Toggle new password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative mt-2">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-10"
                    placeholder="Confirm your new password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    aria-label="Toggle confirm password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      <span>Changing Password...</span>
                    </>
                  ) : (
                    <>
                      <FaKey className="w-4 h-4" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-sm text-gray-500">Tip: Use a passphrase or a password manager for stronger security.</div>
            </form>

            
          </div>

          {/* OpenAI Settings */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow">
                <FaRobot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">OpenAI Configuration</h2>
                <p className="text-sm text-gray-500">Manage API key and default model used by the system.</p>
              </div>
            </div>
            {openAiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{openAiError}</div>
            )}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">Default Model</label>
                <div className="relative mt-2">
                  <input
                    value={openAiModel}
                    onChange={(e) => setOpenAiModel(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., gpt-4o-mini"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for completions, streaming, and evaluations.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">API Key</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    value={openAiKeyInput}
                    onChange={(e) => setOpenAiKeyInput(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={openAiKeyPreview ? `Current: ${openAiKeyPreview}` : "Enter new API key"}
                  />
                  <button
                    onClick={handleSaveOpenAI}
                    disabled={savingOpenAI}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300"
                  >
                    <FaSave className="w-4 h-4" />
                    Save
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-mono bg-gray-100 text-gray-800 border border-gray-200 rounded px-2 py-1">****</span>
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
                    className="text-xs px-2 py-1 rounded bg-gray-900 text-white hover:bg-black"
                  >
                    Copy current key
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Stored securely in the database. Display is masked, but you can copy the current key.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Success Notification Modal */}
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
