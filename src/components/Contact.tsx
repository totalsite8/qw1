import { useEffect, useRef, useState } from "react";
import { SERVICES } from "../data";
import { ChipMark } from "./Nav";
import { Rv, RvLine, reducedMotion } from "../lib";

const BUDGETS = ["до $5k", "$5–15k", "$15–50k", "$50k+"];
const TERM_LINES = [
  "> бриф принят … ок",
  "> медиаплан собран … ок",
  "> кампании в очереди на запуск",
  "> ответ стратега: 1 рабочий день",
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
              <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">инициализация</span>
            </Rv>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
              <RvLine>Запустите</RvLine>
              <RvLine delay={120}><span className="text-copper2">воронку роста.</span></RvLine>
            </h2>
            <Rv delay={200} className="mt-6 max-w-md leading-relaxed text-dim">
              Выберите модули, которые нужны проекту, и бросьте бриф в воронку — стратег
              (живой человек) ответит в течение одного рабочего дня с первой оценкой и слотом для созвона.
            </Rv>
            <Rv delay={280} className="mt-10 space-y-2 font-mono text-sm">
              <p><span className="text-copper2">почта</span> <a className="trace-link text-paper" href="mailto:hello@growthforge.studio">hello@growthforge.studio</a></p>
              <p><span className="text-copper2">тел&nbsp;&nbsp;</span> <a className="trace-link text-paper" href="tel:+74951280064">+7 495 128 00 64</a></p>
              <p><span className="text-copper2">офис&nbsp;</span> <span className="text-dim">55.7558° N · 37.6173° E — и 6 часовых поясов на удалёнке</span></p>
            </Rv>
          </div>

          <Rv delay={150}>
            {sent ? (
              <div className="border border-phos/50 bg-pit p-6 md:p-8">
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-phos">передача принята</p>
                <div className="mt-5 space-y-2 font-mono text-sm text-paper/90">
                  {TERM_LINES.slice(0, lines).map((l) => (
                    <p key={l} className="rv in">{l}</p>
                  ))}
                  <p className="text-phos">
                    блоки: [{blocks.map((b) => SERVICES.find((s) => s.id === b)?.block).join(", ")}]
                    <span className="term-caret">▌</span>
                  </p>
                </div>
                <button
                  onClick={() => { setSent(false); setName(""); setEmail(""); setBlocks(["strategy"]); }}
                  className="mt-8 border border-seam px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase text-dim transition-colors hover:border-copper hover:text-copper2"
                >
                  ← отправить ещё
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="border border-seam bg-pit/80 p-6 md:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-dim">имя</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Ада Л."
                      className="mt-2 w-full border border-seam bg-ink px-3 py-2.5 font-mono text-sm text-paper placeholder:text-dim/50 outline-none transition-colors focus:border-copper"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-dim">почта</span>
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
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-dim">бюджет / месяц</span>
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
                    модули воронки <span className="text-copper2">(выбрано: {blocks.length})</span>
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
                  Запустить воронку →
                </button>
                <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-dim">
                  бюджет: {budget} · NDA для начала разговора не нужен
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
                GROWTH<span className="text-copper2">FORGE</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">
              Студия digital-маркетинга полного цикла. Сырой трафик на входе — измеримый рост на выходе.
              Собрана как воронка: каждый модуль заслуживает места в потоке.
            </p>
          </div>
          {[
            ["Воронка", [["#architecture", "Механика"], ["#services", "Модули"], ["#process", "Цикл"]]],
            ["Вывод", [["#work", "Кейсы"], ["#specs", "Спецификации"], ["#contact", "Контакты"]]],
            ["Другое", [["https://github.com", "GitHub"], ["https://dribbble.com", "Dribbble"], ["https://www.linkedin.com", "LinkedIn"]]],
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
          <p>© 2026 Growthforge studio · работает при 60 fps</p>
          <p><span className="text-phos">▲</span> все кампании в норме · аптайм 99.98%</p>
        </div>
      </div>
    </footer>
  );
}
