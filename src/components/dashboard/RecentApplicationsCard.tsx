
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  position: string;
  date: string;
  stage: string;
  avatarSrc?: string;
}

interface RecentApplicationsCardProps {
  candidates: Candidate[];
}

export function RecentApplicationsCard({ candidates }: RecentApplicationsCardProps) {
  return (
    <div className="pessoas-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Candidaturas Recentes</h3>
        <Button variant="outline" size="sm">Ver Todas</Button>
      </div>
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={candidate.avatarSrc} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{candidate.name}</p>
                <p className="text-sm text-muted-foreground">{candidate.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <Badge variant="outline" className="mb-1">{candidate.stage}</Badge>
                <p className="text-xs text-muted-foreground">{candidate.date}</p>
              </div>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
