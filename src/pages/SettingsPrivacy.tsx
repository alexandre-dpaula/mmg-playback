import React from "react";
import { ArrowLeft, Shield, Lock, FileText, KeyRound, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsPrivacy: React.FC = () => {
  const navigate = useNavigate();
  const lastUpdated = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pb-24">
      <div className="px-6 pt-8 pb-6">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#1DB954]/10 p-3 rounded-lg">
            <Shield className="w-6 h-6 text-[#1DB954]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Termos e Privacidade</h1>
            <p className="text-white/60 text-sm">Uso responsável e proteção de dados</p>
          </div>
        </div>
        <p className="text-white/40 text-xs">Última atualização em {lastUpdated}</p>
      </div>

      <div className="px-6 space-y-4">
        <section className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#1DB954]" />
            Compromisso com a privacidade
          </h2>
          <p className="text-white/70 leading-relaxed text-sm">
            O MMG Playback foi projetado para uso interno do Ministério de Música.
            Todos os dados inseridos pelos usuários destinam-se exclusivamente à organização de eventos,
            repertórios e ensaios. Não vendemos, compartilhamos ou comercializamos informações pessoais.
          </p>
        </section>

        <section className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#1DB954]" />
            Coleta e uso de dados
          </h3>
          <ul className="text-white/70 text-sm space-y-2">
            <li>• Dados de login e identificação (e-mail, nome) são usados para autenticar e registrar atividades.</li>
            <li>• Informações de eventos, cifras, áudios e URLs são armazenadas para facilitar o acesso pelo time.</li>
            <li>• Dados técnicos como horário de acesso, tipo de dispositivo e interações podem ser coletados para diagnóstico e segurança.</li>
          </ul>
        </section>

        <section className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1DB954]" />
            Termos de uso
          </h3>
          <ul className="text-white/70 text-sm space-y-2">
            <li>• O aplicativo deve ser utilizado apenas pelos integrantes autorizados do Ministério.</li>
            <li>• É responsabilidade do usuário manter sigilo sobre credenciais e materiais disponibilizados.</li>
            <li>• Conteúdos adicionados (cifras, áudios e notas) devem respeitar direitos autorais e diretrizes internas.</li>
            <li>• Alterações manuais em repertórios podem ser auditadas para manter a integridade dos ensaios.</li>
          </ul>
        </section>

        <section className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#1DB954]" />
            Serviços conectados
          </h3>
          <p className="text-white/70 text-sm">
            O MMG Playback integra Supabase, Google Sheets/Drive e CifraClub apenas para leitura e organização das cifras.
            Esses serviços têm políticas próprias, e recomendamos revisar a privacidade de cada um para entender como tratam os dados.
          </p>
        </section>

        <section className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="text-lg font-semibold">Direitos dos usuários</h3>
          <p className="text-white/70 text-sm">
            Caso deseje revisar, corrigir ou excluir informações pessoais, entre em contato com a liderança do ministério.
            As solicitações serão atendidas mediante validação de identidade para proteger o conteúdo interno.
          </p>
        </section>

        <section className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="text-lg font-semibold">Contato</h3>
          <p className="text-white/70 text-sm">
            Dúvidas sobre privacidade ou termos podem ser enviadas para o time responsável pelo MMG Playback.
            Estamos comprometidos em manter transparência e segurança em todas as interações.
          </p>
        </section>
      </div>
    </div>
  );
};

export default SettingsPrivacy;
