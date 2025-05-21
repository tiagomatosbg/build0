import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Experience {
  empresa: string;
  cargo: string;
  data_inicio: string;
  data_fim?: string;
  descricao?: string;
}

interface ExperienceFormProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
  errors?: any;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experiences = [],
  onChange,
  errors,
}) => {
  const addExperience = () => {
    onChange([
      ...experiences,
      {
        empresa: '',
        cargo: '',
        data_inicio: '',
        data_fim: '',
        descricao: '',
      },
    ]);
  };

  const removeExperience = (index: number) => {
    const newExperiences = [...experiences];
    newExperiences.splice(index, 1);
    onChange(newExperiences);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value,
    };
    onChange(newExperiences);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {experiences.map((experience, index) => (
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
                Experiência {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Empresa
                </label>
                <input
                  type="text"
                  value={experience.empresa}
                  onChange={(e) => updateExperience(index, 'empresa', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors?.[index]?.empresa
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                />
                {errors?.[index]?.empresa && (
                  <p className="mt-1 text-sm text-red-600">{errors[index].empresa.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cargo
                </label>
                <input
                  type="text"
                  value={experience.cargo}
                  onChange={(e) => updateExperience(index, 'cargo', e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors?.[index]?.cargo
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                />
                {errors?.[index]?.cargo && (
                  <p className="mt-1 text-sm text-red-600">{errors[index].cargo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={experience.data_inicio}
                  onChange={(e) => updateExperience(index, 'data_inicio', e.target.value)}
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
                  value={experience.data_fim || ''}
                  onChange={(e) => updateExperience(index, 'data_fim', e.target.value)}
                  className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                value={experience.descricao || ''}
                onChange={(e) => updateExperience(index, 'descricao', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="Descreva suas principais atividades e conquistas..."
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={addExperience}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Adicionar Experiência
      </button>
    </div>
  );
}; 