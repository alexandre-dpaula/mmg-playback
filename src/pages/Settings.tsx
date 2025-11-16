import React from "react";
import { User, Bell, Shield, Info, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-16 pb-24 md:pt-0 md:pb-0">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <p className="text-sm text-[#1DB954] font-semibold tracking-wider uppercase mb-2">
          CONFIGURAÇÕES
        </p>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-white/60">Personalize sua experiência no aplicativo.</p>
      </div>

      {/* Settings List */}
      <div className="px-6 space-y-3">
        {settingsItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.route)}
            className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-4 flex items-center gap-4 transition-all border border-white/10 hover:border-white/20"
          >
            {/* Icon */}
            <div className={`${item.iconBg} p-3 rounded-lg`}>
              {item.icon}
            </div>

            {/* Text */}
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-white/60">{item.description}</p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Settings;
