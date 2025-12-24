// Component: BoletoPayment
// Description: Displays boleto payment details and download link
// Author: SetlistGO™
// Created: 2025-12-24

import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoletoPaymentProps {
  bankSlipUrl?: string;
  invoiceUrl?: string;
  amount: number;
  dueDate: string;
}

export function BoletoPayment({ bankSlipUrl, invoiceUrl, amount, dueDate }: BoletoPaymentProps) {
  const formattedDueDate = new Date(dueDate).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1DB954]/20">
          <FileText className="w-8 h-8 text-[#1DB954]" />
        </div>
        <h3 className="text-xl font-bold text-white">
          Pagamento via Boleto
        </h3>
        <p className="text-white/60">
          Seu boleto foi gerado com sucesso
        </p>
      </div>

      {/* Amount */}
      <div className="text-center">
        <p className="text-sm text-white/60">Valor</p>
        <p className="text-3xl font-bold text-[#1DB954]">
          R$ {amount.toFixed(2).replace('.', ',')}
        </p>
        <p className="text-xs text-white/40 mt-1">
          Vencimento: {formattedDueDate}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {bankSlipUrl && (
          <Button
            type="button"
            onClick={() => window.open(bankSlipUrl, '_blank')}
            className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 text-black font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Boleto
          </Button>
        )}

        {invoiceUrl && (
          <Button
            type="button"
            onClick={() => window.open(invoiceUrl, '_blank')}
            variant="outline"
            className="w-full border-white/20 hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Fatura
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
        <p className="text-sm font-medium text-white">Como pagar:</p>
        <ol className="text-sm text-white/60 space-y-1 list-decimal list-inside">
          <li>Baixe o boleto clicando no botão acima</li>
          <li>Pague em qualquer banco, lotérica ou app bancário</li>
          <li>O código de barras está no boleto</li>
          <li>Aguarde até 3 dias úteis para compensação</li>
          <li>Sua assinatura será ativada automaticamente</li>
        </ol>
      </div>

      {/* Barcode Display (if we had it) */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <p className="text-xs text-white/60 text-center">
          O código de barras está disponível no boleto
        </p>
      </div>

      {/* Warning */}
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-xs text-yellow-500/80">
          ⚠️ Guarde o boleto até a confirmação do pagamento.
          Após o vencimento, será gerado um novo boleto com juros.
        </p>
      </div>

      {/* Email Notice */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-500/80">
          📧 Uma cópia do boleto foi enviada para seu e-mail cadastrado.
        </p>
      </div>
    </div>
  );
}
