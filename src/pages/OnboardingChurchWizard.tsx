import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";
import { PhoneInput } from "@/components/ui/phone-input";

const STEP_FLOW = [
  { id: 1, title: "Dados da Igreja" },
  { id: 2, title: "Líder da Igreja" },
  { id: 3, title: "Equipes" },
  { id: 4, title: "Revisão" },
] as const;

type StepId = (typeof STEP_FLOW)[number]["id"];

const DEFAULT_TEAM_OPTIONS = [
  { id: "vocal", label: "Vocal" },
  { id: "instrumental", label: "Instrumental" },
  { id: "multimidia", label: "Multimídia" },
];

interface ChurchFormData {
  name: string;
  city: string;
  pastorName: string;
  pastorContact: string;
}

interface LeaderProfile {
  authUserId: string;
  userAppId: string | null;
  name: string;
  email: string;
}

interface ExistingChurch {
  id: string;
  name: string;
  city: string | null;
  primary_color: string | null;
  pastor_name: string | null;
  pastor_phone: string | null;
  teams: { id: string; name: string }[];
}

interface TeamMembership {
  id: string;
  role: string;
  team: { id: string; name: string } | null;
  user: { id: string; full_name: string | null; email: string | null } | null;
}

interface UserDirectoryItem {
  id: string;
  full_name: string | null;
  email: string | null;
  church_id: string | null;
}

const DEFAULT_PRIMARY_COLOR = "#1DB954";

const OnboardingChurchWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<StepId>(1);
  const [churchData, setChurchData] = React.useState<ChurchFormData>({
    name: "",
    city: "",
    pastorName: "",
    pastorContact: "",
  });
  const [leaderProfile, setLeaderProfile] = React.useState<LeaderProfile | null>(null);
  const [selectedDefaultTeams, setSelectedDefaultTeams] = React.useState<string[]>(
    () => DEFAULT_TEAM_OPTIONS.map((team) => team.label)
  );
  const [extraTeams, setExtraTeams] = React.useState<string[]>([]);
  const [newTeamName, setNewTeamName] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingLeader, setIsLoadingLeader] = React.useState(true);
  const [leaderLoadError, setLeaderLoadError] = React.useState<string | null>(null);
  const [existingChurch, setExistingChurch] = React.useState<ExistingChurch | null>(null);
  const [isLoadingChurch, setIsLoadingChurch] = React.useState(false);
  const [isEditingExisting, setIsEditingExisting] = React.useState(false);
  const [teamMembers, setTeamMembers] = React.useState<TeamMembership[]>([]);
  const [memberError, setMemberError] = React.useState<string | null>(null);
  const [isSavingMember, setIsSavingMember] = React.useState(false);
  const [newMemberName, setNewMemberName] = React.useState("");
  const [newMemberEmail, setNewMemberEmail] = React.useState("");
  const [newMemberTeamId, setNewMemberTeamId] = React.useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = React.useState<UserDirectoryItem[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = React.useState(false);
  const [editingMemberId, setEditingMemberId] = React.useState<string | null>(null);
  const [editingMemberTeams, setEditingMemberTeams] = React.useState<string[]>([]);
  const [allChurchMembers, setAllChurchMembers] = React.useState<UserDirectoryItem[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = React.useState("");
  const [selectedTeamFilter, setSelectedTeamFilter] = React.useState<string | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = React.useState(false);

  const loadAllChurchMembers = React.useCallback(
    async (churchId: string) => {
      try {
        const { data, error } = await supabase
          .from("users_app")
          .select("id, full_name, email")
          .eq("church_id", churchId);

        if (error) throw error;
        setAllChurchMembers(data ?? []);
      } catch (error) {
        console.error("Erro ao carregar membros da igreja:", error);
        setAllChurchMembers([]);
      }
    },
    []
  );

  const loadTeamMembers = React.useCallback(
    async (churchId: string) => {
      try {
        const { data, error } = await supabase
          .from("user_team")
          .select(
            `
            id,
            role,
            team:teams ( id, name ),
            user:users_app ( id, full_name, email )
          `
          )
          .eq("church_id", churchId);

        if (error) throw error;
        setTeamMembers(data ?? []);
      } catch (error) {
        console.error("Erro ao carregar membros:", error);
        setTeamMembers([]);
      }
    },
    []
  );

  const loadAvailableUsers = React.useCallback(
    async (churchId?: string | null) => {
      setIsLoadingDirectory(true);
      try {
        const orFilter = churchId
          ? `church_id.eq.${churchId},church_id.is.null`
          : `church_id.is.null`;

        const { data, error } = await supabase
          .from("users_app")
          .select("id, full_name, email, church_id")
          .or(orFilter)
          .order("full_name", { ascending: true });

        if (error) throw error;
        setAvailableUsers(data ?? []);
      } catch (error) {
        console.error("Erro ao carregar diretório de usuários:", error);
        setAvailableUsers([]);
      } finally {
        setIsLoadingDirectory(false);
      }
    },
    []
  );

  const loadExistingChurch = React.useCallback(
    async (ownerId: string) => {
      setIsLoadingChurch(true);
      try {
        const { data, error } = await supabase
          .from("churches")
          .select(
            `
              id,
              name,
              city,
              primary_color,
              pastor_name,
              pastor_phone,
              teams:teams (
                id,
                name
              )
            `
          )
          .eq("owner_user_id", ownerId)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setExistingChurch(data);
          const defaultTeams = (data.teams ?? []).filter((team) =>
            DEFAULT_TEAM_OPTIONS.some((defaultOption) => defaultOption.label === team.name)
          );
          setNewMemberTeamId(defaultTeams[0]?.id ?? null);
          await Promise.all([
            loadTeamMembers(data.id),
            loadAllChurchMembers(data.id),
            loadAvailableUsers(data.id),
          ]);
        } else {
          setExistingChurch(null);
          setIsEditingExisting(false);
          setTeamMembers([]);
          setAllChurchMembers([]);
          await loadAvailableUsers(null);
        }
      } catch (error) {
        console.error("Erro ao carregar igreja existente:", error);
        setExistingChurch(null);
        setTeamMembers([]);
        setAllChurchMembers([]);
      } finally {
        setIsLoadingChurch(false);
      }
    },
    [loadTeamMembers, loadAllChurchMembers, loadAvailableUsers]
  );

  React.useEffect(() => {
    let isMounted = true;

    const loadLeader = async () => {
      setIsLoadingLeader(true);
      setLeaderLoadError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error("Usuário não autenticado. Faça login novamente.");
        }

        const fallbackName =
          (user.user_metadata as Record<string, string> | undefined)?.full_name ??
          user.email?.split("@")[0] ??
          "Líder";

        const fallbackEmail = user.email ?? "sem-email@setlistgo.app";

        const { data: userAppData, error: userAppError } = await supabase
          .from("users_app")
          .select("id, full_name, email")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (userAppError && userAppError.code !== "PGRST116") {
          throw userAppError;
        }

        if (!isMounted) return;

        setLeaderProfile({
          authUserId: user.id,
          userAppId: userAppData?.id ?? null,
          name: userAppData?.full_name ?? fallbackName,
          email: userAppData?.email ?? fallbackEmail,
        });
        loadExistingChurch(user.id);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setLeaderLoadError("Não foi possível carregar os dados do líder.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingLeader(false);
        }
      }
    };

    loadLeader();

    return () => {
      isMounted = false;
    };
  }, [loadExistingChurch]);

  const teamsToCreate = React.useMemo(() => {
    const uniqueTeams = new Set<string>();
    selectedDefaultTeams.forEach((team) => uniqueTeams.add(team));
    extraTeams.forEach((team) => uniqueTeams.add(team));
    return Array.from(uniqueTeams);
  }, [selectedDefaultTeams, extraTeams]);

  const prepareFormForExisting = React.useCallback(() => {
    if (!existingChurch) return;
    setChurchData({
      name: existingChurch.name,
      city: existingChurch.city ?? "",
      pastorName: existingChurch.pastor_name ?? "",
      pastorContact: existingChurch.pastor_phone ?? "",
    });
    const defaultLabels = new Set(DEFAULT_TEAM_OPTIONS.map((team) => team.label));
    const teams = (existingChurch.teams ?? []).map((team) => team.name);
    setSelectedDefaultTeams(teams.filter((name) => defaultLabels.has(name)));
    setExtraTeams(teams.filter((name) => !defaultLabels.has(name)));
    const defaultTeams = (existingChurch.teams ?? []).filter((team) =>
      defaultLabels.has(team.name)
    );
    setNewMemberTeamId(defaultTeams[0]?.id ?? null);
    setCurrentStep(1);
    setFormError(null);
  }, [existingChurch]);

  const handleStartEditingExisting = () => {
    if (!existingChurch) return;
    prepareFormForExisting();
    setIsEditingExisting(true);
  };

  const handleCancelEditing = () => {
    setIsEditingExisting(false);
    setFormError(null);
    setCurrentStep(1);
  };

  const matchedDirectoryUser = React.useMemo(() => {
    const email = newMemberEmail.trim().toLowerCase();
    if (!email) return null;
    return availableUsers.find(
      (user) => user.email?.toLowerCase() === email
    );
  }, [availableUsers, newMemberEmail]);

  const handleMemberEmailChange = (value: string) => {
    setNewMemberEmail(value);
    const match = availableUsers.find(
      (user) => user.email?.toLowerCase() === value.trim().toLowerCase()
    );
    if (match?.full_name) {
      setNewMemberName(match.full_name);
    }
  };

  const handleAddMember = async () => {
    if (!existingChurch || !newMemberEmail.trim()) {
      setMemberError("Informe o email do membro.");
      return;
    }

    setIsSavingMember(true);
    setMemberError(null);

    try {
      const { data: userApp, error: userLookupError } = await supabase
        .from("users_app")
        .select("id, full_name, church_id")
        .eq("email", newMemberEmail.trim())
        .maybeSingle();

      if (userLookupError) throw userLookupError;
      if (!userApp?.id) {
        setMemberError("Usuário não encontrado. Confirme se ele já acessou o aplicativo.");
        return;
      }

      // Atualizar igreja do usuário
      const { error: updateUserChurchError } = await supabase
        .from("users_app")
        .update({
          church_id: existingChurch.id,
        })
        .eq("id", userApp.id);

      if (updateUserChurchError) throw updateUserChurchError;

      // Limpar formulário e recarregar
      setNewMemberEmail("");
      await Promise.all([
        loadTeamMembers(existingChurch.id),
        loadAllChurchMembers(existingChurch.id),
        loadAvailableUsers(existingChurch.id),
      ]);
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      setMemberError(
        error instanceof Error ? error.message : "Erro ao adicionar membro."
      );
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!existingChurch) return;
    try {
      const { error } = await supabase
        .from("user_team")
        .delete()
        .eq("id", membershipId);
      if (error) throw error;
      await loadTeamMembers(existingChurch.id);
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      setMemberError(
        error instanceof Error ? error.message : "Erro ao remover membro."
      );
    }
  };

  const handleStartEditMember = async (userId: string) => {
    if (!existingChurch) return;
    try {
      // Buscar todas as equipes que o usuário pertence
      const { data, error } = await supabase
        .from("user_team")
        .select("team_id")
        .eq("user_id", userId)
        .eq("church_id", existingChurch.id);

      if (error) throw error;

      const teamIds = (data ?? []).map((item) => item.team_id);
      setEditingMemberId(userId);
      setEditingMemberTeams(teamIds);
    } catch (error) {
      console.error("Erro ao carregar equipes do membro:", error);
      setMemberError(
        error instanceof Error ? error.message : "Erro ao carregar equipes."
      );
    }
  };

  const handleSaveEditMember = async () => {
    if (!editingMemberId || !existingChurch) return;

    try {
      setIsSavingMember(true);
      setMemberError(null);

      // 1. Remover todas as associações antigas do usuário
      await supabase
        .from("user_team")
        .delete()
        .eq("user_id", editingMemberId)
        .eq("church_id", existingChurch.id);

      // 2. Inserir novas associações para cada equipe selecionada
      if (editingMemberTeams.length > 0) {
        const newAssociations = editingMemberTeams.map((teamId) => ({
          user_id: editingMemberId,
          team_id: teamId,
          church_id: existingChurch.id,
          role: "membro",
        }));

        const { error: insertError } = await supabase
          .from("user_team")
          .insert(newAssociations);

        if (insertError) throw insertError;
      }

      // 3. Recarregar membros e fechar edição
      await loadTeamMembers(existingChurch.id);
      setEditingMemberId(null);
      setEditingMemberTeams([]);
    } catch (error) {
      console.error("Erro ao atualizar membro:", error);
      setMemberError(
        error instanceof Error ? error.message : "Erro ao atualizar membro."
      );
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleCancelEditMember = () => {
    setEditingMemberId(null);
    setEditingMemberTeams([]);
    setMemberError(null);
  };

  const handleToggleEditMemberTeam = (teamId: string) => {
    setEditingMemberTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const updateChurchField = (field: keyof ChurchFormData, value: string) => {
    setChurchData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleToggleTeam = (teamName: string) => {
    setSelectedDefaultTeams((prev) =>
      prev.includes(teamName) ? prev.filter((team) => team !== teamName) : [...prev, teamName]
    );
    setFormError(null);
  };

  const handleAddExtraTeam = () => {
    const normalized = newTeamName.trim();
    if (!normalized) return;

    const alreadyIncluded = [...teamsToCreate].some(
      (team) => team.toLowerCase() === normalized.toLowerCase()
    );
    if (alreadyIncluded) {
      setFormError("Essa equipe já está na lista.");
      return;
    }

    setExtraTeams((prev) => [...prev, normalized]);
    setNewTeamName("");
    setFormError(null);
  };

  const handleRemoveExtraTeam = (teamName: string) => {
    setExtraTeams((prev) => prev.filter((team) => team !== teamName));
    setFormError(null);
  };

  const getStepValidation = (step: StepId): string | null => {
    if (step === 1 && !churchData.name.trim()) {
      return "Informe o nome da igreja para continuar.";
    }

    if (step === 3 && teamsToCreate.length === 0) {
      return "Selecione ou adicione pelo menos uma equipe.";
    }

    if (step === 4 && teamsToCreate.length === 0) {
      return "Adicione ao menos uma equipe antes de concluir.";
    }

    return null;
  };

  const handleNextStep = () => {
    const validationMessage = getStepValidation(currentStep);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setFormError(null);
    setCurrentStep((prev) => (prev < STEP_FLOW.length ? (prev + 1) as StepId : prev));
  };

  const handlePreviousStep = () => {
    setFormError(null);
    setCurrentStep((prev) => (prev > 1 ? (prev - 1) as StepId : prev));
  };

  const handleSubmit = async () => {
    const validationMessage = getStepValidation(4);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    if (!leaderProfile) {
      setFormError("Não foi possível identificar o usuário líder.");
      return;
    }

    const isUpdatingExisting = Boolean(existingChurch && isEditingExisting);

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      let churchId = existingChurch?.id ?? null;

      if (isUpdatingExisting && churchId) {
        const { error: updateError } = await supabase
          .from("churches")
          .update({
            name: churchData.name.trim(),
            city: churchData.city.trim() || null,
            pastor_name: churchData.pastorName.trim() || null,
            pastor_phone: churchData.pastorContact.trim() || null,
          })
          .eq("id", churchId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { data: createdChurch, error: churchError } = await supabase
          .from("churches")
          .insert({
            name: churchData.name.trim(),
            city: churchData.city.trim() || null,
            pastor_name: churchData.pastorName.trim() || null,
            pastor_phone: churchData.pastorContact.trim() || null,
            owner_user_id: leaderProfile.authUserId,
          })
          .select("id")
          .single();

        if (churchError || !createdChurch?.id) {
          throw new Error(churchError?.message ?? "Erro ao criar a igreja.");
        }

        churchId = createdChurch.id;
      }

      if (!churchId) {
        throw new Error("Não foi possível obter o ID da igreja.");
      }

      const { data: userAppRecord, error: userAppError } = await supabase
        .from("users_app")
        .upsert(
          {
            id: leaderProfile.userAppId ?? undefined,
            auth_user_id: leaderProfile.authUserId,
            full_name: leaderProfile.name,
            email: leaderProfile.email,
            church_id: churchId,
            role: "lider",
          },
          {
            onConflict: "auth_user_id",
          }
        )
        .select("id")
        .single();

      if (userAppError || !userAppRecord?.id) {
        throw new Error(userAppError?.message ?? "Erro ao vincular o líder.");
      }

      const userAppId = userAppRecord.id;

      if (isUpdatingExisting) {
        await supabase.from("teams").delete().eq("church_id", churchId);
        await supabase
          .from("user_team")
          .delete()
          .eq("church_id", churchId)
          .eq("user_id", userAppId);
      }

      const teamsPayload = teamsToCreate.map((teamName) => ({
        name: teamName,
        church_id: churchId,
      }));

      const { data: createdTeams, error: teamsError } = await supabase
        .from("teams")
        .insert(teamsPayload)
        .select("id");

      if (teamsError) {
        throw new Error(teamsError.message);
      }

      if (createdTeams && createdTeams.length > 0) {
        const leaderTeamLinks = createdTeams.map((team) => ({
          team_id: team.id,
          user_id: userAppId,
          role: "lider",
        }));

        const { error: userTeamError } = await supabase.from("user_team").insert(leaderTeamLinks);

        if (userTeamError) {
          throw new Error(userTeamError.message);
        }
      } else {
        await supabase.from("user_team").insert({
          user_id: userAppId,
          church_id: churchId,
          role: "lider",
        });
      }

      await loadExistingChurch(leaderProfile.authUserId);
      setIsEditingExisting(false);
      setFormError(null);
    } catch (error) {
      const friendlyMessage =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao concluir o cadastro da igreja.";
      setSubmissionError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = React.useMemo(() => {
    return (currentStep / STEP_FLOW.length) * 100;
  }, [currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white/80 block mb-2">
                Nome da igreja *
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                placeholder="Ex: Igreja Esperança Viva"
                value={churchData.name}
                onChange={(event) => updateChurchField("name", event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 block mb-2">Cidade</label>
              <input
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                placeholder="Ex: São Paulo - SP"
                value={churchData.city}
                onChange={(event) => updateChurchField("city", event.target.value)}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <p className="text-sm text-white/70 leading-relaxed">
              Você será o líder desta igreja no{" "}
              <BrandLogo variant="inline" inlineSize="sm" className="inline-flex" />. Isso significa
              que poderá gerenciar equipes, repertórios e membros. Confirme abaixo para seguir.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-white/80 block mb-2">
                  Pastor líder (opcional)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-white/10 bg-[#0a0e18] px-4 py-3 text-white placeholder:text-white/40 focus:border-[#1DB954] focus:outline-none"
                  placeholder="Nome do pastor responsável"
                  value={churchData.pastorName}
                  onChange={(event) => updateChurchField("pastorName", event.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/80 block mb-2">
                  Contato (telefone)
                </label>
                <PhoneInput
                  className="bg-[#0a0e18] border-white/10 text-white placeholder:text-white/40 focus:border-[#1DB954]"
                  value={churchData.pastorContact}
                  onChange={(value) => updateChurchField("pastorContact", value)}
                />
              </div>
            </div>
            {leaderLoadError && (
              <p className="text-sm text-rose-300">{leaderLoadError}</p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              {DEFAULT_TEAM_OPTIONS.map((team) => (
                <label
                  key={team.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-white/20 text-emerald-400 focus:ring-emerald-400"
                    checked={selectedDefaultTeams.includes(team.label)}
                    onChange={() => handleToggleTeam(team.label)}
                  />
                  <span className="text-sm text-white/80">{team.label}</span>
                </label>
              ))}
            </div>

            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-5 space-y-3">
              <p className="text-sm font-medium text-white/70">Adicionar outra equipe</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-white/10 bg-[#111827] px-4 py-2.5 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                  placeholder="Ex: Comunicação"
                  value={newTeamName}
                  onChange={(event) => {
                    setNewTeamName(event.target.value);
                    setFormError(null);
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  onClick={handleAddExtraTeam}
                >
                  Adicionar
                </button>
              </div>
              {extraTeams.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {extraTeams.map((team) => (
                    <button
                      key={team}
                      type="button"
                      className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
                      onClick={() => handleRemoveExtraTeam(team)}
                    >
                      {team}
                      <span className="text-white/50 group-hover:text-rose-300">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-white/70">Equipes que serão criadas</p>
              {teamsToCreate.length === 0 ? (
                <p className="mt-2 text-sm text-white/50">
                  Nenhuma equipe selecionada. Adicione pelo menos uma equipe para continuar.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {teamsToCreate.map((team) => (
                    <span
                      key={team}
                      className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 4:
      default:
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-base font-semibold text-white mb-4">Dados da igreja</h3>
              <dl className="space-y-2 text-sm text-white/80">
                <div>
                  <dt className="text-white/60">Nome</dt>
                  <dd className="font-medium">{churchData.name}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Cidade</dt>
                  <dd className="font-medium">{churchData.city || "Não informado"}</dd>
                </div>
                <div>
                  <dt className="text-white/60">Pastor líder</dt>
                  <dd className="font-medium">
                    {churchData.pastorName?.trim() || "Não informado"}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/60">Contato (telefone)</dt>
                  <dd className="font-medium">
                    {churchData.pastorContact?.trim() || "Não informado"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-base font-semibold text-white mb-4">Líder</h3>
              {leaderProfile ? (
                <div className="space-y-1 text-sm text-white/80">
                  <p className="font-medium">{leaderProfile.name}</p>
                  <p>{leaderProfile.email}</p>
                </div>
              ) : (
                <p className="text-sm text-white/60">Não foi possível carregar os dados do líder.</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-base font-semibold text-white mb-4">Equipes</h3>
              {teamsToCreate.length === 0 ? (
                <p className="text-sm text-white/60">Nenhuma equipe selecionada.</p>
              ) : (
                <ul className="grid gap-2 text-sm text-white/80">
                  {teamsToCreate.map((team) => (
                    <li key={team} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {team}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
    }
  };

  const isNextDisabled = currentStep < 4 && Boolean(getStepValidation(currentStep));

  if (isLoadingLeader || isLoadingChurch) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="space-y-2 text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-sm text-white/60">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (existingChurch && !isEditingExisting) {
    const teams = existingChurch.teams ?? [];
    return (
      <div className="min-h-screen bg-[#050505] py-12 px-4 text-white">
        <div className="mx-auto max-w-5xl space-y-8">
          <header className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-[#1DB954]">
              Igreja cadastrada
            </div>
            <h1 className="text-2xl font-semibold">
              Sua igreja no <BrandLogo variant="inline" inlineSize="lg" className="inline-flex" />
            </h1>
            <p className="text-sm text-white/70">
              Gerencie equipes, repertórios e membros. Use o botão abaixo para atualizar qualquer
              informação.
            </p>
          </header>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-4 md:p-6 shadow-2xl shadow-black/50 space-y-4">
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Identidade</p>
                <h2 className="text-xl font-semibold">{existingChurch.name}</h2>
                <dl className="grid grid-cols-3 gap-3 text-xs sm:text-sm text-white/70">
                  <div>
                    <dt className="text-white/50 text-[10px] sm:text-xs">Cidade</dt>
                    <dd className="font-medium truncate">{existingChurch.city || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt className="text-white/50 text-[10px] sm:text-xs">Pastor líder</dt>
                    <dd className="font-medium truncate">
                      {existingChurch.pastor_name || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/50 text-[10px] sm:text-xs">Contato</dt>
                    <dd className="font-medium truncate">
                      {existingChurch.pastor_phone || "Não informado"}
                    </dd>
                  </div>
                </dl>
              </div>

            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Adicionar membro</p>
                <h3 className="text-lg font-semibold text-white">Buscar membro cadastrado</h3>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#1DB954] focus:outline-none"
                    placeholder="Digite o Email ou Nome do membro (min. 3 letras)"
                    value={newMemberEmail}
                    onChange={(event) => handleMemberEmailChange(event.target.value)}
                  />
                  {newMemberEmail.length >= 3 && (() => {
                    const searchTerm = newMemberEmail.toLowerCase();
                    const filteredUsers = availableUsers.filter((user) => {
                      const name = (user.full_name || "").toLowerCase();
                      const email = (user.email || "").toLowerCase();
                      return name.includes(searchTerm) || email.includes(searchTerm);
                    });

                    if (filteredUsers.length === 0) return null;

                    return (
                      <div className="absolute z-10 w-full mt-1 bg-black/95 border border-white/20 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                        {filteredUsers.slice(0, 5).map((user) => {
                          const isAlreadyMember = user.church_id === existingChurch?.id;

                          return (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setNewMemberEmail(user.email || "");
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition flex items-start gap-2"
                            >
                              <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                  {user.full_name || "Sem nome"}
                                  {isAlreadyMember && (
                                    <span className="text-xs text-green-400" title="Já é membro desta igreja">
                                      ●
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-white/50">{user.email}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {memberError && <p className="text-sm text-rose-300">{memberError}</p>}

                {matchedDirectoryUser && newMemberEmail.length >= 3 && (
                  <div className="rounded-lg bg-white/5 p-3 space-y-2">
                    <p className="text-xs text-white/60">
                      ✓ Usuário encontrado: <span className="font-semibold text-white">{matchedDirectoryUser.full_name || matchedDirectoryUser.email}</span>
                    </p>
                    <button
                      type="button"
                      className="w-full rounded-lg bg-[#1DB954] text-black px-4 py-2 text-sm font-semibold hover:bg-[#1ed760] disabled:opacity-50"
                      onClick={handleAddMember}
                      disabled={isSavingMember}
                    >
                      {isSavingMember ? "Adicionando..." : "Adicionar à igreja"}
                    </button>
                    <p className="text-xs text-white/50 text-center">
                      Após adicionar, use o botão ✎ para definir as equipes
                    </p>
                  </div>
                )}

                {newMemberEmail.trim().length >= 3 && !matchedDirectoryUser && !isLoadingDirectory && (
                  <p className="text-xs text-white/50">
                    Usuário não encontrado.{" "}
                    <button
                      type="button"
                      className="text-[#1DB954] underline underline-offset-2"
                      onClick={() => navigate("/register")}
                    >
                      Cadastre-o pelo app
                    </button>
                  </p>
                )}
              </div>
            </section>

            {/* Listagem de TODOS os membros da igreja (com ou sem equipe) */}
            {allChurchMembers.length > 0 && (() => {
              // Criar Map de equipes por usuário
              const teamsByUser = new Map<string, Array<{ id: string; name: string; membershipId: string }>>();

              teamMembers.forEach((membership) => {
                const userId = membership.user?.id;
                if (!userId || !membership.team) return;

                if (!teamsByUser.has(userId)) {
                  teamsByUser.set(userId, []);
                }

                teamsByUser.get(userId)!.push({
                  id: membership.team.id,
                  name: membership.team.name,
                  membershipId: membership.id,
                });
              });

              // Criar lista de membros com suas equipes
              const allMembers = allChurchMembers.map((user) => ({
                userId: user.id,
                userName: user.full_name || "",
                userEmail: user.email || "",
                teams: teamsByUser.get(user.id) || [],
              }));

              if (allMembers.length === 0) return null;

              // Aplicar filtros
              const filteredMembers = allMembers.filter((member) => {
                // Filtro por busca (nome ou email)
                const searchLower = memberSearchTerm.toLowerCase();
                const matchesSearch = !memberSearchTerm ||
                  member.userName.toLowerCase().includes(searchLower) ||
                  member.userEmail.toLowerCase().includes(searchLower);

                // Filtro por equipe
                const matchesTeam = !selectedTeamFilter ||
                  member.teams.some((team) => team.name === selectedTeamFilter);

                return matchesSearch && matchesTeam;
              });

              return (
                <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Membros cadastrados</p>
                    <h3 className="text-lg font-semibold text-white">Funções</h3>
                  </div>

                  {/* Barra de busca e filtros */}
                  <div className="space-y-3">
                    {/* Campo de busca com botão de filtro */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Digite o email ou nome do membro"
                          value={memberSearchTerm}
                          onChange={(e) => setMemberSearchTerm(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 pl-10 text-sm text-white placeholder:text-white/40 focus:border-[#1DB954] focus:outline-none"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                          🔍
                        </span>
                      </div>

                      {/* Botão hamburger para filtros */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                          className="h-full px-4 rounded-lg border border-white/10 bg-black/40 text-white hover:bg-white/10 transition flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          {selectedTeamFilter && (
                            <span className="text-xs text-[#1DB954]">•</span>
                          )}
                        </button>

                        {/* Menu dropdown de filtros */}
                        <AnimatePresence>
                          {isFilterMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-black/95 shadow-lg z-10 p-2"
                            >
                              <p className="text-xs text-white/50 px-2 py-1 mb-1">Filtrar por equipe:</p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeamFilter(null);
                                setIsFilterMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                                selectedTeamFilter === null
                                  ? "bg-[#1DB954] text-black font-medium"
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              Todos
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeamFilter("Vocal");
                                setIsFilterMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition flex items-center gap-2 ${
                                selectedTeamFilter === "Vocal"
                                  ? "bg-green-500 text-white font-medium"
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              Vocal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeamFilter("Instrumental");
                                setIsFilterMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition flex items-center gap-2 ${
                                selectedTeamFilter === "Instrumental"
                                  ? "bg-yellow-500 text-black font-medium"
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              <span className="h-2 w-2 rounded-full bg-yellow-500" />
                              Instrumental
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeamFilter("Multimídia");
                                setIsFilterMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition flex items-center gap-2 ${
                                selectedTeamFilter === "Multimídia"
                                  ? "bg-purple-500 text-white font-medium"
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              <span className="h-2 w-2 rounded-full bg-purple-500" />
                              Multimídia
                            </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Lista de membros filtrada */}
                  {filteredMembers.length === 0 ? (
                    <p className="text-center text-sm text-white/40 py-8">
                      Nenhum membro encontrado com os filtros selecionados
                    </p>
                  ) : (
                    <motion.ul
                      className="space-y-3"
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {filteredMembers.map((member, index) => {
                        const isEditing = editingMemberId === member.userId;

                        return (
                          <motion.li
                            key={member.userId}
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              show: { opacity: 1, y: 0 }
                            }}
                            transition={{ duration: 0.3 }}
                            whileHover={{ scale: 1.01, y: -2 }}
                            className="bg-white/5 rounded-lg px-3 py-3"
                          >
                          {isEditing ? (
                            // Modo de edição com checkboxes
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-white">
                                {member.userName || member.userEmail}
                              </p>
                              <div className="space-y-2">
                                {existingChurch?.teams?.map((team) => {
                                  let colorClass = "bg-green-500";
                                  if (team.name === "Instrumental") colorClass = "bg-yellow-500";
                                  if (team.name === "Multimídia") colorClass = "bg-purple-500";

                                  return (
                                    <label key={team.id} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={editingMemberTeams.includes(team.id)}
                                        onChange={() => handleToggleEditMemberTeam(team.id)}
                                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#1DB954] focus:ring-[#1DB954]"
                                      />
                                      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
                                      <span className="text-sm text-white/80">{team.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={handleSaveEditMember}
                                  disabled={isSavingMember}
                                  className="px-3 py-1 rounded bg-[#1DB954] text-black text-xs font-semibold hover:bg-[#1ed760] disabled:opacity-50"
                                >
                                  {isSavingMember ? "Salvando..." : "Salvar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditMember}
                                  disabled={isSavingMember}
                                  className="px-3 py-1 rounded border border-white/20 text-white/70 text-xs hover:border-white/40"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Modo de visualização com tags
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white mb-1">
                                  {member.userName || member.userEmail}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {member.teams.length > 0 ? (
                                    member.teams.map((team) => {
                                      let colorClass = "bg-green-500";
                                      if (team.name === "Instrumental") colorClass = "bg-yellow-500";
                                      if (team.name === "Multimídia") colorClass = "bg-purple-500";

                                      return (
                                        <span
                                          key={team.id}
                                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-xs text-white/80"
                                        >
                                          <span className={`h-1.5 w-1.5 rounded-full ${colorClass}`} />
                                          {team.name}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-xs text-white/40 italic">
                                      Sem equipe definida
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-3">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditMember(member.userId)}
                                  className="text-white/60 hover:text-blue-400 transition text-sm"
                                  title={member.userId === leaderProfile?.userAppId ? "Editar minhas equipes" : "Editar funções"}
                                >
                                  ✎
                                </button>
                                {member.userId === leaderProfile?.userAppId ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm("Tem certeza que deseja sair de todas as equipes da igreja?")) {
                                        member.teams.forEach((team) => handleRemoveMember(team.membershipId));
                                      }
                                    }}
                                    className="text-white/40 hover:text-yellow-400 transition text-sm"
                                    title="Sair das equipes"
                                  >
                                    ⎋
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Tem certeza que deseja remover ${member.userName || member.userEmail} da igreja?`)) {
                                        member.teams.forEach((team) => handleRemoveMember(team.membershipId));
                                      }
                                    }}
                                    className="text-white/40 hover:text-rose-400 transition text-lg"
                                    title="Remover membro"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              </div>
                            )}
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                  )}
                </section>
              );
            })()}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/60">
                Última atualização:{" "}
                {existingChurch.primary_color ? "personalizada" : "configuração padrão"}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white/80 hover:border-white/40 transition"
                  onClick={() => navigate("/")}
                >
                  Voltar para eventos
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-[#1DB954] text-black px-6 py-3 text-sm font-semibold transition hover:bg-[#1ed760]"
                  onClick={handleStartEditingExisting}
                >
                  Editar dados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-12 px-4 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1DB954]/20 bg-[#1DB954]/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-[#1DB954]">
            Integração
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Configure a sua igreja no{" "}
              <BrandLogo variant="inline" inlineSize="lg" className="inline-flex" />
            </h1>
            <p className="text-sm md:text-base text-white/70">
              Um fluxo rápido em quatro passos para conectar pessoas, equipes e repertórios.
            </p>
          </div>
        </header>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 md:p-8 shadow-2xl shadow-black/50 backdrop-blur">
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
              <span>Etapas</span>
              <span>
                {currentStep}/{STEP_FLOW.length}
              </span>
            </div>
            <div className="relative h-1.5 rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#1DB954] to-[#1DB954] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-medium text-white/60">
              {STEP_FLOW.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep) {
                        setCurrentStep(step.id);
                        setFormError(null);
                      }
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40",
                      isActive
                        ? "border-[#1DB954] bg-[#1DB954]/10 text-white"
                        : isCompleted
                        ? "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
                        : "border-white/10 bg-transparent text-white/50"
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1 text-white/40">
                      Passo {step.id}
                    </p>
                    <p className="text-xs font-semibold">{step.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {renderStepContent()}

          {(formError || submissionError) && (
            <div className="mt-6 rounded-xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {submissionError ?? formError}
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-white/60 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#1DB954]" />
              Passo {currentStep} de {STEP_FLOW.length}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
              {isEditingExisting && (
                <button
                  type="button"
                  className="rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                  onClick={handleCancelEditing}
                  disabled={isSubmitting}
                >
                  Cancelar edição
                </button>
              )}
              {currentStep > 1 && (
                <button
                  type="button"
                  className="rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
                  onClick={handlePreviousStep}
                  disabled={isSubmitting}
                >
                  Voltar
                </button>
              )}
              {currentStep < STEP_FLOW.length ? (
                <button
                  type="button"
                  className="rounded-xl bg-[#1DB954] text-black px-8 py-3 text-sm font-semibold transition hover:bg-[#1ed760] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleNextStep}
                  disabled={isNextDisabled || isSubmitting}
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-[#1DB954] to-[#17a74a] px-8 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Concluindo..." : "Concluir cadastro"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChurchWizard;
