"use client";

import { useState, useCallback } from "react";
import { ColorState, ColorControls, HoveredColor } from "@/types";
import { ControlPanel } from "@/components/ControlPanel";
import { ColorMixingCanvas } from "@/components/ColorMixingCanvas";
import Features from "@/components/Features";

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
    setColors((prev) => {
      const updatedState = {
        ...prev[color],
        ...updates
      };
      
      // 确保使用最新的值进行计算
      const rgb = calculateRGB(
        'brightness' in updates ? updates.brightness! : prev[color].brightness,
        'saturation' in updates ? updates.saturation! : prev[color].saturation,
        color
      );

      return {
        ...prev,
        [color]: {
          ...updatedState,
          rgb
        }
      };
    });
  }, []);

  const calculateRGB = (brightness: number, saturation: number, color: keyof ColorControls): [number, number, number] => {
    // 确保使用精确的小数计算
    const value = Math.round((Math.min(100, brightness) / 100) * (Math.min(100, saturation) / 100) * 255);
    // 确保值在 0-255 范围内
    const clampedValue = Math.min(255, Math.max(0, value));
    
    switch (color) {
      case "red":
        return [clampedValue, 0, 0];
      case "green":
        return [0, clampedValue, 0];
      case "blue":
        return [0, 0, clampedValue];
      default:
        return [0, 0, 0];
    }
  };

  // 移除未使用的函数

  const reset = useCallback(() => {
    setColors(initialState);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Interactive Color Mixing Lab
        </h1>
        <p className="text-xl text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Explore the fascinating world of color theory through our interactive RGB color mixing tool. Perfect for students, designers, and color enthusiasts! 🎨
        </p>

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

      <Features />
      </div>
    </div>
  );
}
