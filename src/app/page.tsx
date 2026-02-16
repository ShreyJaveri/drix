"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { 
  Plus, Layout, Loader2, Star, Trash2, Folder, 
  MoreHorizontal, RotateCcw, Pencil, Search 
} from "lucide-react";
import { 
  createChat, getUserChats, moveToTrash, 
  toggleChatStar, renameChat, restoreFromTrash, permanentDeleteChat 
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { TemplateWizard } from "@/components/template-wizard"; // ✅ Import the Wizard

interface Project {
  id: number;
  title: string;
  createdAt: Date;
  isStarred: boolean;
  isDeleted: boolean;
  previewHtml?: string;
}

export default function DashboardHome() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  
  // State
  const [activeSection, setActiveSection] = useState<"all" | "templates" | "starred" | "trash">("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch Projects
  useEffect(() => {
    if (userId && activeSection !== 'templates') {
      setLoading(true);
      getUserChats(userId, activeSection as "all" | "starred" | "trash").then((data) => {
        setProjects(data as unknown as Project[]);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, [userId, activeSection]);

  // Actions
  const handleCreate = async (title: string, html: string) => {
    if (!userId) return;
    const newChat = await createChat(userId, title, html);
    if (newChat) router.push(`/editor/${newChat.id}?chatId=${newChat.id}`);
  };

  const handleRename = async (id: number) => {
    const newName = prompt("Enter new project name:");
    if (newName) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, title: newName } : p));
        await renameChat(id, newName);
    }
  };

  const handleStar = async (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    setProjects(prev => activeSection === 'starred' 
        ? prev.filter(proj => proj.id !== p.id) 
        : prev.map(proj => proj.id === p.id ? { ...proj, isStarred: !proj.isStarred } : proj)
    );
    await toggleChatStar(p.id, p.isStarred);
  };

  const handleSoftDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if(!confirm("Move to Trash?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    await moveToTrash(id);
  };

  const handleRestore = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
    await restoreFromTrash(id);
  };

  const handlePermanentDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if(!confirm("Permanently delete?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    await permanentDeleteChat(id);
  };


  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col shrink-0">
        <div className="p-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">Aura Builder</h1>
            <p className="text-xs text-slate-400">v2.0 Infinite</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
            <SidebarBtn icon={<Folder className="w-4 h-4"/>} label="All Projects" active={activeSection === 'all'} onClick={() => setActiveSection('all')} />
            <SidebarBtn icon={<Layout className="w-4 h-4"/>} label="New Template" active={activeSection === 'templates'} onClick={() => setActiveSection('templates')} />
            <SidebarBtn icon={<Star className="w-4 h-4"/>} label="Starred" active={activeSection === 'starred'} onClick={() => setActiveSection('starred')} />
            <div className="pt-4 mt-4 border-t border-slate-100">
                <SidebarBtn icon={<Trash2 className="w-4 h-4"/>} label="Trash Bin" active={activeSection === 'trash'} onClick={() => setActiveSection('trash')} />
            </div>
        </nav>
        <div className="p-4 border-t bg-slate-50/50">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleCreate("New Project", "<div>Start Blank</div>")}>
                <Plus className="mr-2 h-4 w-4" /> Blank Project
            </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* --- VIEW: NEW AI TEMPLATE WIZARD --- */}
        {activeSection === 'templates' && (
             <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[600px]">
                {/* ✅ We render the separate Wizard component here */}
                <TemplateWizard />
             </div>
        )}

        {/* --- VIEW: PROJECT LISTS --- */}
        {activeSection !== 'templates' && (
            <div>
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold capitalize">{activeSection}</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search saved projects..." className="pl-9 w-64 bg-white" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500"/></div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl">
                        <p className="text-slate-400">No projects found in {activeSection}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((p) => (
                            <div key={p.id} className="group relative bg-white rounded-xl border hover:shadow-xl transition-all duration-300 flex flex-col h-[280px] overflow-hidden">
                                <div onClick={() => activeSection !== 'trash' && router.push(`/editor/${p.id}?chatId=${p.id}`)} className="flex-1 bg-slate-100 relative overflow-hidden cursor-pointer">
                                    <div className="w-[400%] h-[400%] transform scale-25 origin-top-left pointer-events-none select-none absolute inset-0 bg-white">
                                        <iframe srcDoc={p.previewHtml || ""} className="w-full h-full border-none" tabIndex={-1} />
                                    </div>
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors" />
                                </div>
                                <div className="p-4 bg-white border-t relative">
                                    <div className="flex justify-between items-start">
                                        <div className="w-full">
                                            <h3 className="font-semibold text-slate-900 truncate pr-6" title={p.title}>{p.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">Edited {new Date(p.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-6 w-6 p-0 -mr-2"><MoreHorizontal className="h-4 w-4 text-slate-400" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {activeSection === 'trash' ? (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => handleRestore(e, p.id)}><RotateCcw className="mr-2 h-4 w-4"/> Restore</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handlePermanentDelete(e, p.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Delete Forever</DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleRename(p.id)}><Pencil className="mr-2 h-4 w-4"/> Rename</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handleStar(e, p)}><Star className={`mr-2 h-4 w-4 ${p.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`}/> {p.isStarred ? 'Unstar' : 'Star'}</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handleSoftDelete(e, p.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Move to Trash</DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}

function SidebarBtn({ icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
            {icon} {label}
        </button>
    )
}