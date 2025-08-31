interface ColorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

export function ColorSlider({ label, value, onChange, color }: ColorSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" style={{ color }}>
        {label}
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color}00, ${color})`,
        }}
      />
      <span className="text-xs text-right">{value}%</span>
    </div>
  );
}
