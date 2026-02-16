"use client";

import React, { useState, useMemo, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, ChevronLeft, Type, MousePointer2, 
  CreditCard, Plus, PanelTop, GalleryHorizontal, LayoutTemplate, 
  Image as ImageIcon, Heading, Star, UploadCloud, Link as LinkIcon,
  RefreshCw
} from "lucide-react";
import * as LucideIcons from "lucide-react";

// ==========================================
// 1. BUTTON LIBRARY
// ==========================================
const BUTTON_STYLES = [
  { 
    category: "Modern & Clean",
    items: [
      { name: "Pill Primary", html: `<button class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1">Get Started</button>` },
      { name: "Soft Indigo", html: `<button class="px-6 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold rounded-lg transition-colors border border-indigo-100">Learn More</button>` },
      { name: "Outline Sharp", html: `<button class="px-8 py-3 border-2 border-slate-900 text-slate-900 font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors text-xs">Read Story</button>` },
      { name: "Ghost Minimal", html: `<button class="px-4 py-2 text-slate-500 hover:text-slate-900 font-medium transition-colors relative group">No Thanks<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all group-hover:w-full"></span></button>` },
      { name: "Elevated White", html: `<button class="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all">Shadow Button</button>` },
    ]
  },
  {
    category: "3D & Retro",
    items: [
      { name: "8-Bit Retro", html: `<button class="px-6 py-3 font-mono font-bold bg-red-500 text-white border-b-4 border-r-4 border-red-900 hover:border-b-0 hover:border-r-0 hover:translate-y-1 hover:translate-x-1 transition-all active:border-0 rounded-none">PRESS START</button>` },
      { name: "Gumroad Style", html: `<button class="px-8 py-3 bg-[#ff90e8] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-bold text-black rounded-lg">Buy Design</button>` },
      { name: "Neumorphic", html: `<button class="px-8 py-4 bg-slate-200 text-slate-600 font-bold rounded-xl shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] transition-shadow">Soft UI</button>` },
      { name: "Classic 3D", html: `<button class="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg border-b-[6px] border-emerald-700 active:border-b-0 active:translate-y-1.5 transition-all">Click Me</button>` },
      { name: "Windows 95", html: `<button class="px-6 py-2 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black font-bold active:bg-[#a0a0a0] outline-1 outline-[#808080]">OK</button>` },
    ]
  },
  {
    category: "Special Effects",
    items: [
      { name: "Neon Glow", html: `<button class="relative px-8 py-3 bg-slate-900 text-white font-bold rounded-lg group overflow-hidden"><span class="absolute inset-0 w-full h-full bg-linear-to-r from-purple-500 via-blue-500 to-purple-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></span><span class="relative z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Neon Glow</span></button>` },
      { name: "Shimmer", html: `<button class="relative px-8 py-3 bg-slate-900 text-white font-bold rounded-lg overflow-hidden group"><span class="absolute top-0 left-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span><span class="relative z-10">Hover Me</span><style>@keyframes shimmer { 100% { transform: translateX(100%); } }</style></button>` },
      { name: "Magnetic Border", html: `<button class="relative p-0.5 rounded-lg bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 hover:scale-105 transition-transform"><div class="px-8 py-3 bg-white rounded-[6px] font-bold text-slate-800">Gradient Border</div></button>` },
      { name: "Glitch Effect", html: `<button class="relative px-8 py-3 font-mono font-bold text-white bg-black overflow-hidden group"><span class="absolute top-0 left-0 w-full h-full bg-red-500/20 translate-x-0.5 translate-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity"></span><span class="relative z-10">GLITCH</span><span class="absolute top-0 left-0 w-full h-full bg-blue-500/20 -translate-x-0.5 -translate-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity"></span></button>` },
    ]
  },
  {
    category: "Social & Interactive",
    items: [
      { name: "Twitter", html: `<button class="px-6 py-2.5 bg-[#1DA1F2] text-white rounded-full font-medium hover:bg-[#1a91da] transition-colors flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg> Tweet</button>` },
      { name: "Google", html: `<button class="px-6 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"><img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" /> Continue with Google</button>` },
      { name: "GitHub", html: `<button class="px-6 py-2.5 bg-[#24292e] text-white rounded-lg font-bold hover:bg-[#2f363d] transition-colors flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> Star on GitHub</button>` },
      { name: "Arrow Slide", html: `<button class="group px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 hover:gap-4">Explore <span class="transition-all">→</span></button>` },
    ]
  },
  {
    category: "Utility",
    items: [
      { name: "Icon Only", html: `<button class="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg></button>` },
      { name: "Badge Button", html: `<button class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">Notifications <span class="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span></button>` },
      { name: "Status Dot", html: `<button class="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition"><span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online</button>` },
      { name: "Toggle", html: `<button class="bg-slate-200 p-1 rounded-full w-12 flex justify-start data-[state=on]:justify-end data-[state=on]:bg-blue-600 transition-all cursor-pointer"><div class="h-5 w-5 bg-white rounded-full shadow-sm"></div></button>` },
    ]
  }
];

