import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import CreditSafetyModal from '../components/CreditSafetyModal';
import { 
  Video, 
  Play, 
  Download, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Film,
  Share2,
  FileText
} from 'lucide-react';

export default function VideoRenderPage() {
  const navigate = useNavigate();
  const { currentProject, refreshCurrentProject, addToast } = useApp();

  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  // Sync latest video job
  useEffect(() => {
    if (currentProject?.latest_video_job) {
      setActiveJob(currentProject.latest_video_job);
      if (['pending', 'processing'].includes(currentProject.latest_video_job.status)) {
        startPolling(currentProject.latest_video_job.id);
      }
    }
  }, [currentProject]);

  const startPolling = (jobId) => {
    if (pollInterval) clearInterval(pollInterval);
    const interval = setInterval(async () => {
      try {
        const job = await api.getVideoJobStatus(jobId);
        setActiveJob(job);
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
          setRendering(false);
          refreshCurrentProject();
          if (job.status === 'completed') {
            addToast('🎉 HeyGen video rendering completed!', 'success');
          } else {
            addToast(`Video rendering failed: ${job.error_message || 'Unknown error'}`, 'error');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 4000);
    setPollInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  const handleStartRender = async () => {
    if (!currentProject) return;
    setRendering(true);
    try {
      const res = await api.generateVideo({
        project_id: currentProject.id,
        avatar_id: currentProject.selected_avatar_id || 'ee25a2363ef941a1b5b0f7b1172e57d1',
        avatar_name: currentProject.selected_avatar_name || 'Dante Office 2',
        voice_id: currentProject.selected_voice_id || '31001ed1e3e54c79a88458cb03ca123a',
        voice_name: currentProject.selected_voice_name || 'Leanne',
        aspect_ratio: currentProject.aspect_ratio || '16:9',
        user_confirmed: true, // Safety gate passed
      });

      setSafetyModalOpen(false);
      addToast(res.message || 'Render job dispatched to HeyGen V3!', 'success');
      startPolling(res.job_id);
      await refreshCurrentProject();
    } catch (err) {
      setRendering(false);
      addToast(`HeyGen generation error: ${err.message}`, 'error');
    }
  };

  const scriptReady = currentProject?.latest_script?.script?.length > 10;
  const avatarReady = Boolean(currentProject?.selected_avatar_id || currentProject?.selected_avatar_name);
  const voiceReady = Boolean(currentProject?.selected_voice_id || currentProject?.selected_voice_name);
  const allReady = scriptReady;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full nm-pill text-xs font-bold text-indigo-700 mb-2">
            <Film className="w-3.5 h-3.5 text-indigo-500" />
            <span>HeyGen V3 Video Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Video Rendering & Studio Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authorize and monitor broadcast rendering with full lip-sync synthesis.
          </p>
        </div>

        {activeJob?.status === 'completed' && (
          <button
            onClick={() => navigate('/library')}
            className="px-5 py-2.5 nm-button text-xs font-bold text-indigo-600 hover:text-indigo-800 rounded-xl"
          >
            View in Library →
          </button>
        )}
      </div>

      {/* Pre-flight Checklist Card */}
      <div className="nm-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Pre-Flight Production Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl nm-card-sm flex items-center gap-3 ${scriptReady ? 'bg-emerald-50/40 border border-emerald-200/50' : 'bg-slate-100'}`}>
            <CheckCircle2 className={`w-5 h-5 ${scriptReady ? 'text-emerald-500' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-bold text-slate-800">Finalized Script</div>
              <div className="text-[10px] text-slate-500">
                {scriptReady ? `${currentProject.latest_script.script.split(/\s+/).length} words ready` : 'Missing script'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl nm-card-sm flex items-center gap-3 bg-emerald-50/40 border border-emerald-200/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <div className="text-xs font-bold text-slate-800">Avatar Selection</div>
              <div className="text-[10px] text-slate-500">
                {currentProject?.selected_avatar_name || 'Dante Office 2 (Default)'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl nm-card-sm flex items-center gap-3 bg-emerald-50/40 border border-emerald-200/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <div className="text-xs font-bold text-slate-800">Neural Voice</div>
              <div className="text-[10px] text-slate-500">
                {currentProject?.selected_voice_name || 'Leanne (Default)'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {(!activeJob || activeJob.status === 'failed') && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setSafetyModalOpen(true)}
              disabled={!allReady || rendering}
              className={`px-8 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                allReady && !rendering
                  ? 'nm-button-primary cursor-pointer'
                  : 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review Safety & Render Video</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Rendering Status Card */}
      {activeJob && ['pending', 'processing'].includes(activeJob.status) && (
        <div className="nm-card-lg p-8 space-y-6 bg-gradient-to-br from-[#eef2f7] to-indigo-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  HeyGen Video Synthesis in Progress
                </h3>
                <p className="text-xs text-slate-500">
                  Job ID: {activeJob.heygen_job_id || activeJob.id}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              {activeJob.status}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Rendering Pipeline Progress</span>
              <span>{activeJob.progress || 25}%</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden nm-inset">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(15, activeJob.progress || 25)}%` }}
              />
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="nm-card-sm p-3 text-center bg-white/60">
              <div className="text-[10px] text-slate-400">Step 1</div>
              <div className="font-bold text-slate-800">Audio Synthesis</div>
            </div>
            <div className="nm-card-sm p-3 text-center bg-white/60">
              <div className="text-[10px] text-slate-400">Step 2</div>
              <div className="font-bold text-slate-800">Lip-Sync Align</div>
            </div>
            <div className="nm-card-sm p-3 text-center bg-white/60">
              <div className="text-[10px] text-slate-400">Step 3</div>
              <div className="font-bold text-slate-800">1080p Rendering</div>
            </div>
            <div className="nm-card-sm p-3 text-center bg-white/60">
              <div className="text-[10px] text-slate-400">Step 4</div>
              <div className="font-bold text-slate-800">Cloud Storage</div>
            </div>
          </div>
        </div>
      )}

      {/* Completed Video Player Showcase */}
      {activeJob && activeJob.status === 'completed' && activeJob.video_url && (
        <div className="nm-card-lg p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {currentProject?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Rendered with {currentProject?.selected_avatar_name || 'Dante Office 2'} • Aspect {currentProject?.aspect_ratio || '16:9'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <a
                href={activeJob.video_url}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 nm-button-primary text-xs font-bold flex items-center gap-2 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeJob.video_url);
                  addToast('Video URL copied to clipboard!', 'info');
                }}
                className="p-2.5 nm-button text-slate-600 hover:text-slate-800 rounded-xl"
                title="Copy Video Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative rounded-2xl overflow-hidden nm-inset p-2 bg-slate-900 flex justify-center">
            <video
              src={activeJob.video_url}
              poster={activeJob.thumbnail_url}
              controls
              playsInline
              className="max-h-[500px] w-auto rounded-xl shadow-2xl"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Social Package Card */}
          <div className="nm-card-sm p-5 space-y-3 bg-white/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Ready-to-Publish Social Package
              </span>
              <button
                onClick={() => {
                  const s = currentProject?.latest_script;
                  const text = `${s?.title}\n\n${s?.caption}\n\n${(s?.hashtags || []).map(t => `#${t}`).join(' ')}`;
                  navigator.clipboard.writeText(text);
                  addToast('Copied title, caption & hashtags!', 'success');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy Package
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">
                {currentProject?.latest_script?.caption}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(currentProject?.latest_script?.hashtags || []).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium text-[11px]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Gate Confirmation Modal */}
      <CreditSafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        onConfirm={handleStartRender}
        project={currentProject}
        avatar={{ avatar_name: currentProject?.selected_avatar_name }}
        voice={{ voice_name: currentProject?.selected_voice_name }}
        durationSeconds={currentProject?.duration_seconds || 60}
        loading={rendering}
      />
    </div>
  );
}
