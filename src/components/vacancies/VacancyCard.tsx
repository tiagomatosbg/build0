
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// Define vacancy type
interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  status: 'open' | 'screening' | 'interviewing' | 'closed' | 'canceled';
  candidates: number;
  createdAt: string;
  salary?: string;
  contractType: string;
}

interface VacancyCardProps {
  vacancy: Vacancy;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function VacancyCard({ vacancy, onView, onEdit, onDelete }: VacancyCardProps) {
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
  
  const statusInfo = getStatusInfo(vacancy.status);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="relative">
          {/* Status indicator bar at top of card */}
          <div className={cn("h-1 w-full", 
            vacancy.status === 'open' ? "bg-green-500" : 
            vacancy.status === 'screening' ? "bg-blue-500" :
            vacancy.status === 'interviewing' ? "bg-yellow-500" :
            vacancy.status === 'closed' ? "bg-gray-500" : "bg-red-500"
          )} />
          
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{vacancy.title}</h3>
                <p className="text-sm text-muted-foreground">{vacancy.department}</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <span className={`status-indicator ${statusInfo.className}`}></span>
                {statusInfo.text}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Localidade:</span>
                <span>{vacancy.location}</span>
              </div>
              
              {vacancy.salary && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Salário:</span>
                  <span>{vacancy.salary}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span>{vacancy.contractType}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Publicada em:</span>
                <span>{vacancy.createdAt}</span>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{vacancy.candidates} candidatos</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-3 bg-muted/30 border-t">
        <Button variant="ghost" size="sm" onClick={() => onView(vacancy.id)}>
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(vacancy.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(vacancy.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