// ==========================================
// 2. CARD LIBRARY
// ==========================================
const CARD_LIBRARY = {
  marketing: [
    { name: "Pricing Pro", html: `<div class="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 relative overflow-hidden"><div class="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-2xl opacity-50"></div><h3 class="text-sm font-bold text-purple-400 uppercase tracking-widest mb-1">Most Popular</h3><div class="text-5xl font-black mb-2">$49<span class="text-lg font-medium text-slate-400">/mo</span></div><p class="text-slate-400 mb-6">Perfect for scaling teams.</p><button class="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20">Get Started</button></div>` },
    { name: "Feature Grid", html: `<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300 group"><div class="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div><h3 class="text-xl font-bold text-slate-900 mb-2">Lightning Fast</h3><p class="text-slate-500 leading-relaxed">Our optimized rendering engine ensures your site loads in milliseconds, not seconds.</p></div>` },
    { name: "Testimonial Glass", html: `<div class="p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white shadow-xl bg-linear-to-br from-indigo-500 to-purple-600"><div class="flex items-center gap-4 mb-4"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" class="w-12 h-12 rounded-full object-cover border-2 border-white/50" /><div><h4 class="font-bold">Sarah Jenkins</h4><p class="text-xs text-white/70">CTO @ TechCorp</p></div></div><p class="italic text-lg text-white/90">"The best developer experience I have ever had. It just works."</p></div>` },
    { name: "App Download", html: `<div class="flex items-center bg-black text-white p-6 rounded-2xl shadow-lg gap-6"><div class="bg-white/10 p-4 rounded-xl"><svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.98 1.08-3.11-1.06.05-2.31.71-3.06 1.48-.69.72-1.24 1.84-1.06 2.99 1.19.09 2.38-.6 3.04-1.36z"/></svg></div><div><h3 class="text-xl font-bold">Download iOS App</h3><p class="text-gray-400 text-sm mb-3">Available on the App Store</p><button class="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition">Download</button></div></div>` },
    { name: "Kanban Task", html: `<div class="p-4 bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-grab"><div class="flex justify-between items-start mb-2"><span class="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded">High Priority</span><div class="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">•••</div></div><h4 class="font-bold text-slate-800 text-sm mb-2">Fix Navigation Bug</h4><div class="flex items-center justify-between mt-3"><div class="flex -space-x-2"><img src="https://i.pravatar.cc/100?img=1" class="w-6 h-6 rounded-full border-2 border-white"/><img src="https://i.pravatar.cc/100?img=5" class="w-6 h-6 rounded-full border-2 border-white"/></div><span class="text-xs text-slate-400 flex items-center gap-1">📅 2d</span></div></div>` },
  ],
  content: [
    { name: "Blog Minimal", html: `<article class="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all"><div class="aspect-video overflow-hidden"><img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/></div><div class="p-6"><div class="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase mb-3"><span class="px-2 py-1 bg-blue-50 rounded">Tech</span><span>• 5 min read</span></div><h3 class="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">The Future of AI in 2026</h3><p class="text-slate-500 mb-4 line-clamp-2">How large language models are reshaping the way we build software and interact with the web.</p></div></article>` },
    { name: "Video Card", html: `<div class="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg"><img src="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80" class="w-full aspect-video object-cover"/><div class="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center"><div class="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform"><svg class="w-6 h-6 text-white fill-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div><div class="absolute bottom-4 left-4 text-white"><h3 class="font-bold text-lg drop-shadow-md">Cinematic Intro</h3><p class="text-xs opacity-90">2:14 • 4K Resolution</p></div></div>` },
    { name: "News Item", html: `<div class="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"><div class="h-20 w-20 shrink-0 rounded-lg bg-gray-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=80" class="w-full h-full object-cover" /></div><div><span class="text-xs font-bold text-red-500 uppercase">Breaking</span><h4 class="font-bold text-gray-900 leading-tight mt-1">Global Summit Announced</h4><p class="text-xs text-gray-500 mt-2">2 hours ago • Politics</p></div></div>` },
    { name: "Artist Profile", html: `<div class="group relative overflow-hidden rounded-xl bg-black"><img src="https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&q=80" class="h-64 w-full object-cover opacity-75 transition-opacity group-hover:opacity-50" /><div class="absolute inset-0 flex flex-col justify-end p-6"><h3 class="text-xl font-bold text-white">Neon Nights</h3><p class="text-sm text-gray-300">Synthwave Collection</p></div></div>` },
    { name: "Music Player", html: `<div class="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-4 border border-slate-800 shadow-xl"><div class="h-16 w-16 bg-linear-to-br from-pink-500 to-purple-600 rounded-lg shrink-0 animate-pulse"></div><div class="flex-1"><h4 class="font-bold text-sm">Midnight City</h4><p class="text-xs text-slate-400">M83 • Hurry Up, We&apos;re Dreaming</p></div><div class="flex gap-2 text-slate-400"><svg class="w-6 h-6 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></div></div>` },
  ],
  stats: [
    { name: "Graph Metric", html: `<div class="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm"><div class="flex justify-between items-center mb-4"><span class="text-slate-500 font-medium">Total Users</span><span class="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">+12.5%</span></div><div class="text-4xl font-black text-slate-900 mb-2">84,392</div><div class="flex items-end gap-1 h-10 mt-4"><div class="w-full bg-blue-100 rounded-t h-[40%]"></div><div class="w-full bg-blue-200 rounded-t h-[60%]"></div><div class="w-full bg-blue-300 rounded-t h-[30%]"></div><div class="w-full bg-blue-400 rounded-t h-[80%]"></div><div class="w-full bg-blue-500 rounded-t h-[50%]"></div><div class="w-full bg-blue-600 rounded-t h-[90%]"></div></div></div>` },
    { name: "Dark Stat", html: `<div class="p-6 bg-slate-950 rounded-xl border border-slate-800"><div class="flex items-center gap-3 mb-2"><div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div><span class="text-slate-400 text-sm font-mono">SYSTEM STATUS</span></div><div class="text-2xl font-bold text-white tracking-tight">ALL SYSTEMS OPERATIONAL</div><div class="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-green-500 w-[98%] shadow-[0_0_10px_#22c55e]"></div></div></div>` },
    { name: "Weather", html: `<div class="bg-blue-500 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden"><div class="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-60"></div><div class="relative z-10"><h3 class="text-lg font-medium opacity-90">San Francisco</h3><div class="text-6xl font-thin my-4">72°</div><p class="flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> Sunny</p></div></div>` },
    { name: "Crypto Card", html: `<div class="p-5 bg-slate-900 rounded-xl text-white border border-slate-800"><div class="flex justify-between items-center mb-4"><div class="flex items-center gap-2"><div class="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center font-bold">₿</div><span class="font-bold">Bitcoin</span></div><span class="text-slate-400">BTC</span></div><div class="text-2xl font-mono">$42,391.00</div><div class="text-green-400 text-sm mt-1">+2.4% (24h)</div></div>` }
  ],
  auth: [
    { name: "Login Card", html: `<div class="w-full max-w-sm p-8 bg-white rounded-2xl shadow-xl border border-gray-100"><h2 class="text-2xl font-bold text-center mb-6">Welcome Back</h2><div class="space-y-4"><input type="email" placeholder="Email" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /><input type="password" placeholder="Password" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /><button class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Sign In</button></div><p class="text-center text-sm text-gray-500 mt-6">Don&apos;t have an account? <a href="#" class="text-blue-600 hover:underline">Sign up</a></p></div>` },
    { name: "Glass Login", html: `<div class="w-full max-w-sm p-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl text-white relative overflow-hidden"><div class="absolute inset-0 bg-linear-to-br from-purple-500/30 to-blue-500/30 -z-10"></div><h2 class="text-2xl font-bold text-center mb-6">Member Access</h2><div class="space-y-4"><input type="email" placeholder="Email" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:bg-white/20 placeholder-white/60 text-white" /><input type="password" placeholder="Password" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:bg-white/20 placeholder-white/60 text-white" /><button class="w-full py-3 bg-white text-purple-900 font-bold rounded-xl hover:bg-opacity-90 transition shadow-lg">Enter</button></div></div>` }
  ]
};

