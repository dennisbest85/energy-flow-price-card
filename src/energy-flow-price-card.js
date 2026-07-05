import { LitElement, html, css, svg, nothing } from "lit";
import { DEFAULTS, DEFAULT_PRICE_STOPS } from "./constants.js";
import "./energy-flow-price-card-editor.js";

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
        const from = p.from ?? p.start ?? p.time ?? p.datetime ?? p.date;
        const price = p.price ?? p.value ?? p.total ?? p.marketPrice ?? p.market_price ?? p.electricity;
        const t = from ? new Date(from).getTime() : null;
        const val = typeof price === "number" ? price : parseFloat(price);
        if (t && !isNaN(val) && !seen.has(t)) { seen.add(t); merged.push({ t, v: val }); }
      }
    }
    merged.sort((a, b) => a.t - b.t);
    const current = num(this.hass, cfg.price_entity);
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
    const battLabel = v.charge && v.charge > 5 ? "laden" : v.discharge && v.discharge > 5 ? "ontladen" : "";

    const gridLabel = v.grid === null ? "" : v.grid < 0 ? "export" : "import";

    const showZero = c.display_zero;
    const act = (val) => val !== null && Math.abs(val) > 5;

    const solarActive = act(v.solar);
    const gridActive = act(v.grid);
    const battActive = act(v.charge) || act(v.discharge);

    const solarOn = showZero ? !!c.solar_power : solarActive;
    const gridOn = showZero ? !!c.grid_power : gridActive;
    const battHasEnt = !!(c.battery_charge_power || c.battery_discharge_power);
    const battOn = showZero ? battHasEnt : battActive;

    // Cars
    const cars = this._cars().map((car, i) => {
      const p = num(this.hass, car.power);
      const soc = num(this.hass, car.soc);
      return { name: car.name || `Auto ${i + 1}`, power: p, soc, active: act(p), hasEnt: !!car.power };
    });
    const anyCarActive = cars.some((c2) => c2.active);
    const carsShown = cars.filter((c2) => (showZero ? c2.hasEnt : c2.active));

    const bs = (() => {
      const r = 23, circ = 2 * Math.PI * r;
      const pct = v.soc === null ? 0 : Math.max(0, Math.min(100, v.soc)) / 100;
      return { circ, offset: circ * (1 - pct) };
    })();

    // Heart of the house is at (360, 95) in the 720x190 viewBox.
    const HX = 360, HY = 95;

    return html`
      <div class="flow">
        <svg class="wires" viewBox="0 0 720 190" preserveAspectRatio="none">
          <path class="wire" d="M70,52 Q220,${HY} ${HX - 6},${HY}"></path>
          ${solarActive ? svg`<path class="live" style="stroke:${c.color_solar}" d="M70,52 Q220,${HY} ${HX - 6},${HY}"></path>` : nothing}

          <path class="wire" d="M650,52 Q500,${HY} ${HX + 6},${HY}"></path>
          ${gridActive ? svg`<path class="live" style="stroke:${c.color_grid}" d="M${HX + 6},${HY} Q500,${HY} 650,52"></path>` : nothing}

          <path class="wire" d="M70,138 Q220,${HY} ${HX - 6},${HY}"></path>
          ${battActive ? svg`<path class="live" style="stroke:${c.color_battery}" d="${v.charge && v.charge > 5 ? `M${HX - 6},${HY} Q220,${HY} 70,138` : `M70,138 Q220,${HY} ${HX - 6},${HY}`}"></path>` : nothing}

          ${carsShown.length ? svg`<path class="wire" d="M650,138 Q500,${HY} ${HX + 6},${HY}"></path>` : nothing}
          ${anyCarActive ? svg`<path class="live" style="stroke:${c.color_car}" d="M${HX + 6},${HY} Q500,${HY} 650,138"></path>` : nothing}
        </svg>

        ${solarOn ? html`
        <div class="node tl">
          <div class="ic" style="color:${c.color_solar};border-color:${c.color_solar}66;background:${c.color_solar}22">
            <ha-icon icon="mdi:solar-power-variant"></ha-icon>
          </div>
          <div class="txt"><span class="lbl">Solar</span><span class="val" style="color:${c.color_solar}">${fmtPower(v.solar)}</span></div>
        </div>` : nothing}

        ${gridOn ? html`
        <div class="node tr">
          <div class="ic" style="color:${c.color_grid};border-color:${c.color_grid}66;background:${c.color_grid}22">
            <ha-icon icon="mdi:transmission-tower"></ha-icon>
          </div>
          <div class="txt"><span class="lbl">Net</span><span class="val" style="color:${c.color_grid}">${fmtPower(v.grid)}</span>${gridLabel ? html`<span class="sub" style="color:${c.color_grid}">${gridLabel}</span>` : nothing}</div>
        </div>` : nothing}

        ${battOn ? html`
        <div class="node bl">
          <div class="socwrap">
            <svg class="socring" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="23" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"></circle>
              ${v.soc !== null ? svg`<circle cx="26" cy="26" r="23" fill="none" stroke="${c.color_battery}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${bs.circ}" stroke-dashoffset="${bs.offset}" transform="rotate(-90 26 26)"></circle>` : nothing}
            </svg>
            <div class="ic" style="color:${c.color_battery};border-color:${c.color_battery}66;background:${c.color_battery}22">
              <ha-icon icon="mdi:battery-charging"></ha-icon>
            </div>
          </div>
          <div class="txt"><span class="lbl">Accu${v.soc !== null ? html` · <b style="color:${c.color_battery}">${Math.round(v.soc)}%</b>` : nothing}</span><span class="val" style="color:${c.color_battery}">${fmtPower(battValue)}</span>${battLabel ? html`<span class="sub" style="color:${c.color_battery}">${battLabel}</span>` : nothing}</div>
        </div>` : nothing}

        ${carsShown.length ? html`
          <div class="carstack">
            ${carsShown.map((car) => html`
              <div class="node-car">
                <div class="txt">
                  <span class="lbl">${car.name}${car.soc !== null ? html` · <b style="color:${c.color_car}">${Math.round(car.soc)}%</b>` : nothing}</span>
                  <span class="val" style="color:${c.color_car}">${fmtPower(car.power)}</span>
                  ${car.active ? html`<span class="sub" style="color:${c.color_car}">laden</span>` : nothing}
                </div>
                <div class="ic" style="color:${c.color_car};border-color:${c.color_car}66;background:${c.color_car}22">
                  <ha-icon icon="mdi:car-electric"></ha-icon>
                </div>
              </div>`)}
          </div>` : nothing}

        <div class="huis">
          <div class="ic" style="color:${c.color_home};border-color:${c.color_home}66;background:${c.color_home}1f">
            <ha-icon icon="mdi:home"></ha-icon>
          </div>
          <span class="lbl">Huis</span>
          <span class="val" style="color:${c.color_home}">${fmtPower(home)}</span>
        </div>
      </div>
    `;
  }

  _renderPrice() {
    const c = this._config;
    const { points: allPoints, current } = this._priceData();
    const now = Date.now();
    const hours = Math.max(8, Math.min(48, c.price_hours || 24));

    // Fixed axis: from start of current hour to +hours.
    const axisStart = new Date();
    axisStart.setMinutes(0, 0, 0);
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
      labels.push({ frac: h / hours, text: String(d.getHours()).padStart(2, "0") });
    }

    const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => (maxV * f).toFixed(2).replace(".", ","));

    return html`
      <div class="price">
        <div class="chdr">
          <span class="t">Stroomprijs (${hours}u)</span>
          ${current !== null ? html`<span class="now">Nu: <b>${current.toFixed(3).replace(".", ",")}</b></span>` : nothing}
        </div>
        <div class="chart">
          <div class="yaxis">${yTicks.map((t) => html`<span>${t}</span>`)}</div>
          <div class="plot">
            <div class="bars">
              ${slots.map((s) => {
                if (s.v === null) return html`<div class="bar empty-slot"></div>`;
                const h = Math.max(2, (s.v / maxV) * 100);
                const col = colorForValue(s.v, c.price_stops);
                const title = new Date(s.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " — " + s.v.toFixed(3).replace(".", ",");
                return html`<div class="bar" style="height:${h}%;background:${col}" title="${title}"></div>`;
              })}
            </div>
            <div class="nowline" style="left:${nowFrac * 100}%"></div>
          </div>
          <div class="xaxis">
            ${labels.map((l) => html`<span class="tick" style="left:${l.frac * 100}%">${l.text}</span>`)}
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      ha-card { padding: 12px; }
      .stack { display: flex; flex-direction: column; gap: 12px; }
      .flow { position: relative; height: 190px; }
      .wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
      .wire { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 2.5; }
      .live { stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-dasharray: 5 9; animation: flow 1s linear infinite; }
      @keyframes flow { to { stroke-dashoffset: -14; } }
      .node { position: absolute; display: flex; align-items: center; gap: 8px; z-index: 2; }
      .node.tl { left: 6px; top: 8px; }
      .node.tr { right: 6px; top: 8px; flex-direction: row-reverse; text-align: right; }
      .node.bl { left: 6px; bottom: 8px; }
      .node .ic, .node-car .ic { width: 44px; height: 44px; border-radius: 12px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; border: 1.5px solid transparent; }
      .node .ic ha-icon, .node-car .ic ha-icon { --mdc-icon-size: 24px; }
      .txt { display: flex; flex-direction: column; gap: 1px; }
      .node.tr .txt { align-items: flex-end; }
      .txt .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .txt .val { font-size: 15px; font-weight: 700; line-height: 1.1; }
      .txt .sub { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; opacity: .85; }
      .socwrap { position: relative; width: 44px; height: 44px; flex: 0 0 auto; }
      .socwrap .ic { position: absolute; inset: 0; }
      .socring { position: absolute; inset: -4px; }

      /* multiple cars stacked bottom-right */
      .carstack { position: absolute; right: 6px; bottom: 8px; z-index: 2; display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
      .node-car { display: flex; align-items: center; gap: 8px; flex-direction: row-reverse; text-align: right; }
      .node-car .txt { align-items: flex-end; }

      .huis { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
      .huis .ic { width: 58px; height: 58px; border-radius: 16px; border: 1.5px solid transparent; display: flex; align-items: center; justify-content: center; }
      .huis .ic ha-icon { --mdc-icon-size: 30px; }
      .huis .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .huis .val { font-size: 16px; font-weight: 700; }

      .chdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
      .chdr .t { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }
      .chdr .now { font-size: 12px; color: var(--secondary-text-color); }
      .chdr .now b { color: var(--info-color, #7dd3fc); font-weight: 700; }
      .chart { position: relative; height: 168px; padding-left: 34px; }
      .yaxis { position: absolute; left: 0; top: 0; bottom: 34px; width: 30px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; color: var(--secondary-text-color); text-align: right; }
      .plot { position: absolute; left: 34px; right: 0; top: 0; bottom: 34px; }
      .bars { position: absolute; inset: 0; display: flex; align-items: flex-end; gap: 1px; }
      .bar { flex: 1; border-radius: 2px 2px 0 0; }
      .bar.empty-slot { background: repeating-linear-gradient(45deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 3px, transparent 3px, transparent 6px); height: 100%; border-radius: 0; align-self: stretch; }
      .nowline { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--info-color, #7dd3fc); box-shadow: 0 0 8px var(--info-color, #7dd3fc); }
      .nowline::before { content: "Nu"; position: absolute; top: -2px; left: 3px; font-size: 9px; background: var(--info-color, #7dd3fc); color: #0a1420; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
      .xaxis { position: absolute; left: 34px; right: 0; bottom: 12px; height: 14px; }
      .xaxis .tick { position: absolute; transform: translateX(-50%); font-size: 9px; color: var(--secondary-text-color); }
      .xaxis .tick::before { content: ""; position: absolute; top: -6px; left: 50%; width: 1px; height: 4px; background: var(--divider-color, rgba(255,255,255,.2)); }
    `;
  }
}

customElements.define("energy-flow-price-card", EnergyFlowPriceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-price-card",
  name: "Energy Flow & Price Card",
  description: "Compacte energie-flow (solar/accu/huis/net/auto's) plus dynamische prijzen.",
  preview: true,
  documentationURL: "https://github.com/dennisbest85/energy-flow-price-card",
});
