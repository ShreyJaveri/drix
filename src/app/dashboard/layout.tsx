"use client";

import { AppSidebar } from "@/components/ui/app-sidebar";
import { UserButton } from "@clerk/nextjs";
import { Search, Bell, Zap, CheckCircle2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useDebouncedCallback } from "use-debounce"; // Optional, but good for perf. Or just simple timeout.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {    
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 1. SEARCH LOGIC (Syncs input to URL ?search=param)
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      
      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black/80" />
      </div>

      {/* SIDEBAR */}
      <aside className="hidden md:flex relative z-20 border-r border-white/5 bg-black/40 backdrop-blur-xl">
        <AppSidebar />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* HEADER HUD */}
        <header className="flex h-16 items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md">
          
          {/* FUNCTIONAL SEARCH BAR */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search_Projects..." 
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.get('search')?.toString()}
              className="bg-white/5 border border-white/10 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:bg-white/10 transition-all text-slate-300 placeholder:text-slate-600 font-mono"
            />
          </div>

          <div className="flex items-center gap-6">
            
            {/* FUNCTIONAL NOTIFICATIONS */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative group focus:outline-none">
                    <Bell className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 bg-[#0A0A0A] border border-white/10 p-0 text-white">
                 <div className="p-4 border-b border-white/5">
                    <h4 className="font-bold text-sm">System Notifications</h4>
                 </div>
                 <div className="p-2 space-y-1">
                    <div className="flex gap-3 items-start p-2 hover:bg-white/5 rounded-lg transition-colors cursor-default">
                        <div className="mt-1 h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                        <div>
                            <p className="text-xs font-medium text-slate-200">Gemini 1.5 Flash Active</p>
                            <p className="text-[10px] text-slate-500">System is operating at 100% capacity.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start p-2 hover:bg-white/5 rounded-lg transition-colors cursor-default">
                         <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                         <div>
                            <p className="text-xs font-medium text-slate-200">Welcome to Aura v2</p>
                            <p className="text-[10px] text-slate-500">New 3D engine enabled.</p>
                        </div>
                    </div>
                 </div>
              </PopoverContent>
            </Popover>

            <div className="h-6 w-px bg-white/10" />
            
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 border border-white/10 hover:border-purple-500 transition-colors"
                }
              }}
            />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-auto p-0 scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
}