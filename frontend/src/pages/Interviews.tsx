import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
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
}

export default function Interviews() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ['interviews', statusFilter],
    queryFn: async () => {
      const response = await api.get('/interviews', {
        params: { status: statusFilter || undefined },
      });
      return response.data;
    },
  });

  const filteredInterviews = interviews?.filter((interview) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      interview.candidate.full_name.toLowerCase().includes(searchLower) ||
      interview.job.title.toLowerCase().includes(searchLower) ||
      interview.interviewer.full_name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Interviews</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track candidate interviews
          </p>
        </div>
        <Link to="/interviews/new" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Schedule Interview
        </Link>
      </div>

      <div className="card">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by candidate, job, or interviewer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInterviews?.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/candidates/${interview.candidate.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {interview.candidate.full_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/jobs/${interview.job.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {interview.job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {interview.interviewer.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(interview.scheduled_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize">{interview.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : interview.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/interviews/${interview.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 