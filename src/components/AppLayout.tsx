
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarWidth, setSidebarWidth] = useState(isMobile ? 70 : 250);
  
  // Update sidebar width when screen size changes
  useEffect(() => {
    setSidebarWidth(isMobile ? 70 : 250);
  }, [isMobile]);
  
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: sidebarWidth }}>
        <AppHeader sidebarWidth={sidebarWidth} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
