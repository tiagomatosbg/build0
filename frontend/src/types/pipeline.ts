export interface User {
  id: number;
  nome: string;
  foto?: string;
  email: string;
}

export interface Job {
  id: number;
  title: string;
  company_id: number;
  manager_id: number;
}

export interface PipelineEtapa {
  id: number;
  nome: string;
  ordem: number;
  cor: string;
  empresa_id: number;
  vaga_id: number;
  is_padrao: boolean;
  candidatos?: PipelineCandidato[];
}

export interface PipelineCandidato {
  id: number;
  candidato_id: number;
  vaga_id: number;
  etapa_id: number;
  responsavel_id: number;
  data_movimentacao: string;
  score_avaliacao?: number;
  observacao?: string;
  data_criacao: string;
  data_atualizacao: string;
  candidato: User;
  vaga: Job;
  etapa: PipelineEtapa;
  responsavel: User;
} 