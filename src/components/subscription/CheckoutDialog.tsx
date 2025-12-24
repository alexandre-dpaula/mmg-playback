// Component: CheckoutDialog
// Description: Main checkout dialog for subscription purchase
// Author: SetlistGO™
// Created: 2025-12-24

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { CreditCardForm } from './CreditCardForm';
import { PixPayment } from './PixPayment';
import { BoletoPayment } from './BoletoPayment';
import type { BillingType, CustomerFormData, CreditCardFormData } from '@/types/asaas';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'customer' | 'payment-method' | 'credit-card' | 'result';

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { createSubscription, isCreatingSubscription } = useSubscription();

  const [step, setStep] = useState<Step>('customer');
  const [billingType, setBillingType] = useState<BillingType>('PIX');
  const [customer, setCustomer] = useState<CustomerFormData>({
    name: '',
    email: '',
    cpfCnpj: '',
    mobilePhone: '',
  });
  const [creditCard, setCreditCard] = useState<CreditCardFormData>({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment-method');
  };

  const handlePaymentMethodNext = () => {
    if (billingType === 'CREDIT_CARD') {
      setStep('credit-card');
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const result = await new Promise((resolve, reject) => {
        createSubscription(
          {
            billingType,
            customer,
            creditCard: billingType === 'CREDIT_CARD' ? creditCard : undefined,
          },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });

      setPaymentResult(result);
      setStep('result');
      toast.success('Assinatura criada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar assinatura');
    }
  };

  const handleReset = () => {
    setStep('customer');
    setCustomer({ name: '', email: '', cpfCnpj: '', mobilePhone: '' });
    setCreditCard({ holderName: '', number: '', expiryMonth: '', expiryYear: '', ccv: '' });
    setPaymentResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 'result' ? 'Pagamento' : 'Assinar SetlistGO™ PRO'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step: Customer Info */}
          {step === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="p-4 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-lg">
                <p className="text-2xl font-bold text-[#1DB954]">R$ 9,98/mês</p>
                <p className="text-sm text-white/60 mt-1">Acesso total aos recursos PRO</p>
              </div>

              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  required
                  placeholder="000.000.000-00"
                  value={customer.cpfCnpj}
                  onChange={(e) => setCustomer({ ...customer, cpfCnpj: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Celular</Label>
                <Input
                  id="phone"
                  required
                  placeholder="(00) 00000-0000"
                  value={customer.mobilePhone}
                  onChange={(e) => setCustomer({ ...customer, mobilePhone: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90">
                Continuar
              </Button>
            </form>
          )}

          {/* Step: Payment Method */}
          {step === 'payment-method' && (
            <div className="space-y-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('customer')}
                className="pl-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <PaymentMethodSelector value={billingType} onChange={setBillingType} />

              <Button
                onClick={handlePaymentMethodNext}
                disabled={isCreatingSubscription}
                className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90"
              >
                {isCreatingSubscription ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </div>
          )}

          {/* Step: Credit Card */}
          {step === 'credit-card' && (
            <div className="space-y-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('payment-method')}
                className="pl-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <CreditCardForm data={creditCard} onChange={setCreditCard} />

              <Button
                onClick={handleFinalSubmit}
                disabled={isCreatingSubscription}
                className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90"
              >
                {isCreatingSubscription ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Pagamento'
                )}
              </Button>
            </div>
          )}

          {/* Step: Result */}
          {step === 'result' && paymentResult && (
            <div className="space-y-6">
              {billingType === 'PIX' && paymentResult.payment && (
                <PixPayment
                  pixQrCode={paymentResult.payment.pix_qr_code}
                  pixCopyPaste={paymentResult.payment.pix_copy_paste}
                  amount={9.98}
                  dueDate={paymentResult.payment.due_date}
                />
              )}

              {billingType === 'BOLETO' && paymentResult.payment && (
                <BoletoPayment
                  bankSlipUrl={paymentResult.payment.bank_slip_url}
                  invoiceUrl={paymentResult.payment.invoice_url}
                  amount={9.98}
                  dueDate={paymentResult.payment.due_date}
                />
              )}

              {billingType === 'CREDIT_CARD' && (
                <div className="text-center space-y-4">
                  <div className="text-6xl">✅</div>
                  <h3 className="text-xl font-bold text-white">Pagamento Aprovado!</h3>
                  <p className="text-white/60">
                    Sua assinatura foi ativada com sucesso.
                  </p>
                </div>
              )}

              <Button onClick={handleReset} className="w-full">
                Concluir
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
