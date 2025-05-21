import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TestForm from '../components/TestForm';

interface Test {
  id: number;
  title: string;
  description: string;
  type: string;
  duration: number;
  status: string;
  questions: {
    id?: number;
    text: string;
    type: string;
    options?: string[];
    correct_answer?: string;
  }[];
}

export default function EditTest() {
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

  const updateTestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update test');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['test', testId] });
      navigate('/tests');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (data: any) => {
    setError(null);
    await updateTestMutation.mutateAsync(data);
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
            Edit Test
          </h2>
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

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <TestForm
            initialData={test}
            onSubmit={handleSubmit}
            isSubmitting={updateTestMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
} 