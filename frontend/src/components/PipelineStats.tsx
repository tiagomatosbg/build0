import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Registra os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Interface para os dados da etapa
 * @property {number} id - ID da etapa
 * @property {string} nome - Nome da etapa
 * @property {string} cor - Cor da etapa em formato hexadecimal
 * @property {number} candidatos - Número de candidatos na etapa
 */
interface Etapa {
  id: number;
  nome: string;
  cor: string;
  candidatos: number;
}

/**
 * Props do componente PipelineStats
 * @property {Etapa[]} etapas - Lista de etapas com seus dados
 * @property {boolean} isOpen - Indica se o modal está aberto
 * @property {Function} onClose - Callback chamado ao fechar o modal
 */
interface PipelineStatsProps {
  etapas: Etapa[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente de estatísticas do pipeline
 * 
 * Funcionalidades:
 * - Exibe gráfico de pizza com distribuição de candidatos
 * - Mostra tabela com detalhes por etapa
 * - Calcula métricas gerais (total, média, etc)
 * - Modal responsivo com animações
 * 
 * @param props Props do componente
 */
export const PipelineStats: React.FC<PipelineStatsProps> = ({
  etapas,
  isOpen,
  onClose,
}) => {
  // Prepara os dados para o gráfico
  const chartData = {
    labels: etapas.map(etapa => etapa.nome),
    datasets: [
      {
        data: etapas.map(etapa => etapa.candidatos),
        backgroundColor: etapas.map(etapa => etapa.cor),
        borderWidth: 1,
      },
    ],
  };

  // Calcula métricas
  const totalCandidatos = etapas.reduce((sum, etapa) => sum + etapa.candidatos, 0);
  const mediaPorEtapa = totalCandidatos / etapas.length;
  const etapaMaisCheia = etapas.reduce((max, etapa) => 
    etapa.candidatos > max.candidatos ? etapa : max
  , etapas[0]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Estatísticas do Pipeline
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Métricas gerais */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total de Candidatos</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {totalCandidatos}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Média por Etapa</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {mediaPorEtapa.toFixed(1)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Etapa Mais Cheia</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {etapaMaisCheia.nome}
              </p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Distribuição de Candidatos
            </h3>
            <div className="h-64">
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Tabela de detalhes */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Detalhes por Etapa
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Etapa
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidatos
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % do Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {etapas.map((etapa) => (
                    <tr key={etapa.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: etapa.cor }}
                          />
                          <span className="text-sm text-gray-900">
                            {etapa.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {etapa.candidatos}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {((etapa.candidatos / totalCandidatos) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}; 