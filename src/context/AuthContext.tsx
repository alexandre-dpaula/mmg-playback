import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = 'lider' | 'vocal' | 'instrumental' | 'multimidia' | 'pending';

type AuthProfile = {
  id: string | null;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  churchId: string | null;
  churchName: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: AuthProfile;
  isLoading: boolean;
  isSigningOut: boolean;
  signInWithProvider: (provider: "google" | "apple") => Promise<void>;
  signOut: () => Promise<void>;
  signInFallback: () => void;
  updateProfile: (updates: Partial<AuthProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  hasRole: (minRole: UserRole) => boolean;
};

const DEFAULT_PROFILE: AuthProfile = {
  id: null,
  name: "Alexandre Dpaula",
  email: "contato.m2bstudio@gmail.com",
  avatarUrl: "/perfil.jpg",
  role: "pending",
  churchId: null,
  churchName: null,
};

const LOCAL_AUTH_KEY = "mmg_local_auth";
const LOCAL_PROFILE_KEY = "mmg_local_profile";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (value?: string | null): UserRole | null => {
  if (!value) return null;
  const map: Record<string, UserRole> = {
    lider: "lider",
    leader: "lider",
    vocal: "vocal",
    instrumental: "instrumental",
    multimidia: "multimidia",
    pending: "pending",
  };
  return map[value.toLowerCase()] ?? null;
};

const getStoredProfile = (): AuthProfile => {
  const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
  if (!raw) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(raw) as AuthProfile;
    return {
      id: parsed.id ?? null,
      name: parsed.name || DEFAULT_PROFILE.name,
      email: parsed.email || DEFAULT_PROFILE.email,
      avatarUrl: parsed.avatarUrl || DEFAULT_PROFILE.avatarUrl,
      role: parsed.role || DEFAULT_PROFILE.role,
      churchId: parsed.churchId ?? null,
      churchName: parsed.churchName ?? null,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

const createLocalUser = (): User => {
  const now = new Date().toISOString();
  return {
    id: "local-user",
    app_metadata: {},
    user_metadata: {
      full_name: DEFAULT_PROFILE.name,
      avatar_url: DEFAULT_PROFILE.avatarUrl,
    },
    aud: "authenticated",
    created_at: now,
    email: DEFAULT_PROFILE.email,
    email_confirmed_at: now,
    phone: "",
    phone_confirmed_at: now,
    role: "authenticated",
    updated_at: now,
    last_sign_in_at: now,
    factors: [],
    identities: [],
    is_anonymous: false,
  } as User;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const applySession = async (session: Session | null) => {
    console.log('[AuthContext] applySession iniciado', session?.user?.id);

    try {
      if (session?.user) {
        setUser(session.user);
        console.log('[AuthContext] User setado:', session.user.id);

        // Define perfil básico imediatamente para não travar UI
        const basicProfile: AuthProfile = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email || DEFAULT_PROFILE.name,
          email: session.user.email || DEFAULT_PROFILE.email,
          avatarUrl: session.user.user_metadata?.avatar_url || DEFAULT_PROFILE.avatarUrl,
          role: DEFAULT_PROFILE.role,
          churchId: null,
          churchName: null,
        };

        setProfile(basicProfile);
        console.log('[AuthContext] Perfil básico setado');

        // Buscar dados adicionais do banco de forma assíncrona (não bloqueia UI)
        console.log('[AuthContext] Buscando dados do banco (assíncrono)...');

        // Busca profile com timeout curto
        const profileResult = await Promise.race([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle(),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]).catch(err => {
          console.warn('[AuthContext] Timeout/erro ao buscar profile:', err.message);
          return { data: null, error: err };
        });

        const profileData = profileResult?.data || null;
        console.log('[AuthContext] Profile data:', profileData ? 'encontrado' : 'não encontrado');

      // Busca users_app com timeout
      console.log('[AuthContext] Buscando users_app...');
      const userAppResult = await Promise.race([
        supabase
          .from('users_app')
          .select('role, church_id')
          .eq('auth_user_id', session.user.id)
          .maybeSingle(),
        new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]).catch(err => {
        console.warn('[AuthContext] Timeout/erro ao buscar users_app:', err.message);
        return { data: null, error: err };
      });

      let userAppData = userAppResult?.data || null;
      const userAppError = userAppResult?.error;

      if (userAppError && !userAppError.message?.includes('Timeout')) {
        console.error('[AuthContext] Erro ao buscar users_app:', userAppError);
      }

      // Se não existe users_app, cria um novo (sem bloquear)
      if (!userAppError && !userAppData) {
        console.log('[AuthContext] Criando novo users_app...');
        const insertResult = await Promise.race([
          supabase
            .from('users_app')
            .insert({
              auth_user_id: session.user.id,
              full_name: profileData?.full_name || session.user.user_metadata?.full_name || session.user.email,
              email: profileData?.email || session.user.email,
              church_id: null,
              role: 'pending',
            })
            .select('role, church_id')
            .single(),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]).catch(err => {
          console.warn('[AuthContext] Timeout/erro ao criar users_app:', err.message);
          return { data: null, error: err };
        });

        if (insertResult?.data) {
          userAppData = insertResult.data;
          console.log('[AuthContext] users_app criado com sucesso');
        }
      }

      const resolvedRole =
        normalizeRole(userAppData?.role) ||
        normalizeRole(profileData?.role) ||
        DEFAULT_PROFILE.role;
      const resolvedChurchId = userAppData?.church_id ?? null;
      let resolvedChurchName: string | null = null;

      // Busca nome da igreja com timeout (se tiver church_id)
      if (resolvedChurchId) {
        console.log('[AuthContext] Buscando nome da igreja...');
        const churchResult = await Promise.race([
          supabase
            .from('churches')
            .select('name')
            .eq('id', resolvedChurchId)
            .maybeSingle(),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]).catch(err => {
          console.warn('[AuthContext] Timeout/erro ao buscar igreja:', err.message);
          return { data: null, error: err };
        });

        if (churchResult?.data) {
          resolvedChurchName = churchResult.data.name ?? null;
          console.log('[AuthContext] Igreja encontrada:', resolvedChurchName);
        }
      }

      const profile: AuthProfile = {
        id: session.user.id,
        name:
          profileData?.name ||
          profileData?.full_name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          DEFAULT_PROFILE.name,
        email: profileData?.email || session.user.email || DEFAULT_PROFILE.email,
        avatarUrl:
          profileData?.avatar_url ||
          session.user.user_metadata?.avatar_url ||
          session.user.user_metadata?.picture ||
          DEFAULT_PROFILE.avatarUrl,
        role: resolvedRole,
        churchId: resolvedChurchId,
        churchName: resolvedChurchName,
      };

      setProfile(profile);
      console.log('[AuthContext] Perfil completo atualizado:', { role: profile.role, churchName: profile.churchName });

      // Atualizar perfil no banco se não existir (não bloqueia)
      if (!profileData) {
        console.log('[AuthContext] Profile não existe, criando...');

        // Verificar se há dados de registro pendente
        const pendingReg = localStorage.getItem('pending_registration');
        const pendingAvatar = localStorage.getItem('pending_avatar');

        let finalName = profile.name;
        let finalAvatar = profile.avatarUrl;

        if (pendingReg) {
          try {
            const regData = JSON.parse(pendingReg);
            if (regData.name) finalName = regData.name;
            localStorage.removeItem('pending_registration');
            console.log('[AuthContext] Registro pendente processado');
          } catch (e) {
            console.error('[AuthContext] Erro ao processar registro pendente:', e);
          }
        }

        // Se houver avatar pendente, fazer upload (com timeout)
        if (pendingAvatar) {
          console.log('[AuthContext] Fazendo upload de avatar pendente...');
          try {
            const uploadPromise = (async () => {
              const response = await fetch(pendingAvatar);
              const blob = await response.blob();
              const file = new File([blob], 'avatar.jpg', { type: blob.type });

              const timestamp = Date.now();
              const filePath = `avatars/${session.user.id}-${timestamp}.jpg`;

              const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: true,
                });

              if (!uploadError) {
                const { data: urlData } = supabase.storage
                  .from('profiles')
                  .getPublicUrl(filePath);
                return urlData.publicUrl;
              }
              return null;
            })();

            const uploadResult = await Promise.race([
              uploadPromise,
              new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 3000)
              )
            ]).catch(err => {
              console.warn('[AuthContext] Timeout/erro ao fazer upload:', err.message);
              return null;
            });

            if (uploadResult) {
              finalAvatar = uploadResult;
              console.log('[AuthContext] Avatar uploaded com sucesso');
            }

            localStorage.removeItem('pending_avatar');
          } catch (e) {
            console.error('[AuthContext] Erro ao fazer upload do avatar:', e);
          }
        }

        // Criar profile no banco (com timeout)
        console.log('[AuthContext] Inserindo profile no banco...');
        const insertProfileResult = await Promise.race([
          supabase.from('profiles').insert({
            id: session.user.id,
            email: profile.email,
            full_name: finalName,
            avatar_url: finalAvatar,
          }),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]).catch(err => {
          console.warn('[AuthContext] Timeout/erro ao inserir profile:', err.message);
          return { error: err };
        });

        if (!insertProfileResult?.error) {
          console.log('[AuthContext] Profile criado com sucesso');

          // Atualizar profile local com os dados finais
          setProfile({
            id: session.user.id,
            name: finalName,
            email: profile.email,
            avatarUrl: finalAvatar,
            role: profile.role,
            churchId: profile.churchId,
            churchName: profile.churchName,
          });
        }
      }
    } else {
      setUser(null);
      setProfile(DEFAULT_PROFILE);
    }
  } catch (error) {
    console.error('Erro fatal em applySession:', error);
    // Em caso de erro, define perfil padrão para não travar
    setUser(null);
    setProfile(DEFAULT_PROFILE);
  } finally {
    // Garante que sempre desativa o loading
    setIsLoading(false);
  }
};

  // Função para verificar hierarquia de roles
  // lider > vocal > instrumental > multimidia > pending
  const hasRole = (minRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      lider: 5,
      vocal: 4,
      instrumental: 3,
      multimidia: 2,
      pending: 1,
    };
    return roleHierarchy[profile.role] >= roleHierarchy[minRole];
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await applySession(data.session);
      } else if (localStorage.getItem(LOCAL_AUTH_KEY) === "true") {
        const localUser = createLocalUser();
        setUser(localUser);
        const storedProfile = getStoredProfile();
        setProfile(storedProfile);
      } else {
        setUser(null);
        setProfile(DEFAULT_PROFILE);
      }
      setIsLoading(false);
      setIsSigningOut(false); // Reset isSigningOut ao inicializar
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AuthContext] Auth state changed:', _event, session?.user?.id);

      // Se o evento é SIGNED_OUT, garante que reseta o estado
      if (_event === 'SIGNED_OUT') {
        console.log('[AuthContext] SIGNED_OUT detectado');
        setUser(null);
        setProfile(DEFAULT_PROFILE);
        setIsSigningOut(false);
        setIsLoading(false);
      } else {
        console.log('[AuthContext] Chamando applySession...');
        // Timeout máximo de 8 segundos para applySession
        Promise.race([
          applySession(session),
          new Promise(resolve => setTimeout(() => {
            console.error('[AuthContext] TIMEOUT GERAL - Forçando loading false');
            setIsLoading(false);
            setIsSigningOut(false);
            resolve(null);
          }, 8000))
        ]);
        setIsSigningOut(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = async (provider: "google" | "apple") => {
    // Usar URL de produção para redirect ou localhost em desenvolvimento
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isLocalhost
      ? window.location.origin
      : 'https://setlistgo.com';

    console.log('Tentando fazer login com redirect para:', redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Erro ao fazer login:', error);
      // Se o provider não está habilitado, mostrar mensagem específica
      if (error.message?.includes("provider is not enabled")) {
        throw new Error("Autenticação do Google não está configurada. Configure no painel do Supabase.");
      }
      throw error;
    }
  };

  const signInFallback = () => {
    const stored = getStoredProfile();
    localStorage.setItem(LOCAL_AUTH_KEY, "true");
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(stored));
    const localUser = createLocalUser();
    setUser(localUser);
    setProfile(stored);
  };

  const signOut = async () => {
    try {
      setIsSigningOut(true);

      // Limpa o auth do Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer signOut no Supabase:', error);
      }

      // Limpa todo localStorage relacionado à autenticação
      localStorage.removeItem(LOCAL_AUTH_KEY);
      localStorage.removeItem(LOCAL_PROFILE_KEY);
      localStorage.removeItem('pending_registration');
      localStorage.removeItem('pending_avatar');

      // Limpa preferências de evento selecionado
      localStorage.removeItem('selectedEventId');

      // Limpar estado local
      setUser(null);
      setProfile(DEFAULT_PROFILE);
      setIsLoading(false);

    } catch (error) {
      console.error('Erro durante logout:', error);
      // Mesmo com erro, limpa os estados
      setUser(null);
      setProfile(DEFAULT_PROFILE);
      setIsLoading(false);
    } finally {
      // NÃO define isSigningOut como false aqui
      // Deixa como true para forçar o redirect no ProtectedRoute
    }
  };

  const updateProfile = async (updates: Partial<AuthProfile>) => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.name,
        email: updates.email,
        avatar_url: updates.avatarUrl,
      })
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    // Atualizar estado local
    setProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error("O arquivo deve ser uma imagem");
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("A imagem deve ter no máximo 5MB");
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obter URL pública com cache busting
    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    // Adicionar timestamp para forçar reload
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

    // Atualizar perfil com nova URL
    await updateProfile({ avatarUrl: data.publicUrl });

    // Atualizar estado local com URL com cache busting
    setProfile((prev) => ({
      ...prev,
      avatarUrl,
    }));

    return avatarUrl;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isSigningOut,
        signInWithProvider,
        signOut,
        signInFallback,
        updateProfile,
        uploadAvatar,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
