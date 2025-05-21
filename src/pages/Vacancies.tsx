
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { VacancyCard } from "@/components/vacancies/VacancyCard";
import { DialogClose, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockVacancies = [
  {
    id: "1",
    title: "Desenvolvedor Frontend",
    department: "Tecnologia",
    location: "São Paulo, SP",
    status: "open",
    candidates: 12,
    createdAt: "12/05/2025",
    salary: "R$ 8.000 - R$ 12.000",
    contractType: "CLT"
  },
  {
    id: "2",
    title: "UX Designer",
    department: "Produto",
    location: "Remoto",
    status: "screening",
    candidates: 8,
    createdAt: "10/05/2025",
    salary: "R$ 7.000 - R$ 10.000",
    contractType: "CLT"
  },
  {
    id: "3",
    title: "DevOps Engineer",
    department: "Infraestrutura",
    location: "São Paulo, SP",
    status: "interviewing",
    candidates: 5,
    createdAt: "08/05/2025",
    salary: "R$ 10.000 - R$ 15.000",
    contractType: "CLT"
  },
  {
    id: "4",
    title: "Product Manager",
    department: "Produto",
    location: "Remoto",
    status: "open",
    candidates: 7,
    createdAt: "05/05/2025",
    salary: "R$ 12.000 - R$ 18.000",
    contractType: "CLT"
  },
  {
    id: "5",
    title: "Desenvolvedor Backend",
    department: "Tecnologia",
    location: "São Paulo, SP",
    status: "closed",
    candidates: 15,
    createdAt: "01/05/2025",
    salary: "R$ 9.000 - R$ 14.000",
    contractType: "CLT"
  },
  {
    id: "6",
    title: "Data Analyst",
    department: "Dados",
    location: "Remoto",
    status: "canceled",
    candidates: 3,
    createdAt: "28/04/2025",
    salary: "R$ 8.000 - R$ 11.000",
    contractType: "CLT"
  }
];

export default function Vacancies() {
  const [vacancies] = useState(mockVacancies);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterDepartment, setFilterDepartment] = useState("Todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Filter vacancies based on search term and filters
  const filteredVacancies = vacancies.filter(vacancy => {
    const matchesSearch = vacancy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vacancy.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "Todos" || 
                          (filterStatus === "Abertas" && vacancy.status === "open") ||
                          (filterStatus === "Em Triagem" && vacancy.status === "screening") ||
                          (filterStatus === "Entrevistas" && vacancy.status === "interviewing") ||
                          (filterStatus === "Fechadas" && vacancy.status === "closed") ||
                          (filterStatus === "Canceladas" && vacancy.status === "canceled");
                          
    const matchesDepartment = filterDepartment === "Todos" || 
                              vacancy.department === filterDepartment;
                              
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Departments for filter (dynamically generated from vacancies)
  const departments = ["Todos", ...Array.from(new Set(vacancies.map(v => v.department)))];

  // Handlers
  const handleViewVacancy = (id: string) => {
    toast({
      title: "Visualizar Vaga",
      description: `Visualizando vaga com ID: ${id}`,
    });
  };

  const handleEditVacancy = (id: string) => {
    toast({
      title: "Editar Vaga",
      description: `Editando vaga com ID: ${id}`,
    });
  };

  const handleDeleteClick = (id: string) => {
    setVacancyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vacancyToDelete) {
      toast({
        title: "Vaga Excluída",
        description: `Vaga com ID: ${vacancyToDelete} foi excluída com sucesso.`,
      });
      setDeleteDialogOpen(false);
      setVacancyToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vagas</h1>
        <p className="text-muted-foreground">Gerenciar vagas da empresa</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px] h-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Status: {filterStatus}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {["Todos", "Abertas", "Em Triagem", "Entrevistas", "Fechadas", "Canceladas"].map((status) => (
                <DropdownMenuItem 
                  key={status}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Departamento: {filterDepartment}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {departments.map((department) => (
                <DropdownMenuItem 
                  key={department}
                  onClick={() => setFilterDepartment(department)}
                >
                  {department}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Vaga
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredVacancies.map((vacancy) => (
          <VacancyCard
            key={vacancy.id}
            vacancy={vacancy as any}
            onView={handleViewVacancy}
            onEdit={handleEditVacancy}
            onDelete={handleDeleteClick}
          />
        ))}
        
        {filteredVacancies.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
            <p className="text-muted-foreground mb-4">Nenhuma vaga encontrada com os filtros atuais.</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterStatus("Todos");
              setFilterDepartment("Todos");
            }}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
