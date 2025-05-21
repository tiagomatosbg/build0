import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

interface Job {
  id: number;
  title: string;
}

interface CandidateFormProps {
  initialData?: {
    full_name: string;
    email: string;
    phone: string;
    job_id: number;
    status: string;
    resume?: File;
    portfolio?: File;
  };
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function CandidateForm({ initialData, onSubmit, isSubmitting }: CandidateFormProps) {
  const [formData, setFormData] = useState(initialData || {
    full_name: '',
    email: '',
    phone: '',
    job_id: '',
    status: 'new',
    resume: undefined,
    portfolio: undefined,
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs', {
        params: { status: 'published' },
      });
      return response.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined) {
        formDataToSubmit.append(key, value);
      }
    });
    await onSubmit(formDataToSubmit);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="full_name"
            id="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="mt-1">
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <div className="mt-1">
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="job_id" className="block text-sm font-medium text-gray-700">
          Job
        </label>
        <div className="mt-1">
          <select
            name="job_id"
            id="job_id"
            required
            value={formData.job_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select a job</option>
            {jobs?.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
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
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
          Resume
        </label>
        <div className="mt-1">
          <input
            type="file"
            name="resume"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
          Portfolio (Optional)
        </label>
        <div className="mt-1">
          <input
            type="file"
            name="portfolio"
            id="portfolio"
            accept=".pdf,.doc,.docx,.zip"
            onChange={handleFileChange}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Saving...' : 'Save Candidate'}
        </button>
      </div>
    </form>
  );
} 