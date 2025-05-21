import { useState, useEffect } from 'react';
import { JobStatus, JobType } from '../types/job';

interface JobFormData {
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
}

interface FormErrors {
  title?: string;
  description?: string;
  department?: string;
  location?: string;
  type?: string;
  status?: string;
  salary_min?: string;
  salary_max?: string;
  benefits?: string;
  requirements?: string;
  opening_date?: string;
  closing_date?: string;
}

interface JobFormProps {
  initialData?: JobFormData;
  onSubmit: (data: JobFormData) => void;
  isSubmitting: boolean;
}

const commonRequirements = [
  'Experiência comprovada na área',
  'Boa comunicação',
  'Trabalho em equipe',
  'Inglês intermediário',
  'Graduação completa',
  'Conhecimentos em ferramentas específicas',
  'Disponibilidade para viagens',
  'Flexibilidade de horário',
];

export default function JobForm({ initialData, onSubmit, isSubmitting }: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    department: '',
    location: '',
    type: JobType.FULL_TIME,
    status: JobStatus.DRAFT,
    salary_min: 0,
    salary_max: 0,
    benefits: [],
    requirements: [],
    opening_date: new Date().toISOString().split('T')[0],
    closing_date: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showRequirementsSuggestions, setShowRequirementsSuggestions] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateField = (name: keyof JobFormData, value: any): string | undefined => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'O título da vaga é obrigatório';
        if (value.trim().length < 5) return 'O título deve ter pelo menos 5 caracteres';
        break;
      case 'description':
        if (!value.trim()) return 'A descrição da vaga é obrigatória';
        if (value.trim().length < 50) return 'A descrição deve ter pelo menos 50 caracteres';
        break;
      case 'requirements':
        if (!value.length || value.every((req: string) => !req.trim())) {
          return 'Pelo menos um requisito é obrigatório';
        }
        break;
      case 'status':
        if (!value) return 'O status da vaga é obrigatório';
        break;
      case 'salary_min':
        if (value <= 0) return 'O salário mínimo deve ser maior que zero';
        break;
      case 'salary_max':
        if (value <= 0) return 'O salário máximo deve ser maior que zero';
        if (value <= formData.salary_min) {
          return 'O salário máximo deve ser maior que o salário mínimo';
        }
        break;
      case 'closing_date':
        if (value && new Date(value) <= new Date(formData.opening_date)) {
          return 'A data de encerramento deve ser posterior à data de abertura';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === 'requirements' || name === 'benefits' 
      ? value.split('\n')
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate field in real-time
    const error = validateField(name as keyof JobFormData, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof JobFormData, formData[key as keyof JobFormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      onSubmit(formData);
    }
  };

  const addRequirementSuggestion = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, requirement],
    }));
    setShowRequirementsSuggestions(false);
  };

  const InputField = ({ 
    label, 
    name, 
    type = 'text', 
    required = false, 
    rows = 1,
    placeholder = '',
    children 
  }: { 
    label: string; 
    name: keyof JobFormData; 
    type?: string;
    required?: boolean;
    rows?: number;
    placeholder?: string;
    children?: React.ReactNode;
  }) => (
    <div className="col-span-6 sm:col-span-3">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          required={required}
          value={Array.isArray(formData[name]) ? (formData[name] as string[]).join('\n') : formData[name]}
          onChange={handleChange}
          className={`mt-1 focus:ring-[#df7826] focus:border-[#df7826] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
            errors[name] ? 'border-red-500' : ''
          }`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          required={required}
          value={formData[name]}
          onChange={handleChange}
          className={`mt-1 focus:ring-[#df7826] focus:border-[#df7826] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
            errors[name] ? 'border-red-500' : ''
          }`}
          placeholder={placeholder}
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-6 gap-6">
        <InputField
          label="Título da Vaga"
          name="title"
          required
          placeholder="Ex: Desenvolvedor Full Stack Senior"
        />

        <InputField
          label="Departamento"
          name="department"
          required
          placeholder="Ex: Tecnologia"
        />

        <InputField
          label="Localização"
          name="location"
          required
          placeholder="Ex: São Paulo - SP"
        />

        <div className="col-span-6 sm:col-span-3">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Tipo de Vaga *
          </label>
          <select
            id="type"
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#df7826] focus:border-[#df7826] sm:text-sm"
          >
            {Object.values(JobType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-6 sm:col-span-3">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#df7826] focus:border-[#df7826] sm:text-sm ${
              errors.status ? 'border-red-500' : ''
            }`}
          >
            {Object.values(JobStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>

        <InputField
          label="Descrição"
          name="description"
          type="textarea"
          required
          rows={3}
          placeholder="Descreva as responsabilidades e atribuições da vaga..."
        />

        <div className="col-span-6">
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
            Requisitos *
          </label>
          <div className="mt-1 relative">
            <textarea
              id="requirements"
              name="requirements"
              rows={3}
              required
              value={formData.requirements.join('\n')}
              onChange={handleChange}
              onFocus={() => setShowRequirementsSuggestions(true)}
              className={`focus:ring-[#df7826] focus:border-[#df7826] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                errors.requirements ? 'border-red-500' : ''
              }`}
              placeholder="Digite cada requisito em uma nova linha"
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
            )}
            {showRequirementsSuggestions && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                <div className="p-2">
                  <p className="text-sm text-gray-500 mb-2">Sugestões comuns:</p>
                  <div className="space-y-1">
                    {commonRequirements.map((req) => (
                      <button
                        key={req}
                        type="button"
                        onClick={() => addRequirementSuggestion(req)}
                        className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        {req}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <InputField
          label="Benefícios"
          name="benefits"
          type="textarea"
          rows={3}
          placeholder="Digite cada benefício em uma nova linha"
        />

        <InputField
          label="Salário Mínimo"
          name="salary_min"
          type="number"
          required
          placeholder="Ex: 5000"
        />

        <InputField
          label="Salário Máximo"
          name="salary_max"
          type="number"
          required
          placeholder="Ex: 8000"
        />

        <InputField
          label="Data de Abertura"
          name="opening_date"
          type="date"
          required
        />

        <InputField
          label="Data de Encerramento"
          name="closing_date"
          type="date"
          placeholder="Opcional"
        />
      </div>

      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#df7826] hover:bg-[#c66a1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#df7826] disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Criar Vaga'}
        </button>
      </div>
    </form>
  );
} 