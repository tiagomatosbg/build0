import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from './Tooltip';
import { FileUpload } from './FileUpload';
import { ExperienceForm } from './ExperienceForm';
import { EducationForm } from './EducationForm';
import { Badge } from './Badge';

// Validation schema
const candidateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  telefone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
  linkedin: z.string().url('URL do LinkedIn inválida').optional(),
  portfolio: z.string().url('URL do portfólio inválida').optional(),
  curriculo: z.instanceof(File).optional(),
  experiencias: z.array(z.object({
    empresa: z.string().min(1, 'Empresa é obrigatória'),
    cargo: z.string().min(1, 'Cargo é obrigatório'),
    data_inicio: z.string().min(1, 'Data de início é obrigatória'),
    data_fim: z.string().optional(),
    descricao: z.string().optional(),
  })),
  educacao: z.array(z.object({
    instituicao: z.string().min(1, 'Instituição é obrigatória'),
    curso: z.string().min(1, 'Curso é obrigatório'),
    nivel: z.string().min(1, 'Nível é obrigatório'),
    data_inicio: z.string().min(1, 'Data de início é obrigatória'),
    data_fim: z.string().optional(),
  })),
  termos: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os termos para continuar',
  }),
});

type FormData = z.infer<typeof candidateSchema>;

const steps = [
  { id: 'personal', title: 'Dados Pessoais', icon: UserIcon },
  { id: 'professional', title: 'Dados Profissionais', icon: BriefcaseIcon },
  { id: 'documents', title: 'Documentos', icon: DocumentTextIcon },
  { id: 'terms', title: 'Termos', icon: CheckCircleIcon },
];

export const CandidateRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(candidateSchema),
    mode: 'onChange',
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await fetch('/api/v1/candidatos/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar cadastro');
      }

      // Show success message or redirect
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await trigger(fields);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 0:
        return ['nome', 'email', 'cpf', 'telefone'];
      case 1:
        return ['linkedin', 'portfolio', 'experiencias', 'educacao'];
      case 2:
        return ['curriculo'];
      case 3:
        return ['termos'];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <step.icon className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Dados Pessoais</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Completo
                      <Tooltip content="Digite seu nome completo como aparece em documentos oficiais">
                        <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                      </Tooltip>
                    </label>
                    <Controller
                      name="nome"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-1">
                          <input
                            {...field}
                            type="text"
                            className={`block w-full rounded-md shadow-sm ${
                              errors.nome
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary focus:ring-primary'
                            }`}
                          />
                          {errors.nome && (
                            <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                      <Tooltip content="Digite um email válido que você acessa frequentemente">
                        <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                      </Tooltip>
                    </label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-1">
                          <input
                            {...field}
                            type="email"
                            className={`block w-full rounded-md shadow-sm ${
                              errors.email
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary focus:ring-primary'
                            }`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      CPF
                      <Tooltip content="Digite seu CPF no formato 000.000.000-00">
                        <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                      </Tooltip>
                    </label>
                    <Controller
                      name="cpf"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-1">
                          <input
                            {...field}
                            type="text"
                            placeholder="000.000.000-00"
                            className={`block w-full rounded-md shadow-sm ${
                              errors.cpf
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary focus:ring-primary'
                            }`}
                          />
                          {errors.cpf && (
                            <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telefone
                      <Tooltip content="Digite seu número com DDD no formato (00) 00000-0000">
                        <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                      </Tooltip>
                    </label>
                    <Controller
                      name="telefone"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-1">
                          <input
                            {...field}
                            type="tel"
                            placeholder="(00) 00000-0000"
                            className={`block w-full rounded-md shadow-sm ${
                              errors.telefone
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary focus:ring-primary'
                            }`}
                          />
                          {errors.telefone && (
                            <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Dados Profissionais</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      LinkedIn
                      <Tooltip content="URL do seu perfil no LinkedIn">
                        <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                      </Tooltip>
                    </label>
                    <Controller
                      name="linkedin"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-1">
                          <input
                            {...field}
                            type="url"
                            placeholder="https://linkedin.com/in/seu-perfil"
                            className={`block w-full rounded-md shadow-sm ${
                              errors.linkedin
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary focus:ring-primary'
                            }`}
                          />
                          {errors.linkedin && (
                            <p className="mt-1 text-sm text-red-600">{errors.linkedin.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Portfólio
                      <Tooltip content="URL do seu portfólio ou site pessoal">
                        <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                      </Tooltip>
                    </label>
                    <Controller
                      name="portfolio"
                      control={control}
                      render={({ field }) => (
                        <div className="mt-1">
                          <input
                            {...field}
                            type="url"
                            placeholder="https://seu-portfolio.com"
                            className={`block w-full rounded-md shadow-sm ${
                              errors.portfolio
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary focus:ring-primary'
                            }`}
                          />
                          {errors.portfolio && (
                            <p className="mt-1 text-sm text-red-600">{errors.portfolio.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Experiência Profissional</h3>
                    <Badge color="blue">Opcional</Badge>
                  </div>
                  <Controller
                    name="experiencias"
                    control={control}
                    render={({ field }) => (
                      <ExperienceForm
                        experiences={field.value}
                        onChange={field.onChange}
                        errors={errors.experiencias}
                      />
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Formação Acadêmica</h3>
                    <Badge color="blue">Opcional</Badge>
                  </div>
                  <Controller
                    name="educacao"
                    control={control}
                    render={({ field }) => (
                      <EducationForm
                        education={field.value}
                        onChange={field.onChange}
                        errors={errors.educacao}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Currículo
                    <Tooltip content="Envie seu currículo em PDF ou DOC/DOCX (máx. 5MB)">
                      <InformationCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
                    </Tooltip>
                  </label>
                  <Controller
                    name="curriculo"
                    control={control}
                    render={({ field }) => (
                      <div className="mt-1">
                        <FileUpload
                          accept=".pdf,.doc,.docx"
                          onChange={field.onChange}
                          currentFile={field.value}
                          showIcon
                          label="Arraste seu currículo ou clique para selecionar"
                          progress={0}
                          required
                        />
                        {errors.curriculo && (
                          <p className="mt-1 text-sm text-red-600">{errors.curriculo.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Termos e Condições</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <Controller
                    name="termos"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            {...field}
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label className="font-medium text-gray-700">
                            Li e aceito os termos de uso e política de privacidade
                          </label>
                          <p className="text-gray-500">
                            Ao marcar esta opção, você concorda com o processamento dos seus dados
                            pessoais de acordo com a LGPD.
                          </p>
                          {errors.termos && (
                            <p className="mt-1 text-sm text-red-600">{errors.termos.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Voltar
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                isSubmitting || !isValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar Cadastro'}
            </button>
          )}
        </div>

        {submitError && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}; 