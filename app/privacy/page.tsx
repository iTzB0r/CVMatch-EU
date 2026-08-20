import Link from "next/link";

// Rascunho — finalizar antes do lançamento público.
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900">
        Política de Privacidade
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        Rascunho — versão inicial, a revisar antes do lançamento.
      </p>
      <div className="mt-8 flex flex-col gap-4 text-neutral-700">
        <p>
          O CVMatch EU processa o texto do seu currículo apenas para gerar a
          análise solicitada. Não usamos seus dados para treinar modelos sem o
          seu consentimento explícito.
        </p>
        <p>
          Armazenamos apenas o texto extraído do documento, não o arquivo
          original. Você pode apagar a sua análise a qualquer momento e os dados
          são retidos pelo tempo mínimo necessário.
        </p>
        <p>
          Este serviço não é afiliado, patrocinado ou endossado pela União
          Europeia, pela plataforma Europass ou por qualquer órgão oficial.
        </p>
        <p>
          Para solicitar a exclusão dos seus dados, entre em contato pelos
          canais indicados nos Termos de Uso.
        </p>
      </div>
      <Link href="/" className="mt-8 inline-block text-emerald-600 hover:underline">
        Voltar
      </Link>
    </main>
  );
}
