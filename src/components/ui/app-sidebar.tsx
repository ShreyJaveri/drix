import { Plus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { getUserChats, createChat } from "@/app/actions"; // ✅ CORRECTED IMPORT
import { ChatItem } from "../chat-item";
import { currentUser } from "@clerk/nextjs/server"; // ✅ NEEDED FOR USER ID

export async function AppSidebar() {
  // 1. Get the authenticated user
  const user = await currentUser();

  // 2. Handle logged out state (optional, but good practice)
  if (!user) return null; 

  // 3. Fetch chats for THIS user
  const chatList = await getUserChats(user.id);

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-slate-50/50 pb-4">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <LayoutDashboard className="h-5 w-5 text-blue-600" />
          <span>Aura Builder</span>
        </Link>
      </div>

      <div className="p-4">
        {/* ✅ Server Action wrapper to pass User ID */}
        <form
          action={async () => {
            "use server";
            if (!user) return;
            // createChat now requires (userId, title)
            await createChat(user.id, "New Project"); 
          }}
        >
          <Button className="w-full justify-start gap-2" variant="default">
             <Plus className="h-4 w-4" />
             New Project
          </Button>
        </form>
      </div>
      
      <Separator />

      <div className="flex-1 overflow-auto py-2">
        <div className="px-4 text-xs font-semibold text-muted-foreground mb-2">
          Your Projects
        </div>
        <nav className="grid gap-1 px-2">
          {chatList.map((chat) => (
             // @ts-ignore - Ignores strict type check on the chat object shape if needed
             <ChatItem key={chat.id} chat={chat} />
          ))}
          {chatList.length === 0 && (
            <p className="px-2 text-xs text-muted-foreground">No projects yet.</p>
          )}
        </nav>
      </div>
    </div>
  );
}