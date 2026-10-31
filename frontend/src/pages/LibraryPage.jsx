import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { 
  FolderKanban, 
  Play, 
  Download, 
  Trash2, 
  Share2, 
  Film, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  Plus
} from 'lucide-react';

export default function LibraryPage() {
  const navigate = useNavigate();
  const { selectProject, refreshProjectsList, addToast } = useApp();

  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await api.getLibrary();
      setLibraryItems(res.items || []);
    } catch (err) {
      addToast(`Failed to load video library: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(projectId);
      addToast('Project deleted successfully', 'success');
      fetchLibrary();
      refreshProjectsList();
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full nm-pill text-xs font-bold text-indigo-700 mb-2">
            <Film className="w-3.5 h-3.5 text-indigo-500" />
            <span>Completed Productions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Video Asset Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access, download, and distribute your finalized HeyGen avatar creations.
          </p>
        </div>

        <button
          onClick={() => navigate('/studio')}
          className="px-5 py-2.5 nm-button-primary text-xs font-bold flex items-center gap-2 rounded-xl cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Video</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="nm-card p-12 text-center text-xs text-slate-500 space-y-2">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading library assets...</p>
        </div>
      ) : libraryItems.length === 0 ? (
        <div className="nm-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl nm-card-sm mx-auto flex items-center justify-center text-slate-400">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Rendered Videos Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate a script with local Gemma 4, customize it in the editor, and submit a video render to populate your library.
          </p>
          <button
            onClick={() => navigate('/studio')}
            className="px-6 py-2.5 nm-button-primary text-xs font-bold rounded-xl cursor-pointer"
          >
            Create Your First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryItems.map((item) => (
            <div key={item.job_id} className="nm-card p-5 space-y-4 flex flex-col justify-between group">
              {/* Thumbnail Container */}
              <div 
                onClick={() => setSelectedVideo(item)}
                className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 cursor-pointer shadow-md group-hover:shadow-lg transition-shadow"
              >
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-800 to-indigo-950 text-indigo-300">
                    <Film className="w-10 h-10 opacity-60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-indigo-600" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                  {item.duration}
                </span>
              </div>

              {/* Meta */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold uppercase">
                    {item.platform}
                  </span>
                  <span className="text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 line-clamp-1" title={item.title}>
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Avatar: <strong className="text-slate-700">{item.avatar_name || 'Dante Office 2'}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    selectProject(item.project_id);
                    navigate('/script');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Edit Script
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={item.video_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-2 nm-button text-slate-600 hover:text-indigo-600 rounded-lg"
                    title="Download MP4"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.project_id)}
                    className="p-2 nm-button text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-3xl w-full nm-card-lg p-6 bg-[#eef2f7] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-800 truncate max-w-lg">
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black flex justify-center">
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="max-h-[460px] w-auto rounded-lg shadow-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <a
                href={selectedVideo.video_url}
                download
                className="px-5 py-2 nm-button-primary text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download MP4
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
