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
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    function: "",
    seniorityBand: ""
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
        seniorityBand: ""
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
      className={`fixed inset-0 ${isOverUserManagement ? 'z-[110]' : 'z-50'} flex items-center justify-center p-4 animate-in fade-in duration-300`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-user-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden border border-gray-800 bg-[#0f172a] flex flex-col">

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Decorative left panel (md+) */}
          <div className="hidden md:flex md:col-span-4 items-center justify-center bg-[#1e293b] p-10 border-r border-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-6 w-24 h-24 rounded-3xl bg-[#0f172a] border border-gray-700 flex items-center justify-center shadow-inner">
                <FaUser className="w-10 h-10 text-[#00f2aa]" />
              </div>
              <h3 className="text-white text-2xl font-black uppercase tracking-tighter">Add Member</h3>
              <p className="text-gray-500 mt-4 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Onboard new talent to your team cockpit.
              </p>

              {/* Mini quick info */}
              <div className="mt-10 space-y-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0f172a] border border-gray-800 flex items-center justify-center">
                    <FaUserShield className="w-4 h-4 text-[#00f2aa]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Secure Access</div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">Role-based permissions enabled.</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0f172a] border border-gray-800 flex items-center justify-center">
                    <FaEnvelope className="w-4 h-4 text-[#00f2aa]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Instant Invite</div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">Automated welcome emails.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form area */}
          <div className="col-span-12 md:col-span-8 bg-[#0f172a] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-8 border-b border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#1e293b] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
                  <FaUserShield className="w-6 h-6 text-[#00f2aa]" />
                </div>
                <div>
                  <h2 id="add-user-title" className="text-2xl font-black text-white uppercase tracking-tighter">
                    User Profile
                  </h2>
                  <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-1 text-xs">Configure identity and system access</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close"
                className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all group"
              >
                <FaXmark className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="space-y-3">
                    <label htmlFor="name" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                      Full name *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="h-4 w-4 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm"
                        placeholder="JOHN DOE"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-3">
                    <label htmlFor="role" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                      System Role *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUserShield className="h-4 w-4 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
                      </div>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm appearance-none"
                        disabled={loading}
                      >
                        <option value="USER">Standard User</option>
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="COMPANY_ADMIN">Company Administrator</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label htmlFor="email" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                    Email address *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="h-4 w-4 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm"
                      placeholder="USER@COMPANY.COM"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Function and Seniority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Department</label>
                    <select
                      name="function"
                      value={formData.function}
                      onChange={handleChange}
                      className="block w-full px-5 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm appearance-none"
                      disabled={loading}
                    >
                      <option value="">Select Function</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Seniority Band</label>
                    <select
                      name="seniorityBand"
                      value={formData.seniorityBand}
                      onChange={handleChange}
                      className="block w-full px-5 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm appearance-none"
                      disabled={loading}
                    >
                      <option value="">Select Level</option>
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

                {/* Password */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                    System Password *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="h-4 w-4 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-14 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm"
                      placeholder="MIN 6 CHARACTERS"
                      required
                      disabled={loading}
                      minLength="6"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-[#00f2aa] transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error message (card) */}
                {error && (
                  <div className="rounded-2xl border border-red-900/50 bg-red-900/20 p-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-4">
                      <div className="text-red-500">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-black text-red-400 uppercase tracking-widest">{error}</div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer actions */}
            <div className="px-10 py-8 border-t border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-8 py-3 border border-gray-800 text-gray-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#1e293b] hover:text-white transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !formData.name.trim() ||
                  !formData.email.trim() ||
                  !formData.password
                }
                className="px-10 py-3 bg-[#00f2aa] text-[#0f172a] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#00d496] transition-all shadow-[0_0_20px_rgba(0,242,170,0.2)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaUser className="w-4 h-4" />
                    <span>Deploy User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div> {/* end grid */}
      </div>
    </div>
  );
}
