import React from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Info } from "lucide-react";

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-white pb-24">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <header className="space-y-2 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1DB954]">
            Configurações
          </p>
          <h1 className="text-3xl font-semibold">Configurações</h1>
          <p className="text-white/70">
            Personalize sua experiência no aplicativo.
          </p>
        </header>

        <div className="space-y-4">
          <div className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#1DB954]" />
              <div>
                <p className="font-semibold">Perfil</p>
                <p className="text-sm text-white/70">Gerencie suas informações</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#1DB954]" />
              <div>
                <p className="font-semibold">Notificações</p>
                <p className="text-sm text-white/70">Configure alertas e avisos</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#1DB954]" />
              <div>
                <p className="font-semibold">Privacidade</p>
                <p className="text-sm text-white/70">Controle seus dados</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-[#1DB954]" />
              <div>
                <p className="font-semibold">Sobre</p>
                <p className="text-sm text-white/70">Versão e informações do app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
