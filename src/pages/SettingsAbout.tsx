import React from "react";
import { ArrowLeft, Info } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from "react-router-dom";

const SettingsAbout: React.FC = () => {
  const navigate = useNavigate();
  const appVersion = "1.0.0";
  const buildDate = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-20 md:pt-0 pb-8 md:pb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#1DB954]/10 p-3 rounded-lg">
            <Info className="w-6 h-6 text-[#1DB954]" />
          </div>
          <h1 className="text-3xl font-bold">Sobre</h1>
        </div>
        <p className="text-white/60 mb-8">Versão e informações do aplicativo</p>

        {/* Content */}
        <div className="space-y-4">
        {/* App Info Card */}
        <div className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5">
          <h2 className="text-xl font-semibold mb-4">MMG - Ensaio Vocal</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/60">Versão</span>
              <span className="font-semibold">{appVersion}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/60">Data de Build</span>
              <span className="font-semibold">{buildDate}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-white/60">Plataforma</span>
              <span className="font-semibold">Web / PWA</span>
            </div>
          </div>
        </div>

        {/* Description Card */}
        <div className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5">
          <h3 className="text-lg font-semibold mb-3">Sobre o App</h3>
          <p className="text-white/70 leading-relaxed">
            Aplicativo desenvolvido para organizar e facilitar o acesso às cifras,
            áudios e materiais de ensaio vocal do Ministério de Música.
            Integrado com Google Sheets e Supabase para gerenciamento em tempo real.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5">
          <h3 className="text-lg font-semibold mb-3">Funcionalidades</h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-[#1DB954] mt-1">•</span>
              <span>Player de áudio com pads por tonalidade</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1DB954] mt-1">•</span>
              <span>Visualização de cifras online</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1DB954] mt-1">•</span>
              <span>Editor de cifras em tempo real</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1DB954] mt-1">•</span>
              <span>Sincronização com Google Sheets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1DB954] mt-1">•</span>
              <span>Upload e gerenciamento de áudios</span>
            </li>
          </ul>
        </div>


        <div className="pt-4">
          <MadeWithDyad />
        </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAbout;
