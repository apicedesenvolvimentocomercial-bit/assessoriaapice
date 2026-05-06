import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ÁPICE — Desenvolvimento Comercial para Clínicas de Estética em Curitiba" },
      {
        name: "description",
        content:
          "Clínicas de estética em Curitiba crescem 20–40% de faturamento em 90 dias com a ÁPICE. Diagnóstico, atendimento, automação e tráfego",
      },
      { property: "og:title", content: "ÁPICE — Desenvolvimento Comercial para Clínicas de Estética" },
      {
        property: "og:description",
        content:
          "Crescimento mensurável em 90 dias para clínicas de estética em Curitiba. Garantia de performance.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

/* ---------- Hooks ---------- */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = Number(el.dataset.delay ?? i * 80);
            setTimeout(() => el.classList.add("in"), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCounter(target: number, suffix = "", duration = 1600) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min((t - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(target * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, display: `${val}${suffix}` };
}

/* ---------- Subcomponents ---------- */

function GuaranteeBadge({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold-dim)] px-4 py-2 ${
        small ? "text-xs" : "text-sm"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--gold)]">
        <path
          d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="tracking-wider uppercase text-[var(--gold)] font-medium">
        Garantia de Performance · 90 dias
      </span>
    </div>
  );
}

function MetricCard({
  from,
  to,
  suffix,
  label,
  inverse = false,
  delay = 0,
}: {
  from: number;
  to: number;
  suffix: string;
  label: string;
  inverse?: boolean;
  delay?: number;
}) {
  const before = useCounter(from, suffix);
  const after = useCounter(to, suffix);

  return (
    <div
      className="reveal card-hover gold-glow rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8"
      data-delay={delay}
    >
      <div className="flex items-baseline gap-3 md:gap-5 flex-wrap">
        <span ref={before.ref} className="number-display text-3xl md:text-4xl text-[var(--text-muted)] line-through decoration-1">
          {before.display}
        </span>
        <svg width="24" height="14" viewBox="0 0 24 14" fill="none" className="text-[var(--gold)]">
          <path d="M0 7h22M16 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span
          ref={after.ref}
          className="number-display text-5xl md:text-6xl"
          style={{ color: inverse ? "var(--accent-green-light)" : "var(--gold-light)" }}
        >
          {after.display}
        </span>
      </div>
      <p className="mt-5 text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function PillarCard({
  num,
  title,
  desc,
  delay,
}: {
  num: string;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <div
      className="reveal card-hover relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8 h-full"
      data-delay={delay}
    >
      <div className="font-display text-5xl text-[var(--gold)] opacity-50 mb-4">{num}</div>
      <h3 className="text-2xl mb-3 text-[var(--text-primary)]">{title}</h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">{desc}</p>
    </div>
  );
}

/* ---------- Page ---------- */

