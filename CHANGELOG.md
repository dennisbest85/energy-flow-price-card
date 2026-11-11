# Changelog

## v1.32.2

- Geräte- und Verbrauchsbalken bei 1h/6h leer: kurze Zeitspannen nutzen jetzt die 5-Minuten-Statistik (Balken in 15-Minuten-Abschnitten); bei Heute/24h/48h erscheint dadurch auch die laufende Stunde.

## v1.32.1

- Ladeanzeige blieb bei 1h/6h/24h/48h/7 Tage dauerhaft stehen (rollierender Startzeitpunkt erzeugte ständig neue Abfragen) – behoben.

## v1.32.0

- Geräte (Rangliste und Ring): Stromkosten je Gerät neben kWh und %. Die Netzbezugskosten werden je Stunde nach Anteil am Hausverbrauch auf die Geräte verteilt (Summe = Kosten unter „Haus“).
- Deutlich schneller beim Wechsel der Zeitspanne: eine gemeinsame Statistik-Abfrage für alle kWh-Zähler statt einer Abfrage pro Gerät nacheinander; Leistungs-, Zähler- und Preisdaten werden parallel geladen.
- Beim Laden einer neuen Zeitspanne bleiben die bisherigen Werte abgedunkelt mit Ladeanzeige stehen.

## v1.31.1

- Umbenannt in **HA Energy Flow Card** (Anzeigename in Kartenauswahl, HACS, Editor, README). Kartentyp `custom:energy-flow-price-card` und Dateiname bleiben unverändert – bestehende Dashboards laufen weiter.

## v1.31.0-fork

- Verbrauchs-Diagramm: zusätzliche Balken-Ansicht wie im HA-Energie-Dashboard (PV, Akku-Entladung, Netzbezug nach oben; Akku-Aufladung, Einspeisung nach unten), Standard wählbar (`usage_view`).

## v1.30.2-fork

- Editor: „Effekte reduzieren“ in den allgemeinen Anzeige-Bereich verschoben (gilt für beide Ansichten).

## v1.30.1-fork

- Performance: Neon-Leuchten ohne CSS-Filter (flüssige Animation), Neuzeichnen nur bei Änderung der verwendeten Entitäten, kein sekündliches Neuzeichnen mehr bei aktiven Linien, Theme-Farben und Positionsmessung zwischengespeichert.

## v1.30.0-fork

- Gerätefarben wie im HA-Energie-Dashboard (`--graph-color-N` nach Position in der Geräteliste), Geräte ohne Eintrag dort erhalten automatisch kontrastreiche Farben; `device_colors: energy | auto`.
- Balken/Rangliste/Ring im HA-Stil: halbtransparente Füllung mit kräftigem Rand.

## v1.29.1-fork

- Gerätefarben nach wahrgenommenem Farbabstand (CIELAB) vergeben: jedes Gerät bekommt die Farbe, die sich am stärksten von allen bisherigen unterscheidet.

## v1.29.0-fork

- Geräte-Zeile ein-/ausklappbar; Einstellung `devices_collapse`: expanded / collapsed / top (nur die größten `devices_top_n` Verbraucher).

## v1.28.1-fork

- Gerätefarben eindeutig: 24 Farben + automatisch erzeugte weitere, ohne Doppelungen und mit Abstand zu den Knotenfarben; gleiche Farbe in Energiefluss und Diagrammen.

## v1.28.0-fork

- Hauptansicht: PV-Eigenverbrauch und Autarkiegrad als Ringanzeigen (heute bzw. gewählter Zeitraum), abschaltbar (`show_ratios`).

## v1.27.0-fork

- Geräte-Diagramm mit alternativen Ansichten: Linie, gestapelte kWh-Balken (inkl. „Nicht erfasst“), Rangliste, Ring und Energiefluss (Netz/PV/Akku → Haus → Geräte). Standard-Ansicht im Editor wählbar (`devices_view`).

