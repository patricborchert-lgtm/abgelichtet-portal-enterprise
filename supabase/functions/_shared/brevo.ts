interface BrevoRecipient {
  email: string;
  name?: string;
}

interface SendBrevoEmailOptions {
  htmlContent: string;
  subject: string;
  textContent: string;
  to: BrevoRecipient[];
}

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export async function sendBrevoEmail(options: SendBrevoEmailOptions): Promise<void> {
  const apiKey = getEnv("BREVO_API_KEY");
  const senderEmail = getEnv("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") ?? "abgelichtet.ch";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    body: JSON.stringify({
      htmlContent: options.htmlContent,
      sender: {
        email: senderEmail,
        name: senderName,
      },
      subject: options.subject,
      textContent: options.textContent,
      to: options.to,
    }),
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Brevo email failed: ${message}`);
  }
}
