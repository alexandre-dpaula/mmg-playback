// Component: CreditCardForm
// Description: Credit card input form with validation
// Author: SetlistGO™
// Created: 2025-12-24

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreditCardFormData } from '@/types/asaas';

interface CreditCardFormProps {
  data: CreditCardFormData;
  onChange: (data: CreditCardFormData) => void;
  errors?: Partial<Record<keyof CreditCardFormData, string>>;
}

export function CreditCardForm({ data, onChange, errors }: CreditCardFormProps) {
  const handleChange = (field: keyof CreditCardFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="holderName">Nome no Cartão</Label>
        <Input
          id="holderName"
          value={data.holderName}
          onChange={(e) => handleChange('holderName', e.target.value.toUpperCase())}
          placeholder="NOME COMO NO CARTÃO"
          className="uppercase"
        />
        {errors?.holderName && (
          <p className="text-xs text-red-500 mt-1">{errors.holderName}</p>
        )}
      </div>

      <div>
        <Label htmlFor="number">Número do Cartão</Label>
        <Input
          id="number"
          value={data.number}
          onChange={(e) => handleChange('number', formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
        />
        {errors?.number && (
          <p className="text-xs text-red-500 mt-1">{errors.number}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="expiryMonth">Mês</Label>
          <Input
            id="expiryMonth"
            value={data.expiryMonth}
            onChange={(e) => handleChange('expiryMonth', formatExpiry(e.target.value))}
            placeholder="MM"
            maxLength={2}
          />
          {errors?.expiryMonth && (
            <p className="text-xs text-red-500 mt-1">{errors.expiryMonth}</p>
          )}
        </div>

        <div>
          <Label htmlFor="expiryYear">Ano</Label>
          <Input
            id="expiryYear"
            value={data.expiryYear}
            onChange={(e) => handleChange('expiryYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="AAAA"
            maxLength={4}
          />
          {errors?.expiryYear && (
            <p className="text-xs text-red-500 mt-1">{errors.expiryYear}</p>
          )}
        </div>

        <div>
          <Label htmlFor="ccv">CVV</Label>
          <Input
            id="ccv"
            value={data.ccv}
            onChange={(e) => handleChange('ccv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="000"
            maxLength={4}
            type="password"
          />
          {errors?.ccv && (
            <p className="text-xs text-red-500 mt-1">{errors.ccv}</p>
          )}
        </div>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-500/80">
          🔒 Seus dados estão seguros. A cobrança é recorrente mensal.
        </p>
      </div>
    </div>
  );
}
