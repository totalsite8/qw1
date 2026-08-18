import { Rv, RvLine } from "../lib";

const ROWS = [
  {
    n: "01",
    layer: "L0 · КРЕМНИЙ",
    title: "Железо студии",
    text: "GPU хорош ровно настолько, насколько хорош его кремний. Наш — это 24 штатных специалиста, девятилетняя процессная дисциплина и стек, который не уходит в троттлинг под дедлайнами. Без субподряда, без пропущенных кадров.",
    map: [
      ["CUDA-ядра", "дизайнеры, разработчики, стратеги"],
      ["VRAM", "накопленная экспертиза и библиотеки переиспользования"],
      ["Фазы питания", "продакшн-мощность, 24/7 на критичном"],
    ],
    icon: (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden="true">
        <rect x="16" y="16" width="32" height="32" stroke="#e5a45c" strokeWidth="2.4" />
        <rect x="25" y="25" width="14" height="14" fill="#3fd68b" opacity="0.85" />
        <path d="M22 16V6M32 16V6M42 16V6M22 58V48M32 58V48M42 58V48M16 22H6M16 32H6M16 42H6M58 22H48M58 32H48M58 42H48" stroke="#c9803f" strokeWidth="2" />
        <circle cx="6" cy="22" r="1.8" fill="#e9c57f" /><circle cx="58" cy="42" r="1.8" fill="#e9c57f" />
      </svg>
    ),
  },
  {
    n: "02",
    layer: "L1 · ЯДРО ТРАНСФОРМЕРА",
    title: "Пайплайн услуг",
    text: "Внутри кристалла — трансформер: эмбеддинг, внимание, прямое распространение, выходная голова. Внутри студии — тот же ритм: стратегия эмбеддит бриф, дизайн внимает пользователям, разработка вычисляет, контент проецирует результат в язык.",
    map: [
      ["EMBED + POS", "стратегия и аналитика, SEO-позиционирование"],
      ["ATTN × 8 голов", "дизайн, следящий за всеми плоскостями сразу"],
      ["FFN + LM-HEAD", "разработка, маркетинг, выход контента"],
    ],
    icon: (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="12" height="48" stroke="#3fd68b" strokeWidth="2.2" />
        <rect x="26" y="12" width="12" height="40" stroke="#e5a45c" strokeWidth="2.2" />
        <rect x="44" y="16" width="12" height="32" stroke="#e2795b" strokeWidth="2.2" />
        <path d="M20 20h6M20 32h6M20 44h6M38 24h6M38 40h6" stroke="#e9c57f" strokeWidth="2" strokeDasharray="2 4" />
        <circle cx="23" cy="20" r="1.6" fill="#3fd68b" /><circle cx="41" cy="40" r="1.6" fill="#e5a45c" />
      </svg>
    ),
  },
  {
    n: "03",
    layer: "L2 · ТЕНЗОРНОЕ ПОЛЕ",
    title: "Ремесло в каждом тензоре",
    text: "Приблизьтесь достаточно — и отделов больше нет, остались только тензоры. Кернинг-пара. Bid-стратегия. Правка индексации. Каждый выставлен вручную, каждый градиент заслужен. Именно на этом масштабе выигрываются проекты.",
    map: [
      ["Q · K · V", "вопросы, знания, ценность — под каждую задачу"],
      ["Веса внимания", "куда уходят фокус и бюджет"],
      ["Бэкпроп", "ретро, CRO-итерации, сложный процент"],
    ],
    icon: (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden="true">
        {[0, 1, 2, 3].map((i) =>
          [0, 1, 2, 3].map((j) => (
            <rect key={`${i}-${j}`} x={10 + i * 12} y={10 + j * 12} width="8" height="8"
              fill={(i + j) % 3 === 0 ? "#3fd68b" : (i + j) % 3 === 1 ? "#c9803f" : "#17382b"}
              opacity={0.35 + ((i * j) % 4) * 0.18} />
          ))
        )}
        <path d="M6 58L58 6" stroke="#e9c57f" strokeWidth="1.6" strokeDasharray="3 5" />
      </svg>
    ),
  },
];

export default function Architecture() {
  return (
    <section id="architecture" className="circuit-bg relative border-t border-seam">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          {/* sticky-колонка */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Rv className="flex items-center gap-4 mb-5">
              <span className="font-mono text-copper text-sm tracking-[0.25em]">/02</span>
              <span className="h-px flex-1 bg-seam" />
              <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">маппинг</span>
            </Rv>
            <h2 className="font-display text-3xl md:text-5xl font-semibold leading-[1.05] tracking-tight">
              <RvLine>Один кристалл.</RvLine>
              <RvLine delay={120}><span className="text-copper2">Три глубины.</span></RvLine>
              <RvLine delay={240}>Одна студия.</RvLine>
            </h2>
            <Rv delay={200} className="mt-6 max-w-md text-dim leading-relaxed">
              Мы ведём студию так, как GPU ведёт трансформер — послойно, параллельно и честно о том,
              куда уходит каждый ватт. Листайте стек: одна и та же машина на трёх масштабах.
            </Rv>
            <Rv delay={300} className="mt-8 border border-seam bg-pit/60 p-5">
              <p className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase mb-3">легенда глубин</p>
              <div className="space-y-2 font-mono text-xs">
                <p><span className="text-phos">100–125%</span> <span className="text-dim">— кремниевая оболочка · сама студия</span></p>
                <p><span className="text-copper2">&gt; 125%</span> <span className="text-dim">— ядро трансформера · пайплайн услуг</span></p>
                <p><span className="text-ember">&gt; 260%</span> <span className="text-dim">— тензорное поле · ремесленные детали</span></p>
              </div>
            </Rv>
          </div>

          {/* скроллящиеся строки */}
          <div className="space-y-10">
            {ROWS.map((row, i) => (
              <Rv key={row.n} delay={i * 80} className="group relative border border-seam bg-pit/70 p-6 md:p-9 transition-colors duration-500 hover:border-copper/50">
                <span className="pointer-events-none absolute -top-px left-0 h-px w-0 bg-copper transition-all duration-700 group-hover:w-full" />
                <div className="flex items-start gap-6">
                  <div className="hidden h-16 w-16 shrink-0 sm:block md:h-20 md:w-20">{row.icon}</div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.3em] text-phos uppercase">{row.layer}</p>
                    <h3 className="mt-2 font-display text-xl md:text-3xl font-semibold text-paper">
                      <span className="text-copper mr-3">{row.n}</span>{row.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-5 leading-relaxed text-dim max-w-xl">{row.text}</p>
                <dl className="mt-6 grid gap-2 sm:grid-cols-3">
                  {row.map.map(([k, v]) => (
                    <div key={k} className="border border-seam bg-ink/60 p-3 transition-colors duration-300 group-hover:border-moss">
                      <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-copper2">{k}</dt>
                      <dd className="mt-1 text-xs leading-snug text-dim">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Rv>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
