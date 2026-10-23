import React from 'react';
import { HouseModel, InteriorRoom, InteriorStyleConfig } from '../config/siteConfig';

interface HouseIllustrationProps {
  model: HouseModel;
  className?: string;
}

export const HouseCardCanvas: React.FC<HouseIllustrationProps> = React.memo(
  ({ model, className = '' }) => {
    const c = model.config3D;
    const baseW = Math.round(340 * c.footprintScaleX);
    const baseX = Math.round((640 - baseW) / 2);
    const groundY = 295;
    const storyH = 88;
    const mainH = c.stories === 2 ? Math.round(storyH * 1.8) : storyH;
    const mainTopY = groundY - 12 - mainH;

    const glassX = Math.round(baseX + baseW * 0.36);
    const glassW = Math.round(baseW * 0.56);
    const glassH = storyH - 22;
    const glassY = groundY - 12 - glassH;

    const louverCount = Math.min(c.louverCount, 8);
    const louverStartX = baseX + 14;
    const louverSpacing = Math.round((baseW * 0.26) / Math.max(louverCount, 4));

    return (
      <div
        className={`relative w-full h-full overflow-hidden bg-[#161E19] select-none ${className}`}
        role="img"
        aria-label={`Visualisasi konsep arsitektur ${model.name}`}
      >
        <svg
          viewBox="0 0 640 400"
          className="w-full h-full object-cover block"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id={`sky-${model.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141B16" />
              <stop offset="60%" stopColor="#263329" />
              <stop offset="100%" stopColor="#BA8F63" />
            </linearGradient>
            <radialGradient id={`sun-${model.id}`} cx="78%" cy="28%" r="35%">
              <stop offset="0%" stopColor="#FFE3B3" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#FFE3B3" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`win-${model.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE6BA" />
              <stop offset="55%" stopColor="#E09648" />
              <stop offset="100%" stopColor="#874E1F" />
            </linearGradient>
            <linearGradient id={`pool-${model.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#35686E" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#173034" stopOpacity="0.98" />
            </linearGradient>
          </defs>

          {/* Sky Background */}
          <rect width="640" height="300" fill={`url(#sky-${model.id})`} />
          <rect width="640" height="300" fill={`url(#sun-${model.id})`} />

          {/* Subtle Architectural Grid */}
          <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
            <line x1="120" y1="0" x2="120" y2="295" />
            <line x1="240" y1="0" x2="240" y2="295" />
            <line x1="360" y1="0" x2="360" y2="295" />
            <line x1="480" y1="0" x2="480" y2="295" />
            <line x1="0" y1="90" x2="640" y2="90" />
            <line x1="0" y1="180" x2="640" y2="180" />
          </g>

          {/* Distant Horizon Silhouette */}
          <path
            d="M0,285 Q160,240 330,275 T640,270 L640,400 L0,400 Z"
            fill="#1A221C"
          />

          {/* Ground Courtyard */}
          <rect x="0" y={groundY} width="640" height={400 - groundY} fill="#181F18" />

          {/* Stone Plinth */}
          <rect
            x={baseX - 16}
            y={groundY - 12}
            width={baseW + 32}
            height="18"
            fill={c.stoneColor}
          />

          {/* Secondary Left Volume */}
          <rect
            x={baseX}
            y={mainTopY + 10}
            width={Math.round(baseW * 0.44)}
            height={mainH - 10}
            fill={c.secondaryWallColor}
          />

          {/* Main Right Illuminated Volume */}
          <rect
            x={Math.round(baseX + baseW * 0.32)}
            y={mainTopY}
            width={Math.round(baseW * 0.68)}
            height={mainH}
            fill={c.wallColor}
          />

          {/* Ground Floor Panoramic Window */}
          <rect
            x={glassX}
            y={glassY}
            width={glassW}
            height={glassH}
            fill={`url(#win-${model.id})`}
            stroke={c.metalColor}
            strokeWidth="3"
          />
          <line
            x1={Math.round(glassX + glassW * 0.33)}
            y1={glassY}
            x2={Math.round(glassX + glassW * 0.33)}
            y2={glassY + glassH}
            stroke={c.metalColor}
            strokeWidth="2.5"
          />
          <line
            x1={Math.round(glassX + glassW * 0.66)}
            y1={glassY}
            x2={Math.round(glassX + glassW * 0.66)}
            y2={glassY + glassH}
            stroke={c.metalColor}
            strokeWidth="2.5"
          />

          {/* Second Story Window & Slab */}
          {c.stories === 2 && (
            <g>
              <rect
                x={glassX + 10}
                y={mainTopY + 16}
                width={glassW - 20}
                height={Math.round(storyH * 0.65)}
                fill={`url(#win-${model.id})`}
                stroke={c.metalColor}
                strokeWidth="2.5"
              />
              <rect
                x={baseX - 10}
                y={groundY - 12 - storyH}
                width={baseW + 24}
                height="9"
                fill={c.roofColor}
              />
            </g>
          )}

          {/* Secondary Skin Timber Louvers */}
          <g fill={c.woodColor}>
            {Array.from({ length: louverCount }).map((_, idx) => (
              <rect
                key={idx}
                x={louverStartX + idx * louverSpacing}
                y={mainTopY + 14}
                width="4"
                height={mainH - 18}
              />
            ))}
          </g>

          {/* Roof Silhouette by Archetype */}
          {c.roofType === 'joglo-kontemporer' ? (
            <g>
              <polygon
                points={`${baseX - 32},${mainTopY + 6} ${baseX + baseW + 32},${mainTopY + 6} ${baseX + baseW - 14},${mainTopY - 24} ${baseX + 14},${mainTopY - 24}`}
                fill={c.roofColor}
              />
              <polygon
                points={`${baseX + 34},${mainTopY - 22} ${baseX + baseW - 34},${mainTopY - 22} ${Math.round(baseX + baseW * 0.62)},${mainTopY - 70} ${Math.round(baseX + baseW * 0.38)},${mainTopY - 70}`}
                fill={c.roofColor}
              />
              <rect
                x={baseX - 32}
                y={mainTopY + 2}
                width={baseW + 64}
                height="4"
                fill={c.woodColor}
              />
            </g>
          ) : c.roofType === 'japandi-gable' ? (
            <polygon
              points={`${baseX - 22},${mainTopY + 6} ${Math.round(baseX + baseW * 0.54)},${mainTopY - 50} ${baseX + baseW + 22},${mainTopY + 6}`}
              fill={c.roofColor}
              stroke={c.woodColor}
              strokeWidth="4"
            />
          ) : c.roofType === 'tropical-hip' || c.roofType === 'mediterranean-arch' ? (
            <polygon
              points={`${baseX - 28},${mainTopY + 4} ${baseX + baseW + 28},${mainTopY + 4} ${Math.round(baseX + baseW * 0.72)},${mainTopY - 44} ${Math.round(baseX + baseW * 0.28)},${mainTopY - 44}`}
              fill={c.roofColor}
            />
          ) : c.roofType === 'industrial-sawtooth' ? (
            <polygon
              points={`${baseX - 8},${mainTopY + 4} ${Math.round(baseX + baseW * 0.48)},${mainTopY - 34} ${Math.round(baseX + baseW * 0.48)},${mainTopY + 4} ${baseX + baseW + 8},${mainTopY - 34} ${baseX + baseW + 8},${mainTopY + 4}`}
              fill={c.roofColor}
            />
          ) : c.roofType === 'compact-mono' ? (
            <polygon
              points={`${baseX - 16},${mainTopY + 8} ${baseX + baseW + 18},${mainTopY - 26} ${baseX + baseW + 18},${mainTopY + 8}`}
              fill={c.roofColor}
            />
          ) : (
            <g>
              <rect
                x={baseX - 26}
                y={mainTopY - 10}
                width={baseW + 52}
                height="13"
                fill={c.roofColor}
              />
              <rect
                x={baseX - 24}
                y={mainTopY + 3}
                width={baseW + 48}
                height="4"
                fill={c.woodColor}
              />
            </g>
          )}

          {/* Reflection Pool in Foreground */}
          {c.hasPool && (
            <g>
              <rect
                x={baseX + 18}
                y={groundY + 14}
                width={baseW - 12}
                height="50"
                fill={`url(#pool-${model.id})`}
                stroke={c.stoneColor}
                strokeWidth="2.5"
              />
              <rect
                x={glassX}
                y={groundY + 18}
                width={Math.round(glassW * 0.85)}
                height="36"
                fill="rgba(255, 210, 140, 0.2)"
              />
            </g>
          )}
        </svg>

        {/* Crisp HTML Badge Overlay */}
        <div className="absolute top-3 left-3 bg-[#161915]/85 border border-white/10 px-2.5 py-1 rounded text-[11px] font-mono-tabular text-[#F6F3EC]">
          {model.floors} LANTAI · {model.buildingArea}
        </div>
      </div>
    );
  }
);

interface InteriorIllustrationProps {
  room: InteriorRoom;
  styleConfig: InteriorStyleConfig;
  className?: string;
}

export const InteriorCardCanvas: React.FC<InteriorIllustrationProps> = React.memo(
  ({ room, styleConfig, className = '' }) => {
    return (
      <div
        className={`relative w-full h-full overflow-hidden select-none ${className}`}
        style={{ backgroundColor: styleConfig.wallHex }}
        role="img"
        aria-label={`Ilustrasi interior ${room.name} dengan gaya ${styleConfig.name}`}
      >
        <svg
          viewBox="0 0 560 360"
          className="w-full h-full object-cover block"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Back Wall */}
          <rect width="560" height="360" fill={styleConfig.wallHex} />

          {/* Left & Right Perspective Walls */}
          <polygon points="0,0 85,55 85,280 0,360" fill="rgba(0,0,0,0.06)" />
          <polygon points="560,0 475,55 475,280 560,360" fill="rgba(0,0,0,0.09)" />

          {/* Ceiling Plane */}
          <polygon points="0,0 560,0 475,55 85,55" fill="#FAF8F5" />

          {/* Floor Plane */}
          <polygon points="85,280 475,280 560,360 0,360" fill={styleConfig.floorHex} />

          {/* Area Rug */}
          <polygon points="145,296 415,296 465,348 95,348" fill={styleConfig.rugHex} />

          {/* Acoustic Wood Slat Feature Panel */}
          <g fill={styleConfig.woodHex}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <rect key={i} x={115 + i * 11} y="72" width="6" height="205" />
            ))}
          </g>

          {/* Daylight Window on Right */}
          <rect
            x="345"
            y="78"
            width="102"
            height="190"
            fill={styleConfig.lightWarmthHex}
            stroke={styleConfig.metalHex}
            strokeWidth="3"
          />

          {/* Main Furniture Piece */}
          <rect x="165" y="232" width="210" height="50" rx="3" fill={styleConfig.fabricHex} />
          <rect x="160" y="276" width="220" height="12" rx="2" fill={styleConfig.woodHex} />
          <rect x="182" y="240" width="42" height="28" rx="2" fill={styleConfig.accentHex} />
          <rect x="315" y="240" width="42" height="28" rx="2" fill={styleConfig.accentHex} />

          {/* Foreground Table */}
          <rect x="215" y="298" width="130" height="16" rx="2" fill={styleConfig.woodHex} />

          {/* Pendant Lamp */}
          <line
            x1="280"
            y1="30"
            x2="280"
            y2="112"
            stroke={styleConfig.metalHex}
            strokeWidth="2"
          />
          <rect x="244" y="110" width="72" height="8" rx="2" fill={styleConfig.accentHex} />
        </svg>
      </div>
    );
  }
);
