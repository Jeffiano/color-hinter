import React, { useEffect, useRef, useCallback, useState, useLayoutEffect } from 'react';
import { ColorControls } from '@/types';

interface ColorMixingCanvasProps {
  /**
   * 可选：最大尺寸（px），用于限制在大屏上的宽度，默认 600
   */
  maxSize?: number;
  colors: ColorControls;
  onColorHover: (color: string | null, x: number, y: number) => void;
  className?: string;
}

export function ColorMixingCanvas({ maxSize = 600, colors, onColorHover, className = '' }: ColorMixingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ css: number; pixel: number }>({ css: 0, pixel: 0 });
  const dprRef = useRef<number>(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  // 统一的防抖函数
  const debounce = (fn: () => void, delay = 60) => {
    let t: number | undefined;
    return () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(fn, delay);
    };
  };

  // 根据容器宽度 & 视口宽度动态设置画布尺寸（保持 1:1），并提升 DPR 清晰度
  const recalcSize = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const vw = typeof window !== 'undefined' ? window.innerWidth : rect.width;
    // 在小屏下允许尺寸 < 200，使用 90vw（减去一定边距），在大屏上限制 maxSize
    const targetCss = Math.min(maxSize, Math.min(rect.width, vw - 32));
    const cssSize = Math.max(140, targetCss); // 再降低最小阈值，避免超小屏溢出
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const pixelSize = Math.round(cssSize * dpr);
    setSize(prev => (prev.css === cssSize && prev.pixel === pixelSize ? prev : { css: cssSize, pixel: pixelSize }));
  }, [maxSize]);

  useLayoutEffect(() => {
    recalcSize();
  }, [recalcSize]);

  useEffect(() => {
    const ro = new ResizeObserver(debounce(recalcSize, 80));
    if (containerRef.current) ro.observe(containerRef.current);
    const onResize = debounce(recalcSize, 80);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [recalcSize]);

  const width = size.pixel; // 内部绘制使用物理像素尺寸，提升清晰度
  const height = size.pixel;
  const displaySize = size.css; // CSS 尺寸

  // 移除饱和度调整函数

  const drawCircle = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: [number, number, number],
    brightness: number
  ) => {
    const logicalSize = displaySize;
    if (logicalSize <= 0) return ctx.createImageData(1, 1); // 防止无效尺寸
    
    const imageData = ctx.createImageData(logicalSize, logicalSize);
    const data = imageData.data;
    const featherSize = 2; // 边缘羽化的大小

    const [r, g, b] = color;
    const intensityFactor = brightness / 100;

    // 使用子像素渲染和平滑过渡
    for (let py = 0; py < logicalSize; py++) {
      for (let px = 0; px < logicalSize; px++) {
        const index = (py * logicalSize + px) * 4;
        
        // 计算到圆心的距离，使用更精确的浮点数计算
        const dx = px - x;
        const dy = py - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 计算像素覆盖率（抗锯齿）
        let coverage = 0;
        
        if (distance <= radius - featherSize) {
          // 圆内部区域
          coverage = 1;
        } else if (distance <= radius + featherSize) {
          // 边缘过渡区域，使用平滑的余弦过渡
          const t = (radius + featherSize - distance) / (2 * featherSize);
          coverage = 0.5 * (1 + Math.cos(Math.PI * (1 - t)));
        }

        // 应用颜色和透明度
        if (coverage > 0) {
          const alpha = coverage * intensityFactor;
          data[index] = Math.round(r * intensityFactor);
          data[index + 1] = Math.round(g * intensityFactor);
          data[index + 2] = Math.round(b * intensityFactor);
          data[index + 3] = Math.round(255 * alpha);
        }
      }
    }

    return imageData;
  }, [displaySize]);

  const mixColors = useCallback((colors: Uint8ClampedArray[]) => {
    const logicalSize = displaySize;
    if (logicalSize <= 0) return new Uint8ClampedArray(4); // 防止无效尺寸
    
    const result = new Uint8ClampedArray(logicalSize * logicalSize * 4);
    for (let i = 0; i < result.length; i += 4) {
      let r = 0, g = 0, b = 0;
      let maxAlpha = 0;
      
      // 使用加色混合模型
      colors.forEach(color => {
        const alpha = color[i + 3] / 255;
        if (alpha > 0) {
          // 每个颜色分量取最大值
          r = Math.max(r, color[i]);
          g = Math.max(g, color[i + 1]);
          b = Math.max(b, color[i + 2]);
          maxAlpha = Math.max(maxAlpha, alpha);
        }
      });

      // 设置最终颜色值，确保三色重叠时达到255
      result[i] = Math.min(255, Math.round(r));
      result[i + 1] = Math.min(255, Math.round(g));
      result[i + 2] = Math.min(255, Math.round(b));
      result[i + 3] = Math.round(maxAlpha * 255);
    }
    return result;
  }, [displaySize]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return; // 尚未初始化尺寸

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 DPR 缩放（只在尺寸变化时）
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${displaySize}px`;
      canvas.style.height = `${displaySize}px`;
      ctx.reset?.();
      const dpr = dprRef.current;
      ctx.scale(dpr, dpr); // 实际逻辑使用 cssSize 逻辑坐标，需要下调绘制区域
    }

    // 我们绘制逻辑基于 CSS 逻辑尺寸，为避免修改像素循环逻辑，改用逻辑画布缓存像素。
    // 创建一个离屏 canvas 以 CSS 逻辑尺寸处理，然后再放大到物理像素，可减少每像素循环成本。
    const logicalSize = displaySize;
    const off = document.createElement('canvas');
    off.width = logicalSize;
    off.height = logicalSize;
    const lctx = off.getContext('2d');
    if (!lctx) return;

    // 清除画布
    lctx.clearRect(0, 0, logicalSize, logicalSize);

    // 创建三个光源的图像数据
    const radius = logicalSize * 0.3;
    const redCircle = drawCircle(lctx, logicalSize * 0.3, logicalSize * 0.6, radius, [255, 0, 0], colors.red.brightness);
    const greenCircle = drawCircle(lctx, logicalSize * 0.7, logicalSize * 0.6, radius, [0, 255, 0], colors.green.brightness);
    const blueCircle = drawCircle(lctx, logicalSize * 0.5, logicalSize * 0.3, radius, [0, 0, 255], colors.blue.brightness);

    // 混合颜色
    const mixedData = mixColors([redCircle.data, greenCircle.data, blueCircle.data]);
    
    // 创建并显示最终图像：先放入逻辑，再缩放绘制到主画布
    const finalImage = new ImageData(mixedData, logicalSize);
    lctx.putImageData(finalImage, 0, 0);
    const dpr = dprRef.current;
    // 清理主画布（逻辑坐标）
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置再清除
    ctx.clearRect(0, 0, width, height);
    ctx.restore();
    // 缩放绘制
    ctx.drawImage(off, 0, 0, logicalSize, logicalSize, 0, 0, displaySize, displaySize);
  }, [width, height, displaySize, colors, drawCircle, mixColors]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    const px = Math.floor(cssX * scaleX);
    const py = Math.floor(cssY * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 直接读取像素，无需强制重绘（渲染已在 effect 中完成）
    try {
      const pixel = ctx.getImageData(px, py, 1, 1).data;
      const color = `RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      onColorHover(color, cssX, cssY);
    } catch {
      onColorHover(null, 0, 0);
    }
  }, [onColorHover]);

  const handlePointerLeave = useCallback(() => {
    onColorHover(null, 0, 0);
  }, [onColorHover]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}> 
      <div style={{ position: 'relative', width: '100%', maxWidth: maxSize, aspectRatio: '1 / 1' }}>
        <canvas
          ref={canvasRef}
          // 属性 width/height 在 renderCanvas 中动态设置，这里初始占位以避免 CLS
          width={displaySize || 0}
          height={displaySize || 0}
          onPointerMove={handlePointerMove}
            // 兼容旧浏览器：
          onMouseMove={handlePointerMove as any}
          onPointerLeave={handlePointerLeave}
          onMouseLeave={handlePointerLeave as any}
          className="bg-black rounded-lg w-full h-full block touch-none select-none"
          role="img"
          aria-label="RGB additive color mixing simulation"
        />
      </div>
    </div>
  );
}
