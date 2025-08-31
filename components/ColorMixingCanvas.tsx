import { useEffect, useRef, useState, useCallback } from 'react';
import { ColorControls } from '@/types';

interface ColorMixingCanvasProps {
  width: number;
  height: number;
  colors: ColorControls;
  onColorHover: (color: string | null, x: number, y: number) => void;
}

export function ColorMixingCanvas({ width, height, colors, onColorHover }: ColorMixingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const adjustColorBySaturation = (color: [number, number, number], saturation: number): [number, number, number] => {
    // 将饱和度从百分比转换为0-1范围
    const s = saturation / 100;
    
    // 计算灰度值 (使用亮度公式: 0.299R + 0.587G + 0.114B)
    const gray = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
    
    // 根据饱和度在原色和灰色之间进行插值
    return [
      Math.round(gray + (color[0] - gray) * s),
      Math.round(gray + (color[1] - gray) * s),
      Math.round(gray + (color[2] - gray) * s),
    ];
  };

  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: [number, number, number],
    brightness: number,
    saturation: number
  ) => {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // 调整颜色的饱和度
    const adjustedColor = adjustColorBySaturation(color, saturation);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const index = (py * width + px) * 4;
        const dx = px - x;
        const dy = py - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          const [r, g, b] = adjustedColor;
          // 使用亮度控制颜色强度，但不影响 alpha 通道
          const intensityFactor = brightness / 100;
          data[index] = Math.round(r * intensityFactor);
          data[index + 1] = Math.round(g * intensityFactor);
          data[index + 2] = Math.round(b * intensityFactor);
          data[index + 3] = 255; // 保持完全不透明
        }
      }
    }

    return imageData;
  };

  const mixColors = (colors: Uint8ClampedArray[]) => {
    const result = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < result.length; i += 4) {
      let r = 0, g = 0, b = 0;
      
      // 直接加色混合，不使用 alpha 通道进行颜色混合
      colors.forEach(color => {
        r = Math.min(255, r + color[i]);
        g = Math.min(255, g + color[i + 1]);
        b = Math.min(255, b + color[i + 2]);
      });

      // 设置最终颜色值
      result[i] = Math.round(r);
      result[i + 1] = Math.round(g);
      result[i + 2] = Math.round(b);
      result[i + 3] = 255; // 保持完全不透明
    }
    return result;
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 创建三个光源的图像数据
    const radius = Math.min(width, height) * 0.3;
    const redCircle = drawCircle(ctx, width * 0.3, height * 0.6, radius, [255, 0, 0], colors.red.brightness, colors.red.saturation);
    const greenCircle = drawCircle(ctx, width * 0.7, height * 0.6, radius, [0, 255, 0], colors.green.brightness, colors.green.saturation);
    const blueCircle = drawCircle(ctx, width * 0.5, height * 0.3, radius, [0, 0, 255], colors.blue.brightness, colors.blue.saturation);

    // 混合颜色
    const mixedData = mixColors([redCircle.data, greenCircle.data, blueCircle.data]);
    
    // 创建并显示最终图像
    const finalImage = new ImageData(mixedData, width);
    ctx.putImageData(finalImage, 0, 0);
  }, [width, height, colors, drawCircle, mixColors]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 强制重新绘制画布以确保获取最新的像素数据
    const redraw = () => {
      ctx.clearRect(0, 0, width, height);
      const radius = Math.min(width, height) * 0.3;
      const redCircle = drawCircle(ctx, width * 0.3, height * 0.6, radius, [255, 0, 0], colors.red.brightness, colors.red.saturation);
      const greenCircle = drawCircle(ctx, width * 0.7, height * 0.6, radius, [0, 255, 0], colors.green.brightness, colors.green.saturation);
      const blueCircle = drawCircle(ctx, width * 0.5, height * 0.3, radius, [0, 0, 255], colors.blue.brightness, colors.blue.saturation);
      const mixedData = mixColors([redCircle.data, greenCircle.data, blueCircle.data]);
      const finalImage = new ImageData(mixedData, width);
      ctx.putImageData(finalImage, 0, 0);
    };

    redraw();
    
    // 获取最新的像素数据
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    onColorHover(color, x, y);
  }, [colors, width, height, onColorHover]);

  const handleMouseLeave = useCallback(() => {
    onColorHover(null, 0, 0);
  }, [onColorHover]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-black rounded-lg"
    />
  );
}
