export const DEFAULT_PRICE_STOPS = [
  { value: 0.0, color: "#3b82f6" },  // blauw
  { value: 0.2, color: "#3b82f6" },  // blauw tot 0,20
  { value: 0.25, color: "#22c55e" }, // groen
  { value: 0.35, color: "#eab308" }, // geel
  { value: 0.7, color: "#ef4444" },  // rood
];

// Layout profiles: bootstrap the price chart to look like a known provider app.
// "bars"           -> classic bar chart, colored per price via a stop gradient (like today).
// "line"           -> smooth single-color line, no per-price coloring (Frank Energie style).
// "line-threshold" -> smooth line/area colored by whether a value is above or below the
//                      average of the shown prices (Tibber style).
export const PRICE_PROFILES = {
  default: {
    chart_style: "bars",
    price_stops: DEFAULT_PRICE_STOPS,
  },
  zonneplan: {
    chart_style: "bars",
    price_stops: [
      { value: 0.0, color: "#bbf7d0" },
      { value: 0.15, color: "#4ade80" },
      { value: 0.25, color: "#16a34a" },
      { value: 0.35, color: "#15803d" },
      { value: 0.6, color: "#052e16" },
    ],
    grey_past: true,          // hours that have already passed render grey instead of price-colored
    grey_unknown_value: 0.20, // slots without a known price yet render as a grey bar at this reference height
  },
  frank: {
    chart_style: "line",
    line_color: "#F2994A",
  },
  tibber: {
    chart_style: "line-threshold",
    color_below: "#00C9A7",
    color_above: "#FF7A29",
  },
  anwb: {
    chart_style: "bars",
    highlight_now: true, // color is not price-based: flat bar_color, except the current hour
    bar_color: "#1c4e80",
    bar_color_now: "#29b6f6",
  },
  eneco: {
    chart_style: "bars",
    bar_radius: "6px 6px 0 0",
    price_stops: [
      { value: 0.0, color: "#43a047" },
      { value: 0.299, color: "#43a047" },
      { value: 0.30, color: "#e53935" },
      { value: 1.0, color: "#e53935" },
    ],
  },
};

export const DEFAULTS = {
  show_flow: true,
  show_price: true,
  display_zero: false,
  price_hours: 24,
  price_start: "midnight", // "now" | "midnight"
  price_lookback_hours: 2, // 1-12: how far back the axis starts when price_start is "now"
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
  price_profile: "default", // "default" | "zonneplan" | "frank" | "tibber" | "anwb" | "eneco"
  price_relative_hours: false, // extra x-axis row: hours counted from now ("nu", 1, 2, 3…)
  price_show_day_marker: false, // thin line + "tomorrow" label where the axis crosses midnight
  gas_price_entity: "", // optional: shown next to the electricity price in the chart header
  chart_auto_scroll: false, // cycle price -> solar -> battery tabs automatically
  chart_scroll_interval: 8, // seconds between automatic tab switches
};
