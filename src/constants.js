import { html, svg } from "lit";

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
  car_mode: "row",          // "row" (all devices at once) | "scroll" | "merged"
  car_scroll_interval: 5,   // seconds
  language: "auto",         // "auto" | "nl" | "en" | "de"
  flow_speed: 1.0,          // overall speed multiplier for the flowing dashes
  flow_max_power: 5000,     // W at which flow runs at full speed (and above)
  flow_off_delay: 20,       // seconds at ~0 W before a line fades out
  price_unit: "€/kWh",
  price_use_tibber_service: false, // true = fetch prices via the tibber.get_prices service call instead of price_entity attributes (for Tibber setups whose sensor has no price-array attribute)
  color_solar: "#f5c518",
  color_battery: "#4caf50",
  color_grid: "#ff6b5e",
  color_car: "#a78bfa",
  color_home: "#7dd3fc",
  include_car_in_home: false,
  battery_ring: true, // false = plain square icon like the other nodes, instead of the SoC ring
  car_ring: true,     // false = plain square icon; ring tracks whichever car is currently shown
  use_visual_layout: false, // true = show a house photo behind the flow diagram instead of abstract wires
  reduce_effects: false, // true = drop the neon glow filter / text-shadow, for weaker-GPU devices
  wire_style: "dashed", // "dashed" (flowing dashes, current look) | "neon" (solid glowing line)
  price_stops: DEFAULT_PRICE_STOPS,
  price_profile: "default", // "default" | "zonneplan" | "frank" | "tibber" | "anwb" | "eneco"
  price_relative_hours: false, // extra x-axis row: hours counted from now ("nu", 1, 2, 3…)
  price_show_day_marker: false, // thin line + "tomorrow" label where the axis crosses midnight
  gas_price_entity: "", // optional: shown next to the electricity price in the chart header
  chart_auto_scroll: false, // cycle price -> solar -> battery tabs automatically
  chart_scroll_interval: 8, // seconds between automatic tab switches
  // ---- fork additions ----
  solar_position: "right",  // "right" (grid top-left, solar top-right) | "left" (original layout)
  house_image_entity: "",   // image.* entity whose picture replaces the built-in house photo
  house_image_url: "",
  house_label_position: "left", // visual layout: "Home" text "left" of, "above" or "below" the picture
  house_image_scale: 100,   // size of the house picture in % of the flow height (30-130)      // alternative: plain URL, e.g. /local/haus.png
  visual_anchors: null,     // { grid:{x,y}, solar:{x,y}, battery:{x,y}, devices:{x,y} } in % of the picture
  history_range: "today",   // default time span for solar/grid/battery/usage/device charts
  show_daily_energy: true,  // small "today kWh" line with a direction arrow under every node
  tap_action: "graph",      // "graph" | "more-info" | "none"
  hold_action: "more-info", // "graph" | "more-info" | "none"
  color_grid_export: "#22c55e", // grid chart: area color for export (below zero)
  flow_min_power: 5,        // W: below this a branch counts as idle (line hidden; idle devices hidden unless display_zero)
  color_day_in: "#34d399",  // daily kWh into the house
  color_day_out: "#fb923c", // daily kWh out of the house
  grid_mode: "single",      // "single" (grid_power, signed) | "dual" (grid_import_power + grid_export_power)
  grid_invert: false,       // single: true = positive means export
  battery_mode: "dual",     // "dual" (battery_charge_power + battery_discharge_power) | "single" (battery_power, signed)
  battery_invert: false,    // single: true = positive means charging
  energy_grid_mode: "dual", // daily kWh: "dual" (energy_grid_import + energy_grid_export) | "single" (energy_grid, signed)
  energy_battery_mode: "dual",
  solar_forecast: true,     // solar forecast from the HA energy dashboard (Forecast.Solar, Solcast …), if configured there
  solar_forecast_node: true, // also show today's forecast kWh under the solar node
  device_colors: "energy",  // "energy" = same colours as the HA energy dashboard (fallback: auto) | "auto"
  devices_collapse: "expanded", // device row: "expanded" | "collapsed" | "top" (biggest N)
  devices_top_n: 4,
  show_ratios: true,        // PV self-consumption + self-sufficiency gauges under the flow
  date_selection: "auto",   // "auto" (follow the HA energy date selection card), "card" (own date bar), "none"
  price_show_costs: true,
  home_show_costs: true,    // today's electricity costs under the house   // price chart: costs of the grid import today (and yesterday for windows > 24 h)
  price_axis_auto: true,    // price chart: axis starts just below the lowest price (negative prices supported)
  price_show_minmax: false, // mark each day's highest / lowest price in the price chart
  // "Usage" tab: last-hour power (W) breakdown by source (solar/battery/grid). Reuses the
  // solar_power/battery_charge_power/battery_discharge_power/grid_power entities already
  // configured for the flow diagram — no separate entities needed.
};

