
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, FileText, Star } from "lucide-react";

// Define candidate types
interface Candidate {
  id: string;
  name: string;
  vacancy: string;
  avatarUrl?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

// Define column types
interface Column {
  id: string;
  title: string;
  candidates: Candidate[];
  color: string;
}

// Mock data for demonstration
const initialColumns: Column[] = [
  {
    id: "inscricao",
    title: "Inscritos",
    color: "bg-slate-200",
    candidates: [
      { id: "1", name: "João Silva", vacancy: "Desenvolvedor Frontend", rating: 4, tags: ["React", "JavaScript"] },
      { id: "2", name: "Maria Oliveira", vacancy: "UX Designer", rating: 3, tags: ["Figma", "UX Research"] },
      { id: "3", name: "Pedro Santos", vacancy: "DevOps Engineer", rating: 5, tags: ["AWS", "CI/CD"] },
    ]
  },
  {
    id: "triagem",
    title: "Triagem",
    color: "bg-blue-200",
    candidates: [
      { id: "4", name: "Ana Costa", vacancy: "Product Manager", rating: 4, tags: ["Agile", "Jira"] },
      { id: "5", name: "Carlos Ferreira", vacancy: "Desenvolvedor Backend", rating: 3, tags: ["Node.js", "MongoDB"] },
    ]
  },
  {
    id: "teste",
    title: "Testes",
    color: "bg-green-200",
    candidates: [
      { id: "6", name: "Fernanda Lima", vacancy: "Data Analyst", rating: 5, tags: ["SQL", "Python"] },
    ]
  },
  {
    id: "entrevista",
    title: "Entrevistas",
    color: "bg-yellow-200",
    candidates: [
      { id: "7", name: "Ricardo Almeida", vacancy: "Marketing Digital", rating: 4, tags: ["SEO", "Analytics"] },
    ]
  },
  {
    id: "proposta",
    title: "Proposta",
    color: "bg-purple-200",
    candidates: []
  },
  {
    id: "admissao",
    title: "Admissão",
    color: "bg-orange-200",
    candidates: []
  },
  {
    id: "rejeitado",
    title: "Rejeitados",
    color: "bg-red-200",
    candidates: [
      { id: "8", name: "Bruno Martins", vacancy: "Desenvolvedor Mobile", rating: 2, tags: ["React Native"] },
    ]
  }
];

// Rating component
const Rating = ({ value }: { value: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={cn(
            star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
};

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggingCandidate, setDraggingCandidate] = useState<Candidate | null>(null);
  const [sourceColumn, setSourceColumn] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = (candidate: Candidate, columnId: string) => {
    setDraggingCandidate(candidate);
    setSourceColumn(columnId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (columnId: string) => {
    if (draggingCandidate && sourceColumn) {
      // Clone the current state
      const newColumns = [...columns];
      
      // Find source and target column indexes
      const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumn);
      const targetColumnIndex = newColumns.findIndex(col => col.id === columnId);
      
      if (sourceColumnIndex !== -1 && targetColumnIndex !== -1) {
        // Find candidate in source column
        const candidateIndex = newColumns[sourceColumnIndex].candidates.findIndex(
          c => c.id === draggingCandidate.id
        );
        
        if (candidateIndex !== -1) {
          // Remove from source
          const [candidate] = newColumns[sourceColumnIndex].candidates.splice(candidateIndex, 1);
          
          // Add to target
          newColumns[targetColumnIndex].candidates.push(candidate);
          
          // Update state
          setColumns(newColumns);
        }
      }
      
      // Reset dragging state
      setDraggingCandidate(null);
      setSourceColumn(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-h-[calc(100vh-220px)] pb-8">
        {columns.map(column => (
          <div
            key={column.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center mb-3">
              <div className={`w-3 h-3 rounded-full ${column.color} mr-2`}></div>
              <h3 className="font-medium text-sm">{column.title}</h3>
              <Badge variant="secondary" className="ml-2">{column.candidates.length}</Badge>
            </div>
            {column.candidates.map(candidate => (
              <div
                key={candidate.id}
                className="kanban-card"
                draggable
                onDragStart={() => handleDragStart(candidate, column.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={candidate.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.vacancy}</p>
                    </div>
                  </div>
                  <Rating value={candidate.rating} />
                </div>
                
                {candidate.tags && candidate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between mt-3">
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <User className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Perfil</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Detalhes</span>
                  </Button>
                </div>
              </div>
            ))}
            {column.candidates.length === 0 && (
              <div className="flex items-center justify-center h-20 border border-dashed border-gray-300 rounded-md bg-gray-50 text-sm text-muted-foreground">
                Arrastar candidatos
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;
