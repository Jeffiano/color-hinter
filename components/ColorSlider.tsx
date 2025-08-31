interface ColorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

export function ColorSlider({ label, value, onChange, color }: ColorSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium min-w-[80px]" style={{ color }}>
        {label}
      </label>
      <div className="flex-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color}00, ${color})`,
          }}
        />
      </div>
      <span className="text-xs text-right min-w-[40px]">{value}%</span>
    </div>
  );
}
