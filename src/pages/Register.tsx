import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
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

          toast.success("Cadastro realizado com sucesso!");
          setTimeout(() => navigate("/role-selection"), 1500);
        }
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao criar conta");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative text-white flex flex-col overflow-hidden">
      {/* Gradiente animado de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1DB954]/10 via-transparent to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Partículas flutuantes com Framer Motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#1DB954] rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              opacity: [0, Math.random() * 0.5, 0],
              scale: [0, Math.random() * 1.5, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-6 relative z-10"
      >
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
        className="flex justify-center pt-4 pb-4 relative z-10"
      >
        <BrandLogo size="lg" className="text-white drop-shadow-2xl" />
      </motion.div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative z-10">
        {/* Card com glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="w-full max-w-md relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#1DB954]/30 via-purple-500/30 to-[#1DB954]/30 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>

          {/* Glassmorphism card */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center space-y-2 mb-8"
            >
              <h1 className="text-4xl font-bold tracking-tight">
                Cadastre-se grátis
              </h1>
              <p className="text-white/60 text-sm">
                Preencha seus dados para começar
              </p>
            </motion.div>

            {/* Formulário */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Foto de perfil */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex flex-col items-center gap-3"
              >
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
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute bottom-0 right-0 bg-[#1DB954] text-black rounded-full p-2 hover:bg-[#1ed760] transition-colors shadow-lg shadow-[#1DB954]/30"
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
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
              </motion.div>

              {/* Nome completo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold">Nome completo</label>
                <Input
                  type="text"
                  placeholder="Digite seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all"
                  required
                />
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all"
                  required
                />
              </motion.div>

              {/* Campos de senha (mostrados apenas se não usar Google) */}
              <AnimatePresence>
                {!useGoogleAuth && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 1.0, duration: 0.5 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-semibold">Senha</label>
                      <PasswordInput
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-semibold">Confirmar senha</label>
                      <PasswordInput
                        placeholder="Digite a senha novamente"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all"
                        required
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Botão de cadastro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] py-6 rounded-full text-base font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#1DB954]/30 hover:shadow-[#1DB954]/50"
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
                </motion.div>
              </motion.div>

              {/* Toggle entre email/senha e Google */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                type="button"
                onClick={() => setUseGoogleAuth(!useGoogleAuth)}
                className="w-full text-sm text-white/70 hover:text-white transition-colors"
              >
                {useGoogleAuth ? (
                  "Prefiro usar email e senha"
                ) : (
                  "Ou continuar com Google"
                )}
              </motion.button>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="relative py-2"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
              </motion.div>

              {/* Link para login */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="text-center"
              >
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
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="px-8 pb-8 relative z-10"
      >
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
      </motion.div>
    </div>
  );
};

export default Register;
