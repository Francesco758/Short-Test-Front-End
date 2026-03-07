// src/components/manager/EditUserModal.jsx
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

export default function EditUserModal({ isOpen, onClose, user, onUpdate, isOverUserManagement = false }) {
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
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "USER",
        function: user.function || "",
        seniorityBand: user.seniorityBand || ""
      });
      setChangePassword(false);
      setShowPassword(false);
      setError(null);
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Enter a valid email");
      setLoading(false);
      return;
    }

    if (changePassword && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        function: formData.function || null,
        seniorityBand: formData.seniorityBand || null,
      };

      if (changePassword && formData.password) {
        payload.password = formData.password;
      }

      await onUpdate(user.id, payload);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !user) return null;

  return (
    <div className={`fixed inset-0 ${isOverUserManagement ? 'z-[110]' : 'z-50'} flex items-center justify-center p-4 animate-in fade-in duration-300`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden border border-gray-800 bg-[#0f172a] flex flex-col">

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">

          {/* Left gradient panel (same as AddUserModal) */}
          <div className="hidden md:flex md:col-span-4 items-center justify-center bg-[#1e293b] p-10 border-r border-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-6 w-24 h-24 rounded-3xl bg-[#0f172a] border border-gray-700 flex items-center justify-center shadow-inner">
                <FaUser className="w-10 h-10 text-[#00f2aa]" />
              </div>

              <h3 className="text-white text-2xl font-black uppercase tracking-tighter">Edit Profile</h3>
              <p className="text-gray-500 mt-4 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Update user credentials and system permissions.
              </p>

              <div className="mt-10 space-y-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-gray-800 flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-[#00f2aa]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Profile Sync</div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">Changes reflect immediately across system.</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-gray-800 flex items-center justify-center">
                    <FaUserShield className="w-4 h-4 text-[#00f2aa]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Role Control</div>
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">Elevate or restrict access level.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side form */}
          <div className="col-span-12 md:col-span-8 bg-[#0f172a] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-8 border-b border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#1e293b] border border-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
                  <FaUser className="w-6 h-6 text-[#00f2aa]" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Modify Identity
                  </h2>
                  <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-1 text-xs">Update account details for {user.name}</p>
                </div>
              </div>

              <button
                onClick={onClose}
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
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block">
                      Full Name *
                    </label>
                    <div className="relative group">
                      <FaUser className="absolute left-4 top-4 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm"
                        placeholder="FULL NAME"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block">
                      Email Address *
                    </label>
                    <div className="relative group">
                      <FaEnvelope className="absolute left-4 top-4 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm"
                        placeholder="EMAIL@COMPANY.COM"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block">
                    System Role *
                  </label>
                  <div className="relative group">
                    <FaUserShield className="absolute left-4 top-4 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm appearance-none"
                    >
                      <option value="USER">Standard User</option>
                      <option value="COMPANY_ADMIN">Company Administrator</option>
                    </select>
                  </div>
                </div>

                {/* Toggle password */}
                <div className="flex items-center gap-5 bg-[#1e293b] p-6 rounded-2xl border border-gray-800 group hover:border-gray-700 transition-all cursor-pointer">
                  <input
                    id="pwdChange"
                    type="checkbox"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-700 text-[#00f2aa] focus:ring-[#00f2aa]/20 bg-[#0f172a]"
                  />
                  <label htmlFor="pwdChange" className="flex-1 cursor-pointer">
                    <div className="font-black text-white text-xs uppercase tracking-widest">Update Security Credentials</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                      Overwrite current password for this user
                    </div>
                  </label>
                </div>

                {/* Password field */}
                {changePassword && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block">
                      New System Password *
                    </label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-4 text-gray-600 group-focus-within:text-[#00f2aa] transition-colors" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-14 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm"
                        placeholder="MIN 6 CHARACTERS"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-4 top-4 text-gray-600 hover:text-[#00f2aa] transition-colors"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-5 h-5" />
                        ) : (
                          <FaEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Function and Seniority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block">Department</label>
                    <select
                      name="function"
                      value={formData.function}
                      onChange={handleChange}
                      className="block w-full px-5 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm appearance-none"
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
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block">Seniority Band</label>
                    <select
                      name="seniorityBand"
                      value={formData.seniorityBand}
                      onChange={handleChange}
                      className="block w-full px-5 py-4 bg-[#1e293b] border border-gray-800 rounded-2xl text-white focus:ring-2 focus:ring-[#00f2aa]/20 focus:border-[#00f2aa] transition-all font-bold text-sm appearance-none"
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

                {/* Error */}
                {error && (
                  <div className="rounded-2xl border border-red-900/50 bg-red-900/20 p-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="text-red-400 text-xs font-black uppercase tracking-widest">{error}</div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-10 py-8 border-t border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-8 py-3 border border-gray-800 text-gray-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#1e293b] hover:text-white transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-3 bg-[#00f2aa] text-[#0f172a] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#00d496] transition-all shadow-[0_0_20px_rgba(0,242,170,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaUser className="w-4 h-4" />
                    <span>Sync Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
