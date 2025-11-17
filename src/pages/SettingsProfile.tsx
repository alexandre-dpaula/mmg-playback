import React, { useRef, useState } from "react";
import { ArrowLeft, LogOut, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SettingsProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut, uploadAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast.error("Não foi possível encerrar a sessão.");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadAvatar(file);
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar foto de perfil");
    } finally {
      setIsUploading(false);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white pt-16 pb-8 md:pt-0 md:pb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <img
              key={profile.avatarUrl}
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-[#1DB954]/40"
              crossOrigin="anonymous"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.src !== "/perfil.jpg") {
                  img.src = "/perfil.jpg";
                }
              }}
            />
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-[#1DB954] text-black rounded-full p-2 hover:bg-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Alterar foto de perfil"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm text-white/60">Perfil conectado</p>
            <h1 className="text-base font-semibold">{profile.name}</h1>
            <p className="text-white/70 text-sm">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <section className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5 space-y-3">
            <h2 className="text-lg font-semibold">Identidade</h2>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex justify-between">
                <span className="text-white/50">Nome completo</span>
                <span>{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Email</span>
                <span>{profile.email}</span>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-[#181818] to-[#101010] rounded-2xl p-5 border border-white/5 space-y-3">
            <h2 className="text-lg font-semibold">Conta</h2>
            <p className="text-white/70 text-sm">
              Essa conta está vinculada automaticamente ao Google ou Apple. Caso precise alterar informações,
              atualize diretamente no provedor de login.
            </p>
            <Button
              className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] gap-2 font-semibold h-12 text-base"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sair do aplicativo
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfile;
