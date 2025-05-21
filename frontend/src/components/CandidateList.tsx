import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import CandidateCard from './CandidateCard';
import CandidateFilters from './CandidateFilters';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

interface Candidate {
  id: number;
  nome: string;
  foto: string;
  email: string;
  etapa: {
    id: number;
    nome: string;
    cor: string;
  };
  score_avaliacao: number;
  vagas_aplicadas: {
    id: number;
    titulo: string;
  }[];
  status: boolean;
  skills: string[];
  formacao: string;
  experiencia: number;
}

interface CandidateListProps {
  empresaId: number;
}

export default function CandidateList({ empresaId }: CandidateListProps) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    skills: [] as string[],
    formacao: '',
    experiencia: 0,
    vagaId: null as number | null,
    status: null as boolean | null,
    dataInicio: null as string | null,
    dataFim: null as string | null,
  });
  const [sortBy, setSortBy] = useState('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch candidates with filters
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', empresaId, filters, sortBy, sortDirection],
    queryFn: async () => {
      const response = await api.get('/candidatos', {
        params: {
          ...filters,
          order_by: sortBy,
          order_direction: sortDirection,
        },
      });
      return response.data;
    },
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Check permissions
  const canEdit = user?.isAdmin || user?.isRecruiter;
  const canDelete = user?.isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <h1 className="text-2xl font-semibold text-gray-900">
              Candidatos
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar candidatos..."
                  className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>

              {/* View Toggle */}
              <div className="flex rounded-lg border border-gray-300">
                <button
                  className={`px-3 py-2 rounded-l-lg ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </button>
                <button
                  className={`px-3 py-2 rounded-r-lg ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  Lista
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                className="flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
                Filtros
                {showFilters ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500 ml-2" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500 ml-2" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={false}
            animate={{ width: showFilters ? '300px' : '0' }}
            className={`lg:w-72 flex-shrink-0 overflow-hidden ${
              showFilters ? 'block' : 'hidden'
            }`}
          >
            <CandidateFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              empresaId={empresaId}
            />
          </motion.div>

          {/* Candidate List/Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {candidates?.items.map((candidate: Candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    viewMode={viewMode}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {candidates && (
              <div className="mt-8 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Mostrando {candidates.items.length} de {candidates.total} candidatos
                </div>
                <div className="flex space-x-2">
                  {Array.from({ length: candidates.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`px-3 py-1 rounded ${
                        page === candidates.page
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        // Handle page change
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 