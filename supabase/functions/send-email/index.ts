import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from } = await req.json() as EmailRequest;

    // Validação
    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, html");
    }

    // Configuração SMTP do Gmail
    const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
    const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");
    const SMTP_FROM = from || Deno.env.get("SMTP_FROM") || "SetlistGO™ <noreply@setlistgo.com>";

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error("SMTP credentials not configured");
    }

    console.log(`Enviando email para ${to} via ${SMTP_HOST}:${SMTP_PORT}`);

    // Conectar ao SMTP
    const client = new SmtpClient();

    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER,
      password: SMTP_PASS,
    });

    // Enviar email
    await client.send({
      from: SMTP_FROM,
      to: to,
      subject: subject,
      content: html,
      html: html,
    });

    await client.close();

    console.log(`Email enviado com sucesso para ${to}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        to: to
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao enviar email:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
