import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { ChevronRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';

import { api } from '../../services/api';
import { PipelineEtapa, PipelineCandidato } from '../../types/pipeline';
import CandidateCard from './CandidateCard';
import StageHeader from './StageHeader';
import { formatDate } from '../../utils/date';

interface PipelineProps {
  vagaId: number;
}

const Pipeline: React.FC<PipelineProps> = ({ vagaId }) => {
  const queryClient = useQueryClient();
  const [etapas, setEtapas] = useState<PipelineEtapa[]>([]);

  // Buscar etapas do pipeline
  const { data: etapasData, isLoading: isLoadingEtapas } = useQuery(
    ['pipeline-etapas', vagaId],
    async () => {
      const response = await api.get(`/pipeline/etapas/${vagaId}`);
      return response.data;
    }
  );

  // Buscar candidatos por etapa
  const { data: candidatosData, isLoading: isLoadingCandidatos } = useQuery(
    ['pipeline-candidatos', vagaId],
    async () => {
      const response = await api.get(`/pipeline/candidatos/${vagaId}`);
      return response.data;
    }
  );

  // Mutation para mover candidato
  const moveCandidateMutation = useMutation(
    async ({ candidatoId, novaEtapaId }: { candidatoId: number; novaEtapaId: number }) => {
      const response = await api.post('/pipeline/candidatos/mover', {
        candidato_id: candidatoId,
        vaga_id: vagaId,
        etapa_id: novaEtapaId,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pipeline-candidatos', vagaId]);
        toast.success('Candidato movido com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Erro ao mover candidato');
      },
    }
  );

  useEffect(() => {
    if (etapasData) {
      setEtapas(etapasData);
    }
  }, [etapasData]);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const candidatoId = parseInt(draggableId);
    const novaEtapaId = parseInt(destination.droppableId);

    moveCandidateMutation.mutate({ candidatoId, novaEtapaId });
  };

  if (isLoadingEtapas || isLoadingCandidatos) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#df7826]"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg shadow-lg p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {etapas.map((etapa) => (
            <div
              key={etapa.id}
              className="flex-shrink-0 w-80 bg-gray-50 rounded-lg"
            >
              <StageHeader etapa={etapa} />
              <Droppable droppableId={etapa.id.toString()}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-2 min-h-[calc(100vh-200px)]"
                  >
                    {candidatosData
                      ?.filter((c: PipelineCandidato) => c.etapa_id === etapa.id)
                      .map((candidato: PipelineCandidato, index: number) => (
                        <Draggable
                          key={candidato.id}
                          draggableId={candidato.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CandidateCard
                                candidato={candidato}
                                isDragging={snapshot.isDragging}
                              />
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Pipeline; 