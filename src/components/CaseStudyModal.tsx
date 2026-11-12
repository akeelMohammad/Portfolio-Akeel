import React, { useEffect, useRef, useState } from 'react';
import { CaseStudyData } from '../data/cases';
import { soundManager } from '../utils/audio';
import { assetUrl } from '../utils/assetUrl';

interface CaseStudyModalProps {
  caseData: CaseStudyData;
  onClose: () => void;
  onSelectCase: (slug: string) => void;
}

/**
 * Exact replica of https://storytelling.noomoagency.com/cases/[slug] (B1pKjyE0.js & _slug_.DjiABMH0.css)
 * - Crystalline Frost / Ice Transition (iceTransition: 0.92 -> 0.12 on entry, 0.12 -> 0.82 scrubbed on scroll,
 *   and -> 1 on Next Project / Back to All projects) using /textures/ice.jpg, /textures/icen.jpg, /textures/iced.jpg
 * - CasesHero: full-viewport hero with project-specific crystalline architecture showcase + Title +
 *   .cases-text-line + star-prefixed tags + ViewCaseButton (.view-case-button with .gradient-1, .gradient-2,
 *   .bb, /images/svg/newStar.svg)
 * - CasesTexts & CasesNextPrev: two-column editorial storytelling layout (lg:flex-row lg:gap-[100px]) with
 *   "In {Project Name}, ..." lead heading and multi-paragraph narrative + bottom navigation with .nav-button,
 *   59x59 glass circle (.gradient-1, .gradient-2, .bb, rotating /images/svg/cursor_border.svg .border-circle,
 *   /images/svg/backArrowNew.svg), and expanding .cases-text-line-prev / .cases-text-line-next.
 */
