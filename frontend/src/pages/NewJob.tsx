import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import JobForm from '../components/JobForm';

export default function NewJob() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('http://localhost:8000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create job');
      }
      return response.json();
    },
    onSuccess: () => {
      navigate('/jobs');
    },
  });

  // Check if user has permission to create jobs
  if (!user || (user.role !== 'admin' && user.role !== 'hr_manager')) {
    return (
      <div className="text-red-500 text-center p-4">
        Você não tem permissão para criar vagas.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Criar Nova Vaga</h3>
            <p className="mt-1 text-sm text-gray-600">
              Preencha os detalhes abaixo para criar uma nova vaga.
            </p>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <JobForm
                onSubmit={createJobMutation.mutate}
                isSubmitting={createJobMutation.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 