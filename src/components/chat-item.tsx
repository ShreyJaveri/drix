"use client";

import { MessageSquare, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // ✅ Added useSearchParams
import { deleteChat, renameChat } from "@/app/actions";
import { useState } from "react";

export function ChatItem({ chat }: { chat: { id: number; title: string } }) {
  const router = useRouter(); 
  const searchParams = useSearchParams(); // ✅ Get the actual query params

  // ✅ CORRECT FIX: Check against the URL parameter, not the pathname
  const currentChatId = searchParams.get("chatId");
  const isActive = currentChatId === String(chat.id);

  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this project?")) {
      setLoading(true);
      
      // 1. Delete from DB
      await deleteChat(chat.id);
      
      // 2. IF we are currently looking at this deleted project...
      if (isActive) {
        // ...Immediately jump to the empty dashboard
        router.push("/dashboard"); 
      }
      
      // 3. Refresh the list to remove the item
      router.refresh();
      setLoading(false);
    }
  };

  const handleRename = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newName = prompt("Enter new name:", chat.title);
    if (newName && newName !== chat.title) {
      setLoading(true);
      await renameChat(chat.id, newName);
      router.refresh();
      setLoading(false);
    }
  };

  if (loading) return <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">Updating...</div>;

  return (
    <div className="group flex items-center w-full relative">
        <Link 
            href={`/dashboard?chatId=${chat.id}`} 
            className={`flex-1 flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                isActive ? "bg-slate-200 text-slate-900 font-medium" : "hover:bg-slate-100 text-slate-600"
            }`}
        >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[140px]">{chat.title}</span>
        </Link>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1"
                >
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRename} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}