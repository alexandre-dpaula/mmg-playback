# 🔧 Ajustes no Código da Aplicação

## 📋 O Que Pode Precisar Mudar

Após aplicar as migrations RLS, você **pode** precisar ajustar alguns pontos no código da aplicação para garantir que as queries funcionem corretamente com as novas políticas.

---

## 1️⃣ Criar Música GLOBAL (church_id = NULL)

### **Onde:** Quando usuário adiciona uma música NOVA pela primeira vez

### **ANTES (pode estar fazendo):**
```typescript
// ❌ ERRADO: Passando church_id sempre
const { data, error } = await supabase
  .from('tracks')
  .insert({
    name: 'Amazing Grace',
    artist: 'John Newton',
    key: 'G',
    church_id: userChurchId, // ❌ Isso cria cópia privada direto
  });
```

### **DEPOIS (correto):**
```typescript
// ✅ CORRETO: Criar como GLOBAL primeiro
const { data, error } = await supabase
  .from('tracks')
  .insert({
    name: 'Amazing Grace',
    artist: 'John Newton',
    key: 'G',
    church_id: null, // ✅ NULL = música global
  });
```

---

## 2️⃣ Editar Música → Criar Cópia Privada

### **Lógica:**
Quando usuário EDITA uma música global (muda tom, letra, cifra), você deve:
1. Verificar se já existe cópia privada
2. Se existe: atualizar a cópia
3. Se **não** existe: criar nova cópia com `church_id`

### **Implementação:**

```typescript
// Função para editar música
async function editarMusica(trackId: string, updates: Partial<Track>) {
  const userChurchId = await getUserChurchId(); // Pegar church_id do usuário

  // 1. Buscar a música original
  const { data: originalTrack } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', trackId)
    .single();

  if (!originalTrack) {
    throw new Error('Música não encontrada');
  }

  // 2. Verificar se é música GLOBAL (church_id = null)
  if (originalTrack.church_id === null) {
    // É global! Precisamos criar uma CÓPIA PRIVADA

    // Verificar se já existe cópia privada desta música
    const { data: copiaPrivada } = await supabase
      .from('tracks')
      .select('*')
      .eq('name', originalTrack.name) // Mesmo nome
      .eq('artist', originalTrack.artist) // Mesmo artista
      .eq('church_id', userChurchId) // Da minha igreja
      .single();

    if (copiaPrivada) {
      // Já existe cópia, apenas atualizar
      const { data, error } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', copiaPrivada.id)
        .select()
        .single();

      return { data, error };
    } else {
      // Não existe cópia, criar nova
      const { data, error } = await supabase
        .from('tracks')
        .insert({
          ...originalTrack, // Copiar todos os campos da original
          ...updates, // Aplicar mudanças
          id: undefined, // Gerar novo ID
          church_id: userChurchId, // ✅ Marcar como cópia privada
          created_at: undefined,
          updated_at: undefined,
        })
        .select()
        .single();

      return { data, error };
    }
  } else {
    // Já é cópia privada, apenas atualizar
    const { data, error } = await supabase
      .from('tracks')
      .update(updates)
      .eq('id', trackId)
      .eq('church_id', userChurchId) // RLS vai validar
      .select()
      .single();

    return { data, error };
  }
}
```

---

## 3️⃣ Listar Músicas (Globais + Privadas)

### **ANTES (se estava filtrando por church_id):**
```typescript
// ❌ Isso vai mostrar apenas cópias privadas
const { data } = await supabase
  .from('tracks')
  .select('*')
  .eq('church_id', userChurchId);
```

### **DEPOIS (correto):**
```typescript
// ✅ RLS já filtra automaticamente: globais + privadas da igreja
const { data } = await supabase
  .from('tracks')
  .select('*');
  // Não precisa filtrar por church_id!
  // RLS retorna: church_id = NULL OU church_id = userChurchId
```

### **Se quiser separar globais de privadas na UI:**
```typescript
const { data: tracks } = await supabase
  .from('tracks')
  .select('*')
  .order('name');

// Separar no frontend
const globais = tracks?.filter(t => t.church_id === null) || [];
const privadas = tracks?.filter(t => t.church_id !== null) || [];

console.log('Músicas globais:', globais);
console.log('Cópias privadas da minha igreja:', privadas);
```

---

## 4️⃣ Criar Evento (SEMPRE com church_id)

