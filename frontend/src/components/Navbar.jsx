import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  FileEdit, 
  UserCheck, 
  Video, 
  FolderKanban, 
  Activity, 
  PlusCircle, 
  ChevronDown,
  Cpu,
  BrainCircuit,
  Film
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentProject, 
    projectsList, 
    selectProject, 
    systemStatus, 
    checkAllSystemHealth 
  } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/studio', label: 'Studio', icon: Sparkles },
    { to: '/script', label: 'Script Editor', icon: FileEdit },
    { to: '/avatar', label: 'Avatar & Voice', icon: UserCheck },
    { to: '/render', label: 'Video Render', icon: Video },
    { to: '/library', label: 'Library', icon: FolderKanban },
    { to: '/diagnostics', label: 'Diagnostics', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#eef2f7]/95 backdrop-blur-md border-b border-white/60 shadow-[0_4px_20px_rgba(203,213,225,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff] group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                  CreatorFlow
                </span>
                <span className="px-2 py-0.5 text-xs font-black tracking-widest uppercase bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                HeyGen V3 + Local Gemma 4 Studio
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 nm-inset">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-[2px_2px_6px_rgba(99,102,241,0.4)]'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-white/40'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Project Selector & System Status Badges */}
        <div className="flex items-center gap-3">
          {/* Active Project Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 nm-button text-xs font-medium text-slate-700 max-w-[200px] truncate"
              title={currentProject ? currentProject.title : 'Select Project'}
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="truncate max-w-[130px]">
                {currentProject ? currentProject.title : 'Select Project'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 nm-card p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Your Projects
                  </span>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/studio');
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {projectsList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 text-center">No projects yet</p>
                  ) : (
                    projectsList.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          selectProject(p.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                          currentProject?.id === p.id
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold'
                            : 'hover:bg-white/60 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{p.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="uppercase">{p.language}</span>
                          <span>•</span>
                          <span className="capitalize">{p.status.replace('_', ' ')}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* System Health Status Pills */}
          <div 
            onClick={checkAllSystemHealth} 
            className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 nm-card-sm text-[11px] cursor-pointer hover:shadow-md transition-shadow"
            title="Click to re-verify engine health"
          >
            {/* Ollama / Gemma 4 */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-slate-700">Gemma 4</span>
              <span 
                className={`w-2 h-2 rounded-full ${
                  systemStatus.ollama.status === 'online' ? 'bg-emerald-500' : 'bg-amber-400'
                }`} 
              />
            </div>

            {/* Gemini */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
              <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />
              <span className="font-semibold text-slate-700">Gemini</span>
              <span 
                className={`w-2 h-2 rounded-full ${
                  systemStatus.gemini.status === 'online' ? 'bg-emerald-500' : 'bg-amber-400'
                }`} 
              />
            </div>

            {/* HeyGen */}
            <div className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-semibold text-slate-700">HeyGen V3</span>
              <span 
                className={`w-2 h-2 rounded-full ${
                  systemStatus.heygen.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} 
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
