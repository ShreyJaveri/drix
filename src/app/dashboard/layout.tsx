import { AppSidebar } from "@/components/ui/app-sidebar";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden md:flex">
        <AppSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b px-6 bg-white">
          <h2 className="font-semibold text-lg">Workspace</h2>
          <UserButton />
        </header>

        {/* Page Content (Where the Chat & Preview will go) */}
        <div className="flex-1 overflow-auto p-0">
          {children}
        </div>
      </main>
    </div>
  );
}