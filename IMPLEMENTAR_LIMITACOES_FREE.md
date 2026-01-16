# 🔒 Implementar Limitações do Plano FREE

## 📋 Regras de Limitação

### Plano FREE (Gratuito)
- ✅ 1 evento permitido
- ✅ 1 música permitida (total, não por evento)
- ❌ Modo Ensaio bloqueado

### Plano PRO (Pago)
- ✅ Eventos ilimitados
- ✅ Músicas ilimitadas
- ✅ Modo Ensaio liberado
- ✅ Todos os recursos

---

## 🛠️ Arquivos Criados

### 1. Hook de Limitação
**Arquivo:** `src/hooks/useSubscriptionLimits.ts`

Verifica automaticamente:
- Assinatura ativa do usuário
- Contagem de eventos criados
- Contagem de músicas adicionadas
- Retorna permissões baseadas no plano

### 2. Componente de Upgrade
**Arquivo:** `src/components/subscription/UpgradePrompt.tsx`

Modal que aparece quando usuário atinge limite, com:
- Explicação do bloqueio
- Recursos do plano PRO
- Botão para assinar

---

## 📝 Como Implementar nos Componentes

### Exemplo 1: Bloquear Criação de Evento

```typescript
import { useState } from 'react';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { CheckoutDialog } from '@/components/subscription/CheckoutDialog';

function EventsPage() {
  const {
    canCreateEvents,
    hasReachedEventLimit,
    isPro,
    eventCount,
    maxEvents
  } = useSubscriptionLimits();

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCreateEvent = () => {
    if (!canCreateEvents) {
      setShowUpgrade(true);
      return;
    }

    // Lógica normal de criar evento
  };

  return (
    <>
      <button onClick={handleCreateEvent}>
        Criar Evento
      </button>

      {/* Mostrar limite */}
      {!isPro && (
        <p>
          Eventos: {eventCount}/{maxEvents}
        </p>
      )}

      {/* Modal de upgrade */}
      <UpgradePrompt
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        onUpgrade={() => {
          setShowUpgrade(false);
          setShowCheckout(true);
        }}
        reason="events"
      />

      {/* Modal de checkout */}
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
      />
    </>
  );
}
```

### Exemplo 2: Bloquear Adicionar Música

```typescript
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

function AddTrackPage() {
  const {
    canCreateTracks,
    hasReachedTrackLimit,
    isPro,
    trackCount,
    maxTracksPerEvent
  } = useSubscriptionLimits();

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleAddTrack = () => {
    if (!canCreateTracks) {
      setShowUpgrade(true);
      return;
    }

    // Lógica normal de adicionar música
  };

  return (
    <>
      <button onClick={handleAddTrack}>
        Adicionar Música
      </button>

      {/* Mostrar limite */}
      {!isPro && (
        <p>
          Músicas: {trackCount}/{maxTracksPerEvent}
        </p>
      )}

      <UpgradePrompt
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        onUpgrade={() => {
          setShowUpgrade(false);
          setShowCheckout(true);
        }}
        reason="tracks"
      />

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
      />
    </>
  );
}
```

### Exemplo 3: Bloquear Modo Ensaio

```typescript
import { useNavigate } from 'react-router-dom';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

function RehearsalModeButton() {
  const navigate = useNavigate();
  const { canAccessRehearsalMode, isPro } = useSubscriptionLimits();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleClickRehearsal = () => {
    if (!canAccessRehearsalMode) {
      setShowUpgrade(true);
      return;
    }

    navigate('/rehearsal');
  };

  return (
    <>
      <button onClick={handleClickRehearsal}>
        {!isPro && <Lock className="w-4 h-4 mr-2" />}
        Modo Ensaio
      </button>

      <UpgradePrompt
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        onUpgrade={() => {
          setShowUpgrade(false);
          setShowCheckout(true);
        }}
        reason="rehearsal"
      />

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
      />
    </>
  );
}
```

---

## 🎯 Onde Implementar

### 1. Página de Eventos (`src/pages/Events.tsx`)
- Bloquear botão "Criar Evento" quando `!canCreateEvents`
- Mostrar badge FREE/PRO
- Mostrar contador de eventos

### 2. Página Adicionar Música (`src/pages/AddTrack.tsx`)
- Bloquear formulário quando `!canCreateTracks`
- Mostrar limite atingido

### 3. Componente de Menu/Sidebar
- Adicionar ícone de cadeado no "Modo Ensaio" se `!isPro`
- Bloquear navegação para modo ensaio

### 4. Modo Ensaio/ProMode (`src/pages/ProModePage.tsx`)
- Adicionar proteção na rota
- Redirecionar para upgrade se não for PRO

---

## 🔐 Proteção de Rotas

Criar um componente `ProtectedProRoute`:

```typescript
// src/components/ProtectedProRoute.tsx
import { Navigate } from 'react-router-dom';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Loader2 } from 'lucide-react';

export function ProtectedProRoute({ children }: { children: React.ReactNode }) {
  const { isPro, isLoading } = useSubscriptionLimits();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
      </div>
    );
  }

  if (!isPro) {
    return <Navigate to="/subscription/upgrade" replace />;
  }

  return <>{children}</>;
}
```

Usar nas rotas:

```typescript
// src/App.tsx
import { ProtectedProRoute } from './components/ProtectedProRoute';

<Route
  path="/pro-mode"
  element={
    <ProtectedProRoute>
      <ProModePage />
    </ProtectedProRoute>
  }
/>
```

---

## 🎨 Badges e Indicadores Visuais

### Badge PRO

```typescript
function ProBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#1DB954] to-emerald-500 text-white">
      ✨ PRO
    </span>
  );
}
```

### Badge FREE

```typescript
function FreeBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/70">
      FREE
    </span>
  );
}
```

### Limite de Uso

```typescript
function UsageIndicator({ current, max, label }: { current: number; max: number; label: string }) {
  const percentage = (current / max) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="text-white font-medium">{current}/{max}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1DB954] to-emerald-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

### Backend/Database
- [x] Migration `subscriptions` criada
- [x] Edge Function `stripe-checkout` criada
- [x] Edge Function `stripe-webhook` criada
- [ ] Migration aplicada no Supabase
- [ ] Edge Functions deployadas

### Frontend
- [x] Hook `useSubscriptionLimits` criado
- [x] Componente `UpgradePrompt` criado
- [ ] Componente `ProtectedProRoute` criado
- [ ] Implementar limitação em `Events.tsx`
- [ ] Implementar limitação em `AddTrack.tsx`
- [ ] Implementar bloqueio em Modo Ensaio
- [ ] Adicionar badges PRO/FREE
- [ ] Adicionar indicadores de uso

### Stripe
- [ ] Produto criado no Stripe
- [ ] Preço configurado (R$ 9,98/mês)
- [ ] Price ID atualizado no código
- [ ] Webhook configurado
- [ ] Teste de pagamento realizado

---

## 🧪 Como Testar

### 1. Testar Limite de Eventos
1. Crie um evento (deve funcionar)
2. Tente criar um segundo evento (deve bloquear e mostrar modal de upgrade)

### 2. Testar Limite de Músicas
1. Adicione uma música (deve funcionar)
2. Tente adicionar segunda música (deve bloquear)

### 3. Testar Modo Ensaio
1. Tente acessar modo ensaio sem ser PRO (deve bloquear)
2. Assine PRO
3. Acesse modo ensaio (deve funcionar)

### 4. Testar Upgrade
1. Clique em "Assinar PRO"
2. Complete checkout com cartão de teste
3. Verifique que todas as limitações foram removidas

---

**Próximo passo:** Aplicar as implementações nos componentes existentes!
