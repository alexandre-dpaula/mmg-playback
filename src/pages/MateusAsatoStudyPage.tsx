import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Book, Target, Brain, Dumbbell, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { GuitarFretboardDiagram } from "@/components/GuitarFretboardDiagram";

/**
 * Página de Estudo: Mateus Asato - Domine o Braço
 * Baseado no método JV Academy com módulos, diagramas e exercícios práticos
 */
const MateusAsatoStudyPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const toggleModule = (moduleId: number) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const modules = [
    {
      id: 1,
      icon: Brain,
      title: "Fundamentos do Braço",
      color: "blue",
      topics: [
        "Função do bíceps, tríceps e antebraço",
        "Por que o tríceps representa a maior parte do volume do braço",
        "Diferença entre treinar braço e estimular braço",
      ],
      keyLearning: "Braço grande = tríceps bem trabalhado + bíceps bem estimulado",
      exercise: "Quais exercícios do seu treino atual realmente focam o tríceps?",
      diagram: true,
    },
    {
      id: 2,
      icon: Target,
      title: "Execução e Técnica",
      color: "purple",
      topics: [
        "Amplitude completa",
        "Controle do movimento",
        "Fase excêntrica (volta do exercício)",
      ],
      keyLearning: "Técnica ruim = crescimento limitado, mesmo com carga alta",
      exercise: "Reduza carga, aumente controle, priorize qualidade do movimento",
      diagram: false,
    },
    {
      id: 3,
      icon: Dumbbell,
      title: "Volume, Séries e Repetições",
      color: "green",
      topics: [
        "Quantidade ideal de séries semanais",
        "Repetições focadas em hipertrofia",
        "Descanso entre séries",
      ],
      keyLearning: "Braço responde melhor a volume bem distribuído, não a um único dia pesado",
      exercise: "Séries moderadas + Frequência maior + Descanso controlado",
      diagram: true,
    },
    {
      id: 4,
      icon: TrendingUp,
      title: "Frequência de Treino",
      color: "yellow",
      topics: [
        "Treinar braço 1x vs 2x na semana",
        "Combinar braço com outros grupos musculares",
      ],
      keyLearning: "Braço cresce melhor quando é estimulado mais de uma vez por semana",
      exercise: "Reorganize seu treino para estimular bíceps e tríceps em dias diferentes",
      diagram: false,
    },
    {
      id: 5,
      icon: AlertCircle,
      title: "Erros Comuns",
      color: "red",
      topics: [
        "Roubar no movimento",
        "Treinar só bíceps",
        "Ignorar descanso e recuperação",
        "Copiar treino sem entender o propósito",
      ],
      keyLearning: "Crescimento é estratégia, não ego",
      exercise: "Identifique qual desses erros você comete",
      diagram: false,
    },
    {
      id: 6,
      icon: TrendingUp,
      title: "Progressão Real",
      color: "indigo",
      topics: [
        "Progressão de carga",
        "Progressão de repetições",
        "Progressão de controle",
      ],
      keyLearning: "Progredir não é só levantar mais peso, é treinar melhor",
      exercise: "Defina uma meta de progressão para este mês",
      diagram: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/study/pro")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Mateus Asato</span>
        </button>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Mateus Asato
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Domine o Braço da Guitarra
          </h1>
          <p className="text-white/60 text-lg">
            Entenda como memorizar e visualizar as notas espalhadas pelo braço
            da guitarra de forma eficiente, estratégica e consciente.
          </p>
        </div>

        {/* Objetivo */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <Target className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Objetivo do Estudo
              </h2>
              <p className="text-white/80 mb-4">
                Desenvolver domínio completo do braço através de:
              </p>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Execução consciente (técnica + estímulo correto)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Volume, frequência e progressão estratégica
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Memorização das 8 aberturas principais
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ciclo de Estudo */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-400" />
            Ciclo de Aprendizado
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {["Ler", "Entender", "Aplicar", "Revisar"].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-white/60">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Módulos */}
        <div className="space-y-4 mb-12">
          {modules.map((module) => {
            const Icon = module.icon;
            const isExpanded = expandedModule === module.id;

            return (
              <div
                key={module.id}
                className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Header do Módulo */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-white/40 mb-1">
                        MÓDULO {module.id}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {module.title}
                      </h3>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  )}
                </button>

                {/* Conteúdo do Módulo */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6">
                    {/* O que estudar */}
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 mb-3">
                        O QUE ESTUDAR
                      </h4>
                      <ul className="space-y-2">
                        {module.topics.map((topic, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-white/70"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Aprendizado-chave */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-blue-400 mb-2">
                        APRENDIZADO-CHAVE
                      </h4>
                      <p className="text-white font-medium">
                        {module.keyLearning}
                      </p>
                    </div>

                    {/* Diagrama */}
                    {module.diagram && module.id <= 8 && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h4 className="text-sm font-semibold text-white/60 mb-4">
                          DIAGRAMA VISUAL
                        </h4>
                        <div className="flex justify-center">
                          <GuitarFretboardDiagram
                            abertura={module.id as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}
                            className="w-full max-w-4xl"
                          />
                        </div>
                      </div>
                    )}

                    {/* Exercício Prático */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-blue-400 mb-2">
                        EXERCÍCIO PRÁTICO
                      </h4>
                      <p className="text-white/80">{module.exercise}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumo Final */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Book className="w-6 h-6 text-blue-400" />
            Resumo Final
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Braço grande vem do tríceps",
              "Técnica > carga",
              "Frequência vence intensidade isolada",
              "Volume bem feito gera resultado",
              "Constância é o diferencial",
              "8 aberturas principais = domínio total",
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">
                  ✓
                </span>
                <span className="text-white/80">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rotina de Estudo */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Rotina de Estudo Sugerida
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { day: "Dia 1", content: "Fundamentos + Técnica" },
              { day: "Dia 2", content: "Volume + Frequência" },
              { day: "Dia 3", content: "Erros + Progressão" },
              { day: "Dia 4", content: "Revisão geral + aplicação no treino" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-white/10 rounded-lg p-4"
              >
                <div className="text-sm text-blue-400 font-semibold mb-1">
                  {item.day}
                </div>
                <div className="text-white/70">{item.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateusAsatoStudyPage;
