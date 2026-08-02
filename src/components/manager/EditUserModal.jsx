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

export default function EditUserModal({ isOpen, onClose, user, onUpdate }) {
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
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "USER",
        function: user.function || "",
        seniorityBand: user.seniorityBand || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : ""
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
        dateOfBirth: formData.dateOfBirth || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto overflow-x-hidden transition-all bg-white">

        <div className="grid grid-cols-1 md:grid-cols-12">

          {/* Left gradient panel (same as AddUserModal) */}
          <div className="hidden md:flex md:col-span-5 items-center justify-center bg-gradient-to-b from-indigo-600 via-violet-600 to-indigo-500 p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center shadow-lg backdrop-blur-sm">
                <FaUser className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-white text-xl font-semibold">Edit User</h3>
              <p className="text-indigo-100 mt-2 text-sm">
                Modify account details and roles instantly.
              </p>

              <div className="mt-6 space-y-3 text-left text-sm text-indigo-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Profile Updates</div>
                    <div className="opacity-90">Change personal details anytime.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <FaUserShield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Role Management</div>
                    <div className="opacity-90">
                      Easily assign admin privileges.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side form */}
          <div className="col-span-12 md:col-span-7 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FaUser className="w-6 h-6 text-indigo-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Edit User
                  </h2>
                  <p className="text-sm text-gray-500">Update user details</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaXmark className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Full Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 shadow-sm"
                    placeholder="Full Name"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 shadow-sm"
                    placeholder="example@mail.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Toggle password */}
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <input
                  id="pwdChange"
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="h-4 w-4 text-indigo-600"
                />
                <label htmlFor="pwdChange" className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">Change Password</div>
                  <div className="text-sm text-gray-500">
                    Set a new password for this user
                  </div>
                </label>
              </div>

              {/* Password field */}
              {changePassword && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">
                    New Password *
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 shadow-sm"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
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

              {/* Role */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Role *
                </label>
                <div className="relative">
                  <FaUserShield className="absolute left-3 top-3.5 text-gray-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
                  >
                    <option value="USER">User</option>
                    <option value="COMPANY_ADMIN">Company Admin</option>
                  </select>
                </div>
              </div>

              {/* Function and Seniority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Function</label>
                  <select
                    name="function"
                    value={formData.function}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
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
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Seniority</label>
                  <select
                    name="seniorityBand"
                    value={formData.seniorityBand}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
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

              {/* Date of Birth */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-white flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto flex-1 px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto flex-1 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaUser className="w-4 h-4" />
                    Update User
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
