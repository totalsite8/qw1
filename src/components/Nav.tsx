import { useEffect, useState } from "react";

const LINKS = [
  ["#dive", "Воронка"],
  ["#architecture", "Механика"],
  ["#services", "Модули"],
  ["#process", "Цикл"],
  ["#work", "Кейсы"],
  ["#specs", "Цифры"],
];

export function ChipMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5 5h22l-7.5 9.5V21L12.5 26V14.5L5 5Z" stroke="#e5a45c" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="10" cy="2.6" r="1.3" fill="#3fd68b" />
      <circle cx="16" cy="2.6" r="1.3" fill="#e9c57f" />
      <circle cx="22" cy="2.6" r="1.3" fill="#3fd68b" />
      <circle cx="16" cy="29.6" r="1.8" fill="#e9c57f" />
    </svg>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-seam bg-ink/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-8">
        <a href="#dive" className="flex items-center gap-3 group">
          <span className="transition-transform duration-500 group-hover:translate-y-0.5">
            <ChipMark />
          </span>
          <span className="font-display text-sm font-bold tracking-[0.18em] text-paper">
            GROWTH<span className="text-copper2">FORGE</span>
          </span>
        </a>
        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="trace-link font-mono text-[11px] tracking-[0.22em] uppercase text-dim transition-colors hover:text-paper">
              {label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="ml-auto border border-copper bg-copper/10 px-4 py-2 font-mono text-[11px] tracking-[0.22em] uppercase text-copper2 transition-all duration-300 hover:bg-copper hover:text-ink lg:ml-6"
        >
          Начать проект
        </a>
      </div>
    </header>
  );
}
