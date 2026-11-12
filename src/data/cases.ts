/**
 * Akeel Mohammad — Featured CV Projects (mapped 1-to-1 to the 7 3D Crystals crystal0..crystal6)
 * Structured to match https://storytelling.noomoagency.com/cases/[slug] (B1pKjyE0.js)
 */

export interface CaseStudyMetric {
  label: string;
  value: string;
}

export interface CaseStudyData {
  slug: string;
  crystalId: string;
  crystalIndex: number;
  shortTitle: string;
  shortSubtitle: string;
  align: 'left' | 'right';
  scrollWindow: [number, number]; // [start, end] in 0..1 scroll progress
  titleHtml: string;
  tags: string[];
  externalLink: string;
  buttonText: string;
  videoUrl: string;
  accentColor: string;
  categoryBadge: string;
  architectureFlow: string[];
  metrics: CaseStudyMetric[];
  leadTitleHtml: string;
  paragraphs: string[];
  nextSlug: string;
  nextTitle: string;
}

export const CASE_STUDIES: CaseStudyData[] = [
  {
    slug: 'coco-care',
    crystalId: 'crystal0',
    crystalIndex: 0,
    shortTitle: 'Coco Care',
    shortSubtitle: 'AI Smart Coconut Farming',
    align: 'left',
    scrollWindow: [0.700, 0.753],
    titleHtml: 'Coco <span class="font-seasons font-semibold">Care</span> AI Platform',
    tags: [
      'Node.js & TypeScript',
      'PostgreSQL & pgvector',
      'RAG Pipeline',
      'Gemini & Groq API',
    ],
    externalLink: 'https://github.com/itspsb2/Coco-care',
    buttonText: 'GitHub Repo',
    videoUrl: 'https://storytelling.noomoagency.com/videos/cases/CoinbaseCase.mp4',
    accentColor: '#fbe1f7',
    categoryBadge: 'CRYSTAL 01 · AI & RAG SYSTEM',
    architectureFlow: [
      'CRI Research Corpus',
      'pgvector Embeddings',
      'Semantic Retrieval',
      'Gemini / Groq Synthesis',
    ],
    metrics: [
      { label: 'Knowledge Base', value: 'CRI Verified' },
      { label: 'Vector Store', value: 'PostgreSQL + pgvector' },
      { label: 'Test Coverage', value: 'Jest Automated' },
    ],
    leadTitleHtml:
      '<span class="font-seasons font-semibold text-[1.28em]">In</span> Coco Care, we engineered a domain-grounded RAG intelligence system that turns agricultural research into real-time crop diagnostics.',
    paragraphs: [
      'Coconut farmers frequently face delayed or inaccurate pest and disease identification, while generic LLMs hallucinate unverified chemical treatments. Coco Care bridges this gap with an end-to-end Retrieval-Augmented Generation (RAG) pipeline strictly grounded in official Coconut Research Institute (CRI) publications.',
      'Built on a modular Node.js, Express, and TypeScript backend, the platform indexes verified CRI agronomic literature into PostgreSQL with pgvector embeddings. When a farmer reports symptoms or uploads field observations, semantic similarity search retrieves exact diagnostic protocols before synthesizing actionable guidance through Gemini and Groq inference pipelines.',
      'Beyond individual plant diagnostics, Coco Care aggregates regional disease reports to surface early outbreak telemetry and preventive treatment schedules—validated through comprehensive Jest unit and integration test suites.',
    ],
    nextSlug: 'keeper-mobile',
    nextTitle: '<span class="font-seasons font-semibold">Ke</span>eper Mobile App',
  },
  {
    slug: 'keeper-mobile',
    crystalId: 'crystal1',
    crystalIndex: 1,
    shortTitle: 'Keeper',
    shortSubtitle: 'Digital Warranty Vault App',
    align: 'right',
    scrollWindow: [0.723, 0.769],
    titleHtml: '<span class="font-seasons font-semibold">Ke</span>eper Warranty Vault',
    tags: [
      'React Native & Expo',
      'TypeScript',
      'Supabase RLS',
      'Google ML Kit OCR',
      'Gemini API',
    ],
    externalLink:
      'https://drive.google.com/file/d/1LabhTq15Rw0PwAaAa0Yf-KuJ_Iezsjhx/view?usp=drive_link',
    buttonText: 'Project Demo',
    videoUrl: 'https://storytelling.noomoagency.com/videos/cases/SFcase.mp4',
    accentColor: '#87acfb',
    categoryBadge: 'CRYSTAL 02 · CROSS-PLATFORM MOBILE',
    architectureFlow: [
      'Camera Receipt Capture',
      'ML Kit On-Device OCR',
      'Gemini Structured Parser',
      'Supabase RLS Cloud Vault',
    ],
    metrics: [
      { label: 'Mobile Stack', value: 'React Native + TS' },
      { label: 'OCR Engine', value: 'Google ML Kit' },
      { label: 'Security', value: 'Supabase RLS + OAuth' },
    ],
    leadTitleHtml:
      '<span class="font-seasons font-semibold text-[1.28em]">In</span> Keeper, we transformed fading paper receipts into an intelligent, zero-friction mobile warranty vault.',
    paragraphs: [
      'Thermal paper receipts fade within months, leaving consumers unable to claim valid product warranties or locate serial numbers when hardware fails. Keeper eliminates manual data entry by combining on-device optical character recognition with AI extraction.',
      'Engineered with React Native, TypeScript, and Expo Router, the app captures receipt images and runs Google ML Kit OCR locally for instant text extraction. Gemini AI then parses unstructured merchant text into structured warranty records—automatically calculating expiration countdowns and scheduling proactive renewal alerts.',
      'All user documents and device inventories are protected by Supabase Row-Level Security (RLS) and Google OAuth authentication, complete with an integrated AI troubleshooting assistant that guides users through repair checks before filing a claim.',
    ],
    nextSlug: 'linux-server-monitor',
    nextTitle: 'Linux <span class="font-seasons font-semibold">Server</span> Monitor',
  },
  {
    slug: 'linux-server-monitor',
    crystalId: 'crystal2',
    crystalIndex: 2,
    shortTitle: 'Linux Monitor',
    shortSubtitle: 'Automated Health Utility',
    align: 'left',
    scrollWindow: [0.737, 0.776],
    titleHtml: 'Linux <span class="font-seasons font-semibold">Server</span> Monitor',
    tags: [
      'Linux Administration',
      'Bash Scripting',
      'System Diagnostics',
      'DevOps Automation',
    ],
    externalLink: 'https://github.com/akeelMohammad/linux-server-monitor',
    buttonText: 'GitHub Repo',
    videoUrl: 'https://storytelling.noomoagency.com/videos/cases/AiCase.mp4',
    accentColor: '#c2f9b9',
    categoryBadge: 'CRYSTAL 03 · SYSTEMS & DEVOPS',
    architectureFlow: [
      'Kernel Telemetry (top/df/free)',
      'Threshold Evaluator',
      'OK / WARN / CRIT State',
      'Audit Log Persistence',
    ],
    metrics: [
      { label: 'Runtime Overhead', value: 'Zero Dependencies' },
      { label: 'Telemetry', value: 'CPU · RAM · Disk · Load' },
      { label: 'Alerting', value: '3-Tier Severity' },
    ],
    leadTitleHtml:
      '<span class="font-seasons font-semibold text-[1.28em]">In</span> Linux Server Monitor, we built a zero-dependency Bash diagnostic engine for instant infrastructure visibility.',
    paragraphs: [
      'Production Linux nodes often require immediate health verification without the memory footprint of heavyweight monitoring agents. Linux Server Monitor provides a self-contained Bash utility that inspects core kernel and hardware telemetry in milliseconds.',
      'By orchestrating native POSIX utilities (`top`, `free`, `df`, `uptime`, and `/proc` streams), the script evaluates real-time CPU load averages, memory saturation, swap pressure, and filesystem capacity against configurable operational thresholds.',
      'Each diagnostic run classifies subsystem health into deterministic states (`OK`, `WARNING`, `CRITICAL`), outputting color-coded operator summaries alongside persistent, timestamped audit logs ready for cron automation and incident forensics.',
    ],
    nextSlug: 'keeper-ui-ux',
    nextTitle: 'Keeper <span class="font-seasons font-semibold">UI/UX</span> Study',
  },
  {
    slug: 'keeper-ui-ux',
    crystalId: 'crystal3',
    crystalIndex: 3,
    shortTitle: 'Keeper UI/UX',
    shortSubtitle: 'Smart Vault Design Study',
    align: 'right',
    scrollWindow: [0.753, 0.783],
    titleHtml: 'Keeper <span class="font-seasons font-semibold">UI/UX</span> Study',
    tags: [
      'UI/UX Design',
      'Figma Design System',
      'Information Architecture',
      'Interactive Prototyping',
    ],
    externalLink: 'https://www.behance.net/gallery/255438483/Keeper',
    buttonText: 'Behance Study',
    videoUrl: 'https://storytelling.noomoagency.com/videos/cases/VogueCase.mp4',
    accentColor: '#ffafba',
    categoryBadge: 'CRYSTAL 04 · PRODUCT DESIGN SYSTEM',
    architectureFlow: [
      'User Research & IA',
      '3-Tap Capture Flow',
      'High-Contrast Token System',
      'Interactive Figma Prototype',
    ],
    metrics: [
      { label: 'Core User Flow', value: 'Under 10 Seconds' },
      { label: 'Design Tooling', value: 'Figma Auto-Layout' },
      { label: 'Visual Language', value: 'Tactile Dark Vault' },
    ],
    leadTitleHtml:
      '<span class="font-seasons font-semibold text-[1.28em]">In</span> the Keeper UI/UX Case Study, we distilled complex warranty tracking into a calm, three-step visual story.',
    paragraphs: [
      'Managing household warranties typically feels like administrative paperwork. Our design goal for Keeper was to replace cluttered forms with a tactile, high-trust visual vault where warranty urgency is understood at a single glance.',
      'Through user journey mapping and information architecture in Figma, we structured the entire mobile experience around three core micro-interactions: one-tap camera scanning, real-time OCR field verification, and color-coded expiry rings.',
      'The resulting Figma component library established strict typographic hierarchy, accessible contrast tokens, and spring-physics transitions that directly accelerated the React Native engineering implementation.',
    ],
    nextSlug: 'lumosense-iot',
    nextTitle: 'Lumo<span class="font-seasons font-semibold">Sense</span> IoT Lamp',
  },
  {
    slug: 'lumosense-iot',
    crystalId: 'crystal4',
    crystalIndex: 4,
    shortTitle: 'LumoSense',
    shortSubtitle: 'IoT Smart Study Lamp',
    align: 'left',
    scrollWindow: [0.760, 0.799],
    titleHtml: 'Lumo<span class="font-seasons font-semibold">Sense</span> IoT Lamp',
    tags: [
      'Embedded Systems',
      'Arduino C/C++',
      'Ultrasonic & LDR Sensors',
      'Closed-Loop PWM',
    ],
    externalLink:
      'https://drive.google.com/file/d/1vl6lmmu0ZdxkU6TJbH6Bbx-ygaml02o6/view?usp=sharing',
    buttonText: 'View Project',
    videoUrl: 'https://storytelling.noomoagency.com/videos/cases/LabsCase.mp4',
    accentColor: '#cbdd99',
    categoryBadge: 'CRYSTAL 05 · EMBEDDED IOT HARDWARE',
    architectureFlow: [
      'LDR + Ultrasonic Array',
      'Arduino Control Loop',
      'Smoothing Filter',
      'PWM LED + Posture Alert',
    ],
    metrics: [
      { label: 'Controller', value: 'Arduino Microcontroller' },
      { label: 'Sensing', value: 'LDR + HC-SR04 Ultrasonic' },
      { label: 'Actuation', value: '256-Step PWM Dimming' },
    ],
    leadTitleHtml:
      '<span class="font-seasons font-semibold text-[1.28em]">In</span> LumoSense, we fused ambient light sensing and ultrasonic ergonomics into an adaptive smart study lamp.',
    paragraphs: [
      'Long study sessions under static desk lighting cause both visual fatigue and poor sitting posture. LumoSense was engineered as an autonomous hardware companion that continuously adapts to both the room environment and the user.',
      'Using an Arduino microcontroller, the system samples ambient lux levels via an LDR photoresistor array while simultaneously measuring the user’s head-to-desk distance with an HC-SR04 ultrasonic transceiver.',
      'A real-time closed-loop control algorithm applies signal smoothing to drive flicker-free PWM LED brightness—automatically compensating for dimming daylight while triggering gentle ergonomic alerts whenever the user slouches too close to the desk.',
    ],
    nextSlug: 'firefox-focus-ux',
    nextTitle: 'Firefox <span class="font-seasons font-semibold">Focus</span> UX Audit',
  },
  {
    slug: 'firefox-focus-ux',
    crystalId: 'crystal5',
    crystalIndex: 5,
    shortTitle: 'Firefox Focus',
    shortSubtitle: 'Heuristic UX Evaluation',
    align: 'right',
    scrollWindow: [0.776, 0.814],
    titleHtml: 'Firefox <span class="font-seasons font-semibold">Focus</span> UX Audit',
    tags: [
      'Human-Computer Interaction',
      'Nielsen’s 10 Heuristics',
      'Severity Rating',
      'Figma Redesign',
    ],
    externalLink:
      'https://drive.google.com/file/d/1UjWvSY4XlCh3jQ5AJwmojrh8o42BPIHC/view?usp=sharing',
    buttonText: 'UX Report',
    videoUrl: 'https://storytelling.noomoagency.com/videos/cases/ValentimeCase.mp4',
    accentColor: '#b2d8ff',
    categoryBadge: 'CRYSTAL 06 · HCI & USABILITY RESEARCH',
    architectureFlow: [
      'Task Flow Inspection',
      'Nielsen 10 Heuristics',
      'Severity Matrix (0–4)',
      'High-Fidelity Redesign',
    ],
    metrics: [
      { label: 'Framework', value: 'Nielsen’s 10 Heuristics' },
      { label: 'Focus Area', value: 'Privacy & Session Erase' },
      { label: 'Deliverable', value: 'Redesign Prototype' },
    ],
    leadTitleHtml:
      '<span class="font-seasons font-semibold text-[1.28em]">In</span> our Firefox Focus UX Audit, we evaluated mobile privacy workflows through Jakob Nielsen’s 10 Usability Heuristics.',
    paragraphs: [
      'Privacy-first mobile browsers must balance ultra-fast ephemeral browsing with clear system status and error prevention. We conducted a rigorous Human-Computer Interaction (HCI) evaluation of Mozilla’s Firefox Focus mobile application.',
      'Every core user flow—from single-tap session erasure and tracker-blocking shields to multi-tab switching—was audited against Jakob Nielsen’s 10 Usability Heuristics and assigned quantitative severity scores.',
      'To resolve critical friction points around irreversible session deletion and hidden tab states, we designed high-fidelity Figma improvements that enhance user control and visibility without compromising single-tap speed.',
    ],
    nextSlug: 'boc-smart-banking',
    nextTitle: 'BOC <span class="font-seasons font-semibold">Smart</span> Banking',
  },
  {
    slug: 'boc-smart-banking',
    crystalId: 'crystal6',
    crystalIndex: 6,
    shortTitle: 'BOC Banking',
    shortSubtitle: 'Online Banking Redesign',
    align: 'left',
    scrollWindow: [0.783, 0.823],
    titleHtml: 'BOC <span class="font-seasons font-semibold">Smart</span> Banking',
    tags: [
      'FinTech UI/UX',
      'Figma Design System',
      'Multilingual Accessibility',
      'Banking Workflows',
    ],
    externalLink:
      'https://app.notion.com/p/CASE-STUDY-BOC-Smart-Online-Banking-Redesign-31e5303070b5808bb54fd51c6d2200ae',
    buttonText: 'Case Study',
    videoUrl: 'https://storytelling.noomoagency.com/videos/cases/AMDcase.mp4',
    accentColor: '#ffc9a9',
    categoryBadge: 'CRYSTAL 07 · FINTECH UX & ACCESSIBILITY',
    architectureFlow: [
      'Branch Trainee Insights',
      'Card-Based Hierarchy',
      '3-Language Accessibility',
      'Streamlined Transfers',
    ],
    metrics: [
      { label: 'Domain Context', value: 'BOC Banking Trainee' },
      { label: 'Accessibility', value: 'EN · SI · TA Inclusive' },
      { label: 'Architecture', value: 'Modular Card System' },
    ],
    leadTitleHtml:
      '<span class="font-seasons font-semibold text-[1.28em]">In</span> BOC Smart Banking, we drew on real branch operations experience to reimagine Sri Lanka’s digital banking interface.',
    paragraphs: [
      'Informed directly by six months of hands-on customer service and digital onboarding experience as a Banking Trainee at Bank of Ceylon, this case study addresses the exact friction points everyday citizens face in legacy online banking portals.',
      'We restructured dense, table-heavy account views into an intuitive, card-based visual hierarchy that surfaces account balances, quick fund transfers, and utility bill payments with minimal cognitive load.',
      'The design system embeds trilingual typography support (English, Sinhala, and Tamil), high-contrast accessibility compliance, and subtle Sri Lankan heritage motifs—honoring institutional trust while delivering modern fintech clarity.',
    ],
    nextSlug: 'coco-care',
    nextTitle: 'Coco <span class="font-seasons font-semibold">Care</span> AI Platform',
  },
];

export function getCaseBySlug(slug: string): CaseStudyData | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

export function getActiveCaseAtScroll(progress: number): CaseStudyData | undefined {
  let best: CaseStudyData | undefined;
  let bestDist = Infinity;
  for (const c of CASE_STUDIES) {
    if (progress >= c.scrollWindow[0] && progress <= c.scrollWindow[1]) {
      const mid = (c.scrollWindow[0] + c.scrollWindow[1]) / 2;
      const dist = Math.abs(progress - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = c;
      }
    }
  }
  return best;
}