## v1.26.0-fork

- Editor: Geräte aus dem Energie-Dashboard importieren (Name, kWh-Sensor, passender Leistungssensor desselben Geräts, Typ/Symbol aus dem Namen).

## v1.25.0-fork

- Datumsauswahl: Die Karte folgt der HA-Karte „Energie-Datumsauswahl“ auf demselben Dashboard oder bringt eine eigene Leiste mit (Tag / Woche / Monat / Jahr / Zeitraum, ‹ ›, Kalender, „Heute“). Einstellung `date_selection: auto | card | none`.
- Für den gewählten Zeitraum: kWh je Knoten und Gerät, Hausverbrauch und Stromkosten aus der Statistik; Verlaufsdiagramme zeigen den Zeitraum. Bei vergangenen Zeiträumen werden aktuelle Werte und Animationen ausgeblendet.
- Tibber-Dienst: Preise von gestern werden für die Kosten mit abgerufen.

## v1.24.1-fork

- Zeitlinie des Schiebereglers dicker und leuchtend weiß (auch im Preisdiagramm).

## v1.24.0-fork

- Fluss-Animation: Geschwindigkeit jetzt streng proportional zur Leistung (doppelte Leistung = doppelt so schnell), damit die Linien untereinander vergleichbar sind.

## v1.23.1-fork

- Visuelle Ansicht: Linien enden ohne zusätzlichen Knick genau am eingestellten Endpunkt.

## v1.23.0-fork

- Hausbild: Hochladen direkt im Editor und Auswahl aus dem Medien-Ordner (`house_image_media`). Pfade wie `/media/haus.png` oder `/homeassistant/media/haus.png` werden automatisch über einen signierten Link geladen.

## v1.22.0-fork

- Heutige Stromkosten (Netzbezug × Preis) unter „Haus“, abschaltbar (`home_show_costs`).

## v1.21.0-fork

- Preisdiagramm: Stromkosten des Netzbezugs neben dem „Jetzt“-Preis – heute, bei mehr als 24 h zusätzlich gestern (`price_show_costs`). Berechnet je 5 Minuten aus Netzbezug × gültigem Preis; Preise von gestern aus dem Verlauf der Preis-Entität.

## v1.20.0-fork

- Preisdiagramm: Skala passt sich der Preisspanne an (unterer leerer Bereich wird abgeschnitten, runde Teilstriche). Negative Preise werden unterstützt: Null-Linie, Balken zeigen nach unten. Abschaltbar (`price_axis_auto: false`).

## v1.19.2-fork

- Prognose-Quelle pro Karte wählbar, wenn im Energie-Dashboard mehrere Solaranlagen mit Prognose eingetragen sind (`solar_forecast_entries`).
- Versionsnummer unten im Editor.

## v1.19.1-fork

- Solarprognose zu hoch skaliert, wenn die Prognose Zwischenzeitpunkte (Sonnenauf-/-untergang) enthält – jetzt stundenweise wie im Energie-Dashboard.

## v1.19.0-fork

- Solarprognose wie im HA-Energie-Dashboard (Forecast.Solar, Solcast … aus den Energie-Einstellungen): gestrichelte Linie im Solar-Diagramm (bei „Heute“ bis Mitternacht) und „Prognose heute“ in kWh unter dem Solar-Symbol. Abschaltbar (`solar_forecast`, `solar_forecast_node`).

## v1.18.0-fork

- Pro Gerät einstellbar: eigene Ausblend-Schwelle in W (`min_power`, leer = globaler Wert) und Anzeige (`show`: Standard / always / active).

## v1.17.1-fork

- Symbole für Tages-Netzbezug und -Einspeisung vertauscht (korrigiert).

## v1.17.0-fork

- Visuelle Ansicht: Größe des Hausbilds einstellbar (`house_image_scale`, 30–130 %).
- Position des Haus-Textes wählbar (`house_label_position`: left / above / below); bei oben/unten rückt das Bild automatisch an den gegenüberliegenden Rand.

