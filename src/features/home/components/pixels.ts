const dither = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
type Ripple = { x: number; y: number; started: number };

export function startPixels(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
) {
  const surface = canvas.parentElement;
  if (!surface) return;

  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const palette = getComputedStyle(surface);
  const orange = palette.getPropertyValue("--color-primary-main").trim();
  const cream = palette.getPropertyValue("--color-primary-soft").trim();
  const state = {
    frame: 0,
    lastFrame: -Infinity,
    started: performance.now(),
    pointer: { x: -1000, y: -1000 },
    ripples: [] as Ripple[],
    cells: [] as { x: number; y: number; threshold: number }[],
    step: 12,
  };

  const draw = (now: number) => {
    const time = motionPreference.matches ? 0 : (now - state.started) / 1000;
    context.clearRect(0, 0, canvas.width, canvas.height);
    state.ripples = state.ripples.filter(
      (ripple) => now - ripple.started < 1800,
    );

    state.cells.forEach(({ x, y, threshold }) => {
      const u = x / canvas.width;
      const v = y / canvas.height;
      const wave = Math.sin(
        u * 10 + time * 0.65 + Math.sin(v * 7 - time * 0.4),
      );
      const detail = Math.cos(v * 14 - u * 6 + time * 0.8);
      const edge = Math.min(
        1,
        Math.abs(u - 0.5) * 2.8 + Math.abs(v - 0.48) * 0.5,
      );
      const hover = motionPreference.matches
        ? 0
        : Math.max(
            0,
            1 - Math.hypot(x - state.pointer.x, y - state.pointer.y) / 140,
          );
      const ripple = state.ripples.reduce((strength, point) => {
        const age = (now - point.started) / 1000;
        const distance = Math.hypot(x - point.x, y - point.y);
        return (
          strength +
          Math.max(0, 1 - Math.abs(distance - age * 260) / 35) * (1 - age / 1.8)
        );
      }, 0);
      const density =
        (wave * 0.22 + detail * 0.12 + 0.34) * edge +
        hover * 0.4 +
        ripple * 0.8;
      if (density < threshold + 0.12) return;

      const level = Math.min(3, Math.floor((density - threshold) * 5));
      const size = level > 1 ? state.step - 3 : 3;
      context.fillStyle = level === 3 ? cream : orange;
      context.globalAlpha = (0.18 + level * 0.2) * Math.max(0.12, edge);
      context.fillRect(x, y, size, size);
    });
    context.globalAlpha = 1;
  };

  const tick = (now: number) => {
    if (now - state.lastFrame >= 1000 / 24) {
      draw(now);
      state.lastFrame = now;
    }
    state.frame = requestAnimationFrame(tick);
  };

  const syncAnimation = () => {
    cancelAnimationFrame(state.frame);
    state.ripples = [];
    if (document.hidden) return;
    draw(performance.now());
    if (!motionPreference.matches) state.frame = requestAnimationFrame(tick);
  };

  const resize = () => {
    canvas.width = Math.max(1, surface.clientWidth);
    canvas.height = Math.max(1, surface.clientHeight);
    state.step = canvas.width < 640 ? 10 : 12;
    const columns = Math.ceil(canvas.width / state.step);
    const rows = Math.ceil(canvas.height / state.step);
    state.cells = Array.from({ length: columns * rows }, (_, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      return {
        x: col * state.step,
        y: row * state.step,
        threshold: dither[(row % 4) * 4 + (col % 4)] / 16,
      };
    });
    syncAnimation();
  };

  const move = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    state.pointer = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  };
  const leave = () => {
    state.pointer = { x: -1000, y: -1000 };
  };
  const burst = (event: PointerEvent) => {
    if (motionPreference.matches) return;
    move(event);
    state.ripples = [
      ...state.ripples.slice(-3),
      { ...state.pointer, started: performance.now() },
    ];
  };

  const observer = new ResizeObserver(resize);
  observer.observe(surface);
  resize();
  surface.addEventListener("pointermove", move);
  surface.addEventListener("pointerleave", leave);
  surface.addEventListener("pointerdown", burst);
  motionPreference.addEventListener("change", syncAnimation);
  document.addEventListener("visibilitychange", syncAnimation);

  return () => {
    cancelAnimationFrame(state.frame);
    observer.disconnect();
    surface.removeEventListener("pointermove", move);
    surface.removeEventListener("pointerleave", leave);
    surface.removeEventListener("pointerdown", burst);
    motionPreference.removeEventListener("change", syncAnimation);
    document.removeEventListener("visibilitychange", syncAnimation);
  };
}
