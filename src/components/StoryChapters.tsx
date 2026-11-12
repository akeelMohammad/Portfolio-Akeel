import React from 'react';
import { CASE_STUDIES, CaseStudyData } from '../data/cases';
import { soundManager } from '../utils/audio';
import { getCumulativeVh, TOTAL_DESKTOP_VH, clamp } from '../utils/math';

export interface CrystalScreenPos {
  x: number; // 0..1 screen normalized
  y: number; // 0..1 screen normalized (bottom=0, top=1 in NDC*0.5+0.5)
  visible: boolean;
}

interface StoryChaptersProps {
  scrollProgress: number; // 0 to 1
  onInteractiveTrigger?: (mode: string) => void;
  onSelectCase?: (slug: string) => void;
  onHoverCase?: (caseItem: CaseStudyData | null) => void;
  crystalPositions?: Record<string, CrystalScreenPos>;
}

const e = (k: number) => getCumulativeVh(k, false);

export const StoryChapters: React.FC<StoryChaptersProps> = ({
  scrollProgress,
  onInteractiveTrigger,
  onSelectCase,
  onHoverCase,
  crystalPositions,
}) => {
  const currentVh = scrollProgress * TOTAL_DESKTOP_VH;

  /**
   * Exact GSAP ScrollTrigger scrub math from HomeComponentsSmallTextNew / HomeComponentsBigTextNew
   * in storytelling.noomoagency.com (FZFS71Nt.js):
   * - Each character/item (.char / .ic) animates with stagger:
   *   from { opacity: 0, scale: isFromScale ? 0 : 1.3, filter: "blur(8px)" }
   *   to   { opacity: 1, scale: 1, filter: "blur(0px)" } over [scrollStart..scrollEnd]
   *   and back to { opacity: 0, scale: 1.3, filter: "blur(8px)" } over [scrollStart2..scrollEnd2].
   */
  const isWindowActive = (
    scrollStart: number,
    scrollEnd: number,
    scrollStart2: number,
    scrollEnd2: number
  ) => {
    const minVh = Math.min(scrollStart, scrollStart2);
    const maxVh = Math.max(scrollEnd, scrollEnd2);
    return currentVh >= minVh && currentVh <= maxVh;
  };

  const getStaggeredItemStyle = (
    idx: number,
    total: number,
    scrollStart: number,
    scrollEnd: number,
    scrollStart2: number,
    scrollEnd2: number,
    isFromScale = false
  ): React.CSSProperties => {
    if (!isWindowActive(scrollStart, scrollEnd, scrollStart2, scrollEnd2)) {
      return {
        opacity: 0,
        transform: isFromScale ? 'scaleX(0)' : 'scale(1.3)',
        filter: 'blur(8px)',
      };
    }

    const staggerRatio = total > 1 ? idx / (total - 1) : 0;
    const staggerWeight = 0.45; // Matches stagger: 0.05 across characters/tokens

    // Fade-in scrub [scrollStart .. scrollEnd]
    let tIn = 1;
    if (currentVh < scrollEnd) {
      const rawIn = clamp(
        (currentVh - scrollStart) / Math.max(1, scrollEnd - scrollStart),
        0,
        1
      );
      tIn = clamp(
        (rawIn * (1 + staggerWeight) - staggerRatio * staggerWeight) / 1,
        0,
        1
      );
    }

    // Fade-out scrub [scrollStart2 .. scrollEnd2]
    let tOut = 0;
    if (currentVh > scrollStart2) {
      const rawOut = clamp(
        (currentVh - scrollStart2) / Math.max(1, scrollEnd2 - scrollStart2),
        0,
        1
      );
      tOut = clamp(
        (rawOut * (1 + staggerWeight) - staggerRatio * staggerWeight) / 1,
        0,
        1
      );
    }

    const visibility = clamp(Math.min(tIn, 1 - tOut), 0, 1);
    const blur = (1 - visibility) * 8;

    if (isFromScale) {
      return {
        opacity: visibility,
        transform: `scaleX(${visibility.toFixed(3)})`,
        filter: blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : 'blur(0px)',
      };
    }

    const scale = 1 + (1 - visibility) * 0.3; // 1.3 -> 1.0 -> 1.3
    return {
      display: 'inline-block',
      opacity: visibility,
      transform: `scale(${scale.toFixed(3)})`,
      filter: blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : 'blur(0px)',
    };
  };

  /**
   * Renders a string with character-by-character staggered scale(1.3 -> 1.0) + blur(8px -> 0px)
   * exactly like SplitType({ type: "chars" }) in SmallTextNew / BigTextNew (FZFS71Nt.js).
   */
  const renderStaggeredText = (
    text: string,
    offsetIdx: number,
    totalChars: number,
    scrollStart: number,
    scrollEnd: number,
    scrollStart2: number,
    scrollEnd2: number,
    extraClassName = ''
  ) => {
    const chars = text.split('');
    return chars.map((ch, i) => (
      <span
        key={offsetIdx + i}
        className={extraClassName}
        style={getStaggeredItemStyle(
          offsetIdx + i,
          totalChars,
          scrollStart,
          scrollEnd,
          scrollStart2,
          scrollEnd2,
          false
        )}
      >
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    ));
  };

  /**
   * Exact HomeComponentsLinesText math from FZFS71Nt.js (used for the 4 Feather Certification
   * blocks and the 7 Crystal Project blocks):
   * - Parent translates from y: 0 to y: -toTop vh over [scrollStart2..scrollEnd2].
   * - Each line (.line) staggers in over [scrollStart..scrollEnd] from
   *   { opacity: 0, scale: isFromScale ? 0 : 1.05, filter: "blur(8px)" } to { opacity: 1, scale: 1, filter: "blur(0px)" }.
   */
  const getLinesParentStyle = (
    scrollStart: number,
    scrollEnd: number,
    scrollStart2: number,
    scrollEnd2: number,
    toTop = 52
  ): React.CSSProperties => {
    if (!isWindowActive(scrollStart, scrollEnd, scrollStart2, scrollEnd2)) {
      return {
        display: 'none',
        opacity: 0,
        pointerEvents: 'none',
      };
    }
    const slideProgress = clamp(
      (currentVh - scrollStart2) / Math.max(1, scrollEnd2 - scrollStart2),
      0,
      1
    );
    const yVh = -slideProgress * toTop;
    // Fade out cleanly well below the top header / section title zone (top 0..25vh)
    const exitFade =
      toTop === 0
        ? 1 - slideProgress
        : slideProgress > 0.62
          ? clamp((1 - slideProgress) / 0.38, 0, 1)
          : 1;
    return {
      display: 'flex',
      opacity: exitFade,
      transform: `translateY(${yVh.toFixed(2)}vh)`,
      pointerEvents: exitFade > 0.35 ? 'auto' : 'none',
    };
  };

  const getLineItemStyle = (
    lineIdx: number,
    totalLines: number,
    scrollStart: number,
    scrollEnd: number,
    isFromScale = false
  ): React.CSSProperties => {
    const rawIn = clamp(
      (currentVh - scrollStart) / Math.max(1, scrollEnd - scrollStart),
      0,
      1
    );
    const staggerRatio = totalLines > 1 ? lineIdx / (totalLines - 1) : 0;
    const staggerWeight = 0.35;
    const tIn = clamp(
      rawIn * (1 + staggerWeight) - staggerRatio * staggerWeight,
      0,
      1
    );
    const blur = (1 - tIn) * 8;
    if (isFromScale) {
      return {
        opacity: tIn,
        transform: `scaleX(${tIn.toFixed(3)})`,
        filter: blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : 'blur(0px)',
      };
    }
    const scale = 1 + (1 - tIn) * 0.05; // 1.05 -> 1.0 (exact LinesText scale in FZFS71Nt.js)
    return {
      opacity: tIn,
      transform: `scale(${scale.toFixed(3)})`,
      filter: blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : 'blur(0px)',
    };
  };

  // Exact 4 Feather Certification blocks (scrolled with the Feather at e(11)+60..e(11)+510, toTop: 52)
  const featherCertifications = [
    {
      align: 'right' as const,
      titlePrefix: 'The Linux ',
      titleItalic: 'Foundation',
      lines: [
        'LFS101: Introduction to Linux',
        'LFS169: Introduction to GitOps',
        'Linux System Administration',
        'Cloud-Native & GitOps Workflows',
      ],
      scrollStart: e(11) + 60,
      scrollEnd: e(11) + 110,
      scrollStart2: e(11) + 60,
      scrollEnd2: e(11) + 240,
      toTop: 52,
    },
    {
      align: 'left' as const,
      titlePrefix: 'IBM & ',
      titleItalic: 'Containers',
      lines: [
        'Docker Essentials: Developer Intro',
        'Containerized Application Delivery',
        'Microservices & Image Optimization',
        'DevOps Automation & Deployment',
      ],
      scrollStart: e(11) + 150,
      scrollEnd: e(11) + 200,
      scrollStart2: e(11) + 150,
      scrollEnd2: e(11) + 330,
      toTop: 52,
    },
    {
      align: 'right' as const,
      titlePrefix: 'University of ',
      titleItalic: 'Moratuwa',
      lines: [
        'Server-Side Web Programming',
        'Front-End Web Development',
        'Python Programming Certification',
        'Foundations of Project Management',
      ],
      scrollStart: e(11) + 240,
      scrollEnd: e(11) + 290,
      scrollStart2: e(11) + 240,
      scrollEnd2: e(11) + 420,
      toTop: 52,
    },
    {
      align: 'left' as const,
      titlePrefix: 'IFS, Microsoft ',
      titleItalic: '& AI',
      lines: [
        'IFS: Beyond Code Software Program',
        'Microsoft Imagine Cup: Git & GitHub',
        'Prompt Engineering with GitHub Copilot',
        'Rotaract PR Head · IEEE & ICTS USJ',
      ],
      scrollStart: e(11) + 330,
      scrollEnd: e(11) + 380,
      scrollStart2: e(11) + 330,
      scrollEnd2: e(11) + 510,
      toTop: 52,
    },
  ];

  // Exact 7 Crystal Project windows synchronized with project0..project6 in cam.glb (t=17.17..17.70)
  const crystalWindows: Array<[number, number]> = [
    [e(16) + 185, e(16) + 440], // crystal0 (t=17.17..17.40): Coco Care
    [e(16) + 295, e(16) + 515], // crystal1 (t=17.27..17.47): Keeper Mobile
    [e(16) + 360, e(16) + 550], // crystal2 (t=17.33..17.50): Linux Server Monitor
    [e(16) + 440, e(16) + 585], // crystal3 (t=17.40..17.53): Keeper UI/UX
    [e(16) + 475, e(16) + 660], // crystal4 (t=17.43..17.60): LumoSense IoT
    [e(16) + 550, e(16) + 735], // crystal5 (t=17.50..17.67): Firefox Focus UX
    [e(16) + 585, e(16) + 775], // crystal6 (t=17.53..17.70): BOC Smart Banking
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
      {/* 1. Profile Summary (e(0)-50..e(0)+100 -> e(1)..e(1)+150) */}
      {isWindowActive(e(0) - 50, e(0) + 100, e(1), e(1) + 150) && (
        <div className="absolute text-center px-[4vw] whitespace-nowrap">
          <span
            className="text-line half mx-auto w-[42vw] max-w-[300px] my-[0.8vh]"
            style={getStaggeredItemStyle(1, 38, e(0) - 50, e(0) + 100, e(1), e(1) + 150, true)}
          />
          <p className="fluid-title-xl font-normal text-[#020612] whitespace-nowrap">
            {renderStaggeredText(
              'Software Engineering',
              2,
              38,
              e(0) - 50,
              e(0) + 100,
              e(1),
              e(1) + 150
            )}
            <br />
            <span className="relative z-10 whitespace-nowrap">
              {renderStaggeredText(
                'Undergraduate & ',
                22,
                38,
                e(0) - 50,
                e(0) + 100,
                e(1),
                e(1) + 150
              )}
              <i
                className="font-seasons"
                style={{ fontSize: 'clamp(1.9rem, 4.8vw, 4.5rem)' }}
              >
                {renderStaggeredText(
                  'Builder',
                  30,
                  38,
                  e(0) - 50,
                  e(0) + 100,
                  e(1),
                  e(1) + 150
                )}
              </i>
            </span>
          </p>
          <span
            className="text-line half mx-auto w-[55vw] max-w-[412px] mt-[1.2vh]"
            style={getStaggeredItemStyle(37, 38, e(0) - 50, e(0) + 100, e(1), e(1) + 150, true)}
          />
        </div>
      )}

      {/* 2. Education (e(1)+100..e(1)+220 -> e(2)+70..e(2)+200) */}
      {isWindowActive(e(1) + 100, e(1) + 220, e(2) + 70, e(2) + 200) && (
        <div className="absolute right-[4vw] sm:right-[8vw] top-[20vh] sm:top-[26vh] text-right whitespace-nowrap">
          <div className="fluid-title-lg font-normal text-[#020612]">
            <span className="inline-block mr-[2vw] sm:mr-[6vw]">
              {renderStaggeredText(
                'Education',
                0,
                45,
                e(1) + 100,
                e(1) + 220,
                e(2) + 70,
                e(2) + 200
              )}
            </span>
            <br />
            <span
              className="text-line half ml-auto w-[34vw] max-w-[230px] my-[0.6vh]"
              style={getStaggeredItemStyle(
                9,
                45,
                e(1) + 100,
                e(1) + 220,
                e(2) + 70,
                e(2) + 200,
                true
              )}
            />
            <span className="inline-block mr-[1.5vw] sm:mr-[3vw]">
              {renderStaggeredText(
                'BICT (Hons) ',
                10,
                45,
                e(1) + 100,
                e(1) + 220,
                e(2) + 70,
                e(2) + 200
              )}
              <i
                className="font-seasons"
                style={{ fontSize: 'clamp(1.2rem, min(3.4vw, 4vh), 3.3rem)' }}
              >
                {renderStaggeredText(
                  'Software',
                  20,
                  45,
                  e(1) + 100,
                  e(1) + 220,
                  e(2) + 70,
                  e(2) + 200
                )}
              </i>
            </span>
            <br />
            <span
              className="text-line half ml-auto w-[44vw] max-w-[340px] my-[0.6vh]"
              style={getStaggeredItemStyle(
                28,
                45,
                e(1) + 100,
                e(1) + 220,
                e(2) + 70,
                e(2) + 200,
                true
              )}
            />
            <span className="fluid-body-sm text-[#020612]/80 block">
              {renderStaggeredText(
                'Univ. of Sri Jayewardenepura · 2024–Present',
                29,
                45,
                e(1) + 100,
                e(1) + 220,
                e(2) + 70,
                e(2) + 200
              )}
            </span>
            <span
              className="text-line half ml-auto w-[48vw] max-w-[400px] my-[0.6vh]"
              style={getStaggeredItemStyle(
                36,
                45,
                e(1) + 100,
                e(1) + 220,
                e(2) + 70,
                e(2) + 200,
                true
              )}
            />
            <span className="inline-block mr-[4vw]">
              {renderStaggeredText(
                'Diploma in ',
                37,
                45,
                e(1) + 100,
                e(1) + 220,
                e(2) + 70,
                e(2) + 200
              )}
              <i
                className="font-seasons"
                style={{ fontSize: 'clamp(1.45rem, 3.6vw, 3.3rem)' }}
              >
                {renderStaggeredText(
                  'HRM · UoC',
                  41,
                  45,
                  e(1) + 100,
                  e(1) + 220,
                  e(2) + 70,
                  e(2) + 200
                )}
              </i>
            </span>
          </div>
        </div>
      )}

      {/* 3. Work Experience — Parallel Crystal Prisms (e(2)+150..e(2)+300 -> e(3)+150..e(3)+300) */}
      {isWindowActive(e(2) + 150, e(2) + 300, e(3) + 150, e(3) + 300) && (
        <div
          className="absolute text-center w-[92vw] max-w-[1060px] whitespace-nowrap"
          data-testid="industry-experience-section"
        >
          <p
            className="whitespace-nowrap font-seasons leading-none tracking-tight mb-[2.4vh] text-[#020612]"
            style={{ fontSize: 'clamp(2.4rem, 6.8vw, 6.2rem)' }}
          >
            <i
              className="inline mr-[1.2vw] text-[#020612]/80 align-top font-neoris not-italic"
              style={{ fontSize: 'clamp(1.1rem, 2.5vw, 2.3rem)' }}
            >
              {renderStaggeredText(
                'Industry',
                0,
                22,
                e(2) + 150,
                e(2) + 300,
                e(3) + 150,
                e(3) + 300
              )}
            </i>
            <span className="inline-block">
              {renderStaggeredText(
                'experience.',
                8,
                22,
                e(2) + 150,
                e(2) + 300,
                e(3) + 150,
                e(3) + 300,
                'gradient-text drop-shadow-[0_4px_16px_rgba(39,44,78,0.25)]'
              )}
            </span>
          </p>

          {/* Two Parallel Rectangle Cards in Glassy Theme standing side-by-side next to each other */}
          <div
            className="grid grid-cols-2 items-stretch justify-items-center w-full max-w-[940px] mx-auto"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 'clamp(0.6rem, 2.4vw, 2.2rem)',
            }}
          >
            {/* Left Glassy Showcase Card: Software Intern — Axperia Information Systems */}
            <div
              data-testid="industry-crystal-left"
              className="relative flex flex-col justify-between text-left cursor-default select-none w-full rounded-2xl md:rounded-3xl border border-white/40 bg-white/35 backdrop-blur-xl shadow-[0_20px_50px_rgba(39,44,78,0.18)] transition-all duration-500 overflow-hidden"
              style={{
                ...getStaggeredItemStyle(
                  19,
                  22,
                  e(2) + 150,
                  e(2) + 300,
                  e(3) + 150,
                  e(3) + 300
                ),
                padding: 'clamp(0.85rem, 2vw, 2rem)',
                minHeight: 'clamp(8.5rem, 18vh, 14.5rem)',
              }}
            >
              {/* Glass surface specular reflection & subtle gradient highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-white/5 pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#fbe1f7]/50 rounded-full blur-2xl pointer-events-none" />

              {/* Header: Date Badge with star accent */}
              <div className="relative z-10 flex items-center justify-between mb-1.5">
                <span
                  className="inline-flex items-center gap-1 sm:gap-1.5 uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#020612]/70 font-medium whitespace-nowrap bg-white/40 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/50"
                  style={{ fontSize: 'clamp(0.5rem, 0.8vw, 0.78rem)' }}
                >
                  <img
                    alt=""
                    src="/images/svg/tagsStar.svg"
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 object-contain opacity-75 shrink-0"
                  />
                  <span>Jan 2026 – Oct 2026</span>
                </span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#fbe1f7] shadow-[0_0_8px_#fbe1f7] shrink-0" />
              </div>

              {/* Body: Role Title */}
              <div className="relative z-10 my-auto">
                <p
                  className="text-[#020612] font-normal leading-[1.12] whitespace-nowrap"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  Software{' '}
                  <i
                    className="font-seasons text-[#020612]/90"
                    style={{ fontSize: 'clamp(1.1rem, 2.4vw, 2.3rem)' }}
                  >
                    Intern
                  </i>
                </p>
                <div className="h-[1px] w-full bg-gradient-to-r from-[#020612]/20 via-white to-transparent my-1.5 sm:my-2.5" />
                <p
                  className="text-[#020612]/80 font-normal whitespace-normal line-clamp-2 leading-snug"
                  style={{ fontSize: 'clamp(0.68rem, 1.1vw, 1.05rem)' }}
                >
                  Axperia Information Systems
                </p>
              </div>

              {/* Footer Showcase Info */}
              <div className="relative z-10 flex items-center justify-between pt-1">
                <span
                  className="text-[#020612]/50 text-xs tracking-wider uppercase"
                  style={{ fontSize: 'clamp(0.48rem, 0.7vw, 0.7rem)' }}
                >
                  Enterprise Software Engineering
                </span>
              </div>
            </div>

            {/* Right Glassy Showcase Card: Banking Trainee — Bank of Ceylon */}
            <div
              data-testid="industry-crystal-right"
              className="relative flex flex-col justify-between text-left cursor-default select-none w-full rounded-2xl md:rounded-3xl border border-white/40 bg-white/35 backdrop-blur-xl shadow-[0_20px_50px_rgba(39,44,78,0.18)] transition-all duration-500 overflow-hidden"
              style={{
                ...getStaggeredItemStyle(
                  21,
                  22,
                  e(2) + 150,
                  e(2) + 300,
                  e(3) + 150,
                  e(3) + 300
                ),
                padding: 'clamp(0.85rem, 2vw, 2rem)',
                minHeight: 'clamp(8.5rem, 18vh, 14.5rem)',
              }}
            >
              {/* Glass surface specular reflection & subtle gradient highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-white/5 pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#87acfb]/40 rounded-full blur-2xl pointer-events-none" />

              {/* Header: Date Badge with star accent (blue dot removed) */}
              <div className="relative z-10 flex items-center justify-start mb-1.5">
                <span
                  className="inline-flex items-center gap-1 sm:gap-1.5 uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#020612]/70 font-medium whitespace-nowrap bg-white/40 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/50"
                  style={{ fontSize: 'clamp(0.5rem, 0.8vw, 0.78rem)' }}
                >
                  <img
                    alt=""
                    src="/images/svg/tagsStar.svg"
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 object-contain opacity-75 shrink-0"
                  />
                  <span>Feb 2024 – Aug 2024</span>
                </span>
              </div>

              {/* Body: Role Title */}
              <div className="relative z-10 my-auto">
                <p
                  className="text-[#020612] font-normal leading-[1.12] whitespace-nowrap"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  Banking{' '}
                  <i
                    className="font-seasons text-[#020612]/90"
                    style={{ fontSize: 'clamp(1.1rem, 2.4vw, 2.3rem)' }}
                  >
                    Trainee
                  </i>
                </p>
                <div className="h-[1px] w-full bg-gradient-to-r from-[#020612]/20 via-white to-transparent my-1.5 sm:my-2.5" />
                <p
                  className="text-[#020612]/80 font-normal whitespace-normal line-clamp-2 leading-snug"
                  style={{ fontSize: 'clamp(0.68rem, 1.1vw, 1.05rem)' }}
                >
                  Bank of Ceylon
                </p>
              </div>

              {/* Footer Showcase Info */}
              <div className="relative z-10 flex items-center justify-between pt-1">
                <span
                  className="text-[#020612]/50 text-xs tracking-wider uppercase"
                  style={{ fontSize: 'clamp(0.48rem, 0.7vw, 0.7rem)' }}
                >
                  Financial Operations
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Core Skills & Pillars Intro (e(3)+250..e(3)+400 -> e(5)..e(5)+100) */}
      {isWindowActive(e(3) + 250, e(3) + 400, e(5), e(5) + 100) && (
        <div className="absolute text-center px-[4vw] whitespace-nowrap">
          <span
            className="text-line half mx-auto w-[45vw] max-w-[320px] mb-[0.8vh]"
            style={getStaggeredItemStyle(1, 26, e(3) + 250, e(3) + 400, e(5), e(5) + 100, true)}
          />
          <p className="fluid-title-xl font-normal text-[#020612] whitespace-nowrap">
            <i
              className="font-seasons"
              style={{ fontSize: 'clamp(1.9rem, 4.7vw, 4.4rem)' }}
            >
              {renderStaggeredText(
                'Systems ',
                2,
                26,
                e(3) + 250,
                e(3) + 400,
                e(5),
                e(5) + 100
              )}
            </i>
            {renderStaggeredText(
              'engineered through',
              10,
              26,
              e(3) + 250,
              e(3) + 400,
              e(5),
              e(5) + 100
            )}
          </p>
          <span
            className="text-line half mx-auto w-[55vw] max-w-[400px] mt-[0.8vh]"
            style={getStaggeredItemStyle(25, 26, e(3) + 250, e(3) + 400, e(5), e(5) + 100, true)}
          />
        </div>
      )}

      {/* 5. Code (e(5)+50..e(5)+120 -> e(5)+270..e(5)+340) */}
      {isWindowActive(e(5) + 50, e(5) + 120, e(5) + 270, e(5) + 340) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-center cursor-pointer whitespace-nowrap pointer-events-auto select-none p-4 overflow-visible"
            onClick={() => {
              soundManager.playHover();
              onInteractiveTrigger?.('light');
            }}
            onMouseEnter={() => soundManager.playHover()}
          >
            <p className="font-seasons text-white tracking-tighter gradient-text-big hover:scale-105 transition-transform duration-300 overflow-visible">
              {renderStaggeredText(
                'Code',
                0,
                4,
                e(5) + 50,
                e(5) + 120,
                e(5) + 270,
                e(5) + 340,
                'gradient-text'
              )}
            </p>
          </div>
        </div>
      )}

      {/* 6. Cloud (e(6)-190..e(6)-120 -> e(6)-20..e(6)+50) */}
      {isWindowActive(e(6) - 190, e(6) - 120, e(6) - 20, e(6) + 50) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-center cursor-pointer whitespace-nowrap pointer-events-auto select-none p-4 overflow-visible"
            onClick={() => {
              soundManager.playRelease();
              onInteractiveTrigger?.('spirit');
            }}
            onMouseEnter={() => soundManager.playHover()}
          >
            <p className="font-seasons text-white tracking-tighter gradient-text-big hover:scale-105 transition-transform duration-300 overflow-visible">
              {renderStaggeredText(
                'Cloud',
                0,
                5,
                e(6) - 190,
                e(6) - 120,
                e(6) - 20,
                e(6) + 50,
                'gradient-text'
              )}
            </p>
          </div>
        </div>
      )}

      {/* 7. Design (e(6)+30..e(6)+100 -> e(6)+200..e(6)+270) */}
      {isWindowActive(e(6) + 30, e(6) + 100, e(6) + 200, e(6) + 270) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-center cursor-pointer whitespace-nowrap pointer-events-auto select-none p-4 overflow-visible"
            onClick={() => {
              soundManager.toggleSound();
              onInteractiveTrigger?.('sound');
            }}
            onMouseEnter={() => soundManager.playHover()}
          >
            <p className="font-seasons text-white tracking-tighter gradient-text-big hover:scale-105 transition-transform duration-300 overflow-visible">
              {renderStaggeredText(
                'Design',
                0,
                6,
                e(6) + 30,
                e(6) + 100,
                e(6) + 200,
                e(6) + 270,
                'gradient-text'
              )}
            </p>
          </div>
        </div>
      )}

      {/* 8. Technical Arsenal Summary on Dark Transition (e(10)-100..e(10)-30 -> e(10)+50..e(10)+170) */}
      {isWindowActive(e(10) - 100, e(10) - 30, e(10) + 50, e(10) + 170) && (
        <div className="absolute top-[8vh] text-center px-[4vw] whitespace-nowrap">
          <p className="fluid-title-lg text-white font-normal whitespace-nowrap">
            {renderStaggeredText(
              'Python · Java · TypeScript · JavaScript',
              1,
              46,
              e(10) - 100,
              e(10) - 30,
              e(10) + 50,
              e(10) + 170
            )}
            <br />
            <span
              className="text-line dark mx-auto w-[38vw] max-w-[280px] my-[0.5vh]"
              style={getStaggeredItemStyle(
                24,
                46,
                e(10) - 100,
                e(10) - 30,
                e(10) + 50,
                e(10) + 170,
                true
              )}
            />
            {renderStaggeredText(
              'React · Next.js · Node.js · Express',
              25,
              46,
              e(10) - 100,
              e(10) - 30,
              e(10) + 50,
              e(10) + 170
            )}
            <br />
            <span
              className="text-line dark mx-auto w-[35vw] max-w-[260px] my-[0.5vh]"
              style={getStaggeredItemStyle(
                34,
                46,
                e(10) - 100,
                e(10) - 30,
                e(10) + 50,
                e(10) + 170,
                true
              )}
            />
            {renderStaggeredText(
              'PostgreSQL · Linux · Docker · Git · Tailwind · Figma & AI',
              35,
              46,
              e(10) - 100,
              e(10) - 30,
              e(10) + 50,
              e(10) + 170
            )}
          </p>
        </div>
      )}

      {/* 9. Feather Section Header: Certifications & Achievements (e(10)+150..e(10)+250 -> e(11)+220..e(11)+420) */}
      <div
        className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center px-[4vw] whitespace-nowrap"
        style={getLinesParentStyle(
          e(10) + 150,
          e(10) + 240,
          e(11) + 430,
          e(11) + 510,
          0
        )}
      >
        <div className="text-white">
          <p
            className="fluid-body-lg text-white/90 mb-[0.3vh]"
            style={getLineItemStyle(1, 3, e(10) + 150, e(10) + 250)}
          >
            Verified Industry Credentials
          </p>
          <p
            className="fluid-title-xl text-white font-normal"
            style={getLineItemStyle(2, 3, e(10) + 150, e(10) + 250)}
          >
            <i
              className="font-seasons"
              style={{ fontSize: 'clamp(1.85rem, 4.6vw, 4.3rem)' }}
            >
              Certifications
            </i>{' '}
            &amp; Achievements
          </p>
        </div>
      </div>

      {/* 10–13. The 4 Certification Blocks Scrolled with the Feather (exact LinesText from FZFS71Nt.js) */}
      {featherCertifications.map((cert, blockIdx) => {
        const isRight = cert.align === 'right';
        return (
          <div
            key={blockIdx}
            className={`absolute bottom-[4vh] whitespace-nowrap ${
              isRight ? 'right-[5vw] text-left' : 'left-[5vw] text-right'
            }`}
            style={getLinesParentStyle(
              cert.scrollStart,
              cert.scrollEnd,
              cert.scrollStart2,
              cert.scrollEnd2,
              cert.toTop
            )}
          >
            <div className="text-white">
              {/* Line 0: Certification Issuer Title */}
              <div
                className="fluid-title-md font-normal text-white"
                style={getLineItemStyle(0, 6, cert.scrollStart, cert.scrollEnd)}
              >
                <span>{cert.titlePrefix}</span>
                <i
                  className="font-seasons"
                  style={{ fontSize: 'clamp(1.2rem, 2.8vw, 2.5rem)' }}
                >
                  {cert.titleItalic}
                </i>
              </div>

              {/* Line 1: Expanding Horizontal Divider (.from-scale) */}
              <span
                className={`text-line dark my-[1.2vh] w-[42vw] max-w-[380px] ${
                  isRight ? '' : 'ml-auto'
                }`}
                style={getLineItemStyle(
                  1,
                  6,
                  cert.scrollStart,
                  cert.scrollEnd,
                  true
                )}
              />

              {/* Lines 2..5: Individual Certifications with Noomo's exact .lines-text-gradient */}
              {cert.lines.map((lineText, lineIdx) => (
                <div
                  key={lineIdx}
                  className={`fluid-body-lg ${
                    isRight ? 'lines-text-gradient' : 'lines-text-gradient-left'
                  }`}
                  style={getLineItemStyle(
                    lineIdx + 2,
                    6,
                    cert.scrollStart,
                    cert.scrollEnd
                  )}
                >
                  {lineText}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* 14. Crystal Projects Header (e(15)+40..e(15)+130 -> e(16)+710..e(16)+790) */}
      <div
        className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center px-[4vw] whitespace-nowrap"
        style={getLinesParentStyle(
          e(15) + 40,
          e(15) + 130,
          e(16) + 710,
          e(16) + 790,
          0
        )}
      >
        <div className="text-white">
          <p
            className="fluid-title-xl text-white font-normal"
            style={getLineItemStyle(0, 2, e(15) + 40, e(15) + 130)}
          >
            Where{' '}
            <i
              className="font-seasons"
              style={{ fontSize: 'clamp(1.85rem, 4.6vw, 4.3rem)' }}
            >
              projects
            </i>
          </p>
          <p
            className="fluid-title-lg text-white/90 -mt-[0.5vh]"
            style={getLineItemStyle(1, 2, e(15) + 40, e(15) + 130)}
          >
            crystallize into experiences
          </p>
        </div>
      </div>

      {/* 7 Interactive Crystal Project Labels (synchronized with project0..project6 in cam.glb) */}
      {CASE_STUDIES.map((cs, idx) => {
        const [wStart, wEnd] = crystalWindows[idx] || [e(16) + 185, e(16) + 440];
        if (!isWindowActive(wStart, wStart + 35, wStart, wEnd)) return null;

        const isLeft = cs.align === 'left';
        const parentStyle = getLinesParentStyle(wStart, wStart + 35, wStart, wEnd, 54);

        return (
          <div
            key={cs.slug}
            data-testid={`crystal-label-${cs.slug}`}
            style={parentStyle}
            onClick={() => {
              soundManager.playRelease();
              onSelectCase?.(cs.slug);
            }}
            onMouseEnter={() => {
              soundManager.playHover();
              onHoverCase?.(cs);
            }}
            onMouseLeave={() => onHoverCase?.(null)}
            className={`absolute bottom-[4vh] cursor-pointer group whitespace-nowrap ${
              isLeft
                ? 'left-[5vw] sm:left-[12vw] lg:left-[18vw] text-left'
                : 'right-[5vw] sm:right-[12vw] lg:right-[18vw] text-right'
            }`}
          >
            {/* Exact Noomo CaseHover / LinesText crystal project markup with #272c4e blur-[80px] rounded-[100%] aura */}
            <span
              className={`flex flex-col relative ${
                isLeft ? 'items-start' : 'items-end'
              }`}
            >
              <span
                className="text-white font-normal whitespace-nowrap relative z-10 group-hover:text-purple-200 transition-colors"
                style={{
                  fontSize: 'clamp(1.35rem, min(3.4vw, 4.2vh), 3.125rem)',
                  lineHeight: 1.1,
                  ...getLineItemStyle(0, 2, wStart, wStart + 35),
                }}
              >
                {cs.shortTitle}
              </span>
              <span
                className="text-white/90 relative z-10 whitespace-nowrap"
                style={{
                  fontSize: 'clamp(0.75rem, min(1.2vw, 1.8vh), 1.125rem)',
                  ...getLineItemStyle(1, 2, wStart, wStart + 35),
                }}
              >
                {cs.shortSubtitle}
              </span>
              <span className="absolute block w-full blur-[80px] h-[151px] bg-[#272c4e] rounded-[100%] group-hover:bg-purple-500/50 transition-colors -z-10 pointer-events-none" />
            </span>
          </div>
        );
      })}

      {/* 15. Closing Spark (e(17)-180..e(17)-90 -> e(17)-10..e(17)+60) */}
      {isWindowActive(e(17) - 180, e(17) - 90, e(17) - 10, e(17) + 60) && (
        <div className="absolute top-[14vh] text-center px-[4vw] whitespace-nowrap">
          <p className="fluid-body-lg text-white/90 font-normal whitespace-nowrap">
            {renderStaggeredText(
              'Engineering is much',
              0,
              36,
              e(17) - 180,
              e(17) - 90,
              e(17) - 10,
              e(17) + 60
            )}
            <br />
            {renderStaggeredText(
              'more than code.',
              19,
              36,
              e(17) - 180,
              e(17) - 90,
              e(17) - 10,
              e(17) + 60
            )}
          </p>
        </div>
      )}

      {/* 16. It is how a spark becomes a fire (e(17)-160..e(17)-70 -> e(17)+40..e(17)+120) */}
      {isWindowActive(e(17) - 160, e(17) - 70, e(17) + 40, e(17) + 120) && (
        <div className="absolute bottom-[14vh] text-center px-[4vw] whitespace-nowrap">
          <p className="fluid-title-xl text-white font-normal whitespace-nowrap">
            <span>
              {renderStaggeredText(
                'It is how a spark',
                0,
                34,
                e(17) - 160,
                e(17) - 70,
                e(17) + 40,
                e(17) + 120
              )}
            </span>
            <br />
            <span
              className="text-line dark mx-auto w-[65vw] max-w-[600px] my-[0.8vh]"
              style={getStaggeredItemStyle(
                17,
                34,
                e(17) - 160,
                e(17) - 70,
                e(17) + 40,
                e(17) + 120,
                true
              )}
            />
            <span>
              {renderStaggeredText(
                'becomes ',
                18,
                34,
                e(17) - 160,
                e(17) - 70,
                e(17) + 40,
                e(17) + 120
              )}
              <i
                className="font-seasons"
                style={{ fontSize: 'clamp(1.85rem, 4.6vw, 4.3rem)' }}
              >
                {renderStaggeredText(
                  'a fire.',
                  26,
                  34,
                  e(17) - 160,
                  e(17) - 70,
                  e(17) + 40,
                  e(17) + 120
                )}
              </i>
            </span>
            <span
              className="text-line dark mx-auto w-[55vw] max-w-[520px] mt-[0.8vh]"
              style={getStaggeredItemStyle(
                33,
                34,
                e(17) - 160,
                e(17) - 70,
                e(17) + 40,
                e(17) + 120,
                true
              )}
            />
          </p>
        </div>
      )}

      {/* 17. Final Callout before Contact Footer (e(17)+110..e(17)+210 -> e(17)+300..e(17)+400) */}
      {isWindowActive(e(17) + 110, e(17) + 210, e(17) + 300, e(17) + 400) && (
        <div className="absolute bottom-[10vh] text-center px-[4vw] whitespace-nowrap">
          <p className="fluid-title-xl text-white font-normal whitespace-nowrap">
            <span>
              {renderStaggeredText(
                'Ready to build, automate,',
                0,
                48,
                e(17) + 110,
                e(17) + 210,
                e(17) + 300,
                e(17) + 400
              )}
            </span>
            <br />
            <span
              className="text-line dark mx-auto w-[65vw] max-w-[620px] my-[0.8vh]"
              style={getStaggeredItemStyle(
                25,
                48,
                e(17) + 110,
                e(17) + 210,
                e(17) + 300,
                e(17) + 400,
                true
              )}
            />
            <span>
              {renderStaggeredText(
                'and ',
                26,
                48,
                e(17) + 110,
                e(17) + 210,
                e(17) + 300,
                e(17) + 400
              )}
            </span>
            <i
              className="font-seasons"
              style={{ fontSize: 'clamp(1.85rem, 4.6vw, 4.3rem)' }}
            >
              {renderStaggeredText(
                'innovate ',
                30,
                48,
                e(17) + 110,
                e(17) + 210,
                e(17) + 300,
                e(17) + 400
              )}
            </i>
            <span>
              {renderStaggeredText(
                'together.',
                39,
                48,
                e(17) + 110,
                e(17) + 210,
                e(17) + 300,
                e(17) + 400
              )}
            </span>
            <span
              className="text-line dark mx-auto w-[55vw] max-w-[540px] mt-[0.8vh]"
              style={getStaggeredItemStyle(
                47,
                48,
                e(17) + 110,
                e(17) + 210,
                e(17) + 300,
                e(17) + 400,
                true
              )}
            />
          </p>
        </div>
      )}
    </div>
  );
};
