# CVMatch EU

Aplicação web que analisa currículos em PDF com IA e sugere melhorias. O usuário envia o currículo, recebe a análise, pode dar feedback sobre o resultado e usar um otimizador do currículo. As análises ficam salvas em um histórico.

## Recursos

- Envio e leitura de currículo em PDF.
- Análise com IA (Claude, pelo Vercel AI SDK) e página de resultado.
- Otimizador de currículo e feedback sobre cada análise.
- Histórico de análises.
- Limite de requisições (`lib/rate-limit.ts`) e páginas de privacidade e de termos.

## Tecnologias

Next.js (App Router), React, TypeScript, Tailwind CSS, Vercel AI SDK com Anthropic, Supabase, `pdfjs-dist` para ler o PDF e `zod` para validar dados.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Outros scripts: `npm run build`, `npm run lint`, `npm test`, `npm run test:ai` e `npm run test:optimizer`.

As chaves e os segredos ficam no `.env.local` (não versionado). O arquivo `.env.example` traz só valores de exemplo.

## Estrutura

```text
app/          páginas e rotas de API (analyze, analyses, feedback, optimize)
components/   upload, resultado, otimizador e feedback
lib/          configuração, tipos, limite de requisições e utilitários
```

## Autor

**Filipe Borja Freitas Silva** · [GitHub](https://github.com/iTzB0r) · [LinkedIn](https://linkedin.com/in/filipe-borja-data)
