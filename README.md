# Energy Flow & Price Card

Een compacte Lovelace-card voor Home Assistant die twee dingen in één blok combineert:

- **Energie-flow**: huis centraal, met solar, accu (incl. SOC-ring), net en laadpaal/auto in de hoeken, en bewegende lijnen die alleen lopen als er vermogen stroomt.
- **Kwartierprijzen**: staafgrafiek van je dynamische stroomprijs (o.a. Frank Energie), met "Nu"-markering en kleurcodering goedkoop/gemiddeld/duur.

Alles is instelbaar via de **grafische editor** in de HA GUI: kies je entiteiten, zet flow/prijs aan of uit, en pas alle kleuren en prijsdrempels aan.

## Installatie via HACS (custom repository)

1. HACS → rechtsboven de drie puntjes → **Custom repositories**.
2. Plak de URL van je repo (`https://github.com/USERNAME/energy-flow-price-card`), type **Dashboard** (Lovelace), en voeg toe.
3. Zoek **Energy Flow & Price Card** in HACS en installeer.
4. Ververs je browser (of leeg de cache).

De resource wordt door HACS automatisch toegevoegd. Handmatig kan ook: Instellingen → Dashboards → (⋮) Resources → `/hacsfiles/energy-flow-price-card/energy-flow-price-card.js`, type **JavaScript Module**.

## Gebruik

Voeg in een dashboard een card toe → zoek **Energy Flow & Price Card** → vul in de editor je entiteiten in. Of via YAML:

```yaml
type: custom:energy-flow-price-card
show_flow: true
show_price: true
solar_power: sensor.solar_power
home_power: sensor.home_power
grid_power: sensor.grid_power        # negatief = export
battery_power: sensor.battery_power  # positief = laden
battery_soc: sensor.battery_soc
car_power: sensor.wallbox_power      # auto-node verschijnt alleen als hier > 5 W stroomt
car_soc: sensor.car_soc
price_entity: sensor.frank_energie_current_electricity_price
# kleuren (optioneel)
color_solar: "#f5c518"
color_battery: "#4caf50"
color_grid: "#ff6b5e"
color_car: "#a78bfa"
color_home: "#7dd3fc"
# prijs (optioneel)
price_low_color: "#4caf50"
price_mid_color: "#f5c518"
price_high_color: "#ff6b5e"
price_low_max: 0.14
price_mid_max: 0.26
```

## Opmerkingen

- **Auto-node** verschijnt alleen wanneer de laadpaal daadwerkelijk laadt (`car_power` > 5 W). Laat je die weg, dan blijft het bij solar/accu/huis/net.
- **Accu-richting**: conventie is *positief = laden, negatief = ontladen*. Levert jouw sensor het omgekeerd, gebruik dan een template-sensor of een `* -1` helper.
- **Prijsdata**: de card zoekt in het prijs-entiteit naar een array-attribuut (`prices`, `prices_today`, `today`, `raw_today` of `data`) met velden als `from`/`start` en `price`/`value`. Frank Energie levert dit doorgaans. Werkt de grafiek niet? Kijk in Ontwikkelhulpmiddelen → Statussen welke attribuutnaam jouw sensor gebruikt en meld het, dan is het snel bij te stellen.

## Zelf bouwen

```bash
npm install
npm run build   # -> dist/energy-flow-price-card.js
```

## Naar GitHub pushen

```bash
# in de projectmap
git init
git add .
git commit -m "Initial commit: energy-flow-price-card"
git branch -M main
git remote add origin https://github.com/USERNAME/energy-flow-price-card.git
git push -u origin main
```

Maak op GitHub eerst een lege repo aan met de naam `energy-flow-price-card` (zonder README/license aanvinken, die zitten er al in). Vervang `USERNAME` door je eigen GitHub-gebruikersnaam.
