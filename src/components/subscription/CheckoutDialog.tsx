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
import { BrandLogo } from '@/components/BrandLogo';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#121212] to-black border-white/10">
        <DialogHeader className="pb-6 border-b border-white/10">
          <DialogTitle className="text-3xl font-bold">
            {step === 'result' ? (
              <span className="bg-gradient-to-r from-[#1DB954] to-emerald-400 bg-clip-text text-transparent">
                Pagamento
              </span>
            ) : (
              <span className="flex items-baseline gap-2">
                <span className="text-white">Assinar</span>
                <BrandLogo variant="inline" inlineSize="lg" className="inline-flex items-baseline" />
                <span className="bg-gradient-to-r from-[#1DB954] to-emerald-400 bg-clip-text text-transparent">
                  PRO
                </span>
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Step: Customer Info */}
          {step === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-6">
              {/* Pricing Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1DB954]/20 to-emerald-500/10 border border-[#1DB954]/30 p-6">
                <div className="relative">
                  <p className="text-sm font-semibold text-[#1DB954] uppercase tracking-wide mb-2">Plano Mensal</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">R$ 9,98</span>
                    <span className="text-xl text-white/60 font-medium">/mês</span>
                  </div>
                  <p className="text-sm text-white/70 mt-3">✨ Acesso total aos recursos PRO</p>
                  <p className="text-xs text-white/50 mt-1">Cancele quando quiser</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/90 font-medium">Nome Completo</Label>
                  <Input
                    id="name"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#1DB954]/50 focus:ring-[#1DB954]/20"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90 font-medium">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#1DB954]/50 focus:ring-[#1DB954]/20"
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-white/90 font-medium">CPF</Label>
                    <Input
                      id="cpf"
                      required
                      placeholder="000.000.000-00"
                      value={customer.cpfCnpj}
                      onChange={(e) => setCustomer({ ...customer, cpfCnpj: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#1DB954]/50 focus:ring-[#1DB954]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/90 font-medium">Celular</Label>
                    <Input
                      id="phone"
                      required
                      placeholder="(00) 00000-0000"
                      value={customer.mobilePhone}
                      onChange={(e) => setCustomer({ ...customer, mobilePhone: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#1DB954]/50 focus:ring-[#1DB954]/20"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#1DB954] to-emerald-500 hover:from-[#1DB954]/90 hover:to-emerald-500/90 text-white font-semibold py-6 rounded-xl shadow-lg shadow-[#1DB954]/20 transition-all hover:shadow-xl hover:shadow-[#1DB954]/30 hover:scale-[1.02]"
              >
                Continuar para Pagamento
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
                className="pl-0 text-white/70 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <PaymentMethodSelector value={billingType} onChange={setBillingType} />

              <Button
                onClick={handlePaymentMethodNext}
                disabled={isCreatingSubscription}
                className="w-full bg-gradient-to-r from-[#1DB954] to-emerald-500 hover:from-[#1DB954]/90 hover:to-emerald-500/90 text-white font-semibold py-6 rounded-xl shadow-lg shadow-[#1DB954]/20 transition-all hover:shadow-xl hover:shadow-[#1DB954]/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isCreatingSubscription ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Continuar para Pagamento'
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
                className="pl-0 text-white/70 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <CreditCardForm data={creditCard} onChange={setCreditCard} />

              <Button
                onClick={handleFinalSubmit}
                disabled={isCreatingSubscription}
                className="w-full bg-gradient-to-r from-[#1DB954] to-emerald-500 hover:from-[#1DB954]/90 hover:to-emerald-500/90 text-black font-semibold py-6 rounded-xl shadow-lg shadow-[#1DB954]/20 transition-all hover:shadow-xl hover:shadow-[#1DB954]/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isCreatingSubscription ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  '🔒 Confirmar Pagamento'
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
                <div className="text-center space-y-6 py-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#1DB954]/20 border-4 border-[#1DB954]">
                    <div className="text-5xl">✅</div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Pagamento Aprovado!</h3>
                    <p className="text-white/60 max-w-md mx-auto">
                      Sua assinatura foi ativada com sucesso. Aproveite todos os recursos PRO!
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleReset}
                className="w-full bg-gradient-to-r from-[#1DB954] to-emerald-500 hover:from-[#1DB954]/90 hover:to-emerald-500/90 text-white font-semibold py-6 rounded-xl shadow-lg shadow-[#1DB954]/20 transition-all hover:shadow-xl hover:shadow-[#1DB954]/30 hover:scale-[1.02]"
              >
                Concluir
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