// ==========================================
// 3. INPUTS LIBRARY
// ==========================================
const INPUT_VARIANTS = [
  { name: "Material Float", html: `<div class="relative z-0 w-full group"><input type="text" id="float_standard" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " /><label for="float_standard" class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email Address</label></div>` },
  { name: "Search Pill", html: `<div class="relative"><div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div><input type="search" class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-200 rounded-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm outline-none" placeholder="Search..." required></div>` },
  { name: "Valid State", html: `<div class="relative"><input type="text" class="w-full px-4 py-2 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 text-green-700 bg-green-50" value="johndoe@example.com" /><div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-green-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></div></div><p class="mt-1 text-xs text-green-600">Username available!</p>` },
  { name: "Error State", html: `<div class="relative"><input type="text" class="w-full px-4 py-2 border border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 text-red-700 bg-red-50" /><div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div><p class="mt-1 text-xs text-red-600">Invalid email address.</p>` },
  { name: "Dropzone", html: `<div class="flex items-center justify-center w-full"><label class="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"><div class="flex flex-col items-center justify-center pt-5 pb-6"><svg class="w-8 h-8 mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg><p class="text-sm text-slate-500"><span class="font-semibold">Click to upload</span></p></div><input type="file" class="hidden" /></label></div>` },
  { name: "Color Picker", html: `<div class="flex items-center gap-2 border p-2 rounded-lg bg-white shadow-sm w-fit"><input type="color" class="p-0 h-8 w-8 block bg-transparent border-none cursor-pointer rounded-full overflow-hidden" value="#3b82f6" /><span class="text-sm font-mono text-slate-600">#3B82F6</span></div>` },
  { name: "Toggle Switch", html: `<label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" value="" class="sr-only peer"><div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div><span class="ml-3 text-sm font-medium text-gray-900">Toggle me</span></label>` },
  { name: "Range Slider", html: `<div class="w-full"><label class="block mb-2 text-sm font-medium text-gray-900">Volume</label><input type="range" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"></div>` },
];

