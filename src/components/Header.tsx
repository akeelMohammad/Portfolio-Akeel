import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';

export type SectionId = 'about' | 'experience' | 'skills' | 'projects' | 'contact';

interface HeaderProps {
  theme: 'light' | 'dark';
  currentSection?: SectionId | null;
  onNavigateSection: (section: SectionId) => void;
  onGoHome: () => void;
}

interface NavItem {
  id: SectionId;
  label: string;
}

const NAV_SECTIONS: NavItem[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export const Header: React.FC<HeaderProps> = ({
  theme,
  currentSection,
  onNavigateSection,
  onGoHome,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.muted);
  const [isHoverLogo, setIsHoverLogo] = useState(false);
  const [pulseColor, setPulseColor] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return soundManager.subscribe((muted) => setIsMuted(muted));
  }, []);

  const handleToggleSound = () => {
    const colors = ['#FB5959', '#41B8FF', '#52D273', '#F7C948', '#B388FF'];
    setPulseColor(colors[Math.floor(Math.random() * colors.length)]);
    setTimeout(() => setPulseColor(null), 900);
    soundManager.toggleSound();
    setIsMuted(soundManager.muted);
  };

  const isDark = theme === 'dark';

  const handleSectionClick = (sectionId: SectionId) => {
    soundManager.playHover();
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header
      className="fixed z-40 w-full top-0 transition-colors duration-500"
      style={{ paddingTop: 'clamp(0.75rem, 2vh, 1.8rem)' }}
    >
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-[4vw]">
        {/* Brand Logo + Name */}
        <a
          href="/"
          aria-label="Akeel Mohammad"
          onClick={(e) => {
            e.preventDefault();
            soundManager.playHover();
            setMobileMenuOpen(false);
            onGoHome();
          }}
          onMouseEnter={() => {
            setIsHoverLogo(true);
            soundManager.playHover();
          }}
          onMouseLeave={() => setIsHoverLogo(false)}
          className="relative flex items-center py-1.5 cursor-pointer transition-transform duration-300 hover:scale-105 shrink-0 whitespace-nowrap"
          style={{ gap: 'clamp(0.45rem, 1vw, 0.85rem)' }}
        >
          <div
            className={`relative flex items-center justify-center shrink-0 transition-transform duration-300 ${
              isHoverLogo ? 'scale-105' : ''
            }`}
            style={{
              width: 'clamp(2.2rem, 3.6vw, 3.4rem)',
              height: 'clamp(1.1rem, 1.8vw, 1.65rem)',
            }}
          >
            <img
              alt="AM Logo"
              src={isDark ? '/images/logoAmLight.png' : '/images/logoAmDark.png'}
              className="h-full w-auto object-contain transition-opacity duration-300"
            />
          </div>
          <span
            className={`font-normal tracking-tight transition-colors duration-300 whitespace-nowrap ${
              isDark ? 'text-white' : 'text-[#020612]'
            }`}
            style={{ fontSize: 'clamp(0.85rem, 1.35vw, 1.25rem)' }}
          >
            Akeel Mohammad
          </span>
        </a>

        {/* Section Links Navigation & Controls */}
        <div
          className="flex items-center shrink-0"
          style={{ gap: 'clamp(0.75rem, 2vw, 2.5rem)' }}
        >
          {/* Desktop & Tablet Section Links (Previous clean floating design style) */}
          <nav
            className="hidden md:flex items-center"
            style={{ gap: 'clamp(1rem, 2vw, 2.25rem)' }}
            aria-label="Main Navigation"
          >
            {NAV_SECTIONS.map((section) => {
              const isActive = currentSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  onMouseEnter={() => soundManager.playHover()}
                  className={`group relative py-1 font-normal tracking-tight cursor-pointer transition-opacity duration-300 whitespace-nowrap ${
                    isActive
                      ? isDark
                        ? 'text-white opacity-100 font-medium'
                        : 'text-[#020612] opacity-100 font-medium'
                      : isDark
                      ? 'text-white opacity-70 hover:opacity-100'
                      : 'text-[#020612] opacity-70 hover:opacity-100'
                  }`}
                  style={{ fontSize: 'clamp(0.82rem, 1.05vw, 0.98rem)' }}
                >
                  <span>{section.label}</span>
                  {isActive && (
                    <span
                      className={`absolute -bottom-1 left-0 right-0 h-[1.5px] rounded-full transition-all duration-300 ${
                        isDark ? 'bg-white' : 'bg-[#020612]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Links (< md:) */}
          <div
            className="flex md:hidden items-center"
            style={{ gap: 'clamp(0.75rem, 2.5vw, 1.25rem)' }}
          >
            <button
              onClick={() => handleSectionClick('contact')}
              onMouseEnter={() => soundManager.playHover()}
              className={`text-xs sm:text-sm font-normal tracking-tight transition-opacity duration-300 cursor-pointer ${
                isDark ? 'text-white opacity-80 hover:opacity-100' : 'text-[#020612] opacity-80 hover:opacity-100'
              }`}
            >
              Contact
            </button>
            <button
              onClick={() => {
                soundManager.playHover();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label="Toggle All Sections"
              className={`text-xs sm:text-sm font-normal tracking-tight transition-opacity duration-300 cursor-pointer ${
                isDark ? 'text-white opacity-60 hover:opacity-100' : 'text-[#020612] opacity-60 hover:opacity-100'
              }`}
            >
              {mobileMenuOpen ? 'Close' : '•••'}
            </button>
          </div>

          {/* Circular Sound Button with Rotating Border SVG */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Enable Sound' : 'Mute Sound'}
            onMouseEnter={() => soundManager.playHover()}
            className="group relative rounded-full flex items-center justify-center cursor-pointer overflow-hidden bg-white/15 backdrop-blur-md transition-transform duration-300 hover:scale-105 shrink-0"
            style={{
              width: 'clamp(2.1rem, 3vw, 2.75rem)',
              height: 'clamp(2.1rem, 3vw, 2.75rem)',
            }}
          >
            <img
              alt="sound border"
              src="/images/svg/soundBorder.svg"
              className={`
                absolute inset-0.5 w-[calc(100%-4px)] h-[calc(100%-4px)] object-contain transition-transform duration-500 group-hover:rotate-180
                ${isDark ? '' : 'invert opacity-70'}
              `}
            />

            {pulseColor && (
              <span
                className="absolute inset-0 rounded-full animate-ping pointer-events-none"
                style={{
                  borderColor: pulseColor,
                  backgroundColor: `${pulseColor}33`,
                  borderWidth: '1px',
                }}
              />
            )}

            <div className="relative z-10 flex flex-col gap-[2px] items-center">
              <div className="flex gap-[2px] h-2.5 items-end">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className={`w-[2px] transition-all duration-300 ${
                      isDark ? 'bg-white' : 'bg-[#020612]'
                    }`}
                    style={{
                      height: isMuted ? '0px' : `${idx % 2 === 0 ? 5 : 9}px`,
                      animation: !isMuted
                        ? `soundWave 0.9s ease-in-out ${idx * 0.15}s infinite alternate`
                        : 'none',
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-[2px]">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className={`w-[2px] h-[2px] ${
                      isDark ? 'bg-white' : 'bg-[#020612]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu (clean minimalist typography) */}
      {mobileMenuOpen && (
        <div className="md:hidden px-[4vw] pt-2">
          <div
            className={`w-full rounded-2xl p-4 flex flex-col gap-2 backdrop-blur-2xl border transition-all duration-300 shadow-2xl ${
              isDark
                ? 'bg-[#020612]/92 border-white/15 text-white'
                : 'bg-white/92 border-black/10 text-[#020612]'
            }`}
          >
            {NAV_SECTIONS.map((section) => {
              const isActive = currentSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full flex items-center justify-between py-2 text-sm tracking-tight transition-colors text-left cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'font-medium text-white'
                        : 'font-medium text-[#020612]'
                      : isDark
                      ? 'text-white/70 hover:text-white'
                      : 'text-[#020612]/70 hover:text-[#020612]'
                  }`}
                >
                  <span>{section.label}</span>
                  {isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-[#020612]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
