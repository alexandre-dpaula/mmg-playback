/**
 * BANCO DE DADOS DE ACORDES
 * Carrega e gerencia a biblioteca completa de acordes
 * Baseado no padrão Cifra Club
 */

import type { Chord, ChordFilter, ChordQuality, Difficulty, CAGEDPosition } from '../types/chord.types';
import majorChordsData from '../data/chords/major.json';
import minorChordsData from '../data/chords/minor.json';
import dominant7ChordsData from '../data/chords/dominant7.json';
import major7ChordsData from '../data/chords/major7.json';
import minor7ChordsData from '../data/chords/minor7.json';
import dimChordsData from '../data/chords/dim.json';
import augChordsData from '../data/chords/aug.json';
import sus2ChordsData from '../data/chords/sus2.json';
import sus4ChordsData from '../data/chords/sus4.json';
import sixthChordsData from '../data/chords/6th.json';
import minor6ChordsData from '../data/chords/minor6.json';
import ninthChordsData from '../data/chords/9th.json';
import add9ChordsData from '../data/chords/add9.json';

// =============================================
// CACHE E CARREGAMENTO
// =============================================

class ChordDatabase {
  private chords: Map<string, Chord> = new Map();
  private loaded: boolean = false;

  /**
   * Carrega todos os acordes de todos os arquivos JSON
   */
  async load(): Promise<void> {
    if (this.loaded) return;

    try {
      // Carrega acordes maiores
      this.loadChordsFromData(majorChordsData.chords as any[]);

      // Carrega acordes menores
      this.loadChordsFromData(minorChordsData.chords as any[]);

      // Carrega acordes de 7ª dominante
      this.loadChordsFromData(dominant7ChordsData.chords as any[]);

      // Carrega acordes de 7ª maior
      this.loadChordsFromData(major7ChordsData.chords as any[]);

      // Carrega acordes menores com 7ª
      this.loadChordsFromData(minor7ChordsData.chords as any[]);

      // Carrega acordes diminutos
      this.loadChordsFromData(dimChordsData.chords as any[]);

      // Carrega acordes aumentados
      this.loadChordsFromData(augChordsData.chords as any[]);

      // Carrega acordes sus2
      this.loadChordsFromData(sus2ChordsData.chords as any[]);

      // Carrega acordes sus4
      this.loadChordsFromData(sus4ChordsData.chords as any[]);

      // Carrega acordes de 6ª
      this.loadChordsFromData(sixthChordsData.chords as any[]);

      // Carrega acordes menores com 6ª
      this.loadChordsFromData(minor6ChordsData.chords as any[]);

      // Carrega acordes de 9ª dominante
      this.loadChordsFromData(ninthChordsData.chords as any[]);

      // Carrega acordes add9
      this.loadChordsFromData(add9ChordsData.chords as any[]);

      this.loaded = true;
      console.log(`✅ Biblioteca de acordes carregada: ${this.chords.size} acordes`);
    } catch (error) {
      console.error('❌ Erro ao carregar biblioteca de acordes:', error);
      throw error;
    }
  }

  /**
   * Carrega acordes de um array de dados
   */
  private loadChordsFromData(chordsData: any[]): void {
    chordsData.forEach((data) => {
      const chord = this.transformChordData(data);
      this.chords.set(chord.id, chord);
      // Também indexa pelo nome curto (ex: "C")
      this.chords.set(chord.name, chord);
    });
  }

  /**
   * Transforma dados JSON para o tipo Chord
   */
  private transformChordData(data: any): Chord {
    return {
      id: data.id,
      name: data.name,
      fullName: data.fullName,
      quality: data.quality as ChordQuality,
      root: data.root,
      notes: data.notes,
      intervals: data.intervals,

      // Guitar shapes
      guitarShapes: data.guitarShapes.map((shape: any) => ({
        id: shape.id,
        chordId: data.id,
        system: "CAGED" as const,
        position: shape.position as CAGEDPosition,
        name: shape.name,
        baseFret: shape.baseFret,
        notes: shape.notes,
        barre: shape.barre,
        difficulty: shape.difficulty as Difficulty,
        isDefault: shape.isDefault,
      })),

      // Keyboard shapes (TODO: implementar)
      keyboardShapes: [],

      // Metadados
      difficulty: data.difficulty as Difficulty,
      tags: data.tags || [],

      // Relacionamentos
      substitutes: data.substitutes,
      relatedChords: data.relatedChords,
    };
  }

