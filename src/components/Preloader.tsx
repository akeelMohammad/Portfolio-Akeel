import React, { useEffect, useRef, useState } from 'react';
import { soundManager } from '../utils/audio';
import { LogoPathAnimation } from './LogoPathAnimation';

interface PreloaderProps {
  onStart: () => void;
  sceneReady: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ onStart, sceneReady }) => {
  const [revealed, setRevealed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [started, setStarted] = useState(false);
  const revealStartedRef = useRef(false);

  useEffect(() => {
    // Check for autostart query param (Ultra Mode requirement)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        requestStart();
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        requestStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sceneReady]);

  const reveal = () => {
    if (revealStartedRef.current) return;
    revealStartedRef.current = true;
    soundManager.setSound(true);
    soundManager.playHover();
    setRevealed(true);
    setTimeout(() => {
      setHidden(true);
      onStart();
    }, 800);
  };

  const requestStart = () => {
    setStarted(true);
    if (sceneReady) reveal();
  };

  useEffect(() => {
    if (started && sceneReady && !revealed) {
      reveal();
    }
  }, [sceneReady, started, revealed]);

  if (hidden) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={requestStart}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') requestStart();
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
            {started && !sceneReady ? 'Preparing experience...' : 'Click to start'}
          </span>
        </div>
      </div>
    </div>
  );
};
