"use client";

import { useState, useEffect, useCallback } from "react";
import { ColorState, ColorControls, HoveredColor } from "@/types";
import { ControlPanel } from "@/components/ControlPanel";
import { ColorMixingCanvas } from "@/components/ColorMixingCanvas";

const initialState: ColorControls = {
  red: {
    brightness: 100,
    saturation: 100,
    rgb: [255, 0, 0],
  },
  green: {
    brightness: 100,
    saturation: 100,
    rgb: [0, 255, 0],
  },
  blue: {
    brightness: 100,
    saturation: 100,
    rgb: [0, 0, 255],
  },
};

export default function Home() {
  const [colors, setColors] = useState<ColorControls>(initialState);
  const [hoveredColor, setHoveredColor] = useState<HoveredColor | null>(null);

  const updateColor = useCallback((color: keyof ColorControls, updates: Partial<ColorState>) => {
    setColors((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        ...updates,
        rgb: calculateRGB(prev[color].brightness, prev[color].saturation, color),
      },
    }));
  }, []);

  const calculateRGB = (brightness: number, saturation: number, color: keyof ColorControls): [number, number, number] => {
    const value = Math.round((brightness / 100) * (saturation / 100) * 255);
    switch (color) {
      case "red":
        return [value, 0, 0];
      case "green":
        return [0, value, 0];
      case "blue":
        return [0, 0, value];
      default:
        return [0, 0, 0];
    }
  };

  const getMixedColor = useCallback((x: number, y: number): string => {
    // 计算每个光源的影响程度（0-1）
    const redInfluence = Math.max(0, Math.min(1, 1 - (Math.sqrt(Math.pow(x - 0.3, 2) + Math.pow(y - 0.6, 2)) / 0.4)));
    const greenInfluence = Math.max(0, Math.min(1, 1 - (Math.sqrt(Math.pow(x - 0.7, 2) + Math.pow(y - 0.6, 2)) / 0.4)));
    const blueInfluence = Math.max(0, Math.min(1, 1 - (Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.3, 2)) / 0.4)));

    // 正确的加色混合：每个光源都以其影响程度贡献最大亮度
    const r = Math.round(255 * Math.min(1, redInfluence + greenInfluence * 0.5 + blueInfluence * 0.5));
    const g = Math.round(255 * Math.min(1, greenInfluence + redInfluence * 0.5 + blueInfluence * 0.5));
    const b = Math.round(255 * Math.min(1, blueInfluence + redInfluence * 0.5 + greenInfluence * 0.5));

    // 当三种颜色的影响程度都接近1时，应该呈现纯白色
    const totalInfluence = (redInfluence + greenInfluence + blueInfluence) / 3;
    if (totalInfluence > 0.8) {
      return 'rgb(255, 255, 255)';
    }

    return `rgb(${r}, ${g}, ${b})`;
  }, [colors]);

  const reset = useCallback(() => {
    setColors(initialState);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">
        Color Mixing Demonstration
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Color mixing area */}
        <div className="relative mx-auto" aria-hidden="true" role="presentation">
          <ColorMixingCanvas
            width={600}
            height={600}
            colors={colors}
            onColorHover={(color, x, y) => {
              if (color) {
                setHoveredColor({ color, x, y });
              } else {
                setHoveredColor(null);
              }
            }}
          />
          {hoveredColor && (
            <div 
              className="absolute bg-black/80 px-3 py-1 rounded text-sm text-white whitespace-nowrap"
              style={{
                left: hoveredColor.x + 20,
                top: hoveredColor.y - 10,
                transform: 'translateY(-100%)'
              }}
            >
              {hoveredColor.color}
            </div>
          )}
        </div>

        {/* Control panels */}
        <div className="flex flex-col gap-2 w-full lg:w-[360px]">
          <ControlPanel
            color={colors.red}
            onChange={(updates) => updateColor("red", updates)}
            colorName="Red"
            displayColor="#ff0000"
          />
          <ControlPanel
            color={colors.green}
            onChange={(updates) => updateColor("green", updates)}
            colorName="Green"
            displayColor="#00ff00"
          />
          <ControlPanel
            color={colors.blue}
            onChange={(updates) => updateColor("blue", updates)}
            colorName="Blue"
            displayColor="#0000ff"
          />
          <button
            onClick={reset}
            className="mt-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm opacity-70">
        <p>Hover over the mixing area to see RGB values at any point.</p>
        <p>Use the sliders to adjust brightness and saturation of each color.</p>
      </div>
    </div>
  );
}
