import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReCAPTCHA from 'react-google-recaptcha';
import { api } from '../services/api';
import FileUpload from '../components/FileUpload';
import { DocumentIcon, LinkIcon } from '@heroicons/react/24/outline';

// Validation schema
const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  sobrenome: z.string().min(3, 'Sobrenome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  telefone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
  linkedin: z.string().url('URL do LinkedIn inválida').optional().or(z.literal('')),
  portfolio: z.string().url('URL do portfólio inválida').optional().or(z.literal('')),
  curriculo: z.any().refine((file) => file instanceof File, 'Currículo é obrigatório'),
  termos: z.boolean().refine((val) => val === true, 'Você precisa aceitar os termos'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function LandingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!recaptchaValue) {
      alert('Por favor, complete o captcha');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload do currículo
      const formData = new FormData();
      formData.append('curriculo', data.curriculo);
      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      // Envio dos dados do candidato
      await api.post('/candidatos/register', {
        ...data,
        curriculo_url: uploadResponse.data.url,
        recaptcha_token: recaptchaValue,
      });

      setShowSuccess(true);
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert('Este email ou CPF já está cadastrado');
      } else {
        alert('Erro ao realizar cadastro. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#df7826] to-[#df7826]/80">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Faça Parte do Nosso Time
            </h1>
            <p className="text-white/90 text-lg">
              Cadastre-se e encontre as melhores oportunidades para sua carreira
            </p>
          </div>

          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl p-8 text-center"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Cadastro Realizado com Sucesso!
              </h2>
              <p className="text-gray-600 mb-6">
                Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#df7826] hover:bg-[#df7826]/90"
              >
                Fazer Novo Cadastro
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-xl p-8"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('nome')}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] ${
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
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] ${
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
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] ${
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
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] ${
                        errors.cpf ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.cpf && (
                      <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
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
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] ${
                        errors.telefone ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.telefone && (
                      <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
                    )}
                  </div>

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
                        className={`block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] ${
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
                        className={`block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-[#df7826] focus:ring-[#df7826] ${
                          errors.portfolio ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.portfolio && (
                      <p className="mt-1 text-sm text-red-600">{errors.portfolio.message}</p>
                    )}
                  </div>
                </div>

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
                        progress={uploadProgress}
                        required
                      />
                    )}
                  />
                  {errors.curriculo && (
                    <p className="mt-1 text-sm text-red-600">{errors.curriculo.message}</p>
                  )}
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      {...register('termos')}
                      className="h-4 w-4 text-[#df7826] focus:ring-[#df7826] border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">
                      Li e aceito os{' '}
                      <a
                        href="/termos"
                        target="_blank"
                        className="text-[#df7826] hover:text-[#df7826]/80"
                      >
                        Termos de Uso
                      </a>{' '}
                      e{' '}
                      <a
                        href="/privacidade"
                        target="_blank"
                        className="text-[#df7826] hover:text-[#df7826]/80"
                      >
                        Política de Privacidade
                      </a>
                    </label>
                    {errors.termos && (
                      <p className="mt-1 text-sm text-red-600">{errors.termos.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ''}
                    onChange={setRecaptchaValue}
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#df7826] hover:bg-[#df7826]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#df7826]'
                    }`}
                  >
                    {isSubmitting ? 'Enviando...' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 