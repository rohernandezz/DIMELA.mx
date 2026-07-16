/** Shared magic-link login UI helpers (client-only). */

export function isLocalHost(): boolean {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".localhost");
}

export type MagicLinkResult = {
  ok: boolean;
  message?: string;
  error?: string;
  verifyUrl?: string;
  verifyPath?: string;
};

export async function requestMagicLink(
  email: string,
  next = "/cuenta/",
): Promise<MagicLinkResult> {
  const res = await fetch("/api/auth/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, next }),
  });
  const data = (await res.json()) as MagicLinkResult & { ok?: boolean };
  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error || "No se pudo enviar." };
  }
  return {
    ok: true,
    message: data.message || "Revisa tu correo.",
    verifyUrl: data.verifyUrl,
    verifyPath: data.verifyPath,
  };
}

export function renderDevMagicLink(result: MagicLinkResult, linkEl: HTMLElement | null): void {
  if (!linkEl || !result.verifyUrl) return;
  linkEl.classList.remove("hidden");
  const href =
    result.verifyPath ||
    (() => {
      const u = new URL(result.verifyUrl!, window.location.origin);
      return `${u.pathname}${u.search}`;
    })();
  linkEl.innerHTML = `<a class="text-dm-offblack underline" href="${href}">Abrir enlace mágico (solo desarrollo)</a>`;
}
