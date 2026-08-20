import Link from "next/link";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="technical-grid min-h-svh px-5 py-12 sm:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
          PonteCV · versão beta
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-brand-navy">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-slate-500">Atualizados em 20 de agosto de 2026.</p>

        <div className="mt-8 space-y-8">
          <Section title="1. Aceitação e fase beta">
            <p>
              Ao usar a PonteCV, você concorda com estes Termos e com a Política de
              Privacidade. O produto está em beta: recursos, limites e disponibilidade podem
              mudar enquanto o serviço é validado.
            </p>
            <p>
              Nenhum pagamento é cobrado nesta versão beta. Preços, condições e política de
              cancelamento serão apresentados antes da ativação de qualquer recurso pago.
            </p>
          </Section>

          <Section title="2. O serviço">
            <p>
              A PonteCV analisa currículos, compara requisitos de vagas, calcula uma
              compatibilidade baseada em critérios e pode reorganizar o conteúdo existente em
              uma versão otimizada. O serviço é uma ferramenta de apoio e não substitui a
              avaliação de um recrutador, consultor jurídico ou profissional de imigração.
            </p>
          </Section>

          <Section title="3. Responsabilidade pelo currículo">
            <p>
              Você deve ter autorização para enviar o documento e é responsável pela
              veracidade das informações. Não envie dados de terceiros sem permissão nem dados
              especialmente sensíveis que não sejam necessários ao processo seletivo.
            </p>
            <p>
              A otimização foi projetada para não inventar experiências, formações,
              competências ou resultados. Ainda assim, conteúdo gerado por inteligência
              artificial pode conter erros. Revise integralmente a versão final antes de usar
              ou enviar o currículo.
            </p>
          </Section>

          <Section title="4. Match Score e ausência de garantia">
            <p>
              Pontuações, evidências e recomendações são estimativas informativas baseadas no
              currículo e na vaga fornecidos. A PonteCV não garante entrevista, contratação,
              aprovação em ATS, visto, reconhecimento profissional ou qualquer resultado de
              processo seletivo.
            </p>
          </Section>

          <Section title="5. Uso permitido e limites">
            <p>
              Você não deve tentar contornar limites, acessar dados de outros usuários,
              interferir na plataforma, automatizar uso abusivo ou enviar conteúdo ilegal.
              Podemos limitar ou suspender sessões que coloquem o serviço, seus usuários ou
              prestadores em risco.
            </p>
          </Section>

          <Section title="6. Serviços de terceiros">
            <p>
              A PonteCV depende de serviços de hospedagem, banco de dados e inteligência
              artificial. Interrupções, limites e alterações desses prestadores podem afetar
              temporariamente o funcionamento. Quando isso ocorrer, a plataforma poderá pedir
              que você aguarde e tente novamente.
            </p>
          </Section>

          <Section title="7. Propriedade e licença">
            <p>
              Você mantém os direitos sobre o currículo e o conteúdo enviado. Concede à
              PonteCV uma licença limitada para processá-los somente na medida necessária à
              prestação, segurança e melhoria do serviço. A marca, interface e código da
              PonteCV permanecem protegidos por seus respectivos direitos.
            </p>
          </Section>

          <Section title="8. Disponibilidade e responsabilidade">
            <p>
              Buscamos manter o serviço seguro e disponível, mas não prometemos operação sem
              interrupções. Na extensão permitida pela legislação aplicável, a PonteCV não se
              responsabiliza por decisões tomadas exclusivamente com base na análise nem por
              resultados de candidaturas.
            </p>
          </Section>

          <Section title="9. Identificação e contato">
            <p>
              A identificação completa do operador, o canal de suporte e as condições
              comerciais definitivas serão publicados antes do lançamento comercial. Durante
              o beta, use o mesmo canal pelo qual recebeu acesso para relatar problemas ou
              solicitar seus direitos.
            </p>
          </Section>

          <Section title="10. Não afiliação">
            <p>
              A PonteCV não é afiliada, patrocinada ou endossada pela União Europeia, pela
              plataforma Europass ou por qualquer órgão oficial.
            </p>
          </Section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-sm font-semibold">
          <Link href="/" className="text-emerald-600 hover:underline">Voltar à PonteCV</Link>
          <Link href="/privacy" className="text-slate-600 hover:text-brand-navy">Ler a Política de Privacidade</Link>
        </div>
      </article>
    </main>
  );
}
