import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '@headlessui/react';
import {
  UserCircleIcon,
  CalendarIcon,
  XCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/date';
import { PipelineCandidato } from '../../types/pipeline';

interface CandidateCardProps {
  candidato: PipelineCandidato;
  isDragging: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidato, isDragging }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleViewProfile = () => {
    // Implementar navegação para o perfil do candidato
  };

  const handleScheduleInterview = () => {
    // Implementar agendamento de entrevista
  };

  const handleReject = () => {
    // Implementar rejeição do candidato
  };

  return (
    <Tooltip>
      <motion.div
        className={`p-4 mb-2 bg-white rounded-lg shadow-sm border border-gray-200 
          ${isDragging ? 'shadow-lg' : ''} 
          hover:shadow-md transition-shadow duration-200`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {candidato.candidato.foto ? (
              <img
                src={candidato.candidato.foto}
                alt={candidato.candidato.nome}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {candidato.candidato.nome}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {candidato.vaga.title}
            </p>
            
            <div className="mt-2 flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#df7826] text-white">
                Score: {candidato.score_avaliacao || 'N/A'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(candidato.data_movimentacao)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex items-center justify-end space-x-2">
          <Tooltip.Button
            onClick={handleViewProfile}
            className="p-1 text-gray-400 hover:text-[#df7826] transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Tooltip.Button>
          
          <Tooltip.Button
            onClick={handleScheduleInterview}
            className="p-1 text-gray-400 hover:text-[#df7826] transition-colors"
          >
            <CalendarIcon className="w-5 h-5" />
          </Tooltip.Button>
          
          <Tooltip.Button
            onClick={handleReject}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <XCircleIcon className="w-5 h-5" />
          </Tooltip.Button>
        </div>

        {/* Tooltip Content */}
        <Tooltip.Panel className="z-10 p-2 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="text-sm">
            <p className="font-medium">{candidato.candidato.nome}</p>
            <p className="text-gray-600">{candidato.vaga.title}</p>
            <p className="text-gray-500 text-xs mt-1">
              Última movimentação: {formatDate(candidato.data_movimentacao)}
            </p>
            {candidato.observacao && (
              <p className="text-gray-600 text-xs mt-2">{candidato.observacao}</p>
            )}
          </div>
        </Tooltip.Panel>
      </motion.div>
    </Tooltip>
  );
};

export default CandidateCard; 