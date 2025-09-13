"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ColorState, ColorControls, HoveredColor } from "@/types";
import { ControlPanel } from "@/components/ControlPanel";
import { ColorMixingCanvas } from "@/components/ColorMixingCanvas";
import Features from "@/components/Features";

// SEO 优化：添加主页面的结构化数据
const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Interactive RGB Color Mixing Tool",
  "description": "Professional RGB color mixing tool for learning color theory, digital art, and photography. Real-time color blending with precise controls.",
  "url": "https://color-hinter.org",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Real-time RGB color mixing",
    "Interactive color theory learning",
    "Precise brightness controls",
    "Mobile-responsive design",
    "Educational tooltips and guides"
  ]
};

const initialState: ColorControls = {
  red: {
    brightness: 100,
    rgb: [255, 0, 0],
  },
  green: {
    brightness: 100,
    rgb: [0, 255, 0],
  },
  blue: {
    brightness: 100,
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

  const calculateRGB = (brightness: number, color: keyof ColorControls): [number, number, number] => {
    // 确保使用精确的小数计算
    const value = Math.round(Math.min(100, brightness) / 100 * 255);
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
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 w-full"
             style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-8" role="navigation" aria-label="Main navigation">
            <div className="text-xl font-bold text-white">Color Lab</div>
            <Link 
              href="/blog" 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              aria-label="Visit our color theory blog"
            >
              📝 Color Theory Blog
            </Link>
          </nav>

          <header>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center gradient-text">
              Interactive RGB Color Mixing Tool
            </h1>
            <p className="text-xl text-center text-gray-400 mb-8 max-w-2xl mx-auto">
              Master color theory through our professional RGB color mixing tool. Perfect for students, designers, and color enthusiasts learning digital art and photography! 🎨
            </p>
          </header>

        {/* Featured Blog Entry */}
        <div className="mb-12 text-center">
          <Link 
            href="/blog" 
            className="inline-block group"
          >
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-2xl p-8 max-w-2xl mx-auto hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">📚</span>
                <h2 className="text-2xl font-bold gradient-text-purple-blue">
                  Learn Color Theory
                </h2>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Dive deep into RGB fundamentals with our comprehensive guide: &ldquo;Understanding RGB: The Foundation of Digital Color Grading&rdquo;
              </p>
              <div className="inline-flex items-center text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                Read the Article
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Color mixing area */}
        <div className="relative mx-auto w-full max-w-[600px]" aria-hidden="true" role="presentation">
          <ColorMixingCanvas
            maxSize={600}
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
        <div className="flex flex-col gap-2 w-full lg:w-[360px] min-w-0 overflow-hidden">
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
        <p>Use the sliders to adjust brightness of each color.</p>
      </div>

      <Features />
        </div>
      </div>
    </>
  );
}
