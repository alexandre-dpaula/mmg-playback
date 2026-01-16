/**
 * Component: UpgradePrompt
 * Prompt para upgrade quando usuário atinge limite do plano free
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, Zap, Music, Calendar, Users } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
  reason: 'events' | 'tracks' | 'rehearsal';
}

const REASONS = {
  events: {
    title: 'Limite de Eventos Atingido',
    description: 'Você atingiu o limite de 1 evento no plano gratuito.',
    icon: Calendar,
  },
  tracks: {
    title: 'Limite de Músicas Atingido',
    description: 'Você atingiu o limite de 1 música no plano gratuito.',
    icon: Music,
  },
  rehearsal: {
    title: 'Modo Ensaio Bloqueado',
    description: 'O Modo Ensaio é exclusivo para assinantes PRO.',
    icon: Lock,
  },
};

const PRO_FEATURES = [
  {
    icon: Calendar,
    title: 'Eventos Ilimitados',
    description: 'Crie quantos eventos quiser',
  },
  {
    icon: Music,
    title: 'Músicas Ilimitadas',
    description: 'Adicione todas as suas músicas',
  },
  {
    icon: Zap,
    title: 'Modo Ensaio',
    description: 'Ferramentas avançadas para ensaiar',
  },
  {
    icon: Users,
    title: 'Equipe Completa',
    description: 'Gerencie sua equipe sem limites',
  },
  {
    icon: Sparkles,
    title: 'Recursos Exclusivos',
    description: 'Acesso a todos os recursos PRO',
  },
];

export function UpgradePrompt({ open, onOpenChange, onUpgrade, reason }: UpgradePromptProps) {
  const reasonData = REASONS[reason];
  const ReasonIcon = reasonData.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-[#121212] to-black border-white/10">
        <DialogHeader className="pb-6 border-b border-white/10">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#1DB954]/20 blur-xl rounded-full" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-[#1DB954] to-emerald-500 rounded-2xl flex items-center justify-center">
                <ReasonIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">{reasonData.title}</h2>
            <p className="text-white/60 text-base font-normal">{reasonData.description}</p>
          </DialogTitle>
        </DialogHeader>

        {/* Pricing */}
        <div className="py-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1DB954]/20 to-emerald-500/10 border border-[#1DB954]/30 p-8">
            <div className="absolute top-4 right-4">
              <div className="bg-[#1DB954] text-white text-xs font-bold px-3 py-1 rounded-full">
                MELHOR VALOR
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-2 mb-2">
                <span className="text-white">Assinar</span>
                <BrandLogo variant="inline" inlineSize="lg" />
                <span className="bg-gradient-to-r from-[#1DB954] to-emerald-400 bg-clip-text text-transparent font-bold">
                  PRO
                </span>
              </div>

              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-black text-white">R$ 9,98</span>
                <span className="text-xl text-white/60 font-medium">/mês</span>
              </div>

              <p className="text-sm text-white/70">Cancele quando quiser</p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {PRO_FEATURES.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#1DB954]/20 rounded-lg flex items-center justify-center">
                      <FeatureIcon className="w-4 h-4 text-[#1DB954]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">{feature.title}</h4>
                      <p className="text-xs text-white/60">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-[#1DB954] to-emerald-500 hover:from-[#1DB954]/90 hover:to-emerald-500/90 text-white font-semibold py-6 rounded-xl shadow-lg shadow-[#1DB954]/20 transition-all hover:shadow-xl hover:shadow-[#1DB954]/30 hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Assinar Agora
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/40 pt-4 border-t border-white/10">
          <p>💳 Pagamento 100% seguro via Stripe</p>
          <p className="mt-1">✨ Acesso imediato após confirmação do pagamento</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
