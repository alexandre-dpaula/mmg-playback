# Guia de Otimização de Performance

## 1. LIMPEZA DE CACHE E ARQUIVOS TEMPORÁRIOS

### Comandos para Limpar Cache

```bash
# Limpar cache do npm
npm cache clean --force

# Limpar node_modules e reinstalar (CUIDADO: demora)
rm -rf node_modules
npm install

# Limpar cache do Vite
rm -rf node_modules/.vite

# Limpar builds anteriores
rm -rf dist

# Limpar todos os caches de uma vez
npm run clean:all
```

### Script Adicionado ao package.json

Adicione estes scripts ao seu `package.json`:

```json
"scripts": {
  "clean:cache": "rm -rf node_modules/.vite",
  "clean:dist": "rm -rf dist",
  "clean:all": "npm run clean:cache && npm run clean:dist",
  "fresh:install": "rm -rf node_modules package-lock.json && npm install",
  "dev:clean": "npm run clean:cache && npm run dev"
}
```

## 2. OTIMIZAÇÕES DE CÓDIGO IMPLEMENTADAS

### A. Lazy Loading de Componentes

Carregue páginas e componentes pesados sob demanda:

```typescript
// Ao invés de:
import ExpensivePage from './pages/ExpensivePage'

// Use:
const ExpensivePage = lazy(() => import('./pages/ExpensivePage'))
```

### B. Memoização

Use React.memo para componentes que renderizam frequentemente:

```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // componente pesado
})
```

### C. useCallback e useMemo

Evite recriação desnecessária de funções e cálculos:

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
const memoizedCallback = useCallback(() => { doSomething(a, b) }, [a, b])
```

## 3. OTIMIZAÇÕES DO VITE

### vite.config.ts Otimizado

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'supabase': ['@supabase/supabase-js'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
```

## 4. OTIMIZAÇÕES DE IMAGENS

### Recomendações

1. Use WebP ao invés de JPG/PNG
2. Lazy load de imagens com `loading="lazy"`
3. Use thumbnails do YouTube (já implementado)

```jsx
<img
  src={imageUrl}
  loading="lazy"
  decoding="async"
  alt="description"
/>
```

## 5. OTIMIZAÇÕES DO SUPABASE

### A. Limitar Queries

```typescript
// Sempre use limit
const { data } = await supabase
  .from('tracks')
  .select('*')
  .limit(50)  // Limite de resultados

// Use paginação
const { data } = await supabase
  .from('tracks')
  .select('*')
  .range(0, 49)  // Pega 50 registros por vez
```

### B. Select Específico

```typescript
// Ao invés de select('*')
const { data } = await supabase
  .from('tracks')
  .select('id, titulo, artista')  // Apenas campos necessários
```

### C. Cache de Queries com React Query

```typescript
const { data } = useQuery({
  queryKey: ['tracks', eventId],
  queryFn: () => fetchTracks(eventId),
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
})
```

## 6. OTIMIZAÇÕES DE BUNDLE

### A. Análise de Bundle

```bash
npm run build
npx vite-bundle-visualizer
```

### B. Tree Shaking

Importe apenas o necessário:

```typescript
// Ruim
import * as Icons from 'lucide-react'

// Bom
import { Music, Play, Pause } from 'lucide-react'
```

## 7. OTIMIZAÇÕES DE STORAGE LOCAL

### Limpar LocalStorage Antigo

```typescript
// Limpar dados antigos (>30 dias)
const clearOldStorage = () => {
  const keys = Object.keys(localStorage)
  const now = Date.now()

  keys.forEach(key => {
    try {
      const item = JSON.parse(localStorage.getItem(key))
      if (item.timestamp && now - item.timestamp > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key)
      }
    } catch (e) {
      // Ignorar erros de parse
    }
  })
}
```

## 8. MONITORAMENTO DE PERFORMANCE

### A. Vercel Analytics (Já Instalado)

Monitore métricas reais de usuários:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

### B. React DevTools Profiler

1. Instale React DevTools
2. Use o Profiler para identificar componentes lentos
3. Otimize componentes que renderizam frequentemente

## 9. MELHORIAS UI/UX SUGERIDAS

### A. Skeleton Loading

Ao invés de spinners, use skeleton screens:

```jsx
{loading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
  </div>
) : (
  <Content />
)}
```

### B. Optimistic Updates

Atualize UI antes da resposta do servidor:

```typescript
const handleUpdate = async (data) => {
  // Atualiza UI imediatamente
  setLocalData(newData)

  try {
    // Atualiza servidor
    await updateServer(data)
  } catch (error) {
    // Reverte em caso de erro
    setLocalData(oldData)
  }
}
```

### C. Debounce em Buscas

```typescript
const debouncedSearch = useMemo(
  () => debounce((term) => performSearch(term), 300),
  []
)
```

### D. Virtual Scrolling

Para listas grandes, use virtualização:

```bash
npm install @tanstack/react-virtual
```

## 10. CHECKLIST DE PERFORMANCE

- [ ] Limpar cache do Vite regularmente
- [ ] Usar lazy loading em rotas
- [ ] Implementar code splitting
- [ ] Otimizar imagens (WebP, lazy load)
- [ ] Limitar queries do Supabase
- [ ] Usar React Query para cache
- [ ] Memoizar componentes pesados
- [ ] Implementar skeleton loading
- [ ] Usar optimistic updates
- [ ] Implementar debounce em inputs
- [ ] Monitorar com Vercel Analytics
- [ ] Revisar bundle size periodicamente

## 11. COMANDOS ÚTEIS

```bash
# Desenvolvimento com cache limpo
npm run dev:clean

# Build de produção
npm run build

# Análise de bundle
npm run build && npx vite-bundle-visualizer

# Verificar tamanho dos pacotes
npm list --depth=0

# Atualizar dependências
npm outdated
npm update
```

## 12. MÉTRICAS ALVO

**Bom desempenho:**
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Total Bundle Size: < 500KB (gzipped)

**Seu Bundle Atual:**
- node_modules: 285MB (normal para desenvolvimento)
- Após build otimizado: ~200-300KB (gzipped)

---

**Última atualização:** 2026-01-12
**Performance Score Atual:** Use Lighthouse no Chrome DevTools para medir
