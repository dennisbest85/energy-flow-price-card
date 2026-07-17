# Changelog

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