export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  caseData,
  onClose,
  onSelectCase,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Matches App.settings.iceTransition in B1pKjyE0.js:
  // Starts at 0.92 frost on entry, eases to 0.12 in hero, scrubs 0.12 -> 0.82 on scroll
  const [iceTransition, setIceTransition] = useState(0.92);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);

  // Entry ice crystallization transition (0.92 -> 0.12)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTop = 0;
    }
    setScrollProgress(0);
    setIceTransition(0.92);
    setIsTransitioningOut(false);

    const timer = window.setTimeout(() => {
      setIceTransition(0.12);
    }, 60);

    return () => window.clearTimeout(timer);
  }, [caseData.slug]);

  // Scroll listener matching B1pKjyE0.js:
  // v = scrollTop / maxScroll; r = v * 0.7 + 0.1; iceTransition = r; vignette translateY(${w * 3}vh)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isTransitioningOut) return;
    const el = e.currentTarget;
    const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
    const v = Math.min(1, Math.max(0, el.scrollTop / maxScroll));
    setScrollProgress(v);
    setIceTransition(0.12 + v * 0.7);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const nx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    const ny = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    setPointerOffset({ x: nx, y: ny });
  };

  // Matches goBack() in B1pKjyE0.js: gsap.to(X.settings, { iceTransition: 1, duration: 0.45 }) then navigate('/')
  const handleBackToProjects = () => {
    soundManager.playHover();
    setIsTransitioningOut(true);
    setIceTransition(1);
    window.setTimeout(() => {
      onClose();
    }, 280);
  };

  // Matches nextProject() in B1pKjyE0.js: gsap.to(X.settings, { iceTransition: 1, duration: 0.45 }) then navigate(nextSlug)
  const handleNextProject = () => {
    soundManager.playRelease();
    setIsTransitioningOut(true);
    setIceTransition(1);
    window.setTimeout(() => {
      onSelectCase(caseData.nextSlug);
    }, 280);
  };

  // Scroll-linked bottom vignette translation matching `translateY(${w * 3}vh)` in B1pKjyE0.js
  const vignetteTranslateVh = (1 - Math.min(1, scrollProgress * 1.3)) * 18;

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-30 overflow-y-auto overflow-x-hidden bg-[#020612] text-white select-none"
      data-testid="case-study-view"
    >
      {/* Top Navbar Readability Shield so scrolled narrative text never collides with fixed Header */}
      <div
        className="fixed top-0 inset-x-0 h-24 pointer-events-none z-30"
        style={{
          background:
            'linear-gradient(180deg, #020612 0%, rgba(2,6,18,0.85) 55%, rgba(2,6,18,0) 100%)',
        }}
      />

      {/* Fixed Crystalline Ice Refraction Backdrop (matches App.settings.iceTransition in CbdjwYMp.js) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ambient Crystalline Glow Orbs tuned to project's exact crystal hover palette */}
        <div
          className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-[58vw] h-[44vh] rounded-full blur-[130px] opacity-35 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${caseData.accentColor} 0%, #5746d9 52%, transparent 100%)`,
            transform: `translate3d(${(pointerOffset.x * -18).toFixed(1)}px, ${(
              pointerOffset.y * -18
            ).toFixed(1)}px, 0)`,
          }}
        />

        {/* Faceted Crystal Normal Texture Backdrop (/textures/crystals/{idx}.jpg) */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-screen transition-transform duration-700"
          style={{
            backgroundImage: `url(${assetUrl(`/textures/crystals/${caseData.crystalIndex}.jpg`)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(1.08) translate3d(${(pointerOffset.x * -10).toFixed(1)}px, ${(
              pointerOffset.y * -10
            ).toFixed(1)}px, 0)`,
          }}
        />

        {/* Crystalline Ice Texture Refraction Overlay (/textures/ice.jpg) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 mix-blend-screen"
          style={{
            opacity: Math.min(0.88, iceTransition * 0.82),
            backgroundImage: `url(${assetUrl('/textures/ice.jpg')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${(1.02 + iceTransition * 0.08).toFixed(3)}) translate3d(${(
              pointerOffset.x * 16
            ).toFixed(1)}px, ${(pointerOffset.y * 16).toFixed(1)}px, 0)`,
            filter: `blur(${(iceTransition * 5).toFixed(1)}px) contrast(1.15)`,
          }}
        />

        {/* Secondary Crystalline Frost Displacement Sheen (/textures/iced.jpg) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 mix-blend-overlay"
          style={{
            opacity: Math.min(0.6, iceTransition * 0.55),
            backgroundImage: `url(${assetUrl('/textures/iced.jpg')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Deep Midnight Blue Atmospheric Vignette matching #020612 */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 34%, rgba(2,6,18,${(
              0.2 +
              scrollProgress * 0.65
            ).toFixed(2)}) 0%, rgba(2,6,18,0.88) 78%, #020612 100%)`,
          }}
        />
      </div>

      {/* SECTION 1: CasesHero (Full-viewport hero with Project Architecture Showcase + Title + Tags + ViewCaseButton) */}
      <div className="min-h-[100svh] relative z-10 flex flex-col justify-between pt-[13vh] pb-[6vh] lg:pb-[84px]">
        {/* Upper Hero: Project-Specific Architecture Showcase Card */}
        <div
          className="w-full max-w-[1440px] mx-auto px-[5vw] lg:px-[108px] flex justify-center"
        >
          <div
            className="w-full max-w-[1060px] rounded-[28px] border border-white/40 bg-white/20 backdrop-blur-2xl p-[clamp(1.25rem,2.4vw,2.25rem)] shadow-[0_30px_100px_rgba(255,255,255,0.18)]"
          >
            {/* Top Bar: Crystal Badge & Metrics */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-[1.8vh] border-b border-white/25">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: caseData.accentColor,
                    boxShadow: `0 0 14px ${caseData.accentColor}`,
                  }}
                />
                <span
                  className="uppercase tracking-[0.22em] text-white/90 font-medium whitespace-nowrap"
                  style={{ fontSize: 'clamp(0.65rem, 0.92vw, 0.82rem)' }}
                >
                  {caseData.categoryBadge}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-[clamp(0.85rem,2vw,2rem)]">
                {caseData.metrics.map((m, idx) => (
                  <div key={idx} className="text-right whitespace-nowrap">
                    <span
                      className="block text-white/70 uppercase tracking-wider"
                      style={{ fontSize: 'clamp(0.55rem, 0.75vw, 0.68rem)' }}
                    >
                      {m.label}
                    </span>
                    <span
                      className="font-medium text-white"
                      style={{ fontSize: 'clamp(0.78rem, 1.05vw, 0.95rem)' }}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Architecture Pipeline Nodes */}
            <div className="mt-[2.2vh] grid grid-cols-2 sm:grid-cols-4 gap-[clamp(0.5rem,1.2vw,1.15rem)]">
              {caseData.architectureFlow.map((node, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md px-[clamp(0.7rem,1.3vw,1.2rem)] py-[clamp(0.8rem,1.5vw,1.25rem)] flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-seasons font-semibold text-white/70"
                      style={{ fontSize: 'clamp(0.82rem, 1.15vw, 1.05rem)' }}
                    >
                      0{i + 1}
                    </span>
                    <img
                      alt=""
                      src={assetUrl('/images/svg/tagsStar.svg')}
                      className="w-2.5 h-2.5 opacity-80"
                    />
                  </div>
                  <p
                    className="text-white font-normal leading-snug"
                    style={{ fontSize: 'clamp(0.75rem, 1.08vw, 0.98rem)' }}
                  >
                    {node}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Hero: Title, .cases-text-line, Star Tags, and ViewCaseButton (exact structure from B1pKjyE0.js) */}
        <div className="w-full max-w-[1440px] mx-auto px-[5vw] lg:px-[108px] flex items-end">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-end gap-4 sm:gap-[3vw] relative">
            <div className="w-full sm:max-w-[70vw]">
              <h1
                className="text-white font-normal leading-[1.08] tracking-tight"
                style={{ fontSize: 'clamp(1.75rem, min(4.4vw, 5vh), 4.0625rem)' }}
                dangerouslySetInnerHTML={{ __html: caseData.titleHtml }}
              />

              <div className="cases-text-line my-[1.8vh] sm:my-[2.2vh] lg:my-[28px]" />

              <div
                className="tags flex flex-wrap items-center"
                style={{ gap: 'clamp(0.6rem, 1.8vw, 2.5rem)' }}
              >
                {caseData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-white/95 flex items-center gap-[8px] sm:gap-[10px] whitespace-nowrap"
                    style={{ fontSize: 'clamp(0.72rem, 1.15vw, 1.125rem)' }}
                  >
                    <img
                      alt="star"
                      src={assetUrl('/images/svg/tagsStar.svg')}
                      className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] object-contain shrink-0"
                    />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Exact ViewCaseButton from B1pKjyE0.js */}
            <div className="shrink-0 w-full sm:w-auto flex sm:block justify-start sm:justify-end">
              <a
                href={caseData.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => soundManager.playHover()}
                className="view-case-button relative bg-white/25 rounded-full h-[44px] sm:h-[46px] flex items-center justify-center px-5 sm:px-6 cursor-pointer whitespace-nowrap"
              >
                <div className="gradient-1 rounded-full" />
                <div className="gradient-2 rounded-full" />
                <img
                  alt="star"
                  src={assetUrl('/images/svg/newStar.svg')}
                  className="mr-[6px] w-[14px] h-[14px] relative z-10"
                />
                <div
                  className="relative z-10 text-white whitespace-nowrap"
                  style={{ fontSize: 'clamp(0.85rem, 1.1vw, 1.125rem)' }}
                >
                  <span className="font-seasons font-semibold mr-1">View</span>
                  <span>{caseData.buttonText}</span>
                </div>
                <div className="bb" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: CasesTexts + CasesNextPrev (Full-viewport second screen with zero Header overlap) */}
      <div className="min-h-[100svh] relative z-20 flex flex-col justify-between pt-[130px] pb-[65px]">
        {/* CasesTexts (Exact 2-column editorial storytelling layout from B1pKjyE0.js) */}
        <div className="cases-text w-full">
          <div className="wrapper max-w-[1440px] mx-auto flex flex-col lg:flex-row justify-center items-start px-[5vw] lg:pl-[170px] lg:pr-[170px] gap-[4vh] lg:gap-[100px]">
            <h2
              className="w-full lg:max-w-[457px] text-white font-normal leading-[1.16]"
              style={{ fontSize: 'clamp(1.45rem, 2.55vw, 2.5rem)' }}
              dangerouslySetInnerHTML={{ __html: caseData.leadTitleHtml }}
            />
            <div
              className="desc w-full lg:max-w-[465px] text-white/90 font-light leading-[1.52]"
              style={{ fontSize: 'clamp(0.95rem, 1.25vw, 1.25rem)' }}
            >
              {caseData.paragraphs.map((paragraph, idx) => (
                <p key={idx} className={idx > 0 ? 'mt-4' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* CasesNextPrev (Exact bottom crystal navigation from B1pKjyE0.js) */}
        <div className="next-prev-cases w-full pt-[4vh]">
          <div className="wrapper max-w-[1440px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-end justify-between px-[5vw] lg:px-[178px] gap-5 sm:gap-0">
            {/* Left: Back to All projects */}
            <button
              type="button"
              onClick={handleBackToProjects}
              onMouseEnter={() => soundManager.playHover()}
              data-testid="case-back-button"
              className="flex items-center cursor-pointer nav-button text-left bg-transparent border-0 text-white"
            >
              <div className="mobile-prev relative mr-[14px] sm:mr-[18px] bg-white/25 rounded-full flex items-center justify-center w-[46px] h-[46px] sm:w-[59px] sm:h-[59px] shrink-0">
                <div className="gradient-1 rounded-full" />
                <div className="gradient-2 rounded-full" />
                <img
                  alt="circle"
                  src={assetUrl('/images/svg/cursor_border.svg')}
                  className="w-[38px] h-[38px] sm:w-[51px] sm:h-[51px] absolute top-1 left-1 object-contain border-circle"
                />
                <img
                  alt="Back arrow"
                  src={assetUrl('/images/svg/backArrowNew.svg')}
                  className="rotate-180 relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5"
                />
                <div className="bb" />
              </div>
              <div className="whitespace-nowrap">
                <p
                  className="mb-0.5 sm:mb-1 text-white/75"
                  style={{ fontSize: 'clamp(0.7rem, 0.9vw, 0.875rem)' }}
                >
                  Back to
                </p>
                <p
                  className="leading-none text-white"
                  style={{ fontSize: 'clamp(1.1rem, 2vw, 2.1875rem)' }}
                >
                  All <span className="font-seasons font-semibold">projects</span>
                </p>
                <div className="cases-text-line-prev mt-1.5 sm:mt-2" />
              </div>
            </button>

            {/* Right: Next Project */}
            <button
              type="button"
              onClick={handleNextProject}
              onMouseEnter={() => soundManager.playHover()}
              data-testid="case-next-button"
              className="flex items-center justify-end sm:justify-start cursor-pointer nav-button text-right bg-transparent border-0 text-white"
            >
              <div className="whitespace-nowrap">
                <p
                  className="mb-0.5 sm:mb-1 text-white/75"
                  style={{ fontSize: 'clamp(0.7rem, 0.9vw, 0.875rem)' }}
                >
                  Next Project
                </p>
                <p
                  className="leading-none text-white"
                  style={{ fontSize: 'clamp(1.1rem, 2vw, 2.1875rem)' }}
                  dangerouslySetInnerHTML={{ __html: caseData.nextTitle }}
                />
                <div className="cases-text-line-next mt-1.5 sm:mt-2 ml-auto" />
              </div>
              <div className="mobile-next relative ml-[14px] sm:ml-[18px] bg-white/25 rounded-full flex items-center justify-center w-[46px] h-[46px] sm:w-[59px] sm:h-[59px] shrink-0">
                <div className="gradient-1 rounded-full" />
                <div className="gradient-2 rounded-full" />
                <img
                  alt="circle"
                  src={assetUrl('/images/svg/cursor_border.svg')}
                  className="w-[38px] h-[38px] sm:w-[51px] sm:h-[51px] absolute top-1 left-1 object-contain border-circle"
                />
                <img
                  alt="Next arrow"
                  src={assetUrl('/images/svg/backArrowNew.svg')}
                  className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5"
                />
                <div className="bb" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll-driven bottom vignette matching .vignette-bottom-safari in B1pKjyE0.js */}
      <div
        className="vignette-bottom-safari"
        style={{
          transform: `translateY(${vignetteTranslateVh.toFixed(2)}vh)`,
        }}
      />
    </div>
  );
};
