import React from "react";
import { ArrowLeft, Info, Github, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsAbout: React.FC = () => {
  const navigate = useNavigate();
  const appVersion = "1.0.0";
  const buildDate = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pb-24">
      {/* Header */}
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
            <Info className="w-6 h-6 text-[#1DB954]" />
          </div>
          <h1 className="text-3xl font-bold">Sobre</h1>
        </div>
        <p className="text-white/60">Versão e informações do aplicativo</p>
      </div>

      {/* Content */}
      <div className="px-6 space-y-4">
        {/* App Info Card */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
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
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-lg font-semibold mb-3">Sobre o App</h3>
          <p className="text-white/70 leading-relaxed">
            Aplicativo desenvolvido para organizar e facilitar o acesso às cifras,
            áudios e materiais de ensaio vocal do Ministério de Música.
            Integrado com Google Sheets e Supabase para gerenciamento em tempo real.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-lg font-semibold mb-3">Funcionalidades</h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-[#1DB954] mt-1">•</span>
              <span>Player de áudio com pads por tonalidade</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1DB954] mt-1">•</span>
              <span>Visualização de cifras extraídas do CifraClub</span>
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

        {/* Tech Stack Card */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-lg font-semibold mb-3">Tecnologias</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
              <span>React + TypeScript</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
              <span>Vite</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
              <span>Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
              <span>Supabase</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
              <span>Google Apps Script</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-2 h-2 bg-[#1DB954] rounded-full"></div>
              <span>React Query</span>
            </div>
          </div>
        </div>

        {/* Links Card */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-lg font-semibold mb-3">Links</h3>
          <div className="space-y-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 text-white/70 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                <span>Código Fonte</span>
              </div>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-4 text-white/40 text-sm">
          <p>© 2025 MMG - Ensaio Vocal</p>
          <p className="mt-1">Desenvolvido com ❤️ para o Ministério de Música</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsAbout;
