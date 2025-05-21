import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import InterviewForm from '../components/InterviewForm';

interface Interview {
  id: number;
  candidate_id: number;
  interviewer_id: number;
  scheduled_at: string;
  type: string;
  notes?: string;
}

export default function EditInterview() {
  const [error, setError] = useState('');
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: interview, isLoading: isLoadingInterview } = useQuery<Interview>({
    queryKey: ['interviews', interviewId],
    queryFn: async () => {
      const response = await api.get(`/interviews/${interviewId}`);
      return response.data;
    },
  });

  const { mutate: updateInterview, isLoading: isUpdating } = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/interviews/${interviewId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      navigate('/interviews');
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to update interview');
    },
  });

  if (isLoadingInterview) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Interview not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The interview you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Interview</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update the interview details below.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="card">
        <InterviewForm
          initialData={{
            candidate_id: interview.candidate_id,
            interviewer_id: interview.interviewer_id,
            scheduled_at: interview.scheduled_at,
            type: interview.type,
            notes: interview.notes,
          }}
          onSubmit={updateInterview}
          isSubmitting={isUpdating}
        />
      </div>
    </div>
  );
} 