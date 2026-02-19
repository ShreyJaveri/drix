"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, Activity, Code2, Palette, Link2, 
  AlertTriangle, PlaySquare, FileCode, FolderGit2, 
  ShieldCheck, Gauge, Layout, Type, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ✅ 1. Import the new Server-Side audit action
import { getUserChats, getChatFiles, analyzeCodeWithAI, auditProjectFile } from "@/app/actions";

// --- CUSTOM SLEEK DROPDOWN COMPONENT ---
function CustomSelect({ icon: Icon, value, onChange, options, placeholder, disabled = false }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.id === value);

  return (
    <div className={cn("relative", disabled && "opacity-50 pointer-events-none")} ref={dropdownRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 bg-black border rounded-xl px-4 py-2.5 cursor-pointer transition-colors w-[220px]",
          isOpen ? "border-purple-500" : "border-white/10 hover:border-white/20"
        )}
      >
        <Icon className="w-4 h-4 text-purple-400 shrink-0" />
        <span className="text-sm text-white truncate flex-1">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar overflow-hidden"
          >
            {options.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 text-center">No items found</div>
            ) : (
              options.map((opt: any) => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-4 py-3 text-sm cursor-pointer transition-colors truncate",
                    value === opt.id ? "bg-purple-500/20 text-purple-300" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {opt.name || opt.title}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StatisticsPage() {
  const { userId } = useAuth();

  // --- DATABASE SELECTION STATES ---
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  
  // --- PROCESSING STATES ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any | null>(null);

  // 1. Fetch Projects on Component Mount
  useEffect(() => {
    if (userId) getUserChats(userId, "all").then(data => setProjects(data));
  }, [userId]);

  // 2. Fetch Files when a Project is Selected
  useEffect(() => {
    const loadFiles = async () => {
      if (selectedProjectId) {
        const data = await getChatFiles(selectedProjectId);
        setProjectFiles(data);
      } else {
        setProjectFiles([]);
      }
    };
    loadFiles();
  }, [selectedProjectId]);

  // --- HANDLERS ---
  const handleProjectSelect = (id: string) => {
      setSelectedProjectId(id);
      setSelectedFileId(""); 
      setLocalFile(null);    
      setResults(null);
  };

  const handleProjectFileSelect = (id: string) => {
      setSelectedFileId(id);
      setLocalFile(null);    
      setResults(null);
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLocalFile(e.target.files[0]);
      setSelectedProjectId(""); 
      setSelectedFileId("");
      setResults(null); 
    }
  };

  // ✅ 3. THE GENUINE AUDIT FUNCTION (Updated Architecture)
  const runAnalysis = async () => {
    if (!selectedFileId && !localFile) return;
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      let aiResults;

      if (localFile) {
        // A. LOCAL UPLOAD: Read file in browser, send to AI
        const codeToAnalyze = await localFile.text();
        if (!codeToAnalyze || codeToAnalyze.trim() === "") {
            throw new Error("The uploaded file is empty.");
        }
        aiResults = await analyzeCodeWithAI(codeToAnalyze, localFile.name);
      } else if (selectedFileId) {
        // B. DATABASE FILE: Send ONLY the ID. Let the server do all the heavy lifting!
        aiResults = await auditProjectFile(Number(selectedFileId));
      }

      setResults(aiResults);

    } catch (error: any) {
      console.error(error);
      // Show the exact error message to the user so we know if it was empty!
      alert(error.message || "Failed to analyze code. Make sure the file contains actual HTML/JS/CSS.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isReadyToAudit = selectedFileId !== "" || localFile !== null;

  return (
    <div className="p-8 h-full flex flex-col max-w-[1600px] mx-auto overflow-hidden">
      
      {/* 1. HEADER & CONTROLS */}
      <div className="mb-6 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-4 shrink-0 relative z-40">
        <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
               Neural Code Audit <Activity className="w-6 h-6 text-purple-500" />
            </h1>
            <p className="text-slate-400 text-sm">Select a project file from your database for deep architectural analysis.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[#0A0A0A] p-2 rounded-2xl border border-white/10 shadow-2xl">
            <CustomSelect 
              icon={FolderGit2}
              value={selectedProjectId}
              onChange={handleProjectSelect}
              options={projects.map(p => ({ id: p.id, name: p.title }))}
              placeholder="1. Select Project..."
            />

            <CustomSelect 
              icon={FileCode}
              value={selectedFileId}
              onChange={handleProjectFileSelect}
              options={projectFiles}
              placeholder="2. Select File..."
              disabled={!selectedProjectId}
            />

            <span className="text-slate-600 text-[10px] font-bold tracking-widest uppercase px-1">OR</span>

            <input type="file" id="local-upload" className="hidden" accept=".html,.js,.jsx,.ts,.tsx,.css" onChange={handleLocalFileUpload} />
            <label 
                htmlFor="local-upload" 
                className={cn(
                    "cursor-pointer px-4 py-2.5 hover:bg-white/10 border rounded-xl text-sm font-medium transition-colors flex items-center gap-2",
                    localFile ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-white/5 border-white/10 text-slate-300"
                )}
            >
                <UploadCloud className="w-4 h-4" />
                {localFile ? <span className="max-w-[100px] truncate">{localFile.name}</span> : "Upload Local"}
            </label>

            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            <Button 
                onClick={runAnalysis} 
                disabled={!isReadyToAudit || isAnalyzing}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:opacity-50 min-w-[120px] ml-auto py-5"
            >
                {isAnalyzing ? "Scanning..." : "Audit Code"}
            </Button>
        </div>
      </div>

      {/* 2. MAIN BENTO GRID */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 grid-rows-2 gap-6 relative z-10">
          
          <AnimatePresence>
              {isAnalyzing && (
                  <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 bg-[#050505]/80 backdrop-blur-sm rounded-3xl border border-purple-500/30 flex flex-col items-center justify-center"
                  >
                      <div className="w-64 h-2 bg-slate-900 rounded-full overflow-hidden mb-4 relative">
                          <motion.div 
                              className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          />
                      </div>
                      <p className="font-mono text-purple-400 text-sm tracking-widest animate-pulse">ANALYZING_CODEBASE...</p>
                  </motion.div>
              )}
          </AnimatePresence>

          {!results && !isAnalyzing && (
              <div className="col-span-12 row-span-2 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500 bg-[#0A0A0A]/50">
                  <Activity className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium text-white">Target lock required.</p>
                  <p className="text-sm opacity-60 mt-1">Select a project file from the database or upload a local file to begin.</p>
              </div>
          )}

          {results && !isAnalyzing && (
              <>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-12 lg:col-span-4 row-span-1 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 flex flex-col overflow-hidden relative">
                      <div className="absolute top-6 right-6 flex flex-col items-end">
                          <span className={cn("text-4xl font-black leading-none", results.score >= 80 ? "text-emerald-400" : results.score >= 50 ? "text-yellow-400" : "text-red-400")}>
                              {results.score}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Grade: {results.grade}</span>
                      </div>
                      
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Palette className="w-4 h-4 text-pink-500" /> Palette Intelligence</h3>
                      <p className="text-xs text-slate-400 mb-4 pr-16 leading-relaxed">{results.colors?.reason || "No specific color issues detected."}</p>
                      
                      <div className="mt-auto space-y-4">
                          <div>
                              <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block">Detected Colors</span>
                              <div className="flex gap-2 flex-wrap">
                                  {results.colors?.current?.map((c: string) => (
                                      <div key={c} className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: c }} title={c} />
                                  ))}
                              </div>
                          </div>
                          <div>
                              <span className="text-[10px] uppercase tracking-widest text-green-400 mb-2 block">AI Suggested Shift</span>
                              <div className="flex gap-2 flex-wrap">
                                  {results.colors?.suggested?.map((c: string) => (
                                      <div key={c} className="w-8 h-8 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: c }} title={c} />
                                  ))}
                              </div>
                          </div>
                      </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-12 lg:col-span-8 row-span-1 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 flex flex-col overflow-y-auto custom-scrollbar">
                       <h3 className="text-white font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Diagnostic Breakdown</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {results.health?.map((h: any, i: number) => {
                               // Dynamically select icon based on type returned by AI
                               const Icon = h.type === 'tailwind' ? Layout : h.type === 'performance' ? Gauge : h.type === 'accessibility' ? ShieldCheck : Type;
                               return (
                                   <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                       <div className={cn(
                                           "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                                           h.type === 'tailwind' ? "bg-cyan-500/20 text-cyan-400" : 
                                           h.type === 'performance' ? "bg-yellow-500/20 text-yellow-400" : 
                                           h.type === 'accessibility' ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400"
                                       )}>
                                           <Icon className="w-5 h-5" />
                                       </div>
                                       <div>
                                           <h4 className="text-white font-bold text-sm mb-1">{h.title}</h4>
                                           <p className="text-xs text-slate-400 leading-relaxed">{h.text}</p>
                                       </div>
                                   </div>
                               )
                           })}
                       </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-12 lg:col-span-8 row-span-1 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 flex flex-col overflow-hidden">
                       <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Code2 className="w-4 h-4 text-emerald-500" /> AI Snippet Optimization</h3>
                       <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                           <div className="flex flex-col min-h-0 bg-red-950/20 border border-red-900/30 rounded-xl overflow-hidden">
                               <div className="bg-red-950/50 px-3 py-1.5 text-[10px] text-red-400 font-mono border-b border-red-900/30 font-bold tracking-widest">DETECTED (ANTI-PATTERN)</div>
                               <pre className="p-4 text-xs font-mono text-slate-400 overflow-auto custom-scrollbar flex-1 whitespace-pre-wrap leading-relaxed">
                                   {results.code?.bad || "No major issues found."}
                               </pre>
                           </div>
                           <div className="flex flex-col min-h-0 bg-emerald-950/20 border border-emerald-900/30 rounded-xl overflow-hidden">
                               <div className="bg-emerald-950/50 px-3 py-1.5 text-[10px] text-emerald-400 font-mono border-b border-emerald-900/30 font-bold tracking-widest">AI SUGGESTION (OPTIMIZED)</div>
                               <pre className="p-4 text-xs font-mono text-emerald-300 overflow-auto custom-scrollbar flex-1 whitespace-pre-wrap leading-relaxed">
                                   {results.code?.good || "Code looks great!"}
                               </pre>
                           </div>
                       </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-12 lg:col-span-4 row-span-1 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 flex flex-col overflow-hidden">
                       <h3 className="text-white font-bold mb-4 flex items-center gap-2"><PlaySquare className="w-4 h-4 text-blue-500" /> Technical Vault</h3>
                       <p className="text-xs text-slate-400 mb-6">Real-world resources scraped based on your specific code flaws.</p>
                       <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                           {results.resources?.map((r: any, i: number) => (
                               <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-4 bg-black border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all hover:scale-[1.02]">
                                   <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                           <Link2 className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                                       </div>
                                       <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{r.title}</span>
                                   </div>
                                   <span className="text-[10px] font-bold tracking-widest bg-white/5 px-2.5 py-1 rounded text-slate-500 group-hover:bg-purple-500/20 group-hover:text-purple-300 uppercase">{r.type}</span>
                               </a>
                           ))}
                       </div>
                  </motion.div>
              </>
          )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
}