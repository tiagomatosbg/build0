
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, VideoIcon, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Interview {
  id: string;
  candidateName: string;
  vacancy: string;
  dateTime: Date;
  duration: string;
  location: string;
  type: "online" | "presencial";
  status: "agendada" | "realizada" | "cancelada";
}

// Mock data for interviews
const mockInterviews: Interview[] = [
  {
    id: "1",
    candidateName: "João Silva",
    vacancy: "Desenvolvedor Frontend",
    dateTime: new Date(2025, 4, 22, 10, 0), // 22/05/2025 10:00
    duration: "1 hora",
    location: "Google Meet",
    type: "online",
    status: "agendada",
  },
  {
    id: "2",
    candidateName: "Maria Oliveira",
    vacancy: "UX Designer",
    dateTime: new Date(2025, 4, 22, 14, 30), // 22/05/2025 14:30
    duration: "45 minutos",
    location: "Escritório São Paulo",
    type: "presencial",
    status: "agendada",
  },
  {
    id: "3",
    candidateName: "Pedro Santos",
    vacancy: "DevOps Engineer",
    dateTime: new Date(2025, 4, 23, 11, 0), // 23/05/2025 11:00
    duration: "1 hora",
    location: "Zoom",
    type: "online",
    status: "agendada",
  },
  {
    id: "4",
    candidateName: "Ana Costa",
    vacancy: "Product Manager",
    dateTime: new Date(2025, 4, 21, 15, 0), // 21/05/2025 15:00
    duration: "1 hora",
    location: "Google Meet",
    type: "online",
    status: "realizada",
  },
  {
    id: "5",
    candidateName: "Carlos Ferreira",
    vacancy: "Desenvolvedor Backend",
    dateTime: new Date(2025, 4, 20, 9, 0), // 20/05/2025 09:00
    duration: "1 hora",
    location: "Escritório Rio de Janeiro",
    type: "presencial",
    status: "cancelada",
  },
];

export default function Interviews() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterType, setFilterType] = useState<string>("todos");

  // Get interviews for the selected date
  const interviewsForDate = mockInterviews.filter(interview => {
    const sameDay = date && 
      interview.dateTime.getDate() === date.getDate() &&
      interview.dateTime.getMonth() === date.getMonth() &&
      interview.dateTime.getFullYear() === date.getFullYear();

    const statusMatch = filterStatus === "todos" || interview.status === filterStatus;
    const typeMatch = filterType === "todos" || interview.type === filterType;

    return sameDay && statusMatch && typeMatch;
  });

  // Get dates with interviews (for calendar highlighting)
  const datesWithInterviews = mockInterviews.map(interview => interview.dateTime);

  // Format date to display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Entrevistas</h1>
        <p className="text-muted-foreground">Gerencie e acompanhe todas as entrevistas</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar and filters */}
        <div className="w-full md:w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md"
                modifiers={{
                  hasInterview: datesWithInterviews,
                }}
                modifiersStyles={{
                  hasInterview: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    color: 'var(--primary)',
                  }
                }}
              />
              
              <div className="space-y-3 mt-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="agendada">Agendadas</SelectItem>
                      <SelectItem value="realizada">Realizadas</SelectItem>
                      <SelectItem value="cancelada">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Interviews list */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {date ? (
                <>
                  Entrevistas de {date.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </>
              ) : (
                "Selecione uma data"
              )}
            </h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agendar Entrevista
            </Button>
          </div>
          
          <div className="space-y-4">
            {interviewsForDate.length > 0 ? (
              interviewsForDate.map(interview => (
                <Card key={interview.id} className={cn(
                  "overflow-hidden",
                  interview.status === "cancelada" && "opacity-60"
                )}>
                  <div className="relative">
                    {/* Status indicator bar at left of card */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1",
                      interview.status === "agendada" ? "bg-blue-500" :
                      interview.status === "realizada" ? "bg-green-500" : "bg-red-500"
                    )} />
                    
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 pl-6">
                        <div className="flex items-center mb-3 md:mb-0">
                          <div className="mr-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {interview.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <h3 className="font-medium">{interview.candidateName}</h3>
                            <p className="text-sm text-muted-foreground">{interview.vacancy}</p>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {formatDate(interview.dateTime)} • {interview.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start md:items-end gap-2">
                          <Badge variant={interview.type === "online" ? "outline" : "secondary"} className="flex items-center gap-1">
                            {interview.type === "online" ? (
                              <VideoIcon className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                            )}
                            {interview.location}
                          </Badge>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Ver Detalhes
                            </Button>
                            {interview.status === "agendada" && (
                              <Button size="sm">
                                {interview.type === "online" ? "Entrar" : "Iniciar"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="text-muted-foreground mb-4">Nenhuma entrevista encontrada para esta data.</p>
                  <Button variant="outline">Agendar Nova Entrevista</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
