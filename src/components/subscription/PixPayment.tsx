// Component: PixPayment
// Description: Displays PIX QR Code and copy-paste code
// Author: SetlistGO™
// Created: 2025-12-24

import { useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PixPaymentProps {
  pixQrCode?: string;
  pixCopyPaste?: string;
  amount: number;
  dueDate: string;
}

export function PixPayment({ pixQrCode, pixCopyPaste, amount, dueDate }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!pixCopyPaste) return;

    try {
      await navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      toast.success('Código PIX copiado!');

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar código PIX');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1DB954]/20">
          <QrCode className="w-8 h-8 text-[#1DB954]" />
        </div>
        <h3 className="text-xl font-bold text-white">
          Pagamento via PIX
        </h3>
        <p className="text-white/60">
          Escaneie o QR Code ou copie o código abaixo
        </p>
      </div>

      {/* QR Code */}
      {pixQrCode && (
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg">
            <img
              src={`data:image/png;base64,${pixQrCode}`}
              alt="QR Code PIX"
              className="w-64 h-64"
            />
          </div>
        </div>
      )}

      {/* Amount */}
      <div className="text-center">
        <p className="text-sm text-white/60">Valor</p>
        <p className="text-3xl font-bold text-[#1DB954]">
          R$ {amount.toFixed(2).replace('.', ',')}
        </p>
        <p className="text-xs text-white/40 mt-1">
          Vencimento: {new Date(dueDate).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Copy-Paste Code */}
      {pixCopyPaste && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-white">
            Código PIX Copia e Cola
          </label>

          <div className="relative">
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-white/60 font-mono break-all">
                {pixCopyPaste}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCopy}
            className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 text-black font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código PIX
              </>
            )}
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
        <p className="text-sm font-medium text-white">Como pagar:</p>
        <ol className="text-sm text-white/60 space-y-1 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escolha a opção PIX</li>
          <li>Escaneie o QR Code ou cole o código</li>
          <li>Confirme o pagamento</li>
          <li>Pronto! Sua assinatura será ativada automaticamente</li>
        </ol>
      </div>

      {/* Warning */}
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-xs text-yellow-500/80">
          ⚠️ Este código PIX é válido apenas para este pagamento.
          Após o pagamento, sua assinatura será ativada em até 1 hora.
        </p>
      </div>
    </div>
  );
}
