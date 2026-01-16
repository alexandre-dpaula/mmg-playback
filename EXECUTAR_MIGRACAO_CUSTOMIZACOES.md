# Migração: Customizações por Evento

## Como executar esta migração

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz
2. Vá em **SQL Editor** (no menu lateral)
3. Clique em **New query**
4. Copie e cole o conteúdo do arquivo abaixo:

```
supabase/migrations/20251230_add_event_track_customizations.sql
```

5. Clique em **Run** para executar

## O que esta migração faz

Esta migração adiciona campos na tabela `event_tracks` para permitir customizações por evento/igreja:

### Novos campos:
- **custom_key**: Tom customizado para este evento (ex: "G", "Am", etc)
- **custom_capo**: Capotraste customizado (0-12)
- **custom_cifra_content**: Cifra completamente customizada para este evento
- **custom_notes**: Notas/observações específicas

### Como funciona:
1. **Antes**: Quando você mudava o tom, alterava globalmente na tabela `tracks` (afetava todas as igrejas)
2. **Depois**: Quando você muda o tom, salva em `event_tracks.custom_key` (só afeta seu evento/igreja)

## Próximos passos

Após executar a migration, precisaremos atualizar o código TypeScript em:
- `src/pages/TrackDetails.tsx` - função `handleKeyChange`
- `src/hooks/useEventPlaylist.tsx` - para buscar customizações
- Outros locais que salvam/leem configurações da música

## Prioridade de dados

A lógica será:
1. Se existe `custom_key` em `event_tracks` → usa esse tom
2. Senão → usa o tom global de `tracks.tom`

Mesma lógica para cifra:
1. Se existe `custom_cifra_content` em `event_tracks` → usa essa cifra
2. Senão → usa `tracks.cifra_content`

## Troubleshooting

Se houver erro ao executar:
1. Verifique se você está conectado ao projeto correto
2. Certifique-se de ter permissões de admin
3. Se a coluna já existir, pode ignorar o erro "already exists"