### **Implementação:**
```typescript
// ✅ Eventos SEMPRE tem church_id
async function criarEvento(evento: NewEvent) {
  const userChurchId = await getUserChurchId();

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...evento,
      church_id: userChurchId, // ✅ Obrigatório
      created_by: user.id,
    });

  return { data, error };
}
```

---

## 5️⃣ Listar Eventos (Apenas da Igreja)

### **ANTES:**
```typescript
// Talvez estava filtrando manualmente
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('church_id', userChurchId);
```

### **DEPOIS:**
```typescript
// ✅ RLS já filtra automaticamente
const { data } = await supabase
  .from('events')
  .select('*');
  // RLS retorna apenas eventos onde church_id = userChurchId
```

---

## 6️⃣ Deletar Música (Apenas Líderes)

### **Implementação:**
```typescript
async function deletarMusica(trackId: string) {
  // RLS vai validar:
  // 1. Se é cópia privada da igreja (church_id = userChurchId)
  // 2. Se usuário é líder (is_user_leader() = true)

  const { data, error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', trackId);

  if (error) {
    if (error.message.includes('row-level security')) {
      // Usuário não é líder ou música não é da igreja
      throw new Error('Apenas líderes podem deletar músicas');
    }
    throw error;
  }

  return { data, error };
}
```

---

## 7️⃣ Pegar church_id do Usuário Logado

### **Função Helper:**
```typescript
// utils/supabase.ts
export async function getUserChurchId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('users_app')
    .select('church_id')
    .eq('auth_user_id', user.id)
    .single();

  return data?.church_id || null;
}

export async function isUserLeader(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from('users_app')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  return data?.role === 'lider';
}
```

---

## 8️⃣ UI - Mostrar Botão de Deletar Apenas para Líderes

### **Componente React:**
```tsx
import { isUserLeader } from '@/utils/supabase';

function TrackItem({ track }) {
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    isUserLeader().then(setCanDelete);
  }, []);

  return (
    <div>
      <h3>{track.name}</h3>
      <button onClick={() => editTrack(track.id)}>Editar</button>

      {canDelete && (
        <button onClick={() => deleteTrack(track.id)}>
          Deletar
        </button>
      )}
    </div>
  );
}
```

---

## 9️⃣ Tratamento de Erros RLS

### **Implementação:**
```typescript
async function handleSupabaseError(error: any) {
  if (error?.message?.includes('row-level security')) {
    // RLS bloqueou a operação
    toast.error('Você não tem permissão para realizar esta ação');
    return;
  }

  if (error?.message?.includes('violates foreign key')) {
    toast.error('Não é possível deletar: existem referências a este item');
    return;
  }

  // Outros erros
  toast.error('Erro ao processar operação: ' + error.message);
}
```

---

## 🔟 Indicador de Música Global vs Privada (UI)

### **Componente:**
```tsx
function TrackBadge({ track }) {
  if (track.church_id === null) {
    return (
      <span className="badge badge-success">
        🌍 Global
      </span>
    );
  }

  return (
    <span className="badge badge-primary">
      🏛️ Personalizada
    </span>
  );
}
```

---

## ✅ Checklist de Ajustes

- [ ] ✅ Criar música: passar `church_id: null` para globais
- [ ] ✅ Editar música global: criar cópia privada com `church_id`
- [ ] ✅ Listar músicas: **NÃO** filtrar por `church_id` (RLS faz isso)
- [ ] ✅ Criar evento: **SEMPRE** passar `church_id`
- [ ] ✅ Listar eventos: **NÃO** filtrar por `church_id` (RLS faz isso)
- [ ] ✅ Deletar: adicionar tratamento de erro RLS
- [ ] ✅ UI: mostrar badge "Global" vs "Personalizada"
- [ ] ✅ UI: botão deletar apenas para líderes
- [ ] ✅ Criar funções helper: `getUserChurchId()`, `isUserLeader()`

---

## 🎯 Resumo

### **O que REMOVER do código:**
- ❌ Filtros manuais de `church_id` em SELECTs (RLS faz isso)
- ❌ Validações manuais de permissão (RLS faz isso)

### **O que ADICIONAR:**
- ✅ Lógica de criar cópia privada ao editar música global
- ✅ Passar `church_id: null` ao criar música nova
- ✅ Passar `church_id` ao criar evento
- ✅ Tratamento de erros RLS
- ✅ UI diferenciando globais de privadas

---

**Dúvidas?** Teste seguindo o `GUIA_TESTE_RLS_COMPLETO.md` para validar se tudo está funcionando!
