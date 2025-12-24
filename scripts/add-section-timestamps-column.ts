import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sffebcfgkthjcfnpgjvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2Zna3RoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg4NTUsImV4cCI6MjA3ODU2NDg1NX0.Eu36P8RoIg7UKnI2JLeSnc7IEp8UgS-oVJcKf3XgnFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSectionTimestampsColumn() {
  console.log('🔄 Adicionando coluna section_timestamps à tabela tracks...\n');

  try {
    // Tenta adicionar a coluna (se já existir, o IF NOT EXISTS vai ignorar)
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE tracks
        ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;
      `
    });

    if (error) {
      console.error('❌ Erro ao adicionar coluna:', error);
      console.log('\n⚠️  Aplique manualmente no SQL Editor do Supabase:');
      console.log(`
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN tracks.section_timestamps IS 'Timestamps das seções da música para auto-scroll sincronizado com áudio. Formato: {"I": 0, "V1": 15, "C": 45}';
      `);
      return;
    }

    console.log('✅ Coluna section_timestamps adicionada com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
    console.log('\n⚠️  Aplique manualmente no SQL Editor do Supabase:');
    console.log(`
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS section_timestamps JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN tracks.section_timestamps IS 'Timestamps das seções da música para auto-scroll sincronizado com áudio. Formato: {"I": 0, "V1": 15, "C": 45}';
    `);
  }
}

addSectionTimestampsColumn();
