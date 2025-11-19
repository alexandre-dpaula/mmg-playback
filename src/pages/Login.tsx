import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black text-white flex flex-col relative overflow-hidden">
      {/* Partículas de fundo animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#1DB954]/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-0 relative z-10">
        <div className="w-full max-w-md space-y-0">
          {/* Título com animação */}
          <div className="text-center space-y-0">
            <div className="space-y-0">
              <p className="text-sm font-light text-white/50 tracking-[0.2em] uppercase animate-fade-in-up" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
                Bem-vindo a
              </p>
              <div className="flex justify-center mb-5 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                <BrandLogo size="xl" className="drop-shadow-2xl" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1DB954]/10 to-transparent blur-xl"></div>
              <p className="relative text-lg font-light text-white leading-[1.1] tracking-normal animate-fade-in-up mb-[50px]" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                Milhões de músicas e cifras<br />
                <span className="text-white font-light">para os seus repertórios</span>
              </p>
            </div>
          </div>

          {/* Formulário / Botões de login com animação de entrada */}
          <div className="space-y-4 pt-8 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            {showEmailLogin ? (
              /* Formulário de login com email/senha */
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-md text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 rounded-md text-base"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] hover:scale-105 py-6 rounded-full text-base font-bold transition-all disabled:opacity-50"
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

                <button
                  type="button"
                  onClick={() => setShowEmailLogin(false)}
                  className="w-full text-sm text-white/70 hover:text-white transition-colors"
                >
                  Voltar para outras opções
                </button>
              </form>
            ) : (
              /* Botões de cadastro e Google */
              <>
                <Button
                  onClick={() => navigate("/register")}
                  className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] hover:scale-105 py-6 rounded-full text-base font-bold transition-all"
                >
                  Cadastrar-se grátis
                </Button>

                <Button
                  onClick={handleGoogleLogin}
                  className="w-full bg-transparent border border-white/30 text-white hover:border-white hover:scale-105 py-6 rounded-full text-base font-bold gap-3 transition-all"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-6 w-6"
                  />
                  Continuar com o Google
                </Button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                </div>

                {/* Link para login com email */}
                <div className="text-center">
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer com animação */}
      <div className="px-8 pb-8 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
        <p className="text-xs text-white/50 text-center leading-relaxed">
          Esta página usa cookies. Consulte nossa{" "}
          <a href="#" className="underline hover:text-white transition-colors">
            Política de Cookies
          </a>{" "}
          para mais informações.
        </p>
      </div>
    </div>
  );
};

export default Login;
