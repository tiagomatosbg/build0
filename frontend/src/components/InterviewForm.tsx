import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

interface Candidate {
  id: number;
  full_name: string;
  job: {
    id: number;
    title: string;
  };
}

interface Interviewer {
  id: number;
  full_name: string;
}

interface InterviewFormProps {
  initialData?: {
    candidate_id: number;
    interviewer_id: number;
    scheduled_at: string;
    type: string;
    notes?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function InterviewForm({ initialData, onSubmit, isSubmitting }: InterviewFormProps) {
  const [formData, setFormData] = useState(initialData || {
    candidate_id: '',
    interviewer_id: '',
    scheduled_at: '',
    type: 'technical',
    notes: '',
  });

  const { data: candidates } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await api.get('/candidates', {
        params: { status: 'in_review' },
      });
      return response.data;
    },
  });

  const { data: interviewers } = useQuery<Interviewer[]>({
    queryKey: ['interviewers'],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: { role: 'interviewer' },
      });
      return response.data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="candidate_id" className="block text-sm font-medium text-gray-700">
          Candidate
        </label>
        <div className="mt-1">
          <select
            name="candidate_id"
            id="candidate_id"
            required
            value={formData.candidate_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select a candidate</option>
            {candidates?.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.full_name} - {candidate.job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="interviewer_id" className="block text-sm font-medium text-gray-700">
          Interviewer
        </label>
        <div className="mt-1">
          <select
            name="interviewer_id"
            id="interviewer_id"
            required
            value={formData.interviewer_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select an interviewer</option>
            {interviewers?.map((interviewer) => (
              <option key={interviewer.id} value={interviewer.id}>
                {interviewer.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700">
          Scheduled Date & Time
        </label>
        <div className="mt-1">
          <input
            type="datetime-local"
            name="scheduled_at"
            id="scheduled_at"
            required
            value={formData.scheduled_at}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Interview Type
        </label>
        <div className="mt-1">
          <select
            name="type"
            id="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="input-field"
          >
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="culture">Culture Fit</option>
            <option value="final">Final</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <div className="mt-1">
          <textarea
            name="notes"
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="input-field"
            placeholder="Add any additional notes or requirements for the interview..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Saving...' : 'Schedule Interview'}
        </button>
      </div>
    </form>
  );
} 