
import {
  Briefcase,
  Kanban,
  Users,
  Calendar,
  TestTube,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    description: "Visão geral do recrutamento",
  },
  {
    title: "Vagas",
    icon: Briefcase,
    href: "/vagas",
    description: "Gerenciar vagas abertas",
  },
  {
    title: "Pipeline",
    icon: Kanban,
    href: "/pipeline",
    description: "Pipeline de seleção Kanban",
  },
  {
    title: "Candidatos",
    icon: Users,
    href: "/candidatos",
    description: "Base de candidatos",
  },
  {
    title: "Entrevistas",
    icon: Calendar,
    href: "/entrevistas",
    description: "Agenda de entrevistas",
  },
  {
    title: "Testes",
    icon: TestTube,
    href: "/testes",
    description: "Gerenciar testes",
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/configuracoes",
    description: "Configurações do sistema",
  },
];

const AppSidebar = () => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const location = useLocation();

  // Collapse sidebar on mobile automatically
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <aside
      className={cn(
        "h-screen fixed left-0 top-0 z-10 flex flex-col border-r border-border bg-white transition-all duration-300 dark:bg-gray-900",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-company-orange flex items-center justify-center text-white font-bold">
              P
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-company-orange flex items-center justify-center text-white font-bold mr-2">
                P
              </div>
              <span className="font-semibold text-xl">Pessoas</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800", 
            collapsed ? "absolute right-[-12px] top-8 bg-white dark:bg-gray-900 border border-border rounded-full" : ""
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User profile section at bottom */}
      <div className="mt-auto border-t border-border p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">RH</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">Admin RH</p>
              <p className="text-xs text-muted-foreground">admin@empresa.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
