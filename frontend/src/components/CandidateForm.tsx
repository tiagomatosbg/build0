import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  DocumentIcon,
  LinkIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import FileUpload from './FileUpload';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';

// Validation schema
const candidateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  sobrenome: z.string().min(3, 'Sobrenome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  telefone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  linkedin: z.string().url('URL do LinkedIn inválida').optional().or(z.literal('')),
  portfolio: z.string().url('URL do portfólio inválida').optional().or(z.literal('')),
  resumo: z.string().min(50, 'Resumo deve ter no mínimo 50 caracteres'),
  foto: z.any().optional(),
  curriculo: z.any().optional(),
  documentos: z.array(z.any()).optional(),
  experiencias: z.array(z.object({
    empresa: z.string().min(1, 'Empresa é obrigatória'),
    cargo: z.string().min(1, 'Cargo é obrigatório'),
    data_inicio: z.string().min(1, 'Data de início é obrigatória'),
    data_fim: z.string().optional(),
    descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  })),
  formacoes: z.array(z.object({
    instituicao: z.string().min(1, 'Instituição é obrigatória'),
    curso: z.string().min(1, 'Curso é obrigatório'),
    nivel: z.string().min(1, 'Nível é obrigatório'),
    data_inicio: z.string().min(1, 'Data de início é obrigatória'),
    data_fim: z.string().optional(),
  })),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

interface CandidateFormProps {
  initialData?: Partial<CandidateFormData>;
  onSubmit: (data: CandidateFormData) => Promise<void>;
  isEditing?: boolean;
}

export default function CandidateForm({
  initialData,
  onSubmit,
  isEditing = false,
}: CandidateFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    watch,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: initialData,
  });

  // Watch form values for conditional rendering
  const watchFoto = watch('foto');
  const watchCurriculo = watch('curriculo');
  const watchDocumentos = watch('documentos');

  // Handle file uploads
  const handleFileUpload = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress((prev) => ({ ...prev, [type]: progress }));
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };

  // Handle form submission
  const onSubmitForm = async (data: CandidateFormData) => {
    try {
      setIsSubmitting(true);

      // Upload files if they exist
      if (data.foto instanceof File) {
        data.foto = await handleFileUpload(data.foto, 'foto');
      }
      if (data.curriculo instanceof File) {
        data.curriculo = await handleFileUpload(data.curriculo, 'curriculo');
      }
      if (data.documentos?.length) {
        const uploadedDocs = await Promise.all(
          data.documentos.map((doc) => handleFileUpload(doc, 'documento'))
        );
        data.documentos = uploadedDocs;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {/* Personal Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Informações Pessoais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('nome')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.nome ? 'border-red-500' : ''
              }`}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sobrenome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('sobrenome')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.sobrenome ? 'border-red-500' : ''
              }`}
            />
            {errors.sobrenome && (
              <p className="mt-1 text-sm text-red-600">{errors.sobrenome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              CPF <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('cpf')}
              placeholder="000.000.000-00"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.cpf ? 'border-red-500' : ''
              }`}
            />
            {errors.cpf && (
              <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data de Nascimento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('data_nascimento')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.data_nascimento ? 'border-red-500' : ''
              }`}
            />
            {errors.data_nascimento && (
              <p className="mt-1 text-sm text-red-600">
                {errors.data_nascimento.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('telefone')}
              placeholder="(00) 00000-0000"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.telefone ? 'border-red-500' : ''
              }`}
            />
            {errors.telefone && (
              <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Documentos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto
            </label>
            <Controller
              name="foto"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FileUpload
                  accept="image/*"
                  onChange={onChange}
                  value={value}
                  icon={<PhotoIcon className="h-6 w-6" />}
                  label="Upload Foto"
                  progress={uploadProgress['foto']}
                />
              )}
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currículo <span className="text-red-500">*</span>
            </label>
            <Controller
              name="curriculo"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FileUpload
                  accept=".pdf,.doc,.docx"
                  onChange={onChange}
                  value={value}
                  icon={<DocumentIcon className="h-6 w-6" />}
                  label="Upload Currículo"
                  progress={uploadProgress['curriculo']}
                  required
                />
              )}
            />
            {errors.curriculo && (
              <p className="mt-1 text-sm text-red-600">{errors.curriculo.message}</p>
            )}
          </div>

          {/* Additional Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos Adicionais
            </label>
            <Controller
              name="documentos"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FileUpload
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={onChange}
                  value={value}
                  icon={<DocumentIcon className="h-6 w-6" />}
                  label="Upload Documentos"
                  multiple
                  progress={uploadProgress['documentos']}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Informações Profissionais
        </h2>
        <div className="space-y-6">
          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  {...register('linkedin')}
                  placeholder="https://linkedin.com/in/seu-perfil"
                  className={`block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.linkedin ? 'border-red-500' : ''
                  }`}
                />
              </div>
              {errors.linkedin && (
                <p className="mt-1 text-sm text-red-600">{errors.linkedin.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Portfólio
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  {...register('portfolio')}
                  placeholder="https://seu-portfolio.com"
                  className={`block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.portfolio ? 'border-red-500' : ''
                  }`}
                />
              </div>
              {errors.portfolio && (
                <p className="mt-1 text-sm text-red-600">{errors.portfolio.message}</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resumo Profissional <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('resumo')}
              rows={4}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.resumo ? 'border-red-500' : ''
              }`}
            />
            {errors.resumo && (
              <p className="mt-1 text-sm text-red-600">{errors.resumo.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Experience */}
      <Controller
        name="experiencias"
        control={control}
        render={({ field: { onChange, value } }) => (
          <ExperienceForm
            experiences={value}
            onChange={onChange}
            errors={errors.experiencias}
          />
        )}
      />

      {/* Education */}
      <Controller
        name="formacoes"
        control={control}
        render={({ field: { onChange, value } }) => (
          <EducationForm
            educations={value}
            onChange={onChange}
            errors={errors.formacoes}
          />
        )}
      />

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || (!isDirty && isEditing)}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isSubmitting || (!isDirty && isEditing)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
} 