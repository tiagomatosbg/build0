
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, Plus, ChevronDown, Search } from "lucide-react";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";

export default function Pipeline() {
  const [selectedVacancy, setSelectedVacancy] = useState<string>("Todas as vagas");

  const vacancies = [
    "Todas as vagas",
    "Desenvolvedor Frontend",
    "UX Designer",
    "DevOps Engineer",
    "Product Manager",
    "Desenvolvedor Backend",
    "Data Analyst",
    "Marketing Digital",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline de Seleção</h1>
        <p className="text-muted-foreground">Gerencie o progresso dos candidatos no processo seletivo</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <span>{selectedVacancy}</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {vacancies.map((vacancy) => (
                <DropdownMenuItem 
                  key={vacancy}
                  onClick={() => setSelectedVacancy(vacancy)}
                >
                  {vacancy}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar candidato..."
              className="w-[200px] h-9"
            />
          </div>
          
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <Button className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Candidato
        </Button>
      </div>

      <KanbanBoard />
    </div>
  );
}
