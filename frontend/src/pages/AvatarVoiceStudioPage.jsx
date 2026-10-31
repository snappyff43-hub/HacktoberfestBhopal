import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { 
  UserCheck, 
  Search, 
  Volume2, 
  Film, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Sliders,
  Monitor,
  Smartphone,
  Square
} from 'lucide-react';

export default function AvatarVoiceStudioPage() {
  const navigate = useNavigate();
  const { currentProject, refreshCurrentProject, addToast } = useApp();

  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // Selected state
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [selectedAvatarName, setSelectedAvatarName] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Search & Filter state
  const [avatarSearch, setAvatarSearch] = useState('');
  const [voiceSearch, setVoiceSearch] = useState('');
  const [voiceLangFilter, setVoiceLangFilter] = useState('all');

  useEffect(() => {
    async function loadCatalogs() {
      setLoadingCatalogs(true);
      try {
        const [avatarRes, voiceRes] = await Promise.all([
          api.getAvatars(),
          api.getVoices(),
        ]);

        const avList = avatarRes.avatars || [];
        const vcList = voiceRes.voices || [];

        setAvatars(avList);
        setVoices(vcList);

        // Pre-select from currentProject or first items
        if (currentProject?.selected_avatar_id) {
          setSelectedAvatarId(currentProject.selected_avatar_id);
          setSelectedAvatarName(currentProject.selected_avatar_name || '');
        } else if (avList.length > 0) {
          setSelectedAvatarId(avList[0].avatar_look_id || avList[0].id);
          setSelectedAvatarName(avList[0].avatar_name || avList[0].name || 'Dante Office 2');
        }

        if (currentProject?.selected_voice_id) {
          setSelectedVoiceId(currentProject.selected_voice_id);
          setSelectedVoiceName(currentProject.selected_voice_name || '');
        } else if (vcList.length > 0) {
          setSelectedVoiceId(vcList[0].voice_id || vcList[0].id);
          setSelectedVoiceName(vcList[0].name || vcList[0].voice_name || 'Leanne');
        }

        if (currentProject?.aspect_ratio) {
          setAspectRatio(currentProject.aspect_ratio);
        }
      } catch (err) {
        addToast(`Failed to load HeyGen catalogs: ${err.message}`, 'error');
      } finally {
        setLoadingCatalogs(false);
      }
    }

    loadCatalogs();
  }, [currentProject]);

  // Filtered avatars
  const filteredAvatars = avatars.filter((av) => {
    const name = (av.avatar_name || av.name || '').toLowerCase();
    return name.includes(avatarSearch.toLowerCase());
  });

  // Filtered voices
  const filteredVoices = voices.filter((vc) => {
    const name = (vc.name || vc.voice_name || '').toLowerCase();
    const lang = (vc.language || '').toLowerCase();
    const matchesSearch = name.includes(voiceSearch.toLowerCase()) || lang.includes(voiceSearch.toLowerCase());
    if (voiceLangFilter === 'all') return matchesSearch;
    if (voiceLangFilter === 'en') return matchesSearch && lang.includes('en');
    if (voiceLangFilter === 'hi') return matchesSearch && (lang.includes('hi') || lang.includes('hindi') || lang.includes('in'));
    return matchesSearch;
  });

  const handleProceedToRender = () => {
    if (!selectedAvatarId || !selectedVoiceId) {
      addToast('Please select both an avatar and a voice.', 'warning');
      return;
    }

    // Save selection into project state
    if (currentProject) {
      currentProject.selected_avatar_id = selectedAvatarId;
      currentProject.selected_avatar_name = selectedAvatarName;
      currentProject.selected_voice_id = selectedVoiceId;
      currentProject.selected_voice_name = selectedVoiceName;
      currentProject.aspect_ratio = aspectRatio;
    }

    navigate('/render');
  };

  const estimatedCredits = Math.ceil((currentProject?.duration_seconds || 60) / 60);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full nm-pill text-xs font-bold text-purple-700 mb-2">
            <Film className="w-3.5 h-3.5 text-purple-600" />
            <span>Official HeyGen V3 Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Avatar & Voice Casting Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose from 50+ photorealistic digital twins and 60+ neural voices for high-fidelity lip-sync.
          </p>
        </div>

        {/* Selected Summary Pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleProceedToRender}
            className="px-6 py-3 nm-button-primary text-xs font-bold flex items-center gap-2 rounded-xl cursor-pointer"
          >
            <span>Proceed to Video Render</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aspect Ratio Selector & Safety Estimator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Aspect Ratio Card */}
        <div className="nm-card p-5 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Aspect Ratio
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '16:9', label: '16:9 Landscape', sub: 'YouTube', icon: Monitor },
              { id: '9:16', label: '9:16 Vertical', sub: 'Shorts/Reels', icon: Smartphone },
              { id: '1:1', label: '1:1 Square', sub: 'LinkedIn', icon: Square },
            ].map((ar) => {
              const Icon = ar.icon;
              const isSelected = aspectRatio === ar.id;
              return (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id)}
                  className={`p-3 rounded-xl text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected ? 'nm-inset text-indigo-700 font-bold bg-white/70' : 'nm-button text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold">{ar.id}</span>
                  <span className="text-[9px] text-slate-400">{ar.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Pair Preview */}
        <div className="nm-card p-5 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Current Selection
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Avatar:</span>
              <span className="font-bold text-slate-800">{selectedAvatarName || 'Not Selected'}</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Voice:</span>
              <span className="font-bold text-slate-800">{selectedVoiceName || 'Not Selected'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Aspect Ratio:</span>
              <span className="font-bold text-indigo-600">{aspectRatio}</span>
            </div>
          </div>
        </div>

        {/* Credit Protection Card */}
        <div className="nm-card p-5 space-y-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> HeyGen Credit Gate
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Video Length:</span>
              <span className="font-bold text-slate-800">~{currentProject?.duration_seconds || 60}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Cost:</span>
              <span className="font-extrabold text-indigo-700">{estimatedCredits} Credit</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Credits will only be deducted after you review and approve the safety confirmation modal on the next step.
          </p>
        </div>
      </div>

      {/* Main Casting Columns: Avatars (Left) & Voices (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatars Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span>Avatar Selection</span>
              <span className="text-xs font-normal text-slate-500">({avatars.length} available)</span>
            </h3>
            <div className="relative w-48">
              <input
                type="text"
                value={avatarSearch}
                onChange={(e) => setAvatarSearch(e.target.value)}
                placeholder="Search avatar..."
                className="w-full nm-inset px-3 py-1.5 text-xs text-slate-800 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {loadingCatalogs ? (
            <div className="nm-inset p-8 text-center text-xs text-slate-500 space-y-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Fetching real HeyGen V3 avatars...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[540px] overflow-y-auto p-1">
              {filteredAvatars.map((av) => {
                const id = av.avatar_look_id || av.id;
                const name = av.avatar_name || av.name || 'Dante Office 2';
                const isSelected = selectedAvatarId === id;
                const thumb = av.preview_url || av.thumbnail_url || av.image_url;

                return (
                  <div
                    key={id}
                    onClick={() => {
                      setSelectedAvatarId(id);
                      setSelectedAvatarName(name);
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'nm-inset ring-2 ring-indigo-500 bg-white/70 shadow-inner'
                        : 'nm-card-sm hover:scale-[1.02] bg-white/40'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center">
                      {thumb ? (
                        <img src={thumb} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-indigo-400">
                          {name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="w-full">
                      <div className="text-xs font-bold text-slate-800 truncate" title={name}>
                        {name}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {av.gender || 'Universal'}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Voices Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span>Voice Selection</span>
              <span className="text-xs font-normal text-slate-500">({voices.length} available)</span>
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={voiceLangFilter}
                onChange={(e) => setVoiceLangFilter(e.target.value)}
                className="nm-inset px-2.5 py-1 text-xs text-slate-700 rounded-lg focus:outline-none"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="hi">Hindi / Indic</option>
              </select>
              <div className="relative w-40">
                <input
                  type="text"
                  value={voiceSearch}
                  onChange={(e) => setVoiceSearch(e.target.value)}
                  placeholder="Search voice..."
                  className="w-full nm-inset px-3 py-1.5 text-xs text-slate-800 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {loadingCatalogs ? (
            <div className="nm-inset p-8 text-center text-xs text-slate-500 space-y-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Fetching real HeyGen neural voices...</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[540px] overflow-y-auto p-1">
              {filteredVoices.map((vc) => {
                const id = vc.voice_id || vc.id;
                const name = vc.name || vc.voice_name || 'Leanne';
                const lang = vc.language || 'English (US)';
                const gender = vc.gender || 'Female';
                const isSelected = selectedVoiceId === id;

                return (
                  <div
                    key={id}
                    onClick={() => {
                      setSelectedVoiceId(id);
                      setSelectedVoiceName(name);
                    }}
                    className={`p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'nm-inset ring-2 ring-indigo-500 bg-white/70 shadow-inner'
                        : 'nm-card-sm hover:translate-x-1 bg-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full nm-pill flex items-center justify-center text-indigo-600">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{name}</div>
                        <div className="text-[10px] text-slate-400">
                          {lang} • {gender}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {vc.accent || 'Natural'}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
