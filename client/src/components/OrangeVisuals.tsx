import { useEffect, useRef, useState } from "react";

export function ReactiveLinesBackdrop({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let frame = 0;
    let animation = 0;
    let pointer = { x: 0.5, y: 0.5 };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      context.fillStyle = "#090604";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "rgba(241, 137, 40, .6)";
      context.lineWidth = 1;
      for (let line = 0; line < 40; line += 1) {
        const baseY = height * 0.54 + line * 15;
        context.beginPath();
        for (let x = -24; x <= width + 24; x += 12) {
          const focus = Math.exp(-Math.pow((x / width - pointer.x) * 2.4, 2));
          const wave = Math.sin((x / width) * Math.PI + line * .12 + frame * .004) * (15 + focus * 55);
          const y = baseY + wave;
          x <= -24 ? context.moveTo(x, y) : context.lineTo(x, y);
        }
        context.stroke();
      }
      frame += 1;
      animation = requestAnimationFrame(draw);
    };
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

export function OrbitCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let time = 0;
    let animation = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      const angle = time * .01;
      for (let x = -1; x <= 1; x += .25) for (let y = -1; y <= 1; y += .25) for (let z = -1; z <= 1; z += .25) {
        if (Math.abs(x) !== 1 && Math.abs(y) !== 1 && Math.abs(z) !== 1) continue;
        const rx = x * Math.cos(angle) + z * Math.sin(angle);
        const rz = -x * Math.sin(angle) + z * Math.cos(angle);
        const ry = y * Math.cos(angle * .7) - rz * Math.sin(angle * .7);
        const depth = 1.8 + (y * Math.sin(angle * .7) + rz * Math.cos(angle * .7)) * .35;
        const scale = Math.min(width, height) * .23 / depth;
        context.fillStyle = `rgba(241, 137, 40, ${.25 + depth * .3})`;
        context.beginPath();
        context.arc(width / 2 + rx * scale, height / 2 + ry * scale, 1.2 + depth, 0, Math.PI * 2);
        context.fill();
      }
      time += 1;
      animation = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animation); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

export function TypewriterWordmark() {
  const phrases = ["STEMQUEST", "LEARN. TEST. GROW."];
  const [phrase, setPhrase] = useState(0);
  const [value, setValue] = useState("");
  useEffect(() => {
    const target = phrases[phrase] ?? "";
    if (value.length < target.length) {
      const timeout = window.setTimeout(() => setValue(target.slice(0, value.length + 1)), 82);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => { setValue(""); setPhrase(current => (current + 1) % phrases.length); }, 1800);
    return () => window.clearTimeout(timeout);
  }, [phrase, value]);
  return <p className="orange-typewriter">{value}<span>|</span></p>;
}
