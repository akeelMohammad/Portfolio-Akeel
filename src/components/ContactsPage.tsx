import React from 'react';
import { soundManager } from '../utils/audio';
import { assetUrl } from '../utils/assetUrl';

interface ContactsPageProps {
  onClose: () => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-30 flex flex-col justify-between h-screen py-[4vh] pt-[10vh] px-[4vw] w-full bg-[#020612]/90 backdrop-blur-xl text-white transition-opacity duration-500 overflow-y-auto overflow-x-hidden"
      data-testid="contacts-page"
    >
      {/* Main Center Callout */}
      <div className="flex flex-col items-center text-center my-auto">
        <div
          className="mb-[2vh] relative w-full flex items-center justify-center"
          style={{ height: 'clamp(3rem, 7vh, 6.5rem)' }}
        >
          <img
            className="absolute blur-xl h-full w-auto opacity-60 pointer-events-none"
            alt="Phoenix emblem glow"
            src={assetUrl('/images/svg/logoSimple.svg')}
          />
          <img
            className="relative h-full w-auto"
            alt="Phoenix emblem"
            src={assetUrl('/images/svg/logoSimple.svg')}
          />
        </div>

        <p
          className="text-white text-center leading-snug"
          style={{ fontSize: 'clamp(1.15rem, 2.3vw, 2.1rem)' }}
        >
          Akeel{' '}
          <span
            className="font-seasons font-semibold text-purple-200"
            style={{ fontSize: 'clamp(1.3rem, 2.6vw, 2.35rem)' }}
          >
            Mohammad
          </span>
          <br />
          <span
            className="text-white/75"
            style={{ fontSize: 'clamp(0.75rem, 1.35vw, 1.25rem)' }}
          >
            Software Engineering · Cloud &amp; DevOps · UI/UX Design
          </span>
        </p>

        <a
          href="mailto:a.h.akeelmohammad@gmail.com"
          onMouseEnter={() => soundManager.playHover()}
          className="text-white mt-[2vh] tracking-tight hover:text-purple-200 transition-colors whitespace-nowrap"
          style={{ fontSize: 'clamp(1rem, min(3.5vw, 4.5vh), 3.25rem)' }}
        >
          a.h.akeelmohammad@gmail.com
        </a>

        <div
          className="mt-[1.6vh] flex flex-wrap items-center justify-center text-white/80 gap-x-2.5 gap-y-1"
          style={{
            fontSize: 'clamp(0.68rem, 1.15vw, 1.05rem)',
          }}
        >
          <a href="tel:+94761104270" className="hover:text-white transition-colors whitespace-nowrap">
            (+94) 76 110 4270
          </a>
        </div>

        <div
          className="mt-[2.5vh] flex items-center justify-center"
        >
          <button
            onClick={() => {
              soundManager.playHover();
              onClose();
            }}
            className="rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white/90 transition-all cursor-pointer whitespace-nowrap text-center"
            style={{
              padding: 'clamp(0.45rem, 1vh, 0.7rem) clamp(1rem, 2vw, 1.6rem)',
              fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)',
            }}
          >
            ← Back to Experience
          </button>
        </div>
      </div>

      {/* Bottom Socials */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 pt-2">
        <div
          className="text-white/40 whitespace-nowrap order-2 sm:order-1"
          style={{ fontSize: 'clamp(0.6rem, 0.9vw, 0.85rem)' }}
        >
          Akeel Mohammad — Digital Portfolio
        </div>
        <div
          className="flex justify-center sm:justify-end whitespace-nowrap order-1 sm:order-2"
          style={{ gap: 'clamp(1rem, 2.4vw, 2.5rem)' }}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/akeelMohammad"
            onMouseEnter={() => soundManager.playHover()}
            className="text-white opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontSize: 'clamp(0.72rem, 1.15vw, 1.05rem)' }}
          >
            GitHub
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.behance.net/gallery/255438483/Keeper"
            onMouseEnter={() => soundManager.playHover()}
            className="text-white opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontSize: 'clamp(0.72rem, 1.15vw, 1.05rem)' }}
          >
            Behance
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/in/akeel-mohammad-li"
            onMouseEnter={() => soundManager.playHover()}
            className="text-white opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontSize: 'clamp(0.72rem, 1.15vw, 1.05rem)' }}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};
