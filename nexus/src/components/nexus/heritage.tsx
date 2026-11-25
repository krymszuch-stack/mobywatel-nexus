import { useId } from "react";
import type { Motif } from "@/lib/nexus/types";

function scallop(cx: number, cy: number, r: number, lobes: number, amp: number): string {
  const steps = lobes * 28;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rad = r + Math.sin(t * lobes) * amp;
    const x = cx + Math.cos(t) * rad;
    const y = cy + Math.sin(t) * rad;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

function fan(n = 64): string {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const a2 = a + 0.58;
    const x1 = 100 + Math.cos(a) * 18;
    const y1 = 100 + Math.sin(a) * 18;
    const qx = 100 + Math.cos(a + 0.28) * 68;
    const qy = 100 + Math.sin(a + 0.28) * 68;
    const x2 = 100 + Math.cos(a2) * 96;
    const y2 = 100 + Math.sin(a2) * 96;
    d += `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}

const ROSETTE = scallop(100, 100, 78, 18, 7);
const FAN = fan();

const CIVIC =
  "M6 78V46h10V36h8V28h8V36h8V46h12V78M58 78V44h10V28h4V16h4V28h4V44h10V78M108 78V50h52V78M116 78V62c6-8 14-8 20 0V78M140 78V62c6-8 14-8 20 0V78M168 78V46l16-16 16 16V78M176 62h8M176 70h8M208 78V42h40V78M216 78V58h10V78M232 78V58h10V78";

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className ?? "nx-logo"} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="1.7" fill="currentColor" />
      <ellipse
        cx="16"
        cy="16"
        rx="11.5"
        ry="4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        transform="rotate(-28 16 16)"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="11.5"
        ry="4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        transform="rotate(56 16 16)"
      />
      <path d="M23.5 4.5h4.5V9" fill="none" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  );
}

function MotifSvg({ motif, pid }: { motif: Motif; pid: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 0.6,
  };
  if (motif === "rosette") {
    return (
      <svg viewBox="0 0 200 200">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse
            key={i}
            cx="100"
            cy="100"
            rx="72"
            ry="20"
            transform={`rotate(${(i * 180) / 12} 100 100)`}
            {...common}
          />
        ))}
        <path d={ROSETTE} {...common} strokeWidth={0.45} />
        <circle cx="100" cy="100" r="16" {...common} />
        <circle cx="100" cy="100" r="4" {...common} />
      </svg>
    );
  }
  if (motif === "fan") {
    return (
      <svg viewBox="0 0 200 200">
        <path d={FAN} {...common} strokeWidth={0.35} />
        <circle cx="100" cy="100" r="10" {...common} />
      </svg>
    );
  }
  if (motif === "orbits") {
    return (
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="8" {...common} />
        <ellipse cx="100" cy="100" rx="78" ry="28" transform="rotate(-22 100 100)" {...common} />
        <ellipse cx="100" cy="100" rx="78" ry="28" transform="rotate(38 100 100)" {...common} />
        <ellipse cx="100" cy="100" rx="48" ry="16" transform="rotate(70 100 100)" {...common} />
        <circle cx="158" cy="86" r="3.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (motif === "lattice") {
    return (
      <svg viewBox="0 0 200 200">
        <defs>
          <pattern id={pid} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M8 0 16 8 8 16 0 8Z" fill="none" stroke="currentColor" strokeWidth="0.45" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill={`url(#${pid})`} />
        <circle cx="100" cy="100" r="28" {...common} />
      </svg>
    );
  }
  if (motif === "civic") {
    return (
      <svg viewBox="0 0 260 90">
        <path d={CIVIC} {...common} strokeWidth={1.1} />
      </svg>
    );
  }
  if (motif === "manuscript") {
    return (
      <svg viewBox="0 0 200 140">
        <path d="M18 28h164M18 48h164M18 68h164M18 88h140M18 108h120" {...common} />
        <rect x="18" y="18" width="14" height="18" {...common} />
        <path d="M40 22h46M40 36h28M18 122h70" {...common} />
      </svg>
    );
  }
  if (motif === "staff") {
    return (
      <svg viewBox="0 0 200 100">
        <path d="M16 22h168M16 36h168M16 50h168M16 64h168M16 78h168" {...common} />
        <ellipse cx="62" cy="36" rx="7" ry="5" transform="rotate(-18 62 36)" {...common} />
        <path d="M69 34V58" {...common} />
        <ellipse cx="108" cy="50" rx="7" ry="5" transform="rotate(-18 108 50)" {...common} />
        <path d="M115 48V72" {...common} />
        <ellipse cx="146" cy="28" rx="7" ry="5" transform="rotate(-18 146 28)" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="70" {...common} />
      <circle cx="100" cy="100" r="42" {...common} />
      <path d="M100 22v156M22 100h156" {...common} />
      <rect x="132" y="58" width="10" height="10" {...common} />
      <rect x="58" y="128" width="8" height="8" {...common} />
    </svg>
  );
}

export function Watermark({ motif, className }: { motif: Motif; className?: string }) {
  const pid = useId().replace(/:/g, "");
  return (
    <div className={className ? `nx-mark ${className}` : "nx-mark"} data-motif={motif} aria-hidden="true">
      <MotifSvg motif={motif} pid={pid} />
    </div>
  );
}
