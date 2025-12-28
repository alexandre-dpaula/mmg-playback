import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
              <FileText className="w-8 h-8 text-[#1DB954]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Termos de Serviço</h1>
              <p className="text-white/60 text-sm">Última atualização: 28 de dezembro de 2025</p>
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
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar o SetlistGO™ ("Serviço", "Aplicativo", "nós" ou "nosso"), você concorda
                em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar
                com qualquer parte destes termos, não deverá usar nosso Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Descrição do Serviço</h2>
              <p>
                O SetlistGO™ é uma plataforma digital que permite aos usuários:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Criar e gerenciar eventos musicais</li>
                <li>Organizar repertórios e setlists</li>
                <li>Acessar cifras e letras de músicas</li>
                <li>Visualizar vídeos e conteúdo relacionado</li>
                <li>Colaborar com outros membros da equipe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Cadastro e Conta de Usuário</h2>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">3.1. Elegibilidade</h3>
              <p>
                Você deve ter pelo menos 13 anos de idade para usar este Serviço. Ao se cadastrar, você
                declara que tem idade legal para formar um contrato vinculativo.
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">3.2. Informações da Conta</h3>
              <p>
                Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Fornecer informações verdadeiras, precisas e completas</li>
                <li>Manter e atualizar prontamente suas informações</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                <li>Ser responsável por todas as atividades que ocorram em sua conta</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">3.3. Tipos de Conta</h3>
              <p>Oferecemos diferentes níveis de acesso:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Gratuito:</strong> Acesso básico às funcionalidades</li>
                <li><strong>Premium:</strong> Recursos avançados mediante assinatura</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Uso Aceitável</h2>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.1. Você concorda em NÃO:</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Usar o Serviço para qualquer finalidade ilegal ou não autorizada</li>
                <li>Violar leis de direitos autorais, marcas registradas ou propriedade intelectual</li>
                <li>Transmitir vírus, malware ou código malicioso</li>
                <li>Tentar obter acesso não autorizado ao Serviço</li>
                <li>Interferir ou interromper o Serviço ou servidores</li>
                <li>Coletar informações de outros usuários sem consentimento</li>
                <li>Usar o Serviço para spam ou comunicação não solicitada</li>
                <li>Personificar qualquer pessoa ou entidade</li>
                <li>Vender, revender ou explorar comercialmente o Serviço sem autorização</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Conteúdo do Usuário</h2>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">5.1. Propriedade</h3>
              <p>
                Você mantém todos os direitos sobre o conteúdo que criar ou enviar ao SetlistGO™.
                Ao enviar conteúdo, você nos concede uma licença mundial, não exclusiva, livre de royalties
                para usar, armazenar e exibir seu conteúdo conforme necessário para operar o Serviço.
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">5.2. Responsabilidade</h3>
              <p>
                Você é o único responsável pelo conteúdo que envia. Você declara e garante que possui
                todos os direitos necessários para enviar o conteúdo e que ele não viola direitos de terceiros.
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">5.3. Conteúdo de Terceiros</h3>
              <p>
                O Serviço pode conter links para sites ou conteúdo de terceiros (como vídeos do YouTube,
                cifras do CifraClub). Não somos responsáveis pelo conteúdo de terceiros e não endossamos
                ou garantimos sua precisão.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Propriedade Intelectual</h2>
              <p>
                O SetlistGO™ e seu conteúdo original, recursos e funcionalidades são de propriedade
                exclusiva nossa e estão protegidos por leis de direitos autorais, marcas registradas
                e outras leis de propriedade intelectual.
              </p>
              <p className="mt-4">
                Você não pode copiar, modificar, distribuir, vender ou alugar qualquer parte de nosso
                Serviço sem nossa permissão expressa por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Assinaturas e Pagamentos</h2>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">7.1. Assinaturas Premium</h3>
              <p>
                Algumas funcionalidades podem exigir assinatura paga. Ao adquirir uma assinatura:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Você será cobrado no início do período de assinatura</li>
                <li>A assinatura renova automaticamente até o cancelamento</li>
                <li>Os preços estão sujeitos a alterações com aviso prévio</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">7.2. Cancelamento e Reembolsos</h3>
              <p>
                Você pode cancelar sua assinatura a qualquer momento através das configurações da conta.
                Reembolsos são processados de acordo com nossa política de reembolso vigente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Privacidade e Proteção de Dados</h2>
              <p>
                Sua privacidade é importante para nós. Nossa Política de Privacidade descreve como
                coletamos, usamos e protegemos suas informações pessoais em conformidade com a
                Lei Geral de Proteção de Dados (LGPD).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Rescisão</h2>
              <p>
                Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, se você
                violar estes Termos. Você pode encerrar sua conta a qualquer momento através das
                configurações.
              </p>
              <p className="mt-4">
                Após o encerramento, seu direito de usar o Serviço cessará imediatamente. Podemos
                reter certas informações conforme exigido por lei ou para fins comerciais legítimos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Isenções de Garantia</h2>
              <p>
                O SERVIÇO É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL", SEM GARANTIAS DE QUALQUER
                TIPO, EXPRESSAS OU IMPLÍCITAS. NÃO GARANTIMOS QUE O SERVIÇO SERÁ ININTERRUPTO, SEGURO
                OU LIVRE DE ERROS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Limitação de Responsabilidade</h2>
              <p>
                EM NENHUMA CIRCUNSTÂNCIA SEREMOS RESPONSÁVEIS POR DANOS INDIRETOS, INCIDENTAIS,
                ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS, INCLUINDO PERDA DE LUCROS, DADOS OU OUTROS
                INTANGÍVEIS, RESULTANTES DO USO OU INCAPACIDADE DE USAR O SERVIÇO.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Modificações dos Termos</h2>
              <p>
                Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos você
                sobre mudanças significativas por e-mail ou através do Serviço. Seu uso continuado após
                as mudanças constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Lei Aplicável</h2>
              <p>
                Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem
                consideração a conflitos de disposições legais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contato</h2>
              <p>
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco através
                das configurações do aplicativo.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
              <p className="text-sm text-white/60">
                <strong className="text-white">Aviso Importante:</strong> Ao usar o SetlistGO™, você
                reconhece que leu, compreendeu e concorda em estar vinculado a estes Termos de Serviço
                e à nossa Política de Privacidade.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
