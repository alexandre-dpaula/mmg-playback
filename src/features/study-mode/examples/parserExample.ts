/**
 * EXEMPLO DE USO DO PARSER DE CIFRAS
 * Demonstra as capacidades do sistema
 */

import { parseChordSheet, getChordStats, extractUniqueChords } from '../services/chordParser';

// Exemplo 1: Música simples
const exemplo1 = `
C          Am
Aleluia, aleluia
F              G
Louvado seja o Senhor
C          Am
Aleluia, aleluia
F       G        C
Para sempre cantarei
`;

console.log('=== EXEMPLO 1: Música Simples ===');
const result1 = parseChordSheet(exemplo1);
console.log('Acordes únicos:', result1.uniqueChords);
console.log('Tom detectado:', result1.key);
console.log('Total de acordes:', result1.allChords.length);

// Exemplo 2: Música com acordes complexos
const exemplo2 = `
Cmaj7        Dm7
Intro instrumental
G7              Cmaj7
Progressão de jazz
Am7         D7
Acordes com sétima
Gmaj7       Em7    Am7   D7
Final da progressão
`;

console.log('\n=== EXEMPLO 2: Acordes Complexos ===');
const result2 = parseChordSheet(exemplo2);
console.log('Acordes únicos:', result2.uniqueChords);
console.log('Tom detectado:', result2.key);

// Exemplo 3: Música com variações de notação
const exemplo3 = `
C#m7        F#7
Acordes com sustenido
Bbmaj7      Ebm6
Acordes com bemol
Asus4    A    Asus2
Suspensões
C°       C+    Cadd9
Diminuto, aumentado e add9
`;

console.log('\n=== EXEMPLO 3: Variações de Notação ===');
const result3 = parseChordSheet(exemplo3);
console.log('Acordes únicos:', result3.uniqueChords);
console.log('Acordes normalizados:', result3.allChords.map(c => c.normalized));

// Exemplo 4: Estatísticas
const exemplo4 = `
G            D
Quão grande é o meu Deus
Em7          C
Cantarei quão grande é o meu Deus
G              D
E todos verão quão grande
Em7         C        G
Quão grande é o meu Deus
`;

console.log('\n=== EXEMPLO 4: Estatísticas ===');
const stats4 = getChordStats(exemplo4);
console.log('Estatísticas:', stats4);

// Exemplo 5: Extração rápida
const exemplo5 = `
Am  F  C  G
Dm  Am  E7  Am
`;

console.log('\n=== EXEMPLO 5: Extração Rápida ===');
const chords5 = extractUniqueChords(exemplo5);
console.log('Acordes encontrados:', chords5);

// Exporta exemplos para testes
export const exemplosCifras = {
  simples: exemplo1,
  complexo: exemplo2,
  variacoes: exemplo3,
  estatisticas: exemplo4,
  rapido: exemplo5,
};
