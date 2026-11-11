import { LitElement, html, css, svg, nothing } from "lit";
import { DEFAULTS, DEFAULT_PRICE_STOPS, PRICE_PROFILES, renderIcon, DEVICE_PRESETS, DEVICE_PALETTE, HISTORY_RANGES, PRICE_RANGES, DEFAULT_ANCHORS } from "./constants.js";
import { t, resolveLang } from "./translations.js";
import { VISUAL_HOUSE_IMAGE } from "./assets/visual-house.js";
import "./energy-flow-price-card-editor.js";

let _efpUidCounter = 0;

// Bring a provider price value into a sane EUR/kWh range.
// Some integrations report scaled integers (e.g. Zonneplan uses value x1e7,
// where 0.30 EUR/kWh arrives as 3000000). We divide by the power-of-ten scale
// that lands the value closest to a typical tariff (~0.05..1.00 EUR/kWh).
function normalizePrice(v) {
  if (v == null || isNaN(v)) return v;
  const a = Math.abs(v);
  if (a === 0) return 0;
  // Already a plausible EUR/kWh value.
  if (a >= 0.005 && a <= 5) return v;
  // Try each power of ten; choose the scaling that lands in the typical band.
  const scales = [1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9];
  let best = v, bestScore = Infinity;
  for (const s of scales) {
    const scaled = a / s;
    if (scaled < 0.02 || scaled > 2) continue;          // outside typical tariff band
    const score = Math.abs(Math.log(scaled / 0.25));     // closeness to ~0.25 EUR/kWh
    if (score < bestScore) { bestScore = score; best = v / s; }
  }
  return best;
}

// Determine one scale factor for a whole price series from providers that report scaled
// integers (e.g. Zonneplan's price_tax_included.amount, x1e7). Uses the median of the
// series rather than scaling each point independently — a single price spike can't skew
// the median enough to flip the detected scale, unlike normalizePrice() applied per point.
function detectPriceScale(rawValues) {
  const abs = rawValues.map((v) => Math.abs(v)).filter((v) => v > 0);
  if (!abs.length) return 1;
  const sorted = [...abs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  if (median >= 0.005 && median <= 5) return 1; // already plausible EUR/kWh
  const scales = [1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9];
  let best = 1, bestScore = Infinity;
  for (const s of scales) {
    const scaled = median / s;
    if (scaled < 0.02 || scaled > 2) continue;
    const score = Math.abs(Math.log(scaled / 0.25));
    if (score < bestScore) { bestScore = score; best = s; }
  }
  return best;
}

function num(hass, entity) {
  if (!entity || !hass || !hass.states[entity]) return null;
  const v = parseFloat(hass.states[entity].state);
  return isNaN(v) ? null : v;
}

function fmtPower(w) {
  if (w === null) return "–";
  const a = Math.abs(w);
  if (a >= 1000) return (w / 1000).toFixed(2).replace(".", ",") + " kW";
  return Math.round(w) + " W";
}

// Unit factor so power is always handled in W (kW / MW sensors are converted).
function unitFactor(u) {
  const s = u == null ? "" : String(u).trim();
  if (s === "kW") return 1000;
  if (s === "MW") return 1e6;
  return 1;
}
function pw(hass, entity) {
  const v = num(hass, entity);
  if (v === null) return null;
  return v * unitFactor(hass.states[entity]?.attributes?.unit_of_measurement);
}
function fmtKWh(kwh) {
  if (kwh == null || isNaN(kwh)) return "–";
  return kwh.toFixed(Math.abs(kwh) >= 100 ? 0 : 1).replace(".", ",");
}
// "/media/haus.png", "/homeassistant/media/haus.png", "media/haus.png" or a media-source id
// -> "media-source://media_source/local/haus.png"
function toMediaSource(u) {
  if (!u || typeof u !== "string") return null;
  const v = u.trim();
  if (v.startsWith("media-source://")) return v;
  const m = v.match(/^\/?(?:homeassistant\/|config\/)?media\/(.+)$/i);
  if (m && !/^\/?local\//i.test(v)) return "media-source://media_source/local/" + m[1].replace(/^local\//i, "");
  return null;
}

function polyD(pts) {
  return pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}
function addDays(ts, n) {
  const d = new Date(ts);
  d.setDate(d.getDate() + n);
  return d.getTime();
}
function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// perceptual colour difference (CIE76 in CIELAB)
function toLab(hex) {
  const [r, g, b] = hex2rgb(hex).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047), y = f(r * 0.2126 + g * 0.7152 + b * 0.0722), z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
function colorDist(a, b) {
  try { const p = toLab(a), q = toLab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); } catch (e) { return 999; }
}
function hsl2hex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgb2hex(f(0) * 255, f(8) * 255, f(4) * 255);
}

