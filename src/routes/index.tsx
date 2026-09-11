import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import game1 from "@/assets/game-1.png";
import game2 from "@/assets/game-2.jpg";
import game3 from "@/assets/game-3.jpg";
import devPortrait from "@/assets/dev-portrait.png";
import { ClientOnly } from "@/components/ClientOnly";
import { Ambience } from "@/components/Ambience";
import { StarMap, type StarMapProject } from "@/components/StarMap";

const MoonScene = lazy(() => import("@/components/MoonScene"));

export const Route = createFileRoute("/")({
  component: Index,
});

const projects = [
  {
    id: "selenite",
    title: "Selenite",
    year: "2025",
    tag: "Atmospheric Exploration",
    role: "Solo dev · Unreal 5.6",
    image: game1,
    description:
      "A onging project that a 4km by 4km stylized island just to test and optimize foliages .",
  },

  {/*}
  {
    id: "nocturne",
    title: "Nocturne",
    year: "2024",
    tag: "2D Platformer",
    role: "Design · Code · Music",
    image: game2,
    description:
      "A hand-drawn platformer set during a single endless night. Ships with an original 42-minute lunar synth score.",
  },
  {
    id: "astra",
    title: "Astra",
    year: "2023",
    tag: "Puzzle",
    role: "Godot · 6-month jam",
    image: game3,
    description:
      "Trace forgotten constellations to unlock rooms in an abandoned observatory. Winner, Cosmic Jam '23.",
  },

  */}

];

const stats = [
  { value: "0", label: "Shipped titles" },
  { value: "0", label: "Players reached" },

];

const constellations: StarMapProject[] = [
  {
    id: "selenite",
    title: "Selenite",
    tag: "Selenite — atmospheric exploration, 2025",
    stars: [
      [0.2, 0.2],
      [0.5, 0.35],
      [0.75, 0.25],
      [0.6, 0.65],
      [0.35, 0.75],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
    ],
  },

  /*
  {
    id: "nocturne",
    title: "Nocturne",
    tag: "Nocturne — 2D platformer, 2024",
    stars: [
      [0.25, 0.3],
      [0.45, 0.15],
      [0.65, 0.4],
      [0.5, 0.7],
      [0.3, 0.6],
      [0.75, 0.75],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
    ],
  },
  {
    id: "astra",
    title: "Astra",
    tag: "Astra — puzzle, 2023",
    stars: [
      [0.3, 0.2],
      [0.55, 0.35],
      [0.8, 0.2],
      [0.55, 0.55],
      [0.35, 0.8],
      [0.75, 0.8],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [3, 5],
    ],
  },

*/

];