// ==========================================
// 4. NAVBAR LIBRARY
// ==========================================
const NAVBAR_LIBRARY = [
  { 
    name: "Classic Brand", 
    html: `<nav class="relative flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 shadow-sm" x-data="{ open: false }">
    <div class="text-xl font-bold text-slate-900 tracking-tighter flex items-center gap-2"><div class="h-8 w-8 bg-blue-600 rounded-lg"></div>ACME INC.</div>
    
    <div class="hidden md:flex gap-8 text-sm font-medium text-slate-600">
        <a href="#" class="hover:text-blue-600 transition-colors">Products</a>
        <a href="#" class="hover:text-blue-600 transition-colors">Solutions</a>
        <a href="#" class="hover:text-blue-600 transition-colors">Pricing</a>
        <a href="#" class="hover:text-blue-600 transition-colors">Company</a>
    </div>
    
    <div class="hidden md:flex gap-4">
        <button class="px-4 py-2 text-slate-600 font-medium hover:text-slate-900">Log in</button>
        <button class="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">Sign up</button>
    </div>

    <button class="md:hidden p-2 text-slate-600" onclick="document.getElementById('mobile-menu-1').classList.toggle('hidden')">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
    </button>

    <div id="mobile-menu-1" class="hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-4 flex flex-col gap-4 shadow-lg z-50">
        <a href="#" class="text-sm font-medium text-slate-600 hover:text-blue-600">Products</a>
        <a href="#" class="text-sm font-medium text-slate-600 hover:text-blue-600">Solutions</a>
        <a href="#" class="text-sm font-medium text-slate-600 hover:text-blue-600">Pricing</a>
        <hr/>
        <button class="w-full py-2 bg-slate-900 text-white rounded-lg font-medium">Sign up</button>
    </div>
</nav>` 
  },
  { 
    name: "Glass Floating", 
    html: `<div class="fixed top-6 left-0 right-0 flex justify-center z-50 w-full px-4">
    <nav class="w-full max-w-3xl flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/40 rounded-full shadow-xl shadow-slate-200/50">
        <span class="font-bold text-slate-800 mr-4">Aura</span>
        
        <div class="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" class="hover:text-slate-900">Home</a>
            <a href="#" class="hover:text-slate-900">Work</a>
            <a href="#" class="hover:text-slate-900">About</a>
        </div>

        <button class="hidden md:block px-5 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wide hover:bg-slate-800">Contact</button>

        <button class="md:hidden p-1" onclick="document.getElementById('mobile-menu-2').classList.toggle('hidden')">
            <svg class="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
    </nav>

    <div id="mobile-menu-2" class="hidden absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-slate-100">
        <a href="#" class="text-lg font-bold text-slate-800">Home</a>
        <a href="#" class="text-lg font-bold text-slate-800">Work</a>
        <a href="#" class="text-lg font-bold text-slate-800">About</a>
        <button class="w-full py-3 bg-black text-white rounded-xl font-bold">Contact Us</button>
    </div>
</div>` 
  },
  { 
    name: "Dark SaaS", 
    html: `<nav class="relative flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 text-white">
    <div class="font-mono text-lg font-bold text-blue-400">&lt;DevUI /&gt;</div>
    
    <div class="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
        <a href="#" class="px-4 py-1.5 text-sm font-medium bg-slate-800 rounded shadow text-white">Dashboard</a>
        <a href="#" class="px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">Settings</a>
        <a href="#" class="px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">Team</a>
    </div>
    
    <div class="hidden md:flex items-center gap-4">
        <div class="h-8 w-8 bg-linear-to-tr from-blue-500 to-purple-500 rounded-full"></div>
    </div>

    <button class="md:hidden text-white" onclick="document.getElementById('mobile-menu-3').classList.toggle('hidden')">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
    </button>

    <div id="mobile-menu-3" class="hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-4 flex flex-col gap-2 z-50">
        <a href="#" class="block px-4 py-3 bg-slate-900 rounded text-white">Dashboard</a>
        <a href="#" class="block px-4 py-3 text-slate-400 hover:text-white">Settings</a>
        <a href="#" class="block px-4 py-3 text-slate-400 hover:text-white">Team</a>
    </div>
</nav>` 
  },
  {
    name: "E-Commerce",
    html: `<nav class="bg-white border-b border-slate-200">
    <div class="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-widest text-center py-2">Free Shipping on Orders Over $100</div>
    <div class="px-8 py-4 flex items-center justify-between">
        <div class="flex gap-6 text-sm font-bold uppercase tracking-wide text-slate-900">
            <a href="#">New</a>
            <a href="#">Men</a>
            <a href="#">Women</a>
        </div>
        <div class="text-2xl font-black tracking-tighter">NIKE</div>
        <div class="flex gap-4">
            <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
    </div>
</nav>`
  }
];

