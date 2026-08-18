import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LAYERS } from "../data";
import { reducedMotion, useScramble } from "../lib";

const MAX_D = 21;
const MIN_D = 2.9;
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

function labelTexture(text: string, color: string) {
  return makeTex(512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(10,15,13,0.55)";
    ctx.fillRect(0, 24, w, h - 48);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 24, w, h - 48);
    ctx.fillStyle = color;
    ctx.font = "600 52px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 2);
  });
}

function blockTexture(main: string, sub: string, color: string) {
  return makeTex(512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(7,11,9,0.6)";
    ctx.fillRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = color;
    ctx.font = "700 46px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(main, w / 2, 66);
    ctx.fillStyle = "rgba(239,231,214,0.72)";
    ctx.font = "500 26px 'IBM Plex Mono', monospace";
    ctx.fillText(sub, w / 2, 116);
  });
}

function brandTexture() {
  return makeTex(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = "rgba(10,15,13,0.92)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(201,128,63,0.9)";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#e5a45c";
    ctx.font = "700 84px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("GROWTHFORGE", w / 2, 116);
    ctx.fillStyle = "rgba(239,231,214,0.66)";
    ctx.font = "500 30px 'IBM Plex Mono', monospace";
    ctx.fillText("DIGITAL-МАРКЕТИНГ ПОЛНОГО ЦИКЛА", w / 2, 186);
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

  const line1 = useScramble("НА ВХОДЕ — ТРАФИК.", go, 30);
  const line2 = useScramble("НА ВЫХОДЕ — РОСТ.", go, 26);

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
    const pts = [0.5, 0.78, 1];
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
    const target = new THREE.Vector3(0, 0.1, 0);

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
    warm.position.set(3.4, 2.6, 0.8);
    world.add(warm);
    const throatLight = new THREE.PointLight(0x3fd68b, 0.9, 7);
    throatLight.position.set(0, -1.5, 0);
    world.add(throatLight);
    const coreLight = new THREE.PointLight(0xe9c57f, 0.5, 10);
    coreLight.position.set(0, 0.6, 0);
    world.add(coreLight);

    const dotTex = softDot();

    type Stream = { pts: THREE.Points; curve: THREE.CatmullRomCurve3; n: number; sp: number };
    const makeStream = (curvePts: THREE.Vector3[], n: number, color: number, size: number, sp: number): Stream => {
      const curve = new THREE.CatmullRomCurve3(curvePts);
      const pos = new Float32Array(n * 3);
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({
        map: dotTex, color, size, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      return { pts, curve, n, sp };
    };
    const streams: Stream[] = [];

    /* ═══ L0 · ВИТРИНА: воронка, каналы, пьедестал ═══ */
    const shell = new THREE.Group();
    world.add(shell);

    // пьедестал с «дашбордом»
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(4.4, 4.7, 0.34, 56),
      new THREE.MeshStandardMaterial({ color: 0x0d1712, roughness: 0.85, metalness: 0.3, transparent: true })
    );
    platform.position.y = -2.55;
    shell.add(platform);
    const deckRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.15, 0.02, 8, 90),
      new THREE.MeshBasicMaterial({ color: 0x3fd68b, transparent: true, opacity: 0.4 })
    );
    deckRing.rotation.x = Math.PI / 2;
    deckRing.position.y = -2.36;
    shell.add(deckRing);
    const brandPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.85),
      new THREE.MeshBasicMaterial({ map: brandTexture(), transparent: true })
    );
    brandPlate.position.set(0, -2.55, 4.44);
    shell.add(brandPlate);

    // голограмма роста: столбики по кругу
    const bars: { mesh: THREE.Mesh; phase: number }[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const mat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xe5a45c : 0x3fd68b, transparent: true, opacity: 0.75,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), mat);
      mesh.position.set(Math.cos(a) * 3.75, -2.36, Math.sin(a) * 3.75);
      shell.add(mesh);
      bars.push({ mesh, phase: i * 0.83 });
    }

    // корпус воронки
    const funnelGeo = new THREE.CylinderGeometry(2.3, 0.62, 3.6, 48, 1, true);
    const funnel = new THREE.Mesh(funnelGeo, new THREE.MeshStandardMaterial({
      color: 0x0f2b20, roughness: 0.25, metalness: 0.55,
      emissive: new THREE.Color(0x1d5c40), emissiveIntensity: 0.35,
      transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false,
    }));
    funnel.position.y = 0.1;
    shell.add(funnel);
    const funnelWire = new THREE.Mesh(funnelGeo, new THREE.MeshBasicMaterial({
      color: 0x3fd68b, wireframe: true, transparent: true, opacity: 0.09, depthWrite: false,
    }));
    funnelWire.position.y = 0.1;
    shell.add(funnelWire);

    const topGlow = new THREE.Mesh(
      new THREE.CircleGeometry(2.28, 48),
      new THREE.MeshBasicMaterial({ map: dotTex, color: 0xe9c57f, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    topGlow.rotation.x = Math.PI / 2;
    topGlow.position.y = 1.92;
    shell.add(topGlow);
    const throatGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.6, 32),
      new THREE.MeshBasicMaterial({ map: dotTex, color: 0x3fd68b, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    throatGlow.rotation.x = Math.PI / 2;
    throatGlow.position.y = -1.68;
    shell.add(throatGlow);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.52, 0.85, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x3fd68b, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    beam.position.y = -2.05;
    shell.add(beam);

    // кольца AIDA
    const aida = [
      { t: "ОХВАТ", y: 1.35, r: 2.05, c: 0x3fd68b },
      { t: "ИНТЕРЕС", y: 0.62, r: 1.72, c: 0xe9c57f },
      { t: "ЖЕЛАНИЕ", y: -0.12, r: 1.38, c: 0xe5a45c },
      { t: "ДЕЙСТВИЕ", y: -0.85, r: 1.04, c: 0xe2795b },
    ];
    const aidaRings: THREE.Mesh[] = [];
    aida.forEach((a) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(a.r, 0.028, 10, 72),
        new THREE.MeshBasicMaterial({ color: a.c, transparent: true, opacity: 0.8 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = a.y;
      shell.add(ring);
      aidaRings.push(ring);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(a.t, `#${a.c.toString(16).padStart(6, "0")}`), transparent: true, depthWrite: false }));
      spr.position.set(a.r + 0.95, a.y, 0);
      spr.scale.set(1.55, 0.39, 1);
      shell.add(spr);
    });

    // спутники-каналы
    const podDefs = [
      { t: "SEO", c: 0x3fd68b, r: 3.0, y: 1.6, sp: 0.5, ph: 0.2 },
      { t: "SMM", c: 0xe5a45c, r: 3.4, y: 1.12, sp: -0.42, ph: 2.1 },
      { t: "PPC", c: 0xe2795b, r: 3.15, y: 0.62, sp: 0.62, ph: 4.0 },
      { t: "EMAIL", c: 0xe9c57f, r: 3.5, y: 1.95, sp: -0.5, ph: 1.2 },
      { t: "ДИЗАЙН", c: 0xe9c57f, r: 3.3, y: 0.15, sp: 0.46, ph: 5.3 },
      { t: "КОНТЕНТ", c: 0x3fd68b, r: 3.6, y: 1.4, sp: -0.36, ph: 3.3 },
    ];
    const pods: { pivot: THREE.Object3D; sp: number }[] = [];
    podDefs.forEach((p) => {
      const hex = `#${p.c.toString(16).padStart(6, "0")}`;
      const pivot = new THREE.Group();
      pivot.position.y = p.y;
      pivot.rotation.y = p.ph;
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.2, 0.34),
        new THREE.MeshStandardMaterial({ color: 0x10201a, roughness: 0.4, metalness: 0.5, emissive: new THREE.Color(p.c), emissiveIntensity: 0.4, transparent: true })
      );
      body.position.x = p.r;
      pivot.add(body);
      const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(p.t, hex), transparent: true, depthWrite: false }));
      tag.position.set(p.r, 0.34, 0);
      tag.scale.set(1.1, 0.28, 1);
      pivot.add(tag);
      const orbitPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(Math.cos(a) * p.r, p.y, Math.sin(a) * p.r));
      }
      const orbit = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: p.c, transparent: true, opacity: 0.16 })
      );
      shell.add(orbit);
      shell.add(pivot);
      pods.push({ pivot, sp: p.sp });
    });

    // входящий трафик: спиральный поток внутрь воронки
    const IN_N = 240;
    const inPos = new Float32Array(IN_N * 3);
    const inPhase = new Float32Array(IN_N);
    const inSpeed = new Float32Array(IN_N);
    const inAng = new Float32Array(IN_N);
    const inRad = new Float32Array(IN_N);
    const inSpin = new Float32Array(IN_N);
    for (let i = 0; i < IN_N; i++) {
      inPhase[i] = Math.random();
      inSpeed[i] = 0.1 + Math.random() * 0.13;
      inAng[i] = Math.random() * Math.PI * 2;
      inRad[i] = 0.18 + Math.random() * 0.82;
      inSpin[i] = 2 + Math.random() * 3.4;
    }
    const inGeo = new THREE.BufferGeometry();
    inGeo.setAttribute("position", new THREE.BufferAttribute(inPos, 3));
    const inflow = new THREE.Points(inGeo, new THREE.PointsMaterial({
      map: dotTex, color: 0xe9c57f, size: 0.07, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    shell.add(inflow);

    // исходящие «клиенты»: зелёные искры под горлом
    const OUT_N = 46;
    const outPos = new Float32Array(OUT_N * 3);
    const outPhase = new Float32Array(OUT_N);
    const outAng = new Float32Array(OUT_N);
    for (let i = 0; i < OUT_N; i++) {
      outPhase[i] = Math.random();
      outAng[i] = Math.random() * Math.PI * 2;
    }
    const outGeo = new THREE.BufferGeometry();
    outGeo.setAttribute("position", new THREE.BufferAttribute(outPos, 3));
    const outflow = new THREE.Points(outGeo, new THREE.PointsMaterial({
      map: dotTex, color: 0x3fd68b, size: 0.085, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    shell.add(outflow);

    // сканирующие кольца, бегущие вниз по воронке
    const scanRings: { mesh: THREE.Mesh; ph: number }[] = [0, 0.5].map((ph) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.014, 8, 64),
        new THREE.MeshBasicMaterial({ color: 0x3fd68b, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      mesh.rotation.x = Math.PI / 2;
      shell.add(mesh);
      return { mesh, ph };
    });

    /* ═══ L1 · КОНВЕЙЕР: путь клиента ═══ */
    const journey = new THREE.Group();
    world.add(journey);
    const jBlocks = [
      { t: "ТРАФИК", s: "SEO · PPC · SMM", c: 0x3fd68b, y: 1.75 },
      { t: "ВОВЛЕЧЕНИЕ", s: "ДИЗАЙН · КОНТЕНТ", c: 0xe9c57f, y: 0.9 },
      { t: "КОНВЕРСИЯ", s: "WEB · CRO", c: 0xe5a45c, y: 0.05 },
      { t: "УДЕРЖАНИЕ", s: "CRM · EMAIL", c: 0xe2795b, y: -0.8 },
      { t: "ЛОЯЛЬНОСТЬ", s: "КОМЬЮНИТИ", c: 0x3fd68b, y: -1.65 },
    ];
    const jEdges: THREE.LineSegments[] = [];
    jBlocks.forEach((b, i) => {
      const hex = `#${b.c.toString(16).padStart(6, "0")}`;
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.4, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x0d1f18, roughness: 0.35, metalness: 0.45, emissive: new THREE.Color(b.c), emissiveIntensity: 0.32, transparent: true, opacity: 0.96 })
      );
      slab.position.y = b.y;
      journey.add(slab);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(slab.geometry),
        new THREE.LineBasicMaterial({ color: b.c, transparent: true, opacity: 0.85 })
      );
      edges.position.y = b.y;
      journey.add(edges);
      jEdges.push(edges);
      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1, 0.66),
        new THREE.MeshBasicMaterial({ map: blockTexture(b.t, b.s, hex), transparent: true })
      );
      face.rotation.x = -Math.PI / 2;
      face.position.y = b.y + 0.215;
      journey.add(face);
      if (i < jBlocks.length - 1) {
        const tube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 0.5, 14, 1, true),
          new THREE.MeshBasicMaterial({ color: 0x3fd68b, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })
        );
        tube.position.y = b.y - 0.425;
        journey.add(tube);
      }
    });
    // потоки лидов между этапами
    const gapStreams: [number, number][] = [[1.5, 1.15], [0.65, 0.3], [-0.2, -0.55], [-1.05, -1.4]];
    gapStreams.forEach(([y0, y1], i) => {
      const s = makeStream(
        [
          new THREE.Vector3(0, y0, 0),
          new THREE.Vector3(i % 2 ? -0.13 : 0.13, (y0 + y1) / 2, i % 2 ? 0.09 : -0.07),
          new THREE.Vector3(0, y1, 0),
        ],
        26, i % 2 ? 0xe9c57f : 0x3fd68b, 0.06, 0.4
      );
      journey.add(s.pts);
      streams.push(s);
    });
    // отвалы (churn) — искры в стороны
    const churnL = makeStream(
      [new THREE.Vector3(1.15, 0.9, 0), new THREE.Vector3(1.85, 0.55, 0.3), new THREE.Vector3(2.4, -0.05, 0.55)],
      14, 0xe2795b, 0.05, 0.24
    );
    journey.add(churnL.pts);
    streams.push(churnL);
    const churnR = makeStream(
      [new THREE.Vector3(-1.15, -0.8, 0), new THREE.Vector3(-1.8, -1.15, -0.3), new THREE.Vector3(-2.3, -1.62, -0.5)],
      14, 0xe2795b, 0.05, 0.22
    );
    journey.add(churnR.pts);
    streams.push(churnR);

    /* ═══ L2 · ПОЛЕ КОНВЕРСИИ ═══ */
    const conv = new THREE.Group();
    world.add(conv);

    // тепловая карта кампаний
    const HN = 8;
    const heatGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const heatMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92 });
    const heat = new THREE.InstancedMesh(heatGeo, heatMat, HN * HN);
    {
      const m4 = new THREE.Matrix4();
      let k = 0;
      for (let i = 0; i < HN; i++)
        for (let j = 0; j < HN; j++) {
          m4.makeTranslation((i - (HN - 1) / 2) * 0.4, -1.05, (j - (HN - 1) / 2) * 0.4);
          heat.setMatrixAt(k++, m4);
        }
      heat.instanceMatrix.needsUpdate = true;
    }
    conv.add(heat);

    // ядро конверсии
    const coreWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshBasicMaterial({ color: 0x3fd68b, wireframe: true, transparent: true, opacity: 0.75 })
    );
    coreWire.position.y = 0.35;
    conv.add(coreWire);
    const coreInner = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0xe9c57f, transparent: true, opacity: 0.95 })
    );
    coreInner.position.y = 0.35;
    conv.add(coreInner);
    const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTex, color: 0xe9c57f, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    coreGlow.position.y = 0.35;
    coreGlow.scale.setScalar(1.7);
    conv.add(coreGlow);
    const coreRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.016, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xe5a45c, transparent: true, opacity: 0.7 })
    );
    coreRing.position.y = 0.35;
    conv.add(coreRing);
    const coreBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.34, 1.05, 18, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x3fd68b, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    coreBeam.position.y = -0.36;
    conv.add(coreBeam);

    // KPI-чипы на орбите
    const kpiDefs = [
      { t: "CTR", c: "#3fd68b", r: 1.7, y: 0.75, sp: 0.5, ph: 0.4 },
      { t: "CR", c: "#e9c57f", r: 1.55, y: 0.1, sp: -0.62, ph: 1.7 },
      { t: "ROMI", c: "#e5a45c", r: 1.8, y: 0.45, sp: 0.44, ph: 3.0 },
      { t: "LTV", c: "#3fd68b", r: 1.6, y: -0.25, sp: -0.5, ph: 4.4 },
      { t: "CAC", c: "#e2795b", r: 1.75, y: 0.9, sp: 0.56, ph: 5.2 },
      { t: "CPL", c: "#e9c57f", r: 1.5, y: -0.05, sp: -0.4, ph: 2.4 },
    ];
    const kpis: { spr: THREE.Sprite; r: number; y: number; sp: number; ph: number }[] = [];
    kpiDefs.forEach((k) => {
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(k.t, k.c), transparent: true, depthWrite: false }));
      spr.scale.set(0.95, 0.24, 1);
      conv.add(spr);
      kpis.push({ spr, r: k.r, y: k.y, sp: k.sp, ph: k.ph });
    });

    // вспышки конверсий
    const SP_N = 70;
    const spPos = new Float32Array(SP_N * 3);
    const spDir: THREE.Vector3[] = [];
    const spPhase = new Float32Array(SP_N);
    const spSpeed = new Float32Array(SP_N);
    for (let i = 0; i < SP_N; i++) {
      spDir.push(new THREE.Vector3().randomDirection());
      spPhase[i] = Math.random();
      spSpeed[i] = 0.25 + Math.random() * 0.4;
    }
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute("position", new THREE.BufferAttribute(spPos, 3));
    const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({
      map: dotTex, color: 0xe9c57f, size: 0.06, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    sparks.position.y = 0.35;
    conv.add(sparks);

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
    const journeyFades = collect(journey);
    const convFades = collect(conv);

    const applyFade = (list: FadeEntry[], f: number) => {
      const vis = f > 0.02;
      for (const e of list) {
        e.mat.opacity = e.base * f;
        e.obj.visible = e.obj.userData.keepHidden ? false : vis;
      }
    };

    /* particle updaters */
    const v3 = new THREE.Vector3();
    const updateInflow = (t: number) => {
      for (let i = 0; i < IN_N; i++) {
        const p = (t * inSpeed[i] + inPhase[i]) % 1;
        const y = lerp(2.7, -1.5, p);
        const rad = lerp(2.02, 0.18, p) * inRad[i];
        const a = inAng[i] + p * inSpin[i];
        inPos.set([Math.cos(a) * rad, y, Math.sin(a) * rad], i * 3);
      }
      (inGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    };
    const updateOutflow = (t: number) => {
      for (let i = 0; i < OUT_N; i++) {
        const p = (t * 0.3 + outPhase[i]) % 1;
        const y = -1.9 - p * 1.1;
        const rad = 0.1 + p * 0.85;
        outPos.set([Math.cos(outAng[i] + p * 2.2) * rad, y, Math.sin(outAng[i] + p * 2.2) * rad], i * 3);
      }
      (outGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    };
    const updateSparks = (t: number) => {
      for (let i = 0; i < SP_N; i++) {
        const p = (t * spSpeed[i] + spPhase[i]) % 1;
        v3.copy(spDir[i]).multiplyScalar(p * 2.1);
        spPos.set([v3.x, v3.y, v3.z], i * 3);
      }
      (spGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    };
    const updateStreams = (t: number) => {
      streams.forEach((s, si) => {
        const attr = s.pts.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let k = 0; k < s.n; k++) {
          const f = (t * s.sp + k / s.n + si * 0.13) % 1;
          s.curve.getPoint(f, v3);
          attr.setXYZ(k, v3.x, v3.y, v3.z);
        }
        attr.needsUpdate = true;
      });
    };
    const colA = new THREE.Color(0x17382b);
    const colB = new THREE.Color(0xe9c57f);
    const colMix = new THREE.Color();
    const updateHeat = (t: number) => {
      for (let i = 0; i < HN; i++)
        for (let j = 0; j < HN; j++) {
          const v = 0.5 + 0.5 * Math.sin(t * 1.25 + i * 0.83 + j * 1.31 + Math.sin(t * 0.6 + i * j * 0.2));
          colMix.copy(colA).lerp(colB, v * v);
          heat.setColorAt(i * HN + j, colMix);
        }
      if (heat.instanceColor) heat.instanceColor.needsUpdate = true;
    };

    /* camera + controls */
    let yaw = -0.55, pitch = 0.42;
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
      tPitch = clamp(tPitch + (e.clientY - py) * 0.0038, 0.1, 1.32);
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
    const rm = reducedMotion();
    // статичное распределение частиц для reduced-motion и первого кадра
    updateInflow(0); updateOutflow(0); updateSparks(0); updateStreams(0.5); updateHeat(0.6);
    bars.forEach((b) => { b.mesh.scale.y = 0.55; b.mesh.position.y = -2.36 + 0.275; });
    if (rm) scanRings.forEach((s) => { s.mesh.visible = false; s.mesh.userData.keepHidden = true; });

    let raf = 0;
    let lastPct = -1, lastLayer = -1, lastProg = -1;

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
      const fJourney = sstep(1.18, 1.62, r) * (1 - sstep(2.35, 3.05, r));
      const fConv = sstep(2.42, 3.15, r);
      applyFade(shellFades, fShell);
      applyFade(journeyFades, fJourney);
      applyFade(convFades, fConv);
      shell.visible = fShell > 0.02;
      journey.visible = fJourney > 0.02;
      conv.visible = fConv > 0.02;
      shell.scale.setScalar(1 + (1 - fShell) * 0.9);
      journey.scale.setScalar(0.55 + 3.1 * sstep(1.2, 2.6, r));
      conv.scale.setScalar(0.3 + 2.7 * sstep(2.4, 4.3, r));

      if (!rm) {
        updateInflow(t);
        updateOutflow(t);
        updateSparks(t);
        updateStreams(t);
        updateHeat(t);

        pods.forEach((pod) => { pod.pivot.rotation.y += dt * pod.sp; });
        aidaRings.forEach((ring, i) => {
          (ring.material as THREE.MeshBasicMaterial).opacity = 0.5 + 0.32 * Math.sin(t * 2 + i * 1.4);
        });
        scanRings.forEach((s) => {
          const p = (t * 0.22 + s.ph) % 1;
          s.mesh.position.y = lerp(1.85, -1.5, p);
          s.mesh.scale.setScalar(lerp(2.15, 0.55, p));
          (s.mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.45;
        });
        bars.forEach((b) => {
          const s = 0.18 + 1.15 * (0.5 + 0.5 * Math.sin(t * 1.35 + b.phase));
          b.mesh.scale.y = s;
          b.mesh.position.y = -2.36 + s * 0.5;
        });
        topGlow.material.opacity = 0.24 + Math.sin(t * 2.2) * 0.1;
        throatLight.intensity = 0.6 + fJourney * 1.2 + Math.sin(t * 3.1) * 0.2;
        coreLight.intensity = 0.3 + fConv * 1.6;
        jEdges.forEach((e, i) => {
          (e.material as THREE.LineBasicMaterial).opacity = 0.55 + 0.3 * Math.sin(t * 2.4 + i * 1.1);
        });
        coreWire.rotation.x += dt * 0.7;
        coreWire.rotation.y += dt * 0.5;
        coreRing.rotation.x = Math.PI / 2 + Math.sin(t * 0.8) * 0.5;
        coreRing.rotation.z += dt * 0.6;
        coreGlow.scale.setScalar(1.5 + Math.sin(t * 3.4) * 0.3);
        kpis.forEach((k) => {
          const a = t * k.sp + k.ph;
          k.spr.position.set(Math.cos(a) * k.r, 0.35 + k.y + Math.sin(t * 0.9 + k.ph) * 0.1, Math.sin(a) * k.r);
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
        {/* виньетка */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 50% 42%, transparent 46%, rgba(7,11,9,0.78) 100%)" }}
        />
        {failed && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="font-mono text-dim text-sm">WEBGL НЕДОСТУПЕН — КРУТИТЕ ДАЛЬШЕ: ВОРОНКА РАБОТАЕТ.</p>
          </div>
        )}

        {/* левая вертикальная подпись */}
        <div className="pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 lg:block">
          <p className="font-mono text-[10px] tracking-[0.4em] text-dim uppercase" style={{ writingMode: "vertical-rl" }}>
            GROWTHFORGE · ЖИВАЯ ВОРОНКА РОСТА · REV 2.6
          </p>
        </div>

        {/* модуль зума */}
        <div className="absolute right-4 top-20 z-10 w-44 md:right-8 md:top-1/2 md:w-56 md:-translate-y-1/2">
          <p className="font-mono text-[10px] tracking-[0.35em] text-dim uppercase">Оптический зум</p>
          <p className="font-mono text-4xl md:text-5xl font-semibold text-paper tabular-nums leading-none mt-1">
            {pct}<span className="text-copper">%</span>
          </p>
          <div className="relative mt-3 h-1 w-full bg-moss/70">
            <div className="absolute inset-y-0 left-0 bg-copper transition-[width] duration-150" style={{ width: `${prog * 100}%` }} />
            <span className="absolute -top-1 h-3 w-px bg-phos" style={{ left: markerPos(125) }} title="125% — конвейер" />
            <span className="absolute -top-1 h-3 w-px bg-ember" style={{ left: markerPos(260) }} title="260% — конверсии" />
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                onClick={() => { diveToken.current++; setDiving(false); scrollToProgress(l.id === 0 ? 0 : l.id === 1 ? 0.42 : 0.7); }}
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
            {diving ? "■ стоп" : "▶ автодайв"}
          </button>
          <p className="mt-3 font-mono text-[9px] leading-relaxed tracking-[0.2em] text-dim/80 uppercase">
            перетаскивание — орбита<br />скролл — зум
          </p>
        </div>

        {/* заголовок */}
        <div className="absolute bottom-8 left-4 z-10 max-w-xl md:bottom-12 md:left-12">
          <p className="font-mono text-[10px] md:text-xs tracking-[0.35em] text-phos uppercase mb-3">
            <span className="text-copper">//</span> digital-маркетинг полного цикла
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

        {/* подсказка скролла */}
        <div
          className={`pointer-events-none absolute bottom-8 right-6 z-10 hidden items-center gap-3 transition-opacity duration-500 md:flex ${
            pct < 112 ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-mono text-[10px] tracking-[0.35em] text-dim uppercase">скролл — погружение</span>
          <span className="relative h-12 w-px overflow-hidden bg-moss">
            <span className="hero-hint-line absolute inset-x-0 h-full bg-copper" />
          </span>
        </div>

        {/* прогресс погружения */}
        <div className="absolute bottom-0 left-0 z-10 h-[2px] w-full bg-moss/50">
          <div className="h-full bg-gradient-to-r from-copper to-phos transition-[width] duration-150" style={{ width: `${prog * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
