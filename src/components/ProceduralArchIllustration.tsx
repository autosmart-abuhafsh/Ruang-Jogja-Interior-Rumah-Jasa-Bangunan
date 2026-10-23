import React, { useEffect, useRef } from 'react';
import { HouseModel, InteriorRoom, InteriorStyleConfig } from '../config/siteConfig';

interface HouseIllustrationProps {
  model: HouseModel;
  className?: string;
}

export const HouseCardCanvas: React.FC<HouseIllustrationProps> = ({ model, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const height = 420;
    canvas.width = width;
    canvas.height = height;

    const c = model.config3D;

    // 1. Sky / Architectural Twilight Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.72);
    skyGrad.addColorStop(0, '#161E19');
    skyGrad.addColorStop(0.55, '#27342B');
    skyGrad.addColorStop(1, '#C59B6D');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Architectural Grid Lines in Sky
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height * 0.72);
      ctx.stroke();
    }
    for (let y = 40; y < height * 0.72; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Soft Sun / Warm Glow
    const sunGrad = ctx.createRadialGradient(width * 0.78, height * 0.28, 8, width * 0.78, height * 0.28, 160);
    sunGrad.addColorStop(0, 'rgba(255, 226, 176, 0.45)');
    sunGrad.addColorStop(1, 'rgba(255, 226, 176, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant Tropical Silhouette / Merapi Horizon
    ctx.fillStyle = '#1B241E';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.68);
    ctx.quadraticCurveTo(width * 0.25, height * 0.56, width * 0.52, height * 0.65);
    ctx.quadraticCurveTo(width * 0.8, height * 0.52, width, height * 0.66);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // 2. Ground Plinth & Courtyard Lawn
    const groundY = height * 0.68;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
    groundGrad.addColorStop(0, '#222A22');
    groundGrad.addColorStop(1, '#121612');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Stone Plinth Foundation
    const baseW = 360 * c.footprintScaleX;
    const baseX = (width - baseW) / 2;
    ctx.fillStyle = c.stoneColor;
    ctx.fillRect(baseX - 18, groundY - 14, baseW + 36, 20);

    // 3. Main Building Volumes
    const storyH = 92;
    const mainH = c.stories === 2 ? storyH * 1.85 : storyH;
    const mainTopY = groundY - 14 - mainH;

    // Shadow side / Secondary Volume
    ctx.fillStyle = c.secondaryWallColor;
    ctx.fillRect(baseX, mainTopY + 12, baseW * 0.45, mainH - 12);

    // Primary Illuminated Wall Volume
    ctx.fillStyle = c.wallColor;
    ctx.fillRect(baseX + baseW * 0.32, mainTopY, baseW * 0.68, mainH);

    // Warm Interior Window Glow
    const winGrad = ctx.createLinearGradient(0, mainTopY + 20, 0, groundY - 20);
    winGrad.addColorStop(0, '#FFE4B5');
    winGrad.addColorStop(0.5, '#E39A4C');
    winGrad.addColorStop(1, '#8C5222');

    // Ground Floor Large Glass Opening
    const glassX = baseX + baseW * 0.38;
    const glassW = baseW * 0.54;
    const glassH = storyH - 24;
    const glassY = groundY - 14 - glassH;
    ctx.fillStyle = winGrad;
    ctx.fillRect(glassX, glassY, glassW, glassH);

    // Mullions / Window Frames
    ctx.strokeStyle = c.metalColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(glassX, glassY, glassW, glassH);
    for (let i = 1; i <= 3; i++) {
      const mx = glassX + (glassW / 4) * i;
      ctx.beginPath();
      ctx.moveTo(mx, glassY);
      ctx.lineTo(mx, glassY + glassH);
      ctx.stroke();
    }

    // Mediterranean Arches if enabled
    if (c.hasArches) {
      ctx.fillStyle = c.wallColor;
      const archCount = 3;
      const archW = glassW / archCount;
      for (let i = 0; i < archCount; i++) {
        const ax = glassX + i * archW;
        ctx.beginPath();
        ctx.moveTo(ax, glassY);
        ctx.lineTo(ax + archW, glassY);
        ctx.lineTo(ax + archW, glassY + 24);
        ctx.arc(ax + archW / 2, glassY + 24, archW / 2 - 3, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Second Story Window & Timber Louvers if 2 stories
    if (c.stories === 2) {
      const upperGlassY = mainTopY + 18;
      const upperGlassH = storyH * 0.68;
      ctx.fillStyle = winGrad;
      ctx.fillRect(glassX + 12, upperGlassY, glassW - 24, upperGlassH);
      ctx.strokeStyle = c.metalColor;
      ctx.strokeRect(glassX + 12, upperGlassY, glassW - 24, upperGlassH);

      // Horizontal Slab Divider
      ctx.fillStyle = c.roofColor;
      ctx.fillRect(baseX - 10, groundY - 14 - storyH, baseW + 28, 10);
    }

    // Timber Secondary Skin Louvers
    ctx.fillStyle = c.woodColor;
    const louverStartX = baseX + 14;
    const louverAreaW = baseW * 0.28;
    const spacing = louverAreaW / Math.max(c.louverCount, 4);
    for (let i = 0; i < c.louverCount; i++) {
      ctx.fillRect(louverStartX + i * spacing, mainTopY + 16, 4, mainH - 20);
    }

    // 4. Roof Archetype Geometry
    ctx.fillStyle = c.roofColor;
    if (c.roofType === 'joglo-kontemporer') {
      // Lower Eave
      ctx.beginPath();
      ctx.moveTo(baseX - 36, mainTopY + 6);
      ctx.lineTo(baseX + baseW + 36, mainTopY + 6);
      ctx.lineTo(baseX + baseW - 15, mainTopY - 26);
      ctx.lineTo(baseX + 15, mainTopY - 26);
      ctx.closePath();
      ctx.fill();
      // Upper Joglo Tajug Crown
      ctx.beginPath();
      ctx.moveTo(baseX + 35, mainTopY - 24);
      ctx.lineTo(baseX + baseW - 35, mainTopY - 24);
      ctx.lineTo(baseX + baseW * 0.62, mainTopY - 76);
      ctx.lineTo(baseX + baseW * 0.38, mainTopY - 76);
      ctx.closePath();
      ctx.fill();
      // Wood Fascia Trim
      ctx.fillStyle = c.woodColor;
      ctx.fillRect(baseX - 36, mainTopY + 2, baseW + 72, 5);
    } else if (c.roofType === 'japandi-gable') {
      ctx.beginPath();
      ctx.moveTo(baseX - 24, mainTopY + 6);
      ctx.lineTo(baseX + baseW * 0.55, mainTopY - 54);
      ctx.lineTo(baseX + baseW + 24, mainTopY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = c.woodColor;
      ctx.lineWidth = 5;
      ctx.stroke();
    } else if (c.roofType === 'tropical-hip' || c.roofType === 'mediterranean-arch') {
      ctx.beginPath();
      ctx.moveTo(baseX - 32, mainTopY + 4);
      ctx.lineTo(baseX + baseW + 32, mainTopY + 4);
      ctx.lineTo(baseX + baseW * 0.72, mainTopY - 46);
      ctx.lineTo(baseX + baseW * 0.28, mainTopY - 46);
      ctx.closePath();
      ctx.fill();
    } else if (c.roofType === 'industrial-sawtooth') {
      // Twin pitched industrial steel roof
      ctx.beginPath();
      ctx.moveTo(baseX - 10, mainTopY + 4);
      ctx.lineTo(baseX + baseW * 0.48, mainTopY - 36);
      ctx.lineTo(baseX + baseW * 0.48, mainTopY + 4);
      ctx.lineTo(baseX + baseW + 10, mainTopY - 36);
      ctx.lineTo(baseX + baseW + 10, mainTopY + 4);
      ctx.closePath();
      ctx.fill();
    } else if (c.roofType === 'compact-mono') {
      ctx.beginPath();
      ctx.moveTo(baseX - 18, mainTopY + 8);
      ctx.lineTo(baseX + baseW + 20, mainTopY - 28);
      ctx.lineTo(baseX + baseW + 20, mainTopY + 8);
      ctx.closePath();
      ctx.fill();
    } else {
      // Flat Cantilever Modern Slab
      ctx.fillRect(baseX - 28, mainTopY - 10, baseW + 56, 14);
      ctx.fillStyle = c.woodColor;
      ctx.fillRect(baseX - 26, mainTopY + 4, baseW + 52, 4);
    }

    // 5. Reflection Pool in Foreground if enabled
    if (c.hasPool) {
      const poolY = groundY + 14;
      const poolH = 54;
      const poolGrad = ctx.createLinearGradient(0, poolY, 0, poolY + poolH);
      poolGrad.addColorStop(0, 'rgba(54, 104, 110, 0.85)');
      poolGrad.addColorStop(1, 'rgba(24, 48, 52, 0.95)');
      ctx.fillStyle = poolGrad;
      ctx.fillRect(baseX + 20, poolY, baseW - 10, poolH);

      // Warm window reflection on water
      ctx.fillStyle = 'rgba(255, 210, 140, 0.22)';
      ctx.fillRect(glassX, poolY + 4, glassW * 0.85, poolH - 12);

      // Pool Coping Border
      ctx.strokeStyle = c.stoneColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(baseX + 20, poolY, baseW - 10, poolH);
    }

    // 6. Architectural Dimension Callout Overlay (Bottom-Left)
    ctx.fillStyle = 'rgba(22, 25, 21, 0.72)';
    ctx.fillRect(18, 18, 175, 32);
    ctx.fillStyle = '#F6F3EC';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText(`${model.floors} LANTAI · ${model.buildingArea}`, 28, 38);
  }, [model]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Visualisasi konsep arsitektur ${model.name}`}
      className={`w-full h-full object-cover block ${className}`}
    />
  );
};

interface InteriorIllustrationProps {
  room: InteriorRoom;
  styleConfig: InteriorStyleConfig;
  className?: string;
}

export const InteriorCardCanvas: React.FC<InteriorIllustrationProps> = ({
  room,
  styleConfig,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 560;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    // 1. Back Wall & Perspective Room Box
    ctx.fillStyle = styleConfig.wallHex;
    ctx.fillRect(0, 0, width, height);

    // Left & Right Perspective Walls with Subtle Shading
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(85, 55);
    ctx.lineTo(85, height - 80);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.09)';
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width - 85, 55);
    ctx.lineTo(width - 85, height - 80);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Ceiling & Warm Indirect Cove Light
    ctx.fillStyle = '#FAF8F5';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width - 85, 55);
    ctx.lineTo(85, 55);
    ctx.closePath();
    ctx.fill();

    const coveGrad = ctx.createLinearGradient(0, 48, 0, 110);
    coveGrad.addColorStop(0, styleConfig.lightWarmthHex);
    coveGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = coveGrad;
    ctx.fillRect(85, 50, width - 170, 60);

    // Floor Plane
    ctx.fillStyle = styleConfig.floorHex;
    ctx.beginPath();
    ctx.moveTo(85, height - 80);
    ctx.lineTo(width - 85, height - 80);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Area Rug
    ctx.fillStyle = styleConfig.rugHex;
    ctx.beginPath();
    ctx.moveTo(145, height - 62);
    ctx.lineTo(width - 145, height - 62);
    ctx.lineTo(width - 95, height - 12);
    ctx.lineTo(95, height - 12);
    ctx.closePath();
    ctx.fill();

    // Wood Slat Feature Panel on Back Wall
    ctx.fillStyle = styleConfig.woodHex;
    const panelX = 115;
    const panelY = 72;
    const panelW = 110;
    const panelH = height - 152;
    for (let x = panelX; x < panelX + panelW; x += 10) {
      ctx.fillRect(x, panelY, 6, panelH);
    }

    // Window Opening on Right Side of Back Wall
    const winX = width - 215;
    const winY = 78;
    const winW = 105;
    const winH = height - 165;
    const daylightGrad = ctx.createLinearGradient(winX, winY, winX + winW, winY + winH);
    daylightGrad.addColorStop(0, '#FFFDF8');
    daylightGrad.addColorStop(1, '#DCE5D8');
    ctx.fillStyle = daylightGrad;
    ctx.fillRect(winX, winY, winW, winH);
    ctx.strokeStyle = styleConfig.metalHex;
    ctx.lineWidth = 3;
    ctx.strokeRect(winX, winY, winW, winH);

    // Center Furniture Silhouette Depending on Room Type
    const centerY = height - 125;
    ctx.fillStyle = styleConfig.fabricHex;
    ctx.fillRect(165, centerY, 210, 52);
    // Wood Base / Plinth of Furniture
    ctx.fillStyle = styleConfig.woodHex;
    ctx.fillRect(160, centerY + 46, 220, 12);
    // Accent Cushions / Table
    ctx.fillStyle = styleConfig.accentHex;
    ctx.fillRect(180, centerY + 8, 42, 30);
    ctx.fillRect(315, centerY + 8, 42, 30);

    // Coffee Table / Island in Foreground
    ctx.fillStyle = styleConfig.woodHex;
    ctx.fillRect(215, centerY + 64, 130, 18);

    // Architectural Pendant Light
    ctx.strokeStyle = styleConfig.metalHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 30);
    ctx.lineTo(width / 2, 115);
    ctx.stroke();
    ctx.fillStyle = styleConfig.accentHex;
    ctx.fillRect(width / 2 - 36, 112, 72, 8);
  }, [room, styleConfig]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Ilustrasi interior ${room.name} dengan gaya ${styleConfig.name}`}
      className={`w-full h-full object-cover block ${className}`}
    />
  );
};
