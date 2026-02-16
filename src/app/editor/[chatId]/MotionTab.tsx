"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  PlayCircle, Activity, Repeat, MousePointerClick, 
  Move, Zap, Clock, Anchor, Hand, ArrowRight, RotateCcw
} from "lucide-react";

// --- CONSTANTS ---

const ANIMATION_CATEGORIES = {
  "Fades": ["fadeIn", "fadeInUp", "fadeInDown", "fadeInLeft", "fadeInRight"],
  "Slides": ["slideUp", "slideDown", "slideLeft", "slideRight"],
  "Zooms": ["zoomIn", "zoomOut", "zoomInUp", "zoomInDown"],
  "Bounces": ["bounce", "bounceIn", "bounceInUp", "bounceInDown"],
  "Flips": ["flip", "flipInX", "flipInY"],
  "Specials": ["pulse", "shake", "wiggle", "spin", "heartbeat", "flash"]
};

const EASINGS = [
  { label: "Linear", value: "linear" },
  { label: "Ease (Default)", value: "ease" },
  { label: "Ease In (Accel)", value: "ease-in" },
  { label: "Ease Out (Decel)", value: "ease-out" },
  { label: "Ease In Out", value: "ease-in-out" },
  { label: "Spring/Bounce", value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" },
  { label: "Snappy", value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
];

const ORIGINS = [
  "top left", "top center", "top right",
  "center left", "center center", "center right",
  "bottom left", "bottom center", "bottom right"
];

interface MotionTabProps {
  selectedTag: string | null;
  selectedStyles: { [key: string]: string };
  onUpdateStyle: (prop: string, value: string, state: "normal" | "hover") => void;
  editState: "normal" | "hover";
}

export function MotionTab({ selectedTag, selectedStyles, onUpdateStyle, editState }: MotionTabProps) {

  const [activeCategory, setActiveCategory] = useState("Fades");

  const handleStyleChange = (prop: string, value: string) => {
    onUpdateStyle(prop, value, editState);
  };

  const getDisplayValue = (val: string | undefined) => {
    if (!val) return "";
    return val.replace("px", "").replace("ms", "").replace("deg", "").replace("s", "");
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
    </div>
  );

  const applyPreset = (type: "lift" | "press" | "wiggle" | "glow") => {
    handleStyleChange('transition', 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)');
    
    if (type === 'lift') {
        handleStyleChange('transform', 'translateY(-5px)');
        handleStyleChange('boxShadow', '0 10px 20px rgba(0,0,0,0.1)');
    } else if (type === 'press') {
        handleStyleChange('transform', 'scale(0.95)');
        handleStyleChange('opacity', '0.8');
    } else if (type === 'wiggle') {
        handleStyleChange('animation', 'wiggle 1s ease infinite');
    } else if (type === 'glow') {
        handleStyleChange('boxShadow', '0 0 15px rgba(59, 130, 246, 0.6)');
    }
  };

  const replayAnimation = () => {
    const currentAnim = selectedStyles.animationName;
    handleStyleChange('animationName', 'none');
    setTimeout(() => {
        handleStyleChange('animationName', currentAnim);
    }, 50);
  };

  if (!selectedTag) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 text-slate-400">
        <Activity className="h-10 w-10 mb-3 opacity-20 text-blue-500" />
        <p className="text-sm font-medium">Motion Tools</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 pb-20">
      
      {/* 1. KEYFRAME ANIMATION (ON LOAD) */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
            {renderSectionHeader("Entry Animation", <PlayCircle className="h-3 w-3"/>)}
            <button onClick={replayAnimation} className="text-[10px] text-blue-600 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 transition">
                <RotateCcw className="w-3 h-3" /> Replay
            </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 mb-2">
            {Object.keys(ANIMATION_CATEGORIES).map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[9px] px-2 py-1 rounded border transition ${activeCategory === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Animation Selector */}
        <div className="grid grid-cols-2 gap-2">
            {/* @ts-expect-error - indexing object with string */}
            {ANIMATION_CATEGORIES[activeCategory].map((anim: string) => (
                <button 
                    key={anim}
                    onClick={() => {
                        handleStyleChange('animationName', anim);
                        handleStyleChange('animationDuration', '1s');
                        handleStyleChange('animationFillMode', 'both');
                    }}
                    className={`text-[10px] py-1.5 border rounded capitalize hover:border-blue-400 transition ${selectedStyles.animationName === anim ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white'}`}
                >
                    {anim.replace(/([A-Z])/g, ' $1').trim()}
                </button>
            ))}
        </div>

        {/* Timing Controls */}
        <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span className="flex gap-1 items-center"><Clock className="w-3 h-3"/> Duration</span><span>{getDisplayValue(selectedStyles.animationDuration) || 0}s</span></div>
                    <input type="range" min="0" max="5" step="0.1" className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg" value={parseFloat(getDisplayValue(selectedStyles.animationDuration)) || 0} onChange={(e) => handleStyleChange('animationDuration', `${e.target.value}s`)} />
                </div>
                <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Delay</span><span>{getDisplayValue(selectedStyles.animationDelay) || 0}s</span></div>
                    <input type="range" min="0" max="5" step="0.1" className="w-full accent-orange-500 h-1.5 bg-slate-200 rounded-lg" value={parseFloat(getDisplayValue(selectedStyles.animationDelay)) || 0} onChange={(e) => handleStyleChange('animationDelay', `${e.target.value}s`)} />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Loop</span>
                    <button 
                        onClick={() => handleStyleChange('animationIterationCount', selectedStyles.animationIterationCount === 'infinite' ? '1' : 'infinite')}
                        className={`h-7 w-full border rounded text-[10px] flex items-center justify-center gap-1 transition ${selectedStyles.animationIterationCount === 'infinite' ? 'bg-purple-50 border-purple-500 text-purple-600' : 'bg-white'}`}
                    >
                        <Repeat className="h-3 w-3"/> {selectedStyles.animationIterationCount === 'infinite' ? 'Infinite' : 'Once'}
                    </button>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Anchor</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="h-7 w-full border rounded text-[10px] bg-white flex items-center justify-center gap-1 hover:bg-slate-50">
                                <Anchor className="w-3 h-3" /> {selectedStyles.transformOrigin || 'Center'}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-2">
                            <div className="grid grid-cols-3 gap-1">
                                {ORIGINS.map(o => (
                                    <div key={o} onClick={() => handleStyleChange('transformOrigin', o)} className={`h-6 w-6 rounded cursor-pointer border ${selectedStyles.transformOrigin === o ? 'bg-blue-50 border-blue-600' : 'bg-slate-100 hover:bg-slate-200'}`} title={o} />
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
      </div>

      {/* 2. TRANSITIONS (HOVER & PHYSICS) */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Transition Physics", <Move className="h-3 w-3"/>)}
        <div className="space-y-3">
             <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Easing Curve</span>
                <select 
                    className="h-7 w-full text-[10px] border rounded bg-white px-1"
                    value={selectedStyles.transitionTimingFunction || 'ease'}
                    onChange={(e) => handleStyleChange('transitionTimingFunction', e.target.value)}
                >
                    {EASINGS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Speed</span><span>{getDisplayValue(selectedStyles.transitionDuration) || 0}s</span></div>
                    <input type="range" min="0" max="2" step="0.1" className="w-full accent-green-500 h-1.5 bg-slate-200 rounded-lg" value={parseFloat(getDisplayValue(selectedStyles.transitionDuration)) || 0} onChange={(e) => handleStyleChange('transitionDuration', `${e.target.value}s`)} />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 opacity-0">.</span>
                    <Button size="sm" variant="outline" className="w-full h-5 text-[10px]" onClick={() => {
                        handleStyleChange('transitionProperty', 'all');
                        handleStyleChange('transitionDuration', '0.3s');
                        handleStyleChange('transitionTimingFunction', 'ease');
                    }}>Reset to Default</Button>
                 </div>
             </div>
        </div>
      </div>

      {/* 3. INTERACTION PRESETS */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Micro-Interactions", <Hand className="h-3 w-3"/>)}
        
        <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={() => applyPreset('lift')}
                className="p-3 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group text-left"
            >
                <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-xs text-slate-700">Lift Up</span>
                    <ArrowRight className="-rotate-45 w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">Elevates element on hover.</p>
            </button>

            <button 
                onClick={() => applyPreset('press')}
                className="p-3 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group text-left"
            >
                <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-xs text-slate-700">Button Press</span>
                    <MousePointerClick className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">Shrinks slightly on active.</p>
            </button>

            <button 
                onClick={() => applyPreset('wiggle')}
                className="p-3 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group text-left"
            >
                <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-xs text-slate-700">Attention</span>
                    <Activity className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">Wiggles to grab attention.</p>
            </button>

            <button 
                onClick={() => applyPreset('glow')}
                className="p-3 border rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group text-left"
            >
                <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-xs text-slate-700">Glow</span>
                    <Zap className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">Emits light on hover.</p>
            </button>
        </div>
        
        <div className="text-[10px] text-slate-400 text-center italic mt-2">
            Tip: Switch "Edit Mode" to Hover/Active to see effects live.
        </div>
      </div>

    </div>
  );
}