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
display_zero: false          # true = lege takken (en ongebruikte autolader) blijven zichtbaar
price_hours: 24              # 8 t/m 48
solar_power: sensor.solar_power
grid_power: sensor.p1_power              # +/- : positief = import, negatief = export
battery_charge_power: sensor.accu_laden      # W, positief
battery_discharge_power: sensor.accu_ontladen # W, positief
battery_soc: sensor.accu_soc
car_power: sensor.wallbox_power          # optioneel; node verschijnt alleen bij laden (of bij display_zero)
car_soc: sensor.auto_soc                 # optioneel
price_entity: sensor.stroomprijs         # elke leverancier met prijs in EUR/kWh
# kleuren (optioneel)
color_solar: "#f5c518"
color_battery: "#4caf50"
color_grid: "#ff6b5e"
color_car: "#a78bfa"
color_home: "#7dd3fc"
# prijs-kleurschaal (optioneel): vloeiende overgang tussen punten
price_stops:
  - { value: 0.0, color: "#3b82f6" }   # blauw
  - { value: 0.2, color: "#3b82f6" }
  - { value: 0.3, color: "#22c55e" }   # groen
  - { value: 0.4, color: "#eab308" }   # geel
  - { value: 0.6, color: "#ef4444" }   # rood
```

## Opmerkingen

- **Auto-node** verschijnt alleen bij actief laden (`car_power` > 5 W). Zet **display zero** aan om 'm altijd te tonen zolang de entiteit is ingevuld.
- **Prijs**: werkt met elke leverancier (Frank, Tibber, Nord Pool, ENTSO-e, Zonneplan…) zolang de waarde in €/kWh is. Instelbaar venster van 8 tot 48 uur.
- **Accu**: twee aparte sensoren (laden W en ontladen W), beide positief.
- **Huisverbruik** wordt automatisch berekend: `solar + net + accu_ontladen − accu_laden` (net is +/−). Geen aparte entiteit nodig.
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
