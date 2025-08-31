import { useCallback, useRef } from 'react';
import styles from './ColorSlider.module.css';

interface ColorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

export function ColorSlider({ label, value, onChange, color }: ColorSliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);
  
  // 确保获取最新的滑块值并更新
  const updateValueFromSlider = useCallback(() => {
    if (sliderRef.current) {
      const currentValue = Math.min(100, Math.max(0, Number(sliderRef.current.value)));
      if (currentValue !== value) {
        onChange(currentValue);
      }
    }
  }, [value, onChange]);

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium min-w-[80px]" style={{ color }}>
        {label}
      </label>
      <div className="flex-1 flex items-center">
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max="100"
          step="0.01"
          value={value}
          onChange={(e) => {
            const newValue = Math.min(100, Math.max(0, Number(e.target.value)));
            onChange(newValue);
          }}
          onMouseUp={updateValueFromSlider}
          onTouchEnd={updateValueFromSlider}
          className={`w-full ${styles.slider}`}
          style={{
            '--color-start': `${color}22`,
            '--color-end': color,
            '--slider-value': `${value}%`,
            background: `linear-gradient(to right, 
              ${color}22 0%, 
              ${color} 100%)`
          } as React.CSSProperties}
        />
      </div>
      <span className="text-xs text-right min-w-[40px]">{value}%</span>
    </div>
  );
}
