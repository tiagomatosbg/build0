import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: candidates, isLoading, error } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/candidates');
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      return response.json();
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: async (candidateId: number) => {
      const response = await fetch(`http://localhost:8000/api/candidates/${candidateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const handleDelete = async (candidateId: number) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await deleteCandidateMutation.mutateAsync(candidateId);
      } catch (error) {
        console.error('Error deleting candidate:', error);
      }
    }
  };

  const filteredCandidates = candidates?.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading candidates. Please try again later.
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all candidates in your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/candidates/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Candidate
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCandidates?.map((candidate) => (
                    <tr key={candidate.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <Link to={`/candidates/${candidate.id}`} className="text-indigo-600 hover:text-indigo-900">
                          {candidate.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{candidate.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{candidate.phone}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          candidate.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          candidate.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                          candidate.status === 'interviewed' ? 'bg-purple-100 text-purple-800' :
                          candidate.status === 'offered' ? 'bg-green-100 text-green-800' :
                          candidate.status === 'hired' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {candidate.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/candidates/${candidate.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          </Link>
                          <button
                            onClick={() => handleDelete(candidate.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 