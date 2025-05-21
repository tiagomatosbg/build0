import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import JobForm from '../components/JobForm';

export default function NewJob() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: createJob, isLoading } = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate('/jobs');
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to create job');
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Job</h1>
        <p className="mt-2 text-sm text-gray-700">
          Fill in the details below to create a new job posting.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="card">
        <JobForm
          onSubmit={createJob}
          isSubmitting={isLoading}
        />
      </div>
    </div>
  );
} 