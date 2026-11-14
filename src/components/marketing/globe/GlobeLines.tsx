"use client";

import { useEffect, useRef } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

/**
 * Line-art globe: dark sphere, thin graticule, crisp white coastlines,
 * a fine dot grid over land, Bangladesh lit up in glowing amber with Dhaka
 * as the home marker, and golden great-circle routes to the buyer markets.
 *
 * Drawn on a 2D canvas with d3-geo (orthographic). Drag to turn it;
 * it drifts slowly on its own, pauses off screen and respects reduced motion.
 */

const DHAKA: [number, number] = [90.41, 23.81];
const MARKETS: { name: string; at: [number, number] }[] = [
  { name: "Dubai", at: [55.27, 25.2] },
  { name: "Riyadh", at: [46.68, 24.71] },
  { name: "Doha", at: [51.53, 25.29] },
  { name: "New York", at: [-74.0, 40.71] },
];

// View: centred over the Indian Ocean, tilted so the Gulf and Bangladesh sit near the top arc
const BASE: [number, number, number] = [-58, 30, 0];

const C = {
  sphere: "#060E22",
  rim: "rgba(127,182,255,0.55)",
  grid: "rgba(255,255,255,0.10)",
  coast: "rgba(255,255,255,0.92)",
  dot: [190, 210, 240] as const,
  route: "rgba(255,196,110,0.9)",
  routeGlow: "rgba(255,150,40,0.9)",
  home: "#FFF1D6",
  amber: "#FF9A1F",
  amberHot: "#FFC35A",
  market: "#FFD48A",
};

type Land = FeatureCollection<Polygon | MultiPolygon>;

