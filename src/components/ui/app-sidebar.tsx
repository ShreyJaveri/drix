"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  Library, 
  ChevronsLeft,
  Zap,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createChat } from "@/app/actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  // Get current tab from URL
  const currentTab = searchParams.get("tab");

  // ✅ Client-Side Project Creation
  const handleCreateNew = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const chat = await createChat(userId, "Untitled Project");
      // ✅ FIXED BUG: Added ?chatId= param to match the editor's requirement
      router.push(`/editor/${chat.id}?chatId=${chat.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, href: "/dashboard" },
    { label: "Templates", icon: <Library className="w-4 h-4" />, href: "/dashboard?tab=templates" },
    { label: "Statistics", icon: <Activity className="w-4 h-4" />, href: "/dashboard/statistics" },
    { label: "Settings", icon: <Settings className="w-4 h-4" />, href: "/dashboard/settings" },
  ];

  return (
    <div className="h-full w-64 flex flex-col justify-between p-4 text-white">
      
      {/* 1. BRAND HEADER */}
      <div className="mb-8 px-2 flex items-center gap-2">
        <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <Zap className="h-5 w-5 text-white fill-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">AuraBuilder</span>
      </div>

      {/* 2. MAIN ACTIONS */}
      <div className="space-y-6 flex-1">
        
        {/* CREATE BUTTON */}
        <Button 
            onClick={handleCreateNew} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all hover:scale-[1.02]"
        >
           <Plus className="mr-2 h-4 w-4" /> 
           {loading ? "Initializing..." : "New Project"}
        </Button>

        {/* NAVIGATION LINKS */}
        <div className="space-y-1">
            {menuItems.map((item) => {
                const isDashboard = item.href === "/dashboard" && pathname === "/dashboard" && !currentTab;
                const isTabMatch = currentTab && item.href.includes(`tab=${currentTab}`);
                const isExactMatch = pathname === item.href && !item.href.includes('?');
                const isActive = isDashboard || isTabMatch || isExactMatch;

                return (
                    <Link key={item.href} href={item.href}>
                        <div className={cn(
                            "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                            isActive 
                                ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/5" 
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}>
                            <span className={cn(
                                "transition-colors", 
                                isActive ? "text-purple-400" : "text-slate-500 group-hover:text-purple-400"
                            )}>
                                {item.icon}
                            </span>
                            {item.label}
                            
                            {/* Hover Glow */}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]" />
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
      </div>

      {/* 3. FOOTER / USER MINI-PROFILE */}
      <div className="mt-auto pt-6 border-t border-white/10">
         <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold">
                 {user?.firstName?.charAt(0) || "U"}
             </div>
             <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-bold truncate text-slate-200">{user?.fullName || "User"}</p>
                 <p className="text-[10px] text-slate-500 truncate">Pro Plan</p>
             </div>
             <ChevronsLeft className="w-4 h-4 text-slate-600 cursor-not-allowed" />
         </div>
      </div>
    </div>
  );
}