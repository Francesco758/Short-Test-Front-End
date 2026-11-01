const BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Core API function

function fullUrl(path) {
  if (path.startsWith('http')) return path;
  
  const normalizedBase = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  if (normalizedBase.includes('/api') && normalizedPath.startsWith('/api')) {
    const cleanPath = normalizedPath.replace(/^\/api/, '');
    return `${normalizedBase}${cleanPath}`;
  }
  
  return `${normalizedBase}${normalizedPath}`;
}

// Core API function
export async function api(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = fullUrl(path);
  console.log('🔄 API Request:', url, opts.method || 'GET');

  const response = await fetch(url, { ...opts, headers });

  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch {
    if (!response.ok) throw { error: 'Network error' };
    return null;
  }

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || payload?.retryAfter || null;
      const msg = retryAfter
        ? `Too many requests. Please wait ${retryAfter} before trying again.`
        : (payload?.error || 'Too many requests. Please wait before trying again.');
      throw { error: msg, status: 429, retryAfter };
    }
    const err = payload?.error || payload?.message || payload || { error: 'unknown' };
    throw err;
  }
  return payload;
}

/**
 * POST JSON and consume a Server-Sent-Events (SSE) response body.
 * Calls `onEvent({ type, data })` for each parsed event (`meta`, `chunk`, `done`, `error`).
 * Resolves with the `done` payload, or throws if an `error` event / non-OK status is received.
 * Supports an AbortSignal so the Stop button can cancel the stream.
 */
export async function apiStream(path, { body, signal, onEvent } = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = fullUrl(path);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body || {}),
      signal
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw { error: 'Network error while streaming' };
  }

  if (!response.ok || !response.body) {
    let payload = null;
    try { payload = await response.json(); } catch { payload = null; }
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || payload?.retryAfter || null;
      throw { error: retryAfter ? `Too many requests. Please wait ${retryAfter} before trying again.` : 'Too many requests. Please wait before trying again.', status: 429, retryAfter };
    }
    throw payload || { error: `Request failed (${response.status})` };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const dispatch = (type, data) => {
    if (typeof onEvent === 'function') onEvent({ type, data });
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by blank lines; each field line is `event:` or `data:`.
    let sepIdx;
    while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);

      let eventType = 'message';
      let dataStr = '';
      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith('event:')) eventType = line.slice(6).trim();
        else if (line.startsWith('data:')) dataStr += (dataStr ? '\n' : '') + line.slice(5).trim();
      }
      if (!dataStr) continue;

      let data;
      try { data = JSON.parse(dataStr); } catch { data = dataStr; }

      if (eventType === 'error') {
        throw { error: data?.error || 'Failed to get response' };
      }
      dispatch(eventType, data);
      if (eventType === 'done') return data;
    }
  }

  // Stream ended without a done event
  throw { error: 'Stream ended unexpectedly' };
}

// ==================== USER API ENDPOINTS ====================

// Profile Management
export async function getUserProfile() {
  return api('/api/user/profile');
}

export async function updateUserProfile(profileData) {
  return api('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
}

export async function changeUserPassword(passwordData) {
  return api('/api/user/profile/change-password', {
    method: 'POST',
    body: JSON.stringify(passwordData)
  });
}

// Test Management
export async function getAssignedTests() {
  return api('/api/user/tests/assigned');
}

export async function startUserTest(userTestId) {
  return api(`/api/user/tests/${userTestId}/start`, {
    method: 'POST'
  });
}

export async function submitTestAnswer(userTestId, answerData) {
  return api(`/api/user/tests/${userTestId}/answer`, {
    method: 'POST',
    body: JSON.stringify(answerData)
  });
}

export async function finishUserTest(userTestId) {
  return api(`/api/user/tests/${userTestId}/finish`, {
    method: 'POST'
  });
}

// ==================== CONVERSATION API ENDPOINTS ====================

// Start conversation for user test
export async function startUserTestConversation(userTestId) {
  return api('/api/conversation/start-user-test', {
    method: 'POST',
    body: JSON.stringify({ userTestId })
  });
}

// Send message to user test conversation (for auto-advance)
export async function sendUserTestMessage({ userTestId, stepIndex, optionKey, openText }) {
  return api('/api/conversation/message-user-test', {
    method: 'POST',
    body: JSON.stringify({
      userTestId,
      stepIndex,
      optionKey,
      openText
    })
  });
}

// Get current test attempt status
export async function getTestAttemptStatus(userTestId) {
  return api(`/api/user/tests/${userTestId}/status`);
}

// ==================== STREAMING API ====================

// Legacy streaming function (kept for compatibility)
export async function sendMessageStream({ userTestId, stepIndex, optionKey, openText, onChunk, onComplete, onError }) {
  try {
    // Use conversation endpoint for GPT integration
    const result = await sendUserTestMessage({
      userTestId,
      stepIndex,
      optionKey,
      openText
    });

    // Simulate streaming for better UX
    if (result.gptReply) {
      let accumulatedText = '';
      const words = result.gptReply.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        accumulatedText += (i === 0 ? '' : ' ') + words[i];
        onChunk?.(words[i], accumulatedText);
        
        // Small delay to simulate streaming
        if (i < words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
      
      onComplete?.(accumulatedText);
    } else {
      onComplete?.();
    }
    
    return result;
  } catch (error) {
    console.error('Stream error:', error);
    onError?.(error);
    throw error;
  }
}

// ==================== ADMIN API ENDPOINTS ====================

export async function startConversation(body = {}) {
  return api('/api/conversation/start', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function finishTest(testId) {
  return api(`/api/tests/${testId}/finish`, {
    method: 'POST'
  });
}

export async function generateReport(testId) {
  return api('/api/report/generate', {
    method: 'POST',
    body: JSON.stringify({ testId })
  });
}