"use client";

import { useState, Suspense } from "react";
import { UserProfile, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Database, AlertTriangle, 
  Zap, Download, Trash2, Cpu, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import your existing backend actions!
import { getUserChats, permanentDeleteChat } from "@/app/actions";

const TABS = [
  { id: "profile", label: "User Profile", icon: <User className="w-4 h-4" /> },
  { id: "data", label: "Data Management", icon: <Database className="w-4 h-4" /> },
];

// 1. Rename the main component (remove export default)
function SettingsContent() {
  const { userId } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("profile");
  
  // --- LOADING STATES FOR BUTTONS ---
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==========================================
  // FUNCTION 1: EXPORT DATA TO JSON FILE
  // ==========================================
  const handleExport = async () => {
    if (!userId) return;
    setIsExporting(true);
    
    try {
      // 1. Fetch all user data from the database
      const data = await getUserChats(userId, "all");
      
      // 2. Convert data to a JSON string with pretty formatting
      const jsonString = JSON.stringify({
         exportedAt: new Date().toISOString(),
         user: userId,
         totalProjects: data.length,
         projects: data 
      }, null, 2);

      // 3. Create a Blob and a downloadable link
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `drix_workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      // 4. Trigger download and clean up
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please check console.");
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // FUNCTION 2: CLEAR BROWSER CACHE
  // ==========================================
  const handleClearCache = () => {
    if (window.confirm("This will clear your local browser cache. Unsaved local changes might be lost. Continue?")) {
        localStorage.clear();
        sessionStorage.clear();
        alert("Local cache cleared successfully.");
        window.location.reload(); // Reload to apply fresh state
    }
  };

  // ==========================================
  // FUNCTION 3: TERMINATE ACCOUNT & WIPE DB
  // ==========================================
  const handleTerminateAccount = async () => {
    if (!userId) return;
    
    // Strict confirmation to prevent accidental clicks
    const confirmation = window.prompt("WARNING: This will permanently delete ALL your projects. Type 'DELETE' to confirm.");
    
    if (confirmation === "DELETE") {
        setIsDeleting(true);
        try {
            // 1. Fetch all user projects
            const allProjects = await getUserChats(userId, "all");
            
            // 2. Loop through and permanently delete them from the database
            for (const project of allProjects) {
               // @ts-ignore - Assuming project has an id property
               await permanentDeleteChat(project.id);
            }
            
            // 3. Sign the user out of Clerk
            await signOut();
            
            // 4. Redirect to home page
            router.push("/");
            
        } catch (error) {
            console.error("Failed to delete account data:", error);
            alert("An error occurred while wiping data.");
            setIsDeleting(false);
        }
    } else if (confirmation !== null) {
        alert("Confirmation failed. Account was not deleted.");
    }
  };

  return (
    <div className="p-8 min-h-full max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-6">
        <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                Control Center <Zap className="w-6 h-6 text-purple-500" />
            </h1>
            <p className="text-slate-400">Configure your workspace parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT NAV */}
        <div className="lg:col-span-3 space-y-2">
           {TABS.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 relative overflow-hidden",
                      activeTab === tab.id 
                          ? "text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10" 
                          : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
               >
                  {activeTab === tab.id && (
                      <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                  )}
                  {tab.icon}
                  {tab.label}
               </button>
           ))}

           {/* System Status Mini-Panel */}
           <div className="mt-12 p-5 bg-[#0A0A0A] rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-4 text-purple-400 font-bold text-xs uppercase tracking-widest">
                    <Cpu className="w-3 h-3" /> Engine Status
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Gemini 1.5 Flash</span>
                            <span className="text-green-400 animate-pulse">OPTIMAL</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-500 w-[95%] h-full" />
                        </div>
                    </div>
                </div>
           </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="lg:col-span-9 relative min-h-[600px] w-full max-w-full overflow-hidden">
           <AnimatePresence mode="wait">
               
               {/* ========================================== */}
               {/* 1. PROFILE TAB                             */}
               {/* ========================================== */}
               {activeTab === "profile" && (
                   <motion.div 
                       key="profile"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: 0.2 }}
                       className="w-full flex justify-center"
                   >
                       <div className="w-full rounded-3xl border border-white/10 shadow-2xl bg-[#0A0A0A] flex justify-center overflow-x-auto p-4 md:p-8">
                           <UserProfile 
                               appearance={{
                                   elements: {
                                       rootBox: "w-full flex justify-center",
                                       card: "w-full max-w-4xl shadow-none",
                                       navbar: "hidden", 
                                   }
                               }}
                           />
                       </div>
                   </motion.div>
               )}

               {/* ========================================== */}
               {/* 2. DATA MANAGEMENT TAB                       */}
               {/* ========================================== */}
               {activeTab === "data" && (
                   <motion.div 
                       key="data"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: 0.2 }}
                       className="space-y-6"
                   >
                       {/* Data Actions */}
                       <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/10">
                           <h2 className="text-xl font-bold text-white mb-2">Workspace Data</h2>
                           <p className="text-sm text-slate-400 mb-8">Manage your generated code, assets, and local cache.</p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <button 
                                  onClick={handleExport} 
                                  disabled={isExporting}
                                  className="p-5 rounded-xl border border-white/10 bg-black hover:bg-white/5 text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                   {isExporting ? (
                                       <Loader2 className="w-5 h-5 text-purple-400 mb-3 animate-spin" />
                                   ) : (
                                       <Download className="w-5 h-5 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                                   )}
                                   <p className="text-sm font-bold text-slate-200">Export All Projects</p>
                                   <p className="text-xs text-slate-500 mt-1">Download your workspace as a `.json` backup.</p>
                               </button>
                               
                               <button onClick={handleClearCache} className="p-5 rounded-xl border border-white/10 bg-black hover:bg-white/5 text-left transition-colors group">
                                   <Database className="w-5 h-5 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                                   <p className="text-sm font-bold text-slate-200">Clear Local Cache</p>
                                   <p className="text-xs text-slate-500 mt-1">Free up memory. Does not delete saved projects.</p>
                               </button>
                           </div>
                       </div>

                       {/* Danger Zone */}
                       <div className="p-8 rounded-3xl bg-red-950/10 border border-red-900/30 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />
                           <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                               <AlertTriangle className="w-5 h-5" /> Danger Zone
                           </h2>
                           <p className="text-sm text-red-400/70 mb-8">Permanently delete your account and all associated data. This action is irreversible.</p>
                           
                           <div className="p-6 bg-red-950/30 rounded-2xl border border-red-900/50 flex flex-col md:flex-row gap-6 items-center justify-between">
                               <div>
                                   <h3 className="text-white font-bold text-sm">Delete Account</h3>
                                   <p className="text-xs text-red-300/50 mt-1">Wipe everything from our servers.</p>
                               </div>
                               <Button 
                                  variant="destructive" 
                                  onClick={handleTerminateAccount}
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-700 w-full md:w-auto font-bold disabled:opacity-50"
                               >
                                   {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                   {isDeleting ? "Terminating..." : "Terminate Account"}
                               </Button>
                           </div>
                       </div>
                   </motion.div>
               )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// 2. Add the Suspense Wrapper
export default function SettingsPage() {
  return (
    <Suspense 
      fallback={
        <div className="p-8 h-full flex items-center justify-center text-slate-400 font-mono text-sm">
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-purple-500" />
          LOADING_SETTINGS...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}