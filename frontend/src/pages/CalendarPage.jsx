import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Send, 
  ShieldCheck, 
  Zap, 
  CalendarOff,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';

export default function CalendarPage() {
  const { currentProject, addToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [preferences, setPreferences] = useState({
    mode: 'smart_approval',
    posting_days: 'Monday,Wednesday,Friday',
    posting_time: '18:00',
    timezone: 'Asia/Kolkata',
    unavailable_dates: [],
    spending_limit_credits: 5,
  });

  // Modals & form state
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    platform: 'YouTube',
    scheduled_datetime: '',
  });

  const [createTopicOpen, setCreateTopicOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    topic: '',
    target_audience: 'College Students',
    language: 'Hindi',
    preferred_platform: 'YouTube',
  });

  const [newUnavailableDate, setNewUnavailableDate] = useState('');

  // Fetch all calendar data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, backlogRes, prefRes] = await Promise.allSettled([
        api.getSchedule(),
        api.getBacklog(),
        api.getPreferences(),
      ]);

      if (schedRes.status === 'fulfilled') setSchedule(schedRes.value);
      if (backlogRes.status === 'fulfilled') setBacklog(backlogRes.value);
      if (prefRes.status === 'fulfilled') {
        setPreferences({
          ...prefRes.value,
          unavailable_dates: prefRes.value.unavailable_dates || [],
        });
      }
    } catch (err) {
      addToast(`Error loading calendar: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-fill post modal from active project
  useEffect(() => {
    if (currentProject && !newPost.title) {
      setNewPost((prev) => ({
        ...prev,
        title: currentProject.title,
        platform: currentProject.platform || 'YouTube',
        scheduled_datetime: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
      }));
    }
  }, [currentProject]);

  // Handle Plan Autopilot
  const handlePlanAutopilot = async () => {
    setLoading(true);
    try {
      const res = await api.planAutopilot(7);
      addToast(`Autopilot planned ${res.slots_planned} slots for the coming week!`, 'success');
      await fetchData();
    } catch (err) {
      addToast(`Autopilot plan failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Simulate Publish
  const handleSimulatePublish = async (postId, bypassApproval = false) => {
    try {
      const res = await api.simulatePublish(postId, !bypassApproval);
      if (res.success) {
        addToast(res.message, 'success');
      } else {
        addToast(`Safety Gate: ${res.message}`, 'warning');
      }
      await fetchData();
    } catch (err) {
      addToast(`Publish simulation error: ${err.message}`, 'error');
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    try {
      await api.deleteScheduledPost(postId);
      addToast('Post removed from queue', 'info');
      setSchedule((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      addToast(`Failed to delete post: ${err.message}`, 'error');
    }
  };

  // Create scheduled post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.scheduled_datetime) return;
    try {
      await api.createScheduledPost({
        title: newPost.title,
        platform: newPost.platform,
        scheduled_datetime: new Date(newPost.scheduled_datetime).toISOString(),
        status: preferences.mode === 'smart_approval' ? 'NEEDS_APPROVAL' : 'SCHEDULED',
      });
      addToast('Scheduled post created successfully!', 'success');
      setCreatePostOpen(false);
      await fetchData();
    } catch (err) {
      addToast(`Schedule creation failed: ${err.message}`, 'error');
    }
  };

  // Add Backlog Topic
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.topic.trim()) return;
    try {
      await api.createBacklogTopic(newTopic);
      addToast('Topic added to approved backlog', 'success');
      setCreateTopicOpen(false);
      setNewTopic({
        topic: '',
        target_audience: 'College Students',
        language: 'Hindi',
        preferred_platform: 'YouTube',
      });
      await fetchData();
    } catch (err) {
      addToast(`Failed to add topic: ${err.message}`, 'error');
    }
  };

  // Delete Backlog Topic
  const handleDeleteTopic = async (topicId) => {
    try {
      await api.deleteBacklogTopic(topicId);
      setBacklog((prev) => prev.filter((t) => t.id !== topicId));
      addToast('Topic removed', 'info');
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Add Blackout Date
  const handleAddUnavailableDate = async (e) => {
    e.preventDefault();
    if (!newUnavailableDate) return;
    if (preferences.unavailable_dates.includes(newUnavailableDate)) {
      addToast('Date already marked as unavailable', 'warning');
      return;
    }
    const updated = [...preferences.unavailable_dates, newUnavailableDate];
    try {
      await api.updatePreferences({ unavailable_dates: updated });
      setPreferences((prev) => ({ ...prev, unavailable_dates: updated }));
      setNewUnavailableDate('');
      addToast(`Marked ${newUnavailableDate} as creator blackout date`, 'success');
    } catch (err) {
      addToast(`Failed to update dates: ${err.message}`, 'error');
    }
  };

  // Remove Blackout Date
  const handleRemoveUnavailableDate = async (dateStr) => {
    const updated = preferences.unavailable_dates.filter((d) => d !== dateStr);
    try {
      await api.updatePreferences({ unavailable_dates: updated });
      setPreferences((prev) => ({ ...prev, unavailable_dates: updated }));
      addToast(`Removed blackout on ${dateStr}`, 'info');
    } catch (err) {
      addToast(`Failed to update dates: ${err.message}`, 'error');
    }
  };

  // Update Publishing Mode
  const handleModeChange = async (newMode) => {
    try {
      await api.updatePreferences({ mode: newMode });
      setPreferences((prev) => ({ ...prev, mode: newMode }));
      addToast(`Publishing mode updated to: ${newMode}`, 'success');
    } catch (err) {
      addToast(`Mode update failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full nm-pill text-xs font-bold text-indigo-700 mb-2">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Intelligent Social Distribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Publishing Calendar & Autopilot
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automate weekly multi-platform drops, set creator blackout dates, and enforce Smart Approval.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2.5 nm-button text-xs font-bold text-slate-700 flex items-center gap-1.5 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePlanAutopilot}
            disabled={loading}
            className="px-5 py-2.5 nm-button-primary text-xs font-bold flex items-center gap-2 rounded-xl cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Run Autopilot Planner</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Smart Approval Status */}
      <div className="nm-card p-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/50 via-white/50 to-purple-50/40">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800 text-sm">Active Mode:</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                {preferences.mode.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadence: {preferences.posting_days} at {preferences.posting_time} ({preferences.timezone})
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 nm-inset rounded-2xl bg-white/40">
          {[
            { id: 'smart_approval', label: 'Smart Approval' },
            { id: 'autopilot', label: 'Autopilot' },
            { id: 'manual', label: 'Manual' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                preferences.mode === m.id
                  ? 'nm-card bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Scheduled Posts Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h2 className="font-extrabold text-sm text-slate-800">
                Scheduled Publishing Queue ({schedule.length})
              </h2>
            </div>
            <button
              onClick={() => setCreatePostOpen(true)}
              className="px-3.5 py-1.5 nm-button text-xs font-bold text-indigo-700 flex items-center gap-1.5 rounded-xl cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Post</span>
            </button>
          </div>

          {schedule.length === 0 ? (
            <div className="nm-card p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl nm-inset mx-auto flex items-center justify-center text-slate-400">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-700">No Scheduled Posts Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "Run Autopilot Planner" to automatically allocate upcoming slots from your approved backlog, or manually schedule a video.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedule.map((post) => {
                const dateObj = new Date(post.scheduled_datetime);
                const dateFormatted = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
                const timeFormatted = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={post.id} className="nm-card p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {post.platform}
                        </span>
                        <span className="text-xs font-bold text-slate-500 font-mono">
                          {dateFormatted} at {timeFormatted}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        post.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : post.status === 'NEEDS_APPROVAL'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : post.status === 'MISSED_SLOT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {post.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800">{post.title}</h4>

                    {post.published_url && (
                      <p className="text-xs text-emerald-700 font-mono">
                        Live Link: <a href={post.published_url} target="_blank" rel="noreferrer" className="underline">{post.published_url}</a>
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {post.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleSimulatePublish(post.id, false)}
                            className="px-3 py-1.5 nm-button text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 rounded-lg cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Simulate Publish</span>
                          </button>
                        )}
                        {post.status === 'NEEDS_APPROVAL' && (
                          <button
                            onClick={() => handleSimulatePublish(post.id, true)}
                            className="px-3 py-1.5 nm-button text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 rounded-lg cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve & Publish</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Backlog & Creator Blackout Dates */}
        <div className="space-y-6">
          {/* Creator Unavailable Dates Card */}
          <div className="nm-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarOff className="w-4 h-4 text-rose-600" />
              <h3 className="font-extrabold text-sm text-slate-800">Creator Blackout Dates</h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Autopilot will skip scheduling or publishing on these designated off-days.
            </p>

            {/* Add Date form */}
            <form onSubmit={handleAddUnavailableDate} className="flex gap-2">
              <input
                type="date"
                value={newUnavailableDate}
                onChange={(e) => setNewUnavailableDate(e.target.value)}
                className="flex-1 nm-inset px-3 py-2 text-xs text-slate-800 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 nm-button-primary text-xs font-bold rounded-xl cursor-pointer"
              >
                Add
              </button>
            </form>

            {/* List of unavailable dates */}
            <div className="space-y-2 pt-2">
              {preferences.unavailable_dates.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No blackout dates added.</p>
              ) : (
                preferences.unavailable_dates.map((dateStr) => (
                  <div key={dateStr} className="flex items-center justify-between p-2 rounded-xl nm-card-sm bg-rose-50/40 border border-rose-100 text-xs">
                    <span className="font-mono font-bold text-rose-900">{dateStr}</span>
                    <button
                      onClick={() => handleRemoveUnavailableDate(dateStr)}
                      className="text-slate-400 hover:text-rose-700 text-xs p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Approved Topic Backlog Card */}
          <div className="nm-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-800">Topic Backlog ({backlog.length})</h3>
              </div>
              <button
                onClick={() => setCreateTopicOpen(true)}
                className="px-2.5 py-1 nm-button text-[11px] font-bold text-indigo-700 flex items-center gap-1 rounded-lg cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Idea</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Vetted topics ready for Autopilot to automatically script and assign into upcoming calendar slots.
            </p>

            <div className="space-y-2.5">
              {backlog.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Backlog is empty. Add ideas above!</p>
              ) : (
                backlog.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl nm-card-sm space-y-1.5 bg-white/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-indigo-700 uppercase">
                        {item.preferred_platform} • {item.language}
                      </span>
                      <button
                        onClick={() => handleDeleteTopic(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="font-bold text-xs text-slate-800 leading-snug">{item.topic}</h5>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Schedule Post */}
      {createPostOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nm-card max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-800 text-sm">Schedule New Video Drop</h3>
              <button onClick={() => setCreatePostOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Video Title / Topic</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g. 5 AI Breakthroughs Every College Student Must Know"
                  className="w-full nm-inset p-3 text-xs text-slate-800 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Platform</label>
                <select
                  value={newPost.platform}
                  onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                  className="w-full nm-inset p-3 text-xs text-slate-800 rounded-xl focus:outline-none"
                >
                  <option value="YouTube">YouTube Landscape (16:9)</option>
                  <option value="Instagram Reels">Instagram Reels (9:16)</option>
                  <option value="YouTube Shorts">YouTube Shorts (9:16)</option>
                  <option value="LinkedIn">LinkedIn Thought Leadership (1:1)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Publish Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newPost.scheduled_datetime}
                  onChange={(e) => setNewPost({ ...newPost, scheduled_datetime: e.target.value })}
                  className="w-full nm-inset p-3 text-xs text-slate-800 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreatePostOpen(false)}
                  className="px-4 py-2 nm-button text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 nm-button-primary text-xs font-bold rounded-xl cursor-pointer"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Topic to Backlog */}
      {createTopicOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="nm-card max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-800 text-sm">Add Idea to Backlog</h3>
              <button onClick={() => setCreateTopicOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Topic Idea</label>
                <textarea
                  rows={2}
                  required
                  value={newTopic.topic}
                  onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })}
                  placeholder="e.g. How to Build an AI Agent in 10 Minutes with Gemma 4"
                  className="w-full nm-inset p-3 text-xs text-slate-800 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Audience</label>
                  <input
                    type="text"
                    value={newTopic.target_audience}
                    onChange={(e) => setNewTopic({ ...newTopic, target_audience: e.target.value })}
                    className="w-full nm-inset p-2.5 text-xs text-slate-800 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Language</label>
                  <select
                    value={newTopic.language}
                    onChange={(e) => setNewTopic({ ...newTopic, language: e.target.value })}
                    className="w-full nm-inset p-2.5 text-xs text-slate-800 rounded-xl focus:outline-none"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Hinglish">Hinglish</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Platform</label>
                <select
                  value={newTopic.preferred_platform}
                  onChange={(e) => setNewTopic({ ...newTopic, preferred_platform: e.target.value })}
                  className="w-full nm-inset p-3 text-xs text-slate-800 rounded-xl focus:outline-none"
                >
                  <option value="YouTube">YouTube (16:9)</option>
                  <option value="Instagram Reels">Instagram Reels (9:16)</option>
                  <option value="YouTube Shorts">YouTube Shorts (9:16)</option>
                  <option value="LinkedIn">LinkedIn (1:1)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateTopicOpen(false)}
                  className="px-4 py-2 nm-button text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 nm-button-primary text-xs font-bold rounded-xl cursor-pointer"
                >
                  Add to Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

