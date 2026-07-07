import { LitElement, html, css, nothing } from "lit";
import { DEFAULTS, DEFAULT_PRICE_STOPS } from "./constants.js";
import { t, resolveLang, SUPPORTED_LANGS } from "./translations.js";

class EnergyFlowPriceCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = { ...config };
    if (!Array.isArray(this._config.cars)) this._config.cars = [];
  }

  _t(key) {
    return t(resolveLang(this._config?.language, this.hass), key);
  }

  _get(key, fallback) { return this._config?.[key] ?? fallback ?? ""; }

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

  _color(key, ev) { this._emit({ ...this._config, [key]: ev.target.value }); }
  _hours(ev) { this._emit({ ...this._config, price_hours: parseInt(ev.target.value, 10) }); }

  _resetColors() {
    const next = { ...this._config };
    ["color_solar", "color_battery", "color_grid", "color_car", "color_home"].forEach((k) => { next[k] = DEFAULTS[k]; });
    next.price_stops = DEFAULT_PRICE_STOPS.map((s) => ({ ...s }));
    this._emit(next);
  }

  _cars() { return Array.isArray(this._config?.cars) ? this._config.cars : []; }

  _carChange(i, field, ev) {
    const cars = this._cars().map((c) => ({ ...c }));
    const val = ev.detail?.value ?? ev.target.value;
    if (val === "" || val == null) delete cars[i][field]; else cars[i][field] = val;
    this._emit({ ...this._config, cars });
  }

  _addCar() {
    const cars = this._cars().map((c) => ({ ...c }));
    cars.push({ name: `${this._t("car")} ${cars.length + 1}`, power: "", soc: "" });
    this._emit({ ...this._config, cars });
  }

  _removeCar(i) {
    const cars = this._cars().map((c) => ({ ...c }));
    cars.splice(i, 1);
    this._emit({ ...this._config, cars });
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
    const T = (k) => this._t(k);
    const showFlow = this._config.show_flow !== false;
    const showPrice = this._config.show_price !== false;
    const displayZero = this._config.display_zero === true;
    const hours = this._config.price_hours ?? 24;
    const lang = this._config.language ?? "auto";

    const entityFields = [
      { key: "solar_power", label: T("ed_solar_power") },
      { key: "grid_power", label: T("ed_grid_power") },
      { key: "battery_charge_power", label: T("ed_battery_charge") },
      { key: "battery_discharge_power", label: T("ed_battery_discharge") },
      { key: "battery_soc", label: T("ed_battery_soc") },
      { key: "price_entity", label: T("ed_price_entity") },
    ];
    const colorFields = [
      { key: "color_solar", label: T("ed_color_solar") },
      { key: "color_battery", label: T("ed_color_battery") },
      { key: "color_grid", label: T("ed_color_grid") },
      { key: "color_car", label: T("ed_color_car") },
      { key: "color_home", label: T("ed_color_home") },
    ];

    return html`
      <div class="root">
        <div class="section">
          <div class="head">${T("ed_display")}</div>
          <ha-formfield label=${T("ed_show_flow")}>
            <ha-switch .checked=${showFlow} @change=${(e) => this._toggle("show_flow", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_show_price")}>
            <ha-switch .checked=${showPrice} @change=${(e) => this._toggle("show_price", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_display_zero")}>
            <ha-switch .checked=${displayZero} @change=${(e) => this._toggle("display_zero", e)}></ha-switch>
          </ha-formfield>
          <label class="sel-row">
            <span>${T("ed_language")}</span>
            <select @change=${(e) => this._emit({ ...this._config, language: e.target.value })}>
              <option value="auto" ?selected=${lang === "auto"}>${T("ed_lang_auto")}</option>
              <option value="nl" ?selected=${lang === "nl"}>Nederlands</option>
              <option value="en" ?selected=${lang === "en"}>English</option>
              <option value="de" ?selected=${lang === "de"}>Deutsch</option>
            </select>
          </label>
        </div>

        <div class="section">
          <div class="head">${T("ed_entities")}</div>
          <div class="note">${T("ed_home_note")}</div>
          ${entityFields.map(
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
          <div class="head">
            ${T("ed_cars")}
            <button class="add" @click=${() => this._addCar()}>${T("ed_add_car")}</button>
          </div>
          <div class="note">${T("ed_car_note")}</div>
          <label class="sel-row">
            <span>${T("ed_car_display")}</span>
            <select @change=${(e) => this._emit({ ...this._config, car_mode: e.target.value })}>
              <option value="scroll" ?selected=${(this._config.car_mode ?? "scroll") === "scroll"}>${T("ed_car_scroll")}</option>
              <option value="merged" ?selected=${this._config.car_mode === "merged"}>${T("ed_car_merged")}</option>
            </select>
          </label>
          ${(this._config.car_mode ?? "scroll") === "scroll" ? html`
            <div class="slider-row">
              <span>${T("ed_car_interval")}: <b>${this._config.car_scroll_interval ?? 5}s</b></span>
              <input type="range" min="2" max="15" step="1" .value=${this._config.car_scroll_interval ?? 5}
                @input=${(e) => this._emit({ ...this._config, car_scroll_interval: parseInt(e.target.value, 10) })} />
            </div>` : nothing}
          ${this._cars().length === 0 ? html`<div class="note">${T("ed_no_cars")}</div>` : nothing}
          ${this._cars().map(
            (car, i) => html`
              <div class="carblock">
                <div class="carhead">
                  <input
                    type="text"
                    class="carname-input"
                    placeholder=${T("ed_car_name")}
                    .value=${car.name ?? ""}
                    @change=${(e) => this._carChange(i, "name", e)}
                  />
                  <button class="mini" @click=${() => this._removeCar(i)} title=${T("ed_remove_car")}>✕</button>
                </div>
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${car.power ?? ""}
                  .label=${T("ed_car_power")}
                  allow-custom-entity
                  @value-changed=${(e) => this._carChange(i, "power", e)}
                ></ha-entity-picker>
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${car.soc ?? ""}
                  .label=${T("ed_car_soc")}
                  allow-custom-entity
                  @value-changed=${(e) => this._carChange(i, "soc", e)}
                ></ha-entity-picker>
              </div>`
          )}
        </div>

        <div class="section">
          <div class="head">${T("ed_price_window")}</div>
          <div class="slider-row">
            <span>${T("ed_hours_shown")}: <b>${hours}u</b></span>
            <input type="range" min="8" max="48" step="1" .value=${hours} @input=${(e) => this._hours(e)} />
          </div>
          <label class="sel-row">
            <span>${T("ed_start_point")}</span>
            <select @change=${(e) => this._emit({ ...this._config, price_start: e.target.value })}>
              <option value="midnight" ?selected=${(this._config.price_start ?? "midnight") === "midnight"}>${T("ed_start_midnight")}</option>
              <option value="now" ?selected=${this._config.price_start === "now"}>${T("ed_start_now")}</option>
            </select>
          </label>
        </div>

        <div class="section">
          <div class="head">
            ${T("ed_colors")}
            <button class="reset" @click=${() => this._resetColors()}>${T("ed_reset_colors")}</button>
          </div>
          <div class="grid">
            ${colorFields.map(
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
          <div class="head">${T("ed_price_scale")}</div>
          <div class="note">${T("ed_price_scale_note")}</div>
          ${this._stops().map(
            (s, i) => html`
              <div class="stop-row">
                <input type="number" step="0.01" .value=${s.value}
                  @input=${(e) => this._stopChange(i, "value", e)} />
                <span class="unit">€/kWh</span>
                <input type="color" .value=${s.color}
                  @input=${(e) => this._stopChange(i, "color", e)} />
                <button class="mini" @click=${() => this._removeStop(i)} title=${T("ed_remove")}>✕</button>
              </div>`
          )}
          <button class="add" @click=${() => this._addStop()}>${T("ed_add_point")}</button>
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
      .carname-input { flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color, #1c1c2e); color: var(--primary-text-color); font-size: 14px; }
      .carname-input::placeholder { color: var(--secondary-text-color); }
      .color { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
      .color input[type="color"] { width: 42px; height: 28px; border: none; background: none; cursor: pointer; }
      .slider-row { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
      .slider-row input[type="range"] { width: 100%; }
      .sel-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
      .sel-row select { padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
      .carblock { border: 1px solid var(--divider-color); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
      .carhead { display: flex; align-items: center; gap: 8px; }
      .stop-row { display: flex; align-items: center; gap: 8px; }
      .stop-row input[type="number"] { width: 80px; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
      .stop-row input[type="color"] { width: 42px; height: 28px; border: none; background: none; cursor: pointer; }
      .stop-row .unit { font-size: 12px; color: var(--secondary-text-color); }
      .reset, .add, .mini { cursor: pointer; border: 1px solid var(--primary-color); background: transparent; color: var(--primary-color); border-radius: 8px; padding: 5px 10px; font-size: 12px; }
      .mini { border-color: var(--error-color, #ef4444); color: var(--error-color, #ef4444); padding: 2px 8px; }
      .add { align-self: flex-start; }
    `;
  }
}

customElements.define("energy-flow-price-card-editor", EnergyFlowPriceCardEditor);
