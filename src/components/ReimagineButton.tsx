import React, { useState } from 'react';
import { soundManager } from '../utils/audio';

interface ReimagineButtonProps {
  onClick: () => void;
  visible: boolean;
  theme: 'light' | 'dark';
}

export const ReimagineButton: React.FC<ReimagineButtonProps> = ({
  onClick,
  visible,
  theme,
}) => {
  const [pulseColor, setPulseColor] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const label = 'Reimagine Phoenix';
  const letters = label.split('');
  const isDark = theme === 'dark';

  const handleClick = () => {
    const colors = ['#FB5959', '#41B8FF', '#52D273', '#F7C948', '#B388FF'];
    const chosen = colors[Math.floor(Math.random() * colors.length)];
    setPulseColor(chosen);
    setAnimating(true);

    soundManager.playRelease();
    onClick();

    setTimeout(() => {
      setAnimating(false);
    }, 600);
    setTimeout(() => {
      setPulseColor(null);
    }, 1200);
  };

  return (
    <div
      className={`fixed z-30 bottom-[2.2vh] right-[4vw] transition-all duration-500 ease-out ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => soundManager.playHover()}
        aria-label="Reimagine Phoenix"
        className="release-spirit-btn group relative flex items-center justify-between rounded-full cursor-pointer overflow-hidden whitespace-nowrap"
        style={{
          height: 'clamp(1.85rem, 3.1vw, 2.85rem)',
          paddingLeft: 'clamp(0.6rem, 1.35vw, 1.35rem)',
          paddingRight: 'clamp(0.6rem, 1.35vw, 1.25rem)',
          gap: 'clamp(0.3rem, 0.75vw, 0.7rem)',
        }}
      >
        {/* Expanding Color Circle Ripple */}
        {pulseColor && (
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full pointer-events-none transition-all duration-1000 scale-[12] opacity-0"
            style={{
              border: `2px solid ${pulseColor}`,
              backgroundColor: `${pulseColor}33`,
              filter: 'blur(2px)',
            }}
          />
        )}

        {/* Letter-by-Letter Animated Text */}
        <div className="relative z-10 shrink-0">
          <p
            className={`whitespace-nowrap select-none transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-[#020612]'
            }`}
            style={{ fontSize: 'clamp(0.62rem, 1.18vw, 1.12rem)' }}
          >
            {letters.map((ch, idx) => {
              const distFromCenter = Math.abs(idx - 8);
              return (
                <span
                  key={idx}
                  className="inline-block transition-all duration-300"
                  style={{
                    transitionDelay: animating ? `${distFromCenter * 25}ms` : '0ms',
                    filter: animating ? 'blur(2px)' : 'blur(0px)',
                    transform: animating ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              );
            })}
          </p>
        </div>
      </button>
    </div>
  );
};
