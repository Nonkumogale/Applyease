import { Link, useLocation } from "wouter";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, FileText, Send, CheckCircle2 } from "lucide-react";
import { useGetApplicant } from "@workspace/api-client-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const currentUserId = 1; // Hardcoded as requested
  const { data: user } = useGetApplicant(currentUserId);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r-0">
          <SidebarHeader className="p-4 pt-6">
            <Link href="/dashboard" className="flex items-center gap-2 px-2 group">
              <div className="bg-accent text-accent-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                <CheckCircle2 size={24} strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">ApplyEase</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-2 pt-8">
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/dashboard"}>
                    <Link href="/dashboard" className="font-medium">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/applications")}>
                    <Link href="/applications" className="font-medium">
                      <Send />
                      <span>Applications</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/documents"}>
                    <Link href="/documents" className="font-medium">
                      <FileText />
                      <span>Documents</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/profile"}>
                  <Link href="/profile" className="flex items-center gap-3 h-12">
                    <Avatar className="h-8 w-8 bg-sidebar-accent text-sidebar-accent-foreground">
                      <AvatarFallback className="bg-sidebar-accent">{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium leading-none">{user?.fullName || "Student"}</span>
                      <span className="text-xs text-sidebar-accent-foreground/70 mt-1.5">View Profile</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
          <header className="h-16 flex items-center justify-between px-6 md:hidden border-b border-border/50 bg-background/95 backdrop-blur z-10 sticky top-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-foreground" />
              <div className="bg-primary text-primary-foreground p-1 rounded-md">
                <CheckCircle2 size={18} strokeWidth={3} />
              </div>
              <span className="font-display font-bold text-lg text-foreground">ApplyEase</span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 md:p-10 lg:p-12 pb-24 max-w-[1200px] w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
