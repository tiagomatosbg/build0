import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../api/client';

interface Interview {
  id: number;
  candidate: {
    id: number;
    full_name: string;
  };
  job: {
    id: number;
    title: string;
  };
  interviewer: {
    id: number;
    full_name: string;
  };
  scheduled_at: string;
  status: string;
  type: string;
  notes?: string;
  feedback?: {
    rating: number;
    strengths: string[];
    weaknesses: string[];
    notes: string;
    created_at: string;
  };
}

export default function InterviewDetails() {
  const [error, setError] = useState('');
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: interview, isLoading } = useQuery<Interview>({
    queryKey: ['interviews', interviewId],
    queryFn: async () => {
      const response = await api.get(`/interviews/${interviewId}`);
      return response.data;
    },
  });

  const { mutate: deleteInterview, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      await api.delete(`/interviews/${interviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      navigate('/interviews');
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to delete interview');
    },
  });

  const { mutate: updateStatus, isLoading: isUpdatingStatus } = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.patch(`/interviews/${interviewId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      deleteInterview();
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {interview.candidate.full_name} - {interview.job.title}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/interviews/${interviewId}/edit`)}
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Interview Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Candidate</dt>
              <dd className="mt-1">
                <Link
                  to={`/candidates/${interview.candidate.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {interview.candidate.full_name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Job</dt>
              <dd className="mt-1">
                <Link
                  to={`/jobs/${interview.job.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {interview.job.title}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Interviewer</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {interview.interviewer.full_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Scheduled For</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(interview.scheduled_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <select
                  value={interview.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={isUpdatingStatus}
                  className="input-field"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
          <div className="prose max-w-none">
            {interview.notes ? (
              <p className="text-sm text-gray-700">{interview.notes}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">No notes available</p>
            )}
          </div>
        </div>

        {interview.feedback && (
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Interview Feedback</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Rating</dt>
                <dd className="mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < interview.feedback.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Strengths</dt>
                <dd className="mt-1">
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {interview.feedback.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Areas for Improvement</dt>
                <dd className="mt-1">
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {interview.feedback.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {interview.feedback.notes}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Feedback Date</dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {new Date(interview.feedback.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
} 