import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiePolicy() {
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
              <Cookie className="w-8 h-8 text-[#1DB954]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Política de Cookies</h1>
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
              <h2 className="text-2xl font-semibold text-white mb-4">1. O que são cookies?</h2>
              <p>
                Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você
                visita o SetlistGO™. Eles nos ajudam a melhorar sua experiência, lembrando suas preferências
                e entendendo como você usa nosso aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Tipos de cookies que usamos</h2>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.1. Cookies Essenciais</h3>
              <p>
                Necessários para o funcionamento básico do aplicativo, incluindo autenticação e segurança.
                Estes cookies não podem ser desativados.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Sessão de autenticação</li>
                <li>Preferências de segurança</li>
                <li>Proteção contra CSRF</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.2. Cookies de Preferências</h3>
              <p>
                Armazenam suas preferências e configurações para personalizar sua experiência.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Evento selecionado</li>
                <li>Preferências de visualização</li>
                <li>Configurações de notificação</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.3. Cookies de Performance</h3>
              <p>
                Coletam informações anônimas sobre como você usa o aplicativo para nos ajudar a melhorar.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Análise de uso de páginas</li>
                <li>Tempo de carregamento</li>
                <li>Erros e problemas técnicos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Gerenciamento de cookies</h2>
              <p>
                Você pode controlar e/ou deletar cookies como desejar. Você pode deletar todos os cookies
                que já estão no seu dispositivo e pode configurar a maioria dos navegadores para impedir
                que eles sejam armazenados.
              </p>
              <p className="mt-4">
                No entanto, se você fizer isso, pode ter que ajustar manualmente algumas preferências toda
                vez que visitar o aplicativo, e alguns serviços e funcionalidades podem não funcionar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Cookies de terceiros</h2>
              <p>
                Utilizamos serviços de terceiros que podem armazenar cookies no seu dispositivo:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Google OAuth:</strong> Para autenticação de usuários</li>
                <li><strong>Supabase:</strong> Para gerenciamento de sessões e banco de dados</li>
                <li><strong>YouTube:</strong> Para reprodução de vídeos musicais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Duração dos cookies</h2>
              <p>
                Utilizamos cookies de sessão (temporários) e cookies persistentes (permanecem no seu
                dispositivo por um período definido):
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li><strong>Sessão:</strong> Expiram quando você fecha o navegador</li>
                <li><strong>Persistentes:</strong> Permanecem por até 1 ano</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Suas escolhas</h2>
              <p>
                Ao usar o SetlistGO™, você concorda com o uso de cookies conforme descrito nesta política.
                Se você não concorda, pode:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                <li>Configurar seu navegador para bloquear cookies</li>
                <li>Limpar cookies existentes do seu dispositivo</li>
                <li>Usar o modo de navegação privada/anônima</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Atualizações desta política</h2>
              <p>
                Podemos atualizar esta Política de Cookies periodicamente. Notificaremos você sobre
                quaisquer mudanças significativas publicando a nova política nesta página com uma data
                de "última atualização" revisada.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Cookies, entre em contato conosco através
                das configurações do aplicativo.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
