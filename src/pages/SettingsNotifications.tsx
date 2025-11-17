import React from "react";
import { ArrowLeft, Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SettingsNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [newEventNotifications, setNewEventNotifications] = React.useState(true);
  const [playlistUpdates, setPlaylistUpdates] = React.useState(true);
  const [cifraImports, setCifraImports] = React.useState(false);
  const [maintenanceAlerts, setMaintenanceAlerts] = React.useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-16 pb-8 md:pt-0 md:pb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#1DB954]/10 p-3 rounded-lg">
            <Bell className="w-6 h-6 text-[#1DB954]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notificações</h1>
            <p className="text-white/60 text-sm">Controle alertas e avisos importantes</p>
          </div>
        </div>
        <p className="text-white/40 text-xs">Ajuste as comunicações enviadas pelo MMG Playback</p>
      </div>

      <div className="px-6 space-y-4">
        <section className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5 space-y-4">
          <h2 className="text-xl font-semibold">Alertas de eventos</h2>
          <p className="text-white/60 text-sm">
            Informe quando novos eventos ou ensaios forem criados, garantindo que todos saibam o repertório com antecedência.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Novos eventos</Label>
              <p className="text-white/50 text-xs">Receba avisos quando um evento for publicado.</p>
            </div>
            <Switch checked={newEventNotifications} onCheckedChange={setNewEventNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Atualizações de playlist</Label>
              <p className="text-white/50 text-xs">Avise quando a ordem das faixas for alterada.</p>
            </div>
            <Switch checked={playlistUpdates} onCheckedChange={setPlaylistUpdates} />
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5 space-y-4">
          <h2 className="text-xl font-semibold">Cifras e importações</h2>
          <p className="text-white/60 text-sm">
            Saiba quando novos materiais foram importados do CifraClub ou quando uma cifra foi corrigida manualmente.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Importação automática</Label>
              <p className="text-white/50 text-xs">Notifique quando uma cifra for sincronizada com sucesso.</p>
            </div>
            <Switch checked={cifraImports} onCheckedChange={setCifraImports} />
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5 space-y-4">
          <h2 className="text-xl font-semibold">Sistema</h2>
          <p className="text-white/60 text-sm">Alertas técnicos ajudam o time a manter o app estável.</p>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Avisos de manutenção</Label>
              <p className="text-white/50 text-xs">Seja avisado sobre atualizações programadas.</p>
            </div>
            <Switch checked={maintenanceAlerts} onCheckedChange={setMaintenanceAlerts} />
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5 space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5 text-[#1DB954]" />
            Como as notificações funcionam?
          </h3>
          <ul className="text-white/60 text-sm space-y-2">
            <li>• Alertas são enviados por e-mail e notificações push (quando permitido).</li>
            <li>• Preferências podem ser alteradas a qualquer momento nesta tela.</li>
            <li>• Desabilitar todos os alertas pode impactar na comunicação dos ensaios.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SettingsNotifications;
