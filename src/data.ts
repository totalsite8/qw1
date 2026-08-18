export type Service = {
  id: string;
  block: string; // transformer-block analogue
  name: string;
  tagline: string;
  description: string;
  deliverables: string[];
  timeline: string;
  kpi: string;
  kpiLabel: string;
  hue: "phos" | "copper" | "ember" | "gold";
};

export const SERVICES: Service[] = [
  {
    id: "strategy",
    block: "EMBED",
    name: "Strategy & Analytics",
    tagline: "Tokenizing the brief",
    description:
      "Every project starts as raw signal. We tokenize it: market research, audience segmentation, CJM and a KPI-tree that turns business goals into measurable tensors. Nothing enters the pipeline un-embedded.",
    deliverables: ["Market & competitor research", "Positioning & tone of voice", "CJM / JTBD maps", "KPI tree & measurement plan", "Unit-economics model"],
    timeline: "2–3 weeks",
    kpi: "×3.1",
    kpiLabel: "faster decision cycles",
    hue: "phos",
  },
  {
    id: "design",
    block: "ATTN",
    name: "Design",
    tagline: "Attention heads of the studio",
    description:
      "Multi-head attention for your product: each head watches its own plane — UX logic, brand system, motion language, design tokens — then all heads are concatenated into one coherent interface that users actually feel.",
    deliverables: ["UX research & wireframes", "UI kit & design tokens", "Brand identity system", "Motion & micro-interactions", "3D / CG visuals"],
    timeline: "3–6 weeks",
    kpi: "+44%",
    kpiLabel: "avg. activation lift",
    hue: "copper",
  },
  {
    id: "dev",
    block: "FFN",
    name: "Development",
    tagline: "The compute core",
    description:
      "The feed-forward muscle: web platforms, e-commerce, high-load services, CRM/ERP integrations. Type-safe, covered by tests, deployed through CI/CD — compute that doesn't drop a frame under production load.",
    deliverables: ["Web apps & portals", "E-commerce builds", "API & CRM integrations", "High-load architecture", "CI/CD & observability"],
    timeline: "6–14 weeks",
    kpi: "0.9s",
    kpiLabel: "median LCP shipped",
    hue: "gold",
  },
  {
    id: "seo",
    block: "POS-ENC",
    name: "SEO",
    tagline: "Positional encoding",
    description:
      "Position is everything — in search results especially. Semantic cores, technical audits, indexation hygiene and a link graph that tells search engines exactly where every page of yours belongs in the sequence.",
    deliverables: ["Semantic core & clustering", "Technical SEO audit", "On-page optimization", "Content strategy", "Link-building graph"],
    timeline: "ongoing, 3+ months",
    kpi: "+312%",
    kpiLabel: "organic traffic, best case",
    hue: "phos",
  },
  {
    id: "marketing",
    block: "GRAD",
    name: "Performance Marketing",
    tagline: "Gradient descent on CAC",
    description:
      "We compute the loss — every ruble that leaks between click and checkout — and descend: PPC, retargeting, bid strategies, CRO experiments. Iteration after iteration the curve bends toward profitable scale.",
    deliverables: ["PPC & paid social", "Retargeting funnels", "CRO & A/B program", "Bid & budget automation", "End-to-end analytics"],
    timeline: "ongoing, sprints of 2 wks",
    kpi: "−38%",
    kpiLabel: "CAC after 3 sprints",
    hue: "ember",
  },
  {
    id: "smm",
    block: "BCAST",
    name: "SMM & Community",
    tagline: "The broadcast layer",
    description:
      "One signal, many channels. Content grids, community management, influencer pipelines and social listening — broadcasting the brand tensor across every feed while listening to the noise that comes back.",
    deliverables: ["Channel strategy & tone", "Content grids & production", "Community management", "Influencer pipelines", "Social listening reports"],
    timeline: "ongoing, monthly cycles",
    kpi: "×5.7",
    kpiLabel: "avg. ER growth in 6 mo",
    hue: "copper",
  },
  {
    id: "content",
    block: "LM-HEAD",
    name: "Content Production",
    tagline: "Projecting to vocabulary",
    description:
      "The final projection: everything the model computed becomes tokens people read, watch and share. Copy, video, 3D/CG and localization — output logits rendered into language your audience speaks.",
    deliverables: ["Editorial & copywriting", "Photo & video production", "3D / CG & motion design", "Localization & transcreation", "Brand media / blog"],
    timeline: "per production cycle",
    kpi: "12",
    kpiLabel: "languages shipped",
    hue: "gold",
  },
];

