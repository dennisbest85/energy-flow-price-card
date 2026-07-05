export const DEFAULT_PRICE_STOPS = [
  { value: 0.0, color: "#3b82f6" },
  { value: 0.2, color: "#3b82f6" },
  { value: 0.3, color: "#22c55e" },
  { value: 0.4, color: "#eab308" },
  { value: 0.6, color: "#ef4444" },
];

export const DEFAULTS = {
  show_flow: true,
  show_price: true,
  display_zero: false,
  price_hours: 24,
  price_start: "midnight", // "now" | "midnight"
  car_mode: "scroll",       // "scroll" | "merged"
  car_scroll_interval: 5,   // seconds
  price_unit: "€/kWh",
  color_solar: "#f5c518",
  color_battery: "#4caf50",
  color_grid: "#ff6b5e",
  color_car: "#a78bfa",
  color_home: "#7dd3fc",
  include_car_in_home: false,
  price_stops: DEFAULT_PRICE_STOPS,
};
