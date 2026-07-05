import { LitElement, html, css, svg, nothing } from "lit";
import "./energy-flow-price-card-editor.js";

import { DEFAULTS, DEFAULT_PRICE_STOPS } from "./constants.js";

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
// Interpolate a color from sorted stops for a given price value.
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
      car_power: "",
      car_soc: "",
      price_entity: "",
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...DEFAULTS, ...config };
    if (!Array.isArray(this._config.price_stops) || !this._config.price_stops.length) {
      this._config.price_stops = DEFAULT_PRICE_STOPS;
    }
  }

  getCardSize() {
    return (this._config.show_flow ? 3 : 0) + (this._config.show_price ? 3 : 0) || 1;
  }

  // Home = solar + grid(+/-) + discharge - charge  (+ car if included)
  _homePower(v) {
    if (v.solar === null && v.grid === null && v.charge === null && v.discharge === null) return null;
    let h = 0;
    if (v.solar !== null) h += v.solar;
    if (v.grid !== null) h += v.grid;
    if (v.discharge !== null) h += v.discharge;
    if (v.charge !== null) h -= v.charge;
    if (this._config.include_car_in_home && v.car !== null) h -= v.car;
    return h;
  }

  _priceData() {
    const cfg = this._config;
    const ent = this.hass?.states?.[cfg.price_entity];
    if (!ent) return { points: [], current: null };
    const attrs = ent.attributes || {};
    const candidates = [
      attrs.prices, attrs.prices_today, attrs.today, attrs.raw_today,
      attrs.data, attrs.forecast, attrs.raw_tomorrow, attrs.prices_tomorrow,
    ].filter(Boolean);
    // Merge today + tomorrow style arrays if both exist
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
      car: num(this.hass, c.car_power),
      carSoc: num(this.hass, c.car_soc),
    };
    const home = this._homePower(v);

    // net battery for label/value: charging positive, discharging shown as its own
    const battNet = (v.charge || 0) - (v.discharge || 0);
    const battValue = Math.abs(battNet) > 0 ? Math.abs(battNet) : (v.charge ?? v.discharge);
    const battLabel = v.charge && v.charge > 5 ? "laden" : v.discharge && v.discharge > 5 ? "ontladen" : "";
    const battColorPos = v.charge && v.charge > 5; // charging = good/green

    const gridLabel = v.grid === null ? "" : v.grid < 0 ? "export" : "import";

    const showZero = c.display_zero;
    const act = (val) => val !== null && Math.abs(val) > 5;
    const showNode = (val, hasEntity) => showZero ? hasEntity : act(val);

    const solarOn = showNode(v.solar, !!c.solar_power);
    const gridOn = showNode(v.grid, !!c.grid_power);
    const battHasEnt = !!(c.battery_charge_power || c.battery_discharge_power);
    const battOn = showZero ? battHasEnt : (act(v.charge) || act(v.discharge));
    const carHasEnt = !!c.car_power;
    const carOn = showZero ? carHasEnt : act(v.car);

    const solarActive = act(v.solar);
    const gridActive = act(v.grid);
    const battActive = act(v.charge) || act(v.discharge);
    const carActive = act(v.car);

    const bs = (() => {
      const r = 23, circ = 2 * Math.PI * r;
      const pct = v.soc === null ? 0 : Math.max(0, Math.min(100, v.soc)) / 100;
      return { circ, offset: circ * (1 - pct) };
    })();

    const battFlowColor = battActive ? c.color_battery : c.color_battery;

    return html`
      <div class="flow">
        <svg class="wires" viewBox="0 0 720 180" preserveAspectRatio="none">
          <path class="wire" d="M70,55 Q220,90 330,90"></path>
          ${solarActive ? svg`<path class="live" style="stroke:${c.color_solar}" d="M70,55 Q220,90 330,90"></path>` : nothing}
          <path class="wire" d="M650,55 Q500,90 390,90"></path>
          ${gridActive ? svg`<path class="live" style="stroke:${c.color_grid}" d="M390,90 Q500,90 650,55"></path>` : nothing}
          <path class="wire" d="M70,125 Q220,90 330,90"></path>
          ${battActive ? svg`<path class="live" style="stroke:${battFlowColor}" d="${v.charge && v.charge > 5 ? "M330,90 Q220,90 70,125" : "M70,125 Q220,90 330,90"}"></path>` : nothing}
          ${carOn ? svg`<path class="wire" d="M650,125 Q500,90 390,90"></path>` : nothing}
          ${carActive ? svg`<path class="live" style="stroke:${c.color_car}" d="M390,90 Q500,90 650,125"></path>` : nothing}
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

        ${carOn ? html`
          <div class="node br">
            <div class="ic" style="color:${c.color_car};border-color:${c.color_car}66;background:${c.color_car}22">
              <ha-icon icon="mdi:car-electric"></ha-icon>
            </div>
            <div class="txt"><span class="lbl">Auto${v.carSoc !== null ? html` · <b style="color:${c.color_car}">${Math.round(v.carSoc)}%</b>` : nothing}</span><span class="val" style="color:${c.color_car}">${fmtPower(v.car)}</span>${act(v.car) ? html`<span class="sub" style="color:${c.color_car}">laden</span>` : nothing}</div>
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

    // window: from current slot, show `hours` ahead
    let points = allPoints;
    let nowIdx = -1;
    if (allPoints.length) {
      nowIdx = allPoints.findIndex((p, i) => {
        const next = allPoints[i + 1];
        return p.t <= now && (!next || next.t > now);
      });
      if (nowIdx < 0) nowIdx = allPoints.filter((p) => p.t <= now).length - 1;
      // infer slot length (min) from spacing
      const stepMs = allPoints.length > 1 ? (allPoints[1].t - allPoints[0].t) : 3600000;
      const slots = Math.round((hours * 3600000) / stepMs);
      const start = Math.max(0, nowIdx);
      points = allPoints.slice(start, start + slots);
      nowIdx = 0; // now is first bar of the window
    }

    let maxV = 0.4, bars = nothing, nowLeft = null;
    if (points.length) {
      maxV = Math.max(...points.map((p) => p.v), 0.1) * 1.1;
      const total = points.length;
      nowLeft = (nowIdx + 0.5) / total;
      bars = points.map((p, i) => {
        const h = Math.max(2, (p.v / maxV) * 100);
        let col = colorForValue(p.v, c.price_stops);
        const title = new Date(p.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " — " + p.v.toFixed(3).replace(".", ",");
        return html`<div class="bar" style="height:${h}%;background:${col}" title="${title}"></div>`;
      });
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
          <div class="bars">${points.length ? bars : html`<div class="empty">Geen prijsdata gevonden in dit entiteit-attribuut.</div>`}</div>
          ${nowLeft !== null ? html`<div class="nowline" style="left:calc(34px + ${nowLeft} * (100% - 34px))"></div>` : nothing}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      ha-card { padding: 12px; }
      .stack { display: flex; flex-direction: column; gap: 12px; }
      .flow { position: relative; height: 180px; }
      .wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
      .wire { fill: none; stroke: rgba(255,255,255,.07); stroke-width: 2.5; }
      .live { stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-dasharray: 5 9; animation: flow 1s linear infinite; }
      @keyframes flow { to { stroke-dashoffset: -14; } }
      .node { position: absolute; display: flex; align-items: center; gap: 8px; z-index: 2; }
      .node.tl { left: 6px; top: 10px; }
      .node.tr { right: 6px; top: 10px; flex-direction: row-reverse; text-align: right; }
      .node.bl { left: 6px; bottom: 10px; }
      .node.br { right: 6px; bottom: 10px; flex-direction: row-reverse; text-align: right; }
      .node .ic { width: 44px; height: 44px; border-radius: 12px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; border: 1.5px solid transparent; }
      .node .ic ha-icon { --mdc-icon-size: 24px; }
      .txt { display: flex; flex-direction: column; gap: 1px; }
      .node.tr .txt, .node.br .txt { align-items: flex-end; }
      .txt .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .txt .val { font-size: 15px; font-weight: 700; line-height: 1.1; }
      .txt .sub { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; opacity: .85; }
      .socwrap { position: relative; width: 44px; height: 44px; flex: 0 0 auto; }
      .socwrap .ic { position: absolute; inset: 0; }
      .socring { position: absolute; inset: -4px; }
      .huis { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 2px; }
      .huis .ic { width: 58px; height: 58px; border-radius: 16px; border: 1.5px solid transparent; display: flex; align-items: center; justify-content: center; }
      .huis .ic ha-icon { --mdc-icon-size: 30px; }
      .huis .lbl { font-size: 10.5px; color: var(--secondary-text-color); }
      .huis .val { font-size: 16px; font-weight: 700; }
      .chdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
      .chdr .t { font-size: 13px; font-weight: 600; color: var(--primary-text-color); }
      .chdr .now { font-size: 12px; color: var(--secondary-text-color); }
      .chdr .now b { color: var(--info-color, #7dd3fc); font-weight: 700; }
      .chart { position: relative; height: 150px; padding-left: 34px; }
      .yaxis { position: absolute; left: 0; top: 0; bottom: 20px; width: 30px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; color: var(--secondary-text-color); text-align: right; }
      .bars { position: absolute; left: 34px; right: 0; top: 0; bottom: 20px; display: flex; align-items: flex-end; gap: 1px; }
      .bar { flex: 1; border-radius: 2px 2px 0 0; }
      .empty { color: var(--secondary-text-color); font-size: 11px; align-self: center; margin: auto; }
      .nowline { position: absolute; top: 0; bottom: 20px; width: 2px; background: var(--info-color, #7dd3fc); box-shadow: 0 0 8px var(--info-color, #7dd3fc); }
      .nowline::before { content: "Nu"; position: absolute; top: -2px; left: 3px; font-size: 9px; background: var(--info-color, #7dd3fc); color: #0a1420; padding: 1px 4px; border-radius: 3px; font-weight: 700; }
    `;
  }
}

customElements.define("energy-flow-price-card", EnergyFlowPriceCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-flow-price-card",
  name: "Energy Flow & Price Card",
  description: "Compacte energie-flow (solar/accu/huis/net/auto) plus dynamische prijzen.",
  preview: true,
  documentationURL: "https://github.com/dennisbest85/energy-flow-price-card",
});
