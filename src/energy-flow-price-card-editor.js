import { LitElement, html, css, nothing } from "lit";
import { DEFAULTS, DEFAULT_PRICE_STOPS, PRICE_PROFILES, renderIcon, DEVICE_PRESETS, DEFAULT_ANCHORS, HISTORY_RANGES } from "./constants.js";
import { t, resolveLang, SUPPORTED_LANGS } from "./translations.js";

function cleanDeviceName(n) {
  return String(n)
    .replace(/[_\s]*(energy|energie|verbrauch|consumption|total|gesamt|kwh|zähler|zaehler)\b/gi, "")
    .replace(/\s{2,}/g, " ").trim() || String(n);
}
function guessDeviceType(name) {
  const n = String(name).toLowerCase();
  const rules = [
    ["wallbox", /wallbox|ladestation|charger|go-?e|easee|keba|wattpilot/],
    ["car", /\bauto\b|\bcar\b|tesla|cupra|\bid\.|\bev\b|e-?auto|fahrzeug/],
    ["heatpump", /w(ä|ae)rmepumpe|heat ?pump|altherma|vitocal|wp\b/],
    ["ac", /klima|air ?con|\bac\b|split/],
    ["waterheater", /durchlauf|boiler|warmwasser|water ?heater/],
    ["washer", /waschmaschine|washer|washing/],
    ["dryer", /trockner|dryer/],
    ["dishwasher", /sp(ü|ue)l|dishwasher/],
    ["oven", /backofen|\bofen\b|oven/],
    ["hob", /herd|kochfeld|induktion|hob|stove/],
    ["pool", /pool/],
    ["gardenpump", /pumpe|pump/],
    ["heater", /heizstab|heizung|heater|infrarot/],
  ];
  for (const [id, re] of rules) if (re.test(n)) return id;
  return "other";
}

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
    ["color_solar", "color_battery", "color_grid", "color_grid_export", "color_car", "color_home", "color_day_in", "color_day_out"].forEach((k) => { next[k] = DEFAULTS[k]; });
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

  // Import the "individual devices" of the HA energy dashboard: name + energy (kWh) sensor,
  // the matching power (W) sensor of the same device, and a type/icon guessed from the name.
  async _importEnergyDevices() {
    const T = (k) => this._t(k);
    let prefs;
    try { prefs = await this.hass.callWS({ type: "energy/get_prefs" }); } catch (e) { prefs = null; }
    const list = prefs?.device_consumption || [];
    if (!list.length) { this._importMsg = T("ed_import_none"); this.requestUpdate(); return; }
    const cars = this._cars().map((c) => ({ ...c }));
    const haveE = new Set(cars.map((c) => c.energy).filter(Boolean));
    const haveP = new Set(cars.map((c) => c.power).filter(Boolean));
    let added = 0;
    for (const d of list) {
      const e = d.stat_consumption;
      if (!e || haveE.has(e)) continue;
      const st = this.hass.states[e];
      const name = cleanDeviceName(d.name || st?.attributes?.friendly_name || e);
      let power = d.stat_rate || this._findPowerSensor(e);
      if (power && haveP.has(power)) power = null;
      const type = guessDeviceType(name);
      const preset = DEVICE_PRESETS.find((x) => x.id === type) || DEVICE_PRESETS[DEVICE_PRESETS.length - 1];
      const dev = { type, icon: preset.icon, name, energy: e };
      if (power) { dev.power = power; haveP.add(power); }
      cars.push(dev);
      haveE.add(e);
      added++;
    }
    this._importMsg = added ? T("ed_import_done").replace("{n}", added) : T("ed_import_nothing");
    if (added) this._emit({ ...this._config, cars });
    else this.requestUpdate();
  }

  _findPowerSensor(energyId) {
    const ents = this.hass.entities || {};
    const dev = ents[energyId]?.device_id;
    if (!dev) return null;
    const isPower = (id) => {
      const a = this.hass.states[id]?.attributes || {};
      return a.device_class === "power" || ["W", "kW"].includes(a.unit_of_measurement);
    };
    const cands = Object.values(ents)
      .filter((x) => x.device_id === dev && x.entity_id?.startsWith("sensor.") && isPower(x.entity_id))
      .map((x) => x.entity_id);
    return cands[0] || null;
  }

  _addCar(type = "car") {
    const cars = this._cars().map((c) => ({ ...c }));
    const preset = DEVICE_PRESETS.find((p) => p.id === type) || DEVICE_PRESETS[0];
    const name = this._t("dev_" + preset.id);
    const same = cars.filter((c) => (c.type || "car") === preset.id).length;
    cars.push({ type: preset.id, icon: preset.icon, name: same ? `${name} ${same + 1}` : name, power: "" });
    this._emit({ ...this._config, cars });
  }

  _carType(i, type) {
    const cars = this._cars().map((c) => ({ ...c }));
    const old = DEVICE_PRESETS.find((p) => p.id === (cars[i].type || "car"));
    const preset = DEVICE_PRESETS.find((p) => p.id === type) || DEVICE_PRESETS[0];
    // follow the preset's icon/name unless the user picked their own
    if (!cars[i].icon || (old && cars[i].icon === old.icon)) cars[i].icon = preset.icon;
    if (!cars[i].name || (old && cars[i].name === this._t("dev_" + old.id))) cars[i].name = this._t("dev_" + preset.id);
    cars[i].type = preset.id;
    if (preset.id !== "car") { delete cars[i].soc; delete cars[i].charging; }
    this._emit({ ...this._config, cars });
  }

  _anchorVal(key) {
    const a = this._config.visual_anchors?.[key];
    if (a) return a;
    if (key === "grid") return this._config.solar_position === "left" ? DEFAULT_ANCHORS.grid_right : DEFAULT_ANCHORS.grid_left;
    return DEFAULT_ANCHORS[key];
  }
  _anchorChange(key, axis, ev) {
    const va = { ...(this._config.visual_anchors || {}) };
    va[key] = { ...this._anchorVal(key), [axis]: parseInt(ev.target.value, 10) };
    this._emit({ ...this._config, visual_anchors: va });
  }
  _resetAnchors() {
    const next = { ...this._config };
    delete next.visual_anchors;
    this._emit(next);
  }

  // Grid / battery source: one signed entity or two separate ones (power or daily energy).
  _srcBlock(kind, energy) {
    const T = (k) => this._t(k);
    const c = this._config;
    const modeKey = energy ? `energy_${kind}_mode` : `${kind}_mode`;
    const defMode = energy ? "dual" : (kind === "grid" ? "single" : "dual");
    const mode = c[modeKey] ?? defMode;
    const single = energy ? `energy_${kind}` : `${kind}_power`;
    const invKey = energy ? `energy_${kind}_invert` : `${kind}_invert`;
    const pos = energy ? (kind === "grid" ? "energy_grid_import" : "energy_battery_discharge") : (kind === "grid" ? "grid_import_power" : "battery_discharge_power");
    const neg = energy ? (kind === "grid" ? "energy_grid_export" : "energy_battery_charge") : (kind === "grid" ? "grid_export_power" : "battery_charge_power");
    const sfx = energy ? "_e" : "";
    return html`
      <div class="srcblock">
        <label class="sel-row">
          <span class="srchead">${T(`ed_src_${kind}${sfx}`)}</span>
          <select @change=${(e) => this._emit({ ...this._config, [modeKey]: e.target.value })}>
            <option value="single" ?selected=${mode === "single"}>${T("ed_src_single")}</option>
            <option value="dual" ?selected=${mode === "dual"}>${T("ed_src_dual")}</option>
          </select>
        </label>
        ${mode === "single" ? html`
          ${this._entity(single, T(`ed_${kind}_single${sfx}`), energy ? ["sensor"] : undefined)}
          <ha-formfield label=${T(`ed_${kind}_invert`)}>
            <ha-switch .checked=${c[invKey] === true} @change=${(e) => this._toggle(invKey, e)}></ha-switch>
          </ha-formfield>` : html`
          ${this._entity(pos, T(`ed_${kind}_pos${sfx}`), energy ? ["sensor"] : undefined)}
          ${this._entity(neg, T(`ed_${kind}_neg${sfx}`), energy ? ["sensor"] : undefined)}`}
      </div>`;
  }

  // Upload (HA image upload, like the picture card) and pick from the media folder.
  _imagePickers() {
    const T = (k) => this._t(k);
    if (!customElements.get("ha-selector")) return nothing;
    const uploaded = (this._config.house_image_url || "").startsWith("/api/image/serve/") ? this._config.house_image_url : "";
    const media = this._config.house_image_media
      ? { entity_id: "", media_content_id: this._config.house_image_media, media_content_type: "image/png" } : undefined;
    return html`
      <div class="pickrow">
        <span class="picklbl">${T("ed_house_upload")}</span>
        <ha-selector .hass=${this.hass} .selector=${{ image: { original: true } }} .value=${uploaded}
          @value-changed=${(e) => {
            const v = e.detail?.value;
            const next = { ...this._config };
            delete next.house_image_media;
            if (v) next.house_image_url = v; else if (uploaded) delete next.house_image_url;
            this._emit(next);
          }}></ha-selector>
      </div>
      <div class="pickrow">
        <span class="picklbl">${T("ed_house_media")}</span>
        <ha-selector .hass=${this.hass} .selector=${{ media: { accept: ["image/*"] } }} .value=${media}
          @value-changed=${(e) => {
            const id = e.detail?.value?.media_content_id;
            const next = { ...this._config };
            if (id) { next.house_image_media = id; delete next.house_image_url; } else delete next.house_image_media;
            this._emit(next);
          }}></ha-selector>
      </div>`;
  }

  // Forecast sources from the energy dashboard; with several solar systems each card can pick its own.
  _forecastSources() {
    const T = (k) => this._t(k);
    if (!this._fcSrc && this.hass?.callWS && !this._fcSrcBusy) {
      this._fcSrcBusy = true;
      (async () => {
        let ids = [];
        try {
          const prefs = await this.hass.callWS({ type: "energy/get_prefs" });
          ids = (prefs?.energy_sources || []).filter((x) => x.type === "solar").flatMap((x) => x.config_entry_solar_forecast || []);
        } catch (e) { /* ignore */ }
        let titles = {};
        try {
          const entries = await this.hass.callWS({ type: "config_entries/get" });
          for (const e of entries || []) titles[e.entry_id] = `${e.title} (${e.domain})`;
        } catch (e) { /* ignore */ }
        this._fcSrc = [...new Set(ids)].map((id) => ({ id, title: titles[id] || id }));
        this.requestUpdate();
      })();
    }
    const list = this._fcSrc || [];
    if (list.length < 2) return nothing;
    const chosen = Array.isArray(this._config.solar_forecast_entries) ? this._config.solar_forecast_entries : [];
    const toggle = (id, on) => {
      const set = new Set(chosen.length ? chosen : list.map((x) => x.id));
      if (on) set.add(id); else set.delete(id);
      const arr = [...set];
      const next = { ...this._config };
      if (!arr.length || arr.length === list.length) delete next.solar_forecast_entries; else next.solar_forecast_entries = arr;
      this._emit(next);
    };
    return html`<div class="note">${T("ed_forecast_sources")}</div>
      ${list.map((x) => html`<label class="chk"><input type="checkbox" .checked=${!chosen.length || chosen.includes(x.id)}
        @change=${(e) => toggle(x.id, e.target.checked)} /> ${x.title}</label>`)}`;
  }

  // ha-icon-picker is lazy-loaded by Home Assistant; fall back to a text field until it exists.
  _iconPicker(value, label, onChange) {
    const own = html`<label class="sel-row"><span>${this._t("ed_own_icon")}</span>
      <select @change=${(e) => e.target.value && onChange(e.target.value)}>
        <option value="" ?selected=${!value?.startsWith("efp:")}>—</option>
        <option value="efp:heat-pump" ?selected=${value === "efp:heat-pump"}>${this._t("dev_heatpump")}</option>
      </select></label>`;
    return html`${own}${this._iconPicker2(value, label, onChange)}`;
  }

  _iconPicker2(value, label, onChange) {
    if (customElements.get("ha-icon-picker")) {
      return html`<ha-icon-picker .hass=${this.hass} .value=${value} .label=${label}
        @value-changed=${(e) => onChange(e.detail?.value ?? "")}></ha-icon-picker>`;
    }
    return html`<label class="sel-row"><span>${label}</span>
      <input class="carname-input" .value=${value} placeholder="mdi:power-plug" @change=${(e) => onChange(e.target.value)} /></label>`;
  }

  _entity(key, label, domains) {
    return html`<ha-entity-picker .hass=${this.hass} .value=${this._get(key)} .label=${label}
      .includeDomains=${domains} allow-custom-entity @value-changed=${(e) => this._pickEntity(key, e)}></ha-entity-picker>`;
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
    const lookbackHours = this._config.price_lookback_hours ?? 2;
    const lang = this._config.language ?? "auto";
    const priceProfile = PRICE_PROFILES[this._config.price_profile] ? this._config.price_profile : "default";
    const useTibberService = this._config.price_use_tibber_service === true;

    const entityFields = [
      { key: "solar_power", label: T("ed_solar_power") },
      { key: "battery_soc", label: T("ed_battery_soc") },
      ...(useTibberService ? [] : [{ key: "price_entity", label: T("ed_price_entity") }]),
      { key: "gas_price_entity", label: T("ed_gas_price_entity") },
    ];
    const colorFields = [
      { key: "color_solar", label: T("ed_color_solar") },
      { key: "color_battery", label: T("ed_color_battery") },
      { key: "color_grid", label: T("ed_color_grid") },
      { key: "color_grid_export", label: T("ed_color_grid_export") },
      { key: "color_car", label: T("ed_color_car") },
      { key: "color_home", label: T("ed_color_home") },
      { key: "color_day_in", label: T("ed_color_day_in") },
      { key: "color_day_out", label: T("ed_color_day_out") },
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
            <span>${T("ed_flow_min_power")}</span>
            <span class="numwrap"><input class="num" type="number" min="0" step="1" .value=${String(this._config.flow_min_power ?? 5)}
              @change=${(e) => { const v = parseFloat(e.target.value); this._emit({ ...this._config, flow_min_power: isNaN(v) ? 5 : Math.max(0, v) }); }} /> W</span>
          </label>
          <div class="note">${T("ed_flow_min_power_note")}</div>
          <ha-formfield label=${T("ed_battery_ring")}>
            <ha-switch .checked=${this._config.battery_ring !== false} @change=${(e) => this._toggle("battery_ring", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_car_ring")}>
            <ha-switch .checked=${this._config.car_ring !== false} @change=${(e) => this._toggle("car_ring", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_visual_layout")}>
            <ha-switch .checked=${this._config.use_visual_layout === true} @change=${(e) => this._toggle("use_visual_layout", e)}></ha-switch>
          </ha-formfield>
          ${this._config.use_visual_layout === true ? html`
            <div class="subblock">
              <div class="slider-row">
                <span>${T("ed_house_scale")}: <b>${this._config.house_image_scale ?? 100}%</b></span>
                <input type="range" min="30" max="130" step="5" .value=${this._config.house_image_scale ?? 100}
                  @input=${(e) => this._emit({ ...this._config, house_image_scale: parseInt(e.target.value, 10) })} />
              </div>
              <label class="sel-row">
                <span>${T("ed_house_label_pos")}</span>
                <select @change=${(e) => this._emit({ ...this._config, house_label_position: e.target.value })}>
                  ${["left", "above", "below"].map((v) => html`<option value=${v} ?selected=${(this._config.house_label_position ?? "left") === v}>${T("ed_house_label_" + v)}</option>`)}
                </select>
              </label>
              ${this._entity("house_image_entity", T("ed_house_image"), ["image"])}
              ${this._imagePickers()}
              <input class="carname-input" .value=${this._config.house_image_url ?? ""} placeholder=${T("ed_house_image_url")}
                @change=${(e) => { const next = { ...this._config }; if (e.target.value) next.house_image_url = e.target.value.trim(); else delete next.house_image_url; delete next.house_image_media; this._emit(next); }} />
              <div class="note">${T("ed_house_image_note")}</div>
              <details class="anchors">
                <summary>${T("ed_anchors")}</summary>
                <div class="note">${T("ed_anchor_note")}</div>
                ${["grid", "solar", "battery", "devices"].map((k) => {
                  const a = this._anchorVal(k);
                  const lbl = k === "devices" ? T("ed_cars") : T(k);
                  return html`<div class="anchor-row">
                    <span class="anchor-lbl">${lbl}</span>
                    <label>${T("ed_anchor_x")} <b>${a.x}%</b><input type="range" min="0" max="100" .value=${a.x} @input=${(e) => this._anchorChange(k, "x", e)} /></label>
                    <label>${T("ed_anchor_y")} <b>${a.y}%</b><input type="range" min="0" max="100" .value=${a.y} @input=${(e) => this._anchorChange(k, "y", e)} /></label>
                  </div>`;
                })}
                <button class="reset" @click=${() => this._resetAnchors()}>${T("ed_reset_anchors")}</button>
              </details>
            </div>` : nothing}
          <label class="sel-row">
            <span>${T("ed_solar_position")}</span>
            <select .value=${this._config.solar_position ?? "right"} @change=${(e) => this._emit({ ...this._config, solar_position: e.target.value })}>
              <option value="right">${T("ed_solar_right")}</option>
              <option value="left">${T("ed_solar_left")}</option>
            </select>
          </label>
          <label class="sel-row">
            <span>${T("ed_wire_style")}</span>
            <select .value=${this._config.wire_style ?? "dashed"} @change=${(e) => this._emit({ ...this._config, wire_style: e.target.value })}>
              <option value="dashed">${T("ed_wire_style_dashed")}</option>
              <option value="neon">${T("ed_wire_style_neon")}</option>
            </select>
          </label>
          <ha-formfield label=${T("ed_reduce_effects")}>
            <ha-switch .checked=${this._config.reduce_effects === true} @change=${(e) => this._toggle("reduce_effects", e)}></ha-switch>
          </ha-formfield>
          <label class="sel-row">
            <span>${T("ed_date_selection")}</span>
            <select @change=${(e) => this._emit({ ...this._config, date_selection: e.target.value })}>
              ${["auto", "card", "none"].map((v) => html`<option value=${v} ?selected=${(this._config.date_selection ?? "auto") === v}>${T("ed_date_sel_" + v)}</option>`)}
            </select>
          </label>
          <div class="note">${T("ed_date_selection_note")}</div>
          <label class="sel-row">
            <span>${T("ed_language")}</span>
            <select .value=${lang} @change=${(e) => this._emit({ ...this._config, language: e.target.value })}>
              <option value="auto">${T("ed_lang_auto")}</option>
              <option value="nl">Nederlands</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </label>
        </div>

        <div class="section">
          <div class="head">${T("ed_entities")}</div>
          <div class="note">${T("ed_home_note")}</div>
          <ha-formfield label=${T("ed_price_tibber_service")}>
            <ha-switch .checked=${useTibberService} @change=${(e) => this._toggle("price_use_tibber_service", e)}></ha-switch>
          </ha-formfield>
          <div class="note">${T("ed_price_tibber_service_note")}</div>
          ${this._srcBlock("grid", false)}
          ${this._srcBlock("battery", false)}
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
          <div class="head">${T("ed_daily")}</div>
          <ha-formfield label=${T("ed_show_daily")}>
            <ha-switch .checked=${this._config.show_daily_energy !== false} @change=${(e) => this._toggle("show_daily_energy", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_show_ratios")}>
            <ha-switch .checked=${this._config.show_ratios !== false} @change=${(e) => this._toggle("show_ratios", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_home_costs")}>
            <ha-switch .checked=${this._config.home_show_costs !== false} @change=${(e) => this._toggle("home_show_costs", e)}></ha-switch>
          </ha-formfield>
          ${this._config.show_daily_energy !== false ? html`
            <div class="note">${T("ed_daily_note")}</div>
            ${this._entity("energy_solar", T("ed_energy_solar"), ["sensor"])}
            ${this._srcBlock("grid", true)}
            ${this._srcBlock("battery", true)}` : nothing}
        </div>

        <div class="section">
          <div class="head">${T("ed_forecast")}</div>
          <ha-formfield label=${T("ed_forecast_show")}>
            <ha-switch .checked=${this._config.solar_forecast !== false} @change=${(e) => this._toggle("solar_forecast", e)}></ha-switch>
          </ha-formfield>
          ${this._config.solar_forecast !== false ? html`
            <ha-formfield label=${T("ed_forecast_node")}>
              <ha-switch .checked=${this._config.solar_forecast_node !== false} @change=${(e) => this._toggle("solar_forecast_node", e)}></ha-switch>
            </ha-formfield>` : nothing}
          ${this._config.solar_forecast !== false ? this._forecastSources() : nothing}
          <div class="note">${T("ed_forecast_note")}</div>
        </div>

        <div class="section">
          <div class="head">${T("ed_cars")}</div>
          <div class="note">${T("ed_car_note")}</div>
          <label class="sel-row">
            <span>${T("ed_device_colors")}</span>
            <select @change=${(e) => this._emit({ ...this._config, device_colors: e.target.value })}>
              ${["energy", "auto"].map((v) => html`<option value=${v} ?selected=${(this._config.device_colors ?? "energy") === v}>${T("ed_device_colors_" + v)}</option>`)}
            </select>
          </label>
          <div class="importrow">
            <button class="add" @click=${() => this._importEnergyDevices()}><ha-icon icon="mdi:import"></ha-icon> ${T("ed_import_energy")}</button>
            ${this._importMsg ? html`<span class="importmsg">${this._importMsg}</span>` : nothing}
          </div>
          <div class="addrow">
            <select class="addsel" @change=${(e) => { this._newType = e.target.value; }}>
              ${DEVICE_PRESETS.map((p) => html`<option value=${p.id} ?selected=${(this._newType || "car") === p.id}>${T("dev_" + p.id)}</option>`)}
            </select>
            <button class="add" @click=${() => this._addCar(this._newType || "car")}>${T("ed_add_device")}</button>
          </div>
          <label class="sel-row">
            <span>${T("ed_car_display")}</span>
            <select @change=${(e) => this._emit({ ...this._config, car_mode: e.target.value })}>
              ${[["row", T("ed_car_row")], ["scroll", T("ed_car_scroll")], ["merged", T("ed_car_merged")]].map(([v, l]) => html`
                <option value=${v} ?selected=${(this._config.car_mode ?? "row") === v}>${l}</option>`)}
            </select>
          </label>
          ${(this._config.car_mode ?? "row") === "row" ? html`
            <label class="sel-row">
              <span>${T("ed_dev_collapse")}</span>
              <select @change=${(e) => this._emit({ ...this._config, devices_collapse: e.target.value })}>
                ${["expanded", "collapsed", "top"].map((v) => html`<option value=${v} ?selected=${(this._config.devices_collapse ?? "expanded") === v}>${T("ed_dev_collapse_" + v)}</option>`)}
              </select>
            </label>
            ${this._config.devices_collapse === "top" ? html`
              <label class="sel-row">
                <span>${T("ed_dev_top_n")}</span>
                <span class="numwrap"><input class="num" type="number" min="1" max="50" step="1" .value=${String(this._config.devices_top_n ?? 4)}
                  @change=${(e) => this._emit({ ...this._config, devices_top_n: Math.max(1, parseInt(e.target.value, 10) || 4) })} /></span>
              </label>` : nothing}` : nothing}
          ${this._config.car_mode === "scroll" ? html`
            <div class="slider-row">
              <span>${T("ed_car_interval")}: <b>${this._config.car_scroll_interval ?? 5}s</b></span>
              <input type="range" min="2" max="15" step="1" .value=${this._config.car_scroll_interval ?? 5}
                @input=${(e) => this._emit({ ...this._config, car_scroll_interval: parseInt(e.target.value, 10) })} />
            </div>` : nothing}
          ${this._cars().length === 0 ? html`<div class="note">${T("ed_no_cars")}</div>` : nothing}
          ${this._cars().map((car, i) => {
            const type = car.type || "car";
            const preset = DEVICE_PRESETS.find((p) => p.id === type) || DEVICE_PRESETS[0];
            return html`
              <div class="carblock">
                <div class="carhead">
                  <span class="devicon">${renderIcon(car.icon || preset.icon)}</span>
                  <input type="text" class="carname-input" placeholder=${T("ed_car_name")} .value=${car.name ?? ""}
                    @change=${(e) => this._carChange(i, "name", e)} />
                  <button class="mini" @click=${() => this._removeCar(i)} title=${T("ed_remove_car")}>✕</button>
                </div>
                <label class="sel-row">
                  <span>${T("ed_device_type")}</span>
                  <select @change=${(e) => this._carType(i, e.target.value)}>
                    ${DEVICE_PRESETS.map((p) => html`<option value=${p.id} ?selected=${p.id === type}>${T("dev_" + p.id)}</option>`)}
                  </select>
                </label>
                ${this._iconPicker(car.icon || preset.icon, T("ed_device_icon"), (v) => this._carChange(i, "icon", { detail: { value: v } }))}
                <ha-entity-picker .hass=${this.hass} .value=${car.power ?? ""} .label=${type === "car" ? T("ed_car_power") : T("ed_device_power")}
                  allow-custom-entity @value-changed=${(e) => this._carChange(i, "power", e)}></ha-entity-picker>
                ${type === "car" ? html`
                  <ha-entity-picker .hass=${this.hass} .value=${car.charging ?? ""} .label=${T("ed_car_charging")}
                    allow-custom-entity @value-changed=${(e) => this._carChange(i, "charging", e)}></ha-entity-picker>
                  <ha-entity-picker .hass=${this.hass} .value=${car.soc ?? ""} .label=${T("ed_car_soc")}
                    allow-custom-entity @value-changed=${(e) => this._carChange(i, "soc", e)}></ha-entity-picker>` : nothing}
                ${this._config.show_daily_energy !== false ? html`
                  <ha-entity-picker .hass=${this.hass} .value=${car.energy ?? ""} .label=${T("ed_device_energy")}
                    .includeDomains=${["sensor"]} allow-custom-entity @value-changed=${(e) => this._carChange(i, "energy", e)}></ha-entity-picker>` : nothing}
                <label class="sel-row">
                  <span>${T("ed_dev_show")}</span>
                  <select @change=${(e) => this._carChange(i, "show", { target: { value: e.target.value === "default" ? "" : e.target.value } })}>
                    ${["default", "always", "active"].map((v) => html`<option value=${v} ?selected=${(car.show || "default") === v}>${T("ed_dev_show_" + v)}</option>`)}
                  </select>
                </label>
                <label class="sel-row">
                  <span>${T("ed_dev_min_power")}</span>
                  <span class="numwrap"><input class="num" type="number" min="0" step="1" placeholder=${String(this._config.flow_min_power ?? 5)}
                    .value=${car.min_power ?? ""}
                    @change=${(e) => { const cars = this._cars().map((x) => ({ ...x })); const v = parseFloat(e.target.value); if (isNaN(v)) delete cars[i].min_power; else cars[i].min_power = Math.max(0, v); this._emit({ ...this._config, cars }); }} /> W</span>
                </label>
                <label class="color">
                  <span>${T("ed_device_color")}</span>
                  <span class="colorwrap">
                    <input type="color" .value=${car.color || this._get("color_car", DEFAULTS.color_car)} @input=${(e) => this._carChange(i, "color", e)} />
                    ${car.color ? html`<button class="mini" @click=${() => this._carChange(i, "color", { target: { value: "" } })}>✕</button>` : nothing}
                  </span>
                </label>
              </div>`;
          })}
        </div>

        <div class="section">
          <div class="head">${T("ed_actions")}</div>
          ${[["tap_action", "graph"], ["hold_action", "more-info"]].map(([key, def]) => html`
            <label class="sel-row">
              <span>${T("ed_" + key)}</span>
              <select .value=${this._config[key] ?? def} @change=${(e) => this._emit({ ...this._config, [key]: e.target.value })}>
                <option value="graph">${T("ed_action_graph")}</option>
                <option value="more-info">${T("ed_action_more_info")}</option>
                <option value="none">${T("ed_action_none")}</option>
              </select>
            </label>`)}
        </div>

        <div class="section">
          <div class="head">${T("ed_price_window")}</div>
          <div class="slider-row">
            <span>${T("ed_hours_shown")}: <b>${hours}u</b></span>
            <input type="range" min="8" max="48" step="1" .value=${hours} @input=${(e) => this._hours(e)} />
          </div>
          <label class="sel-row">
            <span>${T("ed_start_point")}</span>
            <select .value=${this._config.price_start ?? "midnight"} @change=${(e) => this._emit({ ...this._config, price_start: e.target.value })}>
              <option value="midnight">${T("ed_start_midnight")}</option>
              <option value="now">${T("ed_start_now")}</option>
            </select>
          </label>
          ${this._config.price_start === "now" ? html`
            <div class="slider-row">
              <span>${T("ed_lookback_hours")}: <b>${lookbackHours}u</b></span>
              <input type="range" min="1" max="12" step="1" .value=${lookbackHours}
                @input=${(e) => this._emit({ ...this._config, price_lookback_hours: parseInt(e.target.value, 10) })} />
            </div>` : nothing}
          <ha-formfield label=${T("ed_relative_hours")}>
            <ha-switch .checked=${this._config.price_relative_hours === true} @change=${(e) => this._toggle("price_relative_hours", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_price_costs")}>
            <ha-switch .checked=${this._config.price_show_costs !== false} @change=${(e) => this._toggle("price_show_costs", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_price_axis_auto")}>
            <ha-switch .checked=${this._config.price_axis_auto !== false} @change=${(e) => this._toggle("price_axis_auto", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_price_minmax")}>
            <ha-switch .checked=${this._config.price_show_minmax === true} @change=${(e) => this._toggle("price_show_minmax", e)}></ha-switch>
          </ha-formfield>
          <ha-formfield label=${T("ed_day_marker")}>
            <ha-switch .checked=${this._config.price_show_day_marker === true} @change=${(e) => this._toggle("price_show_day_marker", e)}></ha-switch>
          </ha-formfield>
        </div>

        <div class="section">
          <div class="head">${T("ed_layout")}</div>
          <div class="note">${T("ed_layout_note")}</div>
          <label class="sel-row">
            <span>${T("ed_layout_profile")}</span>
            <select .value=${priceProfile} @change=${(e) => this._emit({ ...this._config, price_profile: e.target.value })}>
              <option value="default">${T("ed_profile_default")}</option>
              <option value="zonneplan">${T("ed_profile_zonneplan")}</option>
              <option value="tibber">${T("ed_profile_tibber")}</option>
              <option value="frank">${T("ed_profile_frank")}</option>
              <option value="anwb">${T("ed_profile_anwb")}</option>
              <option value="eneco">${T("ed_profile_eneco")}</option>
            </select>
          </label>
        </div>

        <div class="section">
          <div class="head">${T("ed_chart_tabs")}</div>
          <label class="sel-row">
            <span>${T("ed_usage_view")}</span>
            <select @change=${(e) => this._emit({ ...this._config, usage_view: e.target.value })}>
              ${["line", "bars"].map((v) => html`<option value=${v} ?selected=${(this._config.usage_view ?? "line") === v}>${T("view_usage_" + v)}</option>`)}
            </select>
          </label>
          <label class="sel-row">
            <span>${T("ed_devices_view")}</span>
            <select @change=${(e) => this._emit({ ...this._config, devices_view: e.target.value })}>
              ${["line", "bars", "rank", "donut", "sankey"].map((v) => html`<option value=${v} ?selected=${(this._config.devices_view ?? "line") === v}>${T("view_" + v)}</option>`)}
            </select>
          </label>
          <label class="sel-row">
            <span>${T("ed_history_range")}</span>
            <select @change=${(e) => this._emit({ ...this._config, history_range: e.target.value })}>
              ${HISTORY_RANGES.map((r) => html`<option value=${r.id} ?selected=${r.id === (this._config.history_range ?? "today")}>${T("range_" + r.id)}</option>`)}
            </select>
          </label>
          <div class="note">${T("ed_chart_tabs_note")}</div>
          <ha-formfield label=${T("ed_chart_auto_scroll")}>
            <ha-switch .checked=${this._config.chart_auto_scroll === true} @change=${(e) => this._toggle("chart_auto_scroll", e)}></ha-switch>
          </ha-formfield>
          ${this._config.chart_auto_scroll === true ? html`
            <div class="slider-row">
              <span>${T("ed_chart_scroll_interval")}: <b>${this._config.chart_scroll_interval ?? 8}s</b></span>
              <input type="range" min="3" max="30" step="1" .value=${this._config.chart_scroll_interval ?? 8}
                @input=${(e) => this._emit({ ...this._config, chart_scroll_interval: parseInt(e.target.value, 10) })} />
            </div>` : nothing}
        </div>

        <div class="section">
          <div class="head">${T("ed_flow")}</div>
          <div class="slider-row">
            <span>${T("ed_flow_speed")}: <b>${(this._config.flow_speed ?? 1).toFixed(1)}×</b></span>
            <input type="range" min="0.2" max="3" step="0.1" .value=${this._config.flow_speed ?? 1}
              @input=${(e) => this._emit({ ...this._config, flow_speed: parseFloat(e.target.value) })} />
          </div>
          <div class="slider-row">
            <span>${T("ed_flow_max_power")}: <b>${this._config.flow_max_power ?? 5000} W</b></span>
            <input type="range" min="500" max="15000" step="500" .value=${this._config.flow_max_power ?? 5000}
              @input=${(e) => this._emit({ ...this._config, flow_max_power: parseInt(e.target.value, 10) })} />
          </div>
          <div class="slider-row">
            <span>${T("ed_flow_off_delay")}: <b>${this._config.flow_off_delay ?? 20}s</b></span>
            <input type="range" min="0" max="120" step="5" .value=${this._config.flow_off_delay ?? 20}
              @input=${(e) => this._emit({ ...this._config, flow_off_delay: parseInt(e.target.value, 10) })} />
          </div>
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

        <div class="version">HA Energy Flow Card · v${window.__EFPC_VERSION || "?"}</div>
        ${priceProfile === "default" ? html`
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
        ` : nothing}
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
      .importrow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .importrow .add { display: inline-flex; align-items: center; gap: 6px; }
      .importrow ha-icon { --mdc-icon-size: 16px; }
      .importmsg { font-size: 12px; color: var(--secondary-text-color); }
      .version { order: 99; font-size: 11px; color: var(--secondary-text-color); text-align: right; opacity: .8; }
      .pickrow { display: flex; flex-direction: column; gap: 4px; }
      .picklbl { font-size: 13px; color: var(--secondary-text-color); }
      ha-selector { display: block; width: 100%; }
      .chk { display: flex; align-items: center; gap: 8px; font-size: 13px; }
      .srcblock { display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--divider-color); border-radius: 10px; padding: 10px; }
      .srchead { font-weight: 600; }
      .numwrap { display: inline-flex; align-items: center; gap: 6px; }
      .num { width: 80px; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
      .subblock { display: flex; flex-direction: column; gap: 8px; padding: 8px 0 4px 12px; border-left: 2px solid var(--divider-color); }
      .anchors summary { cursor: pointer; font-size: 13px; padding: 4px 0; }
      .anchor-row { display: grid; grid-template-columns: 1fr; gap: 2px; font-size: 12px; margin: 6px 0; }
      .anchor-row label { display: flex; align-items: center; gap: 6px; }
      .anchor-row label b { min-width: 34px; }
      .anchor-row input[type="range"] { flex: 1; }
      .anchor-lbl { font-weight: 600; }
      .addrow { display: flex; gap: 8px; align-items: center; }
      .addsel { flex: 1; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
      .addrow .add { align-self: auto; }
      .devicon { --mdc-icon-size: 22px; color: var(--primary-color); display: inline-flex; }
      .devicon .efp-icon { width: 22px; height: 22px; }
      .colorwrap { display: inline-flex; align-items: center; gap: 6px; }
      ha-icon-picker { display: block; width: 100%; }
    `;
  }
}

customElements.define("energy-flow-price-card-editor", EnergyFlowPriceCardEditor);
