import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../api/client';

interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  job: {
    id: number;
    title: string;
  };
  resume_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

export default function CandidateDetails() {
  const [error, setError] = useState('');
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: candidate, isLoading } = useQuery<Candidate>({
    queryKey: ['candidates', candidateId],
    queryFn: async () => {
      const response = await api.get(`/candidates/${candidateId}`);
      return response.data;
    },
  });

  const { mutate: deleteCandidate, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      await api.delete(`/candidates/${candidateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      navigate('/candidates');
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to delete candidate');
    },
  });

  const { mutate: updateStatus, isLoading: isUpdatingStatus } = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.patch(`/candidates/${candidateId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to update status');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Candidate not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The candidate you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate();
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{candidate.full_name}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Applied for {candidate.job.title}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/candidates/${candidateId}/edit`)}
            className="btn-secondary"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-danger"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{candidate.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{candidate.phone}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Application Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <select
                  value={candidate.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={isUpdatingStatus}
                  className="input-field"
                >
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Applied On</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(candidate.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(candidate.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
          <div className="space-y-4">
            {candidate.resume_url && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Resume</dt>
                <dd className="mt-1">
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Resume
                  </a>
                </dd>
              </div>
            )}
            {candidate.portfolio_url && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Portfolio</dt>
                <dd className="mt-1">
                  <a
                    href={candidate.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Portfolio
                  </a>
                </dd>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 