```react
import React, { useState, useRef, useEffect } from 'react';

// Theme Presets for One-Click Branding
const PRESETS = [
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    description: 'Tech & AI (Modern Dark Mode)',
    bg: '#0E111A',
    card: '#1B2234',
    text: '#F3F4F6',
    textMuted: '#9CA3AF',
    accent: '#10B981', // Neon Mint
    fontHeader: 'League Spartan',
    fontBody: 'Inter'
  },
  {
    id: 'warm-latte',
    name: 'Warm Latte',
    description: 'Aesthetic, Minimalist, Lifestyle',
    bg: '#FAF7F2',
    card: '#F0E9DC',
    text: '#2D2722',
    textMuted: '#7A7067',
    accent: '#B45309', // Caramel Amber
    fontHeader: 'Playfair Display',
    fontBody: 'Montserrat'
  },
  {
    id: 'wealth-navy',
    name: 'Wealth Navy',
    description: 'Finance, Business, Crypto',
    bg: '#0B132B',
    card: '#1C2541',
    text: '#FFFFFF',
    textMuted: '#8D99AE',
    accent: '#F5A623', // Warm Gold
    fontHeader: 'Archivo Black',
    fontBody: 'Inter'
  },
  {
    id: 'coral-energy',
    name: 'Coral Energy',
    description: 'Fitness, High Impact, Creators',
    bg: '#0A0A0A',
    card: '#1A1A1A',
    text: '#FFFFFF',
    textMuted: '#A3A3A3',
    accent: '#FF4757', // Radiant Coral
    fontHeader: 'Anton',
    fontBody: 'Plus Jakarta Sans'
  },
  {
    id: 'lavender-editorial',
    name: 'Lavender Editorial',
    description: 'Creative, High Fashion, Design',
    bg: '#F5F3FF',
    card: '#EDE9FE',
    text: '#1E1B4B',
    textMuted: '#6D28D9',
    accent: '#EC4899', // Vivid Pink
    fontHeader: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans'
  }
];

// Available Google Fonts (We inject stylesheet links in useEffect)
const FONTS = {
  header: [
    { value: 'League Spartan', name: 'League Spartan (Bold, Tech)' },
    { value: 'Archivo Black', name: 'Archivo Black (Heavy, Modern)' },
    { value: 'Anton', name: 'Anton (Impact, Fitness)' },
    { value: 'Playfair Display', name: 'Playfair Display (Premium, Elegant)' },
    { value: 'Space Grotesk', name: 'Space Grotesk (Sci-Fi, Creator)' },
    { value: 'Plus Jakarta Sans', name: 'Plus Jakarta (Minimalist)' }
  ],
  body: [
    { value: 'Inter', name: 'Inter (Sleek & Professional)' },
    { value: 'Montserrat', name: 'Montserrat (Modern Geometric)' },
    { value: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Premium Clean)' },
    { value: 'Space Grotesk', name: 'Space Grotesk (Stylized)' }
  ]
};

export default function App() {
  // Global Template Customization States
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [themeColors, setThemeColors] = useState({
    bg: PRESETS[0].bg,
    card: PRESETS[0].card,
    text: PRESETS[0].text,
    textMuted: PRESETS[0].textMuted,
    accent: PRESETS[0].accent,
  });
  const [fonts, setFonts] = useState({
    header: PRESETS[0].fontHeader,
    body: PRESETS[0].fontBody
  });

  // Global Content States
  const [branding, setBranding] = useState({
    tag: 'AI & SAAS WORKFLOWS',
    author: 'Aarav Sharma',
    handle: '@aarav_tech',
  });

  const [slidesContent, setSlidesContent] = useState([
    {
      id: 1,
      title: '3 AI Tools You Are Using Wrong.',
      accentWord: 'Wrong.',
      desc: 'Thousands of founders waste 10+ hours weekly doing this the manual way. Here is how to fix it immediately.',
      badge: 'PRO TIPS'
    },
    {
      id: 2,
      wrongTitle: 'THE MANUAL WAY',
      wrongText: 'Copy-pasting ChatGPT outputs directly without formatting or tone correction.',
      rightTitle: 'THE EXPERT WAY',
      rightText: 'Use system prompts to enforce formatting, structural constraints, and clean voice outputs.',
      statLabel: 'TIME SAVED: 80%'
    },
    {
      id: 3,
      tweetText: 'Building in public is not about showing daily graphs. It’s about letting your users inside your development struggles, errors, and key breakthroughs. That builds unbreakable organic trust.',
      likes: '4,821',
      retweets: '842'
    },
    {
      id: 4,
      steps: [
        { num: '01', title: 'Define the prompt goal', body: 'Break down your automation task into micro-agents.' },
        { num: '02', title: 'Setup the Context', body: 'Feed target guidelines, formatting limits and example data.' },
        { num: '03', title: 'Chain multiple runs', body: 'Pass results from previous step directly into the next API.' }
      ]
    },
    {
      id: 5,
      bigStat: '92%',
      statDesc: 'of modern creators struggle with consistency, not skill. Systemizing your assets solves this instantly.',
      progressVal: 92
    },
    {
      id: 6,
      ctaTitle: 'Ready to build high-converting bundles?',
      ctaButton: 'Grab My Free Asset Kit',
      ctaSteps: ['✓ Save this post for later', '✓ Tag a designer in comments', '✓ Click link in bio to copy templates']
    }
  ]);

  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'edit-focus'
  const [activeTab, setActiveTab] = useState('design'); // 'design' | 'content' | 'canva'
  const [copiedColor, setCopiedColor] = useState(null);

  // Load Google Fonts Dynamically
  useEffect(() => {
    const linkId = 'google-fonts-link';
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const fontNames = [
      'League Spartan', 'Archivo Black', 'Anton',
      'Playfair Display', 'Space Grotesk', 'Inter',
      'Montserrat', 'Plus Jakarta Sans'
    ];
    const query = fontNames.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700;800;900`).join('&');
    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
  }, []);

  const handleApplyPreset = (preset) => {
    setActivePreset(preset);
    setThemeColors({
      bg: preset.bg,
      card: preset.card,
      text: preset.text,
      textMuted: preset.textMuted,
      accent: preset.accent,
    });
    setFonts({
      header: preset.fontHeader,
      body: preset.fontBody
    });
    showNotification(`Applied "${preset.name}" styling!`);
  };

  const handleColorChange = (key, value) => {
    setThemeColors(prev => ({ ...prev, [key]: value }));
  };

  const updateSlideContent = (index, field, value) => {
    const newContent = [...slidesContent];
    newContent[index] = { ...newContent[index], [field]: value };
    setSlidesContent(newContent);
  };

  const updateStepContent = (slideIndex, stepIndex, field, value) => {
    const newContent = [...slidesContent];
    const steps = [...newContent[slideIndex].steps];
    steps[stepIndex] = { ...steps[stepIndex], [field]: value };
    newContent[slideIndex] = { ...newContent[slideIndex], steps };
    setSlidesContent(newContent);
  };

  const copyToClipboard = (text, type = 'Hex') => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
    showNotification(`${type} copied to clipboard!`);
  };

  const [notification, setNotification] = useState(null);
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // SVG Export Utility
  const downloadSlideAsSVG = (index) => {
    const svgElement = document.getElementById(`svg-slide-${index}`);
    if (!svgElement) {
      showNotification('Template element not found', 'error');
      return;
    }
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `Slide-${index + 1}-${branding.tag.replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showNotification(`Slide ${index + 1} downloaded as crisp SVG!`);
  };

  // PNG Export Utility using Canvas
  const downloadSlideAsPNG = (index) => {
    const svgElement = document.getElementById(`svg-slide-${index}`);
    if (!svgElement) return;

    showNotification("Rendering high-res PNG...");
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      // Export size optimized for portrait Instagram feed (1080 x 1350)
      canvas.width = 1080;
      canvas.height = 1350;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, 1080, 1350);
      
      const pngURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngURL;
      downloadLink.download = `Canva-Ready-Slide-${index + 1}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showNotification(`Ready! PNG downloaded successfully.`);
    };
    image.src = blobURL;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#090D16] text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* Header Bar */}
      <header className="flex justify-between items-center px-6 py-4 bg-[#0F1626] border-b border-slate-800 shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">CANVA GRAPHICS STUDIO</span>
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Premium Builder</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Design & Export Social Media Bundle Kits Instantly</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-[#192132] rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span>Kit Grid</span>
            </button>
            <button
              onClick={() => setViewMode('edit-focus')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'edit-focus' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Focus Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden w-full">
        
        {/* Left Interactive Control Panel */}
        <aside className="w-80 md:w-[400px] shrink-0 bg-[#0F1626] border-r border-slate-800 flex flex-col overflow-y-auto">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 sticky top-0 bg-[#0F1626] z-10">
            <button 
              onClick={() => setActiveTab('design')}
              className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${activeTab === 'design' ? 'border-indigo-500 text-slate-100 bg-[#161F32]' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
            >
              🎨 Style
            </button>
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${activeTab === 'content' ? 'border-indigo-500 text-slate-100 bg-[#161F32]' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
            >
              ✍️ Content
            </button>
            <button 
              onClick={() => setActiveTab('canva')}
              className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${activeTab === 'canva' ? 'border-indigo-500 text-slate-100 bg-[#161F32]' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
            >
              🔵 Canva Integration
            </button>
          </div>

          <div className="p-6 flex-1 space-y-6">

            {/* DESIGN TAB VIEW */}
            {activeTab === 'design' && (
              <>
                {/* Brand Preset Selector */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">Branding Presets</span>
                    <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded font-bold">1-Click</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyPreset(p)}
                        className={`p-3 rounded-xl border text-left transition-all flex justify-between items-center ${activePreset.id === p.id ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800 bg-[#151D2E] hover:bg-slate-800/80'}`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-200">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.description}</p>
                        </div>
                        <div className="flex space-x-1">
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-700" style={{ backgroundColor: p.bg }}></span>
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-700" style={{ backgroundColor: p.card }}></span>
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-700" style={{ backgroundColor: p.accent }}></span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fine-tune Colors */}
                <div className="border-t border-slate-800 pt-5 space-y-4">
                  <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase block">Custom Color Controls</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Canvas Background</label>
                      <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <input 
                          type="color" 
                          value={themeColors.bg} 
                          onChange={(e) => handleColorChange('bg', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                        />
                        <span className="text-[10px] font-mono uppercase text-slate-300">{themeColors.bg}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Accent Element Color</label>
                      <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <input 
                          type="color" 
                          value={themeColors.accent} 
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                        />
                        <span className="text-[10px] font-mono uppercase text-slate-300">{themeColors.accent}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Card Box Background</label>
                      <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <input 
                          type="color" 
                          value={themeColors.card} 
                          onChange={(e) => handleColorChange('card', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                        />
                        <span className="text-[10px] font-mono uppercase text-slate-300">{themeColors.card}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Primary Text Color</label>
                      <div className="flex items-center space-x-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <input 
                          type="color" 
                          value={themeColors.text} 
                          onChange={(e) => handleColorChange('text', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                        />
                        <span className="text-[10px] font-mono uppercase text-slate-300">{themeColors.text}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography Engine */}
                <div className="border-t border-slate-800 pt-5 space-y-4">
                  <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase block">Typography Engines</span>
                  
                  <div className="space-y-3">
