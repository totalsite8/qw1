import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LAYERS } from "../data";
import { reducedMotion, useScramble } from "../lib";

const MAX_D = 24;
const MIN_D = 3.4;
const PCT_MAX = Math.round((MAX_D / MIN_D) * 100);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type FadeEntry = { obj: THREE.Object3D; mat: THREE.Material; base: number };

function collect(group: THREE.Object3D): FadeEntry[] {
  const out: FadeEntry[] = [];
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => out.push({ obj: o, mat: m, base: m.opacity ?? 1 }));
    }
  });
  return out;
}

function makeTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function pcbTexture() {
  return makeTex(1024, 512, (ctx, w, h) => {
    ctx.fillStyle = "#0d2a20";
    ctx.fillRect(0, 0, w, h);
    // fiberglass weave
    ctx.strokeStyle = "rgba(23,56,43,0.55)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 8) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    // copper traces with 90° bends
    for (let i = 0; i < 46; i++) {
      ctx.strokeStyle = Math.random() > 0.72 ? "rgba(229,164,92,0.5)" : "rgba(160,110,60,0.42)";
      ctx.lineWidth = Math.random() > 0.8 ? 3 : 2;
      ctx.beginPath();
      let x = rnd(0, w), y = rnd(0, h);
      ctx.moveTo(x, y);
      const segs = 3 + Math.floor(Math.random() * 4);
      let horiz = Math.random() > 0.5;
      for (let s = 0; s < segs; s++) {
        if (horiz) x = clamp(x + rnd(-180, 180), 8, w - 8);
        else y = clamp(y + rnd(-140, 140), 8, h - 8);
        ctx.lineTo(x, y);
        horiz = !horiz;
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(233,197,127,0.85)";
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }
    // phosphor buses
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = "rgba(63,214,139,0.3)";
      ctx.lineWidth = 2;
      const y = rnd(30, h - 30);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w * 0.4, y); ctx.lineTo(w * 0.45, y + rnd(-60, 60)); ctx.lineTo(w, y + rnd(-40, 40)); ctx.stroke();
    }
    // vias
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = "rgba(214,162,74,0.7)";
      ctx.beginPath(); ctx.arc(rnd(0, w), rnd(0, h), 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0d2a20";
      ctx.beginPath(); ctx.arc(rnd(0, w), rnd(0, h), 1, 0, Math.PI * 2); ctx.fill();
    }
    // pads near edges
    ctx.fillStyle = "rgba(212,164,79,0.9)";
    for (let x = 20; x < w - 10; x += 26) ctx.fillRect(x, h - 26, 14, 18);
  });
}

function dieTexture() {
  return makeTex(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#141a18";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(229,164,92,0.9)";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.strokeStyle = "rgba(63,214,139,0.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath(); ctx.moveTo(40, 60 + i * 20); ctx.lineTo(w - 40, 60 + i * 20); ctx.stroke();
    }
    ctx.fillStyle = "#e9c57f";
    ctx.font = "700 92px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("TF-9", w / 2, h / 2 + 66);
    ctx.fillStyle = "rgba(239,231,214,0.75)";
    ctx.font = "500 30px 'IBM Plex Mono', monospace";
    ctx.fillText("TENSORFORGE // 128 SM", w / 2, h - 60);
  });
}

function gridTexture() {
  return makeTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#0c1f18";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(63,214,139,0.22)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(201,128,63,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);
  });
}

function labelTexture(text: string, color: string) {
  return makeTex(512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(10,15,13,0.55)";
    ctx.fillRect(0, 24, w, h - 48);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 24, w, h - 48);
    ctx.fillStyle = color;
    ctx.font = "600 56px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 2);
  });
}

function tokenTexture(word: string) {
  return makeTex(256, 96, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(201,128,63,0.16)";
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.strokeStyle = "rgba(233,197,127,0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, w - 4, h - 4);
    ctx.fillStyle = "#efe7d6";
    ctx.font = "600 40px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(word, w / 2, h / 2 + 2);
  });
}

