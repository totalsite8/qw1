import { STEPS } from "../data";
import { Rv, RvLine } from "../lib";

export default function Process() {
  return (
    <section id="process" className="relative border-t border-seam circuit-bg">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
        <div className="mb-12 md:mb-16">
          <Rv className="flex items-center gap-4 mb-5">
            <span className="font-mono text-copper text-sm tracking-[0.25em]">/04</span>
            <span className="h-px flex-1 bg-seam" />
            <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">как идёт проект</span>
          </Rv>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.02] tracking-tight">
              <RvLine>Форвард-проход,</RvLine>
              <RvLine delay={120}><span className="text-copper2">бриф → рост.</span></RvLine>
            </h2>
            <Rv delay={200} className="font-mono text-xs text-dim max-w-xs leading-relaxed">
              Пять стадий. Одно направление. Градиенты текут обратно после запуска.
            </Rv>
          </div>
        </div>

        <Rv className="relative">
          {/* рельса */}
          <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-moss lg:block">
            <div className="dash-flow-slow absolute inset-0" style={{ backgroundImage: "linear-gradient(90deg,#c9803f 0 6px, transparent 6px 14px)", backgroundSize: "14px 1px", backgroundRepeat: "repeat-x" }} />
            <span className="token-dot absolute top-1/2 h-[7px] w-[7px] -translate-y-1/2 rotate-45 bg-phos shadow-[0_0_12px_#3fd68b]" />
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((s, i) => (
              <Rv key={s.n} delay={i * 110} className="group relative">
                <div className="relative z-10 flex h-11 w-11 items-center justify-center border border-copper bg-ink font-mono text-sm text-copper2 transition-all duration-500 group-hover:bg-copper group-hover:text-ink group-hover:shadow-[0_0_24px_rgba(201,128,63,0.5)]">
                  {s.n}
                </div>
                <p className="mt-5 font-mono text-[10px] tracking-[0.3em] uppercase text-phos">{s.name}</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-paper">{s.studio}</h3>
                <p className="mt-3 text-sm leading-relaxed text-dim">{s.text}</p>
                {i < STEPS.length - 1 && (
                  <span className="mt-4 block font-mono text-copper lg:hidden" aria-hidden="true">↓</span>
                )}
              </Rv>
            ))}
          </div>
        </Rv>
      </div>
    </section>
  );
}
