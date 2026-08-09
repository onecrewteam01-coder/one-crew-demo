import React, { useEffect, useRef } from 'react';

interface MetricDataPoint {
  index: number;
  latency: number;
  memory: number;
}

interface LiveMetricsChartProps {
  data: MetricDataPoint[];
}

export function LiveMetricsChart({ data }: LiveMetricsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeAndRender = () => {
      if (!canvas) return;
      const rect = canvas.parentNode ? (canvas.parentNode as HTMLElement).getBoundingClientRect() : null;
      if (!rect) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw faint grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridRows = 4;
      for (let i = 1; i < gridRows; i++) {
        const y = (h / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (data.length === 0) return;

      const maxDataPoints = 30;
      const stepX = w / (maxDataPoints - 1);

      // 1. Draw Latency Line (Pure White + Glow)
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 6;

      data.forEach((pt, idx) => {
        // Map latency from 10-50 to Y
        const val = pt.latency;
        const mappedY = h - 20 - ((val - 10) / 40) * (h - 40);
        if (idx === 0) ctx.moveTo(0, mappedY);
        else ctx.lineTo(idx * stepX, mappedY);
      });
      ctx.stroke();

      // 2. Draw Memory Line (Muted Grey + Glow)
      ctx.beginPath();
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(136, 136, 136, 0.2)';
      ctx.shadowBlur = 6;

      data.forEach((pt, idx) => {
        // Map memory from 30-60 to Y
        const val = pt.memory;
        const mappedY = h - 20 - ((val - 30) / 30) * (h - 40);
        if (idx === 0) ctx.moveTo(0, mappedY);
        else ctx.lineTo(idx * stepX, mappedY);
      });
      ctx.stroke();

      // Reset shadow for subsequent draws
      ctx.shadowBlur = 0;
    };

    resizeAndRender();
    window.addEventListener('resize', resizeAndRender);

    return () => {
      window.removeEventListener('resize', resizeAndRender);
    };
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col min-h-[200px]">
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="font-mono text-[10px] sm:text-xs font-semibold text-neutral-400">
          Agent Network Core Metrics (Live)
        </h3>
        <div className="font-mono text-[10px] sm:text-xs text-neutral-400 flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Latency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span> Memory
          </span>
        </div>
      </div>
      <div className="flex-grow w-full h-[180px] sm:h-[220px] relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}

export function MiniSparkline() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let chartOffset = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.parentNode ? (canvas.parentNode as HTMLElement).getBoundingClientRect() : null;
      if (!rect) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      w = rect.width;
      h = rect.height;

      // Scale once on resize — NEVER call ctx.scale() inside the draw loop
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (ctx && w > 0 && h > 0) {
        chartOffset += 0.025; // Slightly faster, still smooth

        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 4;

        for (let i = 0; i < w; i++) {
          // Normalize i to canvas width — always 2.5 full wave cycles regardless of card width
          const t = (i / w) * Math.PI * 2 * 2.5;
          const y = h / 2
            + Math.sin(t + chartOffset) * (h * 0.28)
            + Math.cos(t * 0.4 + chartOffset * 1.4) * (h * 0.12);
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
