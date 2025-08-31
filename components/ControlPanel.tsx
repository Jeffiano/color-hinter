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
    <div className="flex flex-col gap-4 p-4 bg-white/10 rounded-lg">
      <h3 className="text-lg font-semibold" style={{ color: displayColor }}>
        {colorName}
      </h3>
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
      <div className="text-xs">
        RGB: ({color.rgb.join(", ")})
      </div>
    </div>
  );
}
