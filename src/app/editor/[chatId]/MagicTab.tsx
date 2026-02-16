"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { 
  Sparkles, Palette, Zap, Aperture, ArrowRight, Image as ImageIcon, 
  Layers, Droplet, Scissors, Sun, Moon, CloudFog, Circle, Type, 
  Move3d, BoxSelect, Grid, PaintBucket, FlipVertical
} from "lucide-react";

// --- CONSTANTS ---
const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten", 
  "color-dodge", "color-burn", "hard-light", "soft-light", 
  "difference", "exclusion", "hue", "saturation", "color", "luminosity"
];

const BG_ATTACHMENTS = ["scroll", "fixed", "local"];

const CLIP_PATHS = [
  { name: "None", value: "none" },
  { name: "Circle", value: "circle(50% at 50% 50%)" },
  { name: "Ellipse", value: "ellipse(50% 50% at 50% 50%)" },
  { name: "Triangle", value: "polygon(50% 0%, 0% 100%, 100% 100%)" },
  { name: "Diamond", value: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  { name: "Trapezoid", value: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" },
  { name: "Hexagon", value: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" },
  { name: "Star", value: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" },
  { name: "Rabbet", value: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)" },
];

const SHADOW_PRESETS = {
  "None": "none",
  "Soft": "0 4px 20px -2px rgba(0,0,0,0.1)",
  "Float": "0 10px 40px -10px rgba(0,0,0,0.2)",
  "Glow": "0 0 20px rgba(59, 130, 246, 0.6)",
  "Hard": "4px 4px 0px 0px rgba(0,0,0,1)",
  "Inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  "3D": "0 5px 0px 0px #000",
  "Neumorph": "20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff"
};

const PATTERNS = [
  { name: "Polka", value: "radial-gradient(#e5e7eb 2px, transparent 2.5px)" },
  { name: "Grid", value: "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)" },
  { name: "Checks", value: "conic-gradient(#e5e7eb 90deg, transparent 90deg 180deg, #e5e7eb 180deg 270deg, transparent 270deg)" },
  { name: "Stripes", value: "linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 50%, #f3f4f6 50%, #f3f4f6 75%, transparent 75%, transparent)" }
];

interface MagicTabProps {
  selectedTag: string | null;
  selectedStyles: { [key: string]: string };
  onUpdateStyle: (prop: string, value: string, state: "normal" | "hover") => void;
  editState: "normal" | "hover";
}

export function MagicTab({ selectedTag, selectedStyles, onUpdateStyle, editState }: MagicTabProps) {
  // --- STATE ---
  const [bgType, setBgType] = useState<"solid" | "gradient" | "image" | "pattern">("solid");
  const [gradType, setGradType] = useState<"linear" | "radial" | "conic">("linear");
  const [gradAngle, setGradAngle] = useState(90);
  const [gradColor1, setGradColor1] = useState("#3b82f6");
  const [gradColor2, setGradColor2] = useState("#9333ea");
  
  // Shadow State
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowSpread, setShadowSpread] = useState(0);
  const [shadowColor, setShadowColor] = useState("rgba(0,0,0,0.1)");

  // Text Shadow State
  const [tShadowX, setTShadowX] = useState(2);
  const [tShadowY, setTShadowY] = useState(2);
  const [tShadowBlur, setTShadowBlur] = useState(4);
  const [tShadowColor, setTShadowColor] = useState("rgba(0,0,0,0.3)");

  // Transform State
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(1);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleStyleChange = (prop: string, value: string) => {
    onUpdateStyle(prop, value, editState);
  };

  const getDisplayValue = (val: string | undefined) => {
    if (!val) return "";
    return val.replace("px", "").replace("%", "").replace("deg", "");
  };

  const applyGradient = () => {
    let type = '';
    if (gradType === 'linear') type = `linear-gradient(${gradAngle}deg,`;
    else if (gradType === 'radial') type = 'radial-gradient(circle at center,';
    else type = 'conic-gradient(from 0deg,';
    
    handleStyleChange('backgroundImage', `${type} ${gradColor1}, ${gradColor2})`);
  };

  const applyPattern = (patternVal: string) => {
    handleStyleChange('backgroundImage', patternVal);
    handleStyleChange('backgroundSize', '20px 20px');
  };

  const applyShadow = () => {
    handleStyleChange('boxShadow', `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`);
  };

  const applyTextShadow = () => {
    handleStyleChange('textShadow', `${tShadowX}px ${tShadowY}px ${tShadowBlur}px ${tShadowColor}`);
  };

  const applyTransform = () => {
    const r = rotate !== 0 ? `rotate(${rotate}deg)` : '';
    const s = scale !== 1 ? `scale(${scale})` : '';
    const sk = (skewX !== 0 || skewY !== 0) ? `skew(${skewX}deg, ${skewY}deg)` : '';
    const rx = rotateX !== 0 ? `rotateX(${rotateX}deg)` : '';
    const ry = rotateY !== 0 ? `rotateY(${rotateY}deg)` : '';
    
    const transformString = `${r} ${s} ${sk} ${rx} ${ry}`.trim();
    handleStyleChange('transform', transformString);
  };

  const toggleGradientText = () => {
    handleStyleChange('backgroundImage', `linear-gradient(90deg, ${gradColor1}, ${gradColor2})`);
    handleStyleChange('backgroundClip', 'text');
    handleStyleChange('WebkitBackgroundClip', 'text');
    handleStyleChange('color', 'transparent');
  };

  const applyGlassmorphism = () => {
    handleStyleChange('backgroundColor', 'rgba(255, 255, 255, 0.1)');
    handleStyleChange('backdropFilter', 'blur(10px) saturate(150%)');
    handleStyleChange('border', '1px solid rgba(255, 255, 255, 0.2)');
    handleStyleChange('boxShadow', '0 8px 32px 0 rgba(31, 38, 135, 0.15)');
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
    </div>
  );

  if (!selectedTag) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 text-slate-400">
        <Sparkles className="h-10 w-10 mb-3 opacity-20 text-purple-500" />
        <p className="text-sm font-medium">Magic Tools</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 pb-20">
      
      {/* 1. BACKGROUND ENGINE */}
      <div className="p-4 space-y-4">
        {renderSectionHeader("Background Engine", <Palette className="h-3 w-3"/>)}
        
        {/* Mode Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-lg mb-3">
            <button onClick={() => setBgType("solid")} className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition ${bgType === 'solid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Solid</button>
            <button onClick={() => setBgType("gradient")} className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition ${bgType === 'gradient' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500'}`}>Grad</button>
            <button onClick={() => setBgType("pattern")} className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition ${bgType === 'pattern' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500'}`}>Patt</button>
            <button onClick={() => setBgType("image")} className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition ${bgType === 'image' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Img</button>
        </div>

        {/* Solid Color */}
        {bgType === 'solid' && (
             <div className="flex items-center gap-3">
                <Popover>
                    <PopoverTrigger asChild><div className="h-9 w-full rounded-md border shadow-sm cursor-pointer" style={{ backgroundColor: selectedStyles.backgroundColor || 'transparent' }} /></PopoverTrigger>
                    <PopoverContent className="w-auto p-3"><HexColorPicker color={selectedStyles.backgroundColor} onChange={(c) => handleStyleChange("backgroundColor", c)} /></PopoverContent>
                </Popover>
                <Input className="h-9 w-24 text-xs font-mono" value={selectedStyles.backgroundColor} onChange={e => handleStyleChange('backgroundColor', e.target.value)} placeholder="#HEX" />
             </div>
        )}

        {/* Gradient Tools */}
        {bgType === 'gradient' && (
            <div className="space-y-3">
                <div className="flex gap-2 mb-2">
                     <select className="h-7 w-full text-[10px] border rounded bg-white" value={gradType} onChange={(e) => { setGradType(e.target.value as any); setTimeout(applyGradient, 0); }}>
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                        <option value="conic">Conic</option>
                    </select>
                    {gradType === 'linear' && (
                        <div className="flex items-center gap-1 w-20">
                            <Input className="h-7 text-xs text-center px-1" type="number" value={gradAngle} onChange={e => { setGradAngle(Number(e.target.value)); setTimeout(applyGradient, 0); }} />
                            <span className="text-[10px] text-slate-400">deg</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 items-center">
                    <Popover>
                        <PopoverTrigger asChild><div className="h-8 flex-1 rounded border shadow-sm cursor-pointer" style={{ backgroundColor: gradColor1 }} /></PopoverTrigger>
                        <PopoverContent className="w-auto p-3"><HexColorPicker color={gradColor1} onChange={(c) => { setGradColor1(c); setTimeout(applyGradient, 100); }} /></PopoverContent>
                    </Popover>
                    <ArrowRight className="h-4 w-4 text-slate-300"/>
                    <Popover>
                        <PopoverTrigger asChild><div className="h-8 flex-1 rounded border shadow-sm cursor-pointer" style={{ backgroundColor: gradColor2 }} /></PopoverTrigger>
                        <PopoverContent className="w-auto p-3"><HexColorPicker color={gradColor2} onChange={(c) => { setGradColor2(c); setTimeout(applyGradient, 100); }} /></PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={applyGradient}>Apply</Button>
                    <Button size="sm" variant="secondary" className="text-[10px] h-7 bg-purple-50 text-purple-600 hover:bg-purple-100" onClick={toggleGradientText}>Text Gradient</Button>
                </div>
            </div>
        )}

        {/* Pattern Tools */}
        {bgType === 'pattern' && (
            <div className="grid grid-cols-2 gap-2">
                {PATTERNS.map(pat => (
                    <button key={pat.name} onClick={() => applyPattern(pat.value)} className="h-8 border rounded text-[10px] hover:border-blue-400 hover:text-blue-600 transition">
                        {pat.name}
                    </button>
                ))}
            </div>
        )}

        {/* Background Image Tools */}
        {bgType === 'image' && (
            <div className="space-y-3">
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">URL</span>
                    <Input className="h-7 text-xs" value={selectedStyles.backgroundImage?.replace('url("', '').replace('")', '') || ''} onChange={(e) => handleStyleChange('backgroundImage', `url("${e.target.value}")`)} placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Size</span>
                        <select className="h-7 w-full text-[10px] border rounded bg-white" value={selectedStyles.backgroundSize || 'cover'} onChange={(e) => handleStyleChange('backgroundSize', e.target.value)}>
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                            <option value="100% 100%">Fill</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Attachment</span>
                        <select className="h-7 w-full text-[10px] border rounded bg-white" value={selectedStyles.backgroundAttachment || 'scroll'} onChange={(e) => handleStyleChange('backgroundAttachment', e.target.value)}>
                            {BG_ATTACHMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* 2. TEXT MAGIC */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Typography Effects", <Type className="h-3 w-3"/>)}
        <div className="space-y-3">
             {/* Text Stroke */}
             <div className="grid grid-cols-[1fr_40px] gap-2 items-center">
                 <div className="space-y-1">
                     <span className="text-[10px] text-slate-400">Stroke (Outline)</span>
                     <Input className="h-7 text-xs" placeholder="1px" onChange={(e) => handleStyleChange('WebkitTextStrokeWidth', e.target.value)} />
                 </div>
                 <div className="h-7 w-full mt-4 rounded border flex items-center justify-center bg-white cursor-pointer hover:border-blue-400">
                    <Popover>
                        <PopoverTrigger asChild><div className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: selectedStyles.WebkitTextStrokeColor || 'transparent' }} /></PopoverTrigger>
                        <PopoverContent className="w-auto p-3"><HexColorPicker color={selectedStyles.WebkitTextStrokeColor} onChange={(c) => handleStyleChange("WebkitTextStrokeColor", c)} /></PopoverContent>
                    </Popover>
                 </div>
             </div>

             {/* Text Shadow */}
             <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-2">
                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500">Text Shadow</span></div>
                <div className="flex gap-1">
                    <Input className="h-6 text-xs" type="number" placeholder="X" value={tShadowX} onChange={e => setTShadowX(Number(e.target.value))} />
                    <Input className="h-6 text-xs" type="number" placeholder="Y" value={tShadowY} onChange={e => setTShadowY(Number(e.target.value))} />
                    <Input className="h-6 text-xs" type="number" placeholder="Blur" value={tShadowBlur} onChange={e => setTShadowBlur(Number(e.target.value))} />
                </div>
                <div className="flex gap-2 items-center">
                     <div className="h-6 w-full rounded border cursor-pointer" style={{ backgroundColor: tShadowColor }}>
                        <Popover>
                            <PopoverTrigger asChild><div className="w-full h-full opacity-0"></div></PopoverTrigger>
                            <PopoverContent className="w-auto p-3"><HexColorPicker color={tShadowColor} onChange={setTShadowColor} /></PopoverContent>
                        </Popover>
                    </div>
                    <Button size="sm" className="h-6 text-[10px]" variant="secondary" onClick={applyTextShadow}>Apply</Button>
                </div>
             </div>
        </div>
      </div>

      {/* 3. 3D TRANSFORMS */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("3D Transforms", <Move3d className="h-3 w-3"/>)}
        <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Rotate Z</span><span>{rotate}°</span></div>
                    <input type="range" min="-180" max="180" className="w-full h-1.5 bg-slate-200 rounded-lg accent-purple-600" value={rotate} onChange={(e) => { setRotate(Number(e.target.value)); setTimeout(applyTransform, 50); }} />
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Scale</span><span>{scale}</span></div>
                    <input type="range" min="0" max="3" step="0.1" className="w-full h-1.5 bg-slate-200 rounded-lg accent-blue-600" value={scale} onChange={(e) => { setScale(Number(e.target.value)); setTimeout(applyTransform, 50); }} />
                 </div>
             </div>
             {/* 3D Rotations */}
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Rotate X (3D)</span><span>{rotateX}°</span></div>
                    <input type="range" min="-90" max="90" className="w-full h-1.5 bg-slate-200 rounded-lg accent-pink-500" value={rotateX} onChange={(e) => { setRotateX(Number(e.target.value)); setTimeout(applyTransform, 50); }} />
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Rotate Y (3D)</span><span>{rotateY}°</span></div>
                    <input type="range" min="-90" max="90" className="w-full h-1.5 bg-slate-200 rounded-lg accent-pink-500" value={rotateY} onChange={(e) => { setRotateY(Number(e.target.value)); setTimeout(applyTransform, 50); }} />
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Skew X</span><span>{skewX}°</span></div>
                    <input type="range" min="-45" max="45" className="w-full h-1.5 bg-slate-200 rounded-lg accent-orange-500" value={skewX} onChange={(e) => { setSkewX(Number(e.target.value)); setTimeout(applyTransform, 50); }} />
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Skew Y</span><span>{skewY}°</span></div>
                    <input type="range" min="-45" max="45" className="w-full h-1.5 bg-slate-200 rounded-lg accent-orange-500" value={skewY} onChange={(e) => { setSkewY(Number(e.target.value)); setTimeout(applyTransform, 50); }} />
                 </div>
             </div>
             <div className="space-y-1 pt-1 border-t border-dashed border-slate-200">
                 <span className="text-[10px] text-slate-400">Perspective (Depth)</span>
                 <Input className="h-7 text-xs" placeholder="1000px" onChange={(e) => handleStyleChange('perspective', e.target.value)} />
             </div>
        </div>
      </div>

      {/* 4. FILTER LAB */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Filter Lab", <Aperture className="h-3 w-3"/>)}
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span className="flex gap-1 items-center"><Droplet className="w-3 h-3"/> Blur</span></div>
                    <input type="range" min="0" max="20" className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg" 
                        onChange={(e) => handleStyleChange('filter', `blur(${e.target.value}px)`)} />
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span className="flex gap-1 items-center"><Sun className="w-3 h-3"/> Brightness</span></div>
                    <input type="range" min="0" max="200" defaultValue="100" className="w-full accent-orange-500 h-1.5 bg-slate-200 rounded-lg" 
                        onChange={(e) => handleStyleChange('filter', `brightness(${e.target.value}%)`)} />
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span className="flex gap-1 items-center"><Palette className="w-3 h-3"/> Saturation</span></div>
                    <input type="range" min="0" max="200" defaultValue="100" className="w-full accent-pink-500 h-1.5 bg-slate-200 rounded-lg" 
                        onChange={(e) => handleStyleChange('filter', `saturate(${e.target.value}%)`)} />
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span className="flex gap-1 items-center"><Moon className="w-3 h-3"/> Invert</span></div>
                    <input type="range" min="0" max="100" defaultValue="0" className="w-full accent-gray-900 h-1.5 bg-slate-200 rounded-lg" 
                        onChange={(e) => handleStyleChange('filter', `invert(${e.target.value}%)`)} />
                 </div>
            </div>
            
            {/* Glassmorphism Section */}
            <div className="pt-2 border-t border-dashed border-slate-200">
                <div className="flex justify-between text-[10px] text-slate-500 mb-2"><span className="flex gap-1 items-center"><CloudFog className="w-3 h-3"/> Glass Effect (Backdrop)</span><span>{selectedStyles.backdropFilter || '0'}</span></div>
                <div className="space-y-2">
                    <input type="range" min="0" max="40" className="w-full accent-cyan-500 h-1.5 bg-slate-200 rounded-lg" 
                        onChange={(e) => handleStyleChange('backdropFilter', `blur(${e.target.value}px)`)} />
                    <Button size="sm" variant="secondary" className="w-full h-7 text-[10px] bg-cyan-50 text-cyan-600 hover:bg-cyan-100" onClick={applyGlassmorphism}>
                        ✨ Apply Glassmorphism Preset
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* 5. OUTLINE STUDIO */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Outline Studio", <BoxSelect className="h-3 w-3"/>)}
        <div className="grid grid-cols-[1fr_1fr_40px] gap-2 items-center">
            <select className="h-7 text-[10px] border rounded bg-white px-1" onChange={(e) => handleStyleChange('outlineStyle', e.target.value)}>
                <option value="none">None</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
            </select>
            <div className="relative">
                <Input className="h-7 text-xs pr-1" placeholder="Offset" onChange={e => handleStyleChange('outlineOffset', e.target.value + 'px')} />
            </div>
            <div className="h-7 w-full rounded border flex items-center justify-center bg-white cursor-pointer hover:border-blue-400">
                <Popover>
                    <PopoverTrigger asChild><div className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: selectedStyles.outlineColor || 'transparent' }} /></PopoverTrigger>
                    <PopoverContent className="w-auto p-3"><HexColorPicker color={selectedStyles.outlineColor} onChange={(c) => handleStyleChange("outlineColor", c)} /></PopoverContent>
                </Popover>
            </div>
        </div>
      </div>

      {/* 6. SHADOW STUDIO */}
      <div className="p-4 space-y-4 border-t">
         {renderSectionHeader("Shadow Studio", <Zap className="h-3 w-3"/>)}
         
         <div className="grid grid-cols-4 gap-1 mb-3">
            {Object.entries(SHADOW_PRESETS).map(([name, val]) => (
                <button key={name} onClick={() => handleStyleChange('boxShadow', val)} className="text-[9px] border rounded py-1 hover:bg-blue-50 hover:text-blue-600 transition">{name}</button>
            ))}
         </div>

         <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-2">
            <div className="flex gap-2">
                <Input className="h-6 text-xs" type="number" placeholder="X" value={shadowX} onChange={e => setShadowX(Number(e.target.value))} />
                <Input className="h-6 text-xs" type="number" placeholder="Y" value={shadowY} onChange={e => setShadowY(Number(e.target.value))} />
                <Input className="h-6 text-xs" type="number" placeholder="Blur" value={shadowBlur} onChange={e => setShadowBlur(Number(e.target.value))} />
                <Input className="h-6 text-xs" type="number" placeholder="Spr" value={shadowSpread} onChange={e => setShadowSpread(Number(e.target.value))} />
            </div>
            <div className="flex gap-2 items-center pt-1">
                <div className="h-6 w-full rounded border cursor-pointer" style={{ backgroundColor: shadowColor }}>
                    <Popover>
                        <PopoverTrigger asChild><div className="w-full h-full opacity-0"></div></PopoverTrigger>
                        <PopoverContent className="w-auto p-3"><HexColorPicker color={shadowColor} onChange={setShadowColor} /></PopoverContent>
                    </Popover>
                </div>
                <Button size="sm" className="h-6 text-[10px] ml-auto" variant="secondary" onClick={applyShadow}>Apply Custom</Button>
            </div>
            {/* Reflection Tool */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex gap-1 items-center"><FlipVertical className="w-3 h-3"/> Reflection</span>
                <button className="text-[9px] text-blue-600 hover:underline" onClick={() => handleStyleChange('WebkitBoxReflect', 'below 0px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.4))')}>Add Mirror</button>
            </div>
         </div>
      </div>

      {/* 7. CREATIVE EFFECTS */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Creative Effects", <Layers className="h-3 w-3"/>)}
        <div className="space-y-3">
             <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500"><span>Global Opacity</span><span>{selectedStyles.opacity || 1}</span></div>
                <input type="range" min="0" max="1" step="0.05" className="w-full accent-slate-600 h-1.5 bg-slate-200 rounded-lg" 
                  onChange={(e) => handleStyleChange('opacity', e.target.value)} />
             </div>

             <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Mix Blend Mode</span>
                <select className="h-7 w-full text-[10px] border rounded bg-white px-1" value={selectedStyles.mixBlendMode || 'normal'} onChange={(e) => handleStyleChange('mixBlendMode', e.target.value)}>
                    {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>

             <div className="space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Scissors className="w-3 h-3"/> Masking (Clip Path)</span>
                <div className="grid grid-cols-3 gap-1">
                    {CLIP_PATHS.map(p => (
                        <button key={p.name} onClick={() => handleStyleChange('clipPath', p.value)} className={`text-[9px] border rounded py-1 hover:bg-slate-100 ${selectedStyles.clipPath === p.value ? 'bg-blue-50 border-blue-300' : ''}`}>
                            {p.name}
                        </button>
                    ))}
                </div>
             </div>
        </div>
      </div>

    </div>
  );
}