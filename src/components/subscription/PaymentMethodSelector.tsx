// Component: PaymentMethodSelector
// Description: Selector for payment method (PIX, Boleto, Credit Card)
// Author: SetlistGO™
// Created: 2025-12-24

import { CreditCard, QrCode, FileText } from 'lucide-react';
import type { BillingType, PaymentMethodOption } from '@/types/asaas';

interface PaymentMethodSelectorProps {
  value: BillingType;
  onChange: (value: BillingType) => void;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: 'PIX',
    label: 'PIX',
    icon: QrCode,
    description: 'Pagamento instantâneo via QR Code',
  },
  {
    value: 'BOLETO',
    label: 'Boleto',
    icon: FileText,
    description: 'Boleto bancário com vencimento',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Cartão de Crédito',
    icon: CreditCard,
    description: 'Renovação automática mensal',
  },
];

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white">
        Forma de Pagamento
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.value;

          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onChange(method.value)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-[#1DB954] bg-[#1DB954]/10'
                  : 'border-white/20 bg-white/5 hover:border-white/30'
                }
              `}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Icon
                  className={`w-8 h-8 ${isSelected ? 'text-[#1DB954]' : 'text-white/60'}`}
                />
                <div>
                  <p className={`font-semibold ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>
                    {method.label}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {method.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-black"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
