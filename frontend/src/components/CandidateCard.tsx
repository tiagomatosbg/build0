import React from 'react';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Candidate {
  id: number;
  nome: string;
  foto: string;
  email: string;
  etapa: {
    id: number;
    nome: string;
    cor: string;
  };
  score_avaliacao: number;
  vagas_aplicadas: {
    id: number;
    titulo: string;
  }[];
  status: boolean;
  skills: string[];
  formacao: string;
  experiencia: number;
}

interface CandidateCardProps {
  candidate: Candidate;
  viewMode: 'grid' | 'list';
  canEdit: boolean;
  canDelete: boolean;
}

export default function CandidateCard({
  candidate,
  viewMode,
  canEdit,
  canDelete,
}: CandidateCardProps) {
  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      {/* Candidate Photo */}
      <div
        className={`relative ${
          viewMode === 'list' ? 'w-32 flex-shrink-0' : 'w-full aspect-square'
        }`}
      >
        <img
          src={candidate.foto || '/default-avatar.png'}
          alt={candidate.nome}
          className="w-full h-full object-cover"
        />
        {/* Status Badge */}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
            candidate.status
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {candidate.status ? 'Ativo' : 'Inativo'}
        </div>
      </div>

      {/* Candidate Info */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {candidate.nome}
            </h3>
            <p className="text-sm text-gray-500">{candidate.email}</p>
          </div>
          {/* Score */}
          <div
            className={`text-lg font-bold ${getScoreColor(
              candidate.score_avaliacao
            )}`}
          >
            {candidate.score_avaliacao.toFixed(1)}
          </div>
        </div>

        {/* Stage */}
        <div className="mt-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${candidate.etapa.cor}20`, color: candidate.etapa.cor }}
          >
            {candidate.etapa.nome}
          </span>
        </div>

        {/* Applied Jobs */}
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            Vagas: {candidate.vagas_aplicadas.length}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {candidate.vagas_aplicadas.slice(0, 2).map((vaga) => (
              <span
                key={vaga.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {vaga.titulo}
              </span>
            ))}
            {candidate.vagas_aplicadas.length > 2 && (
              <span className="text-xs text-gray-500">
                +{candidate.vagas_aplicadas.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="text-xs text-gray-500">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="p-1 text-gray-400 hover:text-gray-500"
            title="Visualizar"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          {canEdit && (
            <button
              className="p-1 text-blue-400 hover:text-blue-500"
              title="Editar"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
          {canEdit && (
            <button
              className="p-1 text-green-400 hover:text-green-500"
              title="Mover no Pipeline"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          )}
          {canDelete && (
            <button
              className="p-1 text-red-400 hover:text-red-500"
              title="Excluir"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
} 