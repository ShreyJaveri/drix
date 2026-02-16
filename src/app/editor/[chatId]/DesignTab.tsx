"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import {
  Type, Layout, Box, MousePointerClick, Trash2,
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Layers, Move, Eye, EyeOff, Grid, Maximize, Minus
} from "lucide-react";

// --- CONSTANTS ---
const GOOGLE_FONTS = [
  "Inter", "Montserrat", "Poppins", "Oswald", 
  "Playfair Display", "Merriweather", "Cinzel", "Abril Fatface", "Prata",
  "Pacifico", "Caveat", "Shadows Into Light", "Dancing Script",
  "Lobster", "Righteous", "Bangers", "Fredoka One",
  "Space Mono", "VT323"
];

const BORDER_STYLES = ["solid", "dashed", "dotted", "double", "none"];
const DISPLAY_MODES = [
    { value: "block", label: "Block", icon: <Box className="w-3 h-3"/> },
    { value: "flex", label: "Flex", icon: <Layout className="w-3 h-3"/> },
    { value: "grid", label: "Grid", icon: <Grid className="w-3 h-3"/> },
    { value: "inline-block", label: "Inline", icon: <Minus className="w-3 h-3"/> },
    { value: "none", label: "Hidden", icon: <EyeOff className="w-3 h-3"/> },
];

const OBJECT_FITS = ["cover", "contain", "fill", "none", "scale-down"];

interface DesignTabProps {
  selectedTag: string | null;
  selectedStyles: { [key: string]: string };
  selectedContent: string;
  editState: "normal" | "hover";
  setEditState: (state: "normal" | "hover") => void;
  onUpdateStyle: (prop: string, value: string, state: "normal" | "hover") => void;
  onUpdateContent: (text: string) => void;
  onDelete: () => void;
  onAction?: (action: string, value?: string) => void;
}

