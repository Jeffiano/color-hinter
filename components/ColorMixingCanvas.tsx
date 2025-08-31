import { useEffect, useRef, useState } from 'react';
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
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255 * (brightness / 100);
        }
      }
    }

    return imageData;
  };

  const mixColors = (colors: Uint8ClampedArray[]) => {
    const result = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < result.length; i += 4) {
      let r = 0, g = 0, b = 0, a = 0;
      
      // 加色混合
      colors.forEach(color => {
        const alpha = color[i + 3] / 255;
        r = Math.min(255, r + color[i] * alpha);
        g = Math.min(255, g + color[i + 1] * alpha);
        b = Math.min(255, b + color[i + 2] * alpha);
        a = Math.max(a, alpha);
      });

      result[i] = r;
      result[i + 1] = g;
      result[i + 2] = b;
      result[i + 3] = a * 255;
    }
    return result;
  };

  useEffect(() => {
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
  }, [width, height, colors]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    onColorHover(color, x, y);
  };

  const handleMouseLeave = () => {
    onColorHover(null, 0, 0);
  };

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
