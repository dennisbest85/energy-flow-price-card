# Energy Flow & Price Card

*(Nederlands hieronder / Dutch below)*

A compact Lovelace card for Home Assistant that combines two things in one block:

- **Energy flow:** the home in the center, with solar, battery (incl. SoC ring), grid and EV charger(s) in the corners, and animated lines that only move when power is actually flowing.
- **Price & history charts:** switch between three tabs — a bar chart of your dynamic electricity price (Frank Energie, Tibber, Nord Pool, ENTSO-e, Zonneplan, and others), today's solar production, and today's battery SoC. The price chart has a "Now" marker and a customizable low/medium/high color scale.

Everything is configurable through the graphical editor in the HA GUI: pick your entities, toggle flow/charts on or off, add multiple cars with their own names, choose auto-scroll or a static view for several cars, set the price window (8-48 h), and adjust all colors and price thresholds. The card is **multilingual (NL / EN / DE)** and follows your Home Assistant language automatically, with a manual override in the editor.

## Installation via HACS (custom repository)

1. HACS -> top-right three dots -> **Custom repositories**.
2. Paste your repo URL (`https://github.com/dennisbest85/energy-flow-price-card`), type **Dashboard** (Lovelace), and add it.
3. Search for **Energy Flow & Price Card** in HACS and install.
4. Refresh your browser (or clear the cache).

HACS adds the resource automatically. Manual: Settings -> Dashboards -> (three dots) Resources -> `/hacsfiles/energy-flow-price-card/energy-flow-price-card.js`, type JavaScript Module.

## Usage

Add a card to a dashboard -> search for **Energy Flow & Price Card** -> fill in your entities in the editor. Or via YAML:

```yaml
type: custom:energy-flow-price-card
show_flow: true
show_price: true
display_zero: false          # true = empty branches (and idle car charger) stay visible
price_hours: 24              # 8 to 48
price_start: midnight        # "midnight" (from 00:00) or "now"
language: auto               # "auto" (follow HA) | nl | en | de
solar_power: sensor.solar_power
grid_power: sensor.p1_power                   # +/- : positive = import, negative = export
battery_charge_power: sensor.battery_charge   # W, positive
battery_discharge_power: sensor.battery_discharge # W, positive
battery_soc: sensor.battery_soc
price_entity: sensor.electricity_price        # any provider with a price in EUR/kWh
cars:
  - name: My car
    power: sensor.wallbox_power               # node appears only while charging (or with display_zero)
    soc: sensor.car_soc                        # optional
# colors (optional)
color_solar: "#f5c518"
color_battery: "#4caf50"
color_grid: "#ff6b5e"
color_car: "#a78bfa"
color_home: "#7dd3fc"
# price color scale (optional): smooth gradient between points
price_stops:
  - { value: 0.0, color: "#3b82f6" }   # blue
  - { value: 0.2, color: "#3b82f6" }
  - { value: 0.25, color: "#22c55e" }  # green
  - { value: 0.35, color: "#eab308" }  # yellow
  - { value: 0.7, color: "#ef4444" }   # red
```

## Notes

- **Cars:** add one or more via the editor, each with its own name. With multiple cars you can choose auto-scroll (cycles automatically) or a static view. A car node appears only while charging (`power` > 5 W), unless *display zero* is on.
- **Price:** works with any provider (Frank, Tibber, Nord Pool, ENTSO-e, Zonneplan...) as long as the value is in EUR/kWh. Window is adjustable from 8 to 48 hours, starting at midnight or now.
- **Battery:** two separate sensors (charge W and discharge W), both positive.
- **Home usage** is calculated automatically: `solar + grid + battery_discharge - battery_charge` (grid is +/-). No separate entity needed.
- **Solar / battery history** charts use the Home Assistant history API for today (from 00:00 to now); make sure the recorder tracks those entities.
- **Price data:** the card looks for an array attribute on the price entity (`prices`, `prices_today`, `today`, `raw_today`, `data`, and a few more) with fields like `from`/`start` and `price`/`value`. Frank Energie provides this by default. Chart not working? Check Developer Tools -> States to see which attribute your sensor uses.

---

# Energy Flow & Price Card (Nederlands)

Een compacte Lovelace-card voor Home Assistant die twee dingen in een blok combineert:

- **Energie-flow:** het huis centraal, met solar, accu (incl. SoC-ring), net en laadpaal/auto('s) in de hoeken, en bewegende lijnen die alleen lopen als er vermogen stroomt.
- **Prijs- en historie-grafieken:** wissel tussen drie tabbladen - een staafgrafiek van je dynamische stroomprijs (Frank Energie, Tibber, Nord Pool, ENTSO-e, Zonneplan e.a.), de zonne-opbrengst van vandaag, en het accu-SoC-verloop van vandaag. De prijsgrafiek heeft een "Nu"-markering en een instelbare kleurschaal goedkoop/gemiddeld/duur.

Alles is instelbaar via de grafische editor in de HA GUI: kies je entiteiten, zet flow/grafieken aan of uit, voeg meerdere auto's met eigen naam toe, kies auto-scroll of een statische weergave bij meerdere auto's, stel het prijsvenster in (8-48 u), en pas alle kleuren en prijsdrempels aan. De card is **meertalig (NL / EN / DE)** en volgt automatisch de taal van Home Assistant, met een handmatige keuze in de editor.

## Installatie via HACS (custom repository)

1. HACS -> rechtsboven de drie puntjes -> **Custom repositories**.
2. Plak de URL van je repo (`https://github.com/dennisbest85/energy-flow-price-card`), type **Dashboard** (Lovelace), en voeg toe.
3. Zoek **Energy Flow & Price Card** in HACS en installeer.
4. Ververs je browser (of leeg de cache).

De resource wordt door HACS automatisch toegevoegd. Handmatig kan ook: Instellingen -> Dashboards -> (drie puntjes) Resources -> `/hacsfiles/energy-flow-price-card/energy-flow-price-card.js`, type JavaScript Module.

## Gebruik

Voeg in een dashboard een card toe -> zoek **Energy Flow & Price Card** -> vul in de editor je entiteiten in. Of via YAML (zie het Engelse voorbeeld hierboven).

## Opmerkingen

- **Auto's:** voeg er een of meer toe via de editor, elk met een eigen naam. Bij meerdere auto's kies je auto-scroll (wisselt vanzelf) of een statische weergave. Een auto-node verschijnt alleen bij actief laden (`power` > 5 W), tenzij *display zero* aan staat.
- **Prijs:** werkt met elke leverancier (Frank, Tibber, Nord Pool, ENTSO-e, Zonneplan...) zolang de waarde in EUR/kWh is. Venster instelbaar van 8 tot 48 uur, startend om middernacht of nu.
- **Accu:** twee aparte sensoren (laden W en ontladen W), beide positief.
- **Huisverbruik** wordt automatisch berekend: `solar + net + accu_ontladen - accu_laden` (net is +/-). Geen aparte entiteit nodig.
- **Solar-/accu-historie** gebruikt de Home Assistant history API voor vandaag (00:00 tot nu); zorg dat de recorder die entiteiten bijhoudt.
- **Prijsdata:** de card zoekt in het prijs-entiteit naar een array-attribuut (`prices`, `prices_today`, `today`, `raw_today`, `data` e.a.) met velden als `from`/`start` en `price`/`value`. Frank Energie levert dit doorgaans. Werkt de grafiek niet? Kijk in Ontwikkelhulpmiddelen -> Statussen welke attribuutnaam jouw sensor gebruikt.
