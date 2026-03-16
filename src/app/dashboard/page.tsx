"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { 
  Plus, Layout, Loader2, Star, Trash2, 
  Pencil, Clock, Copy, ArrowRight, RotateCcw
} from "lucide-react";
import { 
  createChat, getUserChats, moveToTrash, 
  toggleChatStar, renameChat, permanentDeleteChat, restoreFromTrash,
  saveMessage 
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { TemplateWizard } from "@/components/template-wizard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";

// --- TYPES ---
interface Project {
  id: number;
  title: string;
  createdAt: Date;
  isStarred: boolean;
  isDeleted: boolean;
  previewHtml?: string;
}

function DashboardContent() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL PARAMS
  const currentTab = searchParams.get("tab") || "dashboard"; 
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  
  // STATE
  const [activeSection, setActiveSection] = useState<"all" | "starred" | "trash">("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Initial Load
  useEffect(() => {
    if (isLoaded && userId) {
      loadProjects();
    }
  }, [isLoaded, userId, activeSection]);

  async function loadProjects() {
    setLoading(true);
    try {
      const data = await getUserChats(userId!, activeSection === "starred" ? "starred" : activeSection === "trash" ? "trash" : "all");
      // @ts-ignore
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchQuery));

  const handleCreateFromTemplate = async (template: any) => {
    const htmlContent = template.html || template.code;
    
    if (htmlContent && htmlContent.length > 50 && htmlContent.includes('<div')) {
      const chat = await createChat(userId!, template.name, htmlContent);
      router.push(`/editor/${chat.id}?chatId=${chat.id}`);
    } else {
      const loadingUi = `
        <div class="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white font-sans">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-6"></div>
            <h2 class="text-3xl font-bold tracking-tight mb-2">${template.name || "New Template"}</h2>
            <p class="text-slate-400 max-w-md text-center">Architecture initialized. Please click Send in the chat to generate this design.</p>
        </div>
      `;
      
      const chat = await createChat(userId!, template.name, loadingUi);
      
      const promptText = `Generate a complete HTML UI for a "${template.name}". Description: ${template.description}. Make it beautiful, modern, fully responsive, and use Tailwind CSS.`;
      
      await saveMessage(chat.id, "ai", `Template initialized! I have pre-filled the requirements for you. Just click 'Send' below to generate your ${template.name}.`);
      
      router.push(`/editor/${chat.id}?chatId=${chat.id}&prompt=${encodeURIComponent(promptText)}`);
    }
  };

  const handleRename = async (id: number) => {
    const newTitle = prompt("Enter new project name:");
    if (newTitle) {
      await renameChat(id, newTitle);
      loadProjects();
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (activeSection === "trash") {
      if (confirm("Permanently delete this project? This action cannot be undone.")) {
        await permanentDeleteChat(id);
        loadProjects();
      }
    } else {
      if (confirm("Move to trash?")) {
        await moveToTrash(id);
        loadProjects();
      }
    }
    router.refresh();
  };

  const handleRestore = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    await restoreFromTrash(id);
    loadProjects();
    router.refresh();
  };

  const handleStar = async (e: React.MouseEvent, p: Project) => {
    e.preventDefault();
    e.stopPropagation();

    const newStarredState = !p.isStarred;

    // 1. OPTIMISTIC UPDATE: Update the UI instantly
    setProjects(currentProjects => {
        if (activeSection === "starred" && !newStarredState) {
            return currentProjects.filter(proj => proj.id !== p.id);
        }
        return currentProjects.map(proj => 
            proj.id === p.id ? { ...proj, isStarred: newStarredState } : proj
        );
    });

    try {
        // 2. Fire the database action
        await toggleChatStar(p.id, newStarredState);
        
        // 3. Purge the client cache so next fetch is fresh
        router.refresh();
    } catch (error) {
        console.error("Failed to toggle star", error);
        loadProjects();
    }
  };

  // =====================================================================
  // --- VIEW: TEMPLATES GALLERY
  // =====================================================================
  if (currentTab === "templates") {
    const categories = ["Business", "Modern", "Dashboard", "Authentication", "Blog", "Slide Show"];

    return (
        <div className="min-h-full animate-in fade-in duration-500 pb-20">
            <div className="p-8 pb-4">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Template Architecture</h1>
                <p className="text-slate-400">Select a neural construct to initialize your workspace.</p>
            </div>
            
            <div className="flex flex-col gap-8 mt-4">
                {categories.map((category) => {
                    const categoryTemplates = TEMPLATES.filter(t => t.category === category);
                    if (categoryTemplates.length === 0) return null;

                    return (
                        <TemplateSliderRow 
                            key={category} 
                            title={`${category} Templates`} 
                            templates={categoryTemplates} 
                            onSelect={handleCreateFromTemplate}
                        />
                    );
                })}
            </div>
        </div>
    )
  }

  // --- VIEW: DASHBOARD (PROJECTS) ---
  return (
    <div className="p-8 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
           <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
             Dashboard <span className="text-purple-500">.</span>
           </h1>
           <p className="text-slate-400">
             {searchQuery ? `Searching for "${searchQuery}"` : "Manage your digital constructs."}
           </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-1 rounded-full flex gap-1 backdrop-blur-md">
            {["all", "starred", "trash"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveSection(tab as any)}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize",
                        activeSection === tab 
                            ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]" 
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                 <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                 <span className="text-slate-500 font-mono text-xs animate-pulse">SYNCING_DATA_SLATES...</span>
             </div>
        </div>
      ) : (
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
        >
             {activeSection === 'all' && !searchQuery && (
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                    <div 
                        onClick={() => setIsWizardOpen(true)}
                        className="group relative h-[300px] rounded-3xl border border-dashed border-white/20 hover:border-purple-500/50 bg-white/5 hover:bg-purple-500/10 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                    >
                        <div className="h-16 w-16 rounded-full bg-white/5 group-hover:bg-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center transition-all duration-500 z-10">
                            <Plus className="w-8 h-8 text-slate-300 group-hover:text-white" />
                        </div>
                        <span className="mt-4 font-mono text-sm text-slate-400 group-hover:text-purple-300 tracking-widest uppercase">Initialize Project</span>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                </motion.div>
             )}

             {filteredProjects.length === 0 && searchQuery && (
                <div className="col-span-full text-center py-20 text-slate-500">
                    No projects found matching "{searchQuery}"
                </div>
             )}

             {filteredProjects.map((project) => (
                <ProjectCard 
                    key={project.id} 
                    project={project} 
                    isTrash={activeSection === "trash"}
                    onOpen={() => router.push(`/editor/${project.id}?chatId=${project.id}`)}
                    onStar={(e: React.MouseEvent) => handleStar(e, project)}
                    onRename={() => handleRename(project.id)}
                    onDelete={(e: React.MouseEvent) => handleDelete(e, project.id)}
                    onRestore={(e: React.MouseEvent) => handleRestore(e, project.id)}
                />
             ))}
        </motion.div>
      )}

      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="relative w-full max-w-4xl">
                 <button onClick={() => setIsWizardOpen(false)} className="absolute -top-12 right-0 text-slate-400 hover:text-white">Close [ESC]</button>
                 <TemplateWizard />
             </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardHome() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
           <span className="text-slate-500 font-mono text-xs animate-pulse">LOADING_DASHBOARD...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

// --- SUB COMPONENTS ---

function TemplateSliderRow({ title, templates, onSelect }: { title: string, templates: any[], onSelect: any }) {
    return (
        <div className="w-full relative">
            <div className="px-8 mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                <div className="flex gap-2">
                    <span className="text-xs text-slate-500 font-mono hidden md:block">Scroll &rarr;</span>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto px-8 pb-8 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {templates.map((t, i) => (
                    <motion.div 
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="min-w-[300px] md:min-w-[340px] snap-start shrink-0 group relative rounded-2xl bg-[#0A0A0A] border border-white/10 p-6 flex flex-col justify-between hover:border-purple-500/50 hover:bg-white/5 transition-all duration-300"
                    >
                        <div>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-purple-400 mb-3 block">
                                {t.category}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2">{t.name}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">{t.description}</p>
                        </div>
                        
                        <Button 
                            onClick={() => onSelect(t)}
                            className="w-full bg-black border border-white/10 hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-400 transition-all text-white font-medium group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        >
                            Initialize <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function ProjectCard({ project, isTrash, onOpen, onStar, onRename, onDelete, onRestore }: any) {
    return (
        <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            onClick={onOpen}
            className="group relative h-[300px] rounded-3xl bg-[#0A0A0A] border border-white/10 hover:border-purple-500/50 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)]"
        >
            <div className="h-[65%] w-full bg-black relative overflow-hidden group-hover:opacity-100 transition-opacity">
                 {project.previewHtml ? (
                    <div className="w-[400%] h-[400%] transform scale-[0.25] origin-top-left pointer-events-none select-none opacity-50 group-hover:opacity-100 transition-opacity duration-500 filter grayscale group-hover:grayscale-0">
                         <iframe 
                            srcDoc={project.previewHtml} 
                            className="w-full h-full border-none bg-white"
                            tabIndex={-1}
                         />
                    </div>
                 ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                        <Layout className="w-10 h-10 text-white/20 mb-2" />
                        <span className="text-[10px] font-mono text-white/20">NO_PREVIEW_DATA</span>
                    </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
            </div>

            <div className="absolute bottom-0 w-full p-5 flex flex-col gap-1 z-20 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent">
                 <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-white font-bold truncate max-w-[180px] group-hover:text-purple-400 transition-colors">
                            {project.title}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                     </div>
                     <button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onStar(e);
                        }}
                        className="text-slate-600 hover:text-yellow-400 transition-colors relative z-10"
                     >
                        <Star className={cn("w-4 h-4", project.isStarred && "fill-yellow-400 text-yellow-400")} />
                     </button>
                 </div>
                 
                 <div className="h-0 group-hover:h-8 transition-all duration-300 overflow-hidden flex items-center gap-2 mt-2">
                     {!isTrash ? (
                         <>
                             <Button size="sm" variant="ghost" className="h-6 text-[10px] text-slate-400 hover:text-white px-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(); }}>
                                <Pencil className="w-3 h-3 mr-1" /> Rename
                             </Button>
                             <div className="h-3 w-px bg-white/10" />
                         </>
                     ) : (
                         <>
                             <Button size="sm" variant="ghost" className="h-6 text-[10px] text-emerald-500 hover:text-emerald-400 px-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRestore(e); }}>
                                <RotateCcw className="w-3 h-3 mr-1" /> Restore
                             </Button>
                             <div className="h-3 w-px bg-white/10" />
                         </>
                     )}
                     
                     <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-900 hover:text-red-500 px-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e); }}>
                        <Trash2 className="w-3 h-3 mr-1" /> {isTrash ? "Delete Forever" : "Trash"}
                     </Button>
                 </div>
            </div>

            <div className="absolute inset-0 border border-transparent rounded-3xl pointer-events-none">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
            </div>
        </motion.div>
    );
}