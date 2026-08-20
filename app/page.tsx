import Link from "next/link";
import { UploadCard } from "@/components/upload/upload-card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Currículos para Portugal e Europa
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          Seu currículo está pronto para{" "}
          <span className="text-emerald-600">aquela vaga na Europa?</span>
        </h1>
        <p className="max-w-xl text-lg text-neutral-600">
          Descubra em segundos se o seu currículo passa no crivo de recrutadores
          e sistemas ATS em Portugal e na Europa — e receba recomendações
          concretas para aumentar sua compatibilidade.
        </p>
      </div>

      <UploadCard />

      <div className="grid w-full max-w-xl gap-4 text-left sm:grid-cols-3">
        {[
          {
            title: "1. Envie seu currículo",
            description: "Envie o PDF. Extraímos o texto na hora.",
          },
          {
            title: "2. Receba a análise",
            description: "Notas de compatibilidade, pontos fortes e problemas.",
          },
          {
            title: "3. Otimize",
            description: "Recomendações práticas para a vaga europeia.",
          },
        ].map((s) => (
          <div key={s.title} className="rounded-xl border border-neutral-200 p-4">
            <p className="text-sm font-semibold text-neutral-900">{s.title}</p>
            <p className="mt-1 text-sm text-neutral-500">{s.description}</p>
          </div>
        ))}
      </div>

      <footer className="flex items-center gap-4 text-sm text-neutral-400">
        <span>© {new Date().getFullYear()} CVMatch EU</span>
        <Link href="/privacy" className="hover:text-neutral-600">
          Privacidade
        </Link>
        <Link href="/terms" className="hover:text-neutral-600">
          Termos
        </Link>
      </footer>
    </main>
  );
}
