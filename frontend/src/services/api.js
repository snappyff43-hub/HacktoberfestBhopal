/**
 * CreatorFlow AI API Client
 * Centralized service layer connecting React frontend to FastAPI backend.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorDetail = 'API request failed';
      try {
        const errorData = await res.json();
        errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorDetail);
    }

    return await res.json();
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

export const api = {
  // System Health & Diagnostics
  getHealth: () => request('/health'),
  getAIStatus: () => request('/ai/status'),
  getGeminiStatus: () => request('/gemini/status'),
  getHeyGenStatus: () => request('/heygen/status'),

  // HeyGen Catalogs
  getAvatars: () => request('/heygen/avatars'),
  getVoices: () => request('/heygen/voices'),

  // Script & Content Generation
  generateContent: (data) =>
    request('/content/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  regenerateContent: (data) =>
    request('/content/regenerate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  improveWithGemini: (data) =>
    request('/content/improve-with-gemini', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Projects & Scripts
  listProjects: () => request('/projects'),
  getProject: (projectId) => request(`/projects/${projectId}`),
  createProject: (data) =>
    request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteProject: (projectId) =>
    request(`/projects/${projectId}`, {
      method: 'DELETE',
    }),
  updateScript: (projectId, data) =>
    request(`/projects/${projectId}/script`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // HeyGen Video Generation & Monitoring
  generateVideo: (data) =>
    request('/heygen/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getVideoJobStatus: (jobId) => request(`/heygen/status/${jobId}`),

  // Video Library
  getLibrary: () => request('/library'),
};

export default api;
