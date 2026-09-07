import { useEffect, useState } from "react";

export type StarMapProject = {
  id: string;
  title: string;
  tag: string;
  // constellation shape as normalized [0..1] coords inside the panel
  stars: [number, number][];
  // edges as pairs of star indexes
  edges: [number, number][];
};

type Props = {
  projects: StarMapProject[];
  onSelect: (id: string) => void;
};

/**
 * Interactive star map: each constellation maps to a game project.
 * Click a constellation to jump to and highlight its project.
 */
export function StarMap({ projects, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handlePick = (id: string) => {
    setActive(id);
    onSelect(id);
    setTimeout(() => setOpen(false), 250);
  };

  // Layout: split the SVG width across constellations
  const W = 320;
  const H = 220;
  const cellW = W / projects.length;
  const padX = 28;
  const padY = 24;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close star map" : "Open star map"}
        title="Star map"
        className="fixed bottom-6 right-20 z-40 flex h-11 items-center gap-2 rounded-full border border-moon/40 bg-background/70 px-4 text-xs uppercase tracking-[0.25em] text-moon backdrop-blur transition hover:border-moon hover:text-foreground"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="6" r="1.4" />
          <circle cx="12" cy="4" r="1.6" />
          <circle cx="19" cy="8" r="1.4" />
          <circle cx="16" cy="16" r="1.6" />
          <circle cx="7" cy="17" r="1.4" />
          <path d="M5 6 12 4l7 4-3 8-9 1Z" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.5" />
        </svg>
        Star map
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] animate-fade-in rounded-2xl border border-moon/30 bg-background/90 p-5 shadow-[0_0_60px_-20px_var(--color-moon-glow)] backdrop-blur-md"
          role="dialog"
          aria-label="Star map"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Constellations
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label="Interactive constellation map"
          >
            <defs>
              <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-moon)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--color-moon)" stopOpacity="0" />
              </radialGradient>
            </defs>
            {projects.map((p, ci) => {
              const originX = ci * cellW + padX / 2;
              const usableW = cellW - padX;
              const usableH = H - padY * 2;
              const pts = p.stars.map(([x, y]) => [
                originX + x * usableW,
                padY + y * usableH,
              ] as [number, number]);
              const isActive = active === p.id;
              const color = isActive ? "var(--color-moon-glow)" : "var(--color-moon)";
              return (
                <g
                  key={p.id}
                  className="cursor-pointer transition-opacity"
                  opacity={active && !isActive ? 0.35 : 1}
                  onClick={() => handlePick(p.id)}
                  onMouseEnter={() => setActive(p.id)}
                  onMouseLeave={() => setActive((a) => (a === p.id ? null : a))}
                >
                  {/* clickable background */}
                  <rect
                    x={ci * cellW}
                    y={0}
                    width={cellW}
                    height={H}
                    fill="transparent"
                  />
                  {p.edges.map(([a, b], i) => (
                    <line
                      key={i}
                      x1={pts[a][0]}
                      y1={pts[a][1]}
                      x2={pts[b][0]}
                      y2={pts[b][1]}
                      stroke={color}
                      strokeWidth={isActive ? 1 : 0.6}
                      opacity={isActive ? 0.9 : 0.5}
                    />
                  ))}
                  {pts.map(([x, y], i) => (
                    <g key={i}>
                      {isActive && (
                        <circle cx={x} cy={y} r={7} fill="url(#starGlow)" opacity={0.7} />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isActive ? 2.4 : 1.6}
                        fill={color}
                      />
                    </g>
                  ))}
                  <text
                    x={originX + usableW / 2}
                    y={H - 6}
                    textAnchor="middle"
                    fontSize="9"
                    letterSpacing="2"
                    fill={isActive ? "var(--color-foreground)" : "var(--color-muted-foreground)"}
                    style={{ textTransform: "uppercase" }}
                  >
                    {p.title}
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {active
              ? projects.find((p) => p.id === active)?.tag
              : "Trace a constellation to visit its game."}
          </p>
        </div>
      )}
    </>
  );
}

export default StarMap;