// ==========================================
// 5. SLIDER LIBRARY
// ==========================================
const SLIDER_LIBRARY = [
  {
    name: "Hero Slider",
    html: `<div class="relative w-full overflow-hidden group rounded-2xl" data-type="slider-wrapper">
  <div class="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full no-scrollbar" style="scrollbar-width: none; -ms-overflow-style: none;" data-type="slider-container">
    
    <div class="snap-center w-full shrink-0 relative h-96 bg-slate-900 flex items-center justify-center overflow-hidden" data-type="slide">
      <img src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=1600&q=80" class="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 hover:scale-110"/>
      <div class="relative z-10 text-center text-white px-4">
        <h2 class="text-5xl font-black mb-4">Discover Nature</h2>
        <button class="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">Explore</button>
      </div>
    </div>

    <div class="snap-center w-full shrink-0 relative h-96 bg-indigo-900 flex items-center justify-center overflow-hidden" data-type="slide">
      <img src="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1600&q=80" class="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 hover:scale-110"/>
      <div class="relative z-10 text-center text-white px-4">
        <h2 class="text-5xl font-black mb-4">Urban Life</h2>
        <button class="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">View Gallery</button>
      </div>
    </div>

  </div>
  <div class="absolute bottom-4 right-6 text-white/50 text-xs font-mono pointer-events-none">SCROLL HORIZONTALLY</div>
</div>`
  },
  {
    name: "Card Carousel",
    html: `<div class="w-full py-8" data-type="slider-wrapper">
  <h3 class="text-xl font-bold px-6 mb-4 text-slate-800">Trending Now</h3>
  <div class="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 pb-8 scroll-smooth no-scrollbar" style="scrollbar-width: none;" data-type="slider-container">
    
    <div class="snap-center shrink-0 w-72 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" data-type="slide">
       <div class="h-48 bg-slate-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"/></div>
       <div class="p-5">
          <div class="text-xs font-bold text-blue-600 mb-2">TECH</div>
          <h4 class="font-bold text-lg leading-tight">The Future of AI</h4>
       </div>
    </div>

    <div class="snap-center shrink-0 w-72 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" data-type="slide">
       <div class="h-48 bg-slate-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&q=80" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"/></div>
       <div class="p-5">
          <div class="text-xs font-bold text-purple-600 mb-2">DESIGN</div>
          <h4 class="font-bold text-lg leading-tight">Minimalist Trends</h4>
       </div>
    </div>

  </div>
</div>`
  }
];

// ==========================================
// 6. CONTAINER LIBRARY
// ==========================================
const CONTAINER_LIBRARY = [
  {
    name: "Empty Div",
    html: `<div class="p-4 border-2 border-dashed border-slate-300 rounded-lg min-h-[100px] flex items-center justify-center text-slate-400">Empty Block</div>`
  },
  {
    name: "Container (Centered)",
    html: `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border border-dashed border-blue-200 bg-blue-50/50 rounded-xl"><p class="text-center text-blue-400 text-sm font-mono">Centered Container</p></div>`
  },
  {
    name: "2-Column Grid",
    html: `<div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">Col 1</div><div class="h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">Col 2</div></div>`
  },
  {
    name: "3-Column Grid",
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="h-24 bg-slate-100 rounded-lg border border-slate-200"></div><div class="h-24 bg-slate-100 rounded-lg border border-slate-200"></div><div class="h-24 bg-slate-100 rounded-lg border border-slate-200"></div></div>`
  },
  {
    name: "Flex Row",
    html: `<div class="flex items-center justify-between gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50"><div class="w-12 h-12 bg-white rounded-full shadow-sm"></div><div class="h-4 bg-white w-full rounded shadow-sm"></div></div>`
  },
  {
    name: "Flex Column",
    html: `<div class="flex flex-col gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 w-full"><div class="h-8 w-full bg-white rounded shadow-sm"></div><div class="h-8 w-full bg-white rounded shadow-sm"></div><div class="h-8 w-full bg-white rounded shadow-sm"></div></div>`
  },
  {
    name: "Section (Padding)",
    html: `<section class="py-16 md:py-24 bg-white border-y border-slate-100"><div class="max-w-5xl mx-auto px-6"><h2 class="text-3xl font-bold text-slate-900 mb-6">Section Title</h2><p class="text-lg text-slate-600">Section content goes here with generous padding.</p></div></section>`
  },
  {
    name: "Sidebar Layout",
    html: `<div class="flex h-64 border border-slate-200 rounded-xl overflow-hidden"><aside class="w-16 md:w-48 bg-slate-900 text-white p-4 flex flex-col gap-3"><div class="h-6 w-6 bg-blue-500 rounded"></div><div class="h-2 w-20 bg-slate-700 rounded mt-4"></div><div class="h-2 w-16 bg-slate-700 rounded"></div></aside><main class="flex-1 bg-slate-50 p-4"><div class="h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">Main Content</div></main></div>`
  },
  {
    name: "Hero Section",
    html: `<div class="relative bg-slate-900 py-20 px-6 text-center rounded-3xl overflow-hidden"><div class="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 opacity-20"></div><div class="relative z-10 max-w-2xl mx-auto"><h1 class="text-4xl font-extrabold text-white mb-4">Hero Title</h1><p class="text-slate-300 mb-8">Subtitle text goes here.</p><button class="px-6 py-3 bg-white text-black font-bold rounded-full">CTA Button</button></div></div>`
  }
];

// ==========================================
// 7. TEXT LIBRARY (New)
// ==========================================
const TEXT_LIBRARY = [
  { name: "Heading 1", html: `<h1 class="text-4xl font-extrabold text-slate-900 mb-4">Headline Text</h1>` },
  { name: "Heading 2", html: `<h2 class="text-3xl font-bold text-slate-800 mb-3">Subheading Text</h2>` },
  { name: "Heading 3", html: `<h3 class="text-2xl font-semibold text-slate-800 mb-2">Section Header</h3>` },
  { name: "Paragraph", html: `<p class="text-base text-slate-600 leading-relaxed mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>` },
  { name: "Subtitle", html: `<p class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Subtitle</p>` },
  { name: "Blockquote", html: `<blockquote class="border-l-4 border-blue-500 pl-4 italic text-slate-700 my-4">"This is an inspiring quote block that stands out."</blockquote>` }
];

// ==========================================
// 8. IMAGE MANAGER (VAST LIBRARY + UPLOAD)
// ==========================================
// A robust curated list of 50+ high-quality images from Unsplash (IDs are reliable)
const STOCK_IMAGES = [
  { category: "Nature", items: [
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
      "https://images.unsplash.com/photo-1501854140884-074cf2b21d25?w=800&q=80"
  ]},
  { category: "Technology", items: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
  ]},
  { category: "Architecture", items: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
      "https://images.unsplash.com/photo-1517586979036-acd477ff6748?w=800&q=80"
  ]},
  { category: "People", items: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80",
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
  ]}
];

