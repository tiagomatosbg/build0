import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { JobStatus, JobType } from '../types/job';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon, TrashIcon, ShareIcon } from '@heroicons/react/24/outline';

interface JobDetailsProps {
  job: {
    id: number;
    title: string;
    description: string;
    department: string;
    location: string;
    type: JobType;
    status: JobStatus;
    salary_min: number;
    salary_max: number;
    benefits: string[];
    requirements: string[];
    opening_date: string;
    closing_date: string;
    recruiter_id: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  [JobStatus.OPEN]: 'bg-green-100 text-green-800',
  [JobStatus.CLOSED]: 'bg-red-100 text-red-800',
  [JobStatus.DRAFT]: 'bg-gray-100 text-gray-800',
};

export default function JobDetails({ job, isOpen, onClose }: JobDetailsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteJobMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`http://localhost:8000/api/jobs/${job.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onClose();
    },
  });

  const canManageJob = () => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'hr_manager') return true;
    if (user.role === 'recruiter' && job.recruiter_id === user.id) return true;
    return false;
  };

  const handleEdit = () => {
    navigate(`/jobs/${job.id}/edit`);
    onClose();
  };

  const handleDelete = () => {
    deleteJobMutation.mutate();
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const getPublicLink = () => {
    return `${window.location.origin}/jobs/${job.id}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getPublicLink());
      alert('Link copiado para a área de transferência!');
    } catch (err) {
      alert('Erro ao copiar link. Por favor, tente novamente.');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center p-6 border-b">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Detalhes da Vaga
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {job.department} • {job.location}
                  </p>
                </div>
                <div className="flex justify-end space-x-4">
                  {canManageJob() && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#df7826]"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Excluir
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#df7826] hover:bg-[#c66a1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#df7826]"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Compartilhar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Informações Gerais</h3>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tipo de Vaga</dt>
                      <dd className="mt-1 text-sm text-gray-900">{job.type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                          {job.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Faixa Salarial</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        R$ {job.salary_min.toLocaleString()} - R$ {job.salary_max.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Período</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(job.opening_date).toLocaleDateString()} - {job.closing_date ? new Date(job.closing_date).toLocaleDateString() : 'Sem data de encerramento'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Descrição</h3>
                  <p className="mt-4 text-sm text-gray-500 whitespace-pre-line">{job.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Requisitos</h3>
                  <ul className="mt-4 space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-[#df7826]">•</span>
                        <span className="ml-2 text-sm text-gray-500">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Benefícios</h3>
                  <ul className="mt-4 space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 text-[#df7826]">•</span>
                        <span className="ml-2 text-sm text-gray-500">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full bg-white rounded-xl shadow-lg p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Confirmar Exclusão
            </Dialog.Title>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteJobMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteJobMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal de Compartilhamento */}
      <Dialog open={showShareModal} onClose={() => setShowShareModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full bg-white rounded-xl shadow-lg p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Compartilhar Vaga
            </Dialog.Title>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-4">
                Use o link abaixo para compartilhar esta vaga:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={getPublicLink()}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#df7826] focus:border-[#df7826]"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#df7826] rounded-md hover:bg-[#c66a1f]"
                >
                  Copiar
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 