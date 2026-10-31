import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { 
  FileEdit, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Hash, 
  Layers, 
  RefreshCw, 
  BrainCircuit, 
  MessageSquare,
  AlertCircle,
  Copy,
  Plus,
  Trash2,
  Check
} from 'lucide-react';

export default function ScriptEditorPage() {
  const navigate = useNavigate();
  const { currentProject, refreshCurrentProject, addToast } = useApp();

  const [title, setTitle] = useState('');
  const [hook, setHook] = useState('');
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState([]);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  const [saving, setSaving] = useState(false);

  // Gemini Polish Modal state
  const [geminiModalOpen, setGeminiModalOpen] = useState(false);
  const [geminiInstructions, setGeminiInstructions] = useState('Enhance hook retention, make narration punchier, and optimize for social media engagement.');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiDiff, setGeminiDiff] = useState(null);

  // Sync state with currentProject
  useEffect(() => {
    if (currentProject && currentProject.latest_script) {
      const s = currentProject.latest_script;
      setTitle(s.title || currentProject.title || '');
      setHook(s.hook || '');
      setScript(s.script || '');
      setScenes(s.scenes || []);
      setCaption(s.caption || '');
      setHashtags(s.hashtags || []);
      setCallToAction(s.call_to_action || '');
      setIsApproved(s.is_approved || false);
    }
  }, [currentProject]);

  // Speaking metrics
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / 140) * 60);

  const handleSave = async (approved = isApproved) => {
    if (!currentProject) return;
    setSaving(true);
    try {
      await api.updateScript(currentProject.id, {
        title,
        hook,
        script,
        scenes,
        caption,
        hashtags,
        description: currentProject.latest_script?.description || '',
        call_to_action: callToAction,
        is_approved: approved,
      });

      setIsApproved(approved);
      addToast(approved ? 'Script approved!' : 'Script changes saved.', 'success');
      await refreshCurrentProject(currentProject.id);
      return true;
    } catch (err) {
      addToast(`Save failed: ${err.message}`, 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAndProceed = async () => {
    const ok = await handleSave(true);
    if (ok) {
      navigate('/avatar');
    }
  };

  // Scene management
  const handleSceneChange = (index, field, value) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: value };
    setScenes(updated);
  };

  const handleAddScene = () => {
    const newSceneNum = scenes.length + 1;
    setScenes([
      ...scenes,
      {
        scene_number: newSceneNum,
        description: 'Avatar speaks directly to camera with engaging hand gestures.',
        narration: 'Next key insight for your audience.',
      },
    ]);
  };

  const handleRemoveScene = (index) => {
    const filtered = scenes.filter((_, i) => i !== index);
    const renumbered = filtered.map((s, i) => ({ ...s, scene_number: i + 1 }));
    setScenes(renumbered);
  };

  // Hashtags
  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const clean = newTag.replace(/^#/, '').trim();
    if (clean && !hashtags.includes(clean)) {
      setHashtags([...hashtags, clean]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  // Gemini Polish Flow
  const handleTriggerGeminiPolish = async () => {
    if (!currentProject) return;
    setGeminiLoading(true);
    try {
      const res = await api.improveWithGemini({
        project_id: currentProject.id,
        instructions: geminiInstructions,
      });
      setGeminiDiff(res);
      addToast('Gemini enhancement generated!', 'success');
    } catch (err) {
      addToast(`Gemini polish failed: ${err.message}`, 'error');
    } finally {
      setGeminiLoading(false);
    }
  };

  const handleAcceptGeminiPolish = () => {
    if (!geminiDiff || !geminiDiff.improved) return;
    const imp = geminiDiff.improved;
    setTitle(imp.title);
    setHook(imp.hook);
    setScript(imp.script);
    setScenes(imp.scenes);
    setCaption(imp.caption);
    setHashtags(imp.hashtags);
    setCallToAction(imp.call_to_action);

    setGeminiModalOpen(false);
    setGeminiDiff(null);
    addToast('Applied Gemini script improvements!', 'success');
  };

  if (!currentProject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl nm-card mx-auto flex items-center justify-center text-slate-400">
          <FileEdit className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Active Project Selected</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Create a new script in Content Studio or choose an existing project from the top bar.
        </p>
        <button
          onClick={() => navigate('/studio')}
          className="px-6 py-2.5 nm-button-primary text-xs font-bold rounded-xl cursor-pointer"
        >
          Go to Content Studio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-700">
              {currentProject.language}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200 text-slate-700">
              {currentProject.platform}
            </span>
            {isApproved ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Check className="w-3 h-3" /> Approved
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700">
                Draft Review
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Script & Scene Director
          </h1>
          <p className="text-xs text-slate-500">
            Review, edit visual descriptions, or polish with Gemini before avatar synthesis.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Gemini Polish Trigger */}
          <button
            type="button"
            onClick={() => setGeminiModalOpen(true)}
            className="px-4 py-2.5 nm-button text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center gap-2 rounded-xl cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-violet-500" />
            <span>Polish with Gemini</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2.5 nm-button text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {/* Approve & Continue */}
          <button
            type="button"
            onClick={handleApproveAndProceed}
            className="px-5 py-2.5 nm-button-primary text-xs font-bold flex items-center gap-2 rounded-xl cursor-pointer"
          >
            <span>Approve & Pick Avatar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor (Hook + Scenes), Right (Narration + Socials) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide): Script & Scenes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Hook Card */}
          <div className="nm-card p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full nm-inset px-4 py-2.5 text-sm font-bold text-slate-800 rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>The Hook (First 3 Seconds)</span>
                <span className="text-[10px] text-indigo-600 font-semibold lowercase">
                  critical for retention
                </span>
              </label>
              <textarea
                rows={2}
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="Hook sentence to grab immediate attention..."
                className="w-full nm-inset p-3 text-xs font-medium text-slate-800 rounded-xl focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Scene Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Scene-by-Scene Breakdown ({scenes.length} Scenes)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddScene}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 px-2.5 py-1 nm-pill"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Scene</span>
              </button>
            </div>

            <div className="space-y-4">
              {scenes.map((sc, idx) => (
                <div key={idx} className="nm-card-sm p-4 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Scene {sc.scene_number || idx + 1}
                    </span>
                    {scenes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScene(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Visual / Camera Prompt
                    </label>
                    <input
                      type="text"
                      value={sc.description || ''}
                      onChange={(e) => handleSceneChange(idx, 'description', e.target.value)}
                      placeholder="e.g. Avatar gestures with confidence against a campus backdrop"
                      className="w-full nm-inset px-3 py-1.5 text-xs text-slate-700 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Narration Line
                    </label>
                    <textarea
                      rows={2}
                      value={sc.narration || ''}
                      onChange={(e) => handleSceneChange(idx, 'narration', e.target.value)}
                      placeholder="Line spoken by the avatar..."
                      className="w-full nm-inset p-2.5 text-xs text-slate-800 rounded-lg focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide): Full Narration & Social Metadata */}
        <div className="space-y-6">
          {/* Full Narration Card */}
          <div className="nm-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Avatar Script
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>~{estimatedSeconds}s ({wordCount} words)</span>
              </div>
            </div>

            <textarea
              rows={9}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Full spoken text that will be synthesized into HeyGen audio..."
              className="w-full nm-inset p-3.5 text-xs leading-relaxed text-slate-800 rounded-xl focus:outline-none resize-none font-medium"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Devanagari & English Supported</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(script);
                  addToast('Script copied to clipboard!', 'info');
                }}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
          </div>

          {/* Social Caption & Call to Action */}
          <div className="nm-card p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Social Caption
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Post caption for YouTube / Instagram..."
                className="w-full nm-inset p-3 text-xs text-slate-800 rounded-xl focus:outline-none resize-none"
              />
            </div>

            {/* Call to Action */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Call to Action
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                placeholder="e.g. Subscribe for daily tech breakdowns!"
                className="w-full nm-inset px-3 py-2 text-xs text-slate-800 rounded-xl focus:outline-none"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-500" /> Hashtags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/70 text-indigo-700 nm-card-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add hashtag (press enter)"
                  className="flex-1 nm-inset px-3 py-1.5 text-xs text-slate-700 rounded-lg focus:outline-none"
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Polish Modal */}
      {geminiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-4xl w-full nm-card-lg p-6 sm:p-8 bg-[#eef2f7] border border-white/80 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-sm">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Polish Script with Gemini
                  </h3>
                  <p className="text-xs text-slate-500">
                    Elevate retention, hooks, and punchiness with Google Gemini Flash
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setGeminiModalOpen(false);
                  setGeminiDiff(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Custom Instructions */}
            {!geminiDiff && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enhancement Directives
                  </label>
                  <textarea
                    rows={3}
                    value={geminiInstructions}
                    onChange={(e) => setGeminiInstructions(e.target.value)}
                    placeholder="Instructions for Gemini (e.g. Make it more persuasive, keep language in pure Hindi, tighten the hook)..."
                    className="w-full nm-inset p-3 text-xs text-slate-800 rounded-xl focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleTriggerGeminiPolish}
                    disabled={geminiLoading}
                    className="px-6 py-2.5 nm-button-primary text-xs font-bold flex items-center gap-2 rounded-xl cursor-pointer"
                  >
                    {geminiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Gemini is Elevating Script...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Gemini Polish
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison */}
            {geminiDiff && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Gemma Script */}
                  <div className="nm-inset p-4 rounded-xl space-y-3 bg-white/40">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500">
                      Original (Gemma 4 Local)
                    </span>
                    <h4 className="font-bold text-xs text-slate-800">
                      {geminiDiff.original.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-wrap">
                      {geminiDiff.original.script}
                    </p>
                  </div>

                  {/* Gemini Improved Script */}
                  <div className="nm-card-sm p-4 rounded-xl space-y-3 bg-violet-50/50 border border-violet-200">
                    <span className="text-[10px] font-extrabold uppercase text-violet-700">
                      Enhanced (Gemini Flash)
                    </span>
                    <h4 className="font-bold text-xs text-violet-950">
                      {geminiDiff.improved.title}
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                      {geminiDiff.improved.script}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setGeminiDiff(null)}
                    className="px-4 py-2 nm-button text-xs font-semibold text-slate-600"
                  >
                    Try Different Instructions
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptGeminiPolish}
                    className="px-6 py-2.5 nm-button-primary text-xs font-bold flex items-center gap-2 rounded-xl cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept & Apply Enhancements
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
