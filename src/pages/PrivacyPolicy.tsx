import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-20 md:pt-0 pb-32 md:pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-[#1DB954]/10">
              <Shield className="w-8 h-8 text-[#1DB954]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Política de Privacidade</h1>
              <p className="text-white/60 text-sm">Última atualização: 28 de dezembro de 2025</p>
              <p className="text-white/60 text-sm">Conforme Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="prose prose-invert max-w-none"
        >
          <div className="space-y-8 text-white/80 leading-relaxed">
            <section className="bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Compromisso com sua Privacidade</h2>
              <p>
                O SetlistGO™ está comprometido em proteger sua privacidade e seus dados pessoais em
                conformidade com a Lei Geral de Proteção de Dados (LGPD). Esta política descreve como
                coletamos, usamos, armazenamos e protegemos suas informações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Identificação do Controlador de Dados</h2>
              <p>
                Para fins da LGPD, o SetlistGO™ atua como controlador de dados em relação às informações
                pessoais coletadas através do nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Dados Pessoais que Coletamos</h2>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.1. Dados Fornecidos Diretamente por Você</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Informações de Cadastro:</strong> Nome completo, e-mail, senha (criptografada)</li>
                <li><strong>Foto de Perfil:</strong> Imagem de avatar (opcional)</li>
                <li><strong>Informações da Igreja/Organização:</strong> Nome, telefone de contato</li>
                <li><strong>Conteúdo Criado:</strong> Eventos, setlists, anotações musicais</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.2. Dados Coletados Automaticamente</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Dados de Uso:</strong> Páginas visitadas, recursos utilizados, tempo de sessão</li>
                <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional, dispositivo</li>
                <li><strong>Cookies:</strong> Conforme descrito em nossa Política de Cookies</li>
                <li><strong>Dados de Localização:</strong> Apenas com seu consentimento explícito</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.3. Dados de Terceiros</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Google OAuth:</strong> Nome, e-mail, foto de perfil (com seu consentimento)</li>
                <li><strong>CifraClub:</strong> Informações públicas de cifras e músicas</li>
                <li><strong>YouTube:</strong> Metadados de vídeos musicais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Base Legal e Finalidade do Tratamento</h2>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">3.1. Execução de Contrato (Art. 7º, V da LGPD)</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                    <li>Criar e manter sua conta de usuário</li>
                    <li>Fornecer acesso às funcionalidades do aplicativo</li>
                    <li>Processar assinaturas e pagamentos</li>
                    <li>Gerenciar eventos e repertórios musicais</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">3.2. Legítimo Interesse (Art. 7º, IX da LGPD)</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                    <li>Melhorar e otimizar nosso serviço</li>
                    <li>Prevenir fraudes e garantir segurança</li>
                    <li>Realizar análises estatísticas e pesquisas</li>
                    <li>Enviar comunicações importantes sobre o serviço</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">3.3. Consentimento (Art. 7º, I da LGPD)</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                    <li>Enviar comunicações de marketing (você pode revogar a qualquer momento)</li>
                    <li>Compartilhar dados com parceiros (com opt-in explícito)</li>
                    <li>Usar dados de localização</li>
                  </ul>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">3.4. Cumprimento de Obrigação Legal (Art. 7º, II da LGPD)</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                    <li>Cumprir requisitos fiscais e contábeis</li>
                    <li>Atender ordens judiciais e requisições de autoridades</li>
                    <li>Manter registros para fins regulatórios</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Compartilhamento de Dados</h2>
              <p>
                Não vendemos suas informações pessoais. Compartilhamos dados apenas quando necessário:
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.1. Provedores de Serviço</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Supabase:</strong> Hospedagem de banco de dados e autenticação</li>
                <li><strong>Vercel:</strong> Hospedagem da aplicação web</li>
                <li><strong>Gateway de Pagamento:</strong> Processamento de assinaturas (quando aplicável)</li>
              </ul>
              <p className="mt-2 text-sm">
                Todos os provedores são contratualmente obrigados a proteger seus dados e usá-los apenas
                conforme nossas instruções.
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.2. Membros da Igreja/Equipe</h3>
              <p>
                Dados de eventos e repertórios são compartilhados com outros membros da mesma igreja/organização
                conforme suas permissões de acesso.
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.3. Requisições Legais</h3>
              <p>
                Podemos divulgar seus dados se exigido por lei, ordem judicial ou para proteger nossos
                direitos legais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Transferência Internacional de Dados</h2>
              <p>
                Alguns de nossos provedores de serviço podem estar localizados fora do Brasil. Ao usar
                nosso serviço, você consente com a transferência de seus dados para outros países,
                garantindo que:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Utilizamos apenas provedores que oferecem nível adequado de proteção de dados</li>
                <li>Implementamos cláusulas contratuais padrão aprovadas pela ANPD</li>
                <li>Seus dados são protegidos com as mesmas garantias da LGPD</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Segurança dos Dados</h2>
              <p>
                Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Criptografia:</strong> Dados em trânsito (HTTPS/TLS) e em repouso</li>
                <li><strong>Autenticação Segura:</strong> Senhas com hash bcrypt, autenticação de dois fatores</li>
                <li><strong>Controle de Acesso:</strong> Políticas de menor privilégio (RLS)</li>
                <li><strong>Monitoramento:</strong> Logs de auditoria e detecção de anomalias</li>
                <li><strong>Backup:</strong> Backups regulares e planos de recuperação</li>
                <li><strong>Testes de Segurança:</strong> Avaliações periódicas de vulnerabilidades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Retenção de Dados</h2>
              <p>
                Mantemos seus dados pessoais apenas pelo tempo necessário para as finalidades descritas:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Conta Ativa:</strong> Durante todo o período que sua conta estiver ativa</li>
                <li><strong>Conta Inativa:</strong> Até 12 meses após inatividade, então excluída automaticamente</li>
                <li><strong>Dados Fiscais:</strong> 5 anos conforme exigência legal</li>
                <li><strong>Logs de Segurança:</strong> 6 meses para fins de auditoria</li>
                <li><strong>Dados Agregados:</strong> Indefinidamente em forma anônima para análises estatísticas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Seus Direitos sob a LGPD</h2>
              <p>
                Você tem os seguintes direitos em relação aos seus dados pessoais (Art. 18 da LGPD):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">📋 Confirmação e Acesso</h4>
                  <p className="text-sm">Confirmar se tratamos seus dados e acessá-los</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">✏️ Correção</h4>
                  <p className="text-sm">Corrigir dados incompletos, inexatos ou desatualizados</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🗑️ Eliminação</h4>
                  <p className="text-sm">Solicitar exclusão de dados desnecessários ou tratados inadequadamente</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">📦 Portabilidade</h4>
                  <p className="text-sm">Receber seus dados em formato estruturado e interoperável</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🔒 Anonimização/Bloqueio</h4>
                  <p className="text-sm">Solicitar anonimização ou bloqueio de dados</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">❌ Revogação de Consentimento</h4>
                  <p className="text-sm">Revogar consentimento a qualquer momento</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">ℹ️ Informações sobre Compartilhamento</h4>
                  <p className="text-sm">Saber com quem compartilhamos seus dados</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🚫 Oposição</h4>
                  <p className="text-sm">Opor-se ao tratamento realizado sem consentimento</p>
                </div>
              </div>

              <div className="mt-6 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">🎯 Como Exercer Seus Direitos</h4>
                <p className="text-sm">
                  Para exercer qualquer um desses direitos, acesse as <strong>Configurações</strong> do
                  aplicativo ou entre em contato através do canal de suporte. Responderemos sua solicitação
                  em até 15 dias, conforme Art. 18, §3º da LGPD.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Dados de Menores</h2>
              <p>
                Nosso serviço não é direcionado a menores de 13 anos. Se tomarmos conhecimento de que
                coletamos dados de menores sem consentimento dos pais/responsáveis, tomaremos medidas
                para excluir essas informações.
              </p>
              <p className="mt-4">
                Para usuários entre 13 e 18 anos, recomendamos que utilizem o serviço sob supervisão
                de pais ou responsáveis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Cookies e Tecnologias Similares</h2>
              <p>
                Utilizamos cookies e tecnologias similares conforme descrito em nossa Política de Cookies.
                Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em
                nossas práticas ou requisitos legais. Notificaremos você sobre alterações significativas:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Por e-mail (para mudanças substanciais)</li>
                <li>Através de notificação no aplicativo</li>
                <li>Atualizando a data de "última atualização" no topo desta página</li>
              </ul>
              <p className="mt-4">
                Recomendamos que você revise esta política periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Encarregado de Proteção de Dados (DPO)</h2>
              <p>
                Nomeamos um Encarregado de Proteção de Dados (Data Protection Officer - DPO) conforme
                Art. 41 da LGPD. Para questões relacionadas à privacidade e proteção de dados, você pode
                entrar em contato através do canal de suporte nas configurações do aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Reclamações à ANPD</h2>
              <p>
                Sem prejuízo de qualquer outro recurso administrativo ou judicial, você tem o direito de
                apresentar uma reclamação à Autoridade Nacional de Proteção de Dados (ANPD) se acreditar
                que o tratamento de seus dados pessoais viola a LGPD.
              </p>
              <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm">
                  <strong>ANPD - Autoridade Nacional de Proteção de Dados</strong><br />
                  Website: <a href="https://www.gov.br/anpd" className="text-[#1DB954] underline" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contato</h2>
              <p>
                Para dúvidas, solicitações ou reclamações sobre esta Política de Privacidade ou sobre
                como tratamos seus dados pessoais, entre em contato através do canal de suporte disponível
                nas configurações do aplicativo.
              </p>
            </section>

            <section className="bg-gradient-to-r from-[#1DB954]/20 to-purple-500/20 border border-[#1DB954]/30 rounded-xl p-6 mt-8">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-[#1DB954] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Seu Consentimento</h3>
                  <p className="text-sm text-white/80">
                    Ao usar o SetlistGO™, você consente com a coleta e uso de informações conforme descrito
                    nesta Política de Privacidade. Se você não concorda com esta política, por favor, não
                    use nosso serviço.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
