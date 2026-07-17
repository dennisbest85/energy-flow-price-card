export const DEFAULT_PRICE_STOPS = [
  { value: 0.0, color: "#3b82f6" },  // blauw
  { value: 0.2, color: "#3b82f6" },  // blauw tot 0,20
  { value: 0.25, color: "#22c55e" }, // groen
  { value: 0.35, color: "#eab308" }, // geel
  { value: 0.7, color: "#ef4444" },  // rood
];

export const DEFAULTS = {
  show_flow: true,
  show_price: true,
  display_zero: false,
  price_hours: 24,
  price_start: "midnight", // "now" | "midnight"
  car_mode: "scroll",       // "scroll" | "merged"
  car_scroll_interval: 5,   // seconds
  language: "auto",         // "auto" | "nl" | "en" | "de"
  flow_speed: 1.0,          // overall speed multiplier for the flowing dashes
  flow_max_power: 5000,     // W at which flow runs at full speed (and above)
  flow_off_delay: 20,       // seconds at ~0 W before a line fades out
  price_unit: "€/kWh",
  color_solar: "#f5c518",
  color_battery: "#4caf50",
  color_grid: "#ff6b5e",
  color_car: "#a78bfa",
  color_home: "#7dd3fc",
  include_car_in_home: false,
  price_stops: DEFAULT_PRICE_STOPS,
};
