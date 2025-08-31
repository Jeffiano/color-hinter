import { ColorState } from "@/types";
import { ColorSlider } from "./ColorSlider";

interface ControlPanelProps {
  color: ColorState;
  onChange: (updates: Partial<ColorState>) => void;
  colorName: string;
  displayColor: string;
}

export function ControlPanel({
  color,
  onChange,
  colorName,
  displayColor,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-2 py-2 px-3 bg-white/10 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: displayColor }}>
          {colorName}
        </h3>
        <div className="text-xs opacity-70">
          RGB: ({color.rgb.join(", ")})
        </div>
      </div>
      <ColorSlider
        label="Brightness"
        value={color.brightness}
        onChange={(value) => onChange({ brightness: value })}
        color={displayColor}
      />
      <ColorSlider
        label="Saturation"
        value={color.saturation}
        onChange={(value) => onChange({ saturation: value })}
        color={displayColor}
      />
    </div>
  );
}
