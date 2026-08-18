import { useEffect, useRef, useState } from "react";
import { SERVICES } from "../data";
import { ChipMark } from "./Nav";
import { Rv, RvLine, reducedMotion } from "../lib";

const BUDGETS = ["< $5k", "$5–15k", "$15–50k", "$50k+"];
const TERM_LINES = [
  "> brief.tokenized … ok",
  "> allocating service blocks … ok",
  "> forward pass scheduled",
  "> reply ETA: 1 business day",
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [blocks, setBlocks] = useState<string[]>(["strategy"]);
  const [sent, setSent] = useState(false);
  const [lines, setLines] = useState(0);
  const timerRef = useRef<number[]>([]);

  useEffect(() => () => timerRef.current.forEach(clearTimeout), []);

  const toggle = (id: string) =>
    setBlocks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || blocks.length === 0) return;
    setSent(true);
    setLines(0);
    TERM_LINES.forEach((_, i) => {
      timerRef.current.push(
        window.setTimeout(() => setLines(i + 1), reducedMotion() ? 0 : 380 * (i + 1))
      );
    });
  };

  return (
    <section id="contact" className="relative border-t border-seam overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(900px 480px at 18% 0%, rgba(201,128,63,0.12), transparent 60%), radial-gradient(700px 420px at 90% 100%, rgba(63,214,139,0.08), transparent 60%)" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <Rv className="flex items-center gap-4 mb-5">
              <span className="font-mono text-copper text-sm tracking-[0.25em]">/07</span>
              <span className="h-px flex-1 bg-seam" />
              <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">initiate</span>
            </Rv>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
              <RvLine>Initiate a</RvLine>
              <RvLine delay={120}><span className="text-copper2">forward pass.</span></RvLine>
            </h2>
            <Rv delay={200} className="mt-6 max-w-md leading-relaxed text-dim">
              Pick the blocks your project needs, drop the brief into the pipeline — an engineer-strategist
              (a human one) replies within one business day with a first estimate and a call slot.
            </Rv>
            <Rv delay={280} className="mt-10 space-y-2 font-mono text-sm">
              <p><span className="text-copper2">mail</span> <a className="trace-link text-paper" href="mailto:hello@tensorforge.studio">hello@tensorforge.studio</a></p>
              <p><span className="text-copper2">tel&nbsp;</span> <a className="trace-link text-paper" href="tel:+15550128064">+1 555 012 80 64</a></p>
              <p><span className="text-copper2">hq&nbsp;&nbsp;</span> <span className="text-dim">51.5074° N · 0.1278° W — and 6 timezones remote</span></p>
            </Rv>
          </div>

          <Rv delay={150}>
            {sent ? (
              <div className="border border-phos/50 bg-pit p-6 md:p-8">
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-phos">transmission accepted</p>
                <div className="mt-5 space-y-2 font-mono text-sm text-paper/90">
                  {TERM_LINES.slice(0, lines).map((l) => (
                    <p key={l} className="rv in">{l}</p>
                  ))}
                  <p className="text-phos">
                    blocks: [{blocks.map((b) => SERVICES.find((s) => s.id === b)?.block).join(", ")}]
                    <span className="term-caret">▌</span>
                  </p>
                </div>
                <button
                  onClick={() => { setSent(false); setName(""); setEmail(""); setBlocks(["strategy"]); }}
                  className="mt-8 border border-seam px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase text-dim transition-colors hover:border-copper hover:text-copper2"
                >
                  ← send another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="border border-seam bg-pit/80 p-6 md:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-dim">name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Ada L."
                      className="mt-2 w-full border border-seam bg-ink px-3 py-2.5 font-mono text-sm text-paper placeholder:text-dim/50 outline-none transition-colors focus:border-copper"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-dim">email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="ada@company.com"
                      className="mt-2 w-full border border-seam bg-ink px-3 py-2.5 font-mono text-sm text-paper placeholder:text-dim/50 outline-none transition-colors focus:border-copper"
                    />
                  </label>
                </div>

                <div className="mt-6">
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-dim">budget / month</span>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {BUDGETS.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBudget(b)}
                        className={`border px-2 py-2 font-mono text-xs transition-all duration-300 ${
                          budget === b ? "border-copper bg-copper/15 text-copper2" : "border-seam text-dim hover:border-copper/50 hover:text-paper"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-dim">
                    service blocks <span className="text-copper2">({blocks.length} selected)</span>
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SERVICES.map((s) => {
                      const on = blocks.includes(s.id);
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => toggle(s.id)}
                          aria-pressed={on}
                          className={`group flex items-center gap-2 border px-3 py-2 font-mono text-xs transition-all duration-300 ${
                            on ? "border-phos bg-phos/10 text-phos" : "border-seam text-dim hover:border-phos/50 hover:text-paper"
                          }`}
                        >
                          <span className={`inline-block h-2 w-2 rotate-45 transition-colors ${on ? "bg-phos" : "bg-moss group-hover:bg-copper"}`} />
                          {s.block} · {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-8 w-full border border-copper bg-copper px-5 py-4 font-display text-sm font-bold tracking-[0.2em] uppercase text-ink transition-all duration-300 hover:bg-copper2 hover:shadow-[0_0_36px_rgba(201,128,63,0.45)] active:scale-[0.99]"
                >
                  Run the pass →
                </button>
                <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
                  budget: {budget} · no nda required to start talking
                </p>
              </form>
            )}
          </Rv>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-seam bg-pit">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#dive" className="flex items-center gap-3">
              <ChipMark size={26} />
              <span className="font-display text-sm font-bold tracking-[0.18em] text-paper">
                TENSOR<span className="text-copper2">FORGE</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">
              Full-cycle digital studio. Raw data in — rendered growth out.
              Built like a transformer: every block earns its place in the pass.
            </p>
          </div>
          {[
            ["Pipeline", [["#architecture", "Architecture"], ["#services", "Service blocks"], ["#process", "Forward pass"]]],
            ["Output", [["#work", "Case studies"], ["#specs", "Specs"], ["#contact", "Contact"]]],
            ["Elsewhere", [["https://github.com", "GitHub"], ["https://dribbble.com", "Dribbble"], ["https://www.linkedin.com", "LinkedIn"]]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-copper2">{title as string}</p>
              <ul className="mt-4 space-y-2">
                {(links as [string, string][]).map(([href, label]) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="trace-link font-mono text-xs uppercase tracking-[0.15em] text-dim transition-colors hover:text-paper">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-seam pt-6 font-mono text-[10px] tracking-[0.25em] uppercase text-dim sm:flex-row sm:items-center">
          <p>© 2026 Tensorforge studio · rendered at 60 fps</p>
          <p><span className="text-phos">▲</span> all systems nominal · uptime 99.98%</p>
        </div>
      </div>
    </footer>
  );
}