function hex2rgb(h) {
  const m = h.replace("#", "");
  const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
function rgb2hex(r, g, b) {
  const c = (x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
function colorForValue(value, stops) {
  if (!stops || !stops.length) return "#888";
  const s = [...stops].sort((a, b) => a.value - b.value);
  if (value <= s[0].value) return s[0].color;
  if (value >= s[s.length - 1].value) return s[s.length - 1].color;
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i], b = s[i + 1];
    if (value >= a.value && value <= b.value) {
      const t = (value - a.value) / (b.value - a.value || 1);
      const ca = hex2rgb(a.color), cb = hex2rgb(b.color);
      return rgb2hex(ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t);
    }
  }
  return s[s.length - 1].color;
}

// Catmull-Rom-style smoothing converted to cubic beziers, for the "line" layout profiles.
function catmullRomToBezierPath(pts) {
  if (!pts.length) return "";
  if (pts.length === 1) return `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  if (pts.length === 2) {
    return `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)} L${pts[1].x.toFixed(2)},${pts[1].y.toFixed(2)}`;
  }
  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

// Walk a polyline (array of {x,y}) by real arc-length, for placing a fade exactly at
// the tips of a bent wire instead of approximating it over the straight-line distance
// (which drifts into the bend as soon as the path isn't straight).
function polyLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return L;
}
function polyPointAt(pts, d) {
  let remain = Math.max(0, d);
  for (let i = 1; i < pts.length; i++) {
    const segLen = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (remain <= segLen || i === pts.length - 1) {
      const t = segLen ? Math.min(1, remain / segLen) : 0;
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t, seg: i };
    }
    remain -= segLen;
  }
  return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y, seg: pts.length - 1 };
}
function subPathD(pts, dStart, dEnd) {
  const a = polyPointAt(pts, dStart);
  const b = polyPointAt(pts, dEnd);
  const mid = pts.slice(a.seg, b.seg);
  const all = [a, ...mid, b];
  return all.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

// Y-axis for the price chart. auto=true: tight range around the actual prices with round
// steps (lower edge just below the lowest price, negative prices included); auto=false:
// the classic axis from 0 (or from the lowest negative price) up to the maximum.
function priceScale(vals, auto, roomTop) {
  let min = vals.length ? Math.min(...vals) : 0;
  let max = vals.length ? Math.max(...vals) : 0.4;
  if (!vals.length) { min = 0; max = 0.4; }
  const nice = [0.001, 0.002, 0.0025, 0.005, 0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5];
  let lo, hi;
  if (auto) {
    const span = Math.max(max - min, Math.abs(max) * 0.1, 0.01);
    lo = min - span * 0.12;
    hi = max + span * (roomTop ? 0.3 : 0.1);
    if (min >= 0 && lo < 0) lo = 0;
  } else {
    lo = Math.min(0, min * 1.1);
    hi = Math.max(max, 0.1) * (roomTop ? 1.22 : 1.1);
  }
  const step = nice.find((n) => (hi - lo) / n <= 5) || 5;
  lo = Math.floor(lo / step + 1e-9) * step;
  hi = Math.ceil(hi / step - 1e-9) * step;
  if (hi - lo < step) hi = lo + step;
  const ticks = [];
  for (let v = hi; v >= lo - step / 2; v -= step) ticks.push(Math.abs(v) < step / 1000 ? 0 : v);
  const dec = step >= 0.1 ? (step >= 1 ? 0 : (step * 10) % 1 === 0 ? 1 : 2) : step >= 0.01 ? 2 : 3;
  return { lo, hi, ticks, dec: Math.max(dec, 2), fr: (v) => (v - lo) / (hi - lo) };
}

// kWh and € of a list of power samples ({t, dur, v in W}) between a and b, priced with the
// price valid at each sample's midpoint
function costCalc(samples, priceList, a0, b0) {
  const prices = priceList.filter((x) => x && !isNaN(x.t) && x.v != null && !isNaN(x.v)).sort((x, y) => x.t - y.t);
  const priceAt = (t) => {
    let lo = 0, hi = prices.length - 1, best = null;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (prices[m].t <= t) { best = prices[m]; lo = m + 1; } else hi = m - 1; }
    return best ? best.v : null;
  };
  let kwh = 0, eur = 0, priced = false;
  for (const p of samples) {
    const a = Math.max(p.t, a0), b = Math.min(p.t + p.dur, b0);
    if (b <= a || !p.v) continue;
    const e = (p.v * (b - a)) / 3600000 / 1000;
    kwh += e;
    const pr = prices.length ? priceAt(a + (b - a) / 2) : null;
    if (pr != null) { eur += e * pr; priced = true; }
  }
  return { kwh, eur: priced ? eur : null };
}

// Reduce a dense history series to at most ~n points (bucket averages).
function downsample(pts, start, end, n) {
  if (pts.length <= n * 1.5) return pts;
  const span = Math.max(1, end - start);
  const out = [];
  let bucket = -1, sum = 0, cnt = 0, t0 = 0;
  for (const p of pts) {
    const b = Math.min(n - 1, Math.max(0, Math.floor(((p.t - start) / span) * n)));
    if (b !== bucket) {
      if (cnt) out.push({ t: t0, v: sum / cnt });
      bucket = b; sum = 0; cnt = 0; t0 = p.t;
    }
    sum += p.v; cnt++;
  }
  if (cnt) out.push({ t: t0, v: sum / cnt });
  return out;
}

// Combine several step series into one (e.g. battery net = discharge − charge).
function mergeSeries(arrs, fn) {
  if (!arrs.some((a) => a.length)) return [];
  const times = [...new Set(arrs.flatMap((a) => a.map((p) => p.t)))].sort((a, b) => a - b);
  const idx = arrs.map(() => 0);
  const cur = arrs.map(() => 0);
  return times.map((t) => {
    arrs.forEach((a, i) => {
      while (idx[i] < a.length && a[idx[i]].t <= t) { cur[i] = a[idx[i]].v; idx[i]++; }
    });
    return { t, v: fn(cur) };
  });
}

// X-axis labels for an arbitrary time span, aligned to round local times.
function timeLabels(startMs, endMs, lang, endIsNow = true) {
  const span = Math.max(1, endMs - startMs);
  const MIN = 60000;
  const steps = [5, 10, 15, 30, 60, 120, 180, 240, 360, 720, 1440, 2880].map((m) => m * MIN);
  const step = steps.find((s) => span / s <= 6) || 2880 * MIN;
  const mid = new Date(startMs);
  mid.setHours(0, 0, 0, 0);
  const base = mid.getTime();
  const out = [];
  for (let t = base + Math.ceil((startMs - base) / step) * step; t <= endMs; t += step) {
    const d = new Date(t);
    const frac = (t - startMs) / span;
    if (endIsNow && frac > 0.86) break;
    let text;
    if (step >= 1440 * MIN || (span > 86400000 && d.getHours() === 0 && d.getMinutes() === 0)) {
      text = d.toLocaleDateString(lang, { weekday: "short" });
    } else {
      text = d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
    }
    out.push({ frac, text });
  }
  if (endIsNow) {
    const now = new Date(endMs);
    out.push({ frac: 1, text: now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0") });
  }
  return out;
}

class EnergyFlowPriceCard extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  constructor() {
    super();
    this._uid = ++_efpUidCounter;
  }

  static getConfigElement() {
    return document.createElement("energy-flow-price-card-editor");
  }

  static getStubConfig() {
    return {
      show_flow: true,
      show_price: true,
      solar_power: "",
      grid_power: "",
      battery_charge_power: "",
      battery_discharge_power: "",
      battery_soc: "",
      cars: [],
      price_entity: "",
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...DEFAULTS, ...config };
    if (!Array.isArray(this._config.price_stops) || !this._config.price_stops.length) {
      this._config.price_stops = DEFAULT_PRICE_STOPS;
    }
    if (!PRICE_PROFILES[this._config.price_profile]) {
      this._config.price_profile = "default";
    }
    if (!Array.isArray(this._config.cars)) this._config.cars = [];
    if (this._carScrollIdx == null) this._carScrollIdx = 0;
    this._startCarScroll();
    this._startChartScroll();
  }

  getCardSize() {
    return (this._config.show_flow ? 3 : 0) + (this._config.show_price ? 3 : 0) || 1;
  }

  _homePower(v) {
    if (v.solar === null && v.grid === null && v.charge === null && v.discharge === null) return null;
    let h = 0;
    if (v.solar !== null) h += v.solar;
    if (v.grid !== null) h += v.grid;
    if (v.discharge !== null) h += v.discharge;
    if (v.charge !== null) h -= v.charge;
    if (this._config.include_car_in_home) {
      for (const car of this._cars()) {
        const p = pw(this.hass, car.power);
        if (p !== null) h -= p;
      }
    }
    return h;
  }

  // Grid / battery can come from ONE signed entity or TWO separate entities.
  // Normalised sign: + = towards the house (grid import, battery discharge),
  //                  − = away from the house (grid export, battery charge).
  _src(kind) {
    const c = this._config;
    if (kind === "grid") {
      if (c.grid_mode === "dual") {
        return { dual: true, pos: c.grid_import_power, neg: c.grid_export_power, entities: [c.grid_import_power, c.grid_export_power].filter(Boolean) };
      }
      return { dual: false, signed: c.grid_power, sign: c.grid_invert ? -1 : 1, entities: [c.grid_power].filter(Boolean) };
    }
    if (c.battery_mode === "single") {
      return { dual: false, signed: c.battery_power, sign: c.battery_invert ? -1 : 1, entities: [c.battery_power].filter(Boolean) };
    }
    return { dual: true, pos: c.battery_discharge_power, neg: c.battery_charge_power, entities: [c.battery_discharge_power, c.battery_charge_power].filter(Boolean) };
  }

  _srcValue(kind) {
    const s = this._src(kind);
    if (!s.dual) { const v = pw(this.hass, s.signed); return v === null ? null : v * s.sign; }
    const a = pw(this.hass, s.pos), b = pw(this.hass, s.neg);
    if (a === null && b === null) return null;
    return Math.abs(a || 0) - Math.abs(b || 0);
  }

  _srcSeries(kind, byEntity) {
    const s = this._src(kind);
    if (!s.dual) return (byEntity[s.signed] || []).map((p) => ({ t: p.t, v: p.v * s.sign }));
    const a = byEntity[s.pos] || [], b = byEntity[s.neg] || [];
    if (!a.length && !b.length) return [];
    return mergeSeries([a, b], ([x, y]) => Math.abs(x) - Math.abs(y));
  }

  // Live values in the shape the flow/home calculation expects.
  _liveV() {
    const g = this._srcValue("grid");
    const b = this._srcValue("battery");
    return {
      solar: pw(this.hass, this._config.solar_power),
      grid: g,
      charge: b === null ? null : Math.max(0, -b),
      discharge: b === null ? null : Math.max(0, b),
      soc: num(this.hass, this._config.battery_soc),
    };
  }

  // Power (W) below which a branch counts as idle: its line is hidden and, unless
  // display_zero is on, an idle device disappears from the device row.
  _thr() {
    const v = parseFloat(this._config?.flow_min_power);
    return isNaN(v) ? 5 : Math.max(0, v);
  }

  _cars() {
    return Array.isArray(this._config.cars) ? this._config.cars : [];
  }

  _t(key) {
    return t(resolveLang(this._config?.language, this.hass), key);
  }

  _activeProfile() {
    return PRICE_PROFILES[this._config?.price_profile] || PRICE_PROFILES.default;
  }

  // Per-wire animation state: tracks last time a wire had meaningful power,
  // so lines can fade in when active and fade out after flow_off_delay seconds.
  // `reversed` is the wire's raw current direction (e.g. grid export vs import); when
  // it flips, the displayed direction only follows after a brief fade-out/in so a wire
  // that oscillates rapidly (a jittery sensor near 0 W) settles instead of snapping the
  // line's shape back and forth instantly.
  // Returns { show, moving, duration (s), fade ('in'|'out'|null), reversed, dirSwap }.
  _wireState(key, power, reversed = false, thr = null) {
    this._wires = this._wires || {};
    const now = Date.now();
    const c = this._config;
    const p = power === null ? 0 : Math.abs(power);
    const active = p > (thr ?? this._thr());
    let w = this._wires[key];
    if (!w) w = this._wires[key] = { lastActive: active ? now : 0, shownSince: active ? now : 0, wasShown: active, dispReversed: reversed, dirPhase: "idle", dirPhaseStart: 0 };

    if (active) {
      w.lastActive = now;
      if (!w.wasShown) { w.wasShown = true; w.shownSince = now; }
    }
    const offDelay = Math.max(0, (c.flow_off_delay ?? 20)) * 1000;
    const sinceActive = now - w.lastActive;
    const show = active || (w.wasShown && sinceActive < offDelay);
    if (!show) w.wasShown = false;

    // Direction-change crossfade: dip to 0 opacity, swap the path shape while
    // invisible, then fade back in — instead of an abrupt instant redraw.
    const DIR_FADE_MS = 320;
    if (w.dirPhase === "idle" && reversed !== w.dispReversed) {
      w.dirPhase = "out";
      w.dirPhaseStart = now;
      setTimeout(() => this.requestUpdate(), DIR_FADE_MS + 10);
    } else if (w.dirPhase === "out" && now - w.dirPhaseStart >= DIR_FADE_MS) {
      w.dispReversed = reversed;
      w.dirPhase = "in";
      w.dirPhaseStart = now;
      setTimeout(() => this.requestUpdate(), DIR_FADE_MS + 10);
    } else if (w.dirPhase === "in" && now - w.dirPhaseStart >= DIR_FADE_MS) {
      w.dirPhase = "idle";
    }
    const dirSwap = w.dirPhase !== "idle";

    // speed: strictly proportional to the power (twice the watts -> twice as fast), so
    // lines can be compared with each other. Capped at flow_max_power (full speed) and
    // with a small floor so a few watts still visibly move. flow_speed scales everything.
    const maxP = Math.max(100, c.flow_max_power ?? 5000);
    const frac = Math.max(0, Math.min(1, p / maxP));
    const speedMul = Math.max(0.1, c.flow_speed ?? 1.0);
    const MAX_RATE = 6;                                  // animation cycles per second at full power
    const rate = Math.max(0.06, MAX_RATE * frac) * speedMul;
    const duration = active ? 1 / rate : 0;

    // fade direction
    let fade = null;
    if (active && now - w.shownSince < 800) fade = "in";
    else if (!active && show) fade = "out";
    if (w.dirPhase === "out") fade = "out";
    else if (w.dirPhase === "in") fade = "in";

    return { show, moving: active, duration, fade, reversed: w.dispReversed, dirSwap };
  }

  // Ensure the card keeps repainting while any wire is counting down to fade-out,
  // even if Home Assistant sends no new state updates.
  _scheduleFlowTick() {
    if (this._flowTimer) return;
    this._flowTimer = setInterval(() => {
      const wires = this._wires || {};
      const now = Date.now();
      const offDelay = Math.max(0, (this._config?.flow_off_delay ?? 20)) * 1000;
      const list = Object.values(wires);
      const fading = list.some((w) => w.wasShown && now - w.lastActive > 900 && now - w.lastActive < offDelay + 1000);
      if (fading) this.requestUpdate();
      if (!list.some((w) => w.wasShown)) { clearInterval(this._flowTimer); this._flowTimer = null; }
    }, 1000);
  }

  // Fetch prices via the tibber.get_prices service call (return_response) instead of an
  // entity attribute — for Tibber setups whose sensor only exposes daily stats, not a
  // price array. Picks the first home returned; multi-home Tibber accounts aren't
  // distinguished (matches the only known-working example config for this).
  async _ensureTibberPrices() {
    if (!this.hass?.connection) return;
    const cached = this._tibberPrices;
    if (cached && Date.now() - cached.fetched < 900000) return; // refresh every 15 min
    try {
      const end = new Date(Date.now() + 2 * 86400000).toISOString();
      const res = await this.hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "tibber",
        service: "get_prices",
        return_response: true,
        service_data: { end },
      });
      const homes = res?.response?.prices || {};
      const data = Object.values(homes)[0] || [];
      this._tibberPrices = { fetched: Date.now(), data };
      this.requestUpdate();
    } catch (e) {
      this._tibberPrices = { fetched: Date.now(), data: [], error: true };
      this.requestUpdate();
    }
  }

  _tibberPriceData() {
    const data = this._tibberPrices?.data || [];
    const seen = new Set();
    const merged = [];
    for (const p of data) {
      const from = p.start_time ?? p.from;
      const price = p.price ?? p.total;
      const t = from ? new Date(from).getTime() : null;
      let val = typeof price === "number" ? price : parseFloat(price);
      if (t && !isNaN(val)) {
        val = normalizePrice(val);
        if (!seen.has(t)) { seen.add(t); merged.push({ t, v: val }); }
      }
    }
    merged.sort((a, b) => a.t - b.t);
    const now = Date.now();
    let current = null;
    for (const p of merged) { if (p.t <= now) current = p.v; else break; }
    return { points: merged, current };
  }

  _priceData() {
    const cfg = this._config;
    if (cfg.price_use_tibber_service) return this._tibberPriceData();
    const ent = this.hass?.states?.[cfg.price_entity];
    if (!ent) return { points: [], current: null };
    const attrs = ent.attributes || {};
    const candidates = [
      attrs.prices, attrs.prices_today, attrs.today, attrs.raw_today,
      attrs.data, attrs.forecast, attrs.raw_tomorrow, attrs.prices_tomorrow, attrs.tomorrow,
    ].filter(Boolean);
    let merged = [];
    const seen = new Set();
    for (const arr of candidates) {
      if (!Array.isArray(arr)) continue;
      for (const p of arr) {
        const from = p.from ?? p.start ?? p.start_time ?? p.start_date ?? p.time ?? p.datetime ?? p.date;
        // Zonneplan nests price under objects; also uses electricity_price (x1e7).
        // EPEX Spot Data integration uses price_per_kwh (start_time/end_time), 15-min slots.
        let price = p.price ?? p.value ?? p.total ?? p.price_per_kwh ?? p.marketPrice ?? p.market_price ??
          p.electricity ?? p.electricity_price ??
          p.price_tax_included?.amount ?? p.price_tax_excluded?.amount;
        const t = from ? new Date(from).getTime() : null;
        const val = typeof price === "number" ? price : parseFloat(price);
        if (t && !isNaN(val) && !seen.has(t)) { seen.add(t); merged.push({ t, raw: val }); }
      }
    }
    merged.sort((a, b) => a.t - b.t);
    // Auto-scale providers that report scaled integers (e.g. Zonneplan x1e7): detect ONE
    // scale for the whole series (from the median), not per point. Guessing per point let
    // an individual price spike (e.g. one quarter above ~0.79 EUR/kWh at a x1e7 scale)
    // occasionally get misjudged as a completely different magnitude than its neighbours,
    // rendering a false, isolated crash to near-zero exactly where the real price peaked.
    const scale = detectPriceScale(merged.map((p) => p.raw));
    const points = merged.map((p) => ({ t: p.t, v: p.raw / scale }));
    let current = num(this.hass, cfg.price_entity);
    if (current !== null) current = normalizePrice(current);
    return { points, current };
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    return html`
      <ha-card>
        <div class="stack">
          ${this._config.date_selection === "card" ? this._renderDateBar() : nothing}
          ${this._config.show_flow ? this._renderFlow() : nothing}
          ${this._config.show_price ? this._renderPrice() : nothing}
        </div>
      </ha-card>
    `;
  }

  // Own date bar: kind (day/week/month/year/range), ‹ label ›, calendar, "today".
  _ownRange(kind, anchor) {
    const d = new Date(startOfDay(anchor));
    if (kind === "week") { const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return { start: d.getTime(), end: addDays(d.getTime(), 7) }; }
    if (kind === "month") { d.setDate(1); const e = new Date(d); e.setMonth(e.getMonth() + 1); return { start: d.getTime(), end: e.getTime() }; }
    if (kind === "year") { d.setMonth(0, 1); const e = new Date(d); e.setFullYear(e.getFullYear() + 1); return { start: d.getTime(), end: e.getTime() }; }
    return { start: d.getTime(), end: addDays(d.getTime(), 1) };
  }
  _ownSet(kind, start, end) {
    this._ownKind = kind;
    const today = startOfToday();
    if (kind === "day" && start === today) this._own = null;
    else this._own = { kind, start, end };
    this._cursor = null;
    this.requestUpdate();
  }
  _ownShift(dir) {
    const kind = this._ownKind || "day";
    const cur = this._own || this._ownRange(kind, Date.now());
    if (kind === "range") {
      const len = cur.end - cur.start;
      return this._ownSet("range", cur.start + dir * len, cur.end + dir * len);
    }
    const a = new Date(cur.start);
    if (kind === "day") a.setDate(a.getDate() + dir);
    else if (kind === "week") a.setDate(a.getDate() + 7 * dir);
    else if (kind === "month") a.setMonth(a.getMonth() + dir);
    else a.setFullYear(a.getFullYear() + dir);
    const r = this._ownRange(kind, a.getTime());
    this._ownSet(kind, r.start, r.end);
  }
  _renderDateBar() {
    const T = (k) => this._t(k);
    const kind = this._ownKind || "day";
    const cur = this._own || this._ownRange(kind, Date.now());
    const label = this._periodLabel(cur.start, cur.end);
    const isNow = cur.start <= Date.now() && Date.now() < cur.end;
    const iso = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
    const parse = (v) => { const [y, m, dd] = v.split("-").map(Number); return new Date(y, m - 1, dd).getTime(); };
    const pick = (e) => {
      if (!e.target.value) return;
      const r = this._ownRange(kind === "range" ? "day" : kind, parse(e.target.value));
      this._ownSet(kind === "range" ? "day" : kind, r.start, r.end);
    };
    return html`
      <div class="datebar">
        <select class="dkind" @change=${(e) => {
          const k = e.target.value;
          if (k === "range") { const r = this._own || this._ownRange("day", Date.now()); this._ownSet("range", r.start, r.end); return; }
          const r = this._ownRange(k, this._own ? this._own.start : Date.now()); this._ownSet(k, r.start, r.end);
        }}>
          ${["day", "week", "month", "year", "range"].map((k) => html`<option value=${k} ?selected=${k === kind}>${T("dsel_" + k)}</option>`)}
        </select>
        <button class="dnav" @click=${() => this._ownShift(-1)}>‹</button>
        ${kind === "range" ? html`
          <input class="ddate" type="date" .value=${iso(cur.start)} max=${iso(cur.end - 1)} @change=${(e) => e.target.value && this._ownSet("range", parse(e.target.value), Math.max(parse(e.target.value) + 86400000, cur.end))} />
          <span class="dsep">–</span>
          <input class="ddate" type="date" .value=${iso(cur.end - 1)} min=${iso(cur.start)} @change=${(e) => e.target.value && this._ownSet("range", cur.start, addDays(parse(e.target.value), 1))} />`
        : html`
          <label class="dlabel"><ha-icon icon="mdi:calendar"></ha-icon><span>${label}</span>
            <input class="dhidden" type="date" .value=${iso(cur.start)} @change=${pick}
              @click=${(e) => { try { e.target.showPicker && e.target.showPicker(); } catch (x) { /* ignore */ } }} />
          </label>`}
        <button class="dnav" ?disabled=${isNow} @click=${() => this._ownShift(1)}>›</button>
        ${this._own ? html`<button class="dtoday" @click=${() => { this._own = null; this._ownKind = "day"; this._cursor = null; this.requestUpdate(); }}>${T("today")}</button>` : nothing}
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Devices (formerly "cars"). The config key stays `cars` so existing dashboards keep
  // working; each entry may now carry `type` (preset id), `icon`, `color` and `energy`.
  // ---------------------------------------------------------------------------
  _devices() {
    return this._cars().map((d) => ({ ...d, type: d.type || "car" }));
  }

  // One distinct colour per device: own colour if set, otherwise the next palette colour that
  // is clearly different from all colours already in use and from the node colours
  // (solar/grid/battery/home); beyond the palette further hues are generated.
  // Energy dashboard preferences (for device colours and import), refreshed every 10 min.
  _energyPrefs() {
    const e = this._eprefs;
    if (!this.hass?.callWS) return null;
    if (!e || (!e.busy && Date.now() - e.fetched > 600000)) {
      this._eprefs = { ...(e || {}), busy: true, fetched: Date.now() };
      this.hass.callWS({ type: "energy/get_prefs" })
        .then((p) => { this._eprefs = { prefs: p, busy: false, fetched: Date.now() }; this._dcm = null; this.requestUpdate(); })
        .catch(() => { this._eprefs = { prefs: null, busy: false, fetched: Date.now() }; });
    }
    return this._eprefs?.prefs || null;
  }

  // The colour HA's energy dashboard uses for a device: --graph-color-N by its position in
  // the energy dashboard's device list.
  _energyColorOf(d) {
    const prefs = this._energyPrefs();
    const list = prefs?.device_consumption || [];
    if (!list.length) return null;
    const idx = list.findIndex((x) => (d.energy && x.stat_consumption === d.energy) || (d.power && x.stat_rate === d.power));
    if (idx < 0) return null;
    const fetched = this._eprefs?.fetched;
    if (!this._gcols || this._gcols.fetched !== fetched) {
      let cs = null;
      try { cs = getComputedStyle(this); } catch (e) { /* not attached yet */ }
      if (!cs) return null;
      this._gcols = { fetched, cols: Array.from({ length: 54 }, (_, k) => (cs.getPropertyValue(`--graph-color-${k + 1}`) || "").trim()) };
    }
    return this._gcols.cols[idx % 54] || null;
  }

  _devColors() {
    const c = this._config;
    const devs = this._devices();
    const okHex = (x) => /^#[0-9a-f]{6}$/i.test(x || "");
    const reserved = [c.color_solar, c.color_grid, c.color_battery, c.color_home].filter(okHex);
    const useEnergy = c.device_colors !== "auto";
    const eCols = devs.map((d) => (useEnergy && !d.color ? this._energyColorOf(d) : null));
    const key = JSON.stringify([devs.map((d) => d.color || ""), eCols, c.color_car, reserved]);
    if (this._dcm && this._dcm.key === key) return this._dcm.map;
    const map = devs.map((d, i) => d.color || eCols[i] || null);
    const used = map.filter(Boolean).map((x) => (okHex(x) ? x : null)).filter(Boolean);
    const cand = [...DEVICE_PALETTE];
    for (let k = 0; k < 36; k++) cand.push(hsl2hex((k * 137.508) % 360, 75, k % 2 ? 72 : 58));
    const minDist = (col, list) => list.reduce((m, u) => Math.min(m, colorDist(col, u)), 999);
    let first = true;
    devs.forEach((d, i) => {
      if (map[i]) return;
      let col = null;
      // the first device keeps the "devices" colour unless it clashes with an own colour
      if (first && okHex(c.color_car) && minDist(c.color_car, used) > 25) col = c.color_car;
      first = false;
      if (!col) {
        let best = -1;
        for (const k of cand) {
          if (used.includes(k)) continue;
          const score = Math.min(minDist(k, used), minDist(k, reserved) * 1.3);
          if (score > best) { best = score; col = k; }
        }
      }
      map[i] = col || DEVICE_PALETTE[i % DEVICE_PALETTE.length];
      used.push(map[i]);
    });
    this._dcm = { key, map };
    return map;
  }

  _deviceIcon(d) {
    // older configs stored the MDI heat pump; use the card's own, clearer drawing instead
    if (d.type === "heatpump" && (!d.icon || d.icon === "mdi:heat-pump")) return "efp:heat-pump";
    if (d.icon) return d.icon;
    const p = DEVICE_PRESETS.find((x) => x.id === d.type);
    return p ? p.icon : "mdi:car-electric";
  }

  // Which corner each node sits in. Default in this fork: grid top-left, solar top-right.
  _positions() {
    const solarRight = this._config.solar_position !== "left";
    return { grid: solarRight ? "tl" : "tr", solar: solarRight ? "tr" : "tl", battery: "bl", devices: "br" };
  }

  _anchor(key, side) {
    const a = this._config.visual_anchors?.[key];
    if (a && a.x != null && a.y != null) return { x: +a.x, y: +a.y };
    if (key === "grid") return side === "left" ? DEFAULT_ANCHORS.grid_left : DEFAULT_ANCHORS.grid_right;
    return DEFAULT_ANCHORS[key];
  }

  _houseImage() {
    const c = this._config;
    const ent = c.house_image_entity && this.hass?.states?.[c.house_image_entity];
    const pic = ent?.attributes?.entity_picture;
    if (pic) return pic;
    const media = c.house_image_media || toMediaSource(c.house_image_url);
    if (media) return this._resolveMedia(media) || VISUAL_HOUSE_IMAGE;
    if (c.house_image_url) return c.house_image_url;
    return VISUAL_HOUSE_IMAGE;
  }

  // Files in the HA media folder are only reachable through a signed URL; ask HA for one
  // (valid for a day) and refresh it in time.
  _resolveMedia(id) {
    this._media = this._media || {};
    const m = this._media[id];
    const now = Date.now();
    if (m && m.url && now < m.until) return m.url;
    if (!m || (!m.busy && now - (m.tried || 0) > 30000)) {
      this._media[id] = { ...(m || {}), busy: true, tried: now };
      this.hass?.callWS?.({ type: "media_source/resolve_media", media_content_id: id, expires: 86400 })
        .then((r) => {
          const url = r?.url ? (this.hass.hassUrl ? this.hass.hassUrl(r.url) : r.url) : null;
          this._media[id] = { url, until: Date.now() + 23 * 3600000, busy: false, tried: Date.now() };
          this.requestUpdate();
        })
        .catch(() => { this._media[id] = { ...(this._media[id] || {}), busy: false, error: true }; this.requestUpdate(); });
    }
    return m?.url || null;
  }

  // ---------------------------------------------------------------------------
  // Selected period (date picker). Returns null for "today" (normal live behaviour),
  // otherwise { start, end, live, label }. Source: the card's own date bar, or the
  // Home Assistant "energy date selection" card on the same dashboard.
  // ---------------------------------------------------------------------------
  _period() {
    const c = this._config;
    const mode = c.date_selection || "auto";
    let start, end;
    if (mode === "card") {
      if (!this._own) return null;
      ({ start, end } = this._own);
    } else if (mode === "auto" || mode === "energy") {
      const coll = this.hass?.connection?.[`_${c.energy_collection_key || "energy"}`];
      if (!coll) return null;
      if (!this._eUnsub && typeof coll.subscribe === "function") {
        try { this._eUnsub = coll.subscribe(() => this.requestUpdate()); } catch (e) { this._eUnsub = () => {}; }
      }
      if (!coll.start) return null;
      start = +coll.start;
      end = coll.end ? +coll.end : null;
    } else return null;
    // HA ends a day at 23:59:59.999 -> make the end exclusive at midnight
    if (end != null) {
      const e2 = new Date(end + 1);
      if (e2.getHours() === 0 && e2.getMinutes() === 0 && e2.getSeconds() === 0 && e2.getMilliseconds() === 0) end += 1;
    }
    const t0 = startOfToday();
    if (start === t0 && (end == null || end === addDays(t0, 1))) return null;
    if (end == null) end = Math.max(addDays(startOfDay(start), 1), Date.now());
    const now = Date.now();
    return { start, end, live: start <= now && now < end, label: this._periodLabel(start, end) };
  }

  _periodLabel(start, end) {
    const lang = resolveLang(this._config.language, this.hass);
    const s = new Date(start), e = new Date(end - 1);
    const days = Math.round((startOfDay(end) - startOfDay(start)) / 86400000);
    if (days <= 1) return s.toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short" });
    if (s.getDate() === 1 && new Date(end).getDate() === 1) {
      if (s.getMonth() === 0 && days >= 365) return String(s.getFullYear());
      if (days <= 31) return s.toLocaleDateString(lang, { month: "long", year: "numeric" });
    }
    const sameYear = s.getFullYear() === e.getFullYear();
    return `${s.toLocaleDateString(lang, { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) })} – ${e.toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" })}`;
  }

  // Energy, energy-meter changes and costs for the selected period (recorder statistics).
  async _ensurePeriod(P) {
    const c = this._config;
    if (!this.hass?.callWS) return;
    const devs = this._devices();
    const uniq = (a) => [...new Set(a.filter(Boolean))];
    const powers = uniq([c.solar_power, ...this._src("grid").entities, ...this._src("battery").entities, ...devs.map((d) => d.power)]);
    const energies = uniq([c.energy_solar, ...this._energySrc("grid").entities, ...this._energySrc("battery").entities, ...devs.map((d) => d.energy)]);
    const key = `${P.start}|${P.end}|${powers.join(",")}|${energies.join(",")}|${c.price_entity || ""}|${c.price_use_tibber_service ? 1 : 0}`;
    const now = Date.now();
    const old = this._pd;
    if (old && old.key === key && (old.busy || old.final || now - old.fetched < 120000)) return;
    this._pd = { ...(old && old.key === key ? old : { ps: P.start, pe: P.end }), key, busy: true, fetched: now };
    const end = Math.min(P.end, now);
    const span = Math.max(0, end - P.start);
    const period = span <= 8 * 86400000 ? "5minute" : span <= 62 * 86400000 ? "hour" : "day";
    const step = { "5minute": 300000, hour: 3600000, day: 86400000 }[period];
    const sIso = new Date(P.start).toISOString(), eIso = new Date(end).toISOString();
    // all requests in parallel (they used to run one after another, one per energy meter)
    const statsPeriod = span <= 35 * 86400000 ? "hour" : span <= 400 * 86400000 ? "day" : "month";
    const pPowers = powers.length && span > 0
      ? this.hass.callWS({ type: "recorder/statistics_during_period", start_time: sIso, end_time: eIso, statistic_ids: powers, period, types: ["mean"] }).catch(() => ({}))
      : Promise.resolve({});
    const pEnergies = energies.length && span > 0
      ? this.hass.callWS({ type: "recorder/statistics_during_period", start_time: sIso, end_time: eIso, statistic_ids: energies, period: statsPeriod, types: ["change"], units: { energy: "kWh" } }).catch(() => ({}))
      : Promise.resolve({});
    const pPrices = this._priceHistory(P.start, end, span);
    const [rp, re, priceHist] = await Promise.all([pPowers, pEnergies, pPrices]);
    const rows = {};
    for (const id of powers) {
      const arr = rp?.[id];
      if (!Array.isArray(arr) || !arr.length) continue;
      const f = unitFactor(this.hass.states[id]?.attributes?.unit_of_measurement);
      rows[id] = arr.map((x) => ({ t: typeof x.start === "number" ? x.start : Date.parse(x.start), dur: step, v: (x.mean || 0) * f }))
        .filter((x) => !isNaN(x.t));
    }
    const missing = powers.filter((id) => !rows[id]);
    if (missing.length && span <= 3 * 86400000) {
      try {
        const res = await this.hass.callApi("GET", `history/period/${sIso}?filter_entity_id=${missing.join(",")}&end_time=${encodeURIComponent(eIso)}&minimal_response&no_attributes`);
        for (const arr of Array.isArray(res) ? res : []) {
          if (!Array.isArray(arr) || !arr.length) continue;
          const id = arr[0].entity_id;
          const f = unitFactor(this.hass.states[id]?.attributes?.unit_of_measurement);
          const pts = arr.map((x) => ({ t: Math.max(P.start, Date.parse(x.last_changed || x.last_updated)), v: (parseFloat(x.state) || 0) * f }));
          rows[id] = pts.map((p2, i) => ({ ...p2, dur: (i + 1 < pts.length ? pts[i + 1].t : end) - p2.t }));
        }
      } catch (e) { /* no data */ }
    }
    const integ = {};
    for (const [id, arr] of Object.entries(rows)) {
      let pos = 0, neg = 0;
      for (const x of arr) {
        const a = Math.max(x.t, P.start), b = Math.min(x.t + x.dur, end);
        if (b <= a) continue;
        const e = (x.v * (b - a)) / 3600000 / 1000;
        if (e > 0) pos += e; else neg -= e;
      }
      integ[id] = { pos, neg };
    }
    const stats = {};
    for (const id of energies) {
      const arr = re?.[id];
      if (Array.isArray(arr) && arr.length) stats[id] = arr.reduce((a, x) => a + (typeof x.change === "number" ? x.change : 0), 0);
    }
    this._pd = { key, ps: P.start, pe: P.end, busy: false, fetched: Date.now(), final: P.end <= now, rows, integ, stats, priceHist };
    this.requestUpdate();
  }

  // Price history for a period: Tibber service or the history of the price entity.
  async _priceHistory(start, end, span) {
    const c = this._config;
    if (span > 93 * 86400000) return [];
    if (c.price_use_tibber_service) return this._tibberRange(start, end);
    if (!c.price_entity) return [];
    try {
      const res = await this.hass.callApi("GET", `history/period/${new Date(start - 3600000).toISOString()}?filter_entity_id=${c.price_entity}&end_time=${encodeURIComponent(new Date(end).toISOString())}&minimal_response&no_attributes`);
      const arr = Array.isArray(res) && res[0] ? res[0] : [];
      return arr.map((x) => ({ t: Date.parse(x.last_changed || x.last_updated), v: normalizePrice(parseFloat(x.state)) }))
        .filter((x) => !isNaN(x.v) && !isNaN(x.t));
    } catch (e) { return []; }
  }

  _pdFor(P) {
    const d = this._pd;
    return d && d.ps === P.start && d.pe === P.end ? d : null;
  }

  async _tibberRange(start, end) {
    try {
      const res = await this.hass.connection.sendMessagePromise({
        type: "call_service", domain: "tibber", service: "get_prices", return_response: true,
        service_data: { start: new Date(start).toISOString(), end: new Date(end).toISOString() },
      });
      const data = Object.values(res?.response?.prices || {})[0] || [];
      return data.map((x) => ({ t: Date.parse(x.start_time ?? x.from), v: normalizePrice(+(x.price ?? x.total)) }))
        .filter((x) => !isNaN(x.t) && !isNaN(x.v)).sort((a, b) => a.t - b.t);
    } catch (e) { return []; }
  }

  // costs of the grid import in the selected period
  _periodCost(P, pricePoints) {
    const d = this._pdFor(P);
    if (!d || !d.rows) return null;
    const gs = this._src("grid");
    let samples = gs.dual
      ? (d.rows[gs.pos] || []).map((x) => ({ ...x, v: Math.max(0, Math.abs(x.v)) }))
      : (d.rows[gs.signed] || []).map((x) => ({ ...x, v: Math.max(0, x.v * gs.sign) }));
    if (!samples.length) return null;
    return costCalc(samples, [...(d.priceHist || []), ...(pricePoints || [])], P.start, Math.min(P.end, Date.now()));
  }

  // ---------------------------------------------------------------------------
  // Today's energy per node (kWh). Either from an optional energy entity (via the
  // recorder statistics "change" of today) or integrated from the power history.
  // ---------------------------------------------------------------------------
  async _ensureDayEnergy() {
    const c = this._config;
    if (!this.hass || c.show_daily_energy === false || !this.hass.callApi) return;
    const devs = this._devices();
    const powers = [...new Set([c.solar_power, ...this._src("grid").entities, ...this._src("battery").entities, ...devs.map((d) => d.power)].filter(Boolean))];
    const energies = [...new Set([c.energy_solar, ...this._energySrc("grid").entities, ...this._energySrc("battery").entities, ...devs.map((d) => d.energy)].filter(Boolean))];
    const midnight = startOfToday();
    const key = powers.join(",");
    if (!this._day || this._day.midnight !== midnight || this._day.key !== key) {
      this._day = { midnight, key, acc: {}, fetchedTo: midnight, lastFetch: 0, busy: false };
    }
    const d = this._day;
    const now = Date.now();
    if (powers.length && !d.busy && now - d.lastFetch > 60000) {
      d.busy = true;
      d.lastFetch = now;
      try {
        const url = `history/period/${new Date(d.fetchedTo).toISOString()}?filter_entity_id=${powers.join(",")}` +
          `&end_time=${encodeURIComponent(new Date(now).toISOString())}&minimal_response&no_attributes`;
        const res = await this.hass.callApi("GET", url);
        if (this._day === d) {
          for (const arr of Array.isArray(res) ? res : []) {
            if (!Array.isArray(arr) || !arr.length) continue;
            const id = arr[0].entity_id;
            const f = unitFactor(this.hass.states[id]?.attributes?.unit_of_measurement);
            const st = d.acc[id] || (d.acc[id] = { lastT: null, lastV: 0, pos: 0, neg: 0 });
            for (const s of arr) {
              const t = Date.parse(s.last_changed || s.last_updated);
              let val = parseFloat(s.state);
              val = isNaN(val) ? 0 : val * f;
              if (isNaN(t)) continue;
              if (st.lastT === null) { st.lastT = Math.max(t, midnight); st.lastV = val; continue; }
              if (t <= st.lastT) { st.lastV = val; continue; }
              const e = (st.lastV * (t - st.lastT)) / 3600000;
              if (e > 0) st.pos += e; else st.neg -= e;
              st.lastT = t;
              st.lastV = val;
            }
          }
          d.fetchedTo = now;
        }
      } catch (e) {
        /* keep what we have */
      } finally {
        d.busy = false;
        this.requestUpdate();
      }
    }
    // Energy entities: today's change from the long-term statistics.
    this._dayStats = this._dayStats || {};
    for (const id of energies) {
      const s = this._dayStats[id];
      if (s && (s.busy || now - s.fetched < 120000) && s.midnight === midnight) continue;
      this._dayStats[id] = { ...(s || {}), busy: true, fetched: now, midnight };
      (async () => {
        let v = null;
        try {
          const r = await this.hass.callWS({
            type: "recorder/statistic_during_period",
            statistic_id: id,
            calendar: { period: "day" },
            types: ["change"],
            units: { energy: "kWh" },
          });
          if (r && typeof r.change === "number") v = r.change;
        } catch (e) { /* fall back below */ }
        if (v === null) {
          // e.g. a daily utility_meter without statistics: use its state directly
          const st = this.hass.states[id];
          const raw = st ? parseFloat(st.state) : NaN;
          if (!isNaN(raw)) {
            const u = st.attributes?.unit_of_measurement;
            v = u === "Wh" ? raw / 1000 : u === "MWh" ? raw * 1000 : raw;
          }
        }
        this._dayStats[id] = { v, busy: false, fetched: Date.now(), midnight };
        this.requestUpdate();
      })();
    }
  }

  _dayIntegral(entity) {
    const st = this._day?.acc?.[entity];
    if (!st || st.lastT == null) return null;
    let pos = st.pos, neg = st.neg;
    const cur = pw(this.hass, entity);
    const v = cur ?? st.lastV ?? 0;
    const e = (v * Math.max(0, Date.now() - st.lastT)) / 3600000;
    if (e > 0) pos += e; else neg -= e;
    return { pos: pos / 1000, neg: neg / 1000 };
  }

  _daily(devs) {
    const c = this._config;
    if (c.show_daily_energy === false) return null;
    const P = this._period();
    let I, st;
    if (P) {
      this._ensurePeriod(P);
      const pd = this._pdFor(P);
      I = (e) => (e && pd?.integ?.[e]) || null;
      st = (e) => (pd?.stats?.[e] ?? null);
    } else {
      this._ensureDayEnergy();
      I = (e) => (e ? this._dayIntegral(e) : null);
      st = (e) => this._dayStats?.[e]?.v ?? null;
    }
    const pick = (energyEnt, integ, field) => {
      if (energyEnt) return st(energyEnt);
      return integ ? integ[field] : null;
    };
    const gd = this._srcDay("grid", I, st);
    const bd = this._srcDay("battery", I, st);
    const r = {
      solar: pick(c.energy_solar, I(c.solar_power), "pos"),
      gridIn: gd.in,
      gridOut: gd.out,
      battOut: bd.in,  // discharge = into the house
      battIn: bd.out,  // charge = out of the house
      devices: devs.map((d) => pick(d.energy, I(d.power), "pos")),
    };
    const parts = [r.solar, r.gridIn, r.battOut, r.gridOut, r.battIn];
    if (parts.some((x) => x != null)) {
      let h = (r.solar || 0) + (r.gridIn || 0) + (r.battOut || 0) - (r.gridOut || 0) - (r.battIn || 0);
      if (c.include_car_in_home) for (const x of r.devices) h -= x || 0;
      r.home = Math.max(0, h);
    } else r.home = null;
    return r;
  }

  // Daily energy sources for grid/battery: two kWh entities, one signed kWh entity, or none.
  _energySrc(kind) {
    const c = this._config;
    const mode = kind === "grid" ? c.energy_grid_mode : c.energy_battery_mode;
    if (mode === "single") {
      const e = kind === "grid" ? c.energy_grid : c.energy_battery;
      const inv = kind === "grid" ? c.energy_grid_invert : c.energy_battery_invert;
      return { dual: false, signed: e, sign: inv ? -1 : 1, entities: [e].filter(Boolean) };
    }
    const pos = kind === "grid" ? c.energy_grid_import : c.energy_battery_discharge;
    const neg = kind === "grid" ? c.energy_grid_export : c.energy_battery_charge;
    return { dual: true, pos, neg, entities: [pos, neg].filter(Boolean) };
  }

  // { in, out } kWh today for grid/battery (in = towards the house).
  _srcDay(kind, I, st) {
    const es = this._energySrc(kind);
    if (es.entities.length) {
      if (!es.dual) {
        const v = st(es.signed);
        if (v == null) return { in: null, out: null };
        const x = v * es.sign;
        return x >= 0 ? { in: x, out: null } : { in: null, out: -x };
      }
      // two kWh entities; a missing one falls back to the power history below
      const fromPower = this._srcDay2(kind, I);
      return { in: es.pos ? st(es.pos) : fromPower.in, out: es.neg ? st(es.neg) : fromPower.out };
    }
    return this._srcDay2(kind, I);
  }

  _srcDay2(kind, I) {
    const s = this._src(kind);
    if (!s.dual) {
      const r = I(s.signed);
      if (!r) return { in: null, out: null };
      return s.sign > 0 ? { in: r.pos, out: r.neg } : { in: r.neg, out: r.pos };
    }
    const a = I(s.pos), b = I(s.neg);
    return { in: a ? a.pos : null, out: b ? b.pos : null };
  }

  // ---------------------------------------------------------------------------
  // Tap / long-press on a node.
  // ---------------------------------------------------------------------------
  _pDown(ev, key) {
    if (ev.button != null && ev.button !== 0) return;
    clearTimeout(this._holdTimer);
    this._press = { key, x: ev.clientX, y: ev.clientY, held: false };
    this._holdTimer = setTimeout(() => {
      if (this._press && this._press.key === key) {
        this._press.held = true;
        this._doAction(key, "hold");
      }
    }, 500);
  }
  _pMove(ev) {
    if (this._press && Math.hypot(ev.clientX - this._press.x, ev.clientY - this._press.y) > 12) {
      clearTimeout(this._holdTimer);
      this._press = null;
    }
  }
  _pUp(ev, key) {
    clearTimeout(this._holdTimer);
    const p = this._press;
    this._press = null;
    if (!p || p.key !== key || p.held) return;
    this._doAction(key, "tap");
  }
  _pCancel() {
    clearTimeout(this._holdTimer);
    this._press = null;
  }
  _nodeEvents(key) {
    return {
      down: (e) => this._pDown(e, key),
      up: (e) => this._pUp(e, key),
      move: (e) => this._pMove(e),
      cancel: () => this._pCancel(),
    };
  }

  _doAction(key, kind) {
    const c = this._config;
    const action = kind === "hold" ? (c.hold_action ?? "more-info") : (c.tap_action ?? "graph");
    if (action === "none") return;
    if (action === "graph") {
      const tab = key.startsWith("dev:") ? "devices" : { grid: "grid", solar: "solar", battery: c.battery_soc ? "accu" : "usage", home: "usage", devices: "devices" }[key];
      if (c.show_price && this._chartTabs().some((t) => t.id === tab)) {
        this._setChartMode(tab, true);
        const el = this.renderRoot?.querySelector?.(".price");
        if (el && el.scrollIntoView) {
          const r = el.getBoundingClientRect();
          if (r.top > window.innerHeight || r.bottom < 0) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }
      // no matching chart -> fall back to the detail dialog
    }
    const ent = this._nodeEntity(key);
    if (!ent) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: ent }, bubbles: true, composed: true }));
  }

  _nodeEntity(key) {
    const c = this._config;
    if (key === "grid") return this._src("grid").entities[0] || this._energySrc("grid").entities[0];
    if (key === "solar") return c.solar_power || c.energy_solar;
    if (key === "battery") return c.battery_soc || this._src("battery").entities[0];
    if (key.startsWith("dev:")) return this._devEntities?.[parseInt(key.slice(4), 10)] || null;
    if (key === "devices") {
      const devs = this._devices().filter((d) => d.power || d.soc);
      if (!devs.length) return null;
      const d = devs[(this._carScrollIdx || 0) % devs.length];
      return (c.car_mode === "merged" ? devs[0] : d).power || d.soc;
    }
    return null;
  }

  _renderFlow() {
    const c = this._config;
    const hass = this.hass;
    const P = this._period();
    const noLive = !!(P && !P.live);   // a past period: no current values, no animation
    const v = noLive ? { solar: null, grid: null, charge: null, discharge: null, soc: null } : this._liveV();
    const home = this._homePower(v);

    const thr = this._thr();
    const battValue = (v.charge && v.charge > thr) ? v.charge : (v.discharge && v.discharge > thr) ? v.discharge : (v.charge ?? v.discharge);
    const battLabel = v.charge && v.charge > thr ? this._t("charging") : v.discharge && v.discharge > thr ? this._t("discharging") : "";
    const gridLabel = v.grid === null || Math.abs(v.grid) <= thr ? "" : v.grid < 0 ? this._t("export") : this._t("import");
    const act = (val) => val !== null && Math.abs(val) > thr;

    const solarHasEnt = !!c.solar_power;
    const gridHasEnt = this._src("grid").entities.length > 0;
    const battHasEnt = this._src("battery").entities.length > 0;

    const GREY = "#6b7280";
    const solarCol = solarHasEnt ? c.color_solar : GREY;
    const gridCol = gridHasEnt ? c.color_grid : GREY;
    const battCol = battHasEnt ? c.color_battery : GREY;

    // Devices. A car with a "charging" (on/off) entity can detect a guest vehicle (see original).
    const devs = this._devices();
    const devColors = this._devColors();
    const daily = this._daily(devs);
    const guests = [];
    const items = devs.map((d, i) => {
      const p = noLive ? null : pw(hass, d.power);
      const soc = d.type === "car" && !noLive ? num(hass, d.soc) : null;
      // per-device threshold (falls back to the global "hide line below" value)
      const dThr = d.min_power !== undefined && d.min_power !== "" && !isNaN(parseFloat(d.min_power)) ? Math.max(0, parseFloat(d.min_power)) : thr;
      const powerActive = p !== null && Math.abs(p) > dThr;
      const chargingState = d.charging ? hass.states?.[d.charging]?.state : null;
      const isGuest = d.type === "car" && !!d.charging && powerActive && chargingState !== "on";
      if (isGuest) {
        guests.push({ name: this._t("guest_car"), power: p, soc: null, active: true, hasEnt: true, icon: "mdi:car-electric", isCar: true, day: null, entity: d.power, color: devColors[i] });
      }
      return {
        name: d.name || `${this._t("dev_" + d.type) || this._t("car")} ${i + 1}`,
        power: isGuest ? 0 : p,
        soc,
        active: isGuest ? false : powerActive,
        hasEnt: !!d.power,
        icon: this._deviceIcon(d),
        isCar: d.type === "car",
        color: devColors[i],
        day: daily ? daily.devices[i] : null,
        entity: d.power || d.soc,
        thr: dThr,
        showMode: d.show || "default",
      };
    });
    const allDevs = [...items, ...guests];
    const devHasEnt = allDevs.some((x) => x.hasEnt);
    this._devEntities = allDevs.map((x) => x.entity);
    const devMode = ["merged", "scroll"].includes(c.car_mode) ? c.car_mode : "row";
    const rowMode = devMode === "row" && allDevs.length > 1;
    const rowAll = rowMode
      ? allDevs
          .map((d, idx) => ({ ...d, idx, past: noLive, ws: this._wireState("dev:" + idx, d.active ? d.power : 0, true, d.thr ?? thr) }))
          .filter((d) => noLive
            ? (d.showMode === "always" || c.display_zero || (d.day != null && d.day > 0.005))
            : (d.showMode === "always" || (d.showMode === "active" ? d.ws.show : (c.display_zero || d.ws.show))))
      : [];
    // Collapse: "expanded" | "collapsed" | "top" (only the biggest N consumers); the
    // button under the row toggles between the configured state and showing everything.
    const collapseMode = ["collapsed", "top"].includes(c.devices_collapse) ? c.devices_collapse : "expanded";
    const topN = Math.max(1, parseInt(c.devices_top_n, 10) || 4);
    const open = this._devOpen ?? (collapseMode === "expanded");
    const metric = (d) => (noLive ? (d.day || 0) : (d.active ? Math.abs(d.power || 0) : 0) * 1e6 + (d.day || 0));
    let rowDevs = rowAll;
    if (!open) {
      if (collapseMode === "top") {
        const keep = new Set([...rowAll].sort((a, b) => metric(b) - metric(a)).slice(0, topN).map((d) => d.idx));
        rowDevs = rowAll.filter((d) => keep.has(d.idx));
      } else rowDevs = [];
    }
    const hiddenCount = rowAll.length - rowDevs.length;
    const canToggle = rowMode && rowAll.length > 0 && (collapseMode !== "expanded" || this._devOpen === false || rowAll.length > topN)
      && !(collapseMode === "top" && rowAll.length <= topN);
    const devsShown = allDevs.length ? allDevs : [{ name: this._t("devices"), power: null, soc: null, active: false, hasEnt: false, icon: "mdi:power-plug", isCar: false, day: null }];

    const bs = (() => {
      const r = 23, circ = 2 * Math.PI * r;
      const pct = v.soc === null ? 0 : Math.max(0, Math.min(100, v.soc)) / 100;
      return { circ, offset: circ * (1 - pct) };
    })();

    const visual = !!c.use_visual_layout;
    const reduceEffects = !!c.reduce_effects;
    const pos = this._positions();
    const sideOf = (k) => (pos[k][1] === "l" ? "left" : "right");
    const isTop = (k) => pos[k][0] === "t";
    const arrowToHouse = (k) => (sideOf(k) === "left" ? "→" : "←");
    const arrowFromHouse = (k) => (sideOf(k) === "left" ? "←" : "→");

    // Wire power / direction (reversed = flowing from the house to the node).
    const battPow = v.charge && v.charge > thr ? v.charge : (v.discharge && v.discharge > thr ? v.discharge : 0);
    const devPow = (() => { let m = 0; for (const x of allDevs) { if (x.active && Math.abs(x.power) > m) m = Math.abs(x.power); } return m; })();
    const ws = {
      solar: this._wireState("solar", v.solar, false),
      grid: this._wireState("grid", v.grid, v.grid < 0),
      battery: this._wireState("batt", battPow, !!(v.charge && v.charge > thr)),
      devices: this._wireState("car", devPow, true),
    };
    if (Object.values(ws).some((w) => w.show) || rowDevs.some((d) => d.ws.show)) this._scheduleFlowTick();

    // ---- wire geometry, in real pixels of the measured flow box ----
    // Every wire is made of horizontal and vertical segments only.
    const g = this._geo;
    const W = g?.W || 0, H = g?.FH || 190, HW = g?.H || H;
    const wirePts = {};
    if (W && g.home) {
      if (!visual) {
        // Abstract layout: down (or up) from the icon, then straight into the house square.
        const hb = g.home;
        for (const k of ["grid", "solar", "battery", "devices"]) {
          const a = g[k];
          if (!a) continue;
          const top = isTop(k);
          const left = sideOf(k) === "left";
          const y = top ? hb.cy - 12 : hb.cy + 12;
          const xEnd = left ? hb.left - 1 : hb.right + 1;
          const yStart = top ? a.bottom + 4 : a.top - 4;
          wirePts[k] = [{ x: a.cx, y: yStart }, { x: a.cx, y }, { x: xEnd, y }];
        }
      } else {
        // Visual layout: along the top/bottom edge, down a shared bend line, into the photo.
        const pic = g.pic && g.pic.width ? g.pic : { left: W / 2 - 95, top: 0, width: 190, height: 190 };
        const visPt = (p) => ({ x: pic.left + (p.x / 100) * pic.width, y: pic.top + (p.y / 100) * pic.height });
        const EP = {};
        for (const k of ["grid", "solar", "battery", "devices"]) EP[k] = visPt(this._anchor(k, sideOf(k)));
        const keysOn = (side) => ["grid", "solar", "battery", "devices"].filter((k) => sideOf(k) === side);
        const frame = {};
        for (const side of ["left", "right"]) {
          const ks = keysOn(side);
          frame[side] = ks.reduce((s, k) => s + EP[k].x, 0) / (ks.length || 1);
        }
        for (const k of ["grid", "solar", "battery", "devices"]) {
          const a = g[k];
          if (!a) continue;
          const left = sideOf(k) === "left";
          const iconX = left ? a.right + 8 : a.left - 8;
          const iconY = isTop(k) ? 4 : H - 4;
          // straight along the edge to exactly above/below the anchor, then straight down/up
          // into it: one bend only, the line ends exactly at the configured end point
          wirePts[k] = [{ x: iconX, y: iconY }, { x: EP[k].x, y: iconY }, { x: EP[k].x, y: EP[k].y }];
        }
      }
    }

    // Device row: from the "devices" hub down to a bus line, then into each device.
    const rowWires = [];
    if (W && g.devices && rowDevs.length) {
      const hub = g.devices;
      const found = rowDevs.map((d) => ({ d, a: g["dev" + d.idx] })).filter((x) => x.a);
      const tops = [...new Set(found.map((x) => Math.round(x.a.top)))].sort((a, b) => a - b);
      const bus = (t) => t - 10;
      for (const { d, a } of found) {
        const r = tops.indexOf(Math.round(a.top));
        const y0 = bus(tops[0]);
        const pts = [{ x: hub.cx, y: hub.bottom + 4 }, { x: hub.cx, y: y0 }];
        if (r > 0) {
          const yr = bus(tops[r]);
          pts.push({ x: W - 4, y: y0 }, { x: W - 4, y: yr }, { x: a.cx, y: yr });
        } else pts.push({ x: a.cx, y: y0 });
        pts.push({ x: a.cx, y: a.top - 4 });
        const clean = pts.filter((p, i) => i === 0 || Math.abs(p.x - pts[i - 1].x) > 0.5 || Math.abs(p.y - pts[i - 1].y) > 0.5);
        rowWires.push({ key: "dev" + d.idx, pts: clean, st: d.ws, color: d.color || c.color_car });
      }
    }

    const neon = c.wire_style === "neon";
    // No CSS filter here: drop-shadow on animated paths is recomputed every frame and made
    // the animation stutter. The neon glow is an extra wide, translucent copy of the pulse.
    const liveStyle = (st, color) => `stroke:${color};${st.moving ? "" : "animation-play-state:paused;"}`;
    const livePath = (st, color, d) => svg`
      ${neon && !reduceEffects ? svg`<path class="${liveClass(st)} glow" style="${liveStyle(st, color)}" data-speed="${st.duration}" d="${d}"></path>` : nothing}
      <path class="${liveClass(st)}" style="${liveStyle(st, color)}" data-speed="${st.duration}" d="${d}"></path>`;
    const liveClass = (st) => `live ${neon ? "neon" : "dashed"}${st.fade === "in" ? " fade-in" : ""}${st.fade === "out" ? " fade-out" : ""}${st.moving ? "" : " still"}${st.dirSwap ? " dir-swap" : ""}`;

    // Dim base wire that fades in/out at both tips (measured along the bent path).
    const gradId = (name) => `efp-fade-${name}-${this._uid}`;
    const FADE_LEN = 30;
    const baseWire = (name, pts) => {
      if (!pts) return { defs: nothing, path: nothing };
      const total = polyLen(pts);
      if (total < 2) return { defs: nothing, path: nothing };
      const fl = Math.min(FADE_LEN, total / 2);
      const aEnd = polyPointAt(pts, fl);
      const bStart = polyPointAt(pts, total - fl);
      const last = pts[pts.length - 1];
      const idIn = gradId(name + "-in"), idOut = gradId(name + "-out");
      return {
        defs: svg`
          <linearGradient id="${idIn}" gradientUnits="userSpaceOnUse" x1="${pts[0].x}" y1="${pts[0].y}" x2="${aEnd.x + 0.01}" y2="${aEnd.y + 0.01}">
            <stop offset="0" stop-color="#fff" stop-opacity="0"></stop>
            <stop offset="1" stop-color="#fff" stop-opacity="0.09"></stop>
          </linearGradient>
          <linearGradient id="${idOut}" gradientUnits="userSpaceOnUse" x1="${bStart.x}" y1="${bStart.y}" x2="${last.x + 0.01}" y2="${last.y + 0.01}">
            <stop offset="0" stop-color="#fff" stop-opacity="0.09"></stop>
            <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
          </linearGradient>`,
        path: svg`
          <path class="wire" style="stroke:url(#${idIn})" d="${subPathD(pts, 0, fl)}"></path>
          ${total - 2 * fl > 0.5 ? svg`<path class="wire" d="${subPathD(pts, fl, total - fl)}"></path>` : nothing}
          <path class="wire" style="stroke:url(#${idOut})" d="${subPathD(pts, total - fl, total)}"></path>`,
      };
    };
    const liveD = (pts, reversed) => polyD(reversed ? [...pts].reverse() : pts);
    const wireColor = { solar: c.color_solar, grid: c.color_grid, battery: c.color_battery, devices: c.color_car };
    const wireKeys = ["grid", "solar", "battery", "devices"];
    const bases = Object.fromEntries(wireKeys.map((k) => [k, baseWire(k, wirePts[k])]));

    // Today's kWh: one line per direction, with a "into the house" / "out of the house" icon.
    // Each node gets its own symbol with a direction: a dedicated MDI icon where one exists
    // (grid, battery), otherwise the node's icon with a small arrow badge
    // (badge ↗ = the node delivers energy, ↙ = the node takes energy).
    const dIcon = (base, badge) => badge
      ? html`<span class="dic">${renderIcon(base)}<ha-icon class="badge" icon="${badge}"></ha-icon></span>`
      : html`<span class="dic">${renderIcon(base)}</span>`;
    const OUT_OF_NODE = "mdi:arrow-top-right-thick", INTO_NODE = "mdi:arrow-bottom-left-thick";
    const DAY_ICONS = {
      // MDI draws these from the tower's point of view, so they are used crosswise here
      grid: { in: ["mdi:transmission-tower-export"], out: ["mdi:transmission-tower-import"] },
      battery: { in: ["mdi:battery-arrow-down"], out: ["mdi:battery-arrow-up"] },
      solar: { in: ["mdi:solar-power-variant", OUT_OF_NODE] },
    };
    const dayLine = (k, dir, x, icon) => {
      if (!daily || x == null) return nothing;
      const ic = icon || DAY_ICONS[k]?.[dir] || [dir === "in" ? "mdi:home-import-outline" : "mdi:home-export-outline"];
      return html`<span class="day ${dir}" title=${this._t(dir === "in" ? "day_in" : "day_out")}>${dIcon(ic[0], ic[1])}${fmtKWh(x)} kWh</span>`;
    };
    const dayIn = (x, k) => dayLine(k, "in", x);
    const dayOut = (x, k, icon) => dayLine(k, "out", x, icon ? [icon, INTO_NODE] : null);
    const fcToday = !P && c.solar_forecast !== false && c.solar_forecast_node !== false ? this._forecastToday() : null;
    const fcLine = fcToday != null
      ? html`<span class="day fc" title=${this._t("forecast_today")}><span class="dic"><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon></span>${fmtKWh(fcToday)} kWh</span>` : nothing;
    // today's electricity costs (grid import × price) under the house, same calculation as in the price chart
    let homeCostLine = nothing;
    if (c.home_show_costs !== false && c.price_show_costs !== false && this._src("grid").entities.length && (c.price_entity || c.price_use_tibber_service)) {
      this._ensureCostData();
      if (c.price_use_tibber_service) this._ensureTibberPrices();
      const r = P ? this._periodCost(P, this._priceData().points) : this._costFor(startOfToday(), this._priceData().points);
      if (r && r.eur != null) {
        homeCostLine = html`<span class="day cost" title=${P ? `${this._t("costs")} ${P.label}` : this._t("cost_today")}><span class="dic"><ha-icon icon="mdi:cash"></ha-icon></span>${r.eur.toFixed(2).replace(".", ",")} €</span>`;
      }
    }
    const homeDayLine = daily && daily.home != null
      ? html`<span class="day home" title=${this._t("day_home")}><span class="dic"><ha-icon icon="mdi:home-lightning-bolt-outline"></ha-icon></span>${fmtKWh(daily.home)} kWh</span>` : nothing;

    const node = (k, muted, inner, extraCls = "") => {
      const ev = this._nodeEvents(k);
      return html`<div class="node ${pos[k]} ${extraCls} ${muted ? "muted" : ""}"
        @pointerdown=${ev.down} @pointerup=${ev.up} @pointermove=${ev.move}
        @pointerleave=${ev.cancel} @pointercancel=${ev.cancel}
        @contextmenu=${(e) => e.preventDefault()}>${inner}</div>`;
    };
    const squareIcon = (k, icon, col) => html`
      <div class="ic" data-anc="${k}" style="color:${col};border-color:${col}66;background:${col}22">
        ${renderIcon(icon)}
      </div>`;

    const homeEv = this._nodeEvents("home");

    const rowBases = rowWires.map((w) => baseWire(w.key, w.pts));
    // House picture size (visual layout), in % of the flow height. The "Home" label sits
    // just left of the picture, using its measured width (falls back to a square picture).
    const picScale = Math.max(30, Math.min(130, parseFloat(c.house_image_scale) || 100));
    const picHalf = g?.pic?.width ? g.pic.width / 2 : ((daily ? 236 : 190) * picScale) / 200;
    const picHalfH = g?.pic?.height ? g.pic.height / 2 : ((daily ? 236 : 190) * picScale) / 200;
    const labelPos = ["above", "below"].includes(c.house_label_position) ? c.house_label_position : "left";
    // With the text above/below, the picture moves to the opposite edge to make room for it.
    const picAlign = labelPos === "below" ? "top:0;transform:translate(-50%,0)"
      : labelPos === "above" ? "top:auto;bottom:0;transform:translate(-50%,0)" : "";
    const flowH = daily ? 236 : 190;
    const picTop = g?.pic?.height ? g.pic.top : labelPos === "above" ? flowH - 2 * picHalfH : 0;
    const picBottom = g?.pic?.height ? g.pic.bottom : picTop + 2 * picHalfH;
    // keep the text inside the flow area (it can be 3 lines high with kWh + costs)
    const lblH = g?.huislbl?.height || 60;
    const huisStyle = labelPos === "below"
      ? `top:${Math.max(0, Math.min(picBottom + 2, flowH - lblH))}px;align-items:center;text-align:center;transform:translate(-50%, 0)`
      : labelPos === "above"
        ? `top:${Math.max(0, picTop - 2 - lblH)}px;align-items:center;text-align:center;transform:translate(-50%, 0)`
        : `transform:translate(calc(-100% - ${picHalf + 22}px), -50%)`;
    const wrapStyle = `--efp-day-in:${c.color_day_in || "#34d399"};--efp-day-out:${c.color_day_out || "#fb923c"};--efp-day-home:${c.color_home}`;

    return html`
      <div class="flowwrap ${noLive ? "past" : ""}" style="${wrapStyle}">
      <svg class="wires" viewBox="0 0 ${W || 1} ${HW}" preserveAspectRatio="none">
        <defs>${wireKeys.map((k) => bases[k].defs)}${rowBases.map((b) => b.defs)}</defs>
        ${wireKeys.map((k) => {
          const pts = wirePts[k];
          if (!pts) return nothing;
          const st = ws[k];
          return svg`${bases[k].path}
            ${st.show && !noLive ? livePath(st, wireColor[k], liveD(pts, st.reversed)) : nothing}`;
        })}
        ${rowWires.map((w, i) => svg`${rowBases[i].path}
          ${w.st.show && !noLive ? livePath(w.st, w.color, liveD(w.pts, false)) : nothing}`)}
      </svg>
      <div class="flow ${visual ? "visual" : ""} ${daily ? "tall" : ""}">
        ${P && (c.date_selection || "auto") !== "card" ? html`<div class="plabel"><ha-icon icon="mdi:calendar"></ha-icon>${P.label}</div>` : nothing}
        ${visual ? html`<img class="housepic" data-anc="pic" src="${this._houseImage()}" alt="" style="height:${picScale}%;${picAlign}" @load=${() => this._measure(true)} />` : nothing}

        ${node("solar", !solarHasEnt, html`
          ${squareIcon("solar", "mdi:solar-power-variant", solarCol)}
          <div class="txt"><span class="lbl">${this._t("solar")}</span><span class="val" style="color:${solarCol}">${fmtPower(v.solar)}</span>${dayIn(daily?.solar, "solar")}${fcLine}</div>`)}

        ${node("grid", !gridHasEnt, html`
          ${squareIcon("grid", "mdi:transmission-tower", gridCol)}
          <div class="txt"><span class="lbl">${this._t("grid")}</span><span class="val" style="color:${gridCol}">${fmtPower(v.grid)}</span>${gridLabel ? html`<span class="sub" style="color:${gridCol}">${gridLabel}</span>` : nothing}${dayIn(daily?.gridIn, "grid")}${dayOut(daily?.gridOut, "grid")}</div>`)}

        ${node("battery", !battHasEnt, html`
          ${c.battery_ring !== false
            ? html`<div class="socwrap" data-anc="battery">
                <svg class="socring" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"></circle>
                  ${battHasEnt && v.soc !== null ? svg`<circle cx="26" cy="26" r="23" fill="none" stroke="${battCol}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${bs.circ}" stroke-dashoffset="${bs.offset}" transform="rotate(-90 26 26)"></circle>` : nothing}
                </svg>
                <div class="ic round" style="color:${battCol}"><ha-icon icon="mdi:battery-charging"></ha-icon></div>
              </div>`
            : squareIcon("battery", "mdi:battery-charging", battCol)}
          <div class="txt"><span class="lbl">${this._t("battery")}${battHasEnt && v.soc !== null ? html` · <b style="color:${battCol}">${Math.round(v.soc)}%</b>` : nothing}</span><span class="val" style="color:${battCol}">${fmtPower(battValue)}</span>${battLabel ? html`<span class="sub" style="color:${battCol}">${battLabel}</span>` : nothing}${dayIn(daily?.battOut, "battery")}${dayOut(daily?.battIn, "battery")}</div>`)}

        ${rowMode
          ? this._renderDeviceHub(allDevs, c, devHasEnt, node, daily, dayOut)
          : this._renderDevices(devsShown, c, devHasEnt, node, dayOut, devMode)}

        ${visual && labelPos === "left" ? html`<div class="huis-wire" style="left:calc(50% - ${picHalf + 6}px)"></div>` : nothing}
        <div class="huis ${visual ? "huis-visual" : ""}${reduceEffects ? " no-fx" : ""}" data-anc="huislbl" style="${visual ? huisStyle : ""}"
          @pointerdown=${homeEv.down} @pointerup=${homeEv.up} @pointermove=${homeEv.move}
          @pointerleave=${homeEv.cancel} @pointercancel=${homeEv.cancel} @contextmenu=${(e) => e.preventDefault()}>
          ${visual ? nothing : html`<div class="ic" data-anc="home" style="color:${c.color_home};border-color:${c.color_home}66;background:${c.color_home}1f">
            <ha-icon icon="mdi:home"></ha-icon>
          </div>`}
          ${visual ? html`<span class="anc-home" data-anc="home"></span>` : nothing}
          <span class="lbl">${this._t("home")}</span>
          <span class="val" style="color:${c.color_home}">${fmtPower(home)}</span>
          ${homeDayLine}
          ${homeCostLine}
        </div>
      </div>
      ${rowDevs.length ? html`<div class="devrow">${rowDevs.map((d) => this._renderDeviceItem(d, c, dayOut))}</div>` : nothing}
      ${canToggle ? html`<button class="devtoggle" @click=${() => { this._devOpen = !open; this.requestUpdate(); }}>
          <ha-icon icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
          ${open ? this._t("dev_collapse") : hiddenCount === rowAll.length
            ? this._t("dev_show_all").replace("{n}", rowAll.length)
            : this._t("dev_show_more").replace("{n}", hiddenCount)}
        </button>` : nothing}
      ${this._renderRatios(daily, P)}
      </div>
    `;
  }

  // PV self-consumption and self-sufficiency (like the HA energy dashboard gauges),
  // for today or the selected period.
  _renderRatios(daily, P) {
    const c = this._config;
    if (c.show_ratios === false || !daily) return nothing;
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const solar = daily.solar, out = daily.gridOut, inn = daily.gridIn, home = daily.home;
    const selfCons = solar != null && solar > 0.01 && out != null ? clamp((solar - out) / solar) : null;
    const autarky = home != null && home > 0.01 && inn != null ? clamp(1 - inn / home) : null;
    if (selfCons == null && autarky == null) return nothing;
    const ring = (frac, color, icon, label, hint) => {
      const r = 15, circ = 2 * Math.PI * r;
      return html`<div class="ratio" title=${hint}>
        <div class="rring">
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="${r}" fill="none" stroke="rgba(127,127,127,.2)" stroke-width="3.2"></circle>
            ${frac != null ? svg`<circle cx="18" cy="18" r="${r}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round"
              stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - frac)}" transform="rotate(-90 18 18)"></circle>` : nothing}
          </svg>
          <ha-icon icon="${icon}" style="color:${color}"></ha-icon>
        </div>
        <div class="rtxt"><span class="rv" style="color:${color}">${frac != null ? Math.round(frac * 100) + " %" : "–"}</span><span class="rl">${label}</span></div>
      </div>`;
    };
    const when = P ? P.label : this._t("today");
    return html`<div class="ratios">
      ${selfCons != null ? ring(selfCons, c.color_solar, "mdi:solar-power-variant", this._t("self_consumption"), `${this._t("self_consumption_hint")} (${when})`) : nothing}
      ${autarky != null ? ring(autarky, c.color_battery, "mdi:home-lightning-bolt-outline", this._t("autarky"), `${this._t("autarky_hint")} (${when})`) : nothing}
    </div>`;
  }

  // "Devices" hub in the bottom-right corner when every device is shown in its own row.
  _renderDeviceHub(devs, c, hasEnt, node, daily, dayOut) {
    const cc = hasEnt ? c.color_car : "#6b7280";
    const total = devs.reduce((s, d) => s + (d.active && d.power > 0 ? d.power : 0), 0);
    const anyDay = daily && devs.some((d) => d.day != null);
    const dayTotal = anyDay ? devs.reduce((s, d) => s + (d.day || 0), 0) : null;
    const activeCount = devs.filter((d) => d.active).length;
    return node("devices", !hasEnt, html`
      <div class="ic" data-anc="devices" style="color:${cc};border-color:${cc}66;background:${cc}22">
        <ha-icon icon="mdi:power-socket-de"></ha-icon>
      </div>
      <div class="txt">
        <span class="lbl">${this._t("devices")}</span>
        <span class="val" style="color:${cc}">${fmtPower(total)}</span>
        ${activeCount ? html`<span class="sub" style="color:${cc}">${activeCount} ${this._t("active")}</span>` : nothing}
        ${dayOut(dayTotal, "devices", "mdi:power-socket-de")}
      </div>`, "car");
  }

  _renderDeviceItem(d, c, dayOut) {
    const cc = d.hasEnt ? d.color || c.color_car : "#6b7280";
    const ev = this._nodeEvents("dev:" + d.idx);
    const ring = c.car_ring !== false && d.isCar && d.soc != null;
    const r = 18, circ = 2 * Math.PI * r;
    const pct = d.soc == null ? 0 : Math.max(0, Math.min(100, d.soc)) / 100;
    return html`<div class="devitem ${d.active || d.past ? "" : "idle"}"
      @pointerdown=${ev.down} @pointerup=${ev.up} @pointermove=${ev.move}
      @pointerleave=${ev.cancel} @pointercancel=${ev.cancel} @contextmenu=${(e) => e.preventDefault()}>
      ${ring
        ? html`<div class="socwrap sm" data-anc="dev${d.idx}">
            <svg class="socring" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="${r}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3"></circle>
              ${svg`<circle cx="21" cy="21" r="${r}" fill="none" stroke="${cc}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - pct)}" transform="rotate(-90 21 21)"></circle>`}
            </svg>
            <div class="ic round" style="color:${cc}">${renderIcon(d.icon)}</div>
          </div>`
        : html`<div class="ic" data-anc="dev${d.idx}" style="color:${cc};border-color:${cc}66;background:${cc}22">${renderIcon(d.icon)}</div>`}
      <span class="lbl">${d.name}${d.soc != null ? html` · <b style="color:${cc}">${Math.round(d.soc)}%</b>` : nothing}</span>
      <span class="val" style="color:${cc}">${fmtPower(d.power)}</span>
      ${d.active ? html`<span class="sub" style="color:${cc}">${d.isCar ? this._t("charging") : this._t("active")}</span>` : nothing}
      ${dayOut(d.day, "devices", d.icon)}
    </div>`;
  }

  _renderDevices(devs, c, hasEnt, node, dayOut, mode) {
    const GREY = "#6b7280";
    const colOf = (d) => (hasEnt ? d.color || c.color_car : GREY);
    const showRing = c.car_ring !== false;
    const info = (d) => {
      const cc = colOf(d);
      return html`
        <span class="lbl">${d.name}${d.soc != null ? html` · <b style="color:${cc}">${Math.round(d.soc)}%</b>` : nothing}</span>
        <span class="val" style="color:${cc}">${fmtPower(d.power)}</span>
        ${d.active ? html`<span class="sub" style="color:${cc}">${d.isCar ? this._t("charging") : this._t("active")}</span>` : nothing}
        ${dayOut(d.day, "devices", d.icon)}`;
    };
    const squareIcon = (icon, cc) => html`
      <div class="ic" data-anc="devices" style="color:${cc};border-color:${cc}66;background:${cc}22">
        ${renderIcon(icon)}
      </div>`;
    const ringIcon = (d) => {
      const cc = colOf(d);
      const r = 23, circ = 2 * Math.PI * r;
      const pct = d?.soc == null ? 0 : Math.max(0, Math.min(100, d.soc)) / 100;
      return html`
        <div class="socwrap" data-anc="devices">
          <svg class="socring" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"></circle>
            ${hasEnt && d?.soc != null ? svg`<circle cx="26" cy="26" r="23" fill="none" stroke="${cc}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - pct)}" transform="rotate(-90 26 26)"></circle>` : nothing}
          </svg>
          <div class="ic round" style="color:${cc}">${renderIcon(d.icon)}</div>
        </div>`;
    };
    const iconFor = (d) => (showRing && d.isCar && d.soc != null ? ringIcon(d) : squareIcon(d.icon, colOf(d)));

    if (mode !== "scroll" || devs.length === 1) {
      const single = devs.length === 1 ? devs[0] : null;
      const sameIcon = devs.every((d) => d.icon === devs[0].icon);
      const icon = single ? iconFor(single) : squareIcon(sameIcon ? devs[0].icon : "mdi:power-plug", hasEnt ? c.color_car : GREY);
      return node("devices", !hasEnt, html`
        ${icon}
        <div class="txt carinfos">${devs.map((d) => html`<div class="cartxt">${info(d)}</div>`)}</div>`, "car");
    }

    const idx = (this._carScrollIdx || 0) % devs.length;
    const d = devs[idx];
    return node("devices", !hasEnt, html`
      ${iconFor(d)}
      <div class="txt">
        <div class="cartxt caranim" data-k=${idx}>${info(d)}</div>
        <div class="cardots">
          ${devs.map((_, i) => html`<span class="dot ${i === idx ? "on" : ""}" style="background:${i === idx ? colOf(d) : "rgba(255,255,255,.25)"}"></span>`)}
        </div>
      </div>`, "car");
  }

  // Measure where the icons actually are, so wires can start/end exactly at them.
  _measure(force = false) {
    const flow = this.renderRoot?.querySelector?.(".flowwrap");
    const top = this.renderRoot?.querySelector?.(".flow");
    if (!flow || !top) return;
    if (this._roTarget !== flow && typeof ResizeObserver !== "undefined") {
      if (this._ro) this._ro.disconnect();
      this._ro = new ResizeObserver(() => this._measure());
      this._ro.observe(flow);
      this._roTarget = flow;
    }
    const fr = flow.getBoundingClientRect();
    if (!fr.width) return;
    const m = { W: Math.round(fr.width), H: Math.round(fr.height), FH: Math.round(top.getBoundingClientRect().height) };
    flow.querySelectorAll("[data-anc]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const box = {
        left: r.left - fr.left, right: r.right - fr.left, top: r.top - fr.top, bottom: r.bottom - fr.top,
        width: r.width, height: r.height,
      };
      box.cx = box.left + r.width / 2;
      box.cy = box.top + r.height / 2;
      for (const k in box) box[k] = Math.round(box[k] * 2) / 2;
      m[el.dataset.anc] = box;
    });
    const sig = JSON.stringify(m);
    if (force || sig !== this._geoSig) {
      this._geoSig = sig;
      this._geo = m;
      this.requestUpdate();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._startCarScroll();
    this._startChartScroll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._carTimer) { clearInterval(this._carTimer); this._carTimer = null; }
    if (this._flowTimer) { clearInterval(this._flowTimer); this._flowTimer = null; }
    if (this._chartTimer) { clearInterval(this._chartTimer); this._chartTimer = null; }
    if (this._ro) { this._ro.disconnect(); this._ro = null; this._roTarget = null; }
    if (this._eUnsub) { try { this._eUnsub(); } catch (e) { /* ignore */ } this._eUnsub = null; }
    clearTimeout(this._holdTimer);
  }

  _startCarScroll() {
    if (this._carTimer) clearInterval(this._carTimer);
    const secs = Math.max(2, this._config?.car_scroll_interval || 5);
    this._carTimer = setInterval(() => {
      this._carScrollIdx = (this._carScrollIdx || 0) + 1;
      this.requestUpdate();
    }, secs * 1000);
  }

  // Home Assistant hands every card a new `hass` object on ANY state change in the system.
  // Only re-render when one of the entities this card actually uses has changed.
  shouldUpdate(changed) {
    if (!changed.has("hass") || changed.size > 1) return true;
    const old = changed.get("hass");
    if (!old || !this._config || !this.hass) return true;
    if (old.language !== this.hass.language || old.themes !== this.hass.themes || old.locale !== this.hass.locale) return true;
    const ids = this._watchIds();
    for (const id of ids) if (old.states[id] !== this.hass.states[id]) return true;
    return false;
  }

  _watchIds() {
    if (this._watch && this._watch.cfg === this._config) return this._watch.ids;
    const ids = new Set();
    const walk = (v) => {
      if (typeof v === "string") { if (/^[a-z_]+\.[a-z0-9_]+$/i.test(v)) ids.add(v); }
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(this._config);
    this._watch = { cfg: this._config, ids: [...ids] };
    return this._watch.ids;
  }

  updated() {
    // measure icon positions at most once per animation frame (layout reads are expensive)
    if (!this._measureQueued) {
      this._measureQueued = true;
      requestAnimationFrame(() => { this._measureQueued = false; this._measure(); });
    }
    // Restart the fade+slide animation whenever the shown car changes.
    const el = this.renderRoot?.querySelector?.(".caranim");
    if (el && el.dataset.k !== this._lastCarK) {
      this._lastCarK = el.dataset.k;
      el.classList.remove("run");
      // force reflow to restart the CSS animation
      void el.offsetWidth;
      el.classList.add("run");
    }

    // Same trick for the chart tab body, so switching tabs (manual or auto-scroll) fades in.
    const cb = this.renderRoot?.querySelector?.(".chartbody");
    if (cb && cb.dataset.k !== this._lastChartK) {
      this._lastChartK = cb.dataset.k;
      cb.classList.remove("run");
      void cb.offsetWidth;
      cb.classList.add("run");
    }

    // Retune each flow line's animation speed via the Web Animations API instead of
    // rewriting animation-duration: changing that on a running CSS animation restarts
    // it from 0%, which looked like the line "starting over" every time the wire's
    // power (not just its direction) changed. Adjusting playbackRate on the already-
    // running animation keeps its current position and just speeds it up/slows it down.
    const BASE_ANIM_S = 1; // matches the fixed animation-duration in styles
    this.renderRoot?.querySelectorAll?.(".live[data-speed]").forEach((el) => {
      if (typeof el.getAnimations !== "function") return;
      const dur = parseFloat(el.dataset.speed);
      if (!dur || isNaN(dur)) return;
      const rate = BASE_ANIM_S / dur;
      for (const anim of el.getAnimations()) {
        if (Math.abs(anim.playbackRate - rate) > 0.01) anim.playbackRate = rate;
      }
    });
  }

  _chartTabs() {
    const c = this._config;
    return [
      { id: "price", label: this._t("tab_price"), show: !!c.price_entity || !!c.price_use_tibber_service },
      { id: "solar", label: this._t("tab_solar"), show: !!c.solar_power },
      { id: "grid", label: this._t("tab_grid"), show: this._src("grid").entities.length > 0 },
      { id: "accu", label: this._t("tab_battery"), show: !!c.battery_soc },
      {
        id: "usage",
        label: this._t("tab_usage"),
        show: !!(c.solar_power || this._src("grid").entities.length || this._src("battery").entities.length),
      },
      { id: "devices", label: this._t("tab_devices"), show: this._devices().some((d) => d.power || d.energy) },
    ].filter((t) => t.show);
  }

  _renderPrice() {
    const c = this._config;
    const mode = this._chartMode || "price";
    const tabs = this._chartTabs();
    const activeMode = tabs.some((t) => t.id === mode) ? mode : (tabs[0]?.id || "price");

    const tabBar = tabs.length > 1 ? html`
      <div class="tabs">
        ${tabs.map((t) => html`
          <button class="tab ${t.id === activeMode ? "on" : ""}" @click=${() => this._setChartMode(t.id, true)}>${t.label}</button>`)}
      </div>` : nothing;

    // Time-span chips: price chart -> hours ahead; all other charts -> history span.
    let ranges;
    if (activeMode === "price") {
      const cur = this._priceHours ?? Math.max(8, Math.min(48, c.price_hours || 24));
      ranges = html`<div class="ranges">${PRICE_RANGES.map((h) => html`
        <button class="rng ${h === cur ? "on" : ""}" @click=${() => { this._priceHours = h; this._selectedSlot = null; this._tapLock = false; this._pauseAutoScroll(); this.requestUpdate(); }}>${h}h</button>`)}</div>`;
    } else if (this._period()) {
      ranges = html`<div class="ranges"><span class="rng on period"><ha-icon icon="mdi:calendar"></ha-icon>${this._period().label}</span></div>`;
    } else {
      const cur = this._histRange ?? c.history_range ?? "today";
      ranges = html`<div class="ranges">${HISTORY_RANGES.map((r) => html`
        <button class="rng ${r.id === cur ? "on" : ""}" @click=${() => { this._histRange = r.id; this._cursor = null; this._pauseAutoScroll(); this.requestUpdate(); }}>${this._t("range_" + r.id)}</button>`)}</div>`;
    }

    let body;
    if (activeMode === "price") body = this._priceChart(c);
    else body = this._historyChart(c, activeMode);

    return html`<div class="price">${tabBar}${ranges}<div class="chartbody" data-k=${activeMode}>${body}</div></div>`;
  }

  _setChartMode(m, manual = false) {
    if (this._chartMode !== m) { this._cursor = null; }
    this._chartMode = m;
    if (manual) this._pauseAutoScroll();
    this.requestUpdate();
  }

  // A manual interaction restarts the auto-scroll timer so the user's choice sticks.
  _pauseAutoScroll() {
    if (this._config?.chart_auto_scroll) this._startChartScroll();
  }

  _startChartScroll() {
    if (this._chartTimer) { clearInterval(this._chartTimer); this._chartTimer = null; }
    if (!this._config?.chart_auto_scroll) return;
    const secs = Math.max(3, this._config.chart_scroll_interval || 8);
    this._chartTimer = setInterval(() => {
      if (this._cursor != null || this._tapLock) return; // user is inspecting a point in time
      const tabs = this._chartTabs();
      if (tabs.length < 2) return;
      const mode = this._chartMode || "price";
      const idx = tabs.findIndex((t) => t.id === mode);
      const next = tabs[(idx + 1) % tabs.length];
      this._setChartMode(next.id, false);
    }, secs * 1000);
  }

  // Solar forecast exactly like the HA energy dashboard: the forecast integrations
  // (Forecast.Solar, Solcast, …) configured there, summed, via energy/solar_forecast.
  async _ensureForecast() {
    if (this._config.solar_forecast === false || !this.hass?.callWS) return;
    const f = this._fc;
    const sel = JSON.stringify(this._config.solar_forecast_entries || []);
    if (f && f.sel === sel && (f.busy || Date.now() - f.fetched < 900000)) return;
    this._fc = { ...(f && f.sel === sel ? f : { points: [] }), busy: true, fetched: Date.now(), sel };
    let ids = null;
    try {
      const prefs = await this.hass.callWS({ type: "energy/get_prefs" });
      ids = (prefs?.energy_sources || []).filter((x) => x.type === "solar").flatMap((x) => x.config_entry_solar_forecast || []);
    } catch (e) { /* no energy prefs -> use every forecast */ }
    let data;
    try {
      data = (await this.hass.callWS({ type: "energy/solar_forecast" })) || {};
    } catch (e) {
      this._fc = { busy: false, fetched: Date.now(), points: [], error: true };
      this.requestUpdate();
      return;
    }
    // optional per-card selection (e.g. two buildings in one Home Assistant)
    const chosen = Array.isArray(this._config.solar_forecast_entries) ? this._config.solar_forecast_entries.filter(Boolean) : [];
    const use = chosen.length ? chosen : (ids && ids.length ? ids : Object.keys(data));
    // Like the energy dashboard: collect everything into whole-hour buckets. Some forecasts
    // (e.g. Forecast.Solar) also contain odd timestamps such as sunrise/sunset (07:43),
    // which must not be mistaken for a shorter time step.
    const HOUR = 3600000;
    const sum = new Map();
    for (const id of use) {
      for (const [k, wh] of Object.entries(data[id]?.wh_hours || {})) {
        const t = Date.parse(k);
        if (isNaN(t)) continue;
        const h = Math.floor(t / HOUR) * HOUR;
        sum.set(h, (sum.get(h) || 0) + (+wh || 0));
      }
    }
    const ts = [...sum.keys()].sort((a, b) => a - b);
    // Wh per hour == average power in W for that hour, drawn at the middle of the hour
    const points = ts.map((t) => ({ t, wh: sum.get(t), v: sum.get(t) }));
    this._fc = { busy: false, fetched: Date.now(), points, step: HOUR, sel };
    this.requestUpdate();
  }

  _forecastPoints() {
    if (this._config.solar_forecast === false) return null;
    this._ensureForecast();
    const pts = this._fc?.points;
    return pts && pts.length ? pts : null;
  }

  // forecast kWh for today (whole day) or null when no forecast is configured
  _forecastToday() {
    const pts = this._forecastPoints();
    if (!pts) return null;
    const a = startOfToday(), b = a + 86400000;
    return pts.filter((p) => p.t >= a && p.t < b).reduce((x, p) => x + p.wh, 0) / 1000;
  }

  // ---------------------------------------------------------------------------
  // Electricity costs: grid import (5-minute means from the recorder statistics, raw
  // history as fallback) × the price valid at that time. Yesterday's prices come from
  // the history of the price entity (provider attributes usually start today).
  // ---------------------------------------------------------------------------
  async _ensureCostData() {
    const c = this._config;
    if (!this.hass?.callWS || c.price_show_costs === false) return;
    const gs = this._src("grid");
    if (!gs.entities.length) return;
    const y0 = startOfToday() - 86400000;
    const key = gs.entities.join(",") + "|" + (c.price_entity || "") + "|" + y0;
    const now = Date.now();
    const old = this._cost;
    if (old && old.key === key && (old.busy || now - old.fetched < 300000)) return;
    this._cost = { ...(old && old.key === key ? old : {}), key, busy: true, fetched: now };
    const startIso = new Date(y0).toISOString();
    const endIso = new Date(now).toISOString();
    const grid = {};
    try {
      const r = await this.hass.callWS({
        type: "recorder/statistics_during_period", start_time: startIso, end_time: endIso,
        statistic_ids: gs.entities, period: "5minute", types: ["mean"],
      });
      for (const id of gs.entities) {
        const f = unitFactor(this.hass.states[id]?.attributes?.unit_of_measurement);
        const arr = r?.[id];
        if (Array.isArray(arr) && arr.length) {
          grid[id] = arr.map((x) => ({ t: typeof x.start === "number" ? x.start : Date.parse(x.start), v: (x.mean || 0) * f, dur: 300000 }));
        }
      }
    } catch (e) { /* fall back to history */ }
    const missing = gs.entities.filter((id) => !grid[id]);
    if (missing.length) {
      try {
        const res = await this.hass.callApi("GET", `history/period/${startIso}?filter_entity_id=${missing.join(",")}&end_time=${encodeURIComponent(endIso)}&minimal_response&no_attributes`);
        for (const arr of Array.isArray(res) ? res : []) {
          if (!Array.isArray(arr) || !arr.length) continue;
          const id = arr[0].entity_id;
          const f = unitFactor(this.hass.states[id]?.attributes?.unit_of_measurement);
          const pts = arr.map((x) => ({ t: Math.max(y0, Date.parse(x.last_changed || x.last_updated)), v: (parseFloat(x.state) || 0) * f }));
          grid[id] = pts.map((p, i) => ({ ...p, dur: (i + 1 < pts.length ? pts[i + 1].t : now) - p.t }));
        }
      } catch (e) { /* no data */ }
    }
    let priceHist = [];
    if (c.price_use_tibber_service) {
      priceHist = await this._tibberRange(y0, now);
    } else if (c.price_entity) {
      try {
        const res = await this.hass.callApi("GET", `history/period/${new Date(y0 - 3600000).toISOString()}?filter_entity_id=${c.price_entity}&end_time=${encodeURIComponent(endIso)}&minimal_response&no_attributes`);
        const arr = Array.isArray(res) && res[0] ? res[0] : [];
        priceHist = arr.map((x) => ({ t: Date.parse(x.last_changed || x.last_updated), v: normalizePrice(parseFloat(x.state)) }))
          .filter((p) => !isNaN(p.v) && !isNaN(p.t));
      } catch (e) { /* no price history */ }
    }
    this._cost = { key, busy: false, fetched: Date.now(), grid, priceHist };
    this.requestUpdate();
  }

  // { kwh, eur } of grid import for the local day starting at dayStart (null if no data)
  _costFor(dayStart, pricePoints) {
    const d = this._cost;
    if (!d || !d.grid) return null;
    const gs = this._src("grid");
    // import power samples (W) with their duration
    let samples = [];
    if (gs.dual) samples = (d.grid[gs.pos] || []).map((p) => ({ ...p, v: Math.max(0, Math.abs(p.v)) }));
    else samples = (d.grid[gs.signed] || []).map((p) => ({ ...p, v: Math.max(0, p.v * gs.sign) }));
    if (!samples.length) return null;
    // price lookup: provider list wins where it has data, history of the entity fills the rest
    return costCalc(samples, [...(d.priceHist || []), ...(pricePoints || [])], dayStart, Math.min(addDays(dayStart, 1), Date.now()));
  }

  _rangeSpec() {
    const id = this._histRange ?? this._config.history_range ?? "today";
    const r = HISTORY_RANGES.find((x) => x.id === id) || HISTORY_RANGES.find((x) => x.id === "today");
    const end = Date.now();
    const start = r.hours == null ? startOfToday() : end - r.hours * 3600000;
    return { id: r.id, start, end, now: end, hours: (end - start) / 3600000 };
  }

  // Load (and cache) history for a set of entities over the chosen span. Spans longer
  // than 24 h use the recorder's 5-minute/hourly statistics (much lighter), falling back
  // to raw history for entities without statistics.
  _seriesData(entities, spec) {
    entities = [...new Set(entities.filter(Boolean))];
    if (!entities.length || !this.hass) return { byEntity: {}, loaded: true };
    this._hcache = this._hcache || {};
    const key = entities.join(",") + "|" + spec.id;
    const final = spec.past;
    const cached = this._hcache[key];
    const maxAge = spec.hours > 24 ? 600000 : 60000;
    if (!cached || (!cached.busy && !(final && cached.loaded) && Date.now() - cached.fetched > maxAge)) {
      this._hcache[key] = { ...(cached || { byEntity: {} }), busy: true, fetched: Date.now() };
      this._fetchSeries(entities, spec).then((res) => {
        this._hcache[key] = { ...res, busy: false, fetched: Date.now(), loaded: true };
        this.requestUpdate();
      });
    }
    return this._hcache[key];
  }

  async _fetchSeries(entities, spec) {
    const byEntity = {};
    const factor = (id) => unitFactor(this.hass.states[id]?.attributes?.unit_of_measurement);
    let missing = entities;
    let error = false;
    if (spec.hours > 24 && this.hass.callWS) {
      try {
        const r = await this.hass.callWS({
          type: "recorder/statistics_during_period",
          start_time: new Date(spec.start).toISOString(),
          end_time: new Date(spec.end).toISOString(),
          statistic_ids: entities,
          period: spec.hours > 48 ? "hour" : "5minute",
          types: ["mean"],
        });
        for (const id of entities) {
          const arr = r?.[id];
          if (!Array.isArray(arr) || !arr.length) continue;
          const f = factor(id);
          byEntity[id] = arr
            .map((s) => ({ t: typeof s.start === "number" ? s.start : Date.parse(s.start), v: s.mean * f }))
            .filter((p) => !isNaN(p.v) && !isNaN(p.t));
        }
      } catch (e) { /* fall back to history */ }
      missing = entities.filter((id) => !byEntity[id]);
    }
    if (missing.length) {
      try {
        const url = `history/period/${new Date(spec.start).toISOString()}?filter_entity_id=${missing.join(",")}` +
          `&end_time=${encodeURIComponent(new Date(spec.end).toISOString())}&minimal_response&no_attributes`;
        const res = await this.hass.callApi("GET", url);
        for (const arr of Array.isArray(res) ? res : []) {
          if (!Array.isArray(arr) || !arr.length) continue;
          const id = arr[0].entity_id;
          const f = factor(id);
          const pts = arr.map((s) => ({
            t: Math.max(spec.start, Date.parse(s.last_changed || s.last_updated)),
            v: parseFloat(s.state) * f,
          })).filter((p) => !isNaN(p.v) && !isNaN(p.t));
          byEntity[id] = downsample(pts, spec.start, spec.end, 600);
        }
      } catch (e) {
        error = true;
      }
    }
    return { byEntity, error };
  }

  _historyChart(c, mode) {
    let spec = this._rangeSpec();
    const P = this._period();
    if (P) {
      const end = Math.min(P.end, Date.now());
      spec = { id: `p${P.start}-${P.end}`, start: P.start, end: P.live ? end : P.end, now: end, hours: (end - P.start) / 3600000, past: !P.live, label: P.label };
    }
    const T = (k) => this._t(k);
    const live = (e) => pw(this.hass, e);
    let series = [];
    let opts = {};
    let entities = [];

    if (mode === "solar") {
      entities = [c.solar_power];
      series = [{ name: T("solar"), color: c.color_solar, entity: c.solar_power, area: true, live: live(c.solar_power) }];
      opts = { title: T("tab_solar") };
      const fc = this._forecastPoints();
      if (fc) {
        // "today": like the energy dashboard, the axis runs to midnight so the rest of the day's forecast is visible
        if (spec.id === "today") spec = { ...spec, end: spec.start + 86400000 };
        const half = (this._fc.step || 3600000) / 2;
        const total = this._forecastToday();
        series.push({
          name: T("forecast"), color: c.color_solar, forecast: true,
          points: fc.map((p) => ({ t: p.t + half, v: p.v })).filter((p) => p.t >= spec.start - half * 2 && p.t <= spec.end + half * 2),
          legendNow: total != null && spec.id === "today" ? `${T("forecast_today")} ${fmtKWh(total)} kWh` : null,
        });
      }
    } else if (mode === "grid") {
      entities = this._src("grid").entities;
      series = [{
        name: T("grid"), color: c.color_grid, src: "grid", live: this._srcValue("grid"), split: true,
        label: (v) => (v < 0 ? T("grid_export") : T("grid_import")),
      }];
      opts = { title: T("grid_title"), signed: true, splitColors: { pos: c.color_grid, neg: c.color_grid_export || "#22c55e" } };
    } else if (mode === "accu") {
      entities = [c.battery_soc];
      series = [{ name: T("battery"), color: c.color_battery, entity: c.battery_soc, area: true, live: num(this.hass, c.battery_soc) }];
      opts = { title: T("battery_soc_title"), fixedMax: 100, unit: "%" };
    } else if (mode === "usage" && (this._useView || c.usage_view || "line") === "bars") {
      return this._usageBars(c, spec);
    } else if (mode === "usage") {
      entities = [c.solar_power, ...this._src("battery").entities, ...this._src("grid").entities];
      opts = { title: T("usage_title"), signed: true, merged: true };
    } else if (mode === "devices" && (this._devView || c.devices_view || "line") !== "line") {
      return this._devicesAltChart(c, spec, this._devView || c.devices_view);
    } else if (mode === "devices") {
      const cols = this._devColors();
      const devs = this._devices().map((d, i) => ({ ...d, idx: i })).filter((d) => d.power);
      entities = devs.map((d) => d.power);
      series = devs.map((d) => ({
        name: d.name || this._t("dev_" + d.type), color: cols[d.idx],
        entity: d.power, live: live(d.power),
      }));
      opts = { title: T("devices_title") };
    }

    const data = this._seriesData(entities, spec);
    const byEntity = data.byEntity || {};

    if (mode === "usage") {
      // solar, battery (discharge +, charge −), grid (+ import, − export) and the computed home use
      const sol = byEntity[c.solar_power] || [];
      const grd = this._srcSeries("grid", byEntity);
      const battPts = this._srcSeries("battery", byEntity);
      const homePts = mergeSeries([sol, grd, battPts], ([s, g, b]) => s + g + b);
      const vv = this._liveV();
      series = [
        c.solar_power ? { name: T("solar"), color: c.color_solar, points: sol, live: vv.solar } : null,
        battPts.length ? { name: T("battery"), color: c.color_battery, points: battPts, live: this._srcValue("battery") } : null,
        grd.length ? { name: T("grid"), color: c.color_grid, points: grd, live: vv.grid } : null,
        homePts.length ? { name: T("home"), color: c.color_home, points: homePts, live: this._homePower(vv), area: true } : null,
      ].filter(Boolean);
    } else {
      series = series.map((s) => (s.forecast ? s : { ...s, points: s.src ? this._srcSeries(s.src, byEntity) : (byEntity[s.entity] || []) }));
    }

    return this._lineChart({ ...opts, series, spec, loading: !data.loaded, error: data.error, toggleKey: mode, headExtra: mode === "devices" ? this._devViewSwitch() : mode === "usage" ? this._useViewSwitch() : nothing });
  }

  // Generic time-series chart (line/area) with a draggable time cursor underneath.
  _lineChart({ title, series, spec, signed = false, fixedMax = null, unit = "W", splitColors = null, loading = false, error = false, toggleKey = null, headExtra = nothing }) {
    const startMs = spec.start;
    const endMs = spec.end;
    const span = Math.max(1, endMs - startMs);
    const lang = resolveLang(this._config.language, this.hass);

    const nowMs = Math.min(endMs, spec.now ?? endMs);
    const nowFrac = (nowMs - startMs) / span;
    // extend every measured series to "now" with its live (or last) value
    const S = series.map((s) => {
      if (s.forecast) return { ...s, pts: (s.points || []).slice() };
      const pts = (s.points || []).filter((p) => p.t <= nowMs);
      if (pts.length) {
        const lastV = !spec.past && s.live != null && !isNaN(s.live) ? s.live : pts[pts.length - 1].v;
        pts.push({ t: nowMs, v: lastV });
      }
      return { ...s, pts };
    });
    // Series switched off by tapping their legend entry (per chart, kept while the card lives).
    const canToggle = !!toggleKey && S.length > 1;
    const hidden = canToggle ? (this._hidden?.[toggleKey] || new Set()) : new Set();
    const toggle = (name) => {
      this._hidden = this._hidden || {};
      const set = new Set(this._hidden[toggleKey] || []);
      if (set.has(name)) set.delete(name); else set.add(name);
      this._hidden[toggleKey] = set;
      this.requestUpdate();
    };
    const SV = S.filter((s) => !hidden.has(s.name));
    const hasData = SV.some((s) => s.pts.length);

    const vals = SV.flatMap((s) => s.pts.map((p) => p.v));
    let minV, maxV;
    if (fixedMax != null) { minV = 0; maxV = fixedMax; }
    else {
      maxV = Math.max(0, ...vals);
      minV = signed ? Math.min(0, ...vals) : 0;
      if (maxV - minV < 10) maxV = minV + 10;
      const pad = (maxV - minV) * 0.08;
      maxV += pad;
      if (minV < 0) minV -= pad;
    }
    const xOf = (t) => Math.max(0, Math.min(1, (t - startMs) / span)) * 100;
    const yOf = (v) => ((maxV - v) / (maxV - minV)) * 100;
    const y0 = yOf(Math.max(minV, Math.min(maxV, 0)));
    // step lines (a value holds until the next change), which is how HA records power
    const stepPath = (pts) => {
      let d = "";
      pts.forEach((p, i) => {
        const x = xOf(p.t).toFixed(2), y = yOf(p.v).toFixed(2);
        if (i === 0) d = `M${x},${y}`;
        else d += ` H${x} V${y}`;
      });
      return d;
    };
    const areaPath = (pts) => {
      if (!pts.length) return "";
      return `${stepPath(pts)} L${xOf(pts[pts.length - 1].t).toFixed(2)},${y0.toFixed(2)} L${xOf(pts[0].t).toFixed(2)},${y0.toFixed(2)} Z`;
    };

    const fmtVal = (v) => {
      if (v == null || isNaN(v)) return "–";
      if (unit === "%") return Math.round(v) + "%";
      return fmtPower(v);
    };
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
      const v = maxV - f * (maxV - minV);
      if (unit === "%") return Math.round(v) + "";
      const a = Math.abs(maxV) > Math.abs(minV) ? Math.abs(maxV) : Math.abs(minV);
      return a >= 1000 ? (v / 1000).toFixed(1).replace(".", ",") + "k" : String(Math.round(v));
    });

    const labels = timeLabels(startMs, endMs, lang, nowMs >= endMs);

    // cursor
    const cur = this._cursor;
    const tCur = cur == null ? null : startMs + cur * span;
    const valueAt = (pts, t, linear = false) => {
      if (!pts.length || t > pts[pts.length - 1].t + 1000) return null;
      if (linear) {
        if (t < pts[0].t) return null;
        for (let i = 1; i < pts.length; i++) {
          if (pts[i].t >= t) { const a = pts[i - 1], b = pts[i]; return a.v + ((b.v - a.v) * (t - a.t)) / Math.max(1, b.t - a.t); }
        }
        return pts[pts.length - 1].v;
      }
      let last = null;
      for (const p of pts) { if (p.t > t) break; last = p.v; }
      return last;
    };
    const timeTxt = tCur == null
      ? (spec.past ? spec.label : this._t("now"))
      : new Date(tCur).toLocaleString(lang, span > 86400000
        ? { weekday: "short", hour: "2-digit", minute: "2-digit" }
        : { hour: "2-digit", minute: "2-digit" });

    const clipPos = `efp-cp-${this._uid}`, clipNeg = `efp-cn-${this._uid}`;

    return html`
      <div class="chdr">
        <span class="t">${title}${headExtra}</span>
        <span class="now ${cur != null ? "sel" : ""}"><ha-icon icon="mdi:clock-outline"></ha-icon><b>${timeTxt}</b>${cur != null ? this._resetBtn(() => { this._cursor = null; this.requestUpdate(); }) : nothing}</span>
      </div>
      <div class="usage-legend">
        ${S.map((s) => {
          const v = tCur == null
            ? (s.forecast ? valueAt(s.pts, nowMs, true) : ((spec.past ? null : s.live) ?? (s.pts.length ? s.pts[s.pts.length - 1].v : null)))
            : valueAt(s.pts, tCur, !!s.forecast);
          const lbl = s.label && v != null ? s.label(v) : s.name;
          if (s.forecast && tCur == null && s.legendNow) {
            const off = hidden.has(s.name);
            return html`<span class="usage-legend-item fc ${canToggle ? "tog" : ""} ${off ? "off" : ""}"
              @click=${canToggle ? () => toggle(s.name) : null}><i class="dash" style="border-color:${s.color}"></i><b style="color:${s.color}">${s.legendNow}</b></span>`;
          }
          const col = s.split && splitColors && v != null ? (v < 0 ? splitColors.neg : splitColors.pos) : s.color;
          const off = hidden.has(s.name);
          return html`<span class="usage-legend-item ${canToggle ? "tog" : ""} ${off ? "off" : ""}"
            title=${canToggle ? this._t(off ? "legend_show" : "legend_hide") : ""}
            @click=${canToggle ? () => toggle(s.name) : null}>${s.forecast ? html`<i class="dash" style="border-color:${col}"></i>` : html`<i style="background:${col}"></i>`}${lbl} <b style="color:${col}">${fmtVal(s.split && v != null ? Math.abs(v) : v)}</b></span>`;
        })}
      </div>
      <div class="chart">
        <div class="yaxis">${yTicks.map((t) => html`<span>${t}</span>`)}</div>
        <div class="plot">
          ${hasData
            ? html`<svg class="hist" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <clipPath id="${clipPos}"><rect x="0" y="0" width="100" height="${y0}"></rect></clipPath>
                  <clipPath id="${clipNeg}"><rect x="0" y="${y0}" width="100" height="${Math.max(0, 100 - y0)}"></rect></clipPath>
                </defs>
                ${minV < 0 ? svg`<line x1="0" y1="${y0}" x2="100" y2="${y0}" stroke="var(--divider-color, rgba(255,255,255,.2))" stroke-width="1" vector-effect="non-scaling-stroke"></line>` : nothing}
                ${SV.map((s) => {
                  if (!s.pts.length) return nothing;
                  const line = stepPath(s.pts);
                  if (s.split && splitColors) {
                    const area = areaPath(s.pts);
                    return svg`
                      <path d="${area}" fill="${splitColors.pos}33" clip-path="url(#${clipPos})"></path>
                      <path d="${area}" fill="${splitColors.neg}33" clip-path="url(#${clipNeg})"></path>
                      <path d="${line}" fill="none" stroke="${splitColors.pos}" stroke-width="1.5" vector-effect="non-scaling-stroke" clip-path="url(#${clipPos})"></path>
                      <path d="${line}" fill="none" stroke="${splitColors.neg}" stroke-width="1.5" vector-effect="non-scaling-stroke" clip-path="url(#${clipNeg})"></path>`;
                  }
                  if (s.forecast) {
                    const d = s.pts.map((p, i) => `${i ? "L" : "M"}${xOf(p.t).toFixed(2)},${yOf(p.v).toFixed(2)}`).join(" ");
                    return svg`<path d="${d}" fill="none" stroke="${s.color}" stroke-opacity=".75" stroke-width="1.5" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"></path>`;
                  }
                  return svg`
                    ${s.area ? svg`<path d="${areaPath(s.pts)}" fill="${s.color}22"></path>` : nothing}
                    <path d="${line}" fill="none" stroke="${s.color}" stroke-width="1.5" vector-effect="non-scaling-stroke"></path>`;
                })}
              </svg>`
            : html`<div class="empty">${error ? this._t("history_none") : loading ? this._t("history_loading") : this._t("history_none")}</div>`}
          ${spec.past ? nothing : html`<div class="nowline ${nowFrac > 0.85 ? "right" : ""}" data-now="${this._t("now")}" style="left:${nowFrac * 100}%"></div>`}
          ${tCur != null ? html`
            <div class="cursor" style="left:${cur * 100}%"></div>
            ${SV.map((s) => {
              const v = valueAt(s.pts, tCur, !!s.forecast);
              if (v == null) return nothing;
              const col = s.split && splitColors ? (v < 0 ? splitColors.neg : splitColors.pos) : s.color;
              return html`<span class="cdot" style="left:${cur * 100}%;top:${yOf(v)}%;background:${col}"></span>`;
            })}` : nothing}
        </div>
        <div class="xaxis">
          ${labels.map((l) => html`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}
        </div>
      </div>
      ${this._scrubber(cur == null ? nowFrac : cur, (f) => { this._cursor = Math.abs(f - nowFrac) < 0.003 ? null : f; this.requestUpdate(); })}
    `;
  }

  // ---------------------------------------------------------------------------
  // Devices: alternative views (stacked kWh bars, ranking, donut, energy flow)
  // ---------------------------------------------------------------------------
  _useViewSwitch() {
    const cur = this._useView || this._config.usage_view || "line";
    const views = [["line", "mdi:chart-line"], ["bars", "mdi:chart-bar-stacked"]];
    return html`<span class="vsw">${views.map(([id, icon]) => html`<button class="vbtn ${id === cur ? "on" : ""}" title=${this._t("view_" + id)}
      @click=${(e) => { e.stopPropagation(); this._useView = id; this._cursor = null; this._pauseAutoScroll(); this.requestUpdate(); }}><ha-icon icon=${icon}></ha-icon></button>`)}</span>`;
  }

  // Energy-dashboard style usage bars: per hour/day the consumption by source above zero
  // (PV used directly, battery discharge, grid import) and battery charge / grid export below.
  _usageBars(c, spec) {
    const out = this._usageBars2(c, spec);
    const d = this._devEnergy(spec);
    return d && d.stale ? html`<div class="stalewrap">${out}<div class="staleov"><ha-icon icon="mdi:loading" class="spin"></ha-icon></div></div>` : out;
  }

  _usageBars2(c, spec) {
    const T = (k) => this._t(k);
    const lang = resolveLang(c.language, this.hass);
    const data = this._devEnergy(spec);
    const head = (extra) => html`<div class="chdr"><span class="t">${T("usage_title")}${this._useViewSwitch()}</span>${extra}</div>`;
    if (!data || !data.loaded) return html`${head(nothing)}<div class="chart"><div class="plot"><div class="empty">${T("history_loading")}</div></div></div>`;
    const n = data.buckets.length || 1;
    const pvDirect = data.buckets.map((_, i) => Math.max(0, data.solar[i] - data.grid.neg[i] - data.batt.neg[i]));
    const series = [
      { id: "pv", name: T("pv_direct"), color: c.color_solar, sign: 1, vals: pvDirect },
      { id: "bout", name: T("batt_discharge"), color: c.color_battery, sign: 1, vals: data.batt.pos },
      { id: "gin", name: T("grid_import"), color: c.color_grid, sign: 1, vals: data.grid.pos },
      { id: "bin", name: T("batt_charge"), color: c.color_batt_charge || "#f472b6", sign: -1, vals: data.batt.neg },
      { id: "gout", name: T("grid_export"), color: (() => { const e = c.color_grid_export || "#22c55e"; return colorDist(e, c.color_battery || "#4caf50") < 35 ? "#8b5cf6" : e; })(), sign: -1, vals: data.grid.neg },
    ].filter((x) => x.vals.some((v) => v > 0.0005));
    const hidden = this._hidden?.usagebars || new Set();
    const toggle = (id) => {
      this._hidden = this._hidden || {};
      const set = new Set(this._hidden.usagebars || []);
      if (set.has(id)) set.delete(id); else set.add(id);
      this._hidden.usagebars = set;
      this.requestUpdate();
    };
    const vis = series.filter((x) => !hidden.has(x.id));
    const posSum = data.buckets.map((_, i) => vis.filter((x) => x.sign > 0).reduce((a, x) => a + (x.vals[i] || 0), 0));
    const negSum = data.buckets.map((_, i) => vis.filter((x) => x.sign < 0).reduce((a, x) => a + (x.vals[i] || 0), 0));
    let hi = Math.max(0.1, ...posSum), lo = Math.max(0, ...negSum);
    const pad = (hi + lo) * 0.06; hi += pad; if (lo > 0) lo += pad;
    const yOf = (v) => ((hi - v) / (hi + lo)) * 100;
    const y0 = yOf(0);
    const cur = this._cursor;
    const bi = cur == null ? null : Math.max(0, Math.min(n - 1, Math.floor(cur * n)));
    const fmtB = (t) => new Date(t).toLocaleString(lang, data.period === "hour" ? { hour: "2-digit", minute: "2-digit" } : data.period === "day" ? { weekday: "short", day: "numeric", month: "numeric" } : { month: "short", year: "numeric" });
    const labels = [];
    const every = Math.max(1, Math.ceil(n / 6));
    for (let i = 0; i < n; i += every) labels.push({ frac: (i + 0.5) / n, text: data.period === "hour" ? new Date(data.buckets[i].t).getHours() + ":00" : fmtB(data.buckets[i].t) });
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => hi - f * (hi + lo));
    const dec = hi + lo < 4 ? 1 : 0;
    const kwh = (x) => `${fmtKWh(x)} kWh`;
    const total = (x) => x.vals.reduce((a, v) => a + (v || 0), 0);
    return html`
      ${head(html`<span class="now ${bi != null ? "sel" : ""}"><ha-icon icon="mdi:clock-outline"></ha-icon><b>${bi != null ? fmtB(data.buckets[bi].t) : (spec.label || T("range_" + spec.id))}</b>${bi != null ? this._resetBtn(() => { this._cursor = null; this.requestUpdate(); }) : nothing}</span>`)}
      <div class="usage-legend">${series.map((x) => {
        const off = hidden.has(x.id);
        const v = bi != null ? (x.vals[bi] || 0) : total(x);
        return html`<span class="usage-legend-item tog ${off ? "off" : ""}" @click=${() => toggle(x.id)}><i style="background:${x.color}"></i>${x.name} <b style="color:${x.color}">${x.sign < 0 && v > 0 ? "−" : ""}${kwh(v)}</b></span>`;
      })}</div>
      <div class="chart">
        <div class="yaxis">${ticks.map((t) => html`<span>${(Math.abs(t) < 1e-9 ? 0 : t).toFixed(dec).replace(".", ",")}</span>`)}</div>
        <div class="plot">
          <svg class="hist" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="${y0}" x2="100" y2="${y0}" stroke="var(--divider-color, rgba(255,255,255,.25))" stroke-width="1" vector-effect="non-scaling-stroke"></line>
            ${data.buckets.map((b, i) => {
              const w = 100 / n, x0 = i * w + w * 0.14, bw = w * 0.72;
              const on = bi == null || bi === i;
              let up = 0, down = 0;
              return svg`${vis.map((x) => {
                const v = x.vals[i] || 0;
                if (v <= 0) return nothing;
                let ya, yb;
                if (x.sign > 0) { ya = yOf(up + v); yb = yOf(up); up += v; } else { ya = yOf(-down); yb = yOf(-(down + v)); down += v; }
                return svg`<rect x="${x0}" y="${ya}" width="${bw}" height="${Math.max(0.2, yb - ya)}" fill="${x.color}" fill-opacity="${on ? 0.45 : 0.15}"
                  stroke="${x.color}" stroke-opacity="${on ? 1 : 0.4}" stroke-width="1" vector-effect="non-scaling-stroke"></rect>`;
              })}`;
            })}
          </svg>
          ${bi != null ? html`<div class="cursor" style="left:${((bi + 0.5) / n) * 100}%"></div>` : nothing}
        </div>
        <div class="xaxis">${labels.map((l) => html`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}</div>
      </div>
      ${this._scrubber(cur == null ? 1 : cur, (f) => { this._cursor = f >= 0.999 ? null : f; this.requestUpdate(); })}`;
  }

  _devViewSwitch() {
    const cur = this._devView || this._config.devices_view || "line";
    const views = [["line", "mdi:chart-line"], ["bars", "mdi:chart-bar-stacked"], ["rank", "mdi:format-list-bulleted-square"], ["donut", "mdi:chart-donut"], ["sankey", "mdi:chart-sankey"]];
    return html`<span class="vsw">${views.map(([id, icon]) => html`<button class="vbtn ${id === cur ? "on" : ""}" title=${this._t("view_" + id)}
      @click=${(e) => { e.stopPropagation(); this._devView = id; this._cursor = null; this._pauseAutoScroll(); this.requestUpdate(); }}><ha-icon icon=${icon}></ha-icon></button>`)}</span>`;
  }

  // kWh per device and bucket (hour / day / month) plus the house consumption per bucket.
  _devEnergy(spec) {
    const c = this._config;
    const devs = this._devices().map((d, i) => ({ ...d, idx: i })).filter((d) => d.power || d.energy);
    const span = Math.max(1, spec.end - spec.start);
    const period = span <= 2.1 * 86400000 ? "hour" : span <= 92 * 86400000 ? "day" : "month";   // display buckets
    const fetchPeriod = span <= 35 * 86400000 ? "hour" : period === "month" ? "month" : "day";   // data resolution
    const gs = this._src("grid"), bs = this._src("battery");
    const base = [c.solar_power, ...gs.entities, ...bs.entities].filter(Boolean);
    const ids = [...new Set([...devs.map((d) => d.energy || d.power), ...base].filter(Boolean))];
    const key = `${spec.id}|${spec.start}|${period}|${ids.join(",")}`;
    this._dcache = this._dcache || {};
    const cached = this._dcache[key];
    const maxAge = spec.past ? Infinity : 300000;
    if (!cached || (!cached.busy && Date.now() - cached.fetched > maxAge)) {
      this._dcache[key] = { ...(cached || {}), busy: true, fetched: Date.now() };
      (async () => {
        const [r, priceHist] = await Promise.all([
          this.hass.callWS({
            type: "recorder/statistics_during_period", start_time: new Date(spec.start).toISOString(), end_time: new Date(spec.end).toISOString(),
            statistic_ids: ids, period: fetchPeriod, types: ["change", "mean"], units: { energy: "kWh" },
          }).catch(() => ({})),
          this._priceHistory(spec.start, Math.min(spec.end, Date.now()), span),
        ]);
        // display buckets
        const buckets = [];
        const d0 = new Date(spec.start);
        if (period === "hour") d0.setMinutes(0, 0, 0); else d0.setHours(0, 0, 0, 0);
        if (period === "month") d0.setDate(1);
        for (let t = d0.getTime(); t < spec.end && buckets.length < 400;) {
          const n = new Date(t);
          if (period === "hour") n.setHours(n.getHours() + 1); else if (period === "day") n.setDate(n.getDate() + 1); else n.setMonth(n.getMonth() + 1);
          buckets.push({ t, e: n.getTime() });
          t = n.getTime();
        }
        const idxOf = (t) => { for (let i = buckets.length - 1; i >= 0; i--) if (t >= buckets[i].t) return i; return -1; };
        // per entity: Map(rowStart -> kWh) at data resolution
        const rowMap = (id, kind) => {
          const m = new Map();
          const f = unitFactor(this.hass.states[id]?.attributes?.unit_of_measurement);
          for (const x of r?.[id] || []) {
            const t = typeof x.start === "number" ? x.start : Date.parse(x.start);
            if (isNaN(t)) continue;
            const te = typeof x.end === "number" ? x.end : Date.parse(x.end);
            const dur = (isNaN(te) ? t + 3600000 : te) - t;
            const v = kind === "energy" ? (x.change ?? null) : x.mean != null ? (x.mean * f * dur) / 3600000 / 1000 : null;
            if (v != null) m.set(t, (m.get(t) || 0) + v);
          }
          return m;
        };
        const toBuckets = (m, fn = (v) => v) => {
          const out = buckets.map(() => null);
          for (const [t, v] of m) { const i = idxOf(t); if (i >= 0) out[i] = (out[i] || 0) + fn(v); }
          return out;
        };
        const devMaps = devs.map((d) => {
          const m = d.energy ? rowMap(d.energy, "energy") : rowMap(d.power, "power");
          for (const [t, v] of m) m.set(t, Math.max(0, v));
          return m;
        });
        const per = devs.map((d, k) => ({ d, vals: toBuckets(devMaps[k]) }));
        const srcMaps = (s2) => {
          if (!s2.entities.length) return { pos: new Map(), neg: new Map() };
          const pos = new Map(), neg = new Map();
          if (!s2.dual) {
            for (const [t, v0] of rowMap(s2.signed, "power")) { const v = v0 * s2.sign; pos.set(t, Math.max(0, v)); neg.set(t, Math.max(0, -v)); }
          } else {
            for (const [t, v] of rowMap(s2.pos, "power")) pos.set(t, Math.abs(v));
            for (const [t, v] of rowMap(s2.neg, "power")) neg.set(t, Math.abs(v));
          }
          return { pos, neg };
        };
        const solarM = c.solar_power ? rowMap(c.solar_power, "power") : new Map();
        const gM = srcMaps(gs), bM = srcMaps(bs);
        const times = [...new Set([...solarM.keys(), ...gM.pos.keys(), ...gM.neg.keys(), ...bM.pos.keys(), ...bM.neg.keys()])].sort((a, b) => a - b);
        const homeM = new Map();
        for (const t of times) {
          homeM.set(t, Math.max(0, Math.max(0, solarM.get(t) || 0) + (gM.pos.get(t) || 0) - (gM.neg.get(t) || 0) + (bM.pos.get(t) || 0) - (bM.neg.get(t) || 0)));
        }
        const solar = toBuckets(solarM, (v) => Math.max(0, v)).map((x) => x || 0);
        const grid = { pos: toBuckets(gM.pos).map((x) => x || 0), neg: toBuckets(gM.neg).map((x) => x || 0) };
        const batt = { pos: toBuckets(bM.pos).map((x) => x || 0), neg: toBuckets(bM.neg).map((x) => x || 0) };
        const home = toBuckets(homeM).map((x) => x || 0);
        // costs: grid import of each row x price at that time, shared out to the devices by
        // their share of the home consumption in that row (sum of devices + untracked = total)
        let costs = null;
        const prices = [...priceHist, ...((this._priceData && this._priceData().points) || [])]
          .filter((x) => x && !isNaN(x.t) && x.v != null && !isNaN(x.v)).sort((a, b) => a.t - b.t);
        if (prices.length && gM.pos.size) {
          const priceAt = (t) => {
            let lo = 0, hi = prices.length - 1, best = null;
            while (lo <= hi) { const m = (lo + hi) >> 1; if (prices[m].t <= t) { best = prices[m]; lo = m + 1; } else hi = m - 1; }
            return best ? best.v : null;
          };
          const rowLen = fetchPeriod === "hour" ? 3600000 : 86400000;
          const avgPrice = (t) => {
            if (fetchPeriod === "hour") return priceAt(t + rowLen / 2);
            let sum = 0, n = 0;
            for (let h = 0; h < 24; h++) { const p2 = priceAt(t + h * 3600000 + 1800000); if (p2 != null) { sum += p2; n++; } }
            return n ? sum / n : null;
          };
          const dev = devs.map(() => 0);
          let total = 0, tracked = 0;
          for (const [t, gin] of gM.pos) {
            const pr = avgPrice(t);
            if (pr == null || !gin) continue;
            const cost = gin * pr;
            total += cost;
            const h = homeM.get(t) || 0;
            const sumDev = devMaps.reduce((a, m) => a + (m.get(t) || 0), 0);
            const denom = Math.max(h, sumDev);
            if (denom <= 0) continue;
            devMaps.forEach((m, k) => { const share = (m.get(t) || 0) / denom; dev[k] += cost * share; tracked += cost * share; });
          }
          costs = { dev, total, untracked: Math.max(0, total - tracked) };
        }
        const res = { busy: false, fetched: Date.now(), loaded: true, period, buckets, per, home, solar, grid, batt, costs };
        this._dcache[key] = res;
        this._dlast = res;
        this.requestUpdate();
      })();
    }
    const cur = this._dcache[key];
    // while a new range is loading keep showing the previous result (dimmed)
    if (!cur.loaded && this._dlast) return { ...this._dlast, stale: true };
    return cur;
  }

  _devicesAltChart(c, spec, view) {
    const out = this._devicesAltChart2(c, spec, view);
    const d = this._devEnergy(spec);
    return d && d.stale ? html`<div class="stalewrap">${out}<div class="staleov"><ha-icon icon="mdi:loading" class="spin"></ha-icon></div></div>` : out;
  }

  _devicesAltChart2(c, spec, view) {
    const T = (k) => this._t(k);
    const lang = resolveLang(c.language, this.hass);
    const data = this._devEnergy(spec);
    const head = html`<div class="chdr"><span class="t">${T("devices_title")}${this._devViewSwitch()}</span>
      <span class="now"><ha-icon icon="mdi:calendar"></ha-icon><b>${spec.label || T("range_" + spec.id) || ""}</b></span></div>`;
    if (!data || !data.loaded) return html`${head}<div class="chart"><div class="plot"><div class="empty">${T("history_loading")}</div></div></div>`;
    const hidden = this._hidden?.devices || new Set();
    const toggle = (name) => {
      this._hidden = this._hidden || {};
      const set = new Set(this._hidden.devices || []);
      if (set.has(name)) set.delete(name); else set.add(name);
      this._hidden.devices = set;
      this.requestUpdate();
    };
    const GREY = "#6b7280";
    const items = data.per.map(({ d, vals }, k) => ({
      name: d.name || T("dev_" + d.type), color: this._devColors()[d.idx], icon: this._deviceIcon(d),
      vals, total: vals.reduce((a, v) => a + (v || 0), 0), cost: data.costs ? data.costs.dev[k] : null,
    }));
    const homeTotal = data.home.reduce((a, v) => a + v, 0);
    const trackedTotal = items.reduce((a, x) => a + x.total, 0);
    const untracked = { name: T("untracked"), color: GREY, icon: "mdi:help-circle-outline", vals: data.home.map((h, i) => Math.max(0, h - items.reduce((a, x) => a + (x.vals[i] || 0), 0))), total: Math.max(0, homeTotal - trackedTotal), cost: data.costs ? data.costs.untracked : null };
    const eur = (x) => (x == null ? "" : x.toFixed(2).replace(".", ",") + " €");
    const all = [...items, ...(c.solar_power || this._src("grid").entities.length ? [untracked] : [])];
    const vis = all.filter((x) => !hidden.has(x.name));
    const kwh = (x) => `${fmtKWh(x)} kWh`;
    const legend = (vals) => html`<div class="usage-legend">${all.map((x) => {
      const off = hidden.has(x.name);
      return html`<span class="usage-legend-item tog ${off ? "off" : ""}" @click=${() => toggle(x.name)}><i style="background:${x.color}"></i>${x.name} <b style="color:${x.color}">${vals ? kwh(vals(x)) : kwh(x.total)}</b></span>`;
    })}</div>`;

    if (view === "bars") {
      const n = data.buckets.length || 1;
      const sums = data.buckets.map((_, i) => vis.reduce((a, x) => a + (x.vals[i] || 0), 0));
      const maxV = Math.max(0.1, ...sums) * 1.08;
      const cur = this._cursor;
      const bi = cur == null ? null : Math.max(0, Math.min(n - 1, Math.floor(cur * n)));
      const fmtB = (t) => new Date(t).toLocaleString(lang, data.period === "hour" ? { hour: "2-digit", minute: "2-digit" } : data.period === "day" ? { weekday: "short", day: "numeric", month: "numeric" } : { month: "short", year: "numeric" });
      const labels = [];
      const every = Math.max(1, Math.ceil(n / 6));
      for (let i = 0; i < n; i += every) labels.push({ frac: (i + 0.5) / n, text: data.period === "hour" ? new Date(data.buckets[i].t).getHours() + ":00" : fmtB(data.buckets[i].t) });
      const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => (maxV * f).toFixed(maxV < 2 ? 2 : 1).replace(".", ","));
      return html`
        <div class="chdr"><span class="t">${T("devices_title")}${this._devViewSwitch()}</span>
          <span class="now ${bi != null ? "sel" : ""}"><ha-icon icon="mdi:clock-outline"></ha-icon><b>${bi != null ? fmtB(data.buckets[bi].t) : (spec.label || T("range_" + spec.id))}</b>${bi != null ? this._resetBtn(() => { this._cursor = null; this.requestUpdate(); }) : nothing}</span></div>
        ${legend(bi != null ? (x) => x.vals[bi] || 0 : null)}
        <div class="chart">
          <div class="yaxis">${yTicks.map((t) => html`<span>${t}</span>`)}</div>
          <div class="plot">
            <svg class="hist" viewBox="0 0 100 100" preserveAspectRatio="none">
              ${data.buckets.map((b, i) => {
                let y = 100;
                const w = 100 / n, x0 = i * w + w * 0.12, bw = w * 0.76;
                return svg`${vis.map((x) => {
                  const v = x.vals[i] || 0;
                  if (v <= 0) return nothing;
                  const h = (v / maxV) * 100;
                  y -= h;
                  const on = bi == null || bi === i;
                  return svg`<rect x="${x0}" y="${y}" width="${bw}" height="${h}" fill="${x.color}" fill-opacity="${on ? 0.45 : 0.15}"
                    stroke="${x.color}" stroke-opacity="${on ? 1 : 0.4}" stroke-width="1" vector-effect="non-scaling-stroke"></rect>`;
                })}`;
              })}
            </svg>
            ${bi != null ? html`<div class="cursor" style="left:${((bi + 0.5) / n) * 100}%"></div>` : nothing}
          </div>
          <div class="xaxis">${labels.map((l) => html`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}</div>
        </div>
        ${this._scrubber(cur == null ? 1 : cur, (f) => { this._cursor = f >= 0.999 ? null : f; this.requestUpdate(); })}`;
    }

    const sorted = [...vis].sort((a, b) => b.total - a.total);
    const total = sorted.reduce((a, x) => a + x.total, 0);

    if (view === "rank") {
      const maxV = Math.max(0.001, ...sorted.map((x) => x.total));
      return html`${head}${legend(null)}
        <div class="rank">${sorted.map((x) => html`
          <div class="rrow" @click=${() => toggle(x.name)}>
            <span class="rname"><span class="rico" style="color:${x.color}">${renderIcon(x.icon)}</span>${x.name}</span>
            <span class="rbarw"><span class="rbar" style="width:${(x.total / maxV) * 100}%;--c:${x.color}"></span></span>
            <span class="rval">${kwh(x.total)}${x.cost != null ? html`<em class="rcost">${eur(x.cost)}</em>` : nothing}<small>${total ? Math.round((x.total / total) * 100) : 0} %</small></span>
          </div>`)}</div>`;
    }

    if (view === "donut") {
      const R = 38, r0 = 26;
      let a0 = -Math.PI / 2;
      const arc = (a1, a2) => {
        const p = (rad, a) => `${(50 + rad * Math.cos(a)).toFixed(2)},${(50 + rad * Math.sin(a)).toFixed(2)}`;
        const large = a2 - a1 > Math.PI ? 1 : 0;
        return `M${p(R, a1)} A${R},${R} 0 ${large} 1 ${p(R, a2)} L${p(r0, a2)} A${r0},${r0} 0 ${large} 0 ${p(r0, a1)} Z`;
      };
      return html`${head}
        <div class="donutwrap">
          <svg class="donut" viewBox="0 0 100 100">
            ${total > 0 ? sorted.map((x) => {
              const a = (x.total / total) * Math.PI * 2;
              if (a <= 0) return nothing;
              const a1 = a0, a2 = a0 + Math.min(a, Math.PI * 2 - 0.0001);
              a0 += a;
              return svg`<path d="${arc(a1 + 0.01, a2 - 0.01)}" fill="${x.color}" fill-opacity=".5" stroke="${x.color}" stroke-width=".6" @click=${() => toggle(x.name)}><title>${x.name}: ${kwh(x.total)}</title></path>`;
            }) : nothing}
            <text x="50" y="47" text-anchor="middle" class="dt1">${T("total")}</text>
            <text x="50" y="58" text-anchor="middle" class="dt2">${kwh(total)}</text>
          </svg>
          <div class="dlist">${all.map((x) => {
            const off = hidden.has(x.name);
            return html`<span class="usage-legend-item tog ${off ? "off" : ""}" @click=${() => toggle(x.name)}><i style="background:${x.color}"></i>${x.name} <b style="color:${x.color}">${kwh(x.total)}</b>${x.cost != null ? html`<em class="rcost">${eur(x.cost)}</em>` : nothing}</span>`;
          })}</div>
        </div>`;
    }

    // energy flow (sankey): sources -> house -> devices
    const sum = (a) => a.reduce((x, v) => x + v, 0);
    const gridIn = sum(data.grid.pos), battOut = sum(data.batt.pos);
    const pvDirect = Math.max(0, homeTotal - gridIn - battOut);
    const srcs = [
      { name: T("grid"), color: c.color_grid, v: Math.min(gridIn, homeTotal) },
      { name: T("solar"), color: c.color_solar, v: pvDirect },
      { name: T("battery"), color: c.color_battery, v: Math.min(battOut, homeTotal) },
    ].filter((x) => x.v > 0.005);
    const outs = sorted.filter((x) => x.total > 0.005);
    const H = 100 + Math.max(0, outs.length - 6) * 12, Wd = 300, gap = 3, nodeW = 6, TOP = 12;
    const scale = (list, tot) => {
      const avail = H - gap * Math.max(0, list.length - 1);
      return list.map((x) => Math.max(1.5, (x.v / (tot || 1)) * avail));
    };
    const srcTot = sum(srcs.map((x) => x.v)) || 1;
    const outV = outs.map((x) => ({ ...x, v: x.total }));
    const outTot = sum(outV.map((x) => x.v)) || 1;
    const sh = scale(srcs, srcTot), oh = scale(outV, outTot);
    const colX = [2, 128, 198];
    const houseH = H;
    const band = (x1, y1a, y1b, x2, y2a, y2b, color) => {
      const mx = (x1 + x2) / 2;
      return svg`<path d="M${x1},${y1a} C${mx},${y1a} ${mx},${y2a} ${x2},${y2a} L${x2},${y2b} C${mx},${y2b} ${mx},${y1b} ${x1},${y1b} Z" fill="${color}" fill-opacity=".28"></path>`;
    };
    let ys = TOP, yh = TOP, yo = TOP, yh2 = TOP;
    const srcNodes = srcs.map((x, i) => { const y = ys; ys += sh[i] + gap; const hIn = (x.v / srcTot) * houseH; const yHouse = yh; yh += hIn; return { ...x, y, h: sh[i], yHouse, hIn }; });
    const outNodes = outV.map((x, i) => { const y = yo; yo += oh[i] + gap; const hOut = (x.v / outTot) * houseH; const yHouse = yh2; yh2 += hOut; return { ...x, y, h: oh[i], yHouse, hOut }; });
    return html`${head}
      <div class="sankeywrap">
        <svg class="sankey" viewBox="0 0 ${Wd} ${H + TOP + 2}" preserveAspectRatio="xMidYMid meet">
          ${srcNodes.map((n) => band(colX[0] + nodeW, n.y, n.y + n.h, colX[1], n.yHouse, n.yHouse + n.hIn, n.color))}
          ${outNodes.map((n) => band(colX[1] + nodeW, n.yHouse, n.yHouse + n.hOut, colX[2], n.y, n.y + n.h, n.color))}
          ${srcNodes.map((n) => svg`<rect x="${colX[0]}" y="${n.y}" width="${nodeW}" height="${n.h}" fill="${n.color}" rx="1"></rect>
            <text x="${colX[0] + nodeW + 3}" y="${n.y + n.h / 2}" class="sk">${n.name} · ${fmtKWh(n.v)}</text>`)}
          <rect x="${colX[1]}" y="${TOP}" width="${nodeW}" height="${houseH}" fill="${c.color_home}" rx="1"></rect>
          <text x="${colX[1] + nodeW / 2}" y="5" text-anchor="middle" class="sk b">${T("home")} · ${fmtKWh(homeTotal)} kWh</text>
          ${outNodes.map((n) => svg`<rect x="${colX[2]}" y="${n.y}" width="${nodeW}" height="${n.h}" fill="${n.color}" rx="1"></rect>
            <text x="${colX[2] + nodeW + 3}" y="${n.y + n.h / 2}" class="sk">${n.name} · ${fmtKWh(n.v)}</text>`)}
        </svg>
      </div>`;
  }

  // Slider under a chart to pick an exact point in time.
  _scrubber(frac, onInput) {
    return html`
      <div class="scrub">
        <input type="range" min="0" max="1000" step="1" .value=${String(Math.round(frac * 1000))}
          @input=${(e) => onInput(parseInt(e.target.value, 10) / 1000)} />
      </div>`;
  }

  _resetBtn(onReset) {
    return html`<button class="scrub-now" title=${this._t("back_to_now")} @click=${onReset}>✕</button>`;
  }

  _priceChart(c) {
    if (c.price_use_tibber_service) this._ensureTibberPrices();
    const { points: allPoints, current } = this._priceData();
    const now = Date.now();
    const hours = this._priceHours ?? Math.max(8, Math.min(48, c.price_hours || 24));

    // Fixed axis: from start of current hour to +hours.
    const axisStart = new Date();
    if (c.price_start === "midnight") {
      axisStart.setHours(0, 0, 0, 0); // today 00:00
    } else {
      axisStart.setMinutes(0, 0, 0);  // start of current hour
      const lookback = Math.max(1, Math.min(12, c.price_lookback_hours ?? 2));
      axisStart.setTime(axisStart.getTime() - lookback * 3600000);
    }
    const startMs = axisStart.getTime();
    const endMs = startMs + hours * 3600000;

    // Slot length: the SMALLEST gap between any two consecutive points, not just the
    // first one. Some providers (e.g. Frank Energie) mix hourly slots for "today" with
    // 15-minute slots for "tomorrow" in the same array — picking only the first gap
    // would misjudge the whole 48h axis as hourly and silently drop 3 out of 4
    // quarter-hour values. Gaps under a minute are ignored as noise/duplicates.
    let stepMs = 3600000;
    if (allPoints.length > 1) {
      let minGap = Infinity;
      for (let i = 1; i < allPoints.length; i++) {
        const gap = allPoints[i].t - allPoints[i - 1].t;
        if (gap >= 60000 && gap < minGap) minGap = gap;
      }
      if (minGap !== Infinity) stepMs = minGap;
    }
    const slotCount = Math.max(1, Math.round((endMs - startMs) / stepMs));

    // Build fixed slots; fill with data where available. A coarser point (e.g. an
    // hourly price) forward-fills every finer bucket within its own span, not just its
    // exact starting instant, so it still covers all its quarter-hours correctly.
    const byTime = new Map();
    for (let i = 0; i < allPoints.length; i++) {
      const p = allPoints[i];
      const next = allPoints[i + 1];
      const spanEnd = next ? next.t : p.t + stepMs;
      for (let t = p.t; t < spanEnd; t += stepMs) {
        byTime.set(Math.floor(t / stepMs) * stepMs, p.v);
      }
    }
    const slots = [];
    for (let i = 0; i < slotCount; i++) {
      const t = startMs + i * stepMs;
      const key = Math.floor(t / stepMs) * stepMs;
      const v = byTime.has(key) ? byTime.get(key) : null;
      slots.push({ t, v, past: (t + stepMs) <= now, cur: t <= now && (t + stepMs) > now });
    }

    const withData = slots.filter((s) => s.v !== null);
    const showMinMax = !!c.price_show_minmax;
    const sc = priceScale(withData.map((s) => s.v), c.price_axis_auto !== false, showMinMax);
    // Daily highest / lowest price within the visible window (only for days with enough data).
    const minMax = [];
    if (showMinMax) {
      const byDay = new Map();
      slots.forEach((s, i) => {
        if (s.v === null) return;
        const k = new Date(s.t).toDateString();
        if (!byDay.has(k)) byDay.set(k, []);
        byDay.get(k).push(i);
      });
      for (const idxs of byDay.values()) {
        if (idxs.length < 4) continue;
        let lo = idxs[0], hi = idxs[0];
        for (const i of idxs) { if (slots[i].v < slots[lo].v) lo = i; if (slots[i].v > slots[hi].v) hi = i; }
        minMax.push({ i: hi, kind: "max" }, { i: lo, kind: "min" });
      }
    }

    const nowFrac = Math.max(0, Math.min(1, (now - startMs) / (endMs - startMs)));

    // Hour labels: choose interval by width (more hours -> sparser labels)
    const labelEvery = hours <= 12 ? 2 : hours <= 24 ? 3 : 6;
    const labels = [];
    for (let h = 0; h <= hours; h += labelEvery) {
      const d = new Date(startMs + h * 3600000);
      labels.push({ frac: h / hours, text: d.getHours() + ":00" });
    }

    const yTicks = sc.ticks.map((v) => v.toFixed(sc.dec).replace(".", ","));

    const sel = this._selectedSlot;
    const profile = this._activeProfile();
    const stops = this._config.price_profile !== "default" ? (profile.price_stops || c.price_stops) : c.price_stops;

    // Optional second x-axis row counting hours from now ("nu", 1, 2, 3…), off by default.
    const showRel = !!c.price_relative_hours;
    const relLabels = [];
    if (showRel) {
      const maxH = Math.max(0, Math.floor((endMs - now) / 3600000));
      let h = 0;
      while (h <= maxH) {
        const frac = (now + h * 3600000 - startMs) / (endMs - startMs);
        if (frac >= 0 && frac <= 1) {
          relLabels.push({ frac, text: h === 0 ? this._t("now").toLowerCase() : String(h) });
        }
        h += h < 10 ? 1 : h < 16 ? 2 : 3;
      }
    }

    // Optional thin marker(s) where the axis crosses local midnight, off by default. Only
    // the first one (a wide enough window can cross two midnights) says "tomorrow" — later
    // ones get the actual weekday name instead of repeating "tomorrow" incorrectly.
    const dayMarkers = [];
    if (c.price_show_day_marker) {
      const lang = resolveLang(c.language, this.hass);
      let d = new Date(startMs);
      d.setHours(24, 0, 0, 0); // next local midnight strictly after axis start
      let dayIndex = 0;
      while (d.getTime() < endMs) {
        const frac = (d.getTime() - startMs) / (endMs - startMs);
        if (frac > 0.01 && frac < 0.99) {
          const text = dayIndex === 0 ? this._t("tomorrow") : d.toLocaleDateString(lang, { weekday: "short" });
          dayMarkers.push({ frac, text });
          dayIndex++;
        }
        d = new Date(d.getTime());
        d.setDate(d.getDate() + 1);
      }
    }

    const gasPrice = num(this.hass, c.gas_price_entity);

    // Costs of today's (and for windows over 24 h also yesterday's) grid import.
    let costChips = nothing;
    const P = this._period();
    if (P && c.price_show_costs !== false && this._src("grid").entities.length) {
      this._ensurePeriod(P);
      const r = this._periodCost(P, allPoints);
      if (r) costChips = html`<span class="now cost"><ha-icon icon="mdi:cash"></ha-icon>${P.label}: <b>${r.eur != null ? r.eur.toFixed(2).replace(".", ",") + " €" : "–"}</b><small>${fmtKWh(r.kwh)} kWh</small></span>`;
    } else if (c.price_show_costs !== false && this._src("grid").entities.length) {
      this._ensureCostData();
      const today = startOfToday();
      const days = hours > 24 ? [today - 86400000, today] : [today];
      const fmtEur = (x) => x.toFixed(2).replace(".", ",") + " €";
      const chips = days.map((d) => {
        const r = this._costFor(d, allPoints);
        if (!r) return nothing;
        const lbl = d === today ? this._t("today") : this._t("yesterday");
        return html`<span class="now cost" title="${lbl}: ${fmtKWh(r.kwh)} kWh ${this._t("grid_import")}"><ha-icon icon="mdi:cash"></ha-icon>${lbl}: <b>${r.eur != null ? fmtEur(r.eur) : "–"}</b><small>${fmtKWh(r.kwh)} kWh</small></span>`;
      });
      costChips = chips;
    }

    return html`
      <div class="chdr">
        <span class="t">${this._t("price_title")} (${hours}h)</span>
        <div class="chdr-right">
          ${sel
            ? html`<span class="now sel"><ha-icon icon="mdi:flash"></ha-icon>${new Date(sel.t).toLocaleString(resolveLang(c.language, this.hass), { weekday: "short", hour: "2-digit", minute: "2-digit" })}: <b>${sel.v.toFixed(3).replace(".", ",")}</b>${this._tapLock ? this._resetBtn(() => { this._selectedSlot = null; this._tapLock = false; this.requestUpdate(); }) : nothing}</span>`
            : current !== null
              ? html`<span class="now"><ha-icon icon="mdi:flash"></ha-icon>${this._t("now")}: <b>${current.toFixed(3).replace(".", ",")}</b></span>`
              : nothing}
          ${costChips}
          ${gasPrice !== null ? html`<span class="now gas"><ha-icon icon="mdi:fire"></ha-icon><b>${gasPrice.toFixed(3).replace(".", ",")}</b></span>` : nothing}
        </div>
      </div>
      <div class="chart ${showRel ? "has-rel" : ""}">
        <div class="yaxis">${yTicks.map((t) => html`<span>${t}</span>`)}</div>
        <div class="plot">
          ${profile.chart_style === "bars"
            ? this._priceBarsBody(slots, sc, stops, sel, profile)
            : this._priceLineBody(slots, sc, profile, sel)}
          ${sc.lo < 0 && sc.hi > 0 ? html`<div class="zeroline" style="bottom:${sc.fr(0) * 100}%"></div>` : nothing}
          ${dayMarkers.map((d) => html`<div class="daymarker" data-label="${d.text}" style="left:${d.frac * 100}%"></div>`)}
          ${minMax.map((m) => {
            const sl = slots[m.i];
            const x = profile.chart_style === "bars" ? ((m.i + 0.5) / slots.length) * 100 : (m.i / Math.max(1, slots.length - 1)) * 100;
            const y = Math.max(0, Math.min(100, sc.fr(sl.v) * 100));
            return html`<div class="pmark ${m.kind}" style="left:${x}%;bottom:${y}%"><span>${m.kind === "max" ? "▲" : "▼"} ${sl.v.toFixed(2).replace(".", ",")}</span></div>`;
          })}
          <div class="nowline" data-now="${this._t("now")}" style="left:${nowFrac * 100}%"></div>
          ${sel && this._tapLock ? (() => {
            const i = slots.findIndex((x) => x.t === sel.t);
            if (i < 0) return nothing;
            const x = profile.chart_style === "bars" ? ((i + 0.5) / slots.length) * 100 : (i / Math.max(1, slots.length - 1)) * 100;
            return html`<div class="cursor" style="left:${x}%"></div>`;
          })() : nothing}
        </div>
        <div class="xaxis ${showRel ? "abs" : ""}">
          ${labels.map((l) => html`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}
        </div>
        ${showRel ? html`
          <div class="xaxis rel">
            ${relLabels.map((l) => html`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}
          </div>` : nothing}
      </div>
      ${this._scrubber(
        sel ? (slots.findIndex((s) => s.t === sel.t) + 0.5) / slots.length : nowFrac,
        (f) => {
          const i = Math.max(0, Math.min(slots.length - 1, Math.floor(f * slots.length)));
          const s = slots[i];
          if (s && s.v !== null) { this._selectedSlot = s; this._tapLock = true; this.requestUpdate(); }
        },
      )}
    `;
  }

  _priceBarsBody(slots, sc, stops, sel, profile) {
    const GREY = "#6b7280";
    const radiusStyle = profile?.bar_radius ? `;border-radius:${profile.bar_radius}` : "";
    // Bars grow from the zero line (or from the bottom when the axis doesn't reach 0),
    // so negative prices point downwards.
    const base = Math.max(sc.lo, Math.min(sc.hi, 0));
    const geo = (v) => {
      const a = sc.fr(Math.max(v, base)), b = sc.fr(Math.min(v, base));
      return `bottom:${(b * 100).toFixed(2)}%;height:${Math.max(1.5, (a - b) * 100).toFixed(2)}%`;
    };
    return html`
      <div class="bars">
        ${slots.map((s) => {
          if (s.v === null) {
            if (profile?.grey_unknown_value != null) {
              const uv = Math.max(sc.lo, Math.min(sc.hi, profile.grey_unknown_value));
              return html`<div class="bcol"><div class="bar unknown" style="${geo(uv)};background:${GREY}${radiusStyle}"></div></div>`;
            }
            return html`<div class="bcol"><div class="bar empty-slot"></div></div>`;
          }
          let col;
          if (profile?.highlight_now) {
            // Not price-based: a flat bar color, except the bar for the current hour.
            col = s.cur ? (profile.bar_color_now || profile.bar_color || GREY) : (profile.bar_color || GREY);
          } else if (profile?.grey_past && s.past) {
            col = GREY;
          } else {
            col = colorForValue(s.v, stops);
          }
          const isSel = sel && sel.t === s.t;
          const timeTxt = new Date(s.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return html`<div class="bcol"><div
            class="bar ${isSel ? "sel" : ""} ${s.v < 0 ? "neg" : ""}"
            style="${geo(s.v)};background:${col}${radiusStyle}"
            title="${timeTxt} — ${s.v.toFixed(3).replace(".", ",")} €/kWh"
            @mouseenter=${() => this._hoverSlot(s)}
            @mouseleave=${() => this._hoverSlot(null)}
            @click=${() => this._tapSlot(s)}
          ></div></div>`;
        })}
      </div>
    `;
  }

  // Smooth-line layout profiles ("line" / "line-threshold"): only the leading
  // contiguous run of known values is drawn as a curve; a trailing gap (e.g.
  // tomorrow's prices not published yet) keeps the familiar hatched placeholder.
  _priceLineBody(slots, sc, profile, sel) {
    let runEnd = 0;
    while (runEnd < slots.length && slots[runEnd].v !== null) runEnd++;
    const run = slots.slice(0, runEnd);

    const n = Math.max(1, slots.length - 1);
    const pts = run.map((s, i) => ({
      x: (i / n) * 100,
      y: 100 - Math.max(0, Math.min(100, sc.fr(s.v) * 100)),
    }));

    const pathD = pts.length ? catmullRomToBezierPath(pts) : "";
    const yBase = (100 - sc.fr(Math.max(sc.lo, Math.min(sc.hi, 0))) * 100).toFixed(2);
    const areaD = pathD && pts.length > 1
      ? `${pathD} L${pts[pts.length - 1].x.toFixed(2)},${yBase} L${pts[0].x.toFixed(2)},${yBase} Z`
      : "";

    let stroke = profile.line_color || "#7dd3fc";
    let fill = "none";
    let defs = nothing;

    if (profile.chart_style === "line-threshold" && run.length) {
      const avg = run.reduce((a, s) => a + s.v, 0) / run.length;
      const avgFrac = Math.max(0, Math.min(1, 1 - sc.fr(avg)));
      // Soft band around the average instead of a hard cut, for a smooth orange->teal blend.
      const band = 0.14;
      const topOff = Math.max(0, avgFrac - band / 2);
      const botOff = Math.min(1, avgFrac + band / 2);
      const gradId = `efp-grad-${this._uid}`;
      defs = svg`<defs>
        <linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
          <stop offset="0" stop-color="${profile.color_above}"></stop>
          <stop offset="${topOff.toFixed(4)}" stop-color="${profile.color_above}"></stop>
          <stop offset="${botOff.toFixed(4)}" stop-color="${profile.color_below}"></stop>
          <stop offset="1" stop-color="${profile.color_below}"></stop>
        </linearGradient>
      </defs>`;
      stroke = `url(#${gradId})`;
      fill = `url(#${gradId})`;
    }

    return html`
      <svg class="priceline" viewBox="0 0 100 100" preserveAspectRatio="none">
        ${defs}
        ${areaD && fill !== "none" ? svg`<path d="${areaD}" fill="${fill}" fill-opacity="0.32" stroke="none"></path>` : nothing}
        ${pathD ? svg`<path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"></path>` : nothing}
      </svg>
      <div class="hits">
        ${slots.map((s) => {
          if (s.v === null) return html`<div class="hit empty-slot"></div>`;
          const isSel = sel && sel.t === s.t;
          const timeTxt = new Date(s.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return html`<div
            class="hit ${isSel ? "sel" : ""}"
            title="${timeTxt} — ${s.v.toFixed(3).replace(".", ",")} €/kWh"
            @mouseenter=${() => this._hoverSlot(s)}
            @mouseleave=${() => this._hoverSlot(null)}
            @click=${() => this._tapSlot(s)}
          ></div>`;
        })}
      </div>
    `;
  }

  _hoverSlot(s) {
    if (this._tapLock) return; // don't override a tapped selection with hover-out
    this._selectedSlot = s;
    this.requestUpdate();
  }

  _tapSlot(s) {
    if (this._selectedSlot && this._selectedSlot.t === s.t && this._tapLock) {
      this._selectedSlot = null;
      this._tapLock = false;
    } else {
      this._selectedSlot = s;
      this._tapLock = true;
    }
    this.requestUpdate();
  }

  static get styles() {
    return css`
      ha-card { padding: 12px; }
      .stack { display: flex; flex-direction: column; gap: 12px; }
      .flowwrap { position: relative; }
      .flowwrap.past .val, .flowwrap.past .sub { display: none; }
      .plabel { position: absolute; top: -2px; left: 50%; transform: translateX(-50%); z-index: 4; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
        color: var(--primary-color); background: var(--card-background-color, #1c1c1c); border: 1px solid var(--primary-color); border-radius: 999px; padding: 1px 8px; white-space: nowrap; }
      .plabel ha-icon { --mdc-icon-size: 13px; }
      .rng.period { display: inline-flex; align-items: center; gap: 4px; }
      .rng.period ha-icon { --mdc-icon-size: 13px; }
      .datebar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      .datebar select, .datebar .ddate { padding: 4px 6px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font-size: 12px; }
      .dnav { cursor: pointer; border: 1px solid var(--divider-color); background: transparent; color: var(--primary-text-color); border-radius: 8px; width: 28px; height: 28px; font-size: 16px; line-height: 1; }
      .dnav[disabled] { opacity: .35; cursor: default; }
      .dlabel { position: relative; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 4px 10px; border-radius: 8px; border: 1px solid var(--divider-color); cursor: pointer; flex: 1; justify-content: center; min-width: 120px; }
      .dlabel ha-icon { --mdc-icon-size: 16px; color: var(--primary-color); }
      .dhidden { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; border: 0; padding: 0; }
      .dsep { color: var(--secondary-text-color); }
      .dtoday { cursor: pointer; border: 1px solid var(--primary-color); background: transparent; color: var(--primary-color); border-radius: 8px; padding: 4px 10px; font-size: 12px; }
      .flow { position: relative; height: 190px; }
      .flow.tall { height: 236px; }
      .node.tl, .node.tr { align-items: flex-start; }
      .node.bl, .node.br { align-items: flex-end; }
      .devrow { position: relative; z-index: 2; display: grid; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)); gap: 22px 6px; margin-top: 22px; }
      .devitem { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1px; cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; touch-action: manipulation; min-width: 0; }
      .devitem.idle { opacity: .55; }
      .devtoggle { position: relative; z-index: 2; display: flex; align-items: center; gap: 4px; margin: 8px auto 0; cursor: pointer; border: 1px solid var(--divider-color);
        background: transparent; color: var(--secondary-text-color); border-radius: 999px; padding: 2px 12px 2px 8px; font-size: 11.5px; }
      .devtoggle ha-icon { --mdc-icon-size: 16px; }
      .devtoggle:hover { color: var(--primary-text-color); border-color: var(--primary-color); }
      .ratios { position: relative; z-index: 2; display: flex; justify-content: center; gap: 28px; margin-top: 14px; flex-wrap: wrap; }
      .ratio { display: flex; align-items: center; gap: 8px; }
      .rring { position: relative; width: 40px; height: 40px; }
      .rring svg { position: absolute; inset: 0; }
      .rring ha-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; --mdc-icon-size: 17px; }
      .rtxt { display: flex; flex-direction: column; line-height: 1.15; }
      .rv { font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; }
      .rl { font-size: 10.5px; color: var(--secondary-text-color); }
      .devitem .ic { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; border: 1.5px solid transparent; margin-bottom: 3px; }
      .devitem .ic ha-icon { --mdc-icon-size: 21px; }
      .devitem .socwrap.sm { width: 38px; height: 38px; margin-bottom: 3px; }
      .devitem .socwrap.sm .ic { width: 38px; height: 38px; margin: 0; }
      .devitem .lbl { font-size: 10.5px; color: var(--secondary-text-color); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .devitem .val { font-size: 14px; font-weight: 700; line-height: 1.1; }
      .devitem .sub { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; opacity: .85; }
      .housepic { position: absolute; top: 50%; left: 50%; height: 100%; width: auto; max-width: none; transform: translate(-50%, -50%); pointer-events: none; z-index: 0; }
      .pmark { position: absolute; transform: translate(-50%, 0); pointer-events: none; z-index: 2; display: flex; flex-direction: column; align-items: center; }
      .pmark span { font-size: 9px; font-weight: 700; padding: 0 4px; border-radius: 4px; margin-bottom: 3px; white-space: nowrap; color: #fff; line-height: 14px; }
      .pmark::after { content: ""; width: 7px; height: 7px; border-radius: 50%; margin-bottom: -3.5px; box-shadow: 0 0 0 2px var(--card-background-color, #1c1c1c); }
      .pmark.max span, .pmark.max::after { background: #ef4444; }
      .pmark.min span, .pmark.min::after { background: #16a34a; }
      .wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
      .wire { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 2.5; }
      .live { stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: 1; transition: opacity 1s ease; }
      .live.dashed { stroke-dasharray: 5 9; animation-name: flow; animation-duration: 1s; animation-timing-function: linear; animation-iteration-count: infinite; }
      .live.dashed.still { stroke-dashoffset: 0; }
      .live.neon.glow { stroke-width: 8; stroke-opacity: .28; stroke-linecap: round; }
      .live { will-change: stroke-dashoffset; }
      .live.neon { stroke-width: 3; stroke-dasharray: 90 500; animation-name: neonsweep; animation-duration: 1s; animation-timing-function: linear; animation-iteration-count: infinite; }
      .live.neon.still { stroke-dashoffset: 0; }
      @keyframes neonsweep { to { stroke-dashoffset: -590; } }
      .live.fade-in { opacity: 1; }
      .live.fade-out { opacity: 0; }
      .live.dir-swap { transition: opacity .3s ease; }
      @keyframes flow { to { stroke-dashoffset: -14; } }
      .node { position: absolute; display: flex; align-items: center; gap: 8px; z-index: 2; }
      .node.tl { left: 6px; top: 8px; }
      .node.tr { right: 6px; top: 8px; flex-direction: row-reverse; text-align: right; }
      .node { cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
      .node .ic, .node .socwrap { transition: transform .15s ease; }
      .node:active .ic, .node:active .socwrap { transform: scale(.94); }
      .day { display: inline-flex; align-items: center; gap: 3px; font-size: 12.5px; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums; margin-top: 2px; line-height: 1.15; }
      .day .dic { position: relative; display: inline-flex; width: 18px; height: 18px; align-items: center; justify-content: center; }
      .day .dic ha-icon, .day .dic .efp-icon { --mdc-icon-size: 17px; }
      .ic .efp-icon { width: 25px; height: 25px; }
      .devitem .ic .efp-icon { width: 23px; height: 23px; }
      .efp-icon { width: var(--mdc-icon-size, 24px); height: var(--mdc-icon-size, 24px); display: block; flex: 0 0 auto; }
      .day .dic ha-icon.badge { position: absolute; right: -5px; bottom: -4px; --mdc-icon-size: 11px; background: var(--card-background-color, #1c1c1c); border-radius: 50%; }
      .day.in { color: var(--efp-day-in); }
      .day.out { color: var(--efp-day-out); }
      .day.home { color: var(--efp-day-home); }
      .day.cost { color: var(--success-color, #34d399); }
      .day.fc { color: var(--secondary-text-color); font-weight: 500; }
      .usage-legend-item i.dash { width: 12px; height: 0; border-radius: 0; border-top: 2px dashed; background: none; }
      .node.bl { left: 6px; bottom: 8px; }
      .node.muted { opacity: .55; }
      .node.muted .val, .node.muted .sub { opacity: .8; }
      .node.br { right: 6px; bottom: 8px; flex-direction: row-reverse; text-align: right; }
      .node.br .txt { align-items: flex-end; }
      .node .ic, .node-car .ic { width: 44px; height: 44px; border-radius: 12px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; border: 1.5px solid transparent; }
      .node .ic ha-icon, .node-car .ic ha-icon { --mdc-icon-size: 24px; }
      .txt { display: flex; flex-direction: column; gap: 1px; }
      .node.tr .txt { align-items: flex-end; }
      .txt .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .txt .val { font-size: 15px; font-weight: 700; line-height: 1.1; }
      .txt .sub { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; opacity: .85; }
      .socwrap { position: relative; width: 44px; height: 44px; flex: 0 0 auto; }
      .socwrap .ic { position: absolute; inset: 0; }
      .socwrap .ic.round { border: none; background: none; border-radius: 50%; }
      .socring { position: absolute; inset: 0; }

      /* car node bottom-right: mirror of accu (icon in corner, text left) */
      .cartxt { display: flex; flex-direction: column; gap: 1px; align-items: flex-end; }
      .carinfos { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
      .caranim.run { animation: carfade .45s ease; }
      @keyframes carfade { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: translateX(0); } }
      .cardots { display: flex; gap: 4px; margin-top: 3px; justify-content: flex-end; }
      .cardots .dot { width: 6px; height: 6px; border-radius: 50%; transition: background .3s; }

      .huis { cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }

      .anc-home { width: 1px; height: 1px; }
      .huis { position: absolute; left: 50%; top: 54.7%; transform: translate(-50%, -29px); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
      .huis.huis-visual { left: 50%; top: 50%; align-items: flex-end; text-align: right; transform: translate(calc(-100% - 110px), -50%); }
      .huis.huis-visual .lbl, .huis.huis-visual .val { text-shadow: 0 1px 3px rgba(0,0,0,.8), 0 0 6px rgba(0,0,0,.6); }
      .huis.huis-visual.no-fx .lbl, .huis.huis-visual.no-fx .val { text-shadow: none; }

      .huis-wire { position: absolute; top: 50%; left: calc(50% - 110px); width: 15px; height: 2px; background: rgba(255,255,255,.12); transform: translateY(-50%); pointer-events: none; z-index: 0; }
      .huis .ic { width: 58px; height: 58px; border-radius: 16px; border: 1.5px solid transparent; display: flex; align-items: center; justify-content: center; }
      .huis .ic ha-icon { --mdc-icon-size: 30px; }
      .huis .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .huis .val { font-size: 16px; font-weight: 700; }

      .chdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
      .chdr .t { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }
      .chdr-right { display: flex; align-items: baseline; gap: 4px 12px; flex-wrap: wrap; justify-content: flex-end; }
      .chdr .now { display: inline-flex; align-items: center; gap: 4px; }
      .chdr .now ha-icon { --mdc-icon-size: 13px; color: var(--info-color, #7dd3fc); }
      .chdr .now.cost ha-icon { color: var(--success-color, #34d399); }
      .chdr .now.cost b { color: var(--success-color, #34d399); }
      .chdr .now.cost small { margin-left: 4px; opacity: .75; font-size: 10.5px; }
      .chdr .now.gas ha-icon { color: var(--warning-color, #f5a623); }
      .chdr .now.gas b { color: var(--warning-color, #f5a623); }
      .tabs { display: flex; gap: 6px; margin-bottom: 8px; overflow-x: auto; scrollbar-width: none; }
      .tabs::-webkit-scrollbar { display: none; }
      .tab { flex: 0 0 auto; }
      .ranges { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
      .rng { cursor: pointer; border: 1px solid transparent; background: rgba(127,127,127,.12); color: var(--secondary-text-color); border-radius: 6px; padding: 1px 8px; font-size: 11px; }
      .rng.on { border-color: var(--primary-color); color: var(--primary-color); background: transparent; }
      .scrub { margin-top: -8px; padding-left: 34px; }
      .scrub input[type="range"] { display: block; width: calc(100% + 14px); margin: 0 -7px; accent-color: var(--primary-color); height: 22px; cursor: pointer; }
      .scrub-now { cursor: pointer; border: none; background: rgba(127,127,127,.18); color: var(--primary-text-color); border-radius: 50%; width: 18px; height: 18px; padding: 0; font-size: 10px; line-height: 18px; margin-left: 6px; }
      .cursor { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1.5px; background: #fff; border-radius: 2px; pointer-events: none; z-index: 3;
        box-shadow: 0 0 4px rgba(255,255,255,.95), 0 0 10px rgba(255,255,255,.6), 0 0 0 1px rgba(0,0,0,.35); }
      .cdot { z-index: 4; }
      .cdot { position: absolute; width: 10px; height: 10px; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 0 2px var(--card-background-color, #1c1c1c); pointer-events: none; }
      .empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--secondary-text-color); }
      .chdr .now.sel b { color: var(--primary-color); }
      .tab { cursor: pointer; border: 1px solid var(--divider-color); background: transparent; color: var(--secondary-text-color); border-radius: 999px; padding: 3px 12px; font-size: 12px; transition: all .2s; }
      .tab.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
      .chartbody.run { animation: chartfade .4s ease; }
      @keyframes chartfade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .hist { position: absolute; inset: 0; width: 100%; height: 100%; }
      .chdr .now { font-size: 12px; color: var(--secondary-text-color); }
      .chdr .now b { color: var(--info-color, #7dd3fc); font-weight: 700; }
      .chart { position: relative; height: 168px; padding-left: 34px; }
      .chart.has-rel { height: 182px; }
      .yaxis { position: absolute; left: 0; top: 0; bottom: 34px; width: 30px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; color: var(--secondary-text-color); text-align: right; }
      .chart.has-rel .yaxis { bottom: 48px; }
      .plot { position: absolute; left: 34px; right: 0; top: 0; bottom: 34px; }
      .chart.has-rel .plot { bottom: 48px; }
      .bars { position: absolute; inset: 0; display: flex; align-items: stretch; gap: 1px; }
      .bcol { flex: 1; position: relative; min-width: 0; }
      .bar { position: absolute; left: 0; right: 0; border-radius: 0; cursor: pointer; transition: opacity .15s; }
      .zeroline { position: absolute; left: 0; right: 0; height: 0; border-top: 1px solid rgba(255,255,255,.35); pointer-events: none; }
      .bar:hover { opacity: .8; }
      .bar.sel { outline: 1.5px solid var(--primary-text-color); outline-offset: -1px; }
      .chdr .now.sel b { color: var(--primary-color); }
      .bar.empty-slot { background: repeating-linear-gradient(45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, transparent 3px, transparent 6px); top: 0; bottom: 0; border-radius: 0; }
      .bar.unknown { cursor: default; opacity: .55; }
      .bar.unknown:hover { opacity: .55; }
      .priceline { position: absolute; inset: 0; width: 100%; height: 100%; }
      .hits { position: absolute; inset: 0; display: flex; align-items: stretch; gap: 1px; }
      .hit { flex: 1; cursor: pointer; background: transparent; border-radius: 2px; }
      .hit:hover { background: rgba(255,255,255,.06); }
      .hit.sel { background: rgba(255,255,255,.12); }
      .hit.empty-slot { background: repeating-linear-gradient(45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, transparent 3px, transparent 6px); cursor: default; }
      .nowline { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--info-color, #7dd3fc); box-shadow: 0 0 8px var(--info-color, #7dd3fc); }
      .nowline::before { content: attr(data-now); position: absolute; top: -2px; left: 3px; font-size: 9px; background: var(--info-color, #7dd3fc); color: #0a1420; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
      .nowline.right::before { left: auto; right: 3px; }
      .daymarker { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px dashed rgba(255,255,255,.28); }
      .daymarker::before { content: attr(data-label); position: absolute; top: -2px; left: 4px; font-size: 9px; color: var(--secondary-text-color); white-space: nowrap; }
      .xaxis { position: absolute; left: 34px; right: 0; bottom: 12px; height: 14px; }
      .xaxis.abs { bottom: 26px; }
      .xaxis.rel { bottom: 10px; }
      .xaxis.rel .tick { opacity: .75; }
      .xaxis.rel .tick::before { display: none; }
      .xaxis .tick { position: absolute; transform: translateX(-50%); font-size: 9px; color: var(--secondary-text-color); white-space: nowrap; }
      .xaxis .tick:last-child { transform: translateX(-100%); }
      .xaxis .tick::before { content: ""; position: absolute; top: -6px; left: 50%; width: 1px; height: 4px; background: var(--divider-color, rgba(255,255,255,.2)); }

      /* Usage tab: last-hour power (W) line chart, split by source. */
      .usage-legend { display: flex; align-items: baseline; gap: 4px 12px; flex-wrap: wrap; margin: -4px 0 8px; }
      .usage-legend-item b { font-weight: 700; margin-left: 2px; }
      .vsw { display: inline-flex; gap: 2px; margin-left: 10px; vertical-align: middle; }
      .vbtn { cursor: pointer; border: 1px solid transparent; background: rgba(127,127,127,.12); color: var(--secondary-text-color); border-radius: 6px; width: 26px; height: 22px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
      .vbtn ha-icon { --mdc-icon-size: 15px; }
      .vbtn.on { border-color: var(--primary-color); color: var(--primary-color); background: transparent; }
      .rank { display: flex; flex-direction: column; gap: 5px; margin-top: 2px; }
      .rrow { display: grid; grid-template-columns: minmax(80px, 30%) 1fr auto; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; }
      .rname { display: inline-flex; align-items: center; gap: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--primary-text-color); }
      .rico { display: inline-flex; --mdc-icon-size: 15px; }
      .rico .efp-icon { width: 15px; height: 15px; }
      .rbarw { height: 14px; background: rgba(127,127,127,.12); border-radius: 4px; overflow: hidden; }
      .rbar { display: block; height: 100%; border-radius: 4px; box-sizing: border-box; border: 1.5px solid var(--c); background: color-mix(in srgb, var(--c) 45%, transparent); }
      .rval { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .rcost { font-style: normal; font-weight: 600; color: var(--success-color, #34d399); margin-left: 7px; font-variant-numeric: tabular-nums; }
      .usage-legend-item .rcost { margin-left: 4px; font-size: 11px; }
      .stalewrap { position: relative; }
      .stalewrap > :not(.staleov) { opacity: .45; transition: opacity .2s; }
      .staleov { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
      .staleov ha-icon { --mdc-icon-size: 32px; color: var(--primary-color); }
      .spin { animation: efpspin 1s linear infinite; }
      @keyframes efpspin { to { transform: rotate(360deg); } }
      .rval small { font-weight: 400; color: var(--secondary-text-color); margin-left: 5px; }
      .donutwrap { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center; }
      .donut { width: 170px; height: 170px; flex: 0 0 auto; }
      .donut path { cursor: pointer; }
      .donut .dt1 { font-size: 6px; fill: var(--secondary-text-color); }
      .donut .dt2 { font-size: 8px; font-weight: 700; fill: var(--primary-text-color); }
      .dlist { display: flex; flex-direction: column; gap: 4px; min-width: 140px; }
      .sankeywrap { width: 100%; }
      .sankey { width: 100%; height: auto; display: block; }
      .sankey .sk { font-size: 6px; fill: var(--primary-text-color); dominant-baseline: middle; }
      .sankey .sk.b { font-weight: 700; }
      .usage-legend-item.tog { cursor: pointer; user-select: none; border-radius: 6px; padding: 1px 5px; margin: 0 -5px; transition: opacity .15s, background .15s; }
      .usage-legend-item.tog:hover { background: rgba(127,127,127,.12); }
      .usage-legend-item.off { opacity: .38; text-decoration: line-through; }
      .usage-legend-item.off i { background: transparent !important; outline: 1.5px solid currentColor; outline-offset: -1.5px; }
      .usage-legend-item { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--secondary-text-color); }
      .usage-legend-item i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; }
    `;
  }
}

customElements.define("energy-flow-price-card", EnergyFlowPriceCard);

window.__EFPC_VERSION = "1.32.0";
console.info("%c HA Energy Flow Card %c v1.32.0 ", "background:#7dd3fc;color:#0a1420;font-weight:700", "background:#333;color:#fff");

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-price-card",
  name: "HA Energy Flow Card",
  description: "Energy flow (grid/solar/battery/home/devices) with daily kWh, costs, history charts and dynamic electricity prices.",
  preview: true,
  documentationURL: "https://github.com/IngoPodolak/energy-flow-price-card",
});
