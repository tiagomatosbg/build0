import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { JobStatus, JobType } from '../types/job';
import { useAuth } from '../contexts/AuthContext';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  benefits: string | null;
  type: JobType;
  status: JobStatus;
  opening_date: string;
  closing_date: string | null;
  department: string;
  manager: string;
  created_at: string;
  updated_at: string;
  manager_id: number;
}

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }
      return response.json();
    },
    enabled: !!jobId,
  });

  const deleteJobMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate('/jobs');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJobMutation.mutate();
    }
  };

  const canManageJob = (job: Job) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'hr_manager') return true;
    if (user.role === 'recruiter' && job.manager_id === user.id) return true;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading job details. Please try again later.
      </div>
    );
  }

  // Check if candidate can view this job
  if (user?.role === 'candidate' && job.status !== JobStatus.OPEN) {
    return (
      <div className="text-red-500 text-center p-4">
        This job is not available for viewing.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {job.department} • {job.location}
          </p>
        </div>
        {user && (
          <div className="flex space-x-4">
            {canManageJob(job) && (
              <>
                <button
                  onClick={() => navigate(`/jobs/${job.id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                  Edit
                </button>
                {(user.role === 'admin' || user.role === 'hr_manager') && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Delete
                  </button>
                )}
              </>
            )}
            {user.role === 'candidate' && job.status === JobStatus.OPEN && (
              <button
                onClick={() => {/* TODO: Implement apply functionality */}}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Apply Now
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Job Details</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{job.type}</dd>
              </div>
              {user?.role !== 'candidate' && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{job.status}</dd>
                </div>
              )}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Opening Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(job.opening_date).toLocaleDateString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Closing Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {job.closing_date ? new Date(job.closing_date).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Description</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="prose max-w-none">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Requirements</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <ul className="list-disc pl-5 space-y-2">
                {job.requirements.split('\n').map((requirement, index) => (
                  <li key={index} className="text-sm text-gray-900">
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {job.benefits && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Benefits</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <ul className="list-disc pl-5 space-y-2">
                  {job.benefits.split('\n').map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-900">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 