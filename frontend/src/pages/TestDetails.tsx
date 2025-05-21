import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Test {
  id: number;
  title: string;
  description: string;
  type: string;
  duration: number;
  status: string;
  questions: {
    id: number;
    text: string;
    type: string;
    options?: string[];
    correct_answer?: string;
  }[];
  created_at: string;
  updated_at: string;
}

export default function TestDetails() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: test, isLoading } = useQuery<Test>({
    queryKey: ['test', testId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${testId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test');
      }
      return response.json();
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete test');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      navigate('/tests');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/tests/${testId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update test status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test', testId] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      setError(null);
      await deleteTestMutation.mutateAsync();
    }
  };

  const handleStatusChange = async (status: string) => {
    setError(null);
    await updateStatusMutation.mutateAsync(status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Test not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The test you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {test.title}
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Type: {test.type}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Duration: {test.duration} minutes
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              Status: {test.status}
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to={`/tests/${testId}/edit`}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Test Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the test.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{test.description}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(test.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(test.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <div className="md:flex md:items-center md:justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          <div className="mt-3 flex md:mt-0 md:ml-4">
            <select
              value={test.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {test.questions.map((question, index) => (
              <li key={question.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {index + 1}. {question.text}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Type: {question.type}
                    </p>
                    {question.type === 'multiple_choice' && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Options:</p>
                        <ul className="mt-1 list-disc list-inside">
                          {question.options?.map((option, optionIndex) => (
                            <li
                              key={optionIndex}
                              className={`text-sm ${
                                option === question.correct_answer
                                  ? 'text-green-600 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              {option}
                              {option === question.correct_answer && ' (Correct)'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 