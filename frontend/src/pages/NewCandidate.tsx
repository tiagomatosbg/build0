import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import CandidateForm from '../components/CandidateForm';

export default function NewCandidate() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: createCandidate, isLoading } = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/candidates', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      navigate('/candidates');
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to create candidate');
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Candidate</h1>
        <p className="mt-2 text-sm text-gray-700">
          Fill in the details below to add a new candidate to your recruitment process.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="card">
        <CandidateForm
          onSubmit={createCandidate}
          isSubmitting={isLoading}
        />
      </div>
    </div>
  );
} 