import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Clock, RefreshCw, LogOut, Check, X, Church } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useInvitations } from "@/hooks/useInvitations";
import { useAuth } from "@/context/AuthContext";

interface InvitationWithChurch {
  id: string;
  church_id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  churches: {
    name: string;
  };
}

export default function WaitingInvitation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { acceptInvitation, rejectInvitation } = useInvitations();
  const [invitations, setInvitations] = useState<InvitationWithChurch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*, churches(name)')
        .eq('email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      toast.error('Erro ao carregar convites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  const handleAccept = async (invitationId: string) => {
    setAcceptingId(invitationId);
    const success = await acceptInvitation(invitationId);
    if (success) {
      // Navegação será feita pelo hook após reload
    } else {
      setAcceptingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    const success = await rejectInvitation(invitationId);
    if (success) {
      await fetchInvitations();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      vocal: "Vocal",
      instrumental: "Instrumental",
      multimidia: "Multimídia",
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      vocal: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      instrumental: "bg-purple-500/20 text-purple-500 border-purple-500/30",
      multimidia: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    };
    return colors[role] || "bg-white/10 text-white/60 border-white/20";
  };

  const hasInvitations = invitations.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <BrandLogo className="h-12" />
        </div>

        {hasInvitations ? (
          <>
            {/* Title - Tem convites */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-[#1DB954]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-12 h-12 text-[#1DB954]" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Você tem convites pendentes! 🎉
              </h1>
              <p className="text-white/60 text-lg">
                Escolha uma igreja para fazer parte da equipe
              </p>
            </div>

            {/* Invitations List */}
            <div className="space-y-4 mb-8">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-gradient-to-br from-[#181818] to-[#101010] border border-white/10 rounded-2xl p-6 hover:border-[#1DB954]/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-[#1DB954]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Church className="w-6 h-6 text-[#1DB954]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {invitation.churches.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${getRoleBadgeColor(
                              invitation.role
                            )}`}
                          >
                            {getRoleLabel(invitation.role)}
                          </span>
                          <span className="text-xs text-white/40">
                            Enviado em{" "}
                            {new Date(invitation.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-white/60">
                          Expira em{" "}
                          {new Date(invitation.expires_at).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(invitation.id)}
                        className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                        disabled={acceptingId !== null}
                      >
                        <X className="w-4 h-4" />
                        Recusar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(invitation.id)}
                        className="gap-2 bg-[#1DB954] hover:bg-[#1DB954]/90 text-black"
                        disabled={acceptingId !== null}
                      >
                        <Check className="w-4 h-4" />
                        {acceptingId === invitation.id ? "Aceitando..." : "Aceitar"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Title - Sem convites */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-12 h-12 text-blue-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Aguardando Convite
              </h1>
              <p className="text-white/60 text-lg mb-8">
                Você se cadastrou como membro. Entre em contato com o líder da sua igreja para receber o convite de acesso.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-br from-[#181818] to-[#101010] border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4 text-left">
                <Clock className="w-6 h-6 text-[#1DB954] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    Como funciona?
                  </h3>
                  <ol className="text-white/60 text-sm space-y-2">
                    <li>1. O líder da igreja envia um convite para o seu email</li>
                    <li>2. O convite aparecerá aqui automaticamente</li>
                    <li>3. Aceite o convite para fazer parte da equipe</li>
                    <li>4. Pronto! Você terá acesso total ao sistema</li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={fetchInvitations}
            variant="outline"
            className="gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Carregando..." : "Atualizar"}
          </Button>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {/* Footer */}
        <p className="text-white/40 text-sm mt-8 text-center">
          Problemas? Entre em contato com o suporte: <br />
          <a
            href="mailto:suporte@setlistgo.com"
            className="text-[#1DB954] hover:underline"
          >
            suporte@setlistgo.com
          </a>
        </p>
      </div>
    </div>
  );
}
