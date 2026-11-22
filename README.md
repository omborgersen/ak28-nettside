# AK28 – nettside

Nettsiden til Atletklubben av 1928 (AK28), håndball i Kristiansand.
Ren HTML, CSS og JavaScript – ingen byggesteg. Publiseres gratis med GitHub Pages.

## Innhold

| Fil | Hva |
| --- | --- |
| `index.html` | Forsiden |
| `lag.html` | Lagsiden med filter, kamper og tabell |
| `ny-i-ak28.html` | Informasjon til nye medlemmer |
| `data/lag.json` | Laglisten (navn, alder, trenere, treningstider, bilde, lenke til handball.no) |
| `assets/css/style.css` | All styling. Klubbfargene står øverst i filen |
| `assets/js/main.js` | Mobilmeny og nedtelling til cupen |
| `assets/js/lag.js` | Viser lagene fra `data/lag.json` |
| `assets/img/` | Logo og bilder |

## Vanlige endringer

- **Legge til eller endre et lag:** Rediger `data/lag.json`. Lagbildet legges i `assets/img/` og filnavnet skrives i `"bilde"`.
- **Endre starttid for cup-nedtellingen:** Finn `data-start` i `index.html` (format `2027-04-23T17:00:00+02:00`).
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

Gjør dette først når undersidene som fortsatt ligger på Google Sites (Trygg på trening, Klubbhuset, Odderneshallen, Om klubben, Sponsorer, Bli medlem, Cup 2027) er flyttet hit – ellers slutter lenkene til dem å virke.

## Ting som fortsatt må fylles inn

Alt som står i `[klammer]` er plassholdere: treningstider, priser, helgens kamper, sponsorlogoer, svar i «Ofte stilte spørsmål» og datoen for håndballskolen.
