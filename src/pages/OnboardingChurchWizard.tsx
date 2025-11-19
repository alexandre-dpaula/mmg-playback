import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";

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
  primaryColor: string;
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
    primaryColor: DEFAULT_PRIMARY_COLOR,
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
            loadAvailableUsers(data.id),
          ]);
        } else {
          setExistingChurch(null);
          setIsEditingExisting(false);
          setTeamMembers([]);
          await loadAvailableUsers(null);
        }
      } catch (error) {
        console.error("Erro ao carregar igreja existente:", error);
        setExistingChurch(null);
        setTeamMembers([]);
      } finally {
        setIsLoadingChurch(false);
      }
    },
    [loadTeamMembers, loadAvailableUsers]
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
      primaryColor: existingChurch.primary_color ?? DEFAULT_PRIMARY_COLOR,
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
    if (
      !existingChurch ||
      !newMemberTeamId ||
      !newMemberEmail.trim() ||
      !newMemberName.trim()
    ) {
      setMemberError("Informe o nome, email e selecione um time.");
      return;
    }

    setIsSavingMember(true);
    setMemberError(null);

    try {
      const { data: userApp, error: userLookupError } = await supabase
        .from("users_app")
        .select("id, full_name")
        .eq("email", newMemberEmail.trim())
        .maybeSingle();

      if (userLookupError) throw userLookupError;
      if (!userApp?.id) {
        setMemberError("Usuário não encontrado. Confirme se ele já acessou o aplicativo.");
        return;
      }

      // Garantir que o usuário esteja vinculado à igreja
      const cleanName = (userApp.full_name ?? newMemberName.trim()) || null;
      const teamName = existingChurch.teams?.find((team) => team.id === newMemberTeamId)?.name;
      const newRole =
        teamName === "Vocal"
          ? "vocal"
          : teamName === "Instrumental"
          ? "instrumental"
          : teamName === "Multimídia"
          ? "vocal"
          : null;

      const { error: updateUserChurchError } = await supabase
        .from("users_app")
        .update({
          church_id: existingChurch.id,
          full_name: cleanName,
          role: newRole ?? "member",
        })
        .eq("id", userApp.id);

      if (updateUserChurchError) throw updateUserChurchError;

      const { error: insertError } = await supabase.from("user_team").insert({
        user_id: userApp.id,
        team_id: newMemberTeamId,
        church_id: existingChurch.id,
        role: "member",
      });

      if (insertError) throw insertError;

      setNewMemberName("");
      setNewMemberEmail("");
      await Promise.all([
        loadTeamMembers(existingChurch.id),
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
            primary_color: churchData.primaryColor || null,
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
            primary_color: churchData.primaryColor || null,
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
            <div>
              <label className="text-sm font-medium text-white/80 block mb-2">
                Cor principal (hexadecimal)
              </label>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none"
                  placeholder="#1DB954"
                  value={churchData.primaryColor}
                  onChange={(event) => updateChurchField("primaryColor", event.target.value)}
                />
                <input
                  type="color"
                  aria-label="Escolher cor"
                  className="h-12 w-20 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  value={churchData.primaryColor}
                  onChange={(event) => updateChurchField("primaryColor", event.target.value)}
                />
              </div>
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
                <input
                  type="tel"
                  className="w-full rounded-lg border border-white/10 bg-[#0a0e18] px-4 py-3 text-white placeholder:text-white/40 focus:border-[#1DB954] focus:outline-none"
                  placeholder="(11) 99999-0000"
                  value={churchData.pastorContact}
                  onChange={(event) => updateChurchField("pastorContact", event.target.value)}
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
                <div className="flex items-center gap-3">
                  <div>
                    <dt className="text-white/60">Cor principal</dt>
                    <dd className="font-medium">{churchData.primaryColor || "N/A"}</dd>
                  </div>
                  {churchData.primaryColor && (
                    <span
                      className="inline-flex h-6 w-6 rounded-full border border-white/20"
                      style={{ backgroundColor: churchData.primaryColor }}
                    />
                  )}
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
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-[#1DB954]">
              Igreja cadastrada
            </div>
            <h1 className="text-3xl font-semibold">Sua igreja no SetlistGO™</h1>
            <p className="text-sm text-white/70">
              Gerencie equipes, repertórios e membros. Use o botão abaixo para atualizar qualquer
              informação.
            </p>
          </header>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 md:p-8 shadow-2xl shadow-black/50 space-y-6">
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Identidade</p>
                <h2 className="text-xl font-semibold">{existingChurch.name}</h2>
                <dl className="space-y-2 text-sm text-white/70">
                  <div>
                    <dt className="text-white/50">Cidade</dt>
                    <dd className="font-medium">{existingChurch.city || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt className="text-white/50">Pastor líder</dt>
                    <dd className="font-medium">
                      {existingChurch.pastor_name || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/50">Contato</dt>
                    <dd className="font-medium">
                      {existingChurch.pastor_phone || "Não informado"}
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <dt className="text-white/50">Cor principal</dt>
                      <dd className="font-medium">
                        {existingChurch.primary_color || DEFAULT_PRIMARY_COLOR}
                      </dd>
                    </div>
                    <span
                      className="inline-flex h-6 w-6 rounded-full border border-white/20"
                      style={{
                        backgroundColor:
                          existingChurch.primary_color ?? DEFAULT_PRIMARY_COLOR,
                      }}
                    />
                  </div>
                </dl>
              </div>

            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Adicionar membro</p>
                <h3 className="text-lg font-semibold text-white">Nomeie pessoas para equipes</h3>
              </div>
              <div className="rounded-xl border border-dashed border-white/20 bg-black/20 p-4 space-y-3">
                <input
                  type="email"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#1DB954] focus:outline-none"
                  placeholder="Email do usuário"
                  list="available-user-emails"
                  value={newMemberEmail}
                  onChange={(event) => handleMemberEmailChange(event.target.value)}
                />
                <input
                  type="text"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#1DB954] focus:outline-none"
                  placeholder="Nome completo"
                  value={newMemberName}
                  onChange={(event) => setNewMemberName(event.target.value)}
                />
                <datalist id="available-user-emails">
                  {availableUsers.map((user) =>
                    user.email ? (
                      <option key={user.id} value={user.email}>
                        {user.full_name ?? "Usuário sem nome"}
                      </option>
                    ) : null
                  )}
                </datalist>
                <div className="space-y-1">
                  <select
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-[#1DB954] focus:outline-none"
                    value={newMemberTeamId ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!value) {
                        setNewMemberTeamId(null);
                      } else {
                        setNewMemberTeamId(value);
                      }
                    }}
                    disabled={
                      !(
                        existingChurch?.teams?.some((team) =>
                          DEFAULT_TEAM_OPTIONS.some((option) => option.label === team.name)
                        ) ?? false
                      )
                    }
                  >
                    <option value="">
                      Selecionar Função
                    </option>
                    {existingChurch?.teams
                      ?.filter((team) =>
                        DEFAULT_TEAM_OPTIONS.some((option) => option.label === team.name)
                      )
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                  {!(
                    existingChurch?.teams?.some((team) =>
                      DEFAULT_TEAM_OPTIONS.some((option) => option.label === team.name)
                    ) ?? false
                  ) && (
                    <p className="text-xs text-white/50">
                      Cadastre primeiro as equipes padrão para adicionar membros.
                    </p>
                  )}
                </div>
              </div>
              {memberError && <p className="text-sm text-rose-300">{memberError}</p>}
              {matchedDirectoryUser ? (
                <p className="text-xs text-white/60">
                  Usuário encontrado: {matchedDirectoryUser.full_name || "Sem nome cadastrado"}
                  {matchedDirectoryUser.church_id &&
                    matchedDirectoryUser.church_id !== existingChurch?.id &&
                    " • Será movido para esta igreja."}
                </p>
              ) : (
                newMemberEmail.trim() && (
                  <p className="text-xs text-white/50">
                    Usuário não encontrado.{" "}
                    <button
                      type="button"
                      className="text-[#1DB954] underline underline-offset-2"
                      onClick={() => navigate("/register")}
                    >
                      Cadastre-o pelo app
                    </button>{" "}
                    e tente novamente.
                  </p>
                )
              )}
              <button
                type="button"
                className="rounded-lg bg-[#1DB954] text-black px-4 py-2 text-sm font-semibold hover:bg-[#1ed760] disabled:opacity-50"
                onClick={handleAddMember}
                disabled={isSavingMember}
              >
                {isSavingMember ? "Adicionando..." : "Adicionar membro"}
              </button>
            </section>

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
