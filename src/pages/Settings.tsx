import React from "react";
import { User, Bell, Shield, Info, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FooterBrand } from "@/components/FooterBrand";

type SettingItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  iconBg: string;
};

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const settingsItems: SettingItem[] = [
    {
      id: "profile",
      title: "Perfil",
      description: "Gerencie suas informações",
      icon: <User className="w-6 h-6 text-[#1DB954]" />,
      route: "/settings/profile",
      iconBg: "bg-[#1DB954]/10",
    },
    {
      id: "notifications",
      title: "Notificações",
      description: "Configure alertas e avisos",
      icon: <Bell className="w-6 h-6 text-[#1DB954]" />,
      route: "/settings/notifications",
      iconBg: "bg-[#1DB954]/10",
    },
    {
      id: "privacy",
      title: "Termos e Privacidade",
      description: "Regras de uso e proteção",
      icon: <Shield className="w-6 h-6 text-[#1DB954]" />,
      route: "/settings/privacy",
      iconBg: "bg-[#1DB954]/10",
    },
    {
      id: "about",
      title: "Sobre",
      description: "Versão e informações do app",
      icon: <Info className="w-6 h-6 text-[#1DB954]" />,
      route: "/settings/about",
      iconBg: "bg-[#1DB954]/10",
    },
  ];

  return (
    <div className="relative">
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-20 md:pt-0 pb-32 md:pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <header className="space-y-2 mb-6 sm:mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#1DB954] font-semibold">
            CONFIGURAÇÕES
          </p>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-white/60">Personalize sua experiência no aplicativo.</p>
        </header>

        {/* Settings List */}
        <div className="space-y-4">
          {settingsItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className="group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-px hover:border-[#1DB954]/40 hover:bg-[#1f1f1f] cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-r from-white/5 to-transparent" />

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0 h-12 w-12 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] shadow-inner shadow-black/50">
                {item.icon}
              </div>

              {/* Text */}
              <div className="relative z-10 flex-1 text-left min-w-0">
                <h3 className="text-lg font-medium text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/60">{item.description}</p>
              </div>

              {/* Arrow */}
              <ChevronRight className="relative z-10 w-5 h-5 text-white/40 group-hover:text-[#1DB954] transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
      </div>
      <FooterBrand />
    </div>
  );
};

export default Settings;