function softDot() {
  return makeTex(64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/* ─────────────────────────── component ─────────────────────────── */

export default function Scene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pct, setPct] = useState(100);
  const [layer, setLayer] = useState(0);
  const [prog, setProg] = useState(0);
  const [diving, setDiving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [go, setGo] = useState(false);

  const animToken = useRef(0);
  const diveToken = useRef(0);

  const line1 = useScramble("RAW DATA IN.", go, 30);
  const line2 = useScramble("RENDERED GROWTH OUT.", go, 26);

  useEffect(() => {
    const t = setTimeout(() => setGo(true), reducedMotion() ? 0 : 350);
    return () => clearTimeout(t);
  }, []);

  const scrollToProgress = (p: number, dur = 1500) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const vh = window.innerHeight;
    const y = wrap.offsetTop + p * Math.max(0, wrap.offsetHeight - vh);
    const token = ++animToken.current;
    if (reducedMotion() || dur <= 0) { window.scrollTo(0, y); return; }
    const y0 = window.scrollY;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (animToken.current !== token) return;
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, lerp(y0, y, easeIO(k)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const startDive = () => {
    if (diving) { diveToken.current++; setDiving(false); return; }
    const token = ++diveToken.current;
    const sToken = ++animToken.current;
    setDiving(true);
    const pts = [0.4, 0.66, 1];
    const onUser = () => { if (diveToken.current === token) { diveToken.current++; setDiving(false); } };
    window.addEventListener("wheel", onUser, { passive: true });
    window.addEventListener("touchstart", onUser, { passive: true });
    let i = 0;
    const step = () => {
      if (diveToken.current !== token || animToken.current !== sToken) return;
      if (i >= pts.length) {
        window.removeEventListener("wheel", onUser);
        window.removeEventListener("touchstart", onUser);
        setDiving(false);
        return;
      }
      const p = pts[i++];
      const wrap = wrapRef.current!;
      const vh = window.innerHeight;
      const y = wrap.offsetTop + p * Math.max(0, wrap.offsetHeight - vh);
      const y0 = window.scrollY;
      const t0 = performance.now();
      const dur = reducedMotion() ? 0 : 1700;
      const tick = (now: number) => {
        if (diveToken.current !== token) return;
        const k = dur === 0 ? 1 : Math.min(1, (now - t0) / dur);
        window.scrollTo(0, lerp(y0, y, easeIO(k)));
        if (k < 1) requestAnimationFrame(tick);
        else setTimeout(step, 620);
      };
      requestAnimationFrame(tick);
    };
    step();
  };

  /* ───────────── three.js init ───────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const stick = stickRef.current;
    if (!canvas || !stick) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x070b09, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b09, 0.014);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 140);
    const target = new THREE.Vector3(0, 0.35, 0);

    const world = new THREE.Group();
    scene.add(world);

    /* lights */
    scene.add(new THREE.AmbientLight(0x9fc3ad, 0.55));
    const key = new THREE.DirectionalLight(0xf5e9d0, 1.7);
    key.position.set(6, 10, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x3fd68b, 0.6);
    rim.position.set(-7, 4, -6);
    scene.add(rim);
    const warm = new THREE.PointLight(0xe5a45c, 1.1, 16);
    warm.position.set(3.4, 2.2, 0.5);
    world.add(warm);
    const coreLight = new THREE.PointLight(0x3fd68b, 0.4, 12);
    coreLight.position.set(0, 1.4, 0);
    world.add(coreLight);

    const dotTex = softDot();

    /* ═══ L0 · GPU SHELL ═══ */
    const shell = new THREE.Group();
    world.add(shell);
    {
      const pcbMat = new THREE.MeshStandardMaterial({
        map: pcbTexture(), roughness: 0.75, metalness: 0.25,
        emissive: new THREE.Color(0xd8a24a), emissiveIntensity: 0.16, emissiveMap: undefined, transparent: true,
      });
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.22, 4.6), pcbMat);
      shell.add(pcb);

      // die
      const die = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.34, 1.9),
        new THREE.MeshStandardMaterial({ color: 0x1a211e, roughness: 0.3, metalness: 0.8, transparent: true })
      );
      die.position.y = 0.28;
      shell.add(die);
      const dieFace = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 1.7),
        new THREE.MeshBasicMaterial({ map: dieTexture(), transparent: true })
      );
      dieFace.rotation.x = -Math.PI / 2;
      dieFace.position.y = 0.452;
      shell.add(dieFace);
      const dieGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 2.2),
        new THREE.MeshBasicMaterial({ map: dotTex, color: 0xe5a45c, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      dieGlow.rotation.x = -Math.PI / 2;
      dieGlow.position.y = 0.46;
      shell.add(dieGlow);

      // VRAM
      const vramGeo = new THREE.BoxGeometry(0.95, 0.16, 0.5);
      const vramMat = new THREE.MeshStandardMaterial({ color: 0x101513, roughness: 0.4, metalness: 0.6, transparent: true });
      const vramPos = [
        [-1.9, 1.3], [-1.9, -1.3], [1.9, 1.3], [1.9, -1.3],
        [-0.7, 1.55], [0.7, 1.55], [-0.7, -1.55], [0.7, -1.55],
      ];
      vramPos.forEach(([x, z]) => {
        const v = new THREE.Mesh(vramGeo, vramMat);
        v.position.set(x, 0.19, z);
        shell.add(v);
      });

      // capacitors (instanced)
      const capGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.13, 10);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xb9895a, roughness: 0.35, metalness: 0.9, transparent: true });
      const caps = new THREE.InstancedMesh(capGeo, capMat, 64);
      const m4 = new THREE.Matrix4();
      for (let i = 0; i < 64; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rad = 1.3 + Math.random() * 0.5;
        m4.makeTranslation(Math.cos(angle) * rad + (Math.random() - 0.5) * 3, 0.175, Math.sin(angle) * rad + (Math.random() - 0.5) * 2.4);
        caps.setMatrixAt(i, m4);
      }
      shell.add(caps);

      // heatsink fins
      const finGeo = new THREE.BoxGeometry(0.07, 0.55, 3.7);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x96a0a4, roughness: 0.32, metalness: 0.95, transparent: true });
      const fins = new THREE.InstancedMesh(finGeo, finMat, 26);
      for (let i = 0; i < 26; i++) {
        m4.makeTranslation(2.35 + i * 0.105, 0.4, 0);
        fins.setMatrixAt(i, m4);
      }
      shell.add(fins);
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(2.9, 0.1, 3.8),
        new THREE.MeshStandardMaterial({ color: 0xc9803f, roughness: 0.4, metalness: 0.85, transparent: true })
      );
      plate.position.set(3.65, 0.16, 0);
      shell.add(plate);

      // fans
      const fanSpinners: THREE.Group[] = [];
      [-3.5, -1.0].forEach((fx) => {
        const fan = new THREE.Group();
        fan.position.set(fx, 0.22, 0);
        const rimT = new THREE.Mesh(
          new THREE.TorusGeometry(1.12, 0.07, 10, 40),
          new THREE.MeshStandardMaterial({ color: 0x1b2320, roughness: 0.5, metalness: 0.7, transparent: true })
        );
        rimT.rotation.x = Math.PI / 2;
        fan.add(rimT);
        const spinner = new THREE.Group();
        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.14, 20),
          new THREE.MeshStandardMaterial({ color: 0x242d29, roughness: 0.4, metalness: 0.8, transparent: true })
        );
        spinner.add(hub);
        const bladeGeo = new THREE.BoxGeometry(0.62, 0.03, 0.24);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x2e3a34, roughness: 0.5, metalness: 0.5, transparent: true });
        for (let b = 0; b < 9; b++) {
          const blade = new THREE.Mesh(bladeGeo, bladeMat);
          const a = (b / 9) * Math.PI * 2;
          blade.position.set(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62);
          blade.rotation.y = -a + Math.PI / 2;
          blade.rotation.z = 0.42;
          spinner.add(blade);
        }
        fan.add(spinner);
        fanSpinners.push(spinner);
        shell.add(fan);
      });

      // power connector
      const pwr = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.5, 1.15),
        new THREE.MeshStandardMaterial({ color: 0x171d1a, roughness: 0.45, metalness: 0.6, transparent: true })
      );
      pwr.position.set(5.35, 0.36, -1.1);
      shell.add(pwr);

      // gold fingers
      const fingerGeo = new THREE.BoxGeometry(0.16, 0.1, 0.3);
      const fingerMat = new THREE.MeshStandardMaterial({ color: 0xd4a44f, roughness: 0.25, metalness: 1, transparent: true });
      const fingers = new THREE.InstancedMesh(fingerGeo, fingerMat, 42);
      for (let i = 0; i < 42; i++) {
        m4.makeTranslation(-4.6 + i * 0.225, -0.05, 2.38);
        fingers.setMatrixAt(i, m4);
      }
      shell.add(fingers);

      // backplate + bracket
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(10.6, 0.08, 4.7),
        new THREE.MeshStandardMaterial({ color: 0x22282a, roughness: 0.4, metalness: 0.85, transparent: true })
      );
      back.position.y = -0.19;
      shell.add(back);
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.9, 4.9),
        new THREE.MeshStandardMaterial({ color: 0x8d979b, roughness: 0.3, metalness: 1, transparent: true })
      );
      bracket.position.set(-5.35, 0.1, 0);
      shell.add(bracket);

      // holo rings
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(6.4, 0.015, 6, 90),
        new THREE.MeshBasicMaterial({ color: 0xc9803f, transparent: true, opacity: 0.4 })
      );
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = 0.1;
      shell.add(ring1);
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(7.2, 0.008, 6, 90),
        new THREE.MeshBasicMaterial({ color: 0x3fd68b, transparent: true, opacity: 0.22 })
      );
      ring2.rotation.x = Math.PI / 2;
      ring2.position.y = 0.1;
      shell.add(ring2);

      var fanSpinRef = fanSpinners;
      var ringRef1 = ring1;
      var ringRef2 = ring2;
      var dieGlowRef = dieGlow;
    }

    /* ═══ L1 · TRANSFORMER CORE ═══ */
    const arch = new THREE.Group();
    arch.position.y = 0.35;
    world.add(arch);
    const streams: { curve: THREE.CatmullRomCurve3; pts: THREE.Points; n: number }[] = [];
    {
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(6.2, 0.06, 2.7),
        new THREE.MeshStandardMaterial({ map: gridTexture(), roughness: 0.8, metalness: 0.2, transparent: true })
      );
      floor.position.y = -0.55;
      arch.add(floor);

      const glass = (c: number, op: number) =>
        new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: op, roughness: 0.3, metalness: 0.4, depthWrite: false });
      const edge = (c: number) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.85 });

      const block = (w: number, h: number, d: number, x: number, c: number, label: string) => {
        const g = new THREE.Group();
        g.position.set(x, 0.35, 0);
        const solid = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glass(c, 0.16));
        g.add(solid);
        const lines = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edge(c));
        g.add(lines);
        const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(label, "#e9c57f"), transparent: true, depthWrite: false }));
        spr.scale.set(0.95, 0.24, 1);
        spr.position.y = h / 2 + 0.26;
        g.add(spr);
        arch.add(g);
        return g;
      };

      block(0.7, 1.0, 0.9, -2.55, 0x3fd68b, "EMBED");
      block(0.3, 1.2, 0.9, -1.85, 0x8fa396, "POS");
      for (let i = 0; i < 4; i++) {
        const lg = block(0.62, 1.7, 1.15, -1.0 + i * 0.88, 0xe5a45c, `L-0${i + 1}`);
        const mha = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.8), glass(0x3fd68b, 0.5));
        mha.position.set(0, 0.42, 0);
        lg.add(mha);
        const ffn = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.55, 0.8), glass(0xe2795b, 0.5));
        ffn.position.set(0, -0.42, 0);
        lg.add(ffn);
        const norm = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.015, 6, 24),
          new THREE.MeshBasicMaterial({ color: 0xe9c57f, transparent: true, opacity: 0.7 })
        );
        norm.rotation.y = Math.PI / 2;
        norm.position.set(0.36, 0, 0);
        lg.add(norm);
      }
      block(0.7, 1.0, 0.9, 2.75, 0xe9c57f, "LM-HEAD");

      // token streams
      const streamDefs = [
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-3.1, 0.35, 0), new THREE.Vector3(-2.2, 0.7, 0.2), new THREE.Vector3(-0.6, 0.9, -0.25),
          new THREE.Vector3(1.0, 0.75, 0.3), new THREE.Vector3(2.4, 0.5, 0), new THREE.Vector3(3.3, 0.35, 0),
        ]),
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-3.1, 0.35, 0), new THREE.Vector3(-1.8, 0.1, -0.3), new THREE.Vector3(0, 0.2, 0.35),
          new THREE.Vector3(1.6, 0.15, -0.3), new THREE.Vector3(3.3, 0.35, 0),
        ]),
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-3.1, 0.35, 0), new THREE.Vector3(-1.2, 1.15, 0), new THREE.Vector3(0.8, 1.05, 0),
          new THREE.Vector3(3.3, 0.35, 0),
        ]),
      ];
      const pMat = new THREE.PointsMaterial({
        map: dotTex, color: 0x3fd68b, size: 0.085, transparent: true, opacity: 0.95,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      streamDefs.forEach((curve) => {
        const n = 13;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
        const pts = new THREE.Points(geo, pMat);
        arch.add(pts);
        streams.push({ curve, pts, n });
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 48, 0.008, 4, false),
          new THREE.MeshBasicMaterial({ color: 0x224434, transparent: true, opacity: 0.3 })
        );
        arch.add(tube);
      });
    }

    /* ═══ L2 · TENSOR FIELD ═══ */
    const tensor = new THREE.Group();
    tensor.position.y = 0.35;
    world.add(tensor);
    let attn: THREE.InstancedMesh;
    const attnN = 8;
    const tokens: { spr: THREE.Sprite; r: number; sp: number; ph: number; y: number }[] = [];
    {
      const attnGeo = new THREE.BoxGeometry(0.155, 0.155, 0.155);
      const attnMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      attn = new THREE.InstancedMesh(attnGeo, attnMat, attnN * attnN);
      const m4b = new THREE.Matrix4();
      const colWhite = new THREE.Color(1, 1, 1);
      for (let i = 0; i < attnN; i++)
        for (let j = 0; j < attnN; j++) {
          m4b.makeTranslation((i - (attnN - 1) / 2) * 0.24, (j - (attnN - 1) / 2) * 0.24, 1.05);
          attn.setMatrixAt(i * attnN + j, m4b);
          attn.setColorAt(i * attnN + j, colWhite);
        }
      tensor.add(attn);

      // QKV beams
      const beam = (from: THREE.Vector3, to: THREE.Vector3, c: number) => {
        const dir = to.clone().sub(from);
        const len = dir.length();
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.022, 0.022, len, 8),
          new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        mesh.position.copy(from).add(to).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        tensor.add(mesh);
      };
      beam(new THREE.Vector3(-1.9, 1.15, -0.7), new THREE.Vector3(0, 0, 0.15), 0x3fd68b);
      beam(new THREE.Vector3(-1.9, -0.05, -1.1), new THREE.Vector3(0, 0, 0.15), 0xe9c57f);
      beam(new THREE.Vector3(-1.9, -1.15, -0.5), new THREE.Vector3(0, 0, 0.15), 0xe2795b);
      const qkv = ["Q", "K", "V"];
      const qkvPos = [[-1.9, 1.15, -0.7], [-1.9, -0.05, -1.1], [-1.9, -1.15, -0.5]];
      qkvPos.forEach((p, i) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(qkv[i], "#efe7d6"), transparent: true, depthWrite: false }));
        s.scale.set(0.5, 0.13, 1);
        s.position.set(p[0] - 0.25, p[1] + 0.2, p[2]);
        tensor.add(s);
      });

      // matmul core
      const coreWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.34, 1),
        new THREE.MeshBasicMaterial({ color: 0xe5a45c, wireframe: true, transparent: true, opacity: 0.85 })
      );
      coreWire.position.set(0, 0, 0.15);
      tensor.add(coreWire);
      const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xe5a45c, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
      coreGlow.scale.set(1.3, 1.3, 1);
      coreGlow.position.set(0, 0, 0.15);
      tensor.add(coreGlow);
      var coreWireRef = coreWire;
      var coreGlowRef = coreGlow;

      // token chips
      ["GROW", "SCALE", "SHIP", "DATA", "SEO", "ROI"].forEach((w, i) => {
        const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tokenTexture(w), transparent: true, depthWrite: false }));
        spr.scale.set(0.72, 0.27, 1);
        tensor.add(spr);
        tokens.push({ spr, r: 1.55 + (i % 3) * 0.35, sp: 0.25 + (i % 4) * 0.08, ph: (i / 6) * Math.PI * 2, y: -0.9 + i * 0.36 });
      });

      // tensor dust
      const n = 240;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const v = new THREE.Vector3().randomDirection().multiplyScalar(0.8 + Math.random() * 1.9);
        pos.set([v.x, v.y, v.z], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      tensor.add(new THREE.Points(g, new THREE.PointsMaterial({
        map: dotTex, color: 0x3fd68b, size: 0.045, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })));
    }

    /* ambient dust */
    {
      const n = 500;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const v = new THREE.Vector3().randomDirection().multiplyScalar(7 + Math.random() * 26);
        pos.set([v.x, v.y, v.z], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      world.add(new THREE.Points(g, new THREE.PointsMaterial({
        map: dotTex, color: 0x2e6b4f, size: 0.06, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })));
    }

    const shellFades = collect(shell);
    const archFades = collect(arch);
    const tensorFades = collect(tensor);

    const applyFade = (list: FadeEntry[], f: number) => {
      const vis = f > 0.02;
      for (const e of list) {
        e.mat.opacity = e.base * f;
        e.obj.visible = vis;
      }
    };

    /* camera + controls */
    let yaw = -0.6, pitch = 0.52;
    let tYaw = yaw, tPitch = pitch;
    let dist = MAX_D, tDist = MAX_D;
    let dragging = false, px = 0, py = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" && e.target !== canvas) return;
      dragging = true;
      px = e.clientX; py = e.clientY;
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      tYaw -= (e.clientX - px) * 0.0052;
      tPitch = clamp(tPitch + (e.clientY - py) * 0.0038, 0.14, 1.32);
      px = e.clientX; py = e.clientY;
    };
    const onUp = () => { dragging = false; canvas.style.cursor = "grab"; };
    canvas.style.cursor = "grab";
    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    /* scroll → zoom */
    const readScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const vh = window.innerHeight;
      const p = clamp((window.scrollY - wrap.offsetTop) / Math.max(1, wrap.offsetHeight - vh), 0, 1);
      tDist = lerp(MAX_D, MIN_D, easeIO(p));
    };
    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });

    /* resize */
    const resize = () => {
      const w = stick.clientWidth, h = stick.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stick);

    /* loop */
    const clock = new THREE.Clock();
    const colA = new THREE.Color(0x17382b);
    const colB = new THREE.Color(0xe9c57f);
    const colMix = new THREE.Color();
    const v3 = new THREE.Vector3();
    let raf = 0;
    let lastPct = -1, lastLayer = -1, lastProg = -1;
    const rm = reducedMotion();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      yaw += (tYaw - yaw) * 0.08;
      pitch += (tPitch - pitch) * 0.08;
      dist += (tDist - dist) * 0.1;

      if (!rm) world.rotation.y += dt * 0.05;

      camera.position.set(
        target.x + dist * Math.cos(pitch) * Math.sin(yaw),
        target.y + dist * Math.sin(pitch),
        target.z + dist * Math.cos(pitch) * Math.cos(yaw)
      );
      camera.lookAt(target);

      const r = MAX_D / dist;
      const p = Math.round(r * 100);
      const lay = r > 2.6 ? 2 : r > 1.25 ? 1 : 0;
      const progV = clamp((p - 100) / (PCT_MAX - 100), 0, 1);
      if (p !== lastPct) { lastPct = p; setPct(p); }
      if (lay !== lastLayer) { lastLayer = lay; setLayer(lay); }
      const progR = Math.round(progV * 200);
      if (progR !== lastProg) { lastProg = progR; setProg(progR / 200); }

      /* fades + scales */
      const fShell = 1 - sstep(1.12, 1.52, r);
      const fArch = sstep(1.18, 1.62, r) * (1 - sstep(2.35, 3.05, r));
      const fTensor = sstep(2.42, 3.15, r);
      applyFade(shellFades, fShell);
      applyFade(archFades, fArch);
      applyFade(tensorFades, fTensor);
      shell.visible = fShell > 0.02;
      arch.visible = fArch > 0.02;
      tensor.visible = fTensor > 0.02;
      shell.scale.setScalar(1 + (1 - fShell) * 0.9);
      arch.scale.setScalar(0.55 + 3.1 * sstep(1.2, 2.6, r));
      tensor.scale.setScalar(0.3 + 2.7 * sstep(2.4, 4.3, r));

      if (!rm) {
        /* living shell */
        fanSpinRef.forEach((s, i) => { s.rotation.y -= dt * (9 + r * 3) * (i % 2 ? -1 : 1); });
        ringRef1.rotation.z += dt * 0.12;
        ringRef2.rotation.z -= dt * 0.08;
        dieGlowRef.material.opacity = 0.35 + Math.sin(t * 2.4) * 0.18;
        coreLight.intensity = 0.3 + fArch * 1.4 + Math.sin(t * 3.1) * 0.2;

        /* streams */
        streams.forEach((s, si) => {
          const attr = s.pts.geometry.getAttribute("position") as THREE.BufferAttribute;
          for (let k = 0; k < s.n; k++) {
            const f = (t * (0.1 + si * 0.02) + k / s.n) % 1;
            s.curve.getPoint(f, v3);
            attr.setXYZ(k, v3.x, v3.y, v3.z);
          }
          attr.needsUpdate = true;
        });

        /* attention heat */
        for (let i = 0; i < attnN; i++)
          for (let j = 0; j < attnN; j++) {
            const v = 0.5 + 0.5 * Math.sin(t * 1.25 + i * 0.83 + j * 1.31 + Math.sin(t * 0.6 + i * j * 0.2));
            colMix.copy(colA).lerp(colB, v * v);
            attn.setColorAt(i * attnN + j, colMix);
          }
        if (attn.instanceColor) attn.instanceColor.needsUpdate = true;

        coreWireRef.rotation.x += dt * 0.7;
        coreWireRef.rotation.y += dt * 0.5;
        coreGlowRef.scale.setScalar(1.1 + Math.sin(t * 3.4) * 0.25);

        tokens.forEach((tk) => {
          const a = t * tk.sp + tk.ph;
          tk.spr.position.set(Math.cos(a) * tk.r, tk.y + Math.sin(t * 0.9 + tk.ph) * 0.16, Math.sin(a) * tk.r);
        });
      }

      if (!document.hidden) renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerdown", onDown);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mm) => {
            Object.values(mm).forEach((val) => { if (val && (val as THREE.Texture).isTexture) (val as THREE.Texture).dispose(); });
            mm.dispose();
          });
        }
      });
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markerPos = (v: number) => `${((v - 100) / (PCT_MAX - 100)) * 100}%`;

  return (
    <div ref={wrapRef} className="relative h-[340vh]" id="dive">
      <div ref={stickRef} className="sticky top-0 h-screen overflow-hidden scanlines">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 50% 42%, transparent 46%, rgba(7,11,9,0.78) 100%)" }}
        />
        {failed && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="font-mono text-dim text-sm">WEBGL UNAVAILABLE — SCROLL ON, THE PIPELINE STILL RUNS.</p>
          </div>
        )}

        {/* left rail caption */}
        <div className="pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 lg:block">
          <p className="font-mono text-[10px] tracking-[0.4em] text-dim uppercase" style={{ writingMode: "vertical-rl" }}>
            TENSORFORGE TF-9 · LIVE SILICON PREVIEW · REV 4.2
          </p>
        </div>

        {/* zoom module */}
        <div className="absolute right-4 top-20 z-10 w-44 md:right-8 md:top-1/2 md:w-56 md:-translate-y-1/2">
          <p className="font-mono text-[10px] tracking-[0.35em] text-dim uppercase">Optical zoom</p>
          <p className="font-mono text-4xl md:text-5xl font-semibold text-paper tabular-nums leading-none mt-1">
            {pct}<span className="text-copper">%</span>
          </p>
          <div className="relative mt-3 h-1 w-full bg-moss/70">
            <div className="absolute inset-y-0 left-0 bg-copper transition-[width] duration-150" style={{ width: `${prog * 100}%` }} />
            <span className="absolute -top-1 h-3 w-px bg-phos" style={{ left: markerPos(125) }} title="125% — core" />
            <span className="absolute -top-1 h-3 w-px bg-ember" style={{ left: markerPos(260) }} title="260% — tensors" />
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                onClick={() => { diveToken.current++; setDiving(false); scrollToProgress(l.id === 0 ? 0 : l.id === 1 ? 0.4 : 0.68); }}
                className={`group flex items-center gap-2 border px-2.5 py-2 text-left font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-300 ${
                  layer === l.id
                    ? "border-copper bg-copper/15 text-gold"
                    : "border-seam text-dim hover:border-copper/60 hover:text-paper"
                }`}
              >
                <span className={layer === l.id ? "text-phos" : ""}>{l.code}</span>
                <span className="flex-1">{l.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={startDive}
            className={`mt-3 w-full border px-2.5 py-2.5 font-mono text-[11px] tracking-[0.25em] uppercase transition-all duration-300 ${
              diving
                ? "border-ember bg-ember/15 text-ember"
                : "border-copper bg-copper/10 text-copper2 hover:bg-copper hover:text-ink"
            }`}
          >
            {diving ? "■ stop dive" : "▶ auto-dive"}
          </button>
          <p className="mt-3 font-mono text-[9px] leading-relaxed tracking-[0.2em] text-dim/80 uppercase">
            drag — orbit<br />scroll — zoom
          </p>
        </div>

        {/* headline */}
        <div className="absolute bottom-8 left-4 z-10 max-w-xl md:bottom-12 md:left-12">
          <p className="font-mono text-[10px] md:text-xs tracking-[0.35em] text-phos uppercase mb-3">
            <span className="text-copper">//</span> full-cycle digital studio
          </p>
          <h1 className="font-display font-bold leading-[1.04] tracking-tight text-paper text-[26px] sm:text-4xl lg:text-[52px]">
            <span className="block whitespace-pre">{line1 || "\u00A0"}</span>
            <span className="block whitespace-pre text-copper2">{line2 || "\u00A0"}</span>
          </h1>
          <p key={layer} className="mt-4 border-l-2 border-copper/70 pl-3 font-mono text-[10px] md:text-xs leading-relaxed text-dim max-w-sm">
            <span className="text-gold">{LAYERS[layer].code} · {LAYERS[layer].name.toUpperCase()} ({LAYERS[layer].at})</span>
            <br />{LAYERS[layer].desc}
            <span className="term-caret text-phos">▌</span>
          </p>
        </div>

        {/* scroll hint */}
        <div
          className={`pointer-events-none absolute bottom-8 right-6 z-10 hidden items-center gap-3 transition-opacity duration-500 md:flex ${
            pct < 112 ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-mono text-[10px] tracking-[0.35em] text-dim uppercase">scroll to zoom</span>
          <span className="relative h-12 w-px overflow-hidden bg-moss">
            <span className="hero-hint-line absolute inset-x-0 h-full bg-copper" />
          </span>
        </div>

        {/* dive progress rail */}
        <div className="absolute bottom-0 left-0 z-10 h-[2px] w-full bg-moss/50">
          <div className="h-full bg-gradient-to-r from-copper to-phos transition-[width] duration-150" style={{ width: `${prog * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
