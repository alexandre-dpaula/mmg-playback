import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const CounterAnimation: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 segundos para completar a animação
    const targetValue = 1000;
    const increment = targetValue / (duration / 16); // 60 FPS
    let currentValue = 0;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(currentValue));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-white font-bold">
      {count}k
    </span>
  );
};

const Login: React.FC = () => {
  const { signInWithProvider, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  React.useEffect(() => {
    if (!isLoading && user) {
      navigate("/", { replace: true });
    }
  }, [isLoading, user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithProvider("google");
      toast.info("Redirecionando para o Google...");
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      toast.error("Não foi possível iniciar o login. Tente novamente.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha email e senha");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error(error instanceof Error ? error.message : "Email ou senha incorretos");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-[#1DB954]/20 border-t-[#1DB954] rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
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

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-0 relative z-10">
        {/* Card com glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#1DB954]/30 via-purple-500/30 to-[#1DB954]/30 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>

          {/* Glassmorphism card */}
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Título com animação */}
            <div className="text-center space-y-0 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-0"
              >
                <p className="text-sm font-light text-white/50 tracking-[0.2em] uppercase">
                  Bem-vindo a
                </p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-5"
                >
                  <BrandLogo size="xl" className="drop-shadow-2xl" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1DB954]/10 to-transparent blur-xl"></div>
                <p className="relative text-lg font-light text-white leading-[1.1] tracking-normal mb-[50px]">
                  Milhões de músicas e cifras<br />
                  <span className="text-white font-light">para os seus repertórios</span>
                </p>
              </motion.div>
            </div>

            {/* Formulário / Botões de login com animação de entrada */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-4 pt-4"
            >
              <AnimatePresence mode="wait">
                {showEmailLogin ? (
                  /* Formulário de login com email/senha */
                  <motion.form
                    key="email-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleEmailLogin}
                    className="space-y-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl text-base focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <PasswordInput
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-xl text-base focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]/30 transition-all"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] py-6 rounded-full text-base font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#1DB954]/30 hover:shadow-[#1DB954]/50"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Entrando...
                            </div>
                          ) : (
                            "Entrar"
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      type="button"
                      onClick={() => setShowEmailLogin(false)}
                      className="w-full text-sm text-white/70 hover:text-white transition-colors mt-4"
                    >
                      Voltar para outras opções
                    </motion.button>
                  </motion.form>
                ) : (
                  /* Botões de cadastro e Google */
                  <motion.div
                    key="buttons"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => navigate("/register")}
                        className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] py-6 rounded-full text-base font-bold transition-all shadow-lg shadow-[#1DB954]/30 hover:shadow-[#1DB954]/50"
                      >
                        Cadastrar-se grátis
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50 py-6 rounded-full text-base font-bold gap-3 transition-all shadow-lg hover:shadow-xl"
                      >
                        <img
                          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                          alt="Google"
                          className="h-6 w-6"
                        />
                        Continuar com o Google
                      </Button>
                    </motion.div>

                    {/* Divider */}
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.3 }}
                      className="relative py-4"
                    >
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                    </motion.div>

                    {/* Link para login com email */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center"
                    >
                      <p className="text-white/70 text-sm">
                        Já tem uma conta?{" "}
                        <button
                          type="button"
                          onClick={() => setShowEmailLogin(true)}
                          className="text-[#1DB954] font-semibold hover:underline transition-colors"
                        >
                          Faça login
                        </button>
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer com animação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="px-8 pb-8"
      >
        <p className="text-xs text-white/50 text-center leading-relaxed">
          Esta página usa cookies. Consulte nossa{" "}
          <a href="#" className="underline hover:text-white transition-colors">
            Política de Cookies
          </a>{" "}
          para mais informações.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
