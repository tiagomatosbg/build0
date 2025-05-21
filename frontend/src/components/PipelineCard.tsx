import React from 'react';
import { motion } from 'framer-motion';
import { Popover } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Interface para os dados do candidato
 * @property {number} id - ID do candidato
 * @property {string} nome - Nome do candidato
 * @property {string} foto - URL da foto do candidato
 * @property {string} email - Email do candidato
 * @property {number} [score_avaliacao] - Score de avaliação (opcional)
 * @property {string} [observacao] - Observação sobre o candidato (opcional)
 * @property {string} data_atualizacao - Data da última atualização
 * @property {Object} responsavel - Dados do responsável
 * @property {string} responsavel.nome - Nome do responsável
 */
interface Candidato {
  id: number;
  nome: string;
  foto: string;
  email: string;
  score_avaliacao?: number;
  observacao?: string;
  data_atualizacao: string;
  responsavel: {
    nome: string;
  };
}

/**
 * Interface para os dados da etapa
 * @property {number} id - ID da etapa
 * @property {string} nome - Nome da etapa
 * @property {string} cor - Cor da etapa em formato hexadecimal
 */
interface Etapa {
  id: number;
  nome: string;
  cor: string;
}

/**
 * Props do componente PipelineCard
 * @property {Candidato} candidato - Dados do candidato
 * @property {Etapa} etapa - Dados da etapa atual
 * @property {boolean} isDragging - Indica se o card está sendo arrastado
 */
interface PipelineCardProps {
  candidato: Candidato;
  etapa: Etapa;
  isDragging: boolean;
}

/**
 * Componente de card para exibição de candidato no pipeline
 * 
 * Funcionalidades:
 * - Exibe foto, nome e email do candidato
 * - Mostra score de avaliação com indicador visual
 * - Exibe data de atualização e responsável
 * - Tooltip com observações (se houver)
 * - Animações suaves ao arrastar
 * 
 * @param props Props do componente
 */
export const PipelineCard: React.FC<PipelineCardProps> = ({
  candidato,
  etapa,
  isDragging,
}) => {
  // Formata a data de atualização
  const dataAtualizacao = new Date(candidato.data_atualizacao).toLocaleDateString('pt-BR');

  // Calcula a cor do score baseado no valor
  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-200';
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-lg shadow-sm p-4 mb-2 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Header com foto e informações básicas */}
      <div className="flex items-start space-x-3">
        <img
          src={candidato.foto}
          alt={candidato.nome}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {candidato.nome}
          </h4>
          <p className="text-xs text-gray-500 truncate">{candidato.email}</p>
        </div>
      </div>

      {/* Score de avaliação */}
      {candidato.score_avaliacao && (
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Score</span>
            <span className="text-xs font-medium text-gray-900">
              {candidato.score_avaliacao}/10
            </span>
          </div>
          <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreColor(candidato.score_avaliacao)}`}
              style={{ width: `${candidato.score_avaliacao * 10}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer com data e responsável */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{dataAtualizacao}</span>
        <span>Por: {candidato.responsavel.nome}</span>
      </div>

      {/* Tooltip com observações */}
      {candidato.observacao && (
        <div className="mt-2">
          <Popover className="relative">
            <Popover.Button className="text-gray-400 hover:text-gray-500">
              <InformationCircleIcon className="h-4 w-4" />
            </Popover.Button>
            <Popover.Panel className="absolute z-10 p-2 text-xs text-gray-500 bg-white rounded shadow-lg">
              {candidato.observacao}
            </Popover.Panel>
          </Popover>
        </div>
      )}
    </motion.div>
  );
}; 