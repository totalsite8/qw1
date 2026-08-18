import { Rv, RvLine } from "../lib";

const ROWS = [
  {
    n: "01",
    layer: "L0 · ВИТРИНА",
    title: "Всё, что видит рынок",
    text: "Снаружи воронка выглядит просто: сильный бренд, узнаваемый креатив и каналы, которые работают синхронно. Внутри — медиаплан, сплит бюджетов и айдентика, которая не рассыпается от баннера к лендингу. Охват — это не шум, а точно направленная волна.",
    map: [
      ["Каналы", "SEO, PPC, SMM, email, контент"],
      ["Охват", "медиаплан и сплит бюджетов"],
      ["Бренд", "айдентика, которую узнают"],
    ],
    icon: (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden="true">
        <path d="M12 10h40L38 28v14l-12 8V28L12 10Z" stroke="#e5a45c" strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="20" cy="5" r="1.8" fill="#3fd68b" />
        <circle cx="32" cy="4" r="1.8" fill="#e9c57f" />
        <circle cx="44" cy="5" r="1.8" fill="#3fd68b" />
        <path d="M14 22c-4 3-4 8 0 11M50 22c4 3 4 8 0 11" stroke="#3fd68b" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="32" cy="57" r="2.4" fill="#e9c57f" />
      </svg>
    ),
  },
  {
    n: "02",
    layer: "L1 · КОНВЕЙЕР",
    title: "Путь клиента, этап за этапом",
    text: "Внутри — конвейер: от первого касания до повторной покупки. Трафик заходит сверху, вовлечение греет, конверсия отбирает, удержание возвращает, лояльность приводит друзей. У каждого этапа — свой модуль студии, свой KPI и своя ответственность.",
    map: [
      ["Трафик → вовлечение", "креатив и посадочные"],
      ["Конверсия", "CRO, скорость, формы"],
      ["Удержание", "CRM, email, комьюнити"],
    ],
    icon: (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden="true">
        <rect x="14" y="8" width="36" height="9" stroke="#3fd68b" strokeWidth="2.2" />
        <rect x="19" y="24" width="26" height="9" stroke="#e9c57f" strokeWidth="2.2" />
        <rect x="24" y="40" width="16" height="9" stroke="#e5a45c" strokeWidth="2.2" />
        <path d="M32 17v7M32 33v7M32 49v6" stroke="#c9803f" strokeWidth="2" strokeDasharray="2 4" />
        <circle cx="32" cy="59" r="2.2" fill="#3fd68b" />
      </svg>
    ),
  },
  {
    n: "03",
    layer: "L2 · АТОМЫ КОНВЕРСИИ",
    title: "Метрики, из которых всё собрано",
    text: "Приблизьте ещё сильнее — и останутся только атомы: CTR каждого креатива, каждая ставка, каждый заголовок, каждый сегмент. Здесь нет магии — есть еженедельные A/B, честная сквозная аналитика и руки, которые умеют читать цифры. На этом уровне и выигрываются проекты.",
    map: [
      ["Клик → лид", "каждая посадочная отвечает"],
      ["ROMI", "каждый рубль под отчётом"],
      ["Итерации", "A/B-тесты каждую неделю"],
    ],
    icon: (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden="true">
        {[0, 1, 2, 3].map((i) =>
          [0, 1, 2, 3].map((j) => (
            <rect key={`${i}-${j}`} x={8 + i * 12} y={8 + j * 12} width="8" height="8"
              fill={(i + j) % 3 === 0 ? "#3fd68b" : (i + j) % 3 === 1 ? "#c9803f" : "#17382b"}
              opacity={0.35 + ((i * j) % 4) * 0.18} />
          ))
        )}
        <circle cx="44" cy="44" r="11" stroke="#e9c57f" strokeWidth="2" />
        <path d="M52 52l8 8" stroke="#e9c57f" strokeWidth="2.4" strokeLinecap="round" />
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
              <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">как мы устроены</span>
            </Rv>
            <h2 className="font-display text-3xl md:text-5xl font-semibold leading-[1.05] tracking-tight">
              <RvLine>Одна воронка.</RvLine>
              <RvLine delay={120}><span className="text-copper2">Три глубины.</span></RvLine>
              <RvLine delay={240}>Один результат.</RvLine>
            </h2>
            <Rv delay={200} className="mt-6 max-w-md text-dim leading-relaxed">
              Мы строим маркетинг как воронку роста — послойно, параллельно и честно о том, куда идёт
              каждый рубль. Три уровня приближения — одна и та же машина.
            </Rv>
            <Rv delay={300} className="mt-8 border border-seam bg-pit/60 p-5">
              <p className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase mb-3">легенда глубин</p>
              <div className="space-y-2 font-mono text-xs">
                <p><span className="text-phos">100–125%</span> <span className="text-dim">— витрина · каналы и бренд</span></p>
                <p><span className="text-copper2">&gt; 125%</span> <span className="text-dim">— конвейер · путь клиента</span></p>
                <p><span className="text-ember">&gt; 260%</span> <span className="text-dim">— поле конверсии · метрики</span></p>
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