export default function GlobeLines({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let land: Land | null = null;
    let bd: Feature<Polygon | MultiPolygon> | null = null;
    let dots: Float32Array | null = null;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t0 = performance.now();
    let dragLon = 0, dragLat = 0;
    let drag: { x: number; y: number; lon: number; lat: number } | null = null;

    const projection = geoOrthographic().clipAngle(90).precision(0.4);
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();
    const routes = MARKETS.map((m) => ({ ...m, interp: geoInterpolate(DHAKA, m.at), len: geoDistance(DHAKA, m.at) }));

    const resize = () => {
      const r = el.getBoundingClientRect();
      w = r.width; h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      // Sphere sized to the width; its top sits a little below the top edge
      const radius = Math.min(w * 0.46, h * 1.05);
      projection.scale(radius).translate([w / 2, h * 0.24 + radius]);
    };

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const drift = reduce ? 0 : Math.sin(t * 0.08) * 14; // gentle back-and-forth, keeps Dhaka in view
      const rot: [number, number, number] = [BASE[0] + drift + dragLon, Math.max(-60, Math.min(60, BASE[1] + dragLat)), 0];
      projection.rotate(rot);
      const center: [number, number] = [-rot[0], -rot[1]];
      const radius = projection.scale();
      const [cx, cy] = projection.translate();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Sphere body with a soft inner light from the top
      const g = ctx.createRadialGradient(cx, cy - radius * 0.55, radius * 0.1, cx, cy, radius);
      g.addColorStop(0, "#0E2149");
      g.addColorStop(1, C.sphere);
      ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = g; ctx.fill();

      // Graticule
      ctx.beginPath(); path(graticule); ctx.strokeStyle = C.grid; ctx.lineWidth = 0.7; ctx.stroke();

      // Land dots, fading toward the limb
      if (dots) {
        const [r0, g0, b0] = C.dot;
        for (let i = 0; i < dots.length; i += 3) {
          if (dots[i + 2] === 1 && bd) continue; // Bangladesh dots are drawn in amber below
          const p: [number, number] = [dots[i + 1], dots[i]];
          const d = geoDistance(p, center);
          if (d > 1.5) continue;
          const xy = projection(p);
          if (!xy) continue;
          const a = 0.55 * Math.cos(d) ** 0.6;
          ctx.fillStyle = `rgba(${r0},${g0},${b0},${a.toFixed(3)})`;
          ctx.fillRect(xy[0] - 0.6, xy[1] - 0.6, 1.2, 1.2);
        }
      }

      // Coastlines
      if (land) {
        ctx.beginPath(); path(land); ctx.strokeStyle = C.coast; ctx.lineWidth = 0.9; ctx.lineJoin = "round"; ctx.stroke();
      }

      // Bangladesh: glowing amber fill, hot dots and a bright neon outline
      const bdVisible = geoDistance(DHAKA, center) < 1.45;
      const breathe = reduce ? 0.85 : 0.75 + 0.25 * Math.sin(t * 1.6);
      if (bd && bdVisible) {
        ctx.save();
        // Wide outer bloom
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = C.amber;
        ctx.shadowBlur = 38 * breathe;
        ctx.beginPath(); path(bd);
        ctx.fillStyle = `rgba(255,140,30,${(0.30 * breathe).toFixed(3)})`; ctx.fill();
        // Inner fill with a warm gradient
        ctx.shadowBlur = 0;
        const [bx0, by0] = projection([88, 26.6]) ?? [0, 0];
        const [bx1, by1] = projection([92.6, 20.7]) ?? [0, 0];
        const fg = ctx.createLinearGradient(bx0, by0, bx1, by1);
        fg.addColorStop(0, "rgba(255,200,90,0.55)");
        fg.addColorStop(1, "rgba(255,110,20,0.45)");
        ctx.beginPath(); path(bd); ctx.fillStyle = fg; ctx.fill();
        // Dense hot dots inside the border
        if (dots) {
          ctx.fillStyle = "rgba(255,226,160,0.95)";
          for (let i = 0; i < dots.length; i += 3) {
            if (dots[i + 2] !== 1) continue;
            const xy = projection([dots[i + 1], dots[i]]);
            if (xy) ctx.fillRect(xy[0] - 0.7, xy[1] - 0.7, 1.4, 1.4);
          }
        }
        // Neon outline: blurred wide pass, then a crisp hot core
        ctx.lineJoin = "round";
        ctx.shadowColor = C.amber; ctx.shadowBlur = 18;
        ctx.beginPath(); path(bd); ctx.strokeStyle = C.amber; ctx.lineWidth = 3.2; ctx.stroke();
        ctx.shadowColor = C.amberHot; ctx.shadowBlur = 6;
        ctx.beginPath(); path(bd); ctx.strokeStyle = "#FFE3A8"; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.restore();
      }

      // Routes: great circles drawing out from Dhaka, looping
      routes.forEach((r, i) => {
        const phase = reduce ? 1 : Math.min(1, ((t * 0.35 + i * 0.27) % 1.6) / 1.0);
        const steps = 48;
        const pts: [number, number][] = [];
        for (let s = 0; s <= steps * phase; s++) pts.push(r.interp(s / steps));
        if (pts.length < 2) return;
        ctx.beginPath(); path({ type: "LineString", coordinates: pts });
        ctx.save();
        ctx.shadowColor = C.routeGlow; ctx.shadowBlur = 10;
        ctx.strokeStyle = C.route; ctx.lineWidth = 1.6; ctx.setLineDash([]); ctx.stroke();
        ctx.restore();
        // Bright head travelling along the arc while it draws
        if (phase < 1) {
          const head = projection(pts[pts.length - 1]);
          if (head && geoDistance(pts[pts.length - 1], center) < 1.5) {
            ctx.save(); ctx.shadowColor = C.amberHot; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.arc(head[0], head[1], 2.4, 0, Math.PI * 2); ctx.fillStyle = "#FFF1D6"; ctx.fill();
            ctx.restore();
          }
        }
        // Market marker once the arc arrives
        if (phase >= 1 && geoDistance(r.at, center) < 1.45) {
          const xy = projection(r.at);
          if (xy) {
            ctx.save(); ctx.shadowColor = C.amber; ctx.shadowBlur = 14;
            ctx.beginPath(); ctx.arc(xy[0], xy[1], 3.4, 0, Math.PI * 2); ctx.fillStyle = C.market; ctx.fill();
            ctx.restore();
          }
        }
      });

      // Home marker: Dhaka, with a slow pulse
      if (geoDistance(DHAKA, center) < 1.5) {
        const xy = projection(DHAKA);
        if (xy) {
          const pulse = reduce ? 0.5 : (t % 2.2) / 2.2;
          ctx.beginPath(); ctx.arc(xy[0], xy[1], 5 + pulse * 16, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,170,60,${(0.4 * (1 - pulse)).toFixed(3)})`; ctx.fill();
          ctx.shadowColor = C.amberHot; ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.arc(xy[0], xy[1], 3.6, 0, Math.PI * 2); ctx.fillStyle = C.home; ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Thin rim
      ctx.beginPath(); path({ type: "Sphere" }); ctx.strokeStyle = C.rim; ctx.lineWidth = 1.2; ctx.stroke();

      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };

    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };

    // Data: coastlines (Natural Earth 50m) and the precomputed land dots
    fetch("/data/land-50m.json")
      .then((r) => r.json())
      .then((topo: Topology<{ land: GeometryCollection }>) => {
        land = feature(topo, topo.objects.land) as unknown as Land;
        start();
      })
      .catch(() => {});
    fetch("/data/bangladesh.json")
      .then((r) => r.json())
      .then((f: Feature<Polygon | MultiPolygon>) => { bd = f; start(); })
      .catch(() => {});
    fetch("/data/globe-dots.bin")
      .then((r) => r.arrayBuffer())
      .then((b) => { dots = new Float32Array(b); start(); })
      .catch(() => {});

    // Drag to turn
    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, lon: dragLon, lat: dragLat };
      cv.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const k = 120 / projection.scale();
      dragLon = drag.lon + (e.clientX - drag.x) * k * 0.9;
      dragLat = drag.lat - (e.clientY - drag.y) * k * 0.5;
      if (reduce) draw(performance.now());
    };
    const onUp = () => { drag = null; };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);

    const ro = new ResizeObserver(() => { resize(); start(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { t0 = performance.now() - 1; start(); } else cancelAnimationFrame(raf);
    }, { rootMargin: "100px" });
    io.observe(el);

    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={wrap} className={className ?? "absolute inset-0"}>
      <canvas ref={canvas} className="block size-full cursor-grab touch-pan-y active:cursor-grabbing" aria-label="Globe showing routes from Dhaka to buyer markets" role="img" />
    </div>
  );
}
