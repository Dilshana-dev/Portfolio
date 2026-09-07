import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import type { Hotspot, Station } from "@/components/BioWorld";

const BioWorld = lazy(() => import("@/components/BioWorld"));

const CONTENT: Record<
  Station,
  { title: string; kicker: string; entries: { heading: string; body: string }[] }
> = {
  documents: {
    kicker: "Document desk",
    title: "Travel journal",
    entries: [
      {
        heading: "Origin — age 23",
        body: "Started modding levels in a borrowed editor and fell in love with the way light tells a story before any dialogue does.",
      },
      {
        heading: "Craft —",
        body: "Atmospheric games end to end: systems design, shaders, and sound that breathes with the player.",
      },
      {
        heading: "Now — solo ",
        body: "Building worlds alone: engine work by day.",
      },
      {
        heading: "Beyond",
        body: "Mentoring first-time devs and writing about quiet game design from a carriage that never stops.",
      },
    ],
  },
  terminal: {
    kicker: "Workstation",
    title: "Dev terminal",
    entries: [
      {
        heading: "Engines",
        body: "Unreal Engine, Godot  for the lighting experiments that ship in every project.",
      },
      /*{
        heading: "Shipped",
        body: "Selenite, Nocturne, and Astra Drift — three atmospheric titles with a shared obsession for moonlight.",
      },
      */
      {
        heading: "Toolbox",
        body: " procedural audio, gameplay systems, level scripting, and a lot of profiling.",
      },
      /*{
        heading: "Open to",
        body: "Collaborations on slow, strange, beautiful games. The terminal is always logged in.",
      },
      */
    ],
  },
};

export const Route = createFileRoute("/bio")({
  head: () => ({
    meta: [
      { title: "Bio — Dilshana-Dev's  Train Carriage" },
      {
        name: "description",
        content:
          "Step inside a train carriage drifting past the moon. Walk in first person and interact with the document desk and dev terminal to read Dilshana-Dev's story.",
      },
      { property: "og:title", content: "Bio — Dilshana-Dev's Space Train Carriage" },
      {
        property: "og:description",
        content:
          "A first-person bio set inside a train carriage moving through space .",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BioPage,
});

function BioPage() {
  const [near, setNear] = useState<Hotspot | null>(null);
  const [locked, setLocked] = useState(false);
  const [open, setOpen] = useState<Station | null>(null);
  const nearRef = useRef<Hotspot | null>(null);
  const openRef = useRef<Station | null>(null);

  nearRef.current = near;
  openRef.current = open;

  const handleInteract = useCallback(() => {
    if (openRef.current) {
      setOpen(null);
      return;
    }
    if (nearRef.current) setOpen(nearRef.current.id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const panel = open ? CONTENT[open] : null;

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <ClientOnly
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Coupling the carriage…
            </div>
          }
        >
          <Suspense fallback={null}>
            <BioWorld
              onNear={setNear}
              onInteract={handleInteract}
              onLockChange={setLocked}
              activeId={open}
            />
          </Suspense>
        </ClientOnly>
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 font-display text-lg">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-moon shadow-[0_0_20px_var(--color-moon-glow)]" />
          Dilshana-Dev
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Carriage 07 · Bio
        </span>
      </header>

      <h1 className="sr-only">Bio of Dilshana-Dev, indie game developer/ Web developer </h1>

      {locked && !panel && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-moon/80"
        />
      )}

      {!locked && !panel && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/55 backdrop-blur-[2px]">
          <div className="max-w-md px-6 text-center">
            <p className="font-display text-3xl md:text-4xl">Board the night train</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Click the scene to look around. <span className="text-foreground">WASD</span> to walk
              the aisle, <span className="text-foreground">Shift</span> to hurry,{" "}
              <span className="text-foreground">E</span> to interact with a desk,{" "}
              <span className="text-foreground">Esc</span> to release the cursor.
            </p>
          </div>
        </div>
      )}

      {locked && near && !panel && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-6 pb-14">
          <div className="animate-fade-in rounded-full border border-moon/50 bg-background/80 px-5 py-2 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur">
            Press E · {near.prompt}
          </div>
        </div>
      )}

      {locked && !near && !panel && (
        <p className="pointer-events-none absolute inset-x-0 bottom-8 z-20 text-center text-xs uppercase tracking-[0.28em] text-muted-foreground">
          WASD to walk · Shift to hurry · E to interact
        </p>
      )}

      {panel && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 px-6 backdrop-blur-sm">
          <article className="animate-fade-in max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/60 bg-background/90 p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              {panel.kicker}
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">{panel.title}</h2>
            <div className="mt-6 space-y-5">
              {panel.entries.map((e) => (
                <div key={e.heading}>
                  <p className="text-sm uppercase tracking-[0.18em] text-moon">{e.heading}</p>
                  <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{e.body}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="mt-8 rounded-full border border-border/60 px-5 py-2 text-xs uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Close · Esc
            </button>
          </article>
        </div>
      )}
    </main>
  );
}
