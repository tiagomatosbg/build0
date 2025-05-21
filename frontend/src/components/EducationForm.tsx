import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Education {
  instituicao: string;
  curso: string;
  nivel: string;
  data_inicio: string;
  data_fim?: string;
}

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  errors?: any;
}

const educationLevels = [
  'Ensino Médio',
  'Técnico',
  'Graduação',
  'Pós-graduação',
  'Mestrado',
  'Doutorado',
  'MBA',
  'Outro',
];

export const EducationForm: React.FC<EducationFormProps> = ({
  education = [],
  onChange,
  errors,
}) => {
  const addEducation = () => {
    onChange([
      ...education,
      {
        instituicao: '',
        curso: '',
        nivel: '',
        data_inicio: '',
        data_fim: '',
      },
    ]);
  };

  const removeEducation = (index: number) => {
    const newEducation = [...education];
    newEducation.splice(index, 1);
    onChange(newEducation);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value,
    };
    onChange(newEducation);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {education.map((edu, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Formação {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Instituição
                </label>
                <input
                  type="text"
                  value={edu.instituicao}
                  onChange={(e) => updateEducation(index, 'instituicao', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors?.[index]?.instituicao
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                />
                {errors?.[index]?.instituicao && (
                  <p className="mt-1 text-sm text-red-600">{errors[index].instituicao.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Curso
                </label>
                <input
                  type="text"
                  value={edu.curso}
                  onChange={(e) => updateEducation(index, 'curso', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors?.[index]?.curso
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                />
                {errors?.[index]?.curso && (
                  <p className="mt-1 text-sm text-red-600">{errors[index].curso.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nível
                </label>
                <select
                  value={edu.nivel}
                  onChange={(e) => updateEducation(index, 'nivel', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors?.[index]?.nivel
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                >
                  <option value="">Selecione o nível</option>
                  {educationLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors?.[index]?.nivel && (
                  <p className="mt-1 text-sm text-red-600">{errors[index].nivel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={edu.data_inicio}
                  onChange={(e) => updateEducation(index, 'data_inicio', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors?.[index]?.data_inicio
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                />
                {errors?.[index]?.data_inicio && (
                  <p className="mt-1 text-sm text-red-600">{errors[index].data_inicio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={edu.data_fim || ''}
                  onChange={(e) => updateEducation(index, 'data_fim', e.target.value)}
                  className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={addEducation}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Adicionar Formação
      </button>
    </div>
  );
}; 