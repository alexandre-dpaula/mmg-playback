# Migração: Tabela de Equipe de Eventos

## Como executar esta migração

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/sffebcfgkthjcfnpgjvz
2. Vá em **SQL Editor** (no menu lateral)
3. Clique em **New query**
4. Copie e cole o conteúdo do arquivo abaixo:

```
supabase/migrations/20251229_create_event_members.sql
```

5. Clique em **Run** para executar

## O que esta migração faz

Esta migração cria a tabela `event_members` que permite:

- Associar membros da equipe aos eventos
- Definir papéis: Vocal, Instrumental ou Multimídia
- Controlar quem pode ver e gerenciar membros através de RLS (Row Level Security)

## Após executar a migração

Você poderá usar o novo botão "Equipe" na página de Playlist para:
- Adicionar membros à equipe do evento
- Organizar por Vocal, Instrumental e Multimídia
- Buscar e selecionar membros existentes
- Remover membros da equipe

## Troubleshooting

Se houver erro ao executar:
1. Verifique se você está conectado ao projeto correto
2. Certifique-se de ter permissões de admin
3. Caso a tabela já exista, você pode ignorar o erro de "already exists"
