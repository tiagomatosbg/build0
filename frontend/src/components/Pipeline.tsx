import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionMarkCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Popover } from '@headlessui/react';
import { PipelineCard } from './PipelineCard';
import { PipelineStats } from './PipelineStats';

/**
 * Props do componente Pipeline
 * @property {number} vagaId - ID da vaga
 * @property {Array<Etapa>} etapas - Lista de etapas do pipeline
 * @property {Function} onMoveCandidato - Callback chamado ao mover candidato
 */
interface PipelineProps {
  vagaId: number;
  etapas: {
    id: number;
    nome: string;
    cor: string;
    descricao?: string;
    candidatos: Array<{
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
    }>;
  }[];
  onMoveCandidato: (candidatoId: number, novaEtapaId: number) => Promise<void>;
}

/**
 * Componente principal do Pipeline
 * 
 * Funcionalidades:
 * - Drag and drop de candidatos entre etapas
 * - Visualização de estatísticas
 * - Tooltips informativos
 * - Animações suaves
 * - Layout responsivo
 * 
 * @param props Props do componente
 */
export const Pipeline: React.FC<PipelineProps> = ({
  vagaId,
  etapas,
  onMoveCandidato,
}) => {
  // Estado para controlar a visibilidade do modal de estatísticas
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  /**
   * Handler para o fim do drag and drop
   * 
   * Fluxo:
   * 1. Verifica se o destino é válido
   * 2. Extrai IDs do candidato e nova etapa
   * 3. Verifica se houve mudança de etapa
   * 4. Chama callback de movimentação
   * 
   * @param result Resultado do drag and drop
   */
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const candidatoId = parseInt(draggableId);
    const novaEtapaId = parseInt(destination.droppableId);

    if (source.droppableId !== destination.droppableId) {
      await onMoveCandidato(candidatoId, novaEtapaId);
    }
  };

  return (
    <div className="relative">
      {/* Header com título e botão de estatísticas */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Pipeline de Candidatos</h2>
        <button
          onClick={() => setIsStatsOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Ver Estatísticas
        </button>
      </div>

      {/* Área de drag and drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {etapas.map((etapa) => (
            <div
              key={etapa.id}
              className="bg-gray-50 rounded-lg p-4"
              style={{ borderTop: `4px solid ${etapa.cor}` }}
            >
              {/* Header da etapa */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">{etapa.nome}</h3>
                  {etapa.descricao && (
                    <Popover className="relative">
                      <Popover.Button className="text-gray-400 hover:text-gray-500">
                        <QuestionMarkCircleIcon className="h-4 w-4" />
                      </Popover.Button>
                      <Popover.Panel className="absolute z-10 p-2 text-xs text-gray-500 bg-white rounded shadow-lg">
                        {etapa.descricao}
                      </Popover.Panel>
                    </Popover>
                  )}
                </div>
                {/* Badge com contagem de candidatos */}
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${etapa.cor}20`,
                    color: etapa.cor,
                  }}
                >
                  {etapa.candidatos.length}
                </span>
              </div>

              {/* Área droppable para candidatos */}
              <Droppable droppableId={etapa.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-gray-100' : ''
                    }`}
                  >
                    <AnimatePresence>
                      {etapa.candidatos.map((candidato, index) => (
                        <Draggable
                          key={candidato.id}
                          draggableId={candidato.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <PipelineCard
                                candidato={candidato}
                                etapa={etapa}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal de estatísticas */}
      <PipelineStats
        etapas={etapas.map(etapa => ({
          id: etapa.id,
          nome: etapa.nome,
          cor: etapa.cor,
          candidatos: etapa.candidatos.length
        }))}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />
    </div>
  );
}; 