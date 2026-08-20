// Constantes do MVP.
//
// PAYWALL_ENABLED vira `true` quando o Stripe for integrado.
// Enquanto falso, a API devolve a análise completa para testarmos o fluxo
// de renderização de ponta a ponta sem bloqueio.
export const PAYWALL_ENABLED = false;

export const ANALYSIS = {
  // Mínimo de caracteres que o texto extraído precisa ter para considerarmos
  // que o PDF tem camada de texto (PDFs escaneados saem com pouco ou nada).
  MIN_TEXT_CHARS: 100,
  MAX_TEXT_CHARS: 50_000,
  RATE_LIMIT: {
    // Cada análise grátis custa API. Limite por usuário por hora.
    MAX_PER_USER_PER_HOUR: 5,
    WINDOW_MS: 60 * 60 * 1000,
  },
} as const;
