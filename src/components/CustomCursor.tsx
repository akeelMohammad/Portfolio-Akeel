import React, { useEffect, useState } from 'react';
import { CaseStudyData } from '../data/cases';

interface CustomCursorProps {
  hoveredCase?: CaseStudyData | null;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ hoveredCase }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let animId: number;
    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target?.closest('button') ||
        target?.closest('a') ||
        target?.closest('.cursor-pointer')
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    const onMouseLeave = () => setVisible(false);

    const loop = () => {
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;
      setPos({ x: currentX, y: currentY });
      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 hidden lg:block"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    >
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ease-out ${
          hoveredCase
            ? 'scale-[1.4]'
            : hovered
            ? 'scale-75'
            : 'scale-100'
        }`}
      >
        {/* Translucent liquid glass backdrop when hovering a crystal */}
        <div
          className={`w-16 h-16 rounded-full border border-white/60 transition-all duration-300 ${
            hoveredCase
              ? 'bg-[#5746d9]/45 backdrop-blur-md opacity-100'
              : hovered
              ? 'opacity-0'
              : 'opacity-100'
          }`}
        />

        {/* Rotating Inner SVG Border */}
        <img
          alt=""
          src="/images/svg/cursor_border.svg"
          className={`absolute w-12 h-12 object-contain animate-spin transition-opacity duration-300 ${
            hovered && !hoveredCase ? 'opacity-0' : 'opacity-90'
          }`}
          style={{ animationDuration: '5s' }}
        />

        {/* Center Pixel Star or Case Arrow */}
        {hoveredCase ? (
          <img
            alt=""
            src="/images/svg/backArrowNew.svg"
            className="absolute w-3.5 h-3.5 -rotate-45"
          />
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`absolute transition-opacity duration-300 ${
              hovered ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <path
              d="M10.0625 17.6094H7.54688V12.5781H10.0625V17.6094ZM7.54688 10.0625V12.5781H5.03125V10.0625H7.54688ZM12.5781 12.5781H10.0625V10.0625H12.5781V12.5781ZM5.03125 10.0625H0V7.54688H5.03125V10.0625ZM17.6094 10.0625H12.5781V7.54688H17.6094V10.0625ZM7.54688 7.54688H5.03125V5.03125H7.54688V7.54688ZM12.5781 7.54688H10.0625V5.03125H12.5781V7.54688ZM10.0625 5.03125H7.54688V0H10.0625V5.03125Z"
              fill="white"
            />
          </svg>
        )}
      </div>

      {/* Exact Noomo .hover-case-text attached to cursor when hovering a 3D Crystal (from FZFS71Nt.js) */}
      {hoveredCase && (
        <div
          className={`absolute -top-3 whitespace-nowrap pointer-events-none ${
            hoveredCase.align === 'left'
              ? 'left-14 text-left'
              : 'right-14 text-right'
          }`}
        >
          <span
            className={`flex flex-col relative ${
              hoveredCase.align === 'left' ? 'items-start' : 'items-end'
            }`}
          >
            <span
              className="text-white font-normal relative z-10 whitespace-nowrap"
              style={{
                fontSize: 'clamp(1.6rem, 3.2vw, 3.125rem)',
                lineHeight: 1.08,
              }}
            >
              {hoveredCase.shortTitle}
            </span>
            <span
              className="text-white/90 relative z-10 whitespace-nowrap"
              style={{
                fontSize: 'clamp(0.85rem, 1.2vw, 1.125rem)',
              }}
            >
              {hoveredCase.shortSubtitle}
            </span>
            <span className="absolute block w-full blur-[80px] h-[151px] bg-[#272c4e] rounded-[100%] -z-10 pointer-events-none" />
          </span>
        </div>
      )}
    </div>
  );
};
