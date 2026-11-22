# AK28 – nettside

Nettsiden til Atletklubben av 1928 (AK28), håndball i Kristiansand.
Ren HTML, CSS og JavaScript – ingen byggesteg. Publiseres gratis med GitHub Pages.

## Innhold

| Fil | Hva |
| --- | --- |
| `index.html` | Forsiden |
| `lag.html` | Lagsiden med filter, kamper og tabell |
| `ny-i-ak28.html` | Informasjon til nye medlemmer |
| `bli-medlem.html` | Innmelding (lenke til Spond) |
| `barneidrett.html` | Barneidrett for de minste |
| `cup-2027.html` | Sparebanken Norge – AK28 Cup |
| `trygg-pa-trening.html` | Trygg på trening og varsling |
| `klubbhuset.html` | Utleie av klubbhuset, priser og regler |
| `odderneshallen.html` | Hjemmebanen, med kart |
| `om-klubben.html` | Oversikt over klubben |
| `klubbhistorie.html`, `styret.html`, `sportslig-utvalg.html`, `kontakt.html` | Undersider under «Om klubben» |
| `sponsorer.html` | Sponsorene, sortert etter nivå |
| `404.html` | «Fant ikke siden» – sender også gamle Google Sites-adresser til riktig ny side |
| `data/lag.json` | Laglisten (navn, alder, trenere, treningstider, bilde, lenke til handball.no) |
| `assets/css/style.css` | All styling. Klubbfargene står øverst i filen |
| `assets/js/main.js` | Mobilmeny og nedtelling til cupen |
| `assets/js/lag.js` | Viser lagene fra `data/lag.json` |
| `assets/js/klubbhus.js` | Leieskjemaet for klubbhuset (pris, tidssjekk, takk-melding) |
| `assets/img/` | Logo og bilder |
| `assets/fonts/` | Skriftene (Barlow Condensed og Inter), lagret lokalt |
| `assets/docs/` | Dokumenter til nedlasting (klubbstrategien) |

Menyen og bunnteksten er lik på alle sider. Skal noe der endres, må det endres i hver fil (søk og erstatt).

## Vanlige endringer

- **Legge til eller endre et lag:** Rediger `data/lag.json`. Lagbildet legges i `assets/img/` og filnavnet skrives i `"bilde"`.
- **Endre starttid for cup-nedtellingen:** Finn `data-start` i `index.html` (format `2027-04-23T17:00:00+02:00`).
- **Sponsorlogoer:** Legg logoene i `assets/img/` og bytt plassholderne i `sponsorer.html` og nederst på forsiden.
- **Ny nyhet på forsiden:** Kopier en `<article class="card news">`-blokk i `index.html` og bytt tekst og bilde.
- **Bygge inn Google-kalenderen:** Se kommentaren i kalenderseksjonen i `index.html`.

Endringer kan gjøres direkte på github.com (blyant-ikonet på filen). Siden oppdateres automatisk etter et minutt eller to.

## Nyheter (Pages CMS)

Nyhetssaker publiseres i Pages CMS – ingen koding nødvendig.

1. Gå til https://app.pagescms.org og logg inn med GitHub.
2. Velg repoet **ak28-nettside** → **Nyheter** → **Add an entry**.
3. Fyll inn tittel, dato, kategori, ingress, bilde og tekst, og trykk **Save**.
4. Etter 1–2 minutter ligger saken på nettsiden: som kort under «Siste nytt» på forsiden (de seks nyeste), på `nyheter.html` og på egen side.

Tips:
- Kryss av «Vis stort på forsiden» for å gjøre en sak til det store kortet.
- Fjern krysset «Publisert» for å skjule en sak uten å slette den.
- Nye redaktører trenger skrivetilgang til repoet (Settings → Collaborators på GitHub).

