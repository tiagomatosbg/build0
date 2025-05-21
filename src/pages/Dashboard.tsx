
import { Briefcase, Users, Calendar, TestTube, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentApplicationsCard } from "@/components/dashboard/RecentApplicationsCard";
import { VacancyOverviewCard } from "@/components/dashboard/VacancyOverviewCard";
import { RecruitmentFunnelChart } from "@/components/dashboard/RecruitmentFunnelChart";
import { TimeToHireChart } from "@/components/dashboard/TimeToHireChart";

// Mock data
const recentCandidates = [
  { id: 1, name: 'João Silva', position: 'Desenvolvedor Frontend', date: '22/05/2025', stage: 'Triagem' },
  { id: 2, name: 'Maria Oliveira', position: 'Designer UX/UI', date: '21/05/2025', stage: 'Teste' },
  { id: 3, name: 'Pedro Santos', position: 'Desenvolvedor Backend', date: '20/05/2025', stage: 'Entrevista' },
  { id: 4, name: 'Ana Costa', position: 'Product Manager', date: '19/05/2025', stage: 'Proposta' },
];

const vacanciesData = [
  { id: 1, title: 'Desenvolvedor Frontend', department: 'Tecnologia', status: 'open', applications: 15, maxApplications: 25 },
  { id: 2, title: 'Designer UX/UI', department: 'Produto', status: 'screening', applications: 8, maxApplications: 15 },
  { id: 3, title: 'Desenvolvedor Backend', department: 'Tecnologia', status: 'interviewing', applications: 5, maxApplications: 20 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do recrutamento e seleção</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Vagas Abertas"
          value={12}
          icon={<Briefcase className="h-5 w-5" />}
          trend="up"
          trendValue="20%"
        />
        <StatsCard
          title="Candidatos Ativos"
          value={153}
          icon={<Users className="h-5 w-5" />}
          trend="up"
          trendValue="15%"
        />
        <StatsCard
          title="Entrevistas Agendadas"
          value={28}
          icon={<Calendar className="h-5 w-5" />}
          description="Próximos 7 dias"
          trend="down"
          trendValue="5%"
        />
        <StatsCard
          title="Tempo Médio de Contratação"
          value="24 dias"
          icon={<Clock className="h-5 w-5" />}
          trend="down"
          trendValue="3 dias"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecruitmentFunnelChart />
        <TimeToHireChart />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentApplicationsCard candidates={recentCandidates} />
        <VacancyOverviewCard vacancies={vacanciesData as any} />
      </div>
    </div>
  );
}
