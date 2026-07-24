export type AuthIdentifierKind = "email" | "phone" | "wechat";

export type SupabaseAuthIdentifier = {
  email: string;
  kind: AuthIdentifierKind;
  original: string;
};

const INTERNAL_AUTH_DOMAIN = "login.tomeet.chat";

function looksLikePhone(identifier: string) {
  return /^[+\d][\d\s()-]{5,}$/.test(identifier);
}

function normalizePhone(identifier: string) {
  let digits = identifier.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (/^1[3-9]\d{9}$/.test(digits)) digits = `86${digits}`;
  return digits;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function toSupabaseAuthIdentifier(
  input: string
): Promise<SupabaseAuthIdentifier> {
  const original = input.trim().normalize("NFKC");

  if (original.includes("@")) {
    return {
      email: original.toLowerCase(),
      kind: "email",
      original,
    };
  }

  const kind: AuthIdentifierKind = looksLikePhone(original)
    ? "phone"
    : "wechat";
  const normalized =
    kind === "phone" ? normalizePhone(original) : original.toLowerCase();
  const digest = await sha256(`${kind}:${normalized}`);

  return {
    email: `${kind}.${digest}@${INTERNAL_AUTH_DOMAIN}`,
    kind,
    original,
  };
}
