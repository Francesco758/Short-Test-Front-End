// src/utils/auth.js
export function saveAuth({ token, user }) {
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('userRole', (user?.role || 'USER').toUpperCase());
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