Teknisk: sakene ligger som Markdown i `innhold/nyheter/`. GitHub-jobben `.github/workflows/nyheter.yml` kjører `tools/bygg_nyheter.py`, som lager `nyheter.html`, `nyhet-*.html` og kortene mellom `<!-- NYHETER-START -->` og `<!-- NYHETER-SLUTT -->` i `index.html`. Lokalt: `python tools/bygg_nyheter.py`.

## Booking av klubbhuset

Alt samles i én Google-kalender: «KLUBBHUS AK28». Den vises på `klubbhuset.html`.

**Trenere og foreldrekontakter (gratis, uten godkjenning)**
1. Daglig leder åpner kalenderen i Google Kalender → Innstillinger og deling → *Del med bestemte personer*.
2. Legg til e-posten til hver trener og foreldrekontakt med tilgangen **«Gjøre endringer i aktiviteter»**.
3. De bruker knappen «Åpne klubbhuskalenderen» på nettsiden og legger inn bookingen selv.
4. Fjern tilgangen når noen slutter som trener eller foreldrekontakt.

**Alle andre (forespørsel, godkjennes av daglig leder)**
1. Forespørselen fylles ut i skjemaet på nettsiden og sendes på e-post til daglig leder via tjenesten FormSubmit.
2. **Første gang** skjemaet brukes, sender FormSubmit en e-post til iselin@ak28.no med en lenke som må trykkes for å aktivere skjemaet.
3. Daglig leder sjekker kalenderen, svarer leietakeren på e-post, og legger godkjente utleier inn i kalenderen (f.eks. «Utleie – bursdag»).
4. Faktura sendes som før.

Skal forespørslene til en annen e-post, bytt adressen i `action="https://formsubmit.co/…"` i `klubbhuset.html` (og aktiver på nytt).

## Publisering med GitHub Pages

1. Gå til **Settings → Pages** i repoet.
2. Under *Build and deployment* velger du **Deploy from a branch**, gren `main` og mappe `/ (root)`.
3. Siden blir tilgjengelig på `https://<brukernavn>.github.io/<repo>/`.

### Bruke ak28.no

1. Skriv `ak28.no` under **Custom domain** i Settings → Pages (det lager en `CNAME`-fil).
2. Hos domeneleverandøren: pek `ak28.no` til GitHub Pages sine IP-adresser og `www` til `<brukernavn>.github.io` (se GitHubs veiledning «Managing a custom domain»).
3. Huk av **Enforce HTTPS** når det blir tilgjengelig.

Alle undersidene fra Google Sites er flyttet hit, og gamle adresser (for eksempel `/om-klubben/styret`) sendes automatisk videre til den nye siden.

## Ting som fortsatt må fylles inn

Alt som står i `[klammer]` er plassholdere: treningstider, priser, helgens kamper, sponsorlogoer, svar i «Ofte stilte spørsmål» og datoen for håndballskolen.

## Kampoversikten (kamper.html)

Kampene hentes fra en Excel-eksport av klubbens terminliste i TurneringsAdmin (Klubb → Terminliste → Eksporter til Excel).

1. Eksporter hele sesongen fra TurneringsAdmin.
2. Kjør `python tools/bygg_kamper.py kamper.xlsx`. Det lager `data/kamper.json`.
3. Publiser `data/kamper.json`. **Ikke** legg Excel-filen i repoet – den inneholder navn på dommere og funksjonærer.

`kamper.json` brukes av kampsiden, «Kamper i Odderneshallen denne helgen» på forsiden og kampknappen på hvert lag på lagsiden.
Klassen i serienavnet gjøres om til årskull (f.eks. «Jenter 15» = Jenter 2011 i 2026/27). Ved ny sesong må årstallet i `lag_for()` i skriptet oppdateres.

## Treningstider (treningstider.html)

Alle treningsøkter ligger i `data/treningstider.json` – én rad per økt med dag, tid, hall og lag.
Etter endringer: kjør `python tools/bygg_treningstider.py`, som også oppdaterer treningstidene på lagsiden (`data/lag.json`).