export function DesignTab({
  selectedTag,
  selectedStyles,
  selectedContent,
  editState,
  setEditState,
  onUpdateStyle,
  onUpdateContent,
  onDelete,
  onAction
}: DesignTabProps) {

  // --- STATE & HELPERS ---
  const isImage = selectedTag === 'img';
  const isSlider = selectedStyles.overflowX === 'auto' || selectedStyles.scrollSnapType?.includes('x');

  const handleStyleChange = (prop: string, value: string) => {
    onUpdateStyle(prop, value, editState);
  };

  const getDisplayValue = (val: string | undefined) => {
    if (!val) return "";
    return val.replace("px", "").replace("rem", "").replace("%", "").replace("vh", "").replace("vw", "");
  };

  const getFontValue = () => {
    if (!selectedStyles.fontFamily) return 'Inter';
    const firstFont = selectedStyles.fontFamily.split(',')[0];
    return firstFont.replace(/['"]/g, "").trim();
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
        <MousePointerClick className="h-10 w-10 mb-3 opacity-20" />
        <p className="text-sm font-medium">Select an element to edit</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 pb-20">
      
      {/* 1. HEADER & IDENTITY */}
      <div className="p-4 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold shadow-sm shadow-blue-200">{selectedTag}</span>
                <div className="flex bg-white rounded border p-0.5">
                    <button onClick={() => setEditState('normal')} className={`text-[10px] px-2 py-0.5 rounded transition ${editState === 'normal' ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-400'}`}>Normal</button>
                    <button onClick={() => setEditState('hover')} className={`text-[10px] px-2 py-0.5 rounded transition ${editState === 'hover' ? 'bg-pink-50 text-pink-600 font-medium' : 'text-slate-400'}`}>Hover</button>
                </div>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={onDelete}><Trash2 className="h-4 w-4"/></Button>
        </div>

        {/* Text Content Edit */}
        {!isImage && !isSlider && (
            <Input 
                className="h-8 text-sm bg-white border-slate-200 focus:border-blue-400 transition" 
                value={selectedContent || ''} 
                onChange={e => onUpdateContent(e.target.value)} 
                placeholder="Edit text content..." 
            />
        )}
      </div>

      {/* 2. IMAGE SOURCE */}
      {isImage && (
        <div className="p-4 space-y-3 bg-blue-50/50 border-b border-blue-100">
            {renderSectionHeader("Image Source", <ImageIcon className="h-3 w-3 text-blue-600"/>)}
            <div className="space-y-2">
                <Input 
                    className="h-8 text-xs bg-white" 
                    placeholder="https://..." 
                    value={selectedStyles.src || ''} 
                    onChange={(e) => onAction && onAction('UPDATE_SRC', e.target.value)}
                />
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Fit:</span>
                    <select className="h-6 flex-1 text-[10px] border rounded bg-white px-1" value={selectedStyles.objectFit || 'cover'} onChange={(e) => handleStyleChange('objectFit', e.target.value)}>
                        {OBJECT_FITS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>
        </div>
      )}

      {/* 3. LAYOUT ENGINE */}
      <div className="p-4 space-y-4">
        {renderSectionHeader("Layout", <Layout className="h-3 w-3"/>)}
        
        {/* Display Mode */}
        <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-md">
            {DISPLAY_MODES.map((mode) => (
                <button 
                    key={mode.value}
                    onClick={() => handleStyleChange('display', mode.value)}
                    className={`flex items-center justify-center h-7 rounded text-slate-500 hover:bg-white transition ${selectedStyles.display === mode.value ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : ''}`}
                    title={mode.label}
                >
                    {mode.icon}
                </button>
            ))}
        </div>

        {/* Flex Controls */}
        {selectedStyles.display === 'flex' && (
            <div className="space-y-3 pt-2 border-t border-dashed border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Direction</span>
                        <select className="h-7 w-full text-[10px] border rounded bg-white px-1" value={selectedStyles.flexDirection || 'row'} onChange={(e) => handleStyleChange('flexDirection', e.target.value)}>
                            <option value="row">Row →</option>
                            <option value="column">Col ↓</option>
                            <option value="row-reverse">Row ←</option>
                            <option value="column-reverse">Col ↑</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Wrap</span>
                        <select className="h-7 w-full text-[10px] border rounded bg-white px-1" value={selectedStyles.flexWrap || 'nowrap'} onChange={(e) => handleStyleChange('flexWrap', e.target.value)}>
                            <option value="nowrap">No Wrap</option>
                            <option value="wrap">Wrap</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Align & Justify</span>
                    <div className="grid grid-cols-2 gap-2">
                        <select className="h-7 w-full text-[10px] border rounded bg-white px-1" value={selectedStyles.alignItems || 'stretch'} onChange={(e) => handleStyleChange('alignItems', e.target.value)}>
                            <option value="flex-start">Align Start</option>
                            <option value="center">Align Center</option>
                            <option value="flex-end">Align End</option>
                            <option value="stretch">Stretch</option>
                        </select>
                        <select className="h-7 w-full text-[10px] border rounded bg-white px-1" value={selectedStyles.justifyContent || 'flex-start'} onChange={(e) => handleStyleChange('justifyContent', e.target.value)}>
                            <option value="flex-start">Justify Start</option>
                            <option value="center">Center</option>
                            <option value="flex-end">End</option>
                            <option value="space-between">Between</option>
                            <option value="space-around">Around</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Gap (px)</span>
                    <Input className="h-7 text-xs" value={getDisplayValue(selectedStyles.gap)} onChange={(e) => handleStyleChange("gap", e.target.value ? e.target.value + 'px' : '')} placeholder="0" />
                </div>
            </div>
        )}

        {/* Grid Controls */}
        {selectedStyles.display === 'grid' && (
            <div className="space-y-3 pt-2 border-t border-dashed border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Columns</span>
                        <Input className="h-7 text-xs" value={selectedStyles.gridTemplateColumns || ''} onChange={(e) => handleStyleChange("gridTemplateColumns", e.target.value)} placeholder="1fr 1fr" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Gap</span>
                        <Input className="h-7 text-xs" value={getDisplayValue(selectedStyles.gap)} onChange={(e) => handleStyleChange("gap", e.target.value ? e.target.value + 'px' : '')} placeholder="16" />
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* 4. TYPOGRAPHY */}
      {!isImage && (
        <div className="p-4 space-y-4 border-t">
            {renderSectionHeader("Typography", <Type className="h-3 w-3"/>)}
            
            <div className="grid grid-cols-[1fr_60px] gap-2">
                  <select 
                    className="h-8 text-xs border rounded bg-white px-2" 
                    value={getFontValue()} 
                    onChange={(e) => {
                        const font = e.target.value;
                        const fallback = ["Pacifico", "Caveat", "Lobster"].includes(font) ? "cursive" : "sans-serif";
                        handleStyleChange('fontFamily', `"${font}", ${fallback}`);
                    }}
                  >
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="relative">
                    <Input className="h-8 text-xs pr-1" value={getDisplayValue(selectedStyles.fontSize)} onChange={(e) => handleStyleChange("fontSize", e.target.value ? e.target.value + 'px' : '')} placeholder="16" />
                    <span className="absolute right-1.5 top-2 text-[8px] text-slate-400">px</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded border flex items-center justify-center bg-white cursor-pointer hover:border-blue-400 shrink-0">
                    <Popover>
                        <PopoverTrigger asChild><div className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: selectedStyles.color || '#000' }} /></PopoverTrigger>
                        <PopoverContent className="w-auto p-3"><HexColorPicker color={selectedStyles.color} onChange={(c) => handleStyleChange("color", c)} /></PopoverContent>
                    </Popover>
                </div>
                <select className="h-8 flex-1 text-xs border rounded bg-white px-2" value={selectedStyles.fontWeight || '400'} onChange={(e) => handleStyleChange('fontWeight', e.target.value)}>
                    <option value="100">Thin (100)</option>
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">SemiBold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="900">Black (900)</option>
                </select>
                <div className="flex bg-slate-100 rounded p-0.5 border shrink-0">
                    <button onClick={() => handleStyleChange('textAlign', 'left')} className={`p-1.5 rounded ${selectedStyles.textAlign === 'left' ? 'bg-white shadow text-black' : 'text-slate-400'}`}><AlignLeft className="h-3.5 w-3.5"/></button>
                    <button onClick={() => handleStyleChange('textAlign', 'center')} className={`p-1.5 rounded ${selectedStyles.textAlign === 'center' ? 'bg-white shadow text-black' : 'text-slate-400'}`}><AlignCenter className="h-3.5 w-3.5"/></button>
                    <button onClick={() => handleStyleChange('textAlign', 'right')} className={`p-1.5 rounded ${selectedStyles.textAlign === 'right' ? 'bg-white shadow text-black' : 'text-slate-400'}`}><AlignRight className="h-3.5 w-3.5"/></button>
                    <button onClick={() => handleStyleChange('textAlign', 'justify')} className={`p-1.5 rounded ${selectedStyles.textAlign === 'justify' ? 'bg-white shadow text-black' : 'text-slate-400'}`}><AlignJustify className="h-3.5 w-3.5"/></button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Line Height</span>
                    <Input className="h-7 text-xs" value={selectedStyles.lineHeight || ''} onChange={(e) => handleStyleChange("lineHeight", e.target.value)} placeholder="1.5" />
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Letter Space (px)</span>
                    <Input className="h-7 text-xs" value={getDisplayValue(selectedStyles.letterSpacing)} onChange={(e) => handleStyleChange("letterSpacing", e.target.value ? e.target.value + 'px' : '')} placeholder="0" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <select className="h-7 w-full text-[10px] border rounded bg-white px-1" value={selectedStyles.textTransform || 'none'} onChange={(e) => handleStyleChange('textTransform', e.target.value)}>
                    <option value="none">Case: Normal</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                </select>
                <select className="h-7 w-full text-[10px] border rounded bg-white px-1" value={selectedStyles.textDecoration || 'none'} onChange={(e) => handleStyleChange('textDecoration', e.target.value)}>
                    <option value="none">Decor: None</option>
                    <option value="underline">Underline</option>
                    <option value="line-through">Strike</option>
                </select>
            </div>
        </div>
      )}

      {/* 5. SIZE & SPACING (Box Model) */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Size & Spacing", <Maximize className="h-3 w-3"/>)}
        <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-2 top-1.5 text-[10px] font-bold text-slate-400">W</span>
                <Input className="h-7 pl-6 text-xs" value={getDisplayValue(selectedStyles.width)} onChange={e => handleStyleChange('width', e.target.value ? e.target.value + (e.target.value === 'auto' || e.target.value.includes('%') ? '' : 'px') : '')} placeholder="auto" />
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1.5 text-[10px] font-bold text-slate-400">H</span>
                <Input className="h-7 pl-6 text-xs" value={getDisplayValue(selectedStyles.height)} onChange={e => handleStyleChange('height', e.target.value ? e.target.value + (e.target.value === 'auto' || e.target.value.includes('%') ? '' : 'px') : '')} placeholder="auto" />
              </div>
        </div>
        
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Margin</span>
                    <Input className="h-7 text-xs" value={getDisplayValue(selectedStyles.margin)} onChange={(e) => handleStyleChange("margin", e.target.value ? e.target.value + 'px' : '')} placeholder="All sides" />
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Padding</span>
                    <Input className="h-7 text-xs" value={getDisplayValue(selectedStyles.padding)} onChange={(e) => handleStyleChange("padding", e.target.value ? e.target.value + 'px' : '')} placeholder="All sides" />
                </div>
            </div>
        </div>
      </div>

      {/* 6. APPEARANCE (Borders & Radius) */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Appearance", <Box className="h-3 w-3"/>)}
        <div className="space-y-4">
            <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Radius</span>
                    <span>{getDisplayValue(selectedStyles.borderRadius)}px</span>
                </div>
                <input type="range" min="0" max="100" className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer" 
                    value={parseInt(getDisplayValue(selectedStyles.borderRadius)) || 0}
                    onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)} 
                />
            </div>
            
            <div className="grid grid-cols-[1fr_1fr_40px] gap-2 items-center">
                <select className="h-7 text-[10px] border rounded bg-white px-1" value={selectedStyles.borderStyle || 'none'} onChange={(e) => handleStyleChange('borderStyle', e.target.value)}>
                    <option value="none">No Border</option>
                    {BORDER_STYLES.filter(s => s !== 'none').map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <div className="relative">
                    <Input className="h-7 text-xs pr-1" value={getDisplayValue(selectedStyles.borderWidth)} onChange={e => handleStyleChange('borderWidth', e.target.value ? e.target.value + 'px' : '')} placeholder="0" />
                    <span className="absolute right-1.5 top-1.5 text-[8px] text-slate-400">px</span>
                </div>
                <div className="h-7 w-full rounded border flex items-center justify-center bg-white cursor-pointer hover:border-blue-400">
                    <Popover>
                        <PopoverTrigger asChild><div className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: selectedStyles.borderColor || 'transparent' }} /></PopoverTrigger>
                        <PopoverContent className="w-auto p-3"><HexColorPicker color={selectedStyles.borderColor} onChange={(c) => handleStyleChange("borderColor", c)} /></PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-slate-200">
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Opacity</span>
                    <div className="flex items-center gap-2">
                        <input type="range" min="0" max="1" step="0.1" className="w-full h-1.5 bg-slate-200 rounded-lg" value={selectedStyles.opacity || 1} onChange={(e) => handleStyleChange("opacity", e.target.value)} />
                        <span className="text-[9px] w-6">{selectedStyles.opacity || 1}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Overflow</span>
                    <select className="h-7 w-full text-[10px] border rounded bg-white" value={selectedStyles.overflow || 'visible'} onChange={(e) => handleStyleChange('overflow', e.target.value)}>
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                        <option value="scroll">Scroll</option>
                        <option value="auto">Auto</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Cursor</span>
                    <select className="h-7 w-full text-[10px] border rounded bg-white" value={selectedStyles.cursor || 'auto'} onChange={(e) => handleStyleChange('cursor', e.target.value)}>
                        <option value="auto">Auto</option>
                        <option value="pointer">Pointer (Hand)</option>
                        <option value="default">Default</option>
                        <option value="move">Move</option>
                        <option value="text">Text</option>
                        <option value="not-allowed">Not Allowed</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* 7. POSITIONING */}
      <div className="p-4 space-y-4 border-t">
        {renderSectionHeader("Positioning", <Move className="h-3 w-3"/>)}
        <div className="space-y-3">
            <select className="h-8 w-full text-xs border rounded bg-white px-2" value={selectedStyles.position || 'static'} onChange={(e) => handleStyleChange('position', e.target.value)}>
                <option value="static">Static (Default)</option>
                <option value="relative">Relative</option>
                <option value="absolute">Absolute</option>
                <option value="fixed">Fixed</option>
                <option value="sticky">Sticky</option>
            </select>
            
            {selectedStyles.position && selectedStyles.position !== 'static' && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="flex items-center gap-2"><ArrowUp className="w-3 h-3 text-slate-400"/><Input className="h-6 text-xs" placeholder="Top" value={getDisplayValue(selectedStyles.top)} onChange={e => handleStyleChange('top', e.target.value ? e.target.value + 'px' : '')}/></div>
                    <div className="flex items-center gap-2"><ArrowDown className="w-3 h-3 text-slate-400"/><Input className="h-6 text-xs" placeholder="Btm" value={getDisplayValue(selectedStyles.bottom)} onChange={e => handleStyleChange('bottom', e.target.value ? e.target.value + 'px' : '')}/></div>
                    <div className="flex items-center gap-2"><ArrowLeft className="w-3 h-3 text-slate-400"/><Input className="h-6 text-xs" placeholder="Left" value={getDisplayValue(selectedStyles.left)} onChange={e => handleStyleChange('left', e.target.value ? e.target.value + 'px' : '')}/></div>
                    <div className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-400"/><Input className="h-6 text-xs" placeholder="Right" value={getDisplayValue(selectedStyles.right)} onChange={e => handleStyleChange('right', e.target.value ? e.target.value + 'px' : '')}/></div>
                    <div className="col-span-2 flex items-center gap-2 border-t pt-2 mt-1">
                        <Layers className="w-3 h-3 text-slate-400"/>
                        <Input className="h-6 text-xs flex-1" placeholder="Z-Index" type="number" value={selectedStyles.zIndex || ''} onChange={e => handleStyleChange('zIndex', e.target.value)}/>
                    </div>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}