import React, { useEffect, useState } from 'react';

interface LogoPathAnimationProps {
  className?: string;
  onComplete?: () => void;
}

// Exact vectorized path data for Akeel Mohammad "am" monogram
export const LOGO_PATH_A =
  'M 244 4.663 C 175.335 11.386, 112.191 43.279, 67.740 93.688 C 35.559 130.183, 12.233 178.382, 5.019 223.290 C -6.769 296.666, 11.662 368.013, 57.384 426 C 72.464 445.126, 97.698 468.310, 117.579 481.307 C 166.778 513.470, 220.750 527.925, 277.186 524.055 C 305.492 522.113, 330.158 515.768, 354.238 504.234 C 366.223 498.493, 384.276 488.156, 390.737 483.334 L 393.974 480.918 394.237 409.459 C 394.382 370.156, 394.407 338, 394.293 338 C 394.179 338, 391.501 341.262, 388.342 345.250 C 369.140 369.492, 352.268 383.840, 328.795 395.890 C 294.525 413.483, 259.754 417.262, 223.500 407.332 C 182.129 396, 146.640 366.734, 127.458 328.132 C 106.410 285.771, 108.468 233.107, 132.760 192.500 C 142.506 176.209, 159.330 157.468, 173.820 146.764 C 192.611 132.882, 218.761 121.823, 243.309 117.376 C 256.018 115.074, 283.060 115.126, 296.500 117.477 C 333.367 123.929, 367.400 143.347, 390.901 171.339 C 404.490 187.524, 414.168 205.033, 419.054 222.272 C 424.407 241.158, 424.235 237.734, 424.998 341 C 425.597 422.041, 425.958 438.701, 427.254 445 C 433.001 472.939, 451.101 496.483, 476.763 509.398 C 490.290 516.206, 511.102 520.982, 527.296 520.994 L 535.092 521 534.732 372.750 C 534.374 224.640, 534.371 224.488, 532.146 212.014 C 521.006 149.563, 485.148 93.928, 430.904 54.931 C 403.520 35.244, 372.422 20.675, 340.138 12.408 C 315.361 6.063, 297.410 3.960, 269.712 4.160 C 257.495 4.248, 245.925 4.474, 244 4.663 Z';

export const LOGO_PATH_M =
  'M 1078.722 2.055 C 1020.986 8.023, 968.268 31.332, 925.132 69.963 C 919.835 74.708, 911.747 83.069, 907.159 88.545 C 902.572 94.020, 898.251 98.500, 897.556 98.500 C 896.862 98.500, 893.459 94.900, 889.995 90.500 C 877.226 74.279, 856.391 55.516, 836.500 42.323 C 786.808 9.365, 722.132 -3.601, 660.163 6.972 C 622.281 13.436, 582.664 31.504, 550.723 56.887 C 541.764 64.006, 523.660 81.240, 517.849 88.180 L 513.833 92.977 519.915 101.048 C 536.547 123.120, 550.143 151.735, 557.060 179.226 C 558.759 185.977, 560.344 192.110, 560.584 192.856 C 560.828 193.618, 564.498 189.404, 568.956 183.245 C 594.261 148.276, 629.774 125.881, 673.500 117.318 C 686.410 114.790, 717.199 114.829, 729 117.389 C 755.585 123.156, 778.689 136.416, 798.790 157.442 C 819.140 178.728, 830.301 201.094, 835.741 231.486 C 837.163 239.429, 837.396 257.025, 837.704 379.608 L 838.054 518.716 844.777 519.351 C 853.605 520.185, 919.289 520.183, 934.809 519.348 L 946.931 518.696 947.261 385.598 L 947.591 252.500 949.853 242.500 C 958.106 206.031, 969.813 184.101, 993.944 159.911 C 1008.518 145.301, 1017.568 138.689, 1034.833 130.034 C 1053.636 120.609, 1071.726 115.624, 1093.630 113.829 C 1122.909 111.431, 1151.302 116.606, 1175.500 128.751 C 1218.475 150.321, 1247.831 190.353, 1254.515 236.500 C 1255.723 244.838, 1255.966 269.129, 1255.982 382.657 L 1256 518.815 1261.750 519.157 C 1264.912 519.346, 1290.127 519.361, 1317.782 519.191 L 1368.064 518.882 1367.755 375.191 L 1367.445 231.500 1364.759 216.500 C 1358.911 183.845, 1351.941 162.878, 1338.332 137 C 1300.733 65.499, 1230.061 16.352, 1147 3.940 C 1130.606 1.490, 1093.968 0.479, 1078.722 2.055 Z';

export const LogoPathAnimation: React.FC<LogoPathAnimationProps> = ({
  className = '',
  onComplete,
}) => {
  const [animationPhase, setAnimationPhase] = useState<'drawing' | 'filled'>('drawing');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase('filled');
      if (onComplete) onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        viewBox="0 0 1369 526"
        className="w-full h-auto overflow-visible transition-transform duration-500 hover:scale-105"
        style={{
          filter: 'none',
        }}
        aria-label="Akeel Mohammad Animated Logo"
      >
        <defs>
          <linearGradient id="amFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2336" />
            <stop offset="100%" stopColor="#020612" />
          </linearGradient>
        </defs>

        {/* Letter 'a' path with black stroke drawing and black fill */}
        <path
          d={LOGO_PATH_A}
          fill="url(#amFillGradient)"
          stroke="#2A2336"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all"
          style={{
            strokeDasharray: 3000,
            strokeDashoffset: animationPhase === 'filled' ? 0 : undefined,
            animation:
              animationPhase === 'drawing'
                ? 'logoDrawA 1.6s cubic-bezier(0.65, 0, 0.35, 1) forwards'
                : 'none',
            fillOpacity: animationPhase === 'filled' ? 1 : 0,
            transition: 'fill-opacity 0.6s ease-in-out',
          }}
        />

        {/* Letter 'm' path with black stroke drawing and black fill */}
        <path
          d={LOGO_PATH_M}
          fill="url(#amFillGradient)"
          stroke="#2A2336"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all"
          style={{
            strokeDasharray: 3350,
            strokeDashoffset: animationPhase === 'filled' ? 0 : undefined,
            animation:
              animationPhase === 'drawing'
                ? 'logoDrawM 1.8s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards'
                : 'none',
            fillOpacity: animationPhase === 'filled' ? 1 : 0,
            transition: 'fill-opacity 0.6s ease-in-out',
          }}
        />
      </svg>
    </div>
  );
};
