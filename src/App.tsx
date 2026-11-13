/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhoenixCanvas } from './components/PhoenixCanvas';
import { Header, SectionId } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StoryChapters, CrystalScreenPos } from './components/StoryChapters';
import { ReimagineButton } from './components/ReimagineButton';
import { Footer } from './components/Footer';
import { Preloader } from './components/Preloader';
import { CustomCursor } from './components/CustomCursor';
import { CaseStudyModal } from './components/CaseStudyModal';
import { ContactsPage } from './components/ContactsPage';
import { getCaseBySlug, CaseStudyData } from './data/cases';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [reimagineTrigger, setReimagineTrigger] = useState(0);
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [crystalPositions, setCrystalPositions] = useState<
    Record<string, CrystalScreenPos>
  >({});

  // Page state: 'home' | 'contacts' | case slug
  const [activeCaseSlug, setActiveCaseSlug] = useState<string | null>(null);
  const [showContacts, setShowContacts] = useState(false);
  const [hoveredCase, setHoveredCase] = useState<CaseStudyData | null>(null);

  // Smooth scroll interpolation
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (activeCaseSlug || showContacts) return;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        targetProgressRef.current = Math.max(0, Math.min(1, window.scrollY / totalScroll));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    let lastTime = performance.now();
    const updateScroll = (now: number) => {
      const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        if (Math.abs(diff) > 0.08) {
          currentProgressRef.current = targetProgressRef.current;
        } else {
          const alpha = 1 - Math.exp(-dt * 12);
          currentProgressRef.current += diff * alpha;
          if (Math.abs(targetProgressRef.current - currentProgressRef.current) <= 0.0001) {
            currentProgressRef.current = targetProgressRef.current;
          }
        }
        setScrollProgress(currentProgressRef.current);
      }
      animFrameRef.current = requestAnimationFrame(updateScroll);
    };

    animFrameRef.current = requestAnimationFrame(updateScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeCaseSlug, showContacts]);

  const handleReimagine = useCallback(() => {
    setReimagineTrigger((prev) => prev + 1);
  }, []);

  const handleInteractiveTrigger = useCallback(
    (_mode: string) => {
      handleReimagine();
    },
    [handleReimagine]
  );

  const handleSelectCase = useCallback((slug: string) => {
    setHoveredCase(null);
    setShowContacts(false);
    setActiveCaseSlug(slug);
  }, []);

  const handleNavigateToSection = useCallback((section: SectionId) => {
    setHoveredCase(null);
    setActiveCaseSlug(null);
    setShowContacts(false);

    const sectionTargets: Record<SectionId, number> = {
      about: 0.042,
      experience: 0.17,
      skills: 0.30,
      projects: 0.724,
      contact: 1.0,
    };

    const targetProgress = sectionTargets[section] ?? 0;

    requestAnimationFrame(() => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const targetY = targetProgress * totalScroll;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth',
        });
        targetProgressRef.current = targetProgress;
      }
    });
  }, []);

  const handleOpenContacts = useCallback(() => {
    setHoveredCase(null);
    setActiveCaseSlug(null);
    setShowContacts(true);
  }, []);

  const handleGoHome = useCallback(() => {
    setHoveredCase(null);
    setActiveCaseSlug(null);
    setShowContacts(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    targetProgressRef.current = 0;
  }, []);

  const activeCaseData = activeCaseSlug ? getCaseBySlug(activeCaseSlug) : undefined;
  const effectiveTheme: 'light' | 'dark' =
    activeCaseData || showContacts ? 'dark' : theme;

  // Calculate opacities for home view
  const isHome = !activeCaseData && !showContacts;
  const heroOpacity = isHome ? Math.max(0, Math.min(1, 1 - scrollProgress * 28)) : 0;
  const footerOpacity = isHome ? Math.max(0, Math.min(1, (scrollProgress - 0.968) / 0.032)) : 0;
  const reimagineVisible =
    isHome && (experienceStarted || scrollProgress > 0.01) && scrollProgress < 0.96;

  // Track active section for navigation highlighting
  const currentSection: SectionId | null = !isHome
    ? null
    : scrollProgress < 0.10
    ? 'about'
    : scrollProgress < 0.24
    ? 'experience'
    : scrollProgress < 0.62
    ? 'skills'
    : scrollProgress < 0.94
    ? 'projects'
    : 'contact';

  return (
    <div
      className={`relative min-h-screen ${
        effectiveTheme === 'dark' ? 'text-white' : 'text-[#020612]'
      }`}
    >
      {/* Preloader */}
      <Preloader onStart={() => setExperienceStarted(true)} />

      {/* Custom Follower Cursor */}
      <CustomCursor hoveredCase={isHome ? hoveredCase : null} />

      {/* Keep the project view focused on its own navigation controls. */}
      {!activeCaseData && (
        <Header
          theme={effectiveTheme}
          currentSection={currentSection}
          onNavigateSection={handleNavigateToSection}
          onGoHome={handleGoHome}
          showBrand={!activeCaseData}
        />
      )}

      {/* 3D WebGL Phoenix & Crystal Canvas (driven by /timelines/cam.glb & /timelines/dev.glb) */}
      <PhoenixCanvas
        scrollProgress={scrollProgress}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        reimagineTrigger={reimagineTrigger}
        onSelectCase={handleSelectCase}
        onHoverCase={setHoveredCase}
        onCrystalPositionsChange={setCrystalPositions}
      />

      {/* Home View Overlays */}
      {isHome && (
        <>
          <HeroSection opacity={heroOpacity} />

          <StoryChapters
            scrollProgress={scrollProgress}
            onInteractiveTrigger={handleInteractiveTrigger}
            onSelectCase={handleSelectCase}
            onHoverCase={setHoveredCase}
            crystalPositions={crystalPositions}
          />

          <ReimagineButton
            onClick={handleReimagine}
            visible={reimagineVisible}
            theme={effectiveTheme}
          />

          <Footer opacity={footerOpacity} />

          {/* Shortened Scroll Height Track (1800vh vs 4920vh) preserving full 0..1 Phoenix timeline */}
          <div
            className="w-full pointer-events-none"
            style={{ height: '1800vh' }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Case Study View */}
      {activeCaseData && (
        <CaseStudyModal
          caseData={activeCaseData}
          onClose={handleGoHome}
          onSelectCase={handleSelectCase}
        />
      )}

      {/* Contacts View */}
      {showContacts && <ContactsPage onClose={handleGoHome} />}
    </div>
  );
}
