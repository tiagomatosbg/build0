import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

interface Company {
  id: number;
  name: string;
}

interface JobFormProps {
  initialData?: {
    title: string;
    description: string;
    requirements: string;
    company_id: number;
    status: string;
  };
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function JobForm({ initialData, onSubmit, isSubmitting }: JobFormProps) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    requirements: '',
    company_id: '',
    status: 'draft',
  });

  const { data: companies } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Job Title
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <div className="mt-1">
          <select
            name="company_id"
            id="company_id"
            required
            value={formData.company_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select a company</option>
            {companies?.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
          Requirements
        </label>
        <div className="mt-1">
          <textarea
            name="requirements"
            id="requirements"
            rows={4}
            required
            value={formData.requirements}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="mt-1">
          <select
            name="status"
            id="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="input-field"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Saving...' : 'Save Job'}
        </button>
      </div>
    </form>
  );
} 