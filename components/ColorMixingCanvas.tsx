import { useEffect, useRef, useCallback } from 'react';
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
    // 如果是全黑，直接返回黑色
    if (color[0] === 0 && color[1] === 0 && color[2] === 0) {
      return [0, 0, 0];
    }

    // 如果饱和度为100%，直接返回原始颜色
    if (saturation === 100) {
      return [...color];
    }

    // 使用标准亮度公式计算灰度值
    // Y = 0.3R + 0.59G + 0.11B
    const gray = Math.round(
      0.3 * color[0] + 
      0.59 * color[1] + 
      0.11 * color[2]
    );

    // 如果饱和度为0，返回计算出的灰度值
    if (saturation === 0) {
      return [gray, gray, gray];
    }

    // 对于中间饱和度值，在灰度值和原始颜色之间进行线性插值
    const s = saturation / 100;
    return [
      Math.round(gray + (color[0] - gray) * s),
      Math.round(gray + (color[1] - gray) * s),
      Math.round(gray + (color[2] - gray) * s)
    ];
  };

  const drawCircle = useCallback((
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
    const featherSize = 2; // 边缘羽化的大小

    // 调整颜色的饱和度
    const adjustedColor = adjustColorBySaturation(color, saturation);
    const [r, g, b] = adjustedColor;
    const intensityFactor = brightness / 100;

    // 使用子像素渲染和平滑过渡
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const index = (py * width + px) * 4;
        
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
  }, [width, height]);

  const mixColors = useCallback((colors: Uint8ClampedArray[]) => {
    const result = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < result.length; i += 4) {
      let r = 0, g = 0, b = 0;
      let maxAlpha = 0;
      
      // 使用加色混合模型
      colors.forEach(color => {
        const alpha = color[i + 3] / 255;
        if (alpha > 0) {
          // 每个颜色分量取最大值
          r = Math.max(r, color[i] * alpha);
          g = Math.max(g, color[i + 1] * alpha);
          b = Math.max(b, color[i + 2] * alpha);
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
  }, [width, height]);

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
    const color = `RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
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
