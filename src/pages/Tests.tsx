
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart3, 
  FilePlus, 
  PieChart, 
  Search, 
  Send, 
  TestTube, 
  UserCog, 
  ChevronDown, 
  MoreHorizontal, 
  Copy,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Test types and interfaces
interface TestResult {
  id: string;
  candidateName: string;
  vacancy: string;
  testName: string;
  score: number;
  maxScore: number;
  completedAt: string;
  status: "completed" | "in_progress" | "not_started" | "expired";
}

interface Test {
  id: string;
  name: string;
  type: "disc" | "technical";
  description: string;
  questions: number;
  duration: string;
  category?: string;
}

// Mock tests data
const discTests: Test[] = [
  {
    id: "disc-1",
    name: "Teste DISC Completo",
    type: "disc",
    description: "Avaliação comportamental baseada na metodologia DISC",
    questions: 24,
    duration: "10-15 min",
  },
  {
    id: "disc-2",
    name: "Teste DISC Simplificado",
    type: "disc",
    description: "Versão simplificada da avaliação DISC",
    questions: 12,
    duration: "5-10 min",
  }
];

const technicalTests: Test[] = [
  {
    id: "tech-1",
    name: "Lógica de Programação",
    type: "technical",
    description: "Avaliação de conhecimentos básicos de lógica de programação",
    questions: 15,
    duration: "30 min",
    category: "Desenvolvimento",
  },
  {
    id: "tech-2",
    name: "Frontend React",
    type: "technical",
    description: "Teste específico para habilidades em React.js",
    questions: 20,
    duration: "45 min",
    category: "Desenvolvimento",
  },
  {
    id: "tech-3",
    name: "UX Design",
    type: "technical",
    description: "Avaliação de conhecimentos em User Experience Design",
    questions: 10,
    duration: "20 min",
    category: "Design",
  },
  {
    id: "tech-4",
    name: "SQL Básico",
    type: "technical",
    description: "Conhecimentos básicos em banco de dados e SQL",
    questions: 15,
    duration: "30 min",
    category: "Dados",
  },
];

// Mock results data
const mockResults: TestResult[] = [
  {
    id: "res-1",
    candidateName: "João Silva",
    vacancy: "Desenvolvedor Frontend",
    testName: "Frontend React",
    score: 85,
    maxScore: 100,
    completedAt: "22/05/2025",
    status: "completed",
  },
  {
    id: "res-2",
    candidateName: "Maria Oliveira",
    vacancy: "UX Designer",
    testName: "UX Design",
    score: 90,
    maxScore: 100,
    completedAt: "21/05/2025",
    status: "completed",
  },
  {
    id: "res-3",
    candidateName: "Pedro Santos",
    vacancy: "DevOps Engineer",
    testName: "Teste DISC Completo",
    score: 0,
    maxScore: 100,
    completedAt: "20/05/2025",
    status: "in_progress",
  },
  {
    id: "res-4",
    candidateName: "Ana Costa",
    vacancy: "Product Manager",
    testName: "Teste DISC Simplificado",
    score: 0,
    maxScore: 100,
    completedAt: "-",
    status: "not_started",
  },
  {
    id: "res-5",
    candidateName: "Carlos Ferreira",
    vacancy: "Desenvolvedor Backend",
    testName: "Lógica de Programação",
    score: 0,
    maxScore: 100,
    completedAt: "-",
    status: "expired",
  },
];

