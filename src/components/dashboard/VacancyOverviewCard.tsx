
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Vacancy {
  id: number;
  title: string;
  department: string;
  status: 'open' | 'screening' | 'interviewing' | 'closed' | 'canceled';
  applications: number;
  maxApplications: number;
}

interface VacancyOverviewCardProps {
  vacancies: Vacancy[];
}

export function VacancyOverviewCard({ vacancies }: VacancyOverviewCardProps) {
  // Function to get status text and class
  const getStatusInfo = (status: Vacancy['status']) => {
    switch (status) {
      case 'open':
        return { text: 'Aberta', className: 'status-open' };
      case 'screening':
        return { text: 'Em Triagem', className: 'status-screening' };
      case 'interviewing':
        return { text: 'Entrevistas', className: 'status-interviewing' };
      case 'closed':
        return { text: 'Fechada', className: 'status-closed' };
      case 'canceled':
        return { text: 'Cancelada', className: 'status-canceled' };
      default:
        return { text: 'Indefinido', className: 'bg-gray-500' };
    }
  };

  return (
    <div className="pessoas-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Visão Geral de Vagas</h3>
        <Button variant="outline" size="sm">Ver Todas</Button>
      </div>
      <div className="space-y-4">
        {vacancies.map((vacancy) => {
          const statusInfo = getStatusInfo(vacancy.status);
          const progress = (vacancy.applications / vacancy.maxApplications) * 100;
          
          return (
            <div key={vacancy.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium">{vacancy.title}</p>
                  <p className="text-sm text-muted-foreground">{vacancy.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className={`status-indicator ${statusInfo.className}`}></span>
                    {statusInfo.text}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="h-2" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {vacancy.applications}/{vacancy.maxApplications}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
