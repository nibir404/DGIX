"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 3D hero globe, styled after the Paper artwork "globe-bangladesh-dark":
 * deep-blue sphere, bright cyan atmosphere rim, cyan land dots, Bangladesh in glowing amber,
 * amber routes from Dhaka. Animation: slow 3D sway, routes draw in, gentle glow breathing,
 * pointer tilt. Land dots are precomputed (scripts/gen-globe-dots.mjs) so nothing heavy runs at load.
 */

const R = 1;
const DHAKA = { lat: 23.81, lon: 90.41 };
const ROUTES = [
  { lat: 40.71, lon: -74.0 }, // New York
  { lat: 51.5, lon: -0.12 }, // London
  { lat: 14.7, lon: -17.45 }, // Dakar
  { lat: 35.68, lon: 139.69 }, // Tokyo
  { lat: -6.2, lon: 106.8 }, // Jakarta
];

function toVec(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function useDots() {
  const [data, setData] = useState<{ pos: Float32Array; col: Float32Array; size: Float32Array } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/data/globe-dots.bin")
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (!alive) return;
        const raw = new Float32Array(buf);
        const n = raw.length / 3;
        const pos = new Float32Array(n * 3);
        const col = new Float32Array(n * 3);
        const size = new Float32Array(n);
        const cyan = new THREE.Color("#35B6FF");
        const amber = new THREE.Color("#FF8A1F");
        for (let i = 0; i < n; i++) {
          const bd = raw[i * 3 + 2] > 0.5;
          const v = toVec(raw[i * 3], raw[i * 3 + 1], R * (bd ? 1.006 : 1.002));
          pos.set([v.x, v.y, v.z], i * 3);
          const c = bd ? amber : cyan;
          col.set([c.r, c.g, c.b], i * 3);
          size[i] = bd ? 1.5 : 1;
        }
        setData({ pos, col, size });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

const dotMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: { uPx: { value: 1 }, uScale: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSize; uniform float uPx; uniform float uScale;
      varying vec3 vColor; varying float vFace;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * position);
        vFace = dot(n, normalize(-mv.xyz));
        gl_PointSize = aSize * uScale * uPx * (7.5 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying float vFace;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.1, d) * smoothstep(0.0, 0.35, vFace);
        gl_FragColor = vec4(vColor, a);
      }`,
  });

const bodyMat = () =>
  new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = 1.0 - max(dot(vN, vV), 0.0);
        vec3 deep = vec3(0.02, 0.10, 0.30);
        vec3 mid = vec3(0.04, 0.24, 0.62);
        vec3 rim = vec3(0.25, 0.75, 1.0);
        vec3 c = mix(deep, mid, smoothstep(0.0, 0.8, f));
        c = mix(c, rim, pow(f, 4.0) * 0.9);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });

const atmoMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: { uI: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; void main() { vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uI; varying vec3 vN;
      void main() {
        float i = pow(max(0.0, 0.66 - dot(vN, vec3(0.0,0.0,1.0))), 2.6) * 3.4 * uI;
        gl_FragColor = vec4(vec3(0.2, 0.68, 1.0) * i, i);
      }`,
  });

function Arc({ to, delay }: { to: { lat: number; lon: number }; delay: number }) {
  const { geom, end, count } = useMemo(() => {
    const a = toVec(DHAKA.lat, DHAKA.lon, R * 1.005);
    const b = toVec(to.lat, to.lon, R * 1.005);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(R + a.distanceTo(b) * 0.2);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const geom = new THREE.TubeGeometry(curve, 96, 0.0032, 6, false);
    return { geom, end: b, count: geom.index!.count };
  }, [to]);
  const start = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime;
    const t = THREE.MathUtils.clamp((clock.elapsedTime - start.current - delay) / 1.6, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    geom.setDrawRange(0, Math.floor((count / 6) * eased) * 6);
  });
  return (
    <group>
      <mesh geometry={geom}>
        <meshBasicMaterial color="#FFC98A" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial color="#FFF1D6" />
      </mesh>
      <Halo position={end} size={0.07} />
    </group>
  );
}

const haloTex = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,170,60,1)");
  grd.addColorStop(0.35, "rgba(255,140,30,0.55)");
  grd.addColorStop(1, "rgba(255,120,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

function Halo({ position, size }: { position: THREE.Vector3; size: number }) {
  const ref = useRef<THREE.Sprite>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = size * (1 + Math.sin(clock.elapsedTime * 1.6 + position.x * 5) * 0.12);
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <sprite ref={ref} position={position}>
      <spriteMaterial map={haloTex ?? undefined} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

function Earth() {
  const dots = useDots();
  const group = useRef<THREE.Group>(null);
  const dMat = useMemo(dotMat, []);
  const bMat = useMemo(bodyMat, []);
  const aMat = useMemo(atmoMat, []);
  const { gl, size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const on = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  // Base orientation: Atlantic → Bangladesh band facing the camera, like the artwork.
  const baseY = -2.36;
  const baseX = 0.18;
  useFrame(({ clock }) => {
    dMat.uniforms.uPx.value = gl.getPixelRatio();
    dMat.uniforms.uScale.value = Math.max(0.7, size.width / 1100);
    aMat.uniforms.uI.value = 0.92 + Math.sin(clock.elapsedTime * 0.8) * 0.08;
    const g = group.current;
    if (!g) return;
    const ty = baseY + Math.sin(clock.elapsedTime * 0.12) * 0.22 + pointer.current.x * 0.12;
    const tx = baseX + pointer.current.y * 0.08;
    g.rotation.y += (ty - g.rotation.y) * 0.04;
    g.rotation.x += (tx - g.rotation.x) * 0.04;
  });

  const dhaka = toVec(DHAKA.lat, DHAKA.lon, R * 1.01);
  return (
    <group ref={group} rotation={[baseX, baseY, 0]}>
      <mesh>
        <sphereGeometry args={[R, 96, 96]} />
        <primitive object={bMat} attach="material" />
      </mesh>
      {dots && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dots.pos, 3]} />
            <bufferAttribute attach="attributes-color" args={[dots.col, 3]} />
            <bufferAttribute attach="attributes-aSize" args={[dots.size, 1]} />
          </bufferGeometry>
          <primitive object={dMat} attach="material" />
        </points>
      )}
      {ROUTES.map((r, i) => (
        <Arc key={i} to={r} delay={0.6 + i * 0.18} />
      ))}
      <Halo position={dhaka} size={0.22} />
      <mesh scale={1.1}>
        <sphereGeometry args={[R, 64, 64]} />
        <primitive object={aMat} attach="material" />
      </mesh>
    </group>
  );
}

export default function Globe3D() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0.55, 2.6], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ camera }) => camera.lookAt(0, 0.5, 0)}
      >
        <Earth />
      </Canvas>
    </div>
  );
}
