import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import LandingPage from './pages/LandingPage';
import StudioPage from './pages/StudioPage';
import ScriptEditorPage from './pages/ScriptEditorPage';
import AvatarVoiceStudioPage from './pages/AvatarVoiceStudioPage';
import VideoRenderPage from './pages/VideoRenderPage';
import LibraryPage from './pages/LibraryPage';
import DiagnosticsPage from './pages/DiagnosticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-[#eef2f7] flex flex-col text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1 pb-16">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/studio" element={<StudioPage />} />
              <Route path="/script" element={<ScriptEditorPage />} />
              <Route path="/avatar" element={<AvatarVoiceStudioPage />} />
              <Route path="/render" element={<VideoRenderPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/diagnostics" element={<DiagnosticsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
