/**
 * PÁGINA DE TESTE RÁPIDO
 * Adicione esta rota para testar o sistema imediatamente
 *
 * Como usar:
 * 1. Importe este arquivo no seu arquivo de rotas
 * 2. Adicione: <Route path="/teste-cifras" element={<TesteCifras />} />
 * 3. Acesse: http://localhost:5173/teste-cifras
 */

import React from 'react';
import ChordStudyDemo from '@/features/study-mode/ChordStudyDemo';

export default function TesteCifras() {
  return <ChordStudyDemo />;
}