// Device presets for the "devices" list (formerly cars only). `type: "car"` keeps the
// car-specific behaviour (charging label, SoC ring, guest-car detection).
export const DEVICE_PRESETS = [
  { id: "car", icon: "mdi:car-electric" },
  { id: "wallbox", icon: "mdi:ev-station" },
  { id: "ac", icon: "mdi:air-conditioner" },
  { id: "heatpump", icon: "efp:heat-pump" },
  { id: "gardenpump", icon: "mdi:water-pump" },
  { id: "oven", icon: "mdi:toaster-oven" },
  { id: "hob", icon: "mdi:stove" },
  { id: "waterheater", icon: "mdi:water-boiler" },
  { id: "washer", icon: "mdi:washing-machine" },
  { id: "dryer", icon: "mdi:tumble-dryer" },
  { id: "dishwasher", icon: "mdi:dishwasher" },
  { id: "pool", icon: "mdi:pool" },
  { id: "heater", icon: "mdi:heating-coil" },
  { id: "other", icon: "mdi:power-plug" },
];

// Colors used for device series in the "devices" chart when a device has no own color.
// Candidate colours for devices (vivid, readable on dark and light backgrounds). The card
// picks from these the one that differs most (CIELAB distance) from all colours in use.
export const DEVICE_PALETTE = [
  "#a78bfa", "#f472b6", "#2dd4bf", "#a3e635", "#fdba74", "#ffffff", "#0e7490", "#7c3aed",
  "#b45309", "#be123c", "#fda4af", "#4d7c0f", "#60a5fa", "#f59e0b", "#d946ef", "#94a3b8",
  "#4ade80", "#6366f1", "#fde68a", "#06b6d4", "#38bdf8", "#fb923c", "#facc15", "#f87171",
  "#c084fc", "#5eead4", "#e879f9", "#bef264", "#93c5fd", "#ef4444", "#10b981", "#8b5cf6",
  "#ec4899", "#84cc16", "#14b8a6", "#c2410c", "#e2e8f0", "#eab308", "#22d3ee", "#9333ea",
];

// Selectable time spans for the history charts (hours; "today" = since midnight).
export const HISTORY_RANGES = [
  { id: "1h", hours: 1 },
  { id: "6h", hours: 6 },
  { id: "today", hours: null },
  { id: "24h", hours: 24 },
  { id: "48h", hours: 48 },
  { id: "7d", hours: 168 },
];
export const PRICE_RANGES = [12, 24, 48];

// Default anchor points (in % of the house picture) where each wire ends in the visual layout.
export const DEFAULT_ANCHORS = {
  grid_left: { x: 17, y: 52 },  // grid node on the left (default in this fork): left wall
  grid_right: { x: 80, y: 40 }, // grid node on the right (original layout): right wall
  solar: { x: 46, y: 31 },      // roof panels
  battery: { x: 58, y: 63 },
  devices: { x: 76, y: 81 },
};

// Own icons (prefix "efp:") for things MDI doesn't draw convincingly. Everything else is
// passed straight to <ha-icon>.
const EFP_ICONS = {
  // heat pump outdoor unit: housing, fan with three blades, grille, feet and rising warmth
  "heat-pump": svg`
    <path d="M8.2 4.4c-.7-.7.7-1.3 0-2M11.2 4.4c-.7-.7.7-1.3 0-2M14.2 4.4c-.7-.7.7-1.3 0-2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path>
    <rect x="1.8" y="6" width="20.4" height="13.2" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"></rect>
    <circle cx="8.6" cy="12.6" r="4.4" fill="none" stroke="currentColor" stroke-width="1.3"></circle>
    <g fill="currentColor">
      <path d="M8.6 12.6c-.9-1.4-.7-3.3.9-3.9 1.4.9 1.1 2.9-.9 3.9z"></path>
      <path d="M8.6 12.6c-.9-1.4-.7-3.3.9-3.9 1.4.9 1.1 2.9-.9 3.9z" transform="rotate(120 8.6 12.6)"></path>
      <path d="M8.6 12.6c-.9-1.4-.7-3.3.9-3.9 1.4.9 1.1 2.9-.9 3.9z" transform="rotate(240 8.6 12.6)"></path>
      <circle cx="8.6" cy="12.6" r=".9"></circle>
    </g>
    <path d="M15.4 9.6h4.2M15.4 12.6h4.2M15.4 15.6h4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
    <path d="M5 19.2v1.8M19 19.2v1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>`,
};

export function renderIcon(icon, cls = "") {
  if (icon && icon.startsWith("efp:") && EFP_ICONS[icon.slice(4)]) {
    return html`<svg class="efp-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${EFP_ICONS[icon.slice(4)]}</svg>`;
  }
  return html`<ha-icon class="${cls}" icon="${icon || "mdi:power-plug"}"></ha-icon>`;
}
