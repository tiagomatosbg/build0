import { useState } from 'react';

interface TestFormProps {
  initialData?: {
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
  };
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function TestForm({ initialData, onSubmit, isSubmitting }: TestFormProps) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    type: 'technical',
    duration: 30,
    status: 'draft',
    questions: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          type: 'multiple_choice',
          options: [''],
          correct_answer: '',
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const addOption = (questionIndex: number) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      questions[questionIndex].options = [...(questions[questionIndex].options || []), ''];
      return { ...prev, questions };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      questions[questionIndex].options = questions[questionIndex].options?.filter(
        (_, i) => i !== optionIndex
      );
      return { ...prev, questions };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            name="description"
            id="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
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
              <option value="personality">Personality</option>
              <option value="cognitive">Cognitive</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="duration"
              id="duration"
              required
              min="1"
              value={formData.duration}
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
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="btn-secondary"
          >
            Add Question
          </button>
        </div>

        <div className="space-y-6">
          {formData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="card p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                    placeholder="Question text"
                    className="input-field w-full"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question Type
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                    className="input-field mt-1"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text">Text</option>
                    <option value="code">Code</option>
                  </select>
                </div>

                {question.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Correct Answer
                    </label>
                    <select
                      value={question.correct_answer}
                      onChange={(e) => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}
                      className="input-field mt-1"
                    >
                      <option value="">Select correct answer</option>
                      {question.options?.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>
                          Option {optionIndex + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {question.type === 'multiple_choice' && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const options = [...(question.options || [])];
                            options[optionIndex] = e.target.value;
                            handleQuestionChange(questionIndex, 'options', options);
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="input-field flex-1"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          className="ml-2 text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Saving...' : 'Save Test'}
        </button>
      </div>
    </form>
  );
} 