## v1.16.0-fork

- Diagramme „Geräte“ und „Verbrauch“: einzelne Linien per Antippen der Legende aus- und wieder einblenden.
- Eigenes, deutlicheres Wärmepumpen-Symbol (Außeneinheit mit Ventilator), `icon: efp:heat-pump`; bestehende Wärmepumpen nutzen es automatisch.

## v1.15.0-fork

- Netz und Akku: wahlweise **eine Entität mit Vorzeichen** oder **zwei getrennte Entitäten** – für die aktuelle Leistung und für den Tageswert, jeweils mit „Vorzeichen umkehren“.
- Tageswerte mit eigenen Richtungs-Symbolen je Knoten: Netz (Mast mit Bezug/Einspeisung), Akku (Akku mit Pfeil runter/hoch), Solar (Panel mit Pfeil), Geräte (Gerätesymbol mit Pfeil).

## v1.14.0-fork

- Neues Eingabefeld „Linie ausblenden unter … W“ (`flow_min_power`, Standard 5 W).
- Geräte werden jetzt alle gleichzeitig angezeigt (`car_mode: row`, neuer Standard): Geräte-Knoten mit Summe unten rechts, darunter jedes Gerät mit eigener animierter Linie. Inaktive Geräte werden ausgeblendet, außer „Leere Zweige anzeigen“ ist an.
- Tageswerte größer, untereinander und farbig: Symbol „ins Haus“ (grün) bzw. „aus dem Haus“ (orange); Farben einstellbar (`color_day_in`, `color_day_out`).
- Preisdiagramm: optional Tageshöchst- und Tagestiefstpreis markieren (`price_show_minmax`).

## v1.13.0-fork (Fork-Anpassungen)

- Flusslinien laufen jetzt in beiden Ansichten nur waagerecht/senkrecht und starten/enden exakt an den Symbolen.
- Netz oben links, Solar oben rechts (umschaltbar: `solar_position: left` = Original).
- Visuelle Ansicht: eigenes Hausbild über Bild-Entität (`house_image_entity`) oder URL (`house_image_url`), Linien-Endpunkte im Bild einstellbar (`visual_anchors`).
- Statt nur Autos beliebige Geräte (Klima, Wärmepumpe, Gartenpumpe, Backofen, Kochfeld, Durchlauferhitzer, …) mit wählbarem Symbol und optional eigener Farbe.
- Neuer Diagramm-Tab „Netz“ (Bezug oben / Einspeisung unten) und „Geräte“; „Verbrauch“ zeigt zusätzlich den Hausverbrauch.
- Zeitspanne für alle Diagramme direkt in der Karte wählbar (1h, 6h, Heute, 24h, 48h, 7 Tage; Preis: 12/24/48h).
- Schieberegler unter jedem Diagramm, um einen genauen Zeitpunkt auszuwählen.
- Antippen eines Symbols öffnet das passende Diagramm, langes Drücken die Detailansicht – beides im Editor einstellbar.
- Unter jedem Wert die heutige Energie in kWh mit Richtungspfeil (berechnet aus dem Verlauf oder aus optionalen kWh-Sensoren).
- Leistungs-Sensoren in kW werden automatisch in W umgerechnet.

Alle noemenswaardige wijzigingen aan de Energy Flow & Price Card.

## v1.2.1

### Nieuw
- **Slimmere flow-animatie.** De snelheid van een lijntje schaalt nu mee met het vermogen: hoe hoger het vermogen, hoe sneller de puntjes lopen, tot een instelbare drempel (standaard 5000 W). Onder de drempel wordt het evenredig langzamer.
- **Lijntje staat stil bij ~0 W** maar blijft eerst zichtbaar; na een instelbare vertraging (standaard 20 s) zonder stroom faadt het lijntje uit. Wordt een lijntje weer actief, dan faadt het in.
- **Drie nieuwe instellingen** in de editor: flow-snelheid (algemene factor), vermogen voor topsnelheid, en de uitschakelvertraging.

