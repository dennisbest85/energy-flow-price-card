import { LitElement, html, css, nothing } from "lit";
import { DEFAULTS, DEFAULT_PRICE_STOPS } from "./constants.js";

const ENTITY_FIELDS = [
  { key: "solar_power", label: "Solar vermogen (W)" },
  { key: "grid_power", label: "Net / P1 vermogen (W, + = import, − = export)" },
  { key: "battery_charge_power", label: "Accu laden (W)" },
  { key: "battery_discharge_power", label: "Accu ontladen (W)" },
  { key: "battery_soc", label: "Accu SOC (%)" },
  { key: "car_power", label: "Laadpaal vermogen (W) — optioneel" },
  { key: "car_soc", label: "Auto SOC (%) — optioneel" },
  { key: "price_entity", label: "Prijs energieleverancier (€/kWh)" },
];

const COLOR_FIELDS = [
  { key: "color_solar", label: "Kleur solar" },
  { key: "color_battery", label: "Kleur accu" },
  { key: "color_grid", label: "Kleur net" },
  { key: "color_car", label: "Kleur auto" },
  { key: "color_home", label: "Kleur huis" },
];

class EnergyFlowPriceCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = { ...config };
  }

  _get(key, fallback) {
    return this._config?.[key] ?? fallback ?? "";
  }

  _emit(next) {
    this._config = next;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true })
    );
  }

  _toggle(key, ev) { this._emit({ ...this._config, [key]: ev.target.checked }); }

  _pickEntity(key, ev) {
    const v = ev.detail?.value ?? ev.target.value;
    const next = { ...this._config };
    if (v) next[key] = v; else delete next[key];
    this._emit(next);
  }

  _color(key, ev) {
    this._emit({ ...this._config, [key]: ev.target.value });
  }

  _hours(ev) {
    this._emit({ ...this._config, price_hours: parseInt(ev.target.value, 10) });
  }

  _resetColors() {
    const next = { ...this._config };
    ["color_solar", "color_battery", "color_grid", "color_car", "color_home"].forEach((k) => { next[k] = DEFAULTS[k]; });
    next.price_stops = DEFAULT_PRICE_STOPS.map((s) => ({ ...s }));
    this._emit(next);
  }

  _stops() {
    const s = this._config?.price_stops;
    return Array.isArray(s) && s.length ? s : DEFAULT_PRICE_STOPS;
  }

  _stopChange(i, field, ev) {
    const stops = this._stops().map((s) => ({ ...s }));
    stops[i][field] = field === "value" ? parseFloat(ev.target.value) : ev.target.value;
    this._emit({ ...this._config, price_stops: stops });
  }

  _addStop() {
    const stops = this._stops().map((s) => ({ ...s }));
    const last = stops[stops.length - 1];
    stops.push({ value: +(last.value + 0.1).toFixed(2), color: last.color });
    this._emit({ ...this._config, price_stops: stops });
  }

  _removeStop(i) {
    const stops = this._stops().map((s) => ({ ...s }));
    if (stops.length <= 2) return;
    stops.splice(i, 1);
    this._emit({ ...this._config, price_stops: stops });
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const showFlow = this._config.show_flow !== false;
    const showPrice = this._config.show_price !== false;
    const displayZero = this._config.display_zero === true;
    const hours = this._config.price_hours ?? 24;

    return html`
      <div class="root">
        <div class="section">
          <div class="head">Weergave</div>
          <ha-formfield label="Flow tonen">
            <ha-switch .checked=${showFlow} @change=${(e) => this._toggle("show_flow", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label="Prijzen tonen">
            <ha-switch .checked=${showPrice} @change=${(e) => this._toggle("show_price", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label="Lege takken tonen (display zero)">
            <ha-switch .checked=${displayZero} @change=${(e) => this._toggle("display_zero", e)}></ha-switch>
          </ha-formfield>
        </div>

        <div class="section">
          <div class="head">Entiteiten</div>
          <div class="note">Huisverbruik wordt automatisch berekend: solar + net + accu-ontladen − accu-laden.</div>
          ${ENTITY_FIELDS.map(
            (f) => html`
              <ha-entity-picker
                .hass=${this.hass}
                .value=${this._get(f.key)}
                .label=${f.label}
                allow-custom-entity
                @value-changed=${(e) => this._pickEntity(f.key, e)}
              ></ha-entity-picker>`
          )}
        </div>

        <div class="section">
          <div class="head">Prijsvenster</div>
          <div class="slider-row">
            <span>Uren tonen: <b>${hours}u</b></span>
            <input type="range" min="8" max="48" step="1" .value=${hours} @input=${(e) => this._hours(e)} />
          </div>
        </div>

        <div class="section">
          <div class="head">
            Kleuren
            <button class="reset" @click=${() => this._resetColors()}>Standaardkleuren herstellen</button>
          </div>
          <div class="grid">
            ${COLOR_FIELDS.map(
              (f) => html`
                <label class="color">
                  <span>${f.label}</span>
                  <input type="color" .value=${this._get(f.key, DEFAULTS[f.key])}
                    @input=${(e) => this._color(f.key, e)} />
                </label>`
            )}
          </div>
        </div>

        <div class="section">
          <div class="head">Prijs-kleurschaal (€/kWh → kleur)</div>
          <div class="note">Kleuren lopen vloeiend over tussen de punten. Voeg punten toe voor een fijnere overgang.</div>
          ${this._stops().map(
            (s, i) => html`
              <div class="stop-row">
                <input type="number" step="0.01" .value=${s.value}
                  @input=${(e) => this._stopChange(i, "value", e)} />
                <span class="unit">€/kWh</span>
                <input type="color" .value=${s.color}
                  @input=${(e) => this._stopChange(i, "color", e)} />
                <button class="mini" @click=${() => this._removeStop(i)} title="Verwijder">✕</button>
              </div>`
          )}
          <button class="add" @click=${() => this._addStop()}>+ Punt toevoegen</button>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .root { display: flex; flex-direction: column; gap: 18px; padding: 4px; }
      .section { display: flex; flex-direction: column; gap: 8px; }
      .head { font-weight: 600; font-size: 14px; margin-bottom: 2px; color: var(--primary-text-color); display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .note { font-size: 11.5px; color: var(--secondary-text-color); line-height: 1.4; }
      ha-entity-picker { display: block; width: 100%; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .color { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
      .color input[type="color"] { width: 42px; height: 28px; border: none; background: none; cursor: pointer; }
      .slider-row { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
      .slider-row input[type="range"] { width: 100%; }
      .stop-row { display: flex; align-items: center; gap: 8px; }
      .stop-row input[type="number"] { width: 80px; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
      .stop-row input[type="color"] { width: 42px; height: 28px; border: none; background: none; cursor: pointer; }
      .stop-row .unit { font-size: 12px; color: var(--secondary-text-color); }
      .reset, .add, .mini { cursor: pointer; border: 1px solid var(--primary-color); background: transparent; color: var(--primary-color); border-radius: 8px; padding: 5px 10px; font-size: 12px; }
      .reset { font-weight: 500; }
      .mini { border-color: var(--error-color, #ef4444); color: var(--error-color, #ef4444); padding: 2px 8px; }
      .add { align-self: flex-start; }
    `;
  }
}

customElements.define("energy-flow-price-card-editor", EnergyFlowPriceCardEditor);
