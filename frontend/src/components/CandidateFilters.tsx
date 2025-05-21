import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';

interface FilterProps {
  filters: {
    search: string;
    skills: string[];
    formacao: string;
    experiencia: number;
    vagaId: number | null;
    status: boolean | null;
    dataInicio: string | null;
    dataFim: string | null;
  };
  onFilterChange: (filters: Partial<FilterProps['filters']>) => void;
  empresaId: number;
}

export default function CandidateFilters({
  filters,
  onFilterChange,
  empresaId,
}: FilterProps) {
  // Fetch available skills
  const { data: skills } = useQuery({
    queryKey: ['skills', empresaId],
    queryFn: async () => {
      const response = await api.get('/skills', {
        params: { empresa_id: empresaId },
      });
      return response.data;
    },
  });

  // Fetch available jobs
  const { data: vagas } = useQuery({
    queryKey: ['vagas', empresaId],
    queryFn: async () => {
      const response = await api.get('/vagas', {
        params: { empresa_id: empresaId },
      });
      return response.data;
    },
  });

  // Handle skill selection
  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ skills: newSkills });
  };

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({
      skills: [],
      formacao: '',
      experiencia: 0,
      vagaId: null,
      status: null,
      dataInicio: null,
      dataFim: null,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Limpar
        </button>
      </div>

      {/* Skills Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {skills?.map((skill: string) => (
            <button
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filters.skills.includes(skill)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Education Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Formação
        </label>
        <select
          value={filters.formacao}
          onChange={(e) => onFilterChange({ formacao: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          <option value="ensino_medio">Ensino Médio</option>
          <option value="tecnico">Técnico</option>
          <option value="graduacao">Graduação</option>
          <option value="pos_graduacao">Pós-graduação</option>
          <option value="mestrado">Mestrado</option>
          <option value="doutorado">Doutorado</option>
        </select>
      </div>

      {/* Experience Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experiência Mínima (anos)
        </label>
        <input
          type="number"
          min="0"
          value={filters.experiencia}
          onChange={(e) =>
            onFilterChange({ experiencia: parseInt(e.target.value) || 0 })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Job Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vaga
        </label>
        <select
          value={filters.vagaId || ''}
          onChange={(e) =>
            onFilterChange({
              vagaId: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          {vagas?.map((vaga: { id: number; titulo: string }) => (
            <option key={vaga.id} value={vaga.id}>
              {vaga.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={filters.status === null ? '' : filters.status.toString()}
          onChange={(e) =>
            onFilterChange({
              status: e.target.value === '' ? null : e.target.value === 'true',
            })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Período
        </label>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.dataInicio || ''}
            onChange={(e) => onFilterChange({ dataInicio: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filters.dataFim || ''}
            onChange={(e) => onFilterChange({ dataFim: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Active Filters */}
      {Object.entries(filters).some(
        ([key, value]) =>
          value !== null &&
          value !== '' &&
          (Array.isArray(value) ? value.length > 0 : true)
      ) && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Filtros Ativos
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  onClick={() => handleSkillToggle(skill)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.formacao && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.formacao}
                <button
                  onClick={() => onFilterChange({ formacao: '' })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.experiencia > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.experiencia}+ anos
                <button
                  onClick={() => onFilterChange({ experiencia: 0 })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.vagaId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {vagas?.find((v: { id: number }) => v.id === filters.vagaId)?.titulo}
                <button
                  onClick={() => onFilterChange({ vagaId: null })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status !== null && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.status ? 'Ativos' : 'Inativos'}
                <button
                  onClick={() => onFilterChange({ status: null })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.dataInicio || filters.dataFim) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.dataInicio && filters.dataFim
                  ? `${filters.dataInicio} - ${filters.dataFim}`
                  : filters.dataInicio
                  ? `A partir de ${filters.dataInicio}`
                  : `Até ${filters.dataFim}`}
                <button
                  onClick={() =>
                    onFilterChange({ dataInicio: null, dataFim: null })
                  }
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 