export interface ColorState {
  brightness: number;
  saturation: number;
  rgb: [number, number, number];
}

export interface HoveredColor {
  color: string;
  x: number;
  y: number;
}

export interface ColorControls {
  red: ColorState;
  green: ColorState;
  blue: ColorState;
}
