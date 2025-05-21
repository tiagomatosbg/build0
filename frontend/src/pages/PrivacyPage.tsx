import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Política de Privacidade
          </h1>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-[#df7826] mb-4">
              1. Responsável pelo Tratamento
            </h2>
            <p>
              Sua Empresa, inscrita no CNPJ sob o número XX.XXX.XXX/XXXX-XX,
              é a responsável pelo tratamento dos seus dados pessoais.
            </p>

            <h2 className="text-2xl font-semibold text-[#df7826] mb-4 mt-8">
              2. Base Legal
            </h2>
            <p>
              O tratamento dos seus dados pessoais é baseado nas seguintes
              hipóteses legais da LGPD:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Consentimento do titular</li>
              <li>Cumprimento de obrigação legal ou regulatória</li>
              <li>Execução de contrato</li>
              <li>Exercício regular de direitos</li>
              <li>Interesse legítimo</li>
            </ul>

            <h2 className="text-2xl font-semibold text-[#df7826] mb-4 mt-8">
              3. Finalidades do Tratamento
            </h2>
            <p>
              Seus dados pessoais são tratados para as seguintes finalidades:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Cadastro e gerenciamento de conta</li>
              <li>Processo seletivo e recrutamento</li>
              <li>Comunicação sobre oportunidades</li>
              <li>Melhoria dos serviços</li>
              <li>Análise de perfil profissional</li>
              <li>Cumprimento de obrigações legais</li>
            </ul>

            <h2 className="text-2xl font-semibold text-[#df7826] mb-4 mt-8">
              4. Dados Sensíveis
            </h2>
            <p>
              Não coletamos dados sensíveis, exceto quando necessário para o
              processo seletivo e com seu consentimento expresso.
            </p>

            <h2 className="text-2xl font-semibold text-[#df7826] mb-4 mt-8">
              5. Transferência Internacional
            </h2>
            <p>
              Seus dados podem ser transferidos para outros países quando
              necessário para o funcionamento da plataforma. Nestes casos,
              garantimos que o país de destino ofereça grau de proteção de
              dados pessoais adequado ao previsto na LGPD.
            </p>

            <h2 className="text-2xl font-semibold text-[#df7826] mb-4 mt-8">
              6. Retenção de Dados
            </h2>
            <p>
              Mantemos seus dados pessoais pelo tempo necessário para cumprir
              as finalidades para as quais foram coletados, incluindo o
              cumprimento de obrigações legais. Após este período, os dados
              serão anonimizados ou eliminados de forma segura.
            </p>

            <h2 className="text-2xl font-semibold text-[#df7826] mb-4 mt-8">
              7. Direitos do Titular
            </h2>
            <p>
              Você pode exercer os seguintes direitos:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Confirmar a existência de tratamento</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Anonimizar, bloquear ou eliminar dados desnecessários</li>
              <li>Portabilidade dos dados</li>
              <li>Eliminação dos dados pessoais</li>
              <li>Informação sobre compartilhamento</li>
              <li>Informação sobre a possibilidade de não fornecer consentimento</li>
              <li>Revogação do consentimento</li>
            </ul>

            <h2 className="text-2xl font-semibold text-[#df7826] mb-4 mt-8">
              8. Canais de Atendimento
            </h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre o
              tratamento de seus dados pessoais, entre em contato através de:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email: privacidade@suaempresa.com</li>
              <li>Telefone: (XX) XXXX-XXXX</li>
              <li>Endereço: Rua Exemplo, 123 - Cidade/Estado</li>
            </ul>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Última atualização: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 