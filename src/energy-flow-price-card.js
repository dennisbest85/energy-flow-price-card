import { LitElement, html, css, svg, nothing } from "lit";
import { DEFAULTS, DEFAULT_PRICE_STOPS } from "./constants.js";
import { t, resolveLang } from "./translations.js";
import "./energy-flow-price-card-editor.js";

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

class EnergyFlowPriceCard extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
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
    if (!Array.isArray(this._config.cars)) this._config.cars = [];
    if (this._carScrollIdx == null) this._carScrollIdx = 0;
    this._startCarScroll();
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
        const p = num(this.hass, car.power);
        if (p !== null) h -= p;
      }
    }
    return h;
  }

  _cars() {
    return Array.isArray(this._config.cars) ? this._config.cars : [];
  }

  _t(key) {
    return t(resolveLang(this._config?.language, this.hass), key);
  }

  // Per-wire animation state: tracks last time a wire had meaningful power,
  // so lines can fade in when active and fade out after flow_off_delay seconds.
  // Returns { show, moving, duration (s), fade ('in'|'out'|null) }.
  _wireState(key, power) {
    this._wires = this._wires || {};
    const now = Date.now();
    const c = this._config;
    const p = power === null ? 0 : Math.abs(power);
    const active = p > 5;
    let w = this._wires[key];
    if (!w) w = this._wires[key] = { lastActive: active ? now : 0, shownSince: active ? now : 0, wasShown: active };

    if (active) {
      w.lastActive = now;
      if (!w.wasShown) { w.wasShown = true; w.shownSince = now; }
    }
    const offDelay = Math.max(0, (c.flow_off_delay ?? 20)) * 1000;
    const sinceActive = now - w.lastActive;
    const show = active || (w.wasShown && sinceActive < offDelay);
    if (!show) w.wasShown = false;

    // speed: linear from 0..flow_max_power, scaled by flow_speed multiplier.
    const maxP = Math.max(100, c.flow_max_power ?? 5000);
    const frac = Math.max(0, Math.min(1, p / maxP));
    const speedMul = Math.max(0.1, c.flow_speed ?? 1.0);
    // duration: fast (small number) at high power, slow (large) near zero.
    // frac 1 -> ~0.5s, frac ~0 -> ~6s. Divided by the user multiplier.
    const duration = active ? (6 - 5.5 * frac) / speedMul : 0;

    // fade direction
    let fade = null;
    if (active && now - w.shownSince < 800) fade = "in";
    else if (!active && show) fade = "out";

    return { show, moving: active, duration, fade };
  }

  // Ensure the card keeps repainting while any wire is counting down to fade-out,
  // even if Home Assistant sends no new state updates.
  _scheduleFlowTick() {
    if (this._flowTimer) return;
    this._flowTimer = setInterval(() => {
      const wires = this._wires || {};
      const now = Date.now();
      const offDelay = Math.max(0, (this._config?.flow_off_delay ?? 20)) * 1000;
      const pending = Object.values(wires).some((w) => w.wasShown && now - w.lastActive < offDelay + 1000);
      this.requestUpdate();
      if (!pending) { clearInterval(this._flowTimer); this._flowTimer = null; }
    }, 1000);
  }

  _priceData() {
    const cfg = this._config;
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
        const from = p.from ?? p.start ?? p.start_date ?? p.time ?? p.datetime ?? p.date;
        // Zonneplan nests price under objects; also uses electricity_price (x1e7).
        let price = p.price ?? p.value ?? p.total ?? p.marketPrice ?? p.market_price ??
          p.electricity ?? p.electricity_price ??
          p.price_tax_included?.amount ?? p.price_tax_excluded?.amount;
        const t = from ? new Date(from).getTime() : null;
        let val = typeof price === "number" ? price : parseFloat(price);
        if (t && !isNaN(val)) {
          // Auto-scale providers that report scaled integers (e.g. Zonneplan x1e7).
          val = normalizePrice(val);
          if (!seen.has(t)) { seen.add(t); merged.push({ t, v: val }); }
        }
      }
    }
    merged.sort((a, b) => a.t - b.t);
    let current = num(this.hass, cfg.price_entity);
    if (current !== null) current = normalizePrice(current);
    return { points: merged, current };
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    return html`
      <ha-card>
        <div class="stack">
          ${this._config.show_flow ? this._renderFlow() : nothing}
          ${this._config.show_price ? this._renderPrice() : nothing}
        </div>
      </ha-card>
    `;
  }

  _renderFlow() {
    const c = this._config;
    const v = {
      solar: num(this.hass, c.solar_power),
      grid: num(this.hass, c.grid_power),
      charge: num(this.hass, c.battery_charge_power),
      discharge: num(this.hass, c.battery_discharge_power),
      soc: num(this.hass, c.battery_soc),
    };
    const home = this._homePower(v);

    const battValue = (v.charge && v.charge > 5) ? v.charge : (v.discharge && v.discharge > 5) ? v.discharge : (v.charge ?? v.discharge);
    const battLabel = v.charge && v.charge > 5 ? this._t("charging") : v.discharge && v.discharge > 5 ? this._t("discharging") : "";

    const gridLabel = v.grid === null ? "" : v.grid < 0 ? this._t("export") : this._t("import");

    const showZero = c.display_zero;
    const act = (val) => val !== null && Math.abs(val) > 5;

    const solarActive = act(v.solar);
    const gridActive = act(v.grid);
    const battActive = act(v.charge) || act(v.discharge);

    // Which entities are configured at all
    const solarHasEnt = !!c.solar_power;
    const gridHasEnt = !!c.grid_power;
    const battHasEnt = !!(c.battery_charge_power || c.battery_discharge_power);

    // All four nodes are always shown. A node is "muted" (grey) when its
    // entity is not configured. Colored when configured.
    const GREY = "#6b7280";
    const solarCol = solarHasEnt ? c.color_solar : GREY;
    const gridCol = gridHasEnt ? c.color_grid : GREY;
    const battCol = battHasEnt ? c.color_battery : GREY;
    const carCol = c.color_car;

    // Cars
    const cars = this._cars().map((car, i) => {
      const p = num(this.hass, car.power);
      const soc = num(this.hass, car.soc);
      return { name: car.name || `${this._t("car")} ${i + 1}`, power: p, soc, active: act(p), hasEnt: !!car.power };
    });
    const anyCarActive = cars.some((c2) => c2.active);
    const carHasEnt = cars.some((c2) => c2.hasEnt);
    // Always show at least one car node; if none added, show a single placeholder.
    const carsShown = cars.length ? cars : [{ name: this._t("car"), power: null, soc: null, active: false, hasEnt: false }];

    const bs = (() => {
      const r = 23, circ = 2 * Math.PI * r;
      const pct = v.soc === null ? 0 : Math.max(0, Math.min(100, v.soc)) / 100;
      return { circ, offset: circ * (1 - pct) };
    })();

    // House square center in the 720x190 viewBox. Lowered a bit.
    // Icon ~58px; horizontal half-width in viewBox units ≈ 34.
    const HX = 360, HY = 104;          // vertical center of the house square (lowered)
    const HL = HX - 34, HR = HX + 34;  // left / right edge of the square

    // Per-wire animation states
    const solarPow = v.solar;
    const gridPow = v.grid;
    const battPow = v.charge && v.charge > 5 ? v.charge : (v.discharge && v.discharge > 5 ? v.discharge : 0);
    const carPow = (() => { let m = 0; for (const c2 of cars) { if (c2.active && Math.abs(c2.power) > m) m = Math.abs(c2.power); } return m; })();

    const wSolar = this._wireState("solar", solarPow);
    const wGrid = this._wireState("grid", gridPow);
    const wBatt = this._wireState("batt", battPow);
    const wCar = this._wireState("car", carPow);
    if (wSolar.show || wGrid.show || wBatt.show || wCar.show) this._scheduleFlowTick();

    const liveStyle = (st, color) =>
      `stroke:${color};animation-duration:${st.duration}s;${st.moving ? "" : "animation-play-state:paused;"}`;
    const liveClass = (st) => `live${st.fade === "in" ? " fade-in" : ""}${st.fade === "out" ? " fade-out" : ""}${st.moving ? "" : " still"}`;

    return html`
      <div class="flow">
        <svg class="wires" viewBox="0 0 720 190" preserveAspectRatio="none">
          <path class="wire" d="M70,52 Q220,${HY} ${HL},${HY}"></path>
          ${wSolar.show ? svg`<path class="${liveClass(wSolar)}" style="${liveStyle(wSolar, c.color_solar)}" d="M70,52 Q220,${HY} ${HL},${HY}"></path>` : nothing}

          <path class="wire" d="M650,52 Q500,${HY} ${HR},${HY}"></path>
          ${wGrid.show ? svg`<path class="${liveClass(wGrid)}" style="${liveStyle(wGrid, c.color_grid)}" d="${gridPow < 0 ? `M${HR},${HY} Q500,${HY} 650,52` : `M650,52 Q500,${HY} ${HR},${HY}`}"></path>` : nothing}

          <path class="wire" d="M70,138 Q220,${HY} ${HL},${HY}"></path>
          ${wBatt.show ? svg`<path class="${liveClass(wBatt)}" style="${liveStyle(wBatt, c.color_battery)}" d="${v.charge && v.charge > 5 ? `M${HL},${HY} Q220,${HY} 70,138` : `M70,138 Q220,${HY} ${HL},${HY}`}"></path>` : nothing}

          <path class="wire" d="M650,138 Q500,${HY} ${HR},${HY}"></path>
          ${wCar.show ? svg`<path class="${liveClass(wCar)}" style="${liveStyle(wCar, c.color_car)}" d="M${HR},${HY} Q500,${HY} 650,138"></path>` : nothing}
        </svg>

        <div class="node tl ${solarHasEnt ? "" : "muted"}">
          <div class="ic" style="color:${solarCol};border-color:${solarCol}66;background:${solarCol}22">
            <ha-icon icon="mdi:solar-power-variant"></ha-icon>
          </div>
          <div class="txt"><span class="lbl">${this._t("solar")}</span><span class="val" style="color:${solarCol}">${fmtPower(v.solar)}</span></div>
        </div>

        <div class="node tr ${gridHasEnt ? "" : "muted"}">
          <div class="ic" style="color:${gridCol};border-color:${gridCol}66;background:${gridCol}22">
            <ha-icon icon="mdi:transmission-tower"></ha-icon>
          </div>
          <div class="txt"><span class="lbl">${this._t("grid")}</span><span class="val" style="color:${gridCol}">${fmtPower(v.grid)}</span>${gridLabel ? html`<span class="sub" style="color:${gridCol}">${gridLabel}</span>` : nothing}</div>
        </div>

        <div class="node bl ${battHasEnt ? "" : "muted"}">
          <div class="socwrap">
            <svg class="socring" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"></circle>
              ${battHasEnt && v.soc !== null ? svg`<circle cx="26" cy="26" r="23" fill="none" stroke="${battCol}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${bs.circ}" stroke-dashoffset="${bs.offset}" transform="rotate(-90 26 26)"></circle>` : nothing}
            </svg>
            <div class="ic round" style="color:${battCol}">
              <ha-icon icon="mdi:battery-charging"></ha-icon>
            </div>
          </div>
          <div class="txt"><span class="lbl">${this._t("battery")}${battHasEnt && v.soc !== null ? html` · <b style="color:${battCol}">${Math.round(v.soc)}%</b>` : nothing}</span><span class="val" style="color:${battCol}">${fmtPower(battValue)}</span>${battLabel ? html`<span class="sub" style="color:${battCol}">${battLabel}</span>` : nothing}</div>
        </div>

        ${this._renderCars(carsShown, c, carHasEnt)}

        <div class="huis">
          <div class="ic" style="color:${c.color_home};border-color:${c.color_home}66;background:${c.color_home}1f">
            <ha-icon icon="mdi:home"></ha-icon>
          </div>
          <span class="lbl">${this._t("home")}</span>
          <span class="val" style="color:${c.color_home}">${fmtPower(home)}</span>
        </div>
      </div>
    `;
  }

  _renderCars(cars, c, carHasEnt = true) {
    const GREY = "#6b7280";
    const cc = carHasEnt ? c.color_car : GREY;
    const mode = c.car_mode === "merged" ? "merged" : "scroll";
    const carInfo = (car) => html`
      <span class="lbl">${car.name}${car.soc !== null ? html` · <b style="color:${cc}">${Math.round(car.soc)}%</b>` : nothing}</span>
      <span class="val" style="color:${cc}">${fmtPower(car.power)}</span>
      ${car.active ? html`<span class="sub" style="color:${cc}">${this._t("charging")}</span>` : nothing}
    `;
    const icon = html`
      <div class="ic" style="color:${cc};border-color:${cc}66;background:${cc}22">
        <ha-icon icon="mdi:car-electric"></ha-icon>
      </div>`;

    if (mode === "merged" || cars.length === 1) {
      // icon in corner, info to the left (mirror of accu)
      return html`
        <div class="node br car ${carHasEnt ? "" : "muted"}">
          <div class="txt carinfos">
            ${cars.map((car) => html`<div class="cartxt">${carInfo(car)}</div>`)}
          </div>
          ${icon}
        </div>`;
    }

    // scroll mode: icon fixed in corner, cycling info to the left
    const idx = this._carScrollIdx % cars.length;
    const car = cars[idx];
    return html`
      <div class="node br car ${carHasEnt ? "" : "muted"}">
        <div class="txt">
          <div class="cartxt caranim" data-k=${idx}>${carInfo(car)}</div>
          <div class="cardots">
            ${cars.map((_, i) => html`<span class="dot ${i === idx ? "on" : ""}" style="background:${i === idx ? cc : "rgba(255,255,255,.25)"}"></span>`)}
          </div>
        </div>
        ${icon}
      </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._startCarScroll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._carTimer) { clearInterval(this._carTimer); this._carTimer = null; }
    if (this._flowTimer) { clearInterval(this._flowTimer); this._flowTimer = null; }
  }

  _startCarScroll() {
    if (this._carTimer) clearInterval(this._carTimer);
    const secs = Math.max(2, this._config?.car_scroll_interval || 5);
    this._carTimer = setInterval(() => {
      this._carScrollIdx = (this._carScrollIdx || 0) + 1;
      this.requestUpdate();
    }, secs * 1000);
  }

  updated() {
    // Restart the fade+slide animation whenever the shown car changes.
    const el = this.renderRoot?.querySelector?.(".caranim");
    if (el && el.dataset.k !== this._lastCarK) {
      this._lastCarK = el.dataset.k;
      el.classList.remove("run");
      // force reflow to restart the CSS animation
      void el.offsetWidth;
      el.classList.add("run");
    }
  }

  _renderPrice() {
    const c = this._config;
    const mode = this._chartMode || "price";
    const tabs = [
      { id: "price", label: this._t("tab_price"), show: !!c.price_entity },
      { id: "solar", label: this._t("tab_solar"), show: !!c.solar_power },
      { id: "accu", label: this._t("tab_battery"), show: !!c.battery_soc },
    ].filter((t) => t.show);
    // if selected tab is unavailable, fall back to first
    const activeMode = tabs.some((t) => t.id === mode) ? mode : (tabs[0]?.id || "price");

    const tabBar = tabs.length > 1 ? html`
      <div class="tabs">
        ${tabs.map((t) => html`
          <button class="tab ${t.id === activeMode ? "on" : ""}" @click=${() => this._setChartMode(t.id)}>${t.label}</button>`)}
      </div>` : nothing;

    let body;
    if (activeMode === "price") body = this._priceChart(c);
    else body = this._historyChart(c, activeMode);

    return html`<div class="price">${tabBar}${body}</div>`;
  }

  _setChartMode(m) {
    this._chartMode = m;
    if (m !== "price") this._ensureHistory(m);
    this.requestUpdate();
  }

  // Fetch today's history for solar/accu once, cache it.
  async _ensureHistory(mode) {
    const c = this._config;
    const entity = mode === "solar" ? c.solar_power : c.battery_soc;
    if (!entity || !this.hass) return;
    this._history = this._history || {};
    const cacheKey = mode + "|" + entity;
    // refresh at most every 5 min
    const cached = this._history[cacheKey];
    if (cached && Date.now() - cached.fetched < 300000) return;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    try {
      const url = `history/period/${start.toISOString()}?filter_entity_id=${entity}&minimal_response`;
      const res = await this.hass.callApi("GET", url);
      const arr = Array.isArray(res) && res[0] ? res[0] : [];
      const points = arr.map((s) => ({
        t: new Date(s.last_changed || s.last_updated).getTime(),
        v: parseFloat(s.state),
      })).filter((p) => !isNaN(p.v));
      this._history[cacheKey] = { fetched: Date.now(), points };
      this.requestUpdate();
    } catch (e) {
      this._history[cacheKey] = { fetched: Date.now(), points: [], error: true };
      this.requestUpdate();
    }
  }

  _historyChart(c, mode) {
    const entity = mode === "solar" ? c.solar_power : c.battery_soc;
    const color = mode === "solar" ? c.color_solar : c.color_battery;
    const unit = mode === "solar" ? "W" : "%";
    const title = mode === "solar" ? this._t("solar_today") : this._t("battery_today");

    const cacheKey = mode + "|" + entity;
    const cached = this._history?.[cacheKey];
    if (!cached) { this._ensureHistory(mode); }
    const points = cached?.points || [];

    // build a smooth area/line over today 00:00 -> now (axis ends at NOW)
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const startMs = start.getTime();
    const now = Date.now();
    const span = Math.max(1, now - startMs);

    let maxV = mode === "accu" ? 100 : Math.max(10, ...points.map((p) => p.v)) * 1.1;
    const path = points.length
      ? points.map((p, i) => {
          const x = Math.max(0, Math.min(1, (p.t - startMs) / span)) * 100;
          const y = 100 - Math.max(0, Math.min(1, p.v / maxV)) * 100;
          return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(" ")
      : "";
    const areaPath = path ? `${path} L100,100 L0,100 Z` : "";

    // labels only up to the current hour; axis runs 00:00 -> now
    const nowHour = now / 3600000 - startMs / 3600000; // hours since midnight (fractional)
    const labelEvery = nowHour <= 8 ? 2 : 3;
    const labels = [];
    for (let h = 0; h <= Math.floor(nowHour); h += labelEvery) {
      labels.push({ frac: (h * 3600000) / span, text: h + ":00" });
    }
    // always show the current time at the far right
    const curD = new Date(now);
    labels.push({ frac: 1, text: curD.getHours() + ":" + String(curD.getMinutes()).padStart(2, "0") });
    const nowFrac = 1; // now is the right edge

    const cur = num(this.hass, entity);
    const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(maxV * f) + (mode === "accu" ? "" : ""));

    return html`
      <div class="chdr">
        <span class="t">${title}</span>
        ${cur !== null ? html`<span class="now">${this._t("now")}: <b>${mode === "accu" ? Math.round(cur) + "%" : fmtPower(cur)}</b></span>` : nothing}
      </div>
      <div class="chart">
        <div class="yaxis">${yTicks.map((t) => html`<span>${t}</span>`)}</div>
        <div class="plot">
          ${points.length
            ? html`<svg class="hist" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="${areaPath}" fill="${color}22"></path>
                <path d="${path}" fill="none" stroke="${color}" stroke-width="1.5" vector-effect="non-scaling-stroke"></path>
              </svg>`
            : html`<div class="empty">${cached?.error ? this._t("history_none") : this._t("history_loading")}</div>`}
          <div class="nowline right" data-now="${this._t("now")}" style="left:${Math.min(100, nowFrac * 100)}%"></div>
        </div>
        <div class="xaxis">
          ${labels.map((l) => html`<span class="tick" style="left:${Math.min(100, l.frac * 100)}%">${l.text}</span>`)}
        </div>
      </div>
    `;
  }

  _priceChart(c) {
    const { points: allPoints, current } = this._priceData();
    const now = Date.now();
    const hours = Math.max(8, Math.min(48, c.price_hours || 24));

    // Fixed axis: from start of current hour to +hours.
    const axisStart = new Date();
    if (c.price_start === "midnight") {
      axisStart.setHours(0, 0, 0, 0); // today 00:00
    } else {
      axisStart.setMinutes(0, 0, 0);  // start of current hour
    }
    const startMs = axisStart.getTime();
    const endMs = startMs + hours * 3600000;

    // slot length from data (default hourly)
    const stepMs = allPoints.length > 1 ? (allPoints[1].t - allPoints[0].t) : 3600000;
    const slotCount = Math.max(1, Math.round((endMs - startMs) / stepMs));

    // Build fixed slots; fill with data where available
    const byTime = new Map(allPoints.map((p) => [Math.floor(p.t / stepMs) * stepMs, p.v]));
    const slots = [];
    for (let i = 0; i < slotCount; i++) {
      const t = startMs + i * stepMs;
      const key = Math.floor(t / stepMs) * stepMs;
      const v = byTime.has(key) ? byTime.get(key) : null;
      slots.push({ t, v });
    }

    const withData = slots.filter((s) => s.v !== null);
    const maxV = withData.length ? Math.max(...withData.map((s) => s.v), 0.1) * 1.1 : 0.4;

    const nowFrac = Math.max(0, Math.min(1, (now - startMs) / (endMs - startMs)));

    // Hour labels: choose interval by width (more hours -> sparser labels)
    const labelEvery = hours <= 12 ? 2 : hours <= 24 ? 3 : 6;
    const labels = [];
    for (let h = 0; h <= hours; h += labelEvery) {
      const d = new Date(startMs + h * 3600000);
      labels.push({ frac: h / hours, text: d.getHours() + ":00" });
    }

    const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => (maxV * f).toFixed(2).replace(".", ","));

    const sel = this._selectedSlot;

    return html`
      <div class="chdr">
        <span class="t">${this._t("price_title")} (${hours}u)</span>
        ${sel
          ? html`<span class="now sel">${new Date(sel.t).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}: <b>${sel.v.toFixed(3).replace(".", ",")}</b></span>`
          : current !== null
            ? html`<span class="now">${this._t("now")}: <b>${current.toFixed(3).replace(".", ",")}</b></span>`
            : nothing}
      </div>
      <div class="chart">
        <div class="yaxis">${yTicks.map((t) => html`<span>${t}</span>`)}</div>
        <div class="plot">
          <div class="bars">
            ${slots.map((s) => {
              if (s.v === null) return html`<div class="bar empty-slot"></div>`;
              const h = Math.max(2, (s.v / maxV) * 100);
              const col = colorForValue(s.v, c.price_stops);
              const isSel = sel && sel.t === s.t;
              const timeTxt = new Date(s.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return html`<div
                class="bar ${isSel ? "sel" : ""}"
                style="height:${h}%;background:${col}"
                title="${timeTxt} — ${s.v.toFixed(3).replace(".", ",")} €/kWh"
                @mouseenter=${() => this._hoverSlot(s)}
                @mouseleave=${() => this._hoverSlot(null)}
                @click=${() => this._tapSlot(s)}
              ></div>`;
            })}
          </div>
          <div class="nowline" data-now="${this._t("now")}" style="left:${nowFrac * 100}%"></div>
        </div>
        <div class="xaxis">
          ${labels.map((l) => html`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}
        </div>
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
      .flow { position: relative; height: 190px; }
      .wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
      .wire { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 2.5; }
      .live { stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-dasharray: 5 9; animation-name: flow; animation-timing-function: linear; animation-iteration-count: infinite; opacity: 1; transition: opacity 1s ease; }
      .live.still { stroke-dashoffset: 0; }
      .live.fade-in { opacity: 1; }
      .live.fade-out { opacity: 0; }
      @keyframes flow { to { stroke-dashoffset: -14; } }
      .node { position: absolute; display: flex; align-items: center; gap: 8px; z-index: 2; }
      .node.tl { left: 6px; top: 8px; }
      .node.tr { right: 6px; top: 8px; flex-direction: row-reverse; text-align: right; }
      .node.bl { left: 6px; bottom: 8px; }
      .node.muted { opacity: .55; }
      .node.muted .val, .node.muted .sub { opacity: .8; }
      .node.br { right: 6px; bottom: 8px; flex-direction: row; justify-content: flex-end; text-align: right; }
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

      .huis { position: absolute; left: 50%; top: 54.7%; transform: translate(-50%, -29px); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
      .huis .ic { width: 58px; height: 58px; border-radius: 16px; border: 1.5px solid transparent; display: flex; align-items: center; justify-content: center; }
      .huis .ic ha-icon { --mdc-icon-size: 30px; }
      .huis .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .huis .val { font-size: 16px; font-weight: 700; }

      .chdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
      .chdr .t { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }
      .tabs { display: flex; gap: 6px; margin-bottom: 10px; }
      .tab { cursor: pointer; border: 1px solid var(--divider-color); background: transparent; color: var(--secondary-text-color); border-radius: 999px; padding: 3px 12px; font-size: 12px; transition: all .2s; }
      .tab.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
      .hist { position: absolute; inset: 0; width: 100%; height: 100%; }
      .chdr .now { font-size: 12px; color: var(--secondary-text-color); }
      .chdr .now b { color: var(--info-color, #7dd3fc); font-weight: 700; }
      .chart { position: relative; height: 168px; padding-left: 34px; }
      .yaxis { position: absolute; left: 0; top: 0; bottom: 34px; width: 30px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; color: var(--secondary-text-color); text-align: right; }
      .plot { position: absolute; left: 34px; right: 0; top: 0; bottom: 34px; }
      .bars { position: absolute; inset: 0; display: flex; align-items: flex-end; gap: 1px; }
      .bar { flex: 1; border-radius: 2px 2px 0 0; cursor: pointer; transition: opacity .15s; }
      .bar:hover { opacity: .8; }
      .bar.sel { outline: 1.5px solid var(--primary-text-color); outline-offset: -1px; }
      .chdr .now.sel b { color: var(--primary-color); }
      .bar.empty-slot { background: repeating-linear-gradient(45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, transparent 3px, transparent 6px); height: 100%; border-radius: 0; align-self: stretch; }
      .nowline { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--info-color, #7dd3fc); box-shadow: 0 0 8px var(--info-color, #7dd3fc); }
      .nowline::before { content: attr(data-now); position: absolute; top: -2px; left: 3px; font-size: 9px; background: var(--info-color, #7dd3fc); color: #0a1420; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
      .nowline.right::before { left: auto; right: 3px; }
      .xaxis { position: absolute; left: 34px; right: 0; bottom: 12px; height: 14px; }
      .xaxis .tick { position: absolute; transform: translateX(-50%); font-size: 9px; color: var(--secondary-text-color); white-space: nowrap; }
      .xaxis .tick:last-child { transform: translateX(-100%); }
      .xaxis .tick::before { content: ""; position: absolute; top: -6px; left: 50%; width: 1px; height: 4px; background: var(--divider-color, rgba(255,255,255,.2)); }
    `;
  }
}

customElements.define("energy-flow-price-card", EnergyFlowPriceCard);

console.info("%c energy-flow-price-card %c v1.2.0 ", "background:#7dd3fc;color:#0a1420;font-weight:700", "background:#333;color:#fff");

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-price-card",
  name: "Energy Flow & Price Card",
  description: "Compacte energie-flow (solar/accu/huis/net/auto's) plus dynamische prijzen.",
  preview: true,
  documentationURL: "https://github.com/dennisbest85/energy-flow-price-card",
});
