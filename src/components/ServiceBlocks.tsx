import { useState } from "react";
import { SERVICES } from "../data";
import { Rv, RvLine } from "../lib";

const HUE = {
  phos: { text: "text-phos", border: "border-phos/50", chip: "bg-phos/10 text-phos border-phos/40", hex: "#3fd68b" },
  copper: { text: "text-copper2", border: "border-copper/60", chip: "bg-copper/10 text-copper2 border-copper/50", hex: "#e5a45c" },
  ember: { text: "text-ember", border: "border-ember/60", chip: "bg-ember/10 text-ember border-ember/50", hex: "#e2795b" },
  gold: { text: "text-gold", border: "border-gold/50", chip: "bg-gold/10 text-gold border-gold/40", hex: "#e9c57f" },
} as const;

function Diagram({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const h = 92;
  const y = (i: number) => 64 + i * h;
  return (
    <svg viewBox="0 0 340 760" className="w-full max-w-sm" role="img" aria-label="Service pipeline diagram">
      <defs>
        <filter id="glowN" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* input */}
      <text x="170" y="30" textAnchor="middle" className="fill-[#8fa396]" fontSize="11" fontFamily="IBM Plex Mono" letterSpacing="3">CLIENT BRIEF ▸ TOKENS</text>
      <line x1="170" y1="40" x2="170" y2={y(0) - 4} stroke="#c9803f" strokeWidth="1.4" className="dash-flow" />

      {SERVICES.map((s, i) => {
        const active = selected === s.id;
        const hue = HUE[s.hue];
        return (
          <g key={s.id} onClick={() => onSelect(s.id)} className="cursor-pointer">
            {i > 0 && <line x1="170" y1={y(i - 1) + 44} x2="170" y2={y(i) - 4} stroke="#c9803f" strokeWidth="1.4" className="dash-flow" />}
            <rect
              x="40" y={y(i)} width="260" height="44"
              fill={active ? "rgba(201,128,63,0.16)" : "rgba(16,32,26,0.85)"}
              stroke={active ? hue.hex : "#22443488"}
              strokeWidth={active ? 2 : 1.2}
              filter={active ? "url(#glowN)" : undefined}
              className="transition-all duration-300"
            />
            <rect x="40" y={y(i)} width="4" height="44" fill={hue.hex} opacity={active ? 1 : 0.45} />
            <text x="56" y={y(i) + 27} fontSize="12" fontFamily="IBM Plex Mono" fontWeight="600" fill={hue.hex}>{s.block}</text>
            <text x="126" y={y(i) + 27} fontSize="12" fontFamily="IBM Plex Mono" fill={active ? "#efe7d6" : "#8fa396"}>{s.name}</text>
            <text x="288" y={y(i) + 27} fontSize="11" fontFamily="IBM Plex Mono" fill="#c9803f" textAnchor="end">{String(i + 1).padStart(2, "0")}</text>
          </g>
        );
      })}

      <line x1="170" y1={y(6) + 44} x2="170" y2={y(6) + 84} stroke="#c9803f" strokeWidth="1.4" className="dash-flow" />
      <text x="170" y={y(6) + 104} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" letterSpacing="3" fill="#e9c57f">SOFTMAX · LAUNCH</text>
      <text x="170" y={y(6) + 124} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" letterSpacing="3" className="fill-[#8fa396]">▸ RENDERED GROWTH</text>
    </svg>
  );
}

export default function ServiceBlocks() {
  const [selected, setSelected] = useState("strategy");
  const sel = SERVICES.find((s) => s.id === selected)!;

  return (
    <section id="services" className="relative border-t border-seam bg-pit/40">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
        <div className="mb-12 md:mb-16">
          <Rv className="flex items-center gap-4 mb-5">
            <span className="font-mono text-copper text-sm tracking-[0.25em]">/03</span>
            <span className="h-px flex-1 bg-seam" />
            <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">every block — a separate unit</span>
          </Rv>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.02] tracking-tight max-w-3xl">
              <RvLine>Select a block.</RvLine>
              <RvLine delay={120}><span className="text-copper2">It joins the pass.</span></RvLine>
            </h2>
            <Rv delay={200} className="max-w-xs font-mono text-xs leading-relaxed text-dim">
              Each service is an independent block of the pipeline — plug in one or chain them all.
            </Rv>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-16">
          <Rv className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-4 font-mono text-[10px] tracking-[0.3em] uppercase text-dim">
              pipeline · <span className="text-copper2">{sel.block}</span> active
            </p>
            <Diagram selected={selected} onSelect={setSelected} />
          </Rv>

          <div>
            {SERVICES.map((s, i) => {
              const open = selected === s.id;
              const hue = HUE[s.hue];
              return (
                <Rv key={s.id} delay={i * 40}>
                  <div className={`border-b border-seam transition-colors duration-500 ${open ? "bg-ink/70" : "hover:bg-ink/40"}`}>
                    <button
                      onClick={() => setSelected(open ? s.id : s.id)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-4 px-2 py-5 text-left md:gap-6 md:px-4"
                    >
                      <span className="font-mono text-xs text-dim w-8">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`hidden sm:inline border px-2 py-1 font-mono text-[10px] tracking-[0.2em] ${open ? hue.chip : "border-seam text-dim"}`}>
                        {s.block}
                      </span>
                      <span className={`flex-1 font-display text-base md:text-2xl font-semibold tracking-tight transition-colors duration-300 ${open ? "text-paper" : "text-dim group-hover:text-paper"}`}>
                        {s.name}
                      </span>
                      <span className="hidden md:block font-mono text-[10px] tracking-[0.2em] uppercase text-dim">{s.tagline}</span>
                      <span className={`relative h-4 w-4 shrink-0 ${open ? hue.text : "text-dim"}`}>
                        <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                        <span className={`absolute left-1/2 top-0 h-full w-px bg-current transition-transform duration-300 ${open ? "rotate-90 scale-y-0" : ""}`} />
                      </span>
                    </button>
                    <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                      <div className="overflow-hidden">
                        <div className="px-2 pb-7 md:px-4 md:pl-[4.5rem]">
                          <p className="max-w-xl leading-relaxed text-dim">{s.description}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {s.deliverables.map((d) => (
                              <span key={d} className={`border px-2.5 py-1 text-xs text-paper/85 ${hue.chip}`}>{d}</span>
                            ))}
                          </div>
                          <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
                            <div className="border-l-2 border-copper/70 pl-3">
                              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-dim">timeline</p>
                              <p className="mt-1 font-mono text-sm text-paper">{s.timeline}</p>
                            </div>
                            <div className="border-l-2 border-phos/70 pl-3">
                              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-dim">{s.kpiLabel}</p>
                              <p className={`mt-1 font-mono text-sm ${hue.text}`}>{s.kpi}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Rv>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
