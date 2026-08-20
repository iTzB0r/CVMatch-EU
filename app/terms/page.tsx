import Link from "next/link";

// Rascunho — finalizar antes do lançamento público.
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900">Termos de Uso</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Rascunho — versão inicial, a revisar antes do lançamento.
      </p>
      <div className="mt-8 flex flex-col gap-4 text-neutral-700">
        <p>
          O CVMatch EU oferece análise e recomendações para melhorar currículos
          direcionados ao mercado europeu. As análises são geradas por
          inteligência artificial e têm caráter informativo — não garantem
          entrevistas, contratações ou aprovação em processos seletivos.
        </p>
        <p>
          Você é responsável pela veracidade das informações no seu currículo.
          O serviço melhora a apresentação do conteúdo existente e nunca
          adiciona experiências, formações ou certificações que você não possui.
        </p>
        <p>
          Este serviço não é afiliado, patrocinado ou endossado pela União
          Europeia, pela plataforma Europass ou por qualquer órgão oficial.
        </p>
      </div>
      <Link href="/" className="mt-8 inline-block text-emerald-600 hover:underline">
        Voltar
      </Link>
    </main>
  );
}
