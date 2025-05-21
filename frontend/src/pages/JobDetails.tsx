import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../api/client';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  company: {
    id: number;
    name: string;
  };
  status: string;
  created_at: string;
  updated_at: string;
}

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.get(`/jobs/${jobId}`);
      return response.data;
    },
  });

  const { mutate: deleteJob, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      await api.delete(`/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate('/jobs');
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to delete job');
    },
  });

  const { mutate: updateStatus, isLoading: isUpdatingStatus } = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.patch(`/jobs/${jobId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to update job status');
    },
  });

  if (isLoading) {
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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{job.title}</h1>
          <p className="mt-2 text-sm text-gray-700">
            {job.company.name}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => navigate(`/jobs/${jobId}/edit`)}
            className="btn-secondary inline-flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </button>
          <button
            onClick={() => deleteJob()}
            disabled={isDeleting}
            className="btn-secondary inline-flex items-center text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900">Status</h2>
          <div className="mt-4">
            <select
              value={job.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={isUpdatingStatus}
              className="input-field"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900">Details</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(job.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(job.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900">Description</h2>
          <div className="mt-4 prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900">Requirements</h2>
          <div className="mt-4 prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 