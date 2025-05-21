import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import InterviewForm from '../components/InterviewForm';

export default function NewInterview() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: createInterview, isLoading } = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/interviews', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      navigate('/interviews');
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to schedule interview');
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Schedule New Interview</h1>
        <p className="mt-2 text-sm text-gray-700">
          Schedule a new interview for a candidate.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="card">
        <InterviewForm
          onSubmit={createInterview}
          isSubmitting={isLoading}
        />
      </div>
    </div>
  );
} 