export default function Tests() {
  const [activeTab, setActiveTab] = useState("available");
  const [searchTests, setSearchTests] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const { toast } = useToast();

  // Filter tests based on search
  const filteredTechnicalTests = technicalTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTests.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTests.toLowerCase());
    const matchesCategory = filterCategory === "Todas" || test.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter test results based on search
  const filteredResults = mockResults.filter(result => {
    return result.candidateName.toLowerCase().includes(searchResults.toLowerCase()) ||
           result.vacancy.toLowerCase().includes(searchResults.toLowerCase()) ||
           result.testName.toLowerCase().includes(searchResults.toLowerCase());
  });

  // Get unique categories
  const categories = ["Todas", ...Array.from(new Set(technicalTests.map(test => test.category ?? "")))];

  // Handle sending test
  const handleSendTest = (testId: string) => {
    toast({
      title: "Enviar Teste",
      description: `Selecione um candidato para enviar o teste ID: ${testId}`,
    });
  };

  // Handle duplicating test
  const handleDuplicateTest = (testId: string) => {
    toast({
      title: "Duplicar Teste",
      description: `O teste ID: ${testId} foi duplicado com sucesso.`,
    });
  };

  // Handle viewing test
  const handleViewTest = (testId: string) => {
    toast({
      title: "Visualizar Teste",
      description: `Visualizando o teste ID: ${testId}`,
    });
  };

  // Handle viewing test result
  const handleViewResult = (resultId: string) => {
    toast({
      title: "Visualizar Resultado",
      description: `Visualizando o resultado ID: ${resultId}`,
    });
  };

  // Status badge for test results
  const StatusBadge = ({ status }: { status: TestResult['status'] }) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Concluído</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700">Em Andamento</Badge>;
      case "not_started":
        return <Badge className="bg-yellow-100 text-yellow-700">Não Iniciado</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-700">Expirado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Testes</h1>
        <p className="text-muted-foreground">Gerenciar testes e avaliações para candidatos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span>Testes Disponíveis</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Resultados</span>
          </TabsTrigger>
        </TabsList>

        {/* Available Tests Tab */}
        <TabsContent value="available" className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar testes..."
                  value={searchTests}
                  onChange={(e) => setSearchTests(e.target.value)}
                  className="w-[250px] h-9"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    Categoria: {filterCategory}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {categories.map((category) => (
                    <DropdownMenuItem 
                      key={category}
                      onClick={() => setFilterCategory(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button className="ml-auto">
              <FilePlus className="h-4 w-4 mr-2" />
              Criar Novo Teste
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* DISC Tests */}
            <div className="md:col-span-2 lg:col-span-3">
              <h2 className="font-semibold text-lg mb-3">Testes DISC</h2>
            </div>
            
            {discTests.map((test) => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewTest(test.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTest(test.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <UserCog className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Comportamental</span>
                    </div>
                    <div className="flex items-center">
                      <TestTube className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{test.questions} questões</span>
                    </div>
                    <div className="flex items-center">
                      <PieChart className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{test.duration}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleSendTest(test.id)} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Teste
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Technical Tests */}
            <div className="md:col-span-2 lg:col-span-3 mt-4">
              <h2 className="font-semibold text-lg mb-3">Testes Técnicos</h2>
            </div>
            
            {filteredTechnicalTests.length > 0 ? (
              filteredTechnicalTests.map((test) => (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <CardDescription>{test.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTest(test.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTest(test.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-4">
                      {test.category && (
                        <Badge variant="outline">
                          {test.category}
                        </Badge>
                      )}
                      <div className="flex items-center">
                        <TestTube className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{test.questions} questões</span>
                      </div>
                      <div className="flex items-center">
                        <PieChart className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{test.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => handleSendTest(test.id)} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Teste
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
                <p className="text-muted-foreground mb-4">Nenhum teste técnico encontrado com os filtros atuais.</p>
                <Button variant="outline" onClick={() => {
                  setSearchTests("");
                  setFilterCategory("Todas");
                }}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar resultados..."
                value={searchResults}
                onChange={(e) => setSearchResults(e.target.value)}
                className="w-[250px] h-9"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <Card key={result.id} className={cn(
                  "overflow-hidden",
                  result.status === "expired" && "opacity-70"
                )}>
                  <CardContent className="p-0">
                    <div className="relative p-4">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {result.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{result.candidateName}</div>
                            <div className="text-sm text-muted-foreground">{result.vacancy}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <StatusBadge status={result.status} />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{result.testName}</span>
                          {result.status === "completed" && (
                            <span className="font-medium">{result.score}/{result.maxScore}</span>
                          )}
                        </div>
                        
                        {result.status === "completed" ? (
                          <Progress 
                            value={(result.score / result.maxScore) * 100}
                            className="h-2"
                          />
                        ) : result.status === "in_progress" ? (
                          <Progress value={40} className="h-2" />
                        ) : (
                          <Progress value={0} className="h-2" />
                        )}
                        
                        <div className="flex justify-between mt-4">
                          <div className="text-sm text-muted-foreground">
                            {result.status === "completed" ? (
                              <>Concluído em {result.completedAt}</>
                            ) : result.status === "in_progress" ? (
                              <>Em andamento</>
                            ) : result.status === "not_started" ? (
                              <>Não iniciado</>
                            ) : (
                              <>Expirado</>
                            )}
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewResult(result.id)}
                            disabled={result.status !== "completed"}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Ver Resultado
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground mb-4">Nenhum resultado encontrado com o termo de busca atual.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchResults("")}
                  >
                    Limpar Busca
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
