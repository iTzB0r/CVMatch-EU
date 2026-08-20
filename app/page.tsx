import Link from "next/link";
import { UploadCard } from "@/components/upload/upload-card";
import { PonteCvLogo } from "@/components/brand/pontecv-logo";

const benefits = [
  "Match verificável por requisito",
  "Leitura ATS e mercado europeu",
  "Recomendações com evidências",
];

const steps = [
  {
    number: "01",
    title: "Adicione a vaga",
    description: "Cole os requisitos para comparar o currículo com o que realmente importa.",
  },
  {
    number: "02",
    title: "Envie o currículo",
    description: "O PDF é processado com segurança e analisado em poucos segundos.",
  },
  {
    number: "03",
    title: "Aja com clareza",
    description: "Veja evidências, lacunas e as melhorias que mais aumentam seu match.",
  },
];

export default function Home() {
  return (
    <main className="technical-grid relative min-h-svh overflow-hidden text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_16%_12%,rgba(15,40,71,0.12),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.13),transparent_31%)]" />

      <nav className="relative border-b border-slate-200/70 bg-white/65 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <PonteCvLogo />
          <Link
            href="/history"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
          >
            Minhas análises
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto grid w-full max-w-7xl items-start gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="lg:sticky lg:top-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Análise baseada em evidências
          </div>

          <h1 className="max-w-2xl text-4xl font-black leading-[1.04] tracking-[-0.045em] text-brand-navy sm:text-6xl lg:text-[4.35rem]">
            Pare de adivinhar se seu currículo está{" "}
            <span className="text-brand-accent">pronto para a vaga.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Compare seu currículo com uma vaga real e descubra sua compatibilidade,
            requisito por requisito — com evidências claras, não uma nota aleatória.
          </p>

          <ul className="mt-8 grid gap-3 text-sm text-slate-700">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <span className="font-semibold text-brand-navy">PDF até 10 MB</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Resultado em cerca de 1 minuto</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-slate-300/40 via-white to-emerald-200/45 blur-2xl" />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Comece sua análise</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy">Currículo × vaga</h2>
              </div>
              <div className="rounded-xl bg-brand-navy px-3 py-2 text-right text-white shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-slate-300">Match</p>
                <p className="text-lg font-black text-brand-accent">0–100%</p>
              </div>
            </div>
            <UploadCard />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Como funciona</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-navy sm:text-4xl">Uma resposta útil, não apenas uma pontuação.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                <span className="text-sm font-black text-emerald-600">{step.number}</span>
                <h3 className="mt-8 text-lg font-bold text-brand-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span>© {new Date().getFullYear()} PonteCV</span>
        <div className="flex items-center gap-5">
          <span className="text-slate-400">Seus dados sob seu controle.</span>
          <Link href="/privacy" className="font-medium hover:text-brand-navy">Privacidade</Link>
          <Link href="/terms" className="font-medium hover:text-brand-navy">Termos</Link>
        </div>
      </footer>
    </main>
  );
}
