import { SPEC_ROWS, STATS, TICKER } from "../data";
import { Rv, RvLine, useCountUp, useInView } from "../lib";

export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="marquee relative overflow-hidden border-y border-seam bg-pit py-3" aria-hidden="true">
      <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-sm font-semibold tracking-[0.25em] text-dim">
            {t}
            <svg width="10" height="10" viewBox="0 0 10 10" className="text-copper"><rect x="2" y="2" width="6" height="6" transform="rotate(45 5 5)" fill="currentColor" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ value, suffix, label, run, delay }: { value: number; suffix: string; label: string; run: boolean; delay: number }) {
  const v = useCountUp(value, run, 1500 + delay);
  return (
    <Rv delay={delay} className="border border-seam bg-pit/70 p-6 transition-colors duration-500 hover:border-copper/50">
      <p className="font-mono text-4xl md:text-6xl font-semibold text-paper tabular-nums">
        {v}
        <span className="text-copper">{suffix}</span>
      </p>
      <p className="mt-2 font-mono text-[10px] tracking-[0.3em] uppercase text-dim">{label}</p>
    </Rv>
  );
}

export default function Specs() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  return (
    <section id="specs" className="relative border-t border-seam bg-pit/40 circuit-bg">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
        <div className="mb-12 md:mb-16">
          <Rv className="flex items-center gap-4 mb-5">
            <span className="font-mono text-copper text-sm tracking-[0.25em]">/06</span>
            <span className="h-px flex-1 bg-seam" />
            <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">datasheet</span>
          </Rv>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.02] tracking-tight">
            <RvLine>Studio specifications,</RvLine>
            <RvLine delay={120}><span className="text-copper2">measured not promised.</span></RvLine>
          </h2>
        </div>

        <div ref={ref} className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="grid grid-cols-2 gap-4 self-start">
            {STATS.map((s, i) => (
              <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} run={inView} delay={i * 120} />
            ))}
          </div>

          <Rv delay={150} className="border border-seam bg-ink/70">
            <div className="flex items-center justify-between border-b border-seam px-5 py-3">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper2">TENSORFORGE TF-9 · rev 4.2</p>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim">doc. DS-2026-EN</p>
            </div>
            <dl>
              {SPEC_ROWS.map(([k, v], i) => (
                <div
                  key={k}
                  className={`group flex flex-col gap-1 px-5 py-3.5 transition-colors duration-300 hover:bg-moss/30 sm:flex-row sm:items-baseline sm:gap-6 ${
                    i % 2 ? "bg-pit/50" : ""
                  }`}
                >
                  <dt className="w-40 shrink-0 font-mono text-[10px] tracking-[0.25em] uppercase text-dim group-hover:text-copper2 transition-colors">
                    {k}
                  </dt>
                  <dd className="text-sm text-paper/90">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-seam px-5 py-3 font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
              * all figures audited across 2017–2026 production logs
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}
