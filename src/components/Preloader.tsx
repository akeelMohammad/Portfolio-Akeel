import React, { useEffect, useState } from 'react';
import { soundManager } from '../utils/audio';
import { LogoPathAnimation } from './LogoPathAnimation';

interface PreloaderProps {
  onStart: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onStart }) => {
  const [revealed, setRevealed] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Check for autostart query param (Ultra Mode requirement)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        handleStart();
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        handleStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleStart = () => {
    soundManager.setSound(true);
    soundManager.playHover();
    setRevealed(true);
    setTimeout(() => {
      setHidden(true);
      onStart();
    }, 800);
  };

  if (hidden) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleStart}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleStart();
      }}
      className={`fixed inset-0 z-50 flex flex-col justify-center items-center cursor-pointer select-none transition-all duration-700 ease-in-out preloader-bg ${
        revealed ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      aria-label="Click to start experience"
    >
      <div className="flex flex-col items-center gap-6 px-6">
        {/* Animated Logo Path Drawing */}
        <div className="w-52 sm:w-64 md:w-72">
          <LogoPathAnimation />
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center text-center transition-all duration-500">
          <h1 className="text-base sm:text-lg font-medium tracking-[0.24em] text-[#1e162d] uppercase">
            Akeel Mohammad
          </h1>
        </div>

        {/* Previous Click to Start Button Design */}
        <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-black/20 bg-white/30 backdrop-blur-md">
          <span className="text-[15px] font-medium tracking-wide text-neutral-900">
            Click to start
          </span>
        </div>
      </div>
    </div>
  );
};