interface InsertTabProps {
  onInsert: (html: string) => void;
}

interface MenuBtnProps {
  icon: React.ReactNode;
  label: string;
  color: "blue" | "purple" | "green" | "orange" | "slate" | "pink";
  onClick: () => void;
  count?: string;
}

export function InsertTab({ onInsert }: InsertTabProps) {
  const [insertView, setInsertView] = useState<"menu" | "icons" | "cards" | "inputs" | "buttons" | "navbars" | "sliders" | "containers" | "typography" | "media">("menu");
  const [iconSearch, setIconSearch] = useState("");
  
  // --- IMAGE TAB STATES ---
  const [mediaTab, setMediaTab] = useState<"library" | "upload" | "url">("library");
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LIMITERS FOR PAGINATION ---
  const [iconLimit, setIconLimit] = useState(50);
  const [cardLimit, setCardLimit] = useState(2); 
  const [btnLimit, setBtnLimit] = useState(6); 
  const [imageLimit, setImageLimit] = useState(8);

  // --- MEMOIZED DATA ---
  const allIcons = useMemo(() => {
    return Object.entries(LucideIcons).filter(([name, component]) => {
      return name !== "createLucideIcon" && name !== "default" && typeof component !== "string";
    });
  }, []);

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return allIcons;
    return allIcons.filter(([name]) => name.toLowerCase().includes(iconSearch.toLowerCase()));
  }, [iconSearch, allIcons]);

  const visibleIcons = useMemo(() => filteredIcons.slice(0, iconLimit), [filteredIcons, iconLimit]);

  // ✅ Helper to change view and reset limits
  const changeView = (view: typeof insertView) => {
    setInsertView(view);
    setIconLimit(50);
    setCardLimit(2);
    setBtnLimit(6);
    setImageLimit(8);
  };

  // --- HANDLERS FOR IMAGES ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Insert as a responsive image
      const imgHtml = `<img src="${base64}" class="w-full rounded-xl shadow-md max-w-md mx-auto block" alt="Uploaded Image" />`;
      onInsert(imgHtml);
    };
    reader.readAsDataURL(file);
  };

  const insertCustomUrl = () => {
    if (!customUrl.trim()) return;
    // Added referrerPolicy to fix broken images from external sites
    const imgHtml = `<img src="${customUrl.trim()}" class="w-full rounded-xl shadow-md max-w-md mx-auto block" alt="Custom Image" referrerpolicy="no-referrer" />`;
    onInsert(imgHtml);
    setCustomUrl("");
  };

  return (
    <div className="h-full bg-slate-50/30 flex flex-col">
       {/* 1. MAIN MENU VIEW */}
       {insertView === 'menu' && (
          <div className="p-4 grid grid-cols-2 gap-3 animate-in slide-in-from-left-5 duration-300">
             <MenuBtn icon={<Search className="h-5 w-5"/>} label="Icons" color="blue" onClick={() => changeView('icons')} count="1000+" />
             <MenuBtn icon={<CreditCard className="h-5 w-5"/>} label="Cards" color="purple" onClick={() => changeView('cards')} count="50+" />
             <MenuBtn icon={<MousePointer2 className="h-5 w-5"/>} label="Buttons" color="orange" onClick={() => changeView('buttons')} count="100+" />
             <MenuBtn icon={<Type className="h-5 w-5"/>} label="Inputs" color="green" onClick={() => changeView('inputs')} count="50+" />
             <MenuBtn icon={<PanelTop className="h-5 w-5"/>} label="Navbars" color="slate" onClick={() => changeView('navbars')} count="4+" />
             <MenuBtn icon={<GalleryHorizontal className="h-5 w-5"/>} label="Sliders" color="pink" onClick={() => changeView('sliders')} count="2+" />
             <MenuBtn icon={<LayoutTemplate className="h-5 w-5"/>} label="Containers" color="slate" onClick={() => changeView('containers')} count="9+" />
             <MenuBtn icon={<Heading className="h-5 w-5"/>} label="Typography" color="blue" onClick={() => changeView('typography')} count="6" />
             <MenuBtn icon={<ImageIcon className="h-5 w-5"/>} label="Images" color="green" onClick={() => changeView('media')} count="Library+" />
          </div>
        )}

        {/* 2. SUB-VIEWS */}
        {insertView !== 'menu' && (
          <div className="h-full flex flex-col animate-in slide-in-from-right-5 duration-300">
             <div className="p-3 border-b bg-white flex items-center gap-2 sticky top-0 z-10 shadow-sm shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeView('menu')}>
                  <ChevronLeft className="h-4 w-4 text-slate-500"/>
                </Button>
                <span className="font-bold text-sm capitalize">{insertView === 'media' ? 'Image Manager' : `${insertView} Library`}</span>
             </div>

             <ScrollArea className="flex-1 p-4 h-full">
                <div className="space-y-6 pb-20">
                
                {/* --- ICONS --- */}
                {insertView === 'icons' && (
                  <>
                    <div className="relative mb-2 sticky top-0 z-20">
                       <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"/>
                       <Input 
                        className="h-9 pl-8 text-xs bg-white/90 backdrop-blur-sm shadow-sm" 
                        placeholder={`Search ${allIcons.length} icons...`} 
                        value={iconSearch} 
                        onChange={(e) => {
                            setIconSearch(e.target.value);
                            setIconLimit(50); 
                        }} 
                       />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {visibleIcons.map(([name, IconComponent]) => (
                            <button key={name} onClick={() => {
                                    // @ts-expect-error - Dynamic icon component
                                    const svgString = React.isValidElement(<IconComponent/>) ? `<span class="inline-block p-0.5">${renderToStaticMarkup(<IconComponent size={24} />)}</span>` : '';
                                    onInsert(svgString);
                                }}
                                className="aspect-square flex flex-col items-center justify-center rounded bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-100 hover:border-blue-200 transition group" 
                                title={name}
                            >
                                {/* @ts-expect-error - Dynamic icon component */}
                                <IconComponent className="h-5 w-5 mb-1 opacity-70 group-hover:opacity-100" />
                            </button>
                        ))}
                    </div>
                    {visibleIcons.length < filteredIcons.length ? (
                        <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => setIconLimit(prev => prev + 50)}>
                            Load More Icons...
                        </Button>
                    ) : (
                        <div className="text-center py-4 text-xs text-slate-400 italic">No more icons to load</div>
                    )}
                  </>
                )}

                {/* --- MEDIA (IMAGES) --- */}
                {insertView === 'media' && (
                  <div className="space-y-4">
                    {/* Media Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-lg">
                      <button onClick={() => setMediaTab('library')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${mediaTab === 'library' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Library</button>
                      <button onClick={() => setMediaTab('upload')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${mediaTab === 'upload' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Upload</button>
                      <button onClick={() => setMediaTab('url')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${mediaTab === 'url' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>URL</button>
                    </div>

                    {/* 1. LIBRARY TAB */}
                    {mediaTab === 'library' && (
                      <div className="space-y-6">
                        {STOCK_IMAGES.map((cat, i) => (
                           <div key={i} className="space-y-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50/95 py-1 z-10">{cat.category}</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {cat.items.slice(0, imageLimit).map((url, idx) => (
                                        <div key={idx} className="group relative aspect-video bg-slate-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => onInsert(`<img src="${url}" class="w-full rounded-xl shadow-md block" alt="Stock Image" />`)}>
                                            <img src={url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <Plus className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                           </div>
                        ))}
                         <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => setImageLimit(prev => prev + 8)}>
                            Load More Images
                        </Button>
                      </div>
                    )}

                    {/* 2. UPLOAD TAB */}
                    {mediaTab === 'upload' && (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-600">Click to Upload</span>
                        <span className="text-xs text-slate-400 mt-1">JPG, PNG, GIF (Max 5MB)</span>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </div>
                    )}

                    {/* 3. URL TAB */}
                    {mediaTab === 'url' && (
                      <div className="space-y-3">
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input 
                            className="pl-9" 
                            placeholder="https://example.com/image.jpg" 
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                          />
                        </div>
                        <Button className="w-full" onClick={insertCustomUrl} disabled={!customUrl}>
                          Insert Image
                        </Button>
                        <p className="text-[10px] text-slate-400 text-center">Supports external links (Freepik, Unsplash, etc.)</p>
                      </div>
                    )}
                  </div>
                )}

                {/* --- CARDS --- */}
                {insertView === 'cards' && (
                  <>
                    {Object.entries(CARD_LIBRARY).map(([category, items]) => (
                      <div key={category} className="space-y-3">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50/95 py-1 z-10">{category}</div>
                          {items.slice(0, cardLimit).map((item, idx) => (
                            <div key={idx} className="group relative">
                                <div className="p-1 border border-slate-200 bg-white rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden relative" onClick={() => onInsert(item.html)}>
                                  <div className="pointer-events-none transform scale-[0.85] origin-top-left max-h-[180px] overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: item.html }} />
                                  <div className="absolute inset-0 bg-transparent z-10" /> 
                                </div>
                                <div className="mt-1 flex justify-between items-center px-1">
                                  <span className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                                    {idx === 0 && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500"/>}
                                    {item.name}
                                  </span>
                                  <PlusCircleButton onClick={() => onInsert(item.html)}/>
                                </div>
                            </div>
                          ))}
                      </div>
                    ))}
                    {Object.values(CARD_LIBRARY).some(items => items.length > cardLimit) ? (
                      <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => setCardLimit(prev => prev + 5)}>
                          Show More Cards
                      </Button>
                    ) : (
                        <div className="text-center py-4 text-xs text-slate-400 italic">You&apos;ve reached the end of the cards</div>
                    )}
                  </>
                )}

                {/* --- BUTTONS --- */}
                {insertView === 'buttons' && (
                  <>
                    {BUTTON_STYLES.map((cat, i) => (
                        <div key={i} className="space-y-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50/95 py-1 z-10">{cat.category}</div>
                            <div className="grid grid-cols-1 gap-3">
                                {cat.items.slice(0, btnLimit).map((btn, idx) => (
                                    <div key={idx} className="flex flex-col gap-1 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-all group cursor-pointer" onClick={() => onInsert(btn.html)}>
                                        <div className="flex items-center justify-center p-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                            <div className="pointer-events-none" dangerouslySetInnerHTML={{ __html: btn.html }} />
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] font-medium text-slate-500 uppercase">{btn.name}</span>
                                            <PlusCircleButton onClick={() => onInsert(btn.html)}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {BUTTON_STYLES.some(cat => cat.items.length > btnLimit) ? (
                        <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => setBtnLimit(prev => prev + 10)}>
                            Load More Buttons
                        </Button>
                    ) : (
                        <div className="text-center py-4 text-xs text-slate-400 italic">No more buttons to load</div>
                    )}
                  </>
                )}

                {/* --- INPUTS --- */}
                {insertView === 'inputs' && (
                    <div className="space-y-4">
                        {INPUT_VARIANTS.map((inp, idx) => (
                            <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-all group cursor-pointer relative" onClick={() => onInsert(inp.html)}>
                                <div className="pointer-events-none mb-2" dangerouslySetInnerHTML={{ __html: inp.html }} />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlusCircleButton onClick={() => onInsert(inp.html)}/>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium uppercase">{inp.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- NAVBARS --- */}
                {insertView === 'navbars' && (
                    <div className="space-y-6">
                        {NAVBAR_LIBRARY.map((nav, idx) => (
                            <div key={idx} className="group relative">
                                <div className="p-1 border border-slate-200 bg-slate-50 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden relative" onClick={() => onInsert(nav.html)}>
                                    <div className="pointer-events-none transform scale-[0.6] origin-top-left w-[166%] overflow-hidden bg-white shadow-sm" dangerouslySetInnerHTML={{ __html: nav.html }} />
                                    <div className="absolute inset-0 bg-transparent z-10" /> 
                                </div>
                                <div className="mt-1 flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">{nav.name}</span>
                                    <PlusCircleButton onClick={() => onInsert(nav.html)}/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- SLIDERS --- */}
                {insertView === 'sliders' && (
                    <div className="space-y-6">
                        {SLIDER_LIBRARY.map((slider, idx) => (
                            <div key={idx} className="group relative">
                                <div className="p-1 border border-slate-200 bg-slate-50 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden relative" onClick={() => onInsert(slider.html)}>
                                    <div className="pointer-events-none transform scale-[0.5] origin-top-left w-[200%]" dangerouslySetInnerHTML={{ __html: slider.html }} />
                                    <div className="absolute inset-0 bg-transparent z-10" /> 
                                </div>
                                <div className="mt-1 flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">{slider.name}</span>
                                    <PlusCircleButton onClick={() => onInsert(slider.html)}/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- CONTAINERS --- */}
                {insertView === 'containers' && (
                    <div className="space-y-6">
                        {CONTAINER_LIBRARY.map((container, idx) => (
                            <div key={idx} className="group relative">
                                <div className="p-1 border border-slate-200 bg-slate-50 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden relative" onClick={() => onInsert(container.html)}>
                                    <div className="pointer-events-none transform scale-[0.8] origin-top-left w-[125%]" dangerouslySetInnerHTML={{ __html: container.html }} />
                                    <div className="absolute inset-0 bg-transparent z-10" /> 
                                </div>
                                <div className="mt-1 flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">{container.name}</span>
                                    <PlusCircleButton onClick={() => onInsert(container.html)}/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TYPOGRAPHY --- */}
                {insertView === 'typography' && (
                    <div className="space-y-6">
                        {TEXT_LIBRARY.map((text, idx) => (
                            <div key={idx} className="group relative">
                                <div className="p-4 border border-slate-200 bg-white rounded-xl hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer" onClick={() => onInsert(text.html)}>
                                    <div className="pointer-events-none" dangerouslySetInnerHTML={{ __html: text.html }} />
                                    <div className="absolute inset-0 bg-transparent z-10" /> 
                                </div>
                                <div className="mt-1 flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">{text.name}</span>
                                    <PlusCircleButton onClick={() => onInsert(text.html)}/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                </div>
             </ScrollArea>
          </div>
        )}
    </div>
  );
}

// --- SUB COMPONENTS ---

function MenuBtn({ icon, label, color, onClick, count }: MenuBtnProps) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300",
        purple: "bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300",
        green: "bg-green-50 text-green-600 border-green-100 hover:border-green-300",
        orange: "bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300",
        slate: "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300",
        pink: "bg-pink-50 text-pink-600 hover:border-pink-400",
    };

    return (
        <button onClick={onClick} className={`p-4 border rounded-2xl hover:shadow-md transition-all flex flex-col items-center gap-3 group ${colorMap[color] || colorMap.slate}`}>
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-center">
                <span className="block text-xs font-bold text-slate-700">{label}</span>
                {count && <span className="text-[9px] text-slate-400 font-medium">{count} items</span>}
            </div>
        </button>
    )
}

function PlusCircleButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="h-6 w-6 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors shadow-sm">
      <Plus className="h-3.5 w-3.5" strokeWidth={3} />
    </button>
  )
}