  // =============================================
  // BUSCA E FILTROS
  // =============================================

  /**
   * Busca acorde por nome ou ID
   */
  get(nameOrId: string): Chord | undefined {
    return this.chords.get(nameOrId);
  }

  /**
   * Busca múltiplos acordes por nomes
   */
  getMany(names: string[]): Chord[] {
    return names
      .map(name => this.get(name))
      .filter((chord): chord is Chord => chord !== undefined);
  }

  /**
   * Lista todos os acordes
   */
  getAll(): Chord[] {
    return Array.from(this.chords.values());
  }

  /**
   * Filtra acordes por critérios
   */
  filter(filter: ChordFilter): Chord[] {
    let results = this.getAll();

    // Filtro por qualidade
    if (filter.quality) {
      const qualities = Array.isArray(filter.quality) ? filter.quality : [filter.quality];
      results = results.filter(chord => qualities.includes(chord.quality));
    }

    // Filtro por dificuldade
    if (filter.difficulty) {
      const difficulties = Array.isArray(filter.difficulty) ? filter.difficulty : [filter.difficulty];
      results = results.filter(chord => difficulties.includes(chord.difficulty));
    }

    // Filtro por raiz
    if (filter.root) {
      const roots = Array.isArray(filter.root) ? filter.root : [filter.root];
      results = results.filter(chord => roots.includes(chord.root));
    }

    // Filtro por tags
    if (filter.tags && filter.tags.length > 0) {
      results = results.filter(chord =>
        filter.tags!.some(tag => chord.tags.includes(tag))
      );
    }

    // Filtro por presença de shapes
    if (filter.hasGuitarShapes) {
      results = results.filter(chord => chord.guitarShapes.length > 0);
    }

    if (filter.hasKeyboardShapes) {
      results = results.filter(chord => chord.keyboardShapes.length > 0);
    }

    return results;
  }

  /**
   * Busca acordes por texto (nome, fullName, tags)
   */
  search(query: string): Chord[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(chord =>
      chord.name.toLowerCase().includes(lowerQuery) ||
      chord.fullName.toLowerCase().includes(lowerQuery) ||
      chord.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // =============================================
  // SHAPES (Variações)
  // =============================================

  /**
   * Busca shape específico de violão
   */
  getGuitarShape(chordName: string, position?: CAGEDPosition) {
    const chord = this.get(chordName);
    if (!chord || chord.guitarShapes.length === 0) return null;

    // Se posição especificada, busca exata
    if (position) {
      return chord.guitarShapes.find(s => s.position === position) || null;
    }

    // Senão, retorna a padrão (ou primeira)
    return chord.guitarShapes.find(s => s.isDefault) || chord.guitarShapes[0];
  }

  /**
   * Busca todos os shapes de violão de um acorde
   */
  getAllGuitarShapes(chordName: string) {
    const chord = this.get(chordName);
    return chord?.guitarShapes || [];
  }

  /**
   * Busca shape de teclado
   */
  getKeyboardShape(chordName: string, inversion?: string) {
    const chord = this.get(chordName);
    if (!chord || chord.keyboardShapes.length === 0) return null;

    if (inversion) {
      return chord.keyboardShapes.find(s => s.inversion === inversion) || null;
    }

    return chord.keyboardShapes[0] || null;
  }

  // =============================================
  // ESTATÍSTICAS
  // =============================================

  /**
   * Retorna estatísticas da biblioteca
   */
  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      byQuality: this.countByProperty(all, 'quality'),
      byDifficulty: this.countByProperty(all, 'difficulty'),
      byRoot: this.countByProperty(all, 'root'),
      withGuitarShapes: all.filter(c => c.guitarShapes.length > 0).length,
      withKeyboardShapes: all.filter(c => c.keyboardShapes.length > 0).length,
    };
  }

  private countByProperty<T extends keyof Chord>(chords: Chord[], prop: T) {
    const counts: Record<string, number> = {};
    chords.forEach(chord => {
      const value = String(chord[prop]);
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }
}

// =============================================
// EXPORTAÇÃO SINGLETON
// =============================================

const chordDatabase = new ChordDatabase();

// Auto-carrega ao importar
chordDatabase.load().catch(console.error);

export { chordDatabase };
export default chordDatabase;
