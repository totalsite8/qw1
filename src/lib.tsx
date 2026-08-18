import { createElement, useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useInView<T extends HTMLElement>(threshold = 0.18, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            if (once) io.unobserve(e.target);
          } else if (!once) setInView(false);
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return [ref, inView] as const;
}

/** Scroll-reveal block */
export function Rv({
  children,
  delay = 0,
  as = "div",
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  as?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return createElement(
    as,
    {
      ref,
      className: `rv ${inView ? "in" : ""} ${className}`,
      style: { ...style, ["--rv-delay" as string]: `${delay}ms` },
    },
    children
  );
}

/** Line-mask reveal */
export function RvLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`rv-line ${inView ? "in" : ""} ${className}`} style={{ ["--rv-delay" as string]: `${delay}ms` }}>
      <span>{children}</span>
    </div>
  );
}

const GLYPHS = "▓▒░#<>/\\+*=01∑Δπ";

/** Scramble-decode text */
export function useScramble(text: string, start: boolean, speed = 26) {
  const [out, setOut] = useState(reducedMotion() ? text : "");
  useEffect(() => {
    if (!start) return;
    if (reducedMotion()) { setOut(text); return; }
    let frame = 0;
    let raf = 0;
    let last = performance.now();
    const total = text.length;
    const tick = (now: number) => {
      if (now - last >= speed) {
        last = now;
        frame++;
        const fixed = Math.floor(frame / 2.2);
        let s = "";
        for (let i = 0; i < total; i++) {
          const ch = text[i];
          if (ch === " " || ch === "\n") { s += ch; continue; }
          s += i < fixed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOut(s);
        if (fixed >= total) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, start, speed]);
  return out;
}

/** Count-up number when visible */
export function useCountUp(target: number, run: boolean, duration = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reducedMotion()) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - p, 4);
      setV(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return v;
}

/** Section heading with mono index + display title */
export function SectionHead({
  index,
  kicker,
  title,
  right,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-12 md:mb-16">
      <Rv className="flex items-center gap-4 mb-5">
        <span className="font-mono text-copper text-sm tracking-[0.25em]">{index}</span>
        <span className="h-px flex-1 bg-seam" />
        <span className="font-mono text-dim text-xs tracking-[0.3em] uppercase">{kicker}</span>
      </Rv>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.02] tracking-tight max-w-3xl">
          <RvLine>{title}</RvLine>
        </h2>
        {right}
      </div>
    </div>
  );
}
