import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import JobForm from '../components/JobForm';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  company_id: number;
  status: string;
}

export default function EditJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: job, isLoading: isLoadingJob } = useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.get(`/jobs/${jobId}`);
      return response.data;
    },
  });

  const { mutate: updateJob, isLoading: isUpdating } = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/jobs/${jobId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      navigate('/jobs');
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to update job');
    },
  });

  if (isLoadingJob) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Job not found</h2>
        <p className="mt-1 text-sm text-gray-500">
          The job you're looking for doesn't exist or you don't have permission to view it.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Job</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update the job details below.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="card">
        <JobForm
          initialData={job}
          onSubmit={updateJob}
          isSubmitting={isUpdating}
        />
      </div>
    </div>
  );
} 