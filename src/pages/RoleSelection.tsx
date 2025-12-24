import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Users, Mail, Check } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type RoleType = "lider" | "membro";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error("Selecione uma opção para continuar");
      return;
    }

    if (!user) {
      toast.error("Usuário não autenticado");
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      if (selectedRole === "lider") {
        // Líder: criar role e redirecionar para criar igreja
        const { error } = await supabase
          .from("users_app")
          .update({ role: "lider" })
          .eq("auth_user_id", user.id);

        if (error) throw error;

        toast.success("Bem-vindo, Líder! Vamos configurar sua igreja.");
        navigate("/onboarding/igreja");
      } else {
        // Membro: definir como pending e aguardar convite
        const { error } = await supabase
          .from("users_app")
          .update({ role: "pending" })
          .eq("auth_user_id", user.id);

        if (error) throw error;

        toast.success("Cadastro realizado! Aguarde o convite do seu líder.");
        navigate("/waiting-invitation");
      }
    } catch (error) {
      console.error("Erro ao definir role:", error);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <BrandLogo className="h-12" />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">
            Como você vai usar o SetlistGO™?
          </h1>
          <p className="text-white/60 text-lg">
            Escolha o tipo de conta que melhor se adequa ao seu papel
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Líder Card */}
          <button
            onClick={() => setSelectedRole("lider")}
            className={`relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-200 ${
              selectedRole === "lider"
                ? "bg-gradient-to-br from-[#1DB954]/20 to-[#1DB954]/5 border-2 border-[#1DB954] scale-105"
                : "bg-gradient-to-br from-[#181818] to-[#101010] border-2 border-white/10 hover:border-[#1DB954]/50"
            }`}
          >
            {/* Check icon */}
            {selectedRole === "lider" && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-black" />
              </div>
            )}

            {/* Icon */}
            <div className="w-16 h-16 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center mb-6">
              <Crown className="w-8 h-8 text-[#1DB954]" />
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-white mb-3">
              Sou Líder/Pastor
            </h3>
            <p className="text-white/70 mb-4">
              Vou criar e gerenciar uma igreja
            </p>

            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                Criar e gerenciar eventos
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                Convidar membros da equipe
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                Organizar cifras e repertórios
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                Gerenciar permissões
              </li>
            </ul>
          </button>

          {/* Membro Card */}
          <button
            onClick={() => setSelectedRole("membro")}
            className={`relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-200 ${
              selectedRole === "membro"
                ? "bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500 scale-105"
                : "bg-gradient-to-br from-[#181818] to-[#101010] border-2 border-white/10 hover:border-blue-500/50"
            }`}
          >
            {/* Check icon */}
            {selectedRole === "membro" && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-blue-500" />
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-white mb-3">
              Sou Membro
            </h3>
            <p className="text-white/70 mb-4">
              Vou participar de uma equipe existente
            </p>

            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Aguardar convite do líder
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Acessar repertórios da igreja
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Ver eventos e escalas
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Colaborar com a equipe
              </li>
            </ul>

            {/* Info */}
            <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
              <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-500/80">
                Você receberá um email quando o líder da sua igreja enviar o convite
              </p>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          className="w-full h-14 text-lg bg-[#1DB954] hover:bg-[#1DB954]/90 disabled:opacity-50"
        >
          {isLoading ? "Processando..." : "Continuar"}
        </Button>

        {/* Footer info */}
        <p className="text-center text-white/40 text-sm mt-6">
          Você poderá alterar essas configurações depois
        </p>
      </div>
    </div>
  );
}
