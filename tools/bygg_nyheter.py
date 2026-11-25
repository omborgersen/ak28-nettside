"""Bygger nyhetssidene til AK28 fra filene i innhold/nyheter/.

Kjøres automatisk av GitHub Actions når noen publiserer i Pages CMS.
Kan også kjøres lokalt:  python tools/bygg_nyheter.py

Lager:
  - nyheter.html                (oversikt over alle saker)
  - nyhet-<filnavn>.html        (én side per sak)
  - kortene under «Siste nytt» i index.html (mellom NYHETER-START og NYHETER-SLUTT)
"""
import datetime as dt
import glob
import html
import os
import re
import sys

import markdown
import yaml

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INNHOLD = os.path.join(ROT, 'innhold', 'nyheter')
ANTALL_PA_FORSIDEN = 6
MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli',
           'august', 'september', 'oktober', 'november', 'desember']


def les(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def skriv(p, tekst):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(tekst)


def esc(s):
    return html.escape(str(s or ''), quote=True)


def norsk_dato(d):
    return f'{d.day}. {MANEDER[d.month - 1]} {d.year}' if d else ''


def bildesti(verdi):
    """Gjør bildestien relativ til nettstedets rot, uansett hvordan CMS-et lagret den."""
    if not verdi:
        return ''
    v = str(verdi).strip()
    if v.startswith('http'):
        return v
    i = v.find('assets/')
    return v[i:] if i >= 0 else v.lstrip('/')


def les_saker():
    saker = []
    for fil in sorted(glob.glob(os.path.join(INNHOLD, '*.md'))):
        tekst = les(fil)
        m = re.match(r'^---\s*\n(.*?)\n---\s*\n?(.*)$', tekst, re.S)
        meta, kropp = (yaml.safe_load(m.group(1)) or {}, m.group(2)) if m else ({}, tekst)
        if meta.get('publisert') is False:
            continue
        dato = meta.get('dato')
        if isinstance(dato, str):
            try:
                dato = dt.date.fromisoformat(dato[:10])
            except ValueError:
                dato = None
        elif isinstance(dato, dt.datetime):
            dato = dato.date()
        slug = os.path.splitext(os.path.basename(fil))[0]
        slug = re.sub(r'[^a-z0-9-]+', '-', slug.lower()).strip('-')
        saker.append({
            'slug': slug,
            'tittel': meta.get('tittel') or slug,
            'dato': dato,
            'kategori': meta.get('kategori') or '',
            'bilde': bildesti(meta.get('bilde')),
            'bildetekst': meta.get('bildetekst') or '',
            'ingress': meta.get('ingress') or '',
            'fremhevet': bool(meta.get('fremhevet')),
            'html': markdown.markdown(kropp.strip(), extensions=['extra', 'sane_lists']),
            'fil': os.path.basename(fil),
        })
    # Nyeste først. Saker uten dato havner sist, i filnavn-rekkefølge.
    saker.sort(key=lambda s: (s['dato'] is None, -(s['dato'].toordinal() if s['dato'] else 0), s['fil']))
    return saker


def ramme(tittel, beskrivelse, bilde, aktiv):
    """Henter topp og bunn (meny og bunntekst) fra om-klubben.html, så alle sider ser like ut."""
    mal = les(os.path.join(ROT, 'om-klubben.html'))
    topp = mal[:mal.index('<main id="innhold">')]
    bunn = mal[mal.index('</main>') + len('</main>'):]
    topp = re.sub(r'<title>.*?</title>', f'<title>{esc(tittel)}</title>', topp, flags=re.S)
    topp = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(beskrivelse)}">', topp)
    topp = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{esc(tittel)}">', topp)
    topp = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{esc(beskrivelse)}">', topp)
    if bilde:
        topp = re.sub(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{esc(bilde)}">', topp)
    topp = topp.replace(' aria-current="page"', '')
    if aktiv:
        for h in (aktiv, aktiv[:-5] if aktiv.endswith('.html') else aktiv):
            topp = topp.replace(f'<a href="{h}">', f'<a href="{h}" aria-current="page">', 1)
    return topp, bunn


def kort(s, stor=False):
    bilde = (f'<img src="{esc(s["bilde"])}" alt="{esc(s["bildetekst"] or s["tittel"])}" loading="lazy">'
             if s['bilde'] else '<div class="placeholder">AK28</div>')
    dato = f'<time datetime="{s["dato"].isoformat()}">{norsk_dato(s["dato"])}</time>' if s['dato'] else ''
    meta = ' · '.join(x for x in [esc(s['kategori']), dato] if x)
    return (f'<article class="card news{" featured" if stor else ""}">'
            f'<a class="news-link" href="nyhet-{s["slug"]}.html">{bilde}'
            f'<div class="news-body"><span class="eyebrow">{meta}</span>'
            f'<h3>{esc(s["tittel"])}</h3>'
            f'<p>{esc(s["ingress"])}</p>'
            f'<span class="link-strong">Les saken →</span></div></a></article>')


def bygg():
    saker = les_saker()

    # 1) Én side per sak
    for f in glob.glob(os.path.join(ROT, 'nyhet-*.html')):
        os.remove(f)
    for s in saker:
        topp, bunn = ramme(f'{s["tittel"]} – AK28', s['ingress'] or s['tittel'], s['bilde'], 'nyheter.html')
        dato = f'<time datetime="{s["dato"].isoformat()}">{norsk_dato(s["dato"])}</time>' if s['dato'] else ''
        meta = ' · '.join(x for x in [esc(s['kategori']), dato] if x)
        figur = ''
        if s['bilde']:
            figur = (f'<figure class="article-figure"><img src="{esc(s["bilde"])}" alt="{esc(s["bildetekst"] or s["tittel"])}">'
                     + (f'<figcaption>{esc(s["bildetekst"])}</figcaption>' if s['bildetekst'] else '') + '</figure>')
        side = f'''<main id="innhold">

  <section class="on-red page-hero" aria-labelledby="side-tittel">
    <div class="ring" style="right:-140px;top:-120px;width:460px;height:460px"></div>
    <div class="container">
      <nav class="crumbs" aria-label="Du er her"><a href="nyheter.html">Nyheter</a><span aria-hidden="true">/</span><span>{esc(s["kategori"] or "Sak")}</span></nav>
      <h1 id="side-tittel">{esc(s["tittel"])}</h1>
      {f'<p class="article-meta">{meta}</p>' if meta else ''}
    </div>
  </section>

  <div class="container section page-end">
    <article class="article">
      {f'<p class="article-lead">{esc(s["ingress"])}</p>' if s['ingress'] else ''}
      {figur}
      <div class="prose">
{s["html"]}
      </div>
      <p style="margin-top:40px"><a class="btn btn-outline" href="nyheter.html">← Alle nyheter</a></p>
    </article>
  </div>

</main>'''
        skriv(os.path.join(ROT, f'nyhet-{s["slug"]}.html'), topp + side + bunn)

    # 2) Oversiktssiden
    topp, bunn = ramme('Nyheter – AK28', 'Nyheter fra Atletklubben av 1928 – håndball på Lund i Kristiansand.', '', 'nyheter.html')
    liste = '\n'.join(kort(s) for s in saker) or '<p class="muted">Ingen nyheter ennå.</p>'
    side = f'''<main id="innhold">

  <section class="on-red page-hero" aria-labelledby="side-tittel">
    <div class="ring" style="right:-140px;top:-120px;width:460px;height:460px"></div>
    <div class="container">
      <span class="eyebrow">Nyheter</span>
      <h1 id="side-tittel">Siste nytt fra AK28</h1>
      <p>Saker fra lagene, klubbhuset, cupen og alt annet som skjer i klubben.</p>
    </div>
  </section>

  <section class="container section page-end" aria-label="Alle nyheter">
    <div class="news-grid">
{liste}
    </div>
  </section>

</main>'''
    skriv(os.path.join(ROT, 'nyheter.html'), topp + side + bunn)

    # 3) Forsiden: den fremhevede (eller nyeste) saken stort, så de neste
    forside = saker[:ANTALL_PA_FORSIDEN]
    if forside:
        stor = next((s for s in forside if s['fremhevet']), forside[0])
        rest = [s for s in forside if s is not stor]
        blokk = '\n'.join([kort(stor, stor=True)] + [kort(s) for s in rest])
    else:
        blokk = '<p class="muted">Ingen nyheter ennå.</p>'
    index = les(os.path.join(ROT, 'index.html'))
    ny = re.sub(r'(<!-- NYHETER-START -->).*?(<!-- NYHETER-SLUTT -->)',
                lambda m: m.group(1) + '\n' + blokk + '\n' + m.group(2), index, flags=re.S)
    if ny == index and '<!-- NYHETER-START -->' not in index:
        sys.exit('Fant ikke NYHETER-START/NYHETER-SLUTT i index.html')
    skriv(os.path.join(ROT, 'index.html'), ny)
    print(f'Bygget {len(saker)} saker. {len(forside)} vises på forsiden.')


if __name__ == '__main__':
    bygg()
