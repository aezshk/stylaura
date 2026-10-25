
const { BrevoClient } = require("@getbrevo/brevo");

function createBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured.");
  }

  return new BrevoClient({ apiKey });
}

async function sendEmail({ to, subject, htmlContent }) {
  if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error("BREVO_SENDER_EMAIL is not configured.");
  }

  if (!to || !subject || !htmlContent) {
    throw new Error("Recipient, subject, and email content are required.");
  }

  const brevo = createBrevoClient();

  return brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.BREVO_SENDER_NAME || "STYLAURA",
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to }],
    subject,
    htmlContent,
  });
}

module.exports = { sendEmail };
