import React from 'react';
import { PipelineEtapa } from '../../types/pipeline';

interface StageHeaderProps {
  etapa: PipelineEtapa;
}

const StageHeader: React.FC<StageHeaderProps> = ({ etapa }) => {
  return (
    <div
      className="p-3 rounded-t-lg"
      style={{ backgroundColor: etapa.cor }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">
          {etapa.nome}
        </h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white bg-opacity-20 text-white">
          {etapa.candidatos?.length || 0}
        </span>
      </div>
    </div>
  );
};

export default StageHeader; 