import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import {
  DocumentIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ClockIcon,
  DocumentTextIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface Candidate {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  linkedin?: string;
  portfolio?: string;
  curriculo?: string;
  data_nascimento: string;
  cpf: string;
  experiencias: Experience[];
  formacoes: Education[];
  documentos: Document[];
  candidaturas: Application[];
  avaliacoes: Evaluation[];
  entrevistas: Interview[];
  observacoes: Note[];
}

interface Experience {
  id: number;
  empresa: string;
  cargo: string;
  data_inicio: string;
  data_fim?: string;
  descricao: string;
}

interface Education {
  id: number;
  instituicao: string;
  curso: string;
  nivel: string;
  data_inicio: string;
  data_fim?: string;
}

interface Document {
  id: number;
  tipo: string;
  nome: string;
  url: string;
  data_upload: string;
}

interface Application {
  id: number;
  vaga: {
    id: number;
    titulo: string;
    empresa: string;
  };
  etapa: {
    id: number;
    nome: string;
    cor: string;
  };
  data_candidatura: string;
  status: string;
}

interface Evaluation {
  id: number;
  tipo: string;
  titulo: string;
  score: number;
  data_realizacao: string;
  status: string;
}

interface Interview {
  id: number;
  tipo: string;
  data: string;
  status: string;
  entrevistadores: string[];
  feedback?: string;
}

interface Note {
  id: number;
  conteudo: string;
  autor: string;
  data: string;
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    fetchCandidateData();
  }, [id]);

  const fetchCandidateData = async () => {
    try {
      const response = await api.get(`/candidatos/${id}`);
      setCandidate(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados do candidato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#df7826]"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Candidato não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate.nome} {candidate.sobrenome}
              </h1>
              <p className="text-gray-600">{candidate.email}</p>
            </div>
            <div className="flex space-x-3">
              {user?.isAdmin && (
                <button
                  onClick={() => navigate(`/candidatos/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#df7826] hover:bg-[#df7826]/90"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Editar
                </button>
              )}
              {candidate.curriculo && (
                <button
                  onClick={() => handleDownload(candidate.curriculo!, 'curriculo.pdf')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Baixar Currículo
                </button>
              )}
              {user?.isAdmin && (
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                  Enviar Mensagem
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex space-x-8 px-6 border-b border-gray-200">
            {[
              { id: 'personal', label: 'Dados Pessoais', icon: DocumentIcon },
              { id: 'applications', label: 'Candidaturas', icon: BriefcaseIcon },
              { id: 'experience', label: 'Experiências', icon: BriefcaseIcon },
              { id: 'education', label: 'Formação', icon: AcademicCapIcon },
              { id: 'documents', label: 'Documentos', icon: DocumentTextIcon },
              { id: 'evaluations', label: 'Testes', icon: StarIcon },
              { id: 'interviews', label: 'Entrevistas', icon: ChatBubbleLeftRightIcon },
              { id: 'notes', label: 'Observações', icon: ClockIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#df7826] text-[#df7826]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nome Completo</dt>
                    <dd className="mt-1 text-sm text-gray-900">{candidate.nome} {candidate.sobrenome}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{candidate.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{candidate.telefone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Data de Nascimento</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(candidate.data_nascimento).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Links Profissionais</h3>
                <dl className="space-y-4">
                  {candidate.linkedin && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">LinkedIn</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a
                          href={candidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#df7826] hover:text-[#df7826]/80"
                        >
                          {candidate.linkedin}
                        </a>
                      </dd>
                    </div>
                  )}
                  {candidate.portfolio && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Portfólio</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a
                          href={candidate.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#df7826] hover:text-[#df7826]/80"
                        >
                          {candidate.portfolio}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              {candidate.candidaturas.map((candidatura) => (
                <div
                  key={candidatura.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{candidatura.vaga.titulo}</h3>
                      <p className="text-sm text-gray-500">{candidatura.vaga.empresa}</p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: candidatura.etapa.cor + '20', color: candidatura.etapa.cor }}
                    >
                      {candidatura.etapa.nome}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Candidatura em {new Date(candidatura.data_candidatura).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              {candidate.experiencias.map((experiencia) => (
                <div key={experiencia.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">{experiencia.cargo}</h3>
                  <p className="text-sm text-gray-500">{experiencia.empresa}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(experiencia.data_inicio).toLocaleDateString()} -{' '}
                    {experiencia.data_fim
                      ? new Date(experiencia.data_fim).toLocaleDateString()
                      : 'Atual'}
                  </p>
                  <p className="mt-2 text-gray-600">{experiencia.descricao}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              {candidate.formacoes.map((formacao) => (
                <div key={formacao.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">{formacao.curso}</h3>
                  <p className="text-sm text-gray-500">{formacao.instituicao}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formacao.nivel} • {new Date(formacao.data_inicio).toLocaleDateString()} -{' '}
                    {formacao.data_fim
                      ? new Date(formacao.data_fim).toLocaleDateString()
                      : 'Atual'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidate.documentos.map((documento) => (
                <div
                  key={documento.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{documento.nome}</h3>
                      <p className="text-sm text-gray-500">{documento.tipo}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(documento.url, '_blank')}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(documento.url, documento.nome)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload em {new Date(documento.data_upload).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-6">
              {candidate.avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{avaliacao.titulo}</h3>
                      <p className="text-sm text-gray-500">{avaliacao.tipo}</p>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-lg font-medium">{avaliacao.score}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Realizado em {new Date(avaliacao.data_realizacao).toLocaleDateString()}
                  </div>
                  <span
                    className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      avaliacao.status === 'Aprovado'
                        ? 'bg-green-100 text-green-800'
                        : avaliacao.status === 'Reprovado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {avaliacao.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="space-y-6">
              {candidate.entrevistas.map((entrevista) => (
                <div key={entrevista.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{entrevista.tipo}</h3>
                      <p className="text-sm text-gray-500">
                        Entrevistadores: {entrevista.entrevistadores.join(', ')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        entrevista.status === 'Agendada'
                          ? 'bg-blue-100 text-blue-800'
                          : entrevista.status === 'Concluída'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {entrevista.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Data: {new Date(entrevista.data).toLocaleDateString()}
                    </p>
                    {entrevista.feedback && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700">Feedback:</h4>
                        <p className="mt-1 text-sm text-gray-600">{entrevista.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              {candidate.observacoes.map((observacao) => (
                <div key={observacao.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900">{observacao.conteudo}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Por {observacao.autor} em{' '}
                        {new Date(observacao.data).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enviar Mensagem</h3>
            <textarea
              className="w-full h-32 border rounded-md p-2"
              placeholder="Digite sua mensagem..."
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Implementar envio de mensagem
                  setShowMessageModal(false);
                }}
                className="px-4 py-2 bg-[#df7826] text-white rounded-md hover:bg-[#df7826]/90"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 