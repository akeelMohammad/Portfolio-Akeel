import React from 'react';

interface HeroSectionProps {
  opacity: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ opacity }) => {
  if (opacity <= 0.01) return null;
  const characters = 'engineering'.split('');

  return (
    <section
      className="parent home-hero h-screen w-full flex items-end justify-center fixed top-0 left-0 pointer-events-none z-10"
      style={{ opacity }}
    >
      <div className="w-full max-w-[1440px] px-[4vw] pb-[clamp(3.8rem,6.5vh,5.2rem)] relative flex flex-col justify-end overflow-visible">
        <h2 className="font-normal text-[#1a1a1a] tracking-tight whitespace-nowrap select-none">
          Akeel Mohammad
          <br />
          <span
            className="font-seasons inline-block"
            style={{
              fontSize: 'clamp(1.3rem, 4.1vw, 3.9rem)',
              marginLeft: '3.6vw',
              marginRight: '1vw',
            }}
          >
            Software
          </span>
          &amp; UI/UX
        </h2>

        <h1 className="select-none pointer-events-none tracking-tighter whitespace-nowrap overflow-visible">
          {characters.map((char, index) => (
            <span
              key={index}
              className={`char char${index}`}
              aria-hidden="true"
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Scroll Indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[2.2vh] flex flex-col items-center pointer-events-auto whitespace-nowrap">
          <span
            className="tracking-[0.12em] uppercase text-black/60 font-medium whitespace-nowrap"
            style={{ fontSize: 'clamp(0.48rem, 0.9vw, 0.88rem)' }}
          >
            Scroll to explore portfolio
          </span>
          <span
            className="h-[2px] mt-1 bg-gradient-to-r from-transparent via-black/40 to-transparent"
            style={{ width: 'clamp(3.2rem, 7.5vw, 7.5rem)' }}
          />
        </div>
      </div>
    </section>
  );
};
