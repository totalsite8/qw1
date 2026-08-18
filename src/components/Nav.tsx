import { useEffect, useState } from "react";

const LINKS = [
  ["#dive", "Silicon"],
  ["#architecture", "Architecture"],
  ["#services", "Service blocks"],
  ["#process", "Forward pass"],
  ["#work", "Work"],
  ["#specs", "Specs"],
];

export function ChipMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="18" height="18" stroke="#e5a45c" strokeWidth="2" />
      <rect x="12.5" y="12.5" width="7" height="7" fill="#3fd68b" />
      <g stroke="#c9803f" strokeWidth="1.6">
        <path d="M11 7V2M16 7V2M21 7V2M11 30v-5M16 30v-5M21 30v-5M7 11H2M7 16H2M7 21H2M30 11h-5M30 16h-5M30 21h-5" />
      </g>
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
          <span className="transition-transform duration-500 group-hover:rotate-90">
            <ChipMark />
          </span>
          <span className="font-display text-sm font-bold tracking-[0.18em] text-paper">
            TENSOR<span className="text-copper2">FORGE</span>
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
          Start project
        </a>
      </div>
    </header>
  );
}
