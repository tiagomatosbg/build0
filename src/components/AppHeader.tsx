
import { Bell, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  sidebarWidth: number;
}

export function AppHeader({ sidebarWidth }: AppHeaderProps) {
  return (
    <header
      className="h-16 border-b border-border bg-white dark:bg-gray-900 flex items-center justify-between px-4"
      style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth}px)` }}
    >
      <div className="flex items-center gap-4 w-full max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar vagas, candidatos..."
            className="pl-9 w-full bg-background"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="font-medium">Nova candidatura recebida</div>
                  <div className="text-sm text-muted-foreground">João Silva se candidatou para Desenvolvedor Frontend</div>
                  <div className="text-xs text-muted-foreground mt-1">Agora mesmo</div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center font-medium text-primary">
              Ver todas as notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              Empresa ABC
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Trocar empresa</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Empresa ABC</DropdownMenuItem>
            <DropdownMenuItem>Empresa XYZ</DropdownMenuItem>
            <DropdownMenuItem>Empresa 123</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AppHeader;
