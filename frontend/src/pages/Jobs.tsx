import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { JobStatus, JobType } from '../types/job';
import { useAuth } from '../contexts/AuthContext';
import JobDetails from '../components/JobDetails';

interface Job {
  id: number;
  title: string;
  description: string;
  department: string;
  location: string;
  type: JobType;
  status: JobStatus;
  salary_min: number;
  salary_max: number;
  benefits: string[];
  requirements: string[];
  opening_date: string;
  closing_date: string;
  recruiter_id: number;
}

const statusColors = {
  [JobStatus.OPEN]: 'bg-green-100 text-green-800',
  [JobStatus.CLOSED]: 'bg-red-100 text-red-800',
  [JobStatus.DRAFT]: 'bg-gray-100 text-gray-800',
};

export default function Jobs() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<JobType | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ['jobs', searchQuery, statusFilter, typeFilter, departmentFilter, locationFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('title', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (departmentFilter) params.append('department', departmentFilter);
      if (locationFilter) params.append('location', locationFilter);

      const response = await fetch(`http://localhost:8000/api/jobs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const handleDelete = async (jobId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        await deleteJobMutation.mutateAsync(jobId);
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const canManageJob = (job: Job) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'hr_manager') return true;
    if (user.role === 'recruiter' && job.recruiter_id === user.id) return true;
    return false;
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#df7826]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Erro ao carregar vagas. Por favor, tente novamente mais tarde.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vagas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todas as vagas da sua empresa
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid' ? 'bg-[#df7826] text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list' ? 'bg-[#df7826] text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
          {(user?.role === 'admin' || user?.role === 'hr_manager') && (
            <Link
              to="/jobs/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#df7826] hover:bg-[#c66a1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#df7826]"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Nova Vaga
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar vagas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] sm:text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#df7826]"
          >
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JobStatus | '')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] sm:text-sm"
            >
              <option value="">Todos os Status</option>
              {Object.values(JobStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as JobType | '')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] sm:text-sm"
            >
              <option value="">Todos os Tipos</option>
              {Object.values(JobType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Departamento"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] sm:text-sm"
            />

            <input
              type="text"
              placeholder="Localização"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] sm:text-sm"
            />
          </div>
        )}
      </div>

      {/* Jobs List/Grid */}
      <div className="mt-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs?.map((job) => (
              <div
                key={job.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      <Link to={`/jobs/${job.id}`} className="hover:text-[#df7826]">
                        {job.title}
                      </Link>
                    </h3>
                    {canManageJob(job) && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/jobs/${job.id}/edit`}
                          className="text-gray-400 hover:text-[#df7826]"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{job.department}</p>
                    <p className="text-sm text-gray-500">{job.location}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      R$ {job.salary_min.toLocaleString()} - R$ {job.salary_max.toLocaleString()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">{job.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {jobs?.map((job) => (
                <li key={job.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          <Link to={`/jobs/${job.id}`} className="hover:text-[#df7826]">
                            {job.title}
                          </Link>
                        </h3>
                        <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            {job.department}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            {job.location}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            {job.type}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            R$ {job.salary_min.toLocaleString()} - R$ {job.salary_max.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                          {job.status}
                        </span>
                        {canManageJob(job) && (
                          <div className="flex space-x-2">
                            <Link
                              to={`/jobs/${job.id}/edit`}
                              className="text-gray-400 hover:text-[#df7826]"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                              <button
                                onClick={() => handleDelete(job.id)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetails
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
} 