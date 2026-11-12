import React from 'react';
import { soundManager } from '../utils/audio';
import { assetUrl } from '../utils/assetUrl';

interface FooterProps {
  opacity: number;
}

export const Footer: React.FC<FooterProps> = ({ opacity }) => {
  return (
    <footer
      id="footer"
      className="fixed inset-0 w-full h-screen z-20 flex flex-col justify-between py-[4vh] sm:py-[6vh] px-[4vw] pointer-events-none transition-opacity duration-500 ease-out overflow-hidden"
      style={{
        opacity,
        pointerEvents: opacity > 0.4 ? 'auto' : 'none',
      }}
    >
      <div />

      {/* Main Center Message & Logo */}
      <div className="flex flex-col items-center text-center">
        <p className="fluid-body-lg text-white/80 font-normal">
          Open to Software Engineering, Cloud &amp; UI/UX opportunities
        </p>

        {/* Glowing AM Logo Emblem */}
        <div
          className="relative my-[2vh] sm:my-[3vh] w-full flex items-center justify-center text-white"
          style={{ height: 'clamp(3.2rem, 8vh, 7rem)' }}
        >
          <img
            alt="AM Logo Glow"
            src={assetUrl('/images/logoAmFullLight.png')}
            className="absolute h-full w-auto filter blur-2xl opacity-60 pointer-events-none"
          />
          <img
            alt="AM Logo"
            src={assetUrl('/images/logoAmFullLight.png')}
            className="relative h-full w-auto transition-transform duration-500 hover:scale-105 object-contain"
          />
        </div>

        {/* Contact Email Link */}
        <a
          href="mailto:a.h.akeelmohammad@gmail.com"
          onMouseEnter={() => soundManager.playHover()}
          className="text-white font-normal tracking-tight hover:text-purple-300 transition-colors duration-300 cursor-pointer whitespace-nowrap"
          style={{ fontSize: 'clamp(1rem, min(3.5vw, 4.5vh), 3.25rem)' }}
        >
          a.h.akeelmohammad@gmail.com
        </a>

        <div
          className="mt-[2vh] flex flex-wrap items-center justify-center text-white/75 gap-x-3 gap-y-1"
          style={{
            fontSize: 'clamp(0.68rem, 1.2vw, 1.12rem)',
          }}
        >
          <a
            href="tel:+94761104270"
            onMouseEnter={() => soundManager.playHover()}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            (+94) 76 110 4270
          </a>
        </div>
      </div>

      {/* Social Links Bar */}
      <div
        className="flex flex-col sm:flex-row justify-between items-center text-white/70 gap-2 sm:gap-0"
        style={{ fontSize: 'clamp(0.7rem, 1.15vw, 1.05rem)' }}
      >
        <div
          className="uppercase tracking-widest text-white/40 whitespace-nowrap order-2 sm:order-1"
          style={{ fontSize: 'clamp(0.55rem, 0.85vw, 0.78rem)' }}
        >
          © {new Date().getFullYear()} Akeel Mohammad
        </div>

        <div
          className="flex items-center whitespace-nowrap order-1 sm:order-2"
          style={{ gap: 'clamp(1rem, 2.5vw, 2.25rem)' }}
        >
          <a
            href="https://github.com/akeelMohammad"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => soundManager.playHover()}
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/akeel-mohammad-li"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => soundManager.playHover()}
            className="hover:text-white transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://www.behance.net/gallery/255438483/Keeper"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => soundManager.playHover()}
            className="hover:text-white transition-colors"
          >
            Behance
          </a>
        </div>

      </div>
    </footer>
  );
};