export const STEPS = [
  { n: "01", name: "Embedding", studio: "Brief intake", text: "The brief enters the pipeline. We tokenize goals, budget and constraints into a structured vector." },
  { n: "02", name: "Attention", studio: "Research & strategy", text: "Heads turn toward market, audience and competitors. Relevant context gets weighted, noise gets dropped." },
  { n: "03", name: "Layers", studio: "Design + development", text: "Deep stacks: interfaces, brand, code. Each layer refines the representation the previous one passed up." },
  { n: "04", name: "Softmax", studio: "Launch", text: "All logits collapse into one distribution: a shipped product, live campaigns, indexed pages." },
  { n: "05", name: "Backprop", studio: "Optimization", text: "Gradients flow backward. Metrics update every weight — sprints tighten CAC, lift LTV, grow organic." },
];

export const CASES = [
  {
    id: "nordpay",
    client: "NORDPAY",
    sector: "Fintech · B2B dashboard",
    blocks: ["Strategy", "Design", "Development"],
    result: "+38% trial→paid conversion",
    metrics: [["LCP", "0.9 s"], ["Trial→Paid", "+38%"], ["Churn", "−21%"]],
    img: "https://image.qwenlm.ai/generated-images/89ab4c24-b6e7-4fc7-83a9-3b89642497d4/_result.png",
    accent: "#3fd68b",
  },
  {
    id: "kovra",
    client: "KOVRA HOME",
    sector: "E-commerce · furniture",
    blocks: ["E-com dev", "Performance", "SMM"],
    result: "Revenue ×2.4 in 9 months",
    metrics: [["Revenue", "×2.4"], ["CAC", "−38%"], ["AOV", "+27%"]],
    img: "https://image.qwenlm.ai/generated-images/12c2cb57-cc29-44df-a3c1-011e255661f7/_result.png",
    accent: "#e5a45c",
  },
  {
    id: "helix",
    client: "HELIX BIO",
    sector: "Biotech · corporate + SEO",
    blocks: ["Design", "SEO", "Content"],
    result: "+312% organic traffic YoY",
    metrics: [["Organic", "+312%"], ["Top-10 keys", "1 400+"], ["Leads", "×3.3"]],
    img: "https://image.qwenlm.ai/generated-images/0d983e07-16d2-4a3d-a115-fbecf4287c17/_result.png",
    accent: "#e9c57f",
  },
];

export const SPEC_ROWS = [
  ["ARCHITECTURE", "Full-cycle studio · 7 service blocks, one pipeline"],
  ["PROCESS NODE", "Sprint framework v4.2 · 2-week iterations"],
  ["CORES", "24 in-house specialists · no subcontracting"],
  ["MEMORY", "9 years of production experience"],
  ["BUS INTERFACE", "Direct line to the team · 24/7 on critical"],
  ["CLOCK SPEED", "First deliverable within 10 business days"],
  ["COOLING", "Transparent reports, zero burnout churn"],
  ["TDP", "128 projects shipped · 96% retention"],
];

export const STATS = [
  { value: 128, suffix: "", label: "projects shipped" },
  { value: 24, suffix: "", label: "specialists in-house" },
  { value: 38, suffix: "", label: "markets covered" },
  { value: 96, suffix: "%", label: "clients stay with us" },
];

export const TICKER = ["MARKETING", "DEVELOPMENT", "SEO", "DESIGN", "SMM", "ANALYTICS", "CONTENT", "STRATEGY", "CRO", "BRANDING"];

export const LAYERS = [
  {
    id: 0,
    code: "L0",
    name: "Silicon shell",
    at: "100–125%",
    desc: "PCB · 128 SM · 24 GB VRAM — the hardware of the studio: people, process, stack.",
  },
  {
    id: 1,
    code: "L1",
    name: "Transformer core",
    at: "> 125%",
    desc: "EMBED → 4× [ATTN + FFN] → LM HEAD — the service pipeline, block by block.",
  },
  {
    id: 2,
    code: "L2",
    name: "Tensor field",
    at: "> 260%",
    desc: "Q · K · V — the craft itself. Every tensor placed by hand, every gradient earned.",
  },
] as const;
