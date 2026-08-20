// Rate limit simples, em memória (por instância de servidor).
// Suficiente para o MVP; trocar por store distribuída (ex.: Upstash/Redis)
// se/de quando houver múltiplas instâncias ou abuso real.

const hits = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);
  return false;
}
