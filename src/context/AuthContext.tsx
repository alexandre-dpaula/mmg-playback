import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthProfile = {
  name: string;
  email: string;
  avatarUrl: string;
};

type AuthContextType = {
  user: User | null;
  profile: AuthProfile;
  isLoading: boolean;
  signInWithProvider: (provider: "google" | "apple") => Promise<void>;
  signOut: () => Promise<void>;
  signInFallback: () => void;
  updateProfile: (updates: Partial<AuthProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
};

const DEFAULT_PROFILE: AuthProfile = {
  name: "Alexandre Dpaula",
  email: "contato.m2bstudio@gmail.com",
  avatarUrl: "/perfil.jpg",
};

const LOCAL_AUTH_KEY = "mmg_local_auth";
const LOCAL_PROFILE_KEY = "mmg_local_profile";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredProfile = (): AuthProfile => {
  const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
  if (!raw) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(raw) as AuthProfile;
    return {
      name: parsed.name || DEFAULT_PROFILE.name,
      email: parsed.email || DEFAULT_PROFILE.email,
      avatarUrl: parsed.avatarUrl || DEFAULT_PROFILE.avatarUrl,
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

  const applySession = async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user);

      // Buscar perfil do banco de dados
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('Perfil buscado do banco:', profileData);
      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
      }

      const profile: AuthProfile = {
        name:
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
      };

      console.log('Profile criado:', profile);
      setProfile(profile);

      // Atualizar perfil no banco se não existir ou estiver desatualizado
      if (!profileData) {
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
          } catch (e) {
            console.error('Erro ao processar registro pendente:', e);
          }
        }

        // Se houver avatar pendente, fazer upload
        if (pendingAvatar) {
          try {
            // Converter base64 para blob
            const response = await fetch(pendingAvatar);
            const blob = await response.blob();
            const file = new File([blob], 'avatar.jpg', { type: blob.type });

            // Upload do avatar
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
              finalAvatar = urlData.publicUrl;
            }

            localStorage.removeItem('pending_avatar');
          } catch (e) {
            console.error('Erro ao fazer upload do avatar:', e);
          }
        }

        await supabase.from('profiles').insert({
          id: session.user.id,
          email: profile.email,
          full_name: finalName,
          avatar_url: finalAvatar,
        });

        // Atualizar profile local com os dados finais
        setProfile({
          name: finalName,
          email: profile.email,
          avatarUrl: finalAvatar,
        });
      }
    } else {
      setUser(null);
      setProfile(DEFAULT_PROFILE);
    }
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
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
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
      : 'https://mmg-playback.vercel.app';

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
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
    localStorage.removeItem(LOCAL_PROFILE_KEY);
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
        signInWithProvider,
        signOut,
        signInFallback,
        updateProfile,
        uploadAvatar,
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
