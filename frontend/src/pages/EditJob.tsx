import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import JobForm from '../components/JobForm';

export default function EditJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8000/api/jobs/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }
      return response.json();
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`http://localhost:8000/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update job');
      }
      return response.json();
    },
    onSuccess: () => {
      navigate('/jobs');
    },
  });

  // Check if user has permission to edit this job
  const canManageJob = () => {
    if (!user || !job) return false;
    if (user.role === 'admin' || user.role === 'hr_manager') return true;
    if (user.role === 'recruiter' && job.recruiter_id === user.id) return true;
    return false;
  };

  if (isLoadingJob) {
    return (
      <div className="text-center p-4">
        Carregando detalhes da vaga...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-red-500 text-center p-4">
        Vaga não encontrada.
      </div>
    );
  }

  if (!canManageJob()) {
    return (
      <div className="text-red-500 text-center p-4">
        Você não tem permissão para editar esta vaga.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Editar Vaga</h3>
            <p className="mt-1 text-sm text-gray-600">
              Atualize os detalhes da vaga abaixo.
            </p>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <JobForm
                initialData={job}
                onSubmit={updateJobMutation.mutate}
                isSubmitting={updateJobMutation.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 