## v1.1.8

### Nieuw
- **Lege nodes altijd zichtbaar in grijs.** Solar, accu, net en auto worden nu altijd getoond. Is een entiteit niet ingevuld, dan staat de node grijs en het lijntje statisch grijs (uit). Zodra er stroom loopt, kleurt de node en beweegt het lijntje.

### Fixes
- **Zonneplan-prijzen werken nu.** De prijsgrafiek herkent nu ook het veld `electricity_price` en de geneste `price_tax_included`/`price_tax_excluded` velden, en rekent Zonneplan's schaal (x10.000.000) automatisch om naar €/kWh. Dit geldt ook voor andere leveranciers die de prijs als geschaald geheel getal aanleveren.
- README-afbeelding toegevoegd (vereist voor HACS-validatie).

## v1.1.6

### Nieuw
- **Meertalig (NL / EN / DE).** De card volgt automatisch de taal van Home Assistant en valt terug op Engels als de taal niet wordt ondersteund. In de editor kun je de taal ook handmatig forceren.

### Gewijzigd
- **Nieuwe standaard prijs-kleurschaal:** 0,00 en 0,20 blauw, 0,25 groen, 0,35 geel, 0,70 rood.

## v1.1.4

### Fixes
- **Huis correct uitgelijnd.** Het huis-icoon en het verbruik staan nu iets lager, en het icoon-midden valt precies op het punt waar de flow-lijntjes samenkomen. De lijnen stoppen tegen de rand van het huis-vierkant in plaats van er dwars doorheen te lopen.

## v1.1.3

### Fixes
- **Auto-uitlijning definitief opgelost.** De auto-node is nu het spiegelbeeld van de accu: tekst links, icoon uiterst rechts tegen de rand. De layoutrichting is expliciet vastgezet zodat deze niet meer kan omdraaien.

## v1.1.2

### Fixes
- Poging tot correcte auto-uitlijning (richtingsprobleem, verder afgemaakt in v1.1.3).

## v1.1.1

### Fixes
- Auto-node herschikt naar hoek-layout (verder verfijnd in latere versies).

## v1.1.0

### Fixes
- **Accu-weergave opgeschoond.** Het vierkante vlak achter het accu-icoon is weg; alleen de ronde SoC-cirkel met icoon blijft over.
- **Auto-uitlijning verbeterd** zodat het flow-lijntje op het icoon aankomt.

### Overig
- Auto-scroll-overgang vloeit verticaal in.
- Versie-regel in de browserconsole toegevoegd (`energy-flow-price-card vX.Y.Z`) om snel te kunnen controleren welke versie actief is.

## v1.0.9

### Fixes
- **Auto-naam betrouwbaar aan te passen.** Het naamveld gebruikte een component die botste met de entiteit-kiezer van Home Assistant; het is nu een gewoon tekstveld.

## v1.0.6

### Fixes
- **Tijdlijn Solar/Accu klopt.** De grafiek loopt nu van 00:00 tot nu (geen lege toekomst); de actuele waarde valt op de Nu-lijn.

## v1.0.5

### Nieuw
- Grafiek-tabs: Prijs / Solar / Accu.
- Vloeiende auto-wisseling (fade + slide).
- Startpunt grafiek instelbaar (vanaf nu of vanaf middernacht).
- Tijdslot-info via hover en tik.

## v1.0.3

### Nieuw
- Meerdere auto's met eigen naam.
- Tijdlijn met uur-labels onder de prijsgrafiek.
- Vast prijsvenster (8–48u) met lege plekken waar nog geen data is.

## v1.0.0

- Eerste versie: compacte energie-flow (solar, accu, huis, net, auto) plus dynamische prijsgrafiek, volledig instelbaar via de grafische editor.
