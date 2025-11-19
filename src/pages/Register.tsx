import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithProvider } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarFile: null as File | null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [useGoogleAuth, setUseGoogleAuth] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setFormData({ ...formData, avatarFile: file });

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Por favor, preencha seu nome");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Por favor, preencha seu email");
      return;
    }

    if (!useGoogleAuth) {
      if (!formData.password) {
        toast.error("Por favor, crie uma senha");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("A senha deve ter no mínimo 6 caracteres");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
    }

    try {
      setIsLoading(true);

      if (useGoogleAuth) {
        // Salvar dados no localStorage temporariamente
        localStorage.setItem('pending_registration', JSON.stringify({
          name: formData.name,
          email: formData.email,
        }));

        // Se tiver foto, converter para base64 e salvar
        if (formData.avatarFile) {
          const reader = new FileReader();
          reader.onloadend = () => {
            localStorage.setItem('pending_avatar', reader.result as string);
          };
          reader.readAsDataURL(formData.avatarFile);
        }

        // Iniciar OAuth do Google
        await signInWithProvider("google");
        toast.info("Redirecionando para o Google...");
      } else {
        // Cadastro com email/senha
        const { supabase } = await import("@/lib/supabase");

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          let avatarUrl = null;

          // Se tiver foto, fazer upload
          if (formData.avatarFile) {
            const timestamp = Date.now();
            const fileExt = formData.avatarFile.name.split('.').pop();
            const filePath = `avatars/${data.user.id}-${timestamp}.${fileExt}`;

            console.log('Fazendo upload da foto:', filePath);

            const { error: uploadError } = await supabase.storage
              .from('profiles')
              .upload(filePath, formData.avatarFile, {
                cacheControl: '3600',
                upsert: true,
              });

            if (uploadError) {
              console.error('Erro ao fazer upload da foto:', uploadError);
              toast.error(`Erro ao fazer upload da foto: ${uploadError.message}`);
            } else {
              const { data: urlData } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath);
              avatarUrl = urlData.publicUrl;
              console.log('URL da foto gerada:', avatarUrl);
            }
          }

          const profilePayload = {
            email: formData.email,
            full_name: formData.name,
            avatar_url: avatarUrl,
          };

          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update(profilePayload)
            .eq('id', data.user.id);

          if (profileUpdateError) {
            console.error('Erro ao atualizar perfil:', profileUpdateError);
            toast.error(`Erro ao atualizar perfil: ${profileUpdateError.message}`);
          }

          toast.success("Cadastro realizado! Você já pode fazer login.");
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar conta");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center pt-4 pb-4">
        <BrandLogo size="lg" className="text-white" />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md space-y-8">
          {/* Título */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Cadastre-se grátis
            </h1>
            <p className="text-white/60 text-sm">
              Preencha seus dados para começar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-white/40" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#1DB954] text-black rounded-full p-2 hover:bg-[#1ed760] transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-white/50">
                Adicionar foto de perfil (opcional)
              </p>
            </div>

            {/* Nome completo */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Nome completo</label>
              <Input
                type="text"
                placeholder="Digite seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-md"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-md"
                required
              />
            </div>

            {/* Campos de senha (mostrados apenas se não usar Google) */}
            {!useGoogleAuth && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Senha</label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-md"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Confirmar senha</label>
                  <Input
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-md"
                    required
                  />
                </div>
              </>
            )}

            {/* Botão de cadastro */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] hover:scale-105 py-6 rounded-full text-base font-bold transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Carregando...
                </div>
              ) : useGoogleAuth ? (
                "Continuar com Google"
              ) : (
                "Criar conta"
              )}
            </Button>

            {/* Toggle entre email/senha e Google */}
            <button
              type="button"
              onClick={() => setUseGoogleAuth(!useGoogleAuth)}
              className="w-full text-sm text-white/70 hover:text-white transition-colors"
            >
              {useGoogleAuth ? (
                "Prefiro usar email e senha"
              ) : (
                "Ou continuar com Google"
              )}
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
            </div>

            {/* Link para login */}
            <div className="text-center">
              <p className="text-white/70 text-sm">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#1DB954] font-semibold hover:underline"
                >
                  Faça login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-8">
        <p className="text-xs text-white/50 text-center leading-relaxed">
          Ao se cadastrar, você concorda com nossos{" "}
          <a href="#" className="underline hover:text-white transition-colors">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="#" className="underline hover:text-white transition-colors">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Register;
