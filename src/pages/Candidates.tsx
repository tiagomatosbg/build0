
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Filter, MoreHorizontal, Eye, FileText, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockCandidates = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@example.com",
    phone: "(11) 99999-8888",
    vacancy: "Desenvolvedor Frontend",
    stage: "Triagem",
    skills: ["React", "TypeScript", "Tailwind"],
    rating: 4
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    phone: "(11) 98888-7777",
    vacancy: "UX Designer",
    stage: "Teste",
    skills: ["Figma", "Adobe XD", "UX Research"],
    rating: 3
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@example.com",
    phone: "(11) 97777-6666",
    vacancy: "DevOps Engineer",
    stage: "Entrevista",
    skills: ["AWS", "Docker", "Kubernetes"],
    rating: 5
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@example.com",
    phone: "(11) 96666-5555",
    vacancy: "Product Manager",
    stage: "Proposta",
    skills: ["Agile", "Jira", "Product Management"],
    rating: 4
  },
  {
    id: "5",
    name: "Carlos Ferreira",
    email: "carlos.ferreira@example.com",
    phone: "(11) 95555-4444",
    vacancy: "Desenvolvedor Backend",
    stage: "Teste",
    skills: ["Node.js", "Express", "MongoDB"],
    rating: 3
  }
];

const stageColors: Record<string, string> = {
  "Inscrição": "bg-gray-200 text-gray-700",
  "Triagem": "bg-blue-100 text-blue-700",
  "Teste": "bg-green-100 text-green-700",
  "Entrevista": "bg-yellow-100 text-yellow-700",
  "Proposta": "bg-purple-100 text-purple-700",
  "Admissão": "bg-orange-100 text-orange-700",
  "Rejeitado": "bg-red-100 text-red-700"
};

export default function Candidates() {
  const [candidates] = useState(mockCandidates);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("Todos");
  const [filterVacancy, setFilterVacancy] = useState("Todas");
  
  const { toast } = useToast();

  // Filter candidates based on search term and filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStage = filterStage === "Todos" || candidate.stage === filterStage;
    const matchesVacancy = filterVacancy === "Todas" || candidate.vacancy === filterVacancy;
                              
    return matchesSearch && matchesStage && matchesVacancy;
  });

  // Get unique vacancies for filter
  const vacancies = ["Todas", ...Array.from(new Set(candidates.map(c => c.vacancy)))];
  
  // Get unique stages for filter
  const stages = ["Todos", ...Array.from(new Set(candidates.map(c => c.stage)))];

  // Rating stars
  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= rating ? "currentColor" : "none"}
            stroke={star <= rating ? "currentColor" : "currentColor"}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ))}
      </div>
    );
  };

  // Handle view candidate
  const handleViewCandidate = (id: string) => {
    toast({
      title: "Visualizar Candidato",
      description: `Visualizando candidato com ID: ${id}`,
    });
  };

  // Handle send email
  const handleSendEmail = (email: string) => {
    toast({
      title: "Enviar Email",
      description: `Enviando email para: ${email}`,
    });
  };

  // Handle call
  const handleCall = (phone: string) => {
    toast({
      title: "Realizar Chamada",
      description: `Ligando para: ${phone}`,
    });
  };

  // Handle view resume
  const handleViewResume = (id: string) => {
    toast({
      title: "Visualizar Currículo",
      description: `Visualizando currículo do candidato com ID: ${id}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidatos</h1>
        <p className="text-muted-foreground">Gerencie sua base de candidatos</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar candidatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[250px] h-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Etapa: {filterStage}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {stages.map((stage) => (
                <DropdownMenuItem 
                  key={stage}
                  onClick={() => setFilterStage(stage)}
                >
                  {stage}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Vaga: {filterVacancy}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {vacancies.map((vacancy) => (
                <DropdownMenuItem 
                  key={vacancy}
                  onClick={() => setFilterVacancy(vacancy)}
                >
                  {vacancy}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Candidato
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidato</TableHead>
              <TableHead>Vaga</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{candidate.vacancy}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className={stageColors[candidate.stage] || ""}
                  >
                    {candidate.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{renderRating(candidate.rating)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewCandidate(candidate.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewResume(candidate.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver currículo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSendEmail(candidate.email)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCall(candidate.phone)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Ligar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredCandidates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <div className="flex flex-col items-center">
                    <p className="text-muted-foreground mb-4">Nenhum candidato encontrado com os filtros atuais.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStage("Todos");
                        setFilterVacancy("Todas");
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
