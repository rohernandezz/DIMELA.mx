/**
 * Transactional email (Cloudflare Email Sending binding).
 */

export async function sendMagicLinkEmail(env, { to, verifyUrl }) {
  if (!env.EMAIL) {
    return { sent: false, reason: "no_binding" };
  }

  const fromAddress = env.MAGIC_LINK_FROM || "hola@dimela.mx";
  const fromName = env.MAGIC_LINK_FROM_NAME || "DIMELA.mx";

  try {
    await env.EMAIL.send({
      to,
      from: { email: fromAddress, name: fromName },
      subject: "Tu enlace para entrar a DIMELA.mx",
      text: `Hola,\n\nUsa este enlace para entrar a DIMELA.mx (válido 30 minutos):\n\n${verifyUrl}\n\nSi no lo pediste, puedes ignorar este correo.\n\n— DIMELA.mx`,
      html: `<!DOCTYPE html><html lang="es"><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
<p>Hola,</p>
<p>Usa este enlace para entrar a <strong>DIMELA.mx</strong> (válido 30 minutos):</p>
<p><a href="${verifyUrl}">${verifyUrl}</a></p>
<p>Si no lo pediste, puedes ignorar este correo.</p>
<p style="color:#666;font-size:14px;">— DIMELA.mx</p>
</body></html>`,
    });
    return { sent: true };
  } catch (err) {
    console.error("Magic link email failed:", err);
    return { sent: false, reason: "send_failed", error: String(err?.message || err) };
  }
}
