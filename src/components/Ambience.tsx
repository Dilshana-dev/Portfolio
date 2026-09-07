import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "luna-ambience-muted";

/**
 * Subtle moonlit ambience generated with the Web Audio API.
 * - Two detuned sine drones + slow LFO on a lowpass filter
 * - Fades in only while the hero is on screen (fades toward 40% off-hero)
 * - Requires a user tap to start (browser autoplay policy)
 * - Mute preference persists across visits
 */
export function Ambience() {
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const heroGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const heroVisibleRef = useRef(1);

  // Load persisted mute pref
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setMuted(stored === "1");
    } catch {}
  }, []);

  // Track hero visibility to drive fade
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        heroVisibleRef.current = e.intersectionRatio;
        applyGain();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [started]);

  const applyGain = () => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    const heroGain = heroGainRef.current;
    if (!ctx || !master || !heroGain) return;
    const now = ctx.currentTime;
    const target = muted ? 0 : 0.22;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(target, now + 1.2);
    // fade to 40% when hero is scrolled past
    const heroTarget = 0.4 + 0.6 * heroVisibleRef.current;
    heroGain.gain.cancelScheduledValues(now);
    heroGain.gain.linearRampToValueAtTime(heroTarget, now + 0.8);
  };

  const start = async () => {
    if (started) {
      // just toggle mute
      setMuted((m) => {
        const next = !m;
        try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch {}
        return next;
      });
      return;
    }
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    const heroGain = ctx.createGain();
    heroGain.gain.value = 1;
    heroGain.connect(master);
    heroGainRef.current = heroGain;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 480;
    filter.Q.value = 0.8;
    filter.connect(heroGain);

    // Two detuned drones + a shimmer fifth
    const voices: Array<{ freq: number; detune: number; gain: number; type: OscillatorType }> = [
      { freq: 82.4,  detune: -6, gain: 0.55, type: "sine" },
      { freq: 82.4,  detune:  7, gain: 0.5,  type: "sine" },
      { freq: 123.5, detune: -3, gain: 0.28, type: "sine" },
      { freq: 164.8, detune:  0, gain: 0.12, type: "triangle" },
    ];
    voices.forEach((v) => {
      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.value = v.freq;
      osc.detune.value = v.detune;
      const g = ctx.createGain();
      g.gain.value = v.gain;
      osc.connect(g).connect(filter);
      osc.start();
      nodesRef.current.push(osc, g);
    });

    // Slow LFO on filter cutoff for gentle breathing
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    nodesRef.current.push(lfo, lfoGain, filter);

    setStarted(true);
    // unmute on first activation
    setMuted(false);
    try { localStorage.setItem(STORAGE_KEY, "0"); } catch {}
  };

  // Apply gain whenever mute changes
  useEffect(() => {
    applyGain();
     
  }, [muted, started]);

  const label = !started
    ? "Play ambience"
    : muted
    ? "Ambience muted"
    : "Ambience on";

  return (
    <button
      type="button"
      onClick={start}
      aria-label={label}
      title={label}
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-moon/40 bg-background/70 text-moon backdrop-blur transition hover:border-moon hover:text-foreground"
    >
      {muted || !started ? (
        // muted icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      )}
    </button>
  );
}

export default Ambience;