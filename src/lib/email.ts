import { supabase } from "./supabase";

interface InviteMemberEmailData {
  inviterName: string;
  churchName: string;
  roleName: string;
  inviteLink: string;
  expiryDate: string;
  recipientEmail: string;
}

interface EmailConfirmationData {
  userName: string;
  confirmationLink: string;
  recipientEmail: string;
}

interface PasswordResetData {
  resetLink: string;
  expiryTime: string;
  recipientEmail: string;
}

interface SubscriptionConfirmedData {
  amount: string;
  paymentDate: string;
  nextDueDate: string;
  paymentMethod: string;
  appLink: string;
  recipientEmail: string;
}

interface PaymentReminderData {
  userName: string;
  daysUntilDue: string;
  amount: string;
  dueDate: string;
  paymentMethod: string;
  paymentLink: string;
  invoiceLink: string;
  recipientEmail: string;
}

interface SubscriptionCancelledData {
  cancellationDate: string;
  accessUntilDate: string;
  reactivateLink: string;
  feedbackLink: string;
  recipientEmail: string;
}

// Carregar template e substituir variáveis
async function loadTemplate(templateName: string): Promise<string> {
  const response = await fetch(`/email-templates/${templateName}.html`);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${templateName}`);
  }
  return response.text();
}

function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

// Enviar email via Edge Function
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: {
      to,
      subject,
      html,
    },
  });

  if (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to send email");
  }
}

// ========================================
// FUNÇÕES PÚBLICAS PARA ENVIO DE EMAILS
// ========================================

/**
 * Envia email de convite para membro
 */
export async function sendInviteMemberEmail(data: InviteMemberEmailData): Promise<void> {
  const template = await loadTemplate("invite-member");

  const html = replaceVariables(template, {
    INVITER_NAME: data.inviterName,
    CHURCH_NAME: data.churchName,
    ROLE_NAME: data.roleName,
    INVITE_LINK: data.inviteLink,
    EXPIRY_DATE: data.expiryDate,
    RECIPIENT_EMAIL: data.recipientEmail,
  });

  await sendEmail(
    data.recipientEmail,
    `Você foi convidado para ${data.churchName}!`,
    html
  );
}

/**
 * Envia email de confirmação de cadastro
 */
export async function sendEmailConfirmation(data: EmailConfirmationData): Promise<void> {
  const template = await loadTemplate("email-confirmation");

  const html = replaceVariables(template, {
    USER_NAME: data.userName,
    CONFIRMATION_LINK: data.confirmationLink,
    RECIPIENT_EMAIL: data.recipientEmail,
  });

  await sendEmail(
    data.recipientEmail,
    "Confirme seu email no SetlistGO™",
    html
  );
}

/**
 * Envia email de recuperação de senha
 */
export async function sendPasswordReset(data: PasswordResetData): Promise<void> {
  const template = await loadTemplate("password-reset");

  const html = replaceVariables(template, {
    RESET_LINK: data.resetLink,
    EXPIRY_TIME: data.expiryTime,
    RECIPIENT_EMAIL: data.recipientEmail,
  });

  await sendEmail(
    data.recipientEmail,
    "Redefinir sua senha - SetlistGO™",
    html
  );
}

/**
 * Envia email de confirmação de assinatura
 */
export async function sendSubscriptionConfirmed(data: SubscriptionConfirmedData): Promise<void> {
  const template = await loadTemplate("subscription-confirmed");

  const html = replaceVariables(template, {
    AMOUNT: data.amount,
    PAYMENT_DATE: data.paymentDate,
    NEXT_DUE_DATE: data.nextDueDate,
    PAYMENT_METHOD: data.paymentMethod,
    APP_LINK: data.appLink,
    RECIPIENT_EMAIL: data.recipientEmail,
  });

  await sendEmail(
    data.recipientEmail,
    "Assinatura confirmada - SetlistGO™ PRO",
    html
  );
}

/**
 * Envia email de lembrete de pagamento
 */
export async function sendPaymentReminder(data: PaymentReminderData): Promise<void> {
  const template = await loadTemplate("payment-reminder");

  const html = replaceVariables(template, {
    USER_NAME: data.userName,
    DAYS_UNTIL_DUE: data.daysUntilDue,
    AMOUNT: data.amount,
    DUE_DATE: data.dueDate,
    PAYMENT_METHOD: data.paymentMethod,
    PAYMENT_LINK: data.paymentLink,
    INVOICE_LINK: data.invoiceLink,
    RECIPIENT_EMAIL: data.recipientEmail,
  });

  await sendEmail(
    data.recipientEmail,
    `Lembrete: Pagamento vence em ${data.daysUntilDue} dias`,
    html
  );
}

/**
 * Envia email de cancelamento de assinatura
 */
export async function sendSubscriptionCancelled(data: SubscriptionCancelledData): Promise<void> {
  const template = await loadTemplate("subscription-cancelled");

  const html = replaceVariables(template, {
    CANCELLATION_DATE: data.cancellationDate,
    ACCESS_UNTIL_DATE: data.accessUntilDate,
    REACTIVATE_LINK: data.reactivateLink,
    FEEDBACK_LINK: data.feedbackLink,
    RECIPIENT_EMAIL: data.recipientEmail,
  });

  await sendEmail(
    data.recipientEmail,
    "Assinatura cancelada - SetlistGO™",
    html
  );
}
