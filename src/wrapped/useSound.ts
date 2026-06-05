import { useCallback, useEffect, useRef, useState } from "react";

type CueName =
  | "tick-forward"
  | "tick-back"
  | "type"
  | "rain-dot"
  | "stamp"
  | "strand"
  | "streak-tick"
  | "duck-out"
  | "warm-return"
  | "flip"
  | "download-success"
  | "count-tick"
  | "count-resolve";

interface UseSound {
  enabled: boolean;
  toggle: () => void;
  play: (cue: CueName, opts?: { pitch?: number; gain?: number }) => void;
  unlock: () => void;
}

const STORAGE_KEY = "wrapped:sound";

export function useSound(): UseSound {
  const [enabled, setEnabled] = useState<boolean>(false);
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") setEnabled(true);
    } catch {
      /* no-op */
    }
  }, []);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const AC =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.15;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      return ctx;
    } catch {
      return null;
    }
  }, []);

  const unlock = useCallback(() => {
    const ctx = ensureCtx();
    if (ctx && ctx.state === "suspended") {
      try {
        void ctx.resume();
      } catch {
        /* no-op */
      }
    }
  }, [ensureCtx]);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* no-op */
      }
      if (next) unlock();
      return next;
    });
  }, [unlock]);

  const play = useCallback(
    (cue: CueName, opts?: { pitch?: number; gain?: number }) => {
      if (!enabled) return;
      const ctx = ensureCtx();
      if (!ctx || !masterRef.current) return;
      try {
        const now = ctx.currentTime;
        const g = ctx.createGain();
        g.connect(masterRef.current);
        const osc = ctx.createOscillator();
        osc.connect(g);
        const pitch = opts?.pitch ?? 1;
        const baseGain = opts?.gain ?? 1;
        switch (cue) {
          case "tick-forward":
            osc.type = "triangle";
            osc.frequency.value = 520 * pitch;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.4 * baseGain, now + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
          case "tick-back":
            osc.type = "triangle";
            osc.frequency.value = 360 * pitch;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.35 * baseGain, now + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
            osc.start(now);
            osc.stop(now + 0.1);
            break;
          case "type":
            osc.type = "square";
            osc.frequency.value = 1400 * (0.97 + Math.random() * 0.06);
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.08, now + 0.003);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
            osc.start(now);
            osc.stop(now + 0.04);
            break;
          case "rain-dot":
            osc.type = "sine";
            osc.frequency.value = 200 + 600 * pitch;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.15, now + 0.003);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
            osc.start(now);
            osc.stop(now + 0.025);
            break;
          case "stamp":
            osc.type = "sine";
            osc.frequency.value = 220;
            g.gain.setValueAtTime(0.5, now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.2);
            {
              const o2 = ctx.createOscillator();
              const g2 = ctx.createGain();
              o2.connect(g2);
              g2.connect(masterRef.current);
              o2.type = "sine";
              o2.frequency.value = 277;
              g2.gain.setValueAtTime(0.45, now + 0.05);
              g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
              o2.start(now + 0.05);
              o2.stop(now + 0.27);
            }
            break;
          case "strand":
            osc.type = "sine";
            osc.frequency.value = 300 + 200 * pitch;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
          case "streak-tick":
            osc.type = "triangle";
            osc.frequency.value = 480 + 220 * pitch;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.07);
            break;
          case "duck-out":
            if (masterRef.current) {
              const m = masterRef.current.gain;
              m.cancelScheduledValues(now);
              m.setValueAtTime(m.value, now);
              m.linearRampToValueAtTime(0.0001, now + 1);
            }
            osc.stop(now);
            break;
          case "warm-return":
            if (masterRef.current) {
              const m = masterRef.current.gain;
              m.cancelScheduledValues(now);
              m.setValueAtTime(m.value, now);
              m.linearRampToValueAtTime(0.15, now + 0.5);
            }
            osc.type = "sine";
            osc.frequency.value = 196;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            osc.start(now);
            osc.stop(now + 0.85);
            break;
          case "flip":
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.32);
            break;
          case "download-success":
            osc.type = "sine";
            osc.frequency.value = 520;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.2);
            {
              const o2 = ctx.createOscillator();
              const g2 = ctx.createGain();
              o2.connect(g2);
              g2.connect(masterRef.current);
              o2.type = "sine";
              o2.frequency.value = 784;
              g2.gain.setValueAtTime(0.0001, now + 0.12);
              g2.gain.exponentialRampToValueAtTime(0.35, now + 0.14);
              g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
              o2.start(now + 0.12);
              o2.stop(now + 0.36);
            }
            break;
          case "count-tick":
            osc.type = "sine";
            osc.frequency.value = 400 + 600 * pitch;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.06, now + 0.002);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
            osc.start(now);
            osc.stop(now + 0.02);
            break;
          case "count-resolve":
            osc.type = "sine";
            osc.frequency.value = 660;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.3, now + 0.03);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.42);
            break;
        }
      } catch {
        /* silent no-op */
      }
    },
    [enabled, ensureCtx]
  );

  useEffect(() => {
    return () => {
      try {
        ctxRef.current?.close();
      } catch {
        /* no-op */
      }
    };
  }, []);

  return { enabled, toggle, play, unlock };
}
