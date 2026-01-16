# ⚡ Teste Rápido em 3 Passos

## 🎯 Opção 1: Adicionar Rota (Mais Simples)

### Passo 1: Localizar arquivo de rotas

Encontre onde suas rotas estão definidas. Geralmente é:
- `src/App.tsx`
- `src/main.tsx`
- `src/routes.tsx`
- `src/router/index.tsx`

### Passo 2: Adicionar import

No topo do arquivo, adicione:

```tsx
import TesteCifras from './pages/TesteCifras';
```

### Passo 3: Adicionar rota

Onde estão suas outras rotas (`<Route ... />`), adicione:

```tsx
<Route path="/teste-cifras" element={<TesteCifras />} />
```

### Passo 4: Acessar

Abra no navegador:
```
http://localhost:5173/teste-cifras
```

---

## 🎯 Opção 2: Teste Direto (Sem Rota)

### Substitua temporariamente uma página existente

1. Abra qualquer página/componente (ex: `src/pages/Index.tsx`)
2. No topo, adicione:
   ```tsx
   import ChordStudyDemo from '@/features/study-mode/ChordStudyDemo';
   ```
3. Dentro do return, adicione:
   ```tsx
   return <ChordStudyDemo />;
   ```
4. Acesse a página normalmente

---

## 🎯 Opção 3: Teste em Componente Existente

### Adicione em qualquer lugar da sua aplicação

```tsx
import { IntegratedChordStudy } from '@/features/study-mode/components/IntegratedChordStudy';

function MinhaPage() {
  const cifra = `
    G            D
    Quão grande é o meu Deus
    Em7          C
    Cantarei quão grande é o meu Deus
  `;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teste de Cifras</h1>
      <IntegratedChordStudy text={cifra} />
    </div>
  );
}
```

---

## 📋 O Que Você Verá

1. **Header bonito** com título e descrição
2. **Cards de recursos** (Parser, Transposição, Diagramas)
3. **Seletor de exemplos** com 4 músicas pré-carregadas
4. **Opção de cifra personalizada** para colar sua própria cifra
5. **Controles de transposição** (botões +/- e seletor de tom)
6. **Cifra interativa** com acordes clicáveis
7. **Diagrama CAGED** do lado direito

---

## 🎸 Como Testar

### Teste 1: Exemplo Pré-carregado
1. Clique em "Quão Grande É o Meu Deus"
2. Veja a cifra aparecer
3. Clique em um acorde (ex: "G")
4. Diagrama deve aparecer à direita

### Teste 2: Transposição
1. Clique no botão "+" (transpor meio tom acima)
2. Veja todos os acordes mudarem
3. Tom atual deve mostrar "Ab" (se começou em G)
4. Clique em "Reset" para voltar

### Teste 3: Seletor de Tom
1. Clique em qualquer tonalidade (ex: "D")
2. Cifra deve transpor automaticamente para D
3. Diagrama deve atualizar

### Teste 4: Cifra Personalizada
1. Clique em "Cifra Personalizada"
2. Cole uma cifra sua
3. Sistema deve detectar acordes automaticamente
4. Clique nos acordes para ver diagramas

---

## 🐛 Se Algo Não Funcionar

### Erro de importação
**Problema:** `Module not found: @/features/study-mode/...`

**Solução:** Verifique se o alias `@` está configurado no `vite.config.ts`:
```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Página em branco
**Problema:** Nada aparece

**Solução 1:** Abra o console (F12) e veja se há erros
**Solução 2:** Verifique se o build está rodando (`npm run dev`)
**Solução 3:** Limpe o cache (`npm run build` novamente)

### Estilos não aparecem
**Problema:** Página sem CSS

**Solução:** Certifique-se que Tailwind CSS está configurado

---

## ✅ Exemplo Completo de Rota

Se você usa React Router, seu arquivo deve ficar assim:

```tsx
// src/App.tsx ou src/main.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TesteCifras from './pages/TesteCifras';
// ... outros imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Suas rotas existentes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* NOVA ROTA DE TESTE */}
        <Route path="/teste-cifras" element={<TesteCifras />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🎉 Pronto!

Agora é só acessar:
```
http://localhost:5173/teste-cifras
```

E começar a testar todas as funcionalidades! 🎸

---

## 📞 Documentação Completa

Para mais detalhes sobre o sistema, consulte:
- [`COMO_TESTAR_SISTEMA_CIFRAS.md`](COMO_TESTAR_SISTEMA_CIFRAS.md) - Guia completo de testes
- [`src/features/study-mode/README_SISTEMA_CIFRAS.md`](src/features/study-mode/README_SISTEMA_CIFRAS.md) - Documentação da API
- [`RESUMO_IMPLEMENTACAO_ECOSSISTEMA.md`](RESUMO_IMPLEMENTACAO_ECOSSISTEMA.md) - Visão geral do projeto