function Index() {
  useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmitting = useRef(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("https://assessoriaapice-production.up.railway.app/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar.");

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const pains = [
    "Invisto em tráfego pago mas os leads não convertem",
    "Tenho muitos no-shows e não sei como resolver",
    "Minha equipe não segue script — cada uma atende diferente",
    "Não tenho clareza dos meus números",
    "Trabalho muito, mas o lucro não cresce na mesma proporção",
    "Já fiz curso de Instagram, curso de gestão. Nada muda de verdade",
  ];

  const pillars = [
    { n: "01", t: "Diagnóstico Comercial", d: "Mapeamos onde está o gargalo antes de qualquer ação." },
    { n: "02", t: "Estrutura de Atendimento", d: "Sua equipe converte leads com consistência — não por sorte." },
    { n: "03", t: "Automação Inteligente", d: "Tecnologia que trabalha pela clínica enquanto você está em procedimento." },
    { n: "04", t: "Tráfego Estratégico", d: "Só ativamos anúncios quando o funil está pronto para converter." },
    { n: "05", t: "Gestão por Dados", d: "Você decide com números reais — não com intuição." },
  ];

  const steps = [
    { n: "01", t: "Diagnóstico", d: "Entendemos o seu negócio antes de propor qualquer solução." },
    { n: "02", t: "Estruturação", d: "Montamos o que precisa ser montado para crescer." },
    { n: "03", t: "Ativação", d: "Ligamos os motores quando o terreno está preparado." },
    { n: "04", t: "Acompanhamento", d: "Presença ativa todos os meses — relatório e reunião." },
  ];

  return (
    <div className="grain relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* NAV */}
      <header className="relative z-20 px-6 md:px-10 py-6 flex items-center justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-[var(--gold)] flex items-center justify-center">
            <span className="font-display text-[var(--gold)] text-lg leading-none">Á</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl tracking-wide">ÁPICE</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Curitiba · PR</div>
          </div>
        </div>
        <a
          href="#diagnostico"
          className="hidden md:inline-flex items-center gap-2 text-sm border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors px-5 py-2.5 rounded-full"
        >
          Diagnóstico gratuito
          <span className="text-[var(--gold)]">→</span>
        </a>
      </header>

      {/* HERO */}
      <section className="hero-gradient relative z-10 px-6 md:px-10 pt-12 md:pt-24 pb-24 md:pb-40">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <div className="reveal mb-8">
              <GuaranteeBadge />
            </div>
            <h1 className="reveal text-5xl md:text-7xl lg:text-[5.5rem] mb-8" data-delay="120">
              Sua clínica cresce
              <span className="block">
                em
                <span className="text-[var(--gold)] italic"> 90 </span>
                dias.
              </span>
            </h1>
            <p
              className="reveal text-lg md:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed mb-10"
              data-delay="240"
            >
              Desenvolvimento comercial para clínicas de estética em Curitiba e Região Metropolitana.
              Diagnóstico, atendimento, automação e tráfego — operando como um único sistema.
            </p>
            <div className="reveal flex flex-col sm:flex-row gap-4 items-start sm:items-center" data-delay="360">
              <a
                href="#diagnostico"
                className="btn-cta inline-flex items-center justify-center gap-2 bg-[var(--gold)] text-[var(--bg-primary)] font-medium px-8 py-4 rounded-full hover:bg-[var(--gold-light)] transition-colors"
              >
                Quero um diagnóstico gratuito
                <span>→</span>
              </a>
              <span className="text-sm text-[var(--text-muted)]">30 minutos · sem compromisso</span>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="reveal relative" data-delay="200">
              <div className="absolute -inset-8 bg-[var(--gold-dim)] blur-3xl rounded-full opacity-60" />
              <div className="relative border border-[var(--border)] rounded-2xl bg-[var(--bg-secondary)]/80 backdrop-blur p-10 gold-glow">
                <div className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)] mb-4">
                  Resultado médio
                </div>
                <div className="number-display text-7xl md:text-8xl text-[var(--gold-light)] mb-2">+34%</div>
                <div className="text-[var(--text-secondary)] mb-8">faturamento em 90 dias</div>
                <div className="gold-divider mb-8" />
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="number-display text-3xl text-[var(--accent-green-light)]">8%</div>
                    <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] mt-1">No-show</div>
                  </div>
                  <div>
                    <div className="number-display text-3xl text-[var(--accent-green-light)]">28%</div>
                    <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] mt-1">Conversão</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider max-w-[1200px] mx-auto" />

      {/* PROBLEMA */}
      <section className="relative z-10 px-6 md:px-10 py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="reveal text-sm uppercase tracking-[0.25em] text-[var(--gold)] mb-6">01 · A situação</p>
            <h2 className="reveal text-4xl md:text-6xl mb-6" data-delay="100">
              Se você se reconhece em algum desses cenários...
            </h2>
            <p className="reveal text-lg text-[var(--text-secondary)] leading-relaxed" data-delay="200">
              Você não está sozinha. E não é falta de esforço — é falta de sistema.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {pains.map((p, i) => (
              <div
                key={p}
                className="reveal flex items-start gap-4 border border-[var(--border-subtle)] rounded-lg p-6 bg-[var(--bg-secondary)]/50 hover:border-[var(--border)] transition-colors"
                data-delay={i * 90}
              >
                <span className="text-[var(--gold)] font-display text-xl mt-0.5">"</span>
                <p className="text-[var(--text-primary)] text-lg leading-relaxed italic">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gold-divider max-w-[1200px] mx-auto" />

      {/* DIFERENCIAL */}
      <section className="relative z-10 px-6 md:px-10 py-24 md:py-36 bg-[var(--bg-secondary)]/40">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <p className="reveal text-sm uppercase tracking-[0.25em] text-[var(--gold)] mb-6">02 · Posicionamento</p>
            <h2 className="reveal text-4xl md:text-5xl mb-6" data-delay="100">
              Não somos uma agência genérica.
            </h2>
            <p className="reveal text-lg text-[var(--text-secondary)] leading-relaxed" data-delay="200">
              Atuamos exclusivamente com clínicas de estética. É a única coisa que fazemos — e o motivo
              pelo qual conseguimos garantir performance.
            </p>
          </div>
          <div className="md:col-span-7 space-y-6">
            {[
              ["Especialização absoluta", "Só clínicas de estética. Nada mais. Conhecemos o ticket, o ciclo, a sazonalidade, o perfil da paciente."],
              ["Método integrado", "Não é só tráfego. Não é só automação. É o conjunto operando como um único sistema comercial."],
              ["Garantia de performance", "Não entregou resultado em 90 dias? Não cobramos fee de performance. Sem letras miúdas."],
              ["Presença local em Curitiba", "Conhecemos o mercado, a concorrência e a paciente da Região Metropolitana."],
            ].map(([t, d], i) => (
              <div
                key={t}
                className="reveal flex gap-6 border-l border-[var(--gold)] pl-6 py-2"
                data-delay={i * 100}
              >
                <div className="flex-1">
                  <h3 className="text-xl mb-2">{t}</h3>
                  <p className="text-[var(--text-secondary)]">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="relative z-10 px-6 md:px-10 py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="reveal text-sm uppercase tracking-[0.25em] text-[var(--gold)] mb-6">03 · Entrega</p>
            <h2 className="reveal text-4xl md:text-6xl mb-6" data-delay="100">
              Cinco pilares. <span className="italic text-[var(--gold)]">Um só sistema.</span>
            </h2>
            <p className="reveal text-lg text-[var(--text-secondary)]" data-delay="200">
              Cada peça resolve um problema específico — e juntas geram crescimento mensurável.
            </p>
          </div>
          <div className="grid md:grid-cols-6 gap-5">
            <div className="md:col-span-2"><PillarCard {...{ num: pillars[0].n, title: pillars[0].t, desc: pillars[0].d, delay: 0 }} /></div>
            <div className="md:col-span-2"><PillarCard {...{ num: pillars[1].n, title: pillars[1].t, desc: pillars[1].d, delay: 100 }} /></div>
            <div className="md:col-span-2"><PillarCard {...{ num: pillars[2].n, title: pillars[2].t, desc: pillars[2].d, delay: 200 }} /></div>
            <div className="md:col-span-3"><PillarCard {...{ num: pillars[3].n, title: pillars[3].t, desc: pillars[3].d, delay: 300 }} /></div>
            <div className="md:col-span-3"><PillarCard {...{ num: pillars[4].n, title: pillars[4].t, desc: pillars[4].d, delay: 400 }} /></div>
          </div>
        </div>
      </section>

      {/* RESULTADOS */}
      <section className="relative z-10 px-6 md:px-10 py-24 md:py-36 bg-[var(--bg-secondary)]/40">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="reveal text-sm uppercase tracking-[0.25em] text-[var(--gold)] mb-6">04 · Prova</p>
            <h2 className="reveal text-4xl md:text-6xl mb-6" data-delay="100">
              Clínicas reais em Curitiba. <span className="italic text-[var(--gold)]">Dados reais.</span>
            </h2>
            <p className="reveal text-[var(--text-secondary)] leading-relaxed text-lg" data-delay="200">
              Não divulgamos nomes por confidencialidade — mas conectamos você diretamente com clientes
              para conversar sem filtro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <MetricCard from={22} to={8} suffix="%" label="No-show em 60 dias" inverse delay={0} />
            <MetricCard from={15} to={28} suffix="%" label="Conversão de leads em 90 dias" inverse delay={120} />
            <MetricCard from={0} to={34} suffix="%" label="Crescimento médio de faturamento" inverse delay={240} />
            <MetricCard from={60} to={5} suffix="min" label="Tempo de resposta ao lead" inverse delay={360} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Em 3 meses voltei a ter previsibilidade. Sei exatamente quanto vou faturar e por quê.",
              "Resolvi o no-show, que era meu maior buraco. A diferença no caixa foi imediata.",
            ].map((q, i) => (
              <div
                key={q}
                className="reveal border border-[var(--border-subtle)] rounded-xl p-8 bg-[var(--bg-tertiary)]"
                data-delay={i * 120}
              >
                <div className="font-display text-4xl text-[var(--gold)] leading-none mb-4">"</div>
                <p className="text-lg text-[var(--text-primary)] italic leading-relaxed mb-6">{q}</p>
                <p className="text-sm uppercase tracking-wider text-[var(--text-muted)]">— Dona de Clínica, Curitiba</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="relative z-10 px-6 md:px-10 py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="reveal text-sm uppercase tracking-[0.25em] text-[var(--gold)] mb-6">05 · Caminho</p>
            <h2 className="reveal text-4xl md:text-6xl" data-delay="100">
              Como trabalhamos.
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
            {steps.map((s, i) => (
              <div key={s.n} className="reveal relative" data-delay={i * 120}>
                <div className="relative z-10 w-24 h-24 mx-auto md:mx-0 mb-6 rounded-full border border-[var(--gold)] bg-[var(--bg-primary)] flex items-center justify-center">
                  <span className="font-display text-2xl text-[var(--gold)]">{s.n}</span>
                </div>
                <h3 className="text-2xl mb-3">{s.t}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="relative z-10 px-6 md:px-10 py-24 md:py-36 bg-[var(--bg-secondary)]/40">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8">
          <div className="reveal border border-[var(--border)] rounded-xl p-10 bg-[var(--bg-secondary)] gold-glow">
            <div className="text-[var(--gold)] text-sm uppercase tracking-[0.25em] mb-4">É para você</div>
            <h3 className="text-3xl mb-8">A ÁPICE é para você se:</h3>
            <ul className="space-y-5">
              {[
                "Sua clínica já funciona, mas o crescimento está travado",
                "Você quer previsibilidade de receita, não resultado de sorte",
                "Está disposta a implementar com seriedade",
                "Quer dados concretos, não relatórios bonitos sem ação",
              ].map((it) => (
                <li key={it} className="flex gap-4 text-[var(--text-primary)]">
                  <span className="text-[var(--gold)] mt-1">✓</span>
                  <span className="leading-relaxed">{it}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal border border-[var(--border-subtle)] rounded-xl p-10 bg-[var(--bg-secondary)]/40" data-delay="120">
            <div className="text-[var(--text-muted)] text-sm uppercase tracking-[0.25em] mb-4">Não é para você</div>
            <h3 className="text-3xl mb-8 text-[var(--text-secondary)]">Não trabalhamos com:</h3>
            <ul className="space-y-5">
              {[
                "Clínicas que estão começando do zero",
                'Quem busca só "post bonito" sem estrutura comercial',
                "Quem não quer envolver a equipe no processo",
              ].map((it) => (
                <li key={it} className="flex gap-4 text-[var(--text-secondary)]">
                  <span className="text-[var(--text-muted)] mt-1">✕</span>
                  <span className="leading-relaxed">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="relative z-10 px-6 md:px-10 py-24 md:py-36">
        <div className="max-w-[1000px] mx-auto reveal">
          <div className="relative rounded-2xl border border-[var(--gold)] bg-gradient-to-br from-[var(--gold-dim)] to-transparent p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,var(--gold),transparent_60%)]" />
            <div className="relative">
              <div className="inline-block mb-8"><GuaranteeBadge /></div>
              <p className="font-display text-3xl md:text-5xl leading-tight text-[var(--text-primary)] mb-6">
                "Se você implementar o que estruturamos e não tiver resultado nos primeiros{" "}
                <span className="text-[var(--gold)] italic">90 dias</span>, não cobramos fee de performance."
              </p>
              <p className="text-[var(--text-secondary)] text-lg">
                Sem letras miúdas. Sem desculpas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section id="diagnostico" className="relative z-10 px-6 md:px-10 py-24 md:py-36 bg-[var(--bg-secondary)]/60">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <p className="reveal text-sm uppercase tracking-[0.25em] text-[var(--gold)] mb-6">Diagnóstico gratuito</p>
            <h2 className="reveal text-4xl md:text-6xl mb-6" data-delay="100">
              Quer saber onde está o <span className="italic text-[var(--gold)]">gargalo</span> da sua clínica?
            </h2>
            <p className="reveal text-lg text-[var(--text-secondary)]" data-delay="200">
              O diagnóstico é gratuito. Dura 30 minutos. Sem compromisso.
            </p>
          </div>

          <div className="reveal border border-[var(--border)] rounded-2xl bg-[var(--bg-primary)] p-8 md:p-12 gold-glow" data-delay="200">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-[var(--gold)] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[var(--gold)]">
                    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-3xl mb-4">Recebemos sua solicitação.</h3>
                <p className="text-[var(--text-secondary)] text-lg">
                  Em breve entraremos em contato pelo WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Seu nome" name="name" required />
                  <Field label="Nome da clínica" name="clinic" required />
                  <Field label="Cidade" name="city" required defaultValue="Curitiba" />
                  <Field label="WhatsApp" name="whatsapp" type="tel" required placeholder="(41) 9 9999-9999" />
                </div>
                <Field label="Faturamento mensal estimado (opcional)" name="revenue" />
                {error && (
                  <p className="text-red-400 text-sm text-center border border-red-400/20 bg-red-400/5 rounded-lg py-3 px-4">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-cta w-full inline-flex items-center justify-center gap-2 bg-[var(--gold)] text-[var(--bg-primary)] font-medium px-8 py-5 rounded-full hover:bg-[var(--gold-light)] transition-colors text-lg mt-4"
                >
                  {loading ? "Enviando..." : "Quero meu diagnóstico gratuito"}
                  {!loading && <span>→</span>}
                </button>
                <p className="text-center text-sm text-[var(--text-muted)] pt-2">
                  Atendemos um número limitado de clínicas por vez para garantir qualidade.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] px-6 md:px-10 py-12">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full border border-[var(--gold)] flex items-center justify-center">
                <span className="font-display text-[var(--gold)] text-lg leading-none">Á</span>
              </div>
              <span className="font-display text-xl">ÁPICE</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">
              Desenvolvimento Comercial para Clínicas de Estética.
            </p>
          </div>
          <div className="text-sm text-[var(--text-secondary)] space-y-2">
            <div className="text-[var(--text-muted)] uppercase tracking-wider text-xs mb-3">Contato</div>
            <a href="https://instagram.com/apice.comercial" className="block hover:text-[var(--gold)] transition-colors">
              @apice.comercial
            </a>
            <a href="https://wa.me/554195173900" className="block hover:text-[var(--gold)] transition-colors">
              WhatsApp · (41) 9 9517-3900
            </a>
            <div>Curitiba, PR · Brasil</div>
          </div>
          <div className="text-sm text-[var(--text-muted)] md:text-right">
            © 2025 ÁPICE.<br />Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a
        href="https://wa.me/554195173900"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale com a ÁPICE no WhatsApp"
        className="group fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.88 11.9L4 20l4.22-1.1a7.93 7.93 0 003.83.98h.01a7.94 7.94 0 005.54-13.56zm-5.55 12.2h-.01a6.6 6.6 0 01-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.59 6.59 0 1112.21-3.51 6.59 6.59 0 01-6.6 6.61zm3.62-4.94c-.2-.1-1.18-.58-1.36-.65-.18-.07-.31-.1-.45.1s-.51.65-.63.78c-.12.14-.23.15-.43.05-.2-.1-.84-.31-1.6-.99-.59-.53-.99-1.18-1.1-1.38-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.07-.14.03-.26-.02-.36-.05-.1-.45-1.08-.62-1.48-.16-.39-.33-.34-.45-.34h-.39c-.13 0-.34.05-.52.25s-.69.67-.69 1.64.71 1.91.81 2.04c.1.14 1.4 2.13 3.39 2.99.47.2.84.33 1.13.42.47.15.91.13 1.25.08.38-.06 1.18-.48 1.34-.95.17-.46.17-.86.12-.94-.05-.08-.18-.13-.38-.23z" />
        </svg>
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Fale com a ÁPICE
        </span>
      </a>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
        {label} {required && <span className="text-[var(--gold)]">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] focus:bg-[var(--bg-tertiary)] transition-colors"
      />
    </label>
  );
}
