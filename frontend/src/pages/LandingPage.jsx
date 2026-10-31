import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Cpu, 
  BrainCircuit, 
  Film, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Languages, 
  Sliders, 
  Zap,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Cpu,
      title: 'Local Gemma 4 (Ollama)',
      tag: 'Zero Cloud Cost',
      desc: 'Runs completely locally on your hardware. Generates rich structured scripts in Hindi, English, and Hinglish with zero token fees.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: BrainCircuit,
      title: 'Gemini Script Polish',
      tag: 'Optional Enhancement',
      desc: 'With your explicit consent, elevate hooks, tighten pacing, and generate high-converting captions using Google Gemini Flash.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Film,
      title: 'Official HeyGen V3 API',
      tag: 'Studio Avatars',
      desc: 'Direct integration with 50+ photorealistic avatars and 60+ neural voices, rendering broadcast-grade video with perfect lip-sync.',
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: ShieldCheck,
      title: 'Strict Credit Safety Gate',
      tag: 'Budget Protection',
      desc: 'Transparent credit estimation before every render. Zero accidental charges. Every HeyGen job requires your explicit confirmation.',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  const steps = [
    { num: '01', title: 'Input Idea', desc: 'Enter any topic, select your audience, target platform, and language.' },
    { num: '02', title: 'Gemma 4 Scripting', desc: 'Local Gemma 4 constructs hook, scenes, visual cues, and narration.' },
    { num: '03', title: 'User Polish & Approval', desc: 'Fine-tune in the interactive script editor or polish with Gemini.' },
    { num: '04', title: 'HeyGen Rendering', desc: 'Pick your avatar, choose your voice, authorize credits, and render.' },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full nm-pill text-xs font-bold text-indigo-700">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>HeyGen AI Content Creation Hackathon 2026</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-800 tracking-tight leading-tight max-w-4xl mx-auto">
          Turn Raw Ideas into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Studio-Grade Avatar Videos
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          CreatorFlow AI blends local privacy-first AI intelligence with broadcast-quality digital avatars. Generate multilingual scripts in Hindi & English, polish with Gemini, and render with HeyGen V3.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/studio')}
            className="px-8 py-4 nm-button-primary text-sm font-bold flex items-center gap-2.5 rounded-2xl group cursor-pointer"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/diagnostics')}
            className="px-6 py-4 nm-button text-sm font-bold text-slate-700 flex items-center gap-2 rounded-2xl hover:text-indigo-600 cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>Inspect Engine Diagnostics</span>
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Powered by Three Specialized AI Engines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered with strict cost governance, multilingual Hindi support, and broadcast video output.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="nm-card p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl nm-card-sm flex items-center justify-center">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4-Step Pipeline Visual */}
      <section className="nm-card-lg p-8 sm:p-12 space-y-8 bg-[#eef2f7]">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            The Creator Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            From Thought to Published MP4 in 4 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div key={i} className="nm-card-sm p-6 relative flex flex-col gap-3">
              <span className="text-3xl font-black text-indigo-200">
                {st.num}
              </span>
              <h4 className="text-sm font-bold text-slate-800">{st.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Multilingual Highlight */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full nm-pill text-xs font-bold text-violet-700">
            <Languages className="w-4 h-4 text-violet-500" />
            <span>Native Hindi & Multilingual Generation</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">
            Break Language Barriers for Global Creators
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Local Gemma 4 generates authentic Devanagari Hindi scripts tuned for Indian students, entrepreneurs, and content creators. Combined with HeyGen's multilingual avatar lip-sync, your videos speak directly to regional audiences.
          </p>
          <div className="space-y-2 pt-2">
            {[
              'Native Devanagari Hindi generation with college and tech nuance',
              'Smooth Hinglish mixing for relatable, viral social clips',
              'Auto-calculated speaking paces matched to HeyGen avatars',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="nm-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-600">Sample Generated Hook (Hindi)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
              Devanagari
            </span>
          </div>
          <div className="nm-inset p-4 rounded-xl text-slate-800 text-sm font-medium leading-relaxed">
            "जब आप देर रात तक असाइनमेंट्स में जूझ रहे हैं, आपके सहपाठी AI का इस्तेमाल करके लाखों के पैकेज सिक्योर कर रहे हैं! क्या आप पीछे छूट रहे हैं?"
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Avatar: Dante Office 2</span>
            <span>Platform: YouTube (16:9)</span>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="text-center py-6 border-t border-slate-200 text-xs text-slate-400">
        CreatorFlow AI • Built with React 19, FastAPI, HeyGen V3, Local Gemma 4, and Google Gemini
      </section>
    </div>
  );
}
