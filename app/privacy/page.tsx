import Link from "next/link";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="technical-grid min-h-svh px-5 py-12 sm:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
          PonteCV · versão beta
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-brand-navy">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-slate-500">Atualizada em 20 de agosto de 2026.</p>

        <div className="mt-8 space-y-8">
          <Section title="1. Quem é responsável">
            <p>
              A PonteCV é responsável pelo tratamento realizado dentro deste serviço beta.
              A identificação completa do responsável e um canal dedicado de privacidade
              serão publicados antes do lançamento comercial. Durante o beta, solicitações
              podem ser enviadas pelo mesmo canal em que o acesso ao produto foi fornecido.
            </p>
          </Section>

          <Section title="2. Dados tratados">
            <ul className="list-disc space-y-1 pl-5">
              <li>texto extraído do currículo e informações pessoais contidas nele;</li>
              <li>cargo-alvo e descrição da vaga enviados para comparação;</li>
              <li>análises, Match Score, versões otimizadas e feedback opcional;</li>
              <li>identificador de sessão anônima e registros técnicos de segurança e erro.</li>
            </ul>
            <p>
              O arquivo PDF original é processado no navegador e não é armazenado pela
              PonteCV. O texto extraído é armazenado para permitir histórico, exclusão e
              otimização posterior.
            </p>
          </Section>

          <Section title="3. Finalidades e fundamento">
            <p>
              Os dados são usados para prestar o serviço solicitado: extrair o currículo,
              gerar a análise, comparar requisitos, produzir uma versão otimizada, manter o
              histórico e prevenir abuso. O tratamento necessário à análise decorre da
              execução do serviço solicitado; segurança e prevenção de fraude atendem ao
              interesse legítimo de manter a plataforma disponível e protegida.
            </p>
            <p>
              A PonteCV não usa currículos para treinar modelos próprios nem vende dados
              pessoais. O feedback opcional é usado para avaliar e melhorar a assertividade.
            </p>
          </Section>

          <Section title="4. Prestadores e transferências">
            <p>
              Para operar o produto, dados podem ser processados pela Vercel (hospedagem),
              Supabase (autenticação e banco de dados) e ThonyGG, incluindo o provedor de
              modelo selecionado pelo gateway (processamento de IA). Esses serviços podem
              processar dados fora do país do usuário ou do Espaço Econômico Europeu,
              conforme suas infraestruturas e mecanismos contratuais aplicáveis.
            </p>
          </Section>

          <Section title="5. Retenção e exclusão">
            <p>
              Currículos, análises, feedbacks e otimizações permanecem associados à sessão
              até serem excluídos pelo usuário. A exclusão disponível em “Minhas análises”
              remove o documento e os resultados relacionados em cascata. Prestadores podem
              manter registros técnicos por períodos limitados conforme suas obrigações de
              segurança e legais.
            </p>
          </Section>

          <Section title="6. Seus direitos">
            <p>
              Conforme a legislação aplicável, você pode solicitar informação, acesso,
              correção, exclusão, limitação, portabilidade ou oposição ao tratamento. Você
              também pode reclamar perante a autoridade de proteção de dados competente.
              A PonteCV não toma decisões de contratação nem decisões com efeito jurídico;
              as notas são apenas apoio informativo.
            </p>
          </Section>

          <Section title="7. Segurança e sessão">
            <p>
              O acesso usa uma sessão anônima armazenada no dispositivo. As regras do banco
              restringem cada análise ao respectivo usuário, e chaves administrativas e de IA
              permanecem somente no servidor. Nenhum serviço conectado à internet oferece
              segurança absoluta; por isso, evite incluir no currículo dados desnecessários ou
              especialmente sensíveis.
            </p>
          </Section>

          <Section title="8. Alterações">
            <p>
              Esta política pode evoluir durante o beta. Mudanças relevantes serão indicadas
              nesta página com uma nova data de atualização.
            </p>
          </Section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-sm font-semibold">
          <Link href="/" className="text-emerald-600 hover:underline">Voltar à PonteCV</Link>
          <Link href="/terms" className="text-slate-600 hover:text-brand-navy">Ler os Termos de Uso</Link>
        </div>
      </article>
    </main>
  );
}
