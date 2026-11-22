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
| `assets/img/` | Logo og bilder |
| `assets/fonts/` | Skriftene (Barlow Condensed og Inter), lagret lokalt |

Menyen og bunnteksten er lik på alle sider. Skal noe der endres, må det endres i hver fil (søk og erstatt).

## Vanlige endringer

- **Legge til eller endre et lag:** Rediger `data/lag.json`. Lagbildet legges i `assets/img/` og filnavnet skrives i `"bilde"`.
- **Endre starttid for cup-nedtellingen:** Finn `data-start` i `index.html` (format `2027-04-23T17:00:00+02:00`).
- **Sponsorlogoer:** Legg logoene i `assets/img/` og bytt plassholderne i `sponsorer.html` og nederst på forsiden.
- **Ny nyhet på forsiden:** Kopier en `<article class="card news">`-blokk i `index.html` og bytt tekst og bilde.
- **Bygge inn Google-kalenderen:** Se kommentaren i kalenderseksjonen i `index.html`.

Endringer kan gjøres direkte på github.com (blyant-ikonet på filen). Siden oppdateres automatisk etter et minutt eller to.

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
