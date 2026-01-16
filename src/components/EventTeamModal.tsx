import React, { useState, useEffect, useMemo } from "react";
import { X, Search, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface EventTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  selectedMembers?: Array<{profileId: string; role: string}>;
  onMembersChange?: (members: Array<{profileId: string; role: string}>) => void;
  onSuccess?: () => void;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface SelectedMember {
  profileId: string;
  role: "vocal" | "instrumental" | "multimedia";
}

type RoleType = "vocal" | "instrumental" | "multimedia";

const ROLE_LABELS: Record<RoleType, string> = {
  vocal: "Vocal",
  instrumental: "Instrumental",
  multimedia: "Multimídia",
};

const ROLE_COLORS: Record<RoleType, string> = {
  vocal: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  instrumental: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  multimedia: "bg-orange-500/20 text-orange-400 border-orange-500/40",
};

export const EventTeamModal: React.FC<EventTeamModalProps> = ({
  isOpen,
  onClose,
  eventId,
  selectedMembers: externalSelectedMembers,
  onMembersChange,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modo de operação: se tem eventId real (não "temp"), salva no banco. Senão, só gerencia estado local
  const isEditMode = eventId !== "temp";

  // Busca todos os perfis e membros do evento
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      return;
    }

    fetchData();
  }, [isOpen, eventId]);

  // Sincroniza com selectedMembers externos (quando vem do EventFormModal)
  useEffect(() => {
    if (externalSelectedMembers && !isEditMode) {
      setSelectedMembers(externalSelectedMembers.map(m => ({
        profileId: m.profileId,
        role: m.role as RoleType
      })));
    }
  }, [externalSelectedMembers, isEditMode]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Busca o church_id do usuário atual na tabela users_app
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data: currentUserApp, error: userAppError } = await supabase
        .from("users_app")
        .select("church_id")
        .eq("auth_user_id", user.id)
        .single();

      if (userAppError) throw userAppError;

      if (!currentUserApp?.church_id) {
        toast.error("Você não está vinculado a uma igreja");
        setAllProfiles([]);
        return;
      }

      // Busca APENAS usuários da mesma igreja via users_app
      const { data: usersApp, error: usersAppError } = await supabase
        .from("users_app")
        .select("auth_user_id, full_name, email")
        .eq("church_id", currentUserApp.church_id)
        .order("full_name");

      if (usersAppError) throw usersAppError;

      // Busca avatares dos perfis correspondentes
      const userIds = usersApp?.map(u => u.auth_user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", userIds);

      // Combina dados de users_app com avatares de profiles
      const profiles = usersApp?.map(userApp => {
        const profileData = profilesData?.find(p => p.id === userApp.auth_user_id);
        return {
          id: userApp.auth_user_id,
          full_name: userApp.full_name,
          email: userApp.email,
          avatar_url: profileData?.avatar_url || null,
        };
      }) || [];

      setAllProfiles(profiles);

      // Se está editando um evento existente, busca os membros do banco
      if (isEditMode) {
        const { data: members, error: membersError } = await supabase
          .from("event_members")
          .select("profile_id, role")
          .eq("event_id", eventId);

        if (membersError) throw membersError;

        setSelectedMembers(
          (members || []).map((m) => ({
            profileId: m.profile_id,
            role: m.role as RoleType,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar membros disponíveis");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra perfis com base na busca
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return allProfiles;

    const query = searchQuery.toLowerCase();
    return allProfiles.filter(
      (p) =>
        p.full_name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
    );
  }, [allProfiles, searchQuery]);

  const handleToggleMember = (profileId: string, currentRole?: RoleType) => {
    if (isSaving) return;

    setSelectedMembers((prev) => {
      const existing = prev.find((m) => m.profileId === profileId);

      if (!existing) {
        // Adiciona com papel padrão "vocal"
        return [...prev, { profileId, role: "vocal" }];
      }

      if (currentRole && existing.role !== currentRole) {
        // Altera o papel
        return prev.map((m) =>
          m.profileId === profileId ? { ...m, role: currentRole } : m
        );
      }

      // Remove da seleção
      return prev.filter((m) => m.profileId !== profileId);
    });
  };

  const handleRoleChange = (profileId: string, newRole: RoleType) => {
    if (isSaving) return;

    setSelectedMembers((prev) =>
      prev.map((m) => (m.profileId === profileId ? { ...m, role: newRole } : m))
    );
  };

  const handleSave = async () => {
    // Modo criação: apenas atualiza o estado do componente pai
    if (!isEditMode && onMembersChange) {
      onMembersChange(selectedMembers.map(m => ({
        profileId: m.profileId,
        role: m.role
      })));
      onSuccess?.();
      onClose();
      return;
    }

    // Modo edição: salva no banco de dados
    setIsSaving(true);
    const savingToast = toast.loading("Salvando equipe...");

    try {
      // Remove todos os membros existentes
      const { error: deleteError } = await supabase
        .from("event_members")
        .delete()
        .eq("event_id", eventId);

      if (deleteError) throw deleteError;

      // Adiciona os membros selecionados
      if (selectedMembers.length > 0) {
        const membersToInsert = selectedMembers.map((m) => ({
          event_id: eventId,
          profile_id: m.profileId,
          role: m.role,
        }));

        const { error: insertError } = await supabase
          .from("event_members")
          .insert(membersToInsert);

        if (insertError) throw insertError;
      }

      toast.success("Equipe salva com sucesso!", { id: savingToast });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar equipe:", error);
      toast.error("Não foi possível salvar a equipe", { id: savingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const getMemberRole = (profileId: string): RoleType | undefined => {
    return selectedMembers.find((m) => m.profileId === profileId)?.role;
  };

  const isSelected = (profileId: string): boolean => {
    return selectedMembers.some((m) => m.profileId === profileId);
  };

  // Conta membros por papel
  const countByRole = useMemo(() => {
    const counts: Record<RoleType, number> = {
      vocal: 0,
      instrumental: 0,
      multimedia: 0,
    };

    selectedMembers.forEach((m) => {
      counts[m.role]++;
    });

    return counts;
  }, [selectedMembers]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="team-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <motion.div
            key="team-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-3xl max-h-[90vh] bg-[#121212] rounded-2xl flex flex-col shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 id="team-modal-title" className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Equipe do Evento
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  Selecione os membros e defina seus papéis
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isSaving}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search */}
            <div className="p-5 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  disabled={isSaving}
                  autoFocus
                />
              </div>
            </div>

            {/* Content - Lista de Membros */}
            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1DB954]" />
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Users className="h-12 w-12 text-white/20 mb-3" />
                  <p className="text-white/60">
                    {searchQuery
                      ? "Nenhum membro encontrado"
                      : "Nenhum membro disponível"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProfiles.map((profile) => {
                    const selected = isSelected(profile.id);
                    const currentRole = getMemberRole(profile.id);

                    return (
                      <div
                        key={profile.id}
                        className={`rounded-xl border transition-all ${
                          selected
                            ? "bg-[#1DB954]/10 border-[#1DB954]/40"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {/* Card do membro */}
                        <button
                          type="button"
                          onClick={() => handleToggleMember(profile.id)}
                          disabled={isSaving}
                          className="w-full p-4 flex items-center gap-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name || "Avatar"}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0 ${
                                selected
                                  ? "bg-[#1DB954]/20 text-[#1DB954]"
                                  : "bg-white/10 text-white/70"
                              }`}
                            >
                              {(
                                profile.full_name?.[0] ||
                                profile.email?.[0] ||
                                "?"
                              ).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate">
                              {profile.full_name || "Sem nome"}
                            </h3>
                            <p className="text-xs text-white/60 truncate">
                              {profile.email}
                            </p>
                          </div>
                          {selected && currentRole && (
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[currentRole]}`}
                            >
                              {ROLE_LABELS[currentRole]}
                            </div>
                          )}
                        </button>

                        {/* Botões de papel - mostrado apenas se selecionado */}
                        {selected && (
                          <div className="px-4 pb-4 flex gap-2">
                            {(Object.keys(ROLE_LABELS) as RoleType[]).map((role) => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => handleRoleChange(profile.id, role)}
                                disabled={isSaving}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                                  currentRole === role
                                    ? ROLE_COLORS[role]
                                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                                }`}
                              >
                                {ROLE_LABELS[role]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 flex justify-between items-center">
              <div className="text-sm text-white/60">
                {selectedMembers.length}{" "}
                {selectedMembers.length === 1
                  ? "membro selecionado"
                  : "membros selecionados"}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="bg-white/10 text-white hover:bg-white/20 border-0"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#1DB954] text-black hover:bg-[#1ed760] font-semibold px-8"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Equipe"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
