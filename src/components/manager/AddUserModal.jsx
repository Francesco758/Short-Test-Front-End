import React, { useState, useEffect } from "react";
import {
  FaXmark,
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa6";

/**
 * AddUserModal — ImpressiveDashboard UI (Tailwind)
 * Preserves all functionality from the original version.
 *
 * Props:
 * - isOpen, onClose, onCreate (callback), companyId (unused visually), addUser (async function)
 *
 * Notes:
 * - Icons imported from react-icons/fa6 for reliable FontAwesome v6 icons.
 * - Accessibility: backdrop click closes modal; Escape key also closes.
 * - Responsive: single-column on mobile, two-column decorative panel + form on md+.
 */

export default function AddUserModal({
  isOpen,
  onClose,
  onCreate = () => {},
  companyId,
  addUser,
  isOverUserManagement = false,
  theme = "dark",
}) {
  const isLightTheme = theme === "light";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    function: "",
    seniorityBand: "",
    dateOfBirth: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
        function: "",
        seniorityBand: "",
        dateOfBirth: ""
      });
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        function: formData.function || null,
        seniorityBand: formData.seniorityBand || null,
        dateOfBirth: formData.dateOfBirth || null,
      };

      const created = await addUser(userData);
      onCreate(created);
      onClose();
    } catch (err) {
      setError(err?.message || "Unable to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${isOverUserManagement ? 'z-[100]' : 'z-50'} flex items-center justify-center p-4`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-user-title"
    >
      <div
        className={`absolute inset-0 ${isLightTheme ? 'bg-black/60' : 'bg-black/70'}`}
        onClick={handleClose}
      />
      <div className={`relative w-full max-w-xl max-h-[90vh] rounded-xl border ${isLightTheme ? 'border-emerald-700 bg-white shadow-[0_0_0_1px_#047857]' : 'border-emerald-500 bg-[#09090B] shadow-[0_0_0_1px_#047857]'} flex flex-col`}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${isLightTheme ? 'border-gray-200' : 'border-[#1e2736]'} flex-shrink-0`}>
          <h2 id="add-user-title" className={`text-lg font-semibold ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>Add user</h2>
          <button
            onClick={handleClose}
            className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-md ${isLightTheme ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[#1e2736] text-gray-300 hover:bg-[#2a364a]'}`}
          >
            Chiudi
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
          <style>{`
            ${isLightTheme ? `
            input, select, textarea { background-color: #ffffff !important; color: #111827 !important; border-color: #d1d5db !important; }
            ::placeholder { color: #9ca3af !important; }
            select option { background-color: #ffffff; color: #111827; }
            input:-webkit-autofill,
            select:-webkit-autofill,
            textarea:-webkit-autofill {
              -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
              box-shadow: 0 0 0px 1000px #ffffff inset !important;
              -webkit-text-fill-color: #111827 !important;
              caret-color: #111827;
            }` : `
            input, select, textarea { background-color: #0f1623 !important; color: #e5e7eb !important; }
            ::placeholder { color: #6b7280 !important; }
            select option { background-color: #0f1623; color: #e5e7eb; }
            input:-webkit-autofill,
            select:-webkit-autofill,
            textarea:-webkit-autofill {
              -webkit-box-shadow: 0 0 0px 1000px #0f1623 inset !important;
              box-shadow: 0 0 0px 1000px #0f1623 inset !important;
              -webkit-text-fill-color: #e5e7eb !important;
              caret-color: #e5e7eb;
            }`}
          `}</style>
          <div>
            <label className={`block text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} mb-2`}>Name / surname or pseudonym</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alex Rossi"
              disabled={loading}
              className={`w-full px-4 py-3 ${isLightTheme ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#0f1623] border-[#1e2736] text-gray-200 placeholder-gray-500'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none`}
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} mb-2`}>System role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-3 ${isLightTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0f1623] border-[#1e2736] text-gray-200'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none`}
            >
              <option value="USER">user</option>
              <option value="COMPANY_ADMIN">company admin</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} mb-2`}>Function</label>
            <select
              name="function"
              value={formData.function}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-3 ${isLightTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0f1623] border-[#1e2736] text-gray-200'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none`}
            >
              <option value="">Select</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Engineering">Engineering</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Management">Management</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} mb-2`}>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@company.com"
              disabled={loading}
              className={`w-full px-4 py-3 ${isLightTheme ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#0f1623] border-[#1e2736] text-gray-200 placeholder-gray-500'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none`}
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} mb-2`}>Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                disabled={loading}
                className={`w-full px-4 py-3 ${isLightTheme ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#0f1623] border-[#1e2736] text-gray-200 placeholder-gray-500'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12 appearance-none`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLightTheme ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} mb-2`}>Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-3 ${isLightTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0f1623] border-[#1e2736] text-gray-200'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium ${isLightTheme ? 'text-gray-600' : 'text-gray-500'} mb-2`}>Seniority</label>
              <select
                name="seniorityBand"
                value={formData.seniorityBand}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-4 py-3 ${isLightTheme ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0f1623] border-[#1e2736] text-gray-200'} border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none`}
              >
                <option value="">Select</option>
                <option value="Intern">Intern</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
                <option value="VP">VP</option>
                <option value="CxO">CxO</option>
              </select>
            </div>
          </div>

          {error && (
            <div className={`border px-3 py-2 rounded-md text-sm ${isLightTheme ? 'border-red-200 bg-red-50 text-red-600' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
              {error}
            </div>
          )}
        </form>
        <div className={`px-6 py-4 border-t flex-shrink-0 ${isLightTheme ? 'border-gray-200 bg-gray-50' : 'border-[#1e2736] bg-[#0f1623]'}`}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.password}
            className={`w-full px-5 py-3 font-bold uppercase tracking-widest rounded-md ${
              (loading || !formData.name.trim() || !formData.email.trim() || !formData.password)
                ? (isLightTheme ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#1f2937] text-gray-500 cursor-not-allowed')
                : (isLightTheme ? 'bg-[#17be8e] text-white hover:bg-[#15a87d]' : 'bg-emerald-500 text-[#0a0e14] hover:bg-emerald-600')
            }`}
          >
            Save user
          </button>
        </div>
      </div>
    </div>
  );
}
