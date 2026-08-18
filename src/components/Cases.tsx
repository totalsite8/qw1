import { CASES } from "../data";
import { Rv, RvLine } from "../lib";

function CaseCard({ c, big = false, wide = false }: { c: (typeof CASES)[number]; big?: boolean; wide?: boolean }) {
  return (
    <article
      className={`group/case relative overflow-hidden border border-seam bg-pit/70 transition-colors duration-500 hover:border-copper/60 ${
        wide ? "lg:col-span-12 lg:grid lg:grid-cols-2" : big ? "lg:col-span-7" : "lg:col-span-5"
      }`}
    >
      <div className={`relative overflow-hidden ${wide ? "min-h-64 lg:min-h-full" : "aspect-[16/10]"}`}>
        <img src={c.img} alt={`${c.client} — ${c.sector}`} loading="lazy" className="kb-img kb-live h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-pit via-pit/20 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {c.blocks.map((b) => (
            <span key={b} className="border border-paper/25 bg-ink/60 px-2 py-1 font-mono text-[9px] tracking-[0.2em] uppercase text-paper/85 backdrop-blur-sm">
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className={`p-6 md:p-8 ${wide ? "flex flex-col justify-center" : ""}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-paper">
            {c.client}
            <span className="ml-3 inline-block h-2 w-2 rotate-45 transition-transform duration-500 group-hover/case:rotate-[225deg]" style={{ background: c.accent }} />
          </h3>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">{c.sector}</span>
        </div>
        <p className="mt-3 font-mono text-sm" style={{ color: c.accent }}>{c.result}</p>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          {c.metrics.map(([k, v]) => (
            <div key={k} className="border border-seam bg-ink/60 px-3 py-2.5 transition-colors duration-300 group-hover/case:border-moss">
              <dt className="font-mono text-[9px] tracking-[0.25em] uppercase text-dim">{k}</dt>
              <dd className="mt-0.5 font-mono text-base text-paper">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

export default function Cases() {
  return (
    <section id="work" className="relative border-t border-seam">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
        <div className="mb-12 md:mb-16">
          <Rv className="flex items-center gap-4 mb-5">
            <span className="font-mono text-copper text-sm tracking-[0.25em]">/05</span>
            <span className="h-px flex-1 bg-seam" />
            <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">отрендеренный результат</span>
          </Rv>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.02] tracking-tight">
              <RvLine>Логиты, которые мы уже</RvLine>
              <RvLine delay={120}><span className="text-copper2">схлопнули в результат.</span></RvLine>
            </h2>
            <Rv delay={200} className="font-mono text-xs text-dim">3 из 128 пройденных прогонов ↓</Rv>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <Rv><CaseCard c={CASES[0]} big /></Rv>
          <Rv delay={120}><CaseCard c={CASES[1]} /></Rv>
          <Rv delay={80}><CaseCard c={CASES[2]} wide /></Rv>
        </div>
      </div>
    </section>
  );
}
