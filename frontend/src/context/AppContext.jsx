import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentProjectId, setCurrentProjectId] = useState(() => {
    const saved = localStorage.getItem('creatorflow_active_project_id');
    return saved ? parseInt(saved, 10) : 1; // Default to project 1 if present
  });

  const [currentProject, setCurrentProject] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [loadingProject, setLoadingProject] = useState(false);

  // System Diagnostics status
  const [systemStatus, setSystemStatus] = useState({
    ollama: { status: 'checking', model: 'gemma4:e2b-it-qat' },
    gemini: { status: 'checking', model: 'gemini-flash-lite' },
    nvidia: { status: 'checking', model: 'meta/llama-3.3-70b-instruct' },
    heygen: { status: 'checking', user_id: '49b2360538cb4c23a8161b932db87016' },
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all projects
  const refreshProjectsList = useCallback(async () => {
    try {
      const projects = await api.listProjects();
      setProjectsList(projects);
      if (projects.length > 0 && !currentProjectId) {
        setCurrentProjectId(projects[0].id);
      }
      return projects;
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      return [];
    }
  }, [currentProjectId]);

  // Fetch active project
  const refreshCurrentProject = useCallback(async (projectId = currentProjectId) => {
    if (!projectId) return null;
    setLoadingProject(true);
    try {
      const project = await api.getProject(projectId);
      setCurrentProject(project);
      localStorage.setItem('creatorflow_active_project_id', projectId.toString());
      return project;
    } catch (err) {
      console.warn(`Project ${projectId} not found or error:`, err);
      return null;
    } finally {
      setLoadingProject(false);
    }
  }, [currentProjectId]);

  // Check system health
  const checkAllSystemHealth = useCallback(async () => {
    try {
      const [aiRes, geminiRes, nvidiaRes, heygenRes] = await Promise.allSettled([
        api.getAIStatus(),
        api.getGeminiStatus(),
        api.getNvidiaStatus(),
        api.getHeyGenStatus(),
      ]);

      setSystemStatus({
        ollama: {
          status: aiRes.status === 'fulfilled' && aiRes.value.ollama_connected ? 'online' : 'offline',
          model: aiRes.status === 'fulfilled' ? aiRes.value.configured_model : 'gemma4:e2b-it-qat',
          details: aiRes.status === 'fulfilled' ? aiRes.value : null,
        },
        gemini: {
          status: geminiRes.status === 'fulfilled' && (geminiRes.value.status === 'configured' || geminiRes.value.authenticated) ? 'online' : 'offline',
          model: geminiRes.status === 'fulfilled' ? (geminiRes.value.active_model || 'gemini-3.8-flash') : 'gemini-flash-lite',
          details: geminiRes.status === 'fulfilled' ? geminiRes.value : null,
        },
        nvidia: {
          status: nvidiaRes.status === 'fulfilled' && nvidiaRes.value.configured ? 'online' : (nvidiaRes.status === 'fulfilled' && nvidiaRes.value.status === 'not_configured' ? 'unconfigured' : 'offline'),
          model: nvidiaRes.status === 'fulfilled' ? nvidiaRes.value.active_model : 'meta/llama-3.3-70b-instruct',
          details: nvidiaRes.status === 'fulfilled' ? nvidiaRes.value : null,
        },
        heygen: {
          status: heygenRes.status === 'fulfilled' && (heygenRes.value.status === 'configured' || heygenRes.value.authenticated) ? 'online' : 'offline',
          details: heygenRes.status === 'fulfilled' ? heygenRes.value : null,
        },
      });
    } catch (err) {
      console.error('System health check error:', err);
    }
  }, []);

  // Initialize
  useEffect(() => {
    checkAllSystemHealth();
    refreshProjectsList().then((projects) => {
      if (projects.length > 0) {
        const idToLoad = currentProjectId || projects[0].id;
        refreshCurrentProject(idToLoad);
      }
    });
  }, []);

  const selectProject = (id) => {
    setCurrentProjectId(id);
    refreshCurrentProject(id);
  };

  const createNewProject = async (data) => {
    try {
      const res = await api.createProject(data);
      addToast(`New project created: ${res.title}`, 'success');
      await refreshProjectsList();
      selectProject(res.id);
      return res;
    } catch (err) {
      addToast(`Failed to create project: ${err.message}`, 'error');
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentProjectId,
        currentProject,
        setCurrentProject,
        projectsList,
        loadingProject,
        selectProject,
        refreshCurrentProject,
        refreshProjectsList,
        createNewProject,
        systemStatus,
        checkAllSystemHealth,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