function Index() {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    if (!highlighted) return;
    const t = setTimeout(() => setHighlighted(null), 2400);
    return () => clearTimeout(t);
  }, [highlighted]);

  const handleConstellationSelect = (id: string) => {
    const el = document.getElementById(`project-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlighted(id);
    }
  };

  return (
    <div className="min-h-screen text-foreground overflow-hidden">
      {/* Persistent 3D moon + starfield — scroll drives lighting intensity */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <ClientOnly>
          <Suspense fallback={null}>
            <MoonScene />
          </Suspense>
        </ClientOnly>
      </div>

      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <a href="#top" className="flex items-center gap-2 font-display text-xl">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-moon shadow-[0_0_20px_var(--color-moon-glow)]" />
          Dilshana-Dev
        </a>
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#work" className="hover:text-foreground transition-colors">Work</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
          <Link to="/bio" className="hover:text-foreground transition-colors">Bio</Link>
          <a href="#craft" className="hover:text-foreground transition-colors">Craft</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
        <a
          href="#contact"
          className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:border-moon hover:text-foreground"
        >
          Say hello
        </a>
      </header>

      {/* Hero */}
      <section id="top" className="relative z-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-transparent to-background/90" aria-hidden />

        <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-20 pb-40 md:grid-cols-12 md:px-10 md:pt-32 md:pb-56">
          <div className="md:col-span-7">
            <p className="mb-8 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Indie game developer · Dilshana
            </p>
            <h1 className="text-balance font-display text-6xl leading-[0.95] md:text-[8rem] md:leading-[0.9]">
              Unreal Engine Games Development + Web Development <br />
              <br />
              <em className="italic text-moon"> {/*under the moon.*/}</em>
            </h1>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
              I build games and interactive experiences where code meets creativity.

A third-year Software Engineering student with a passion for game development, gameplay systems, and creating worlds.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <a
                href="#work"
                className="group inline-flex items-center gap-3 rounded-full bg-moon px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-accent"
              >
                See the work
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a href="#about" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                About me
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 border-y border-border/60 bg-background/60 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border/60 px-6 md:px-10">
          {stats.map((s) => (
            <div key={s.label} className="py-10 first:pl-0 pl-6 md:pl-10">
              <div className="font-display text-5xl md:text-6xl text-moon">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Work */}
      <section id="work" className="relative z-10 mx-auto max-w-7xl px-6 py-32 md:px-10 md:py-40">
        <div className="mb-20 flex items-end justify-between gap-8">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Selected work
            </p>
            <h2 className="font-display text-5xl md:text-7xl">
              Small worlds, <em className="italic text-moon">long nights.</em>
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            A handful of the games I’m currently working on, have completed, jammed, or quietly abandoned along the way.
          </p>
        </div>

        <div className="space-y-24">
          {projects.map((p, i) => (
            <article
              key={p.title}
              id={`project-${p.id}`}
              className={`scroll-mt-24 grid gap-10 rounded-3xl transition-all duration-700 md:grid-cols-12 md:gap-16 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              } ${
                highlighted === p.id
                  ? "ring-1 ring-moon/70 shadow-[0_0_80px_-10px_var(--color-moon-glow)] bg-moon/[0.03] p-4 md:p-6"
                  : ""
              }`}
            >
              <div className="md:col-span-7">
                <div className="group relative overflow-hidden rounded-2xl border border-border/60">
                  <img
                    src={p.image}
                    alt={`${p.title} screenshot`}
                    loading="lazy"
                    width={1200}
                    height={800}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </div>
              <div className="md:col-span-5 md:pt-8">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <span>{p.year}</span>
                  <span className="h-px w-8 bg-border" />
                  <span>{p.tag}</span>
                </div>
                <h3 className="mt-6 font-display text-5xl md:text-6xl">{p.title}</h3>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
                <p className="mt-8 text-sm text-silver">{p.role}</p>
                <a
                  href="#"
                  className="mt-8 inline-flex items-center gap-2 text-sm text-moon hover:gap-3 transition-all"
                >
                  Read the devlog <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 border-t border-border/60 bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-32 md:grid-cols-12 md:px-10 md:py-40">
          <div className="md:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-border/60">
              <img
                src={devPortrait}
                alt="Portrait of Dilshana-Dev"
                loading="lazy"
                width={900}
                height={1100}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
          </div>
          <div className="md:col-span-7 md:pt-4">
            <p className="mb-4 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              About
            </p>
            <h2 className="font-display text-5xl leading-tight md:text-6xl">
              I work best  <em className="italic text-moon">when I’m focused, curious, and building something I care about.</em>
            </h2>
            <div className="mt-10 space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                I’m a third-year Software Engineering student with a passion for game development.
                 I write code, build gameplay systems, create 3D assets, and turn ideas into playable experiences
                  — usually with a few unfinished projects along the way.

              </p>
              <p>
               My games focus on atmosphere, exploration, and the small details that make a world feel alive.

I care about how a player moves through a world, how environments tell a story, 
and how the smallest details can turn a simple mechanic into a memorable experience.

              </p>
            </div>

            <div id="craft" className="mt-14 grid grid-cols-2 gap-8 border-t border-border/60 pt-10 sm:grid-cols-3">
              {[
                { k: "Engines", v: "Unreal · Godot " },
                { k: "Languages", v: "C++ · Rust · React · Java · JavaScript· python " },
                { k: "Tools", v: "Blender · krita · Unreal Engine · Git · Visual Studio · Blueprints" },
                ///{ k: "Audio", v: "Modular synths, field recordings" },
                { k: "Writing", v: "Environmental, first/ third-person" },
                { k: "Currently", v: "Prototyping ‘Halide’" },
              ].map((c) => (
                <div key={c.k}>
                  <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {c.k}
                  </div>
                  <div className="mt-2 text-sm">{c.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative z-10 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-moon)_0%,transparent_60%)] opacity-20 animate-moon-float"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-6 py-40 text-center md:px-10">
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Get in touch
          </p>
          <h2 className="font-display text-6xl leading-[0.95] md:text-8xl">
            Have a game <em className="italic text-moon">worth losing sleep over?</em>
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-lg text-muted-foreground">
            Open to contract work, collaborations, and long conversations.
          </p>
          <a
            href="mailto:dilshanaunreal240xsupun@gmail.com"
            className="mt-12 inline-flex items-center gap-3 rounded-full border border-moon/60 bg-moon/10 px-8 py-4 text-sm font-medium text-foreground backdrop-blur transition hover:bg-moon hover:text-primary-foreground"
          >
            dilshanaunreal240xsupun@gmail.com <span>→</span>
          </a>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row md:items-center md:px-10">
          <div>© {new Date().getFullYear()} Dilshana Dev.</div>
          <div className="flex gap-6">
            <a href="https://linkedin.com/in/supun-dilshan-925159348" className="hover:text-foreground">Linkedin</a>

            <a href="https://github.com/Dilshana-dev" className="hover:text-foreground">GitHub</a>
            
          </div>
        </div>
      </footer>

      <StarMap projects={constellations} onSelect={handleConstellationSelect} />
      <Ambience />
    </div>
  );
}
