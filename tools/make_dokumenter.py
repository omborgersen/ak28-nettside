"""Lager pages/klubbhandbok.html og pages/sportsplan.html fra docs/*.md."""
import re, html, markdown

DOK = [
    ('klubbhandbok', 'Klubbhåndbok',
     'Klubbhåndboka beskriver hvordan vi driver klubben i hverdagen – for styret, trenere, lagledere, foreldrekontakter, spillere og foresatte.',
     ('sportsplan.html', 'Sportsplan', 'Den sportslige røde tråden og treningsinnholdet finner du i sportsplanen.')),
    ('sportsplan', 'Sportsplan',
     'Sportsplanen beskriver den sportslige røde tråden og treningsinnholdet i AK28 – fra barneidrett til senior.',
     ('klubbhandbok.html', 'Klubbhåndbok', 'Praktiske rutiner som kontingent, dugnad, hallfordeling og foreldrekontaktens oppgaver finner du i klubbhåndboka.')),
]

def tabeller(h):
    def en(m):
        t = m.group(0)
        heads = [re.sub('<.*?>', '', x).strip() for x in re.findall(r'<th[^>]*>(.*?)</th>', t, re.S)]
        def rad(r):
            i = iter(heads)
            return re.sub(r'<td([^>]*)>', lambda c: f'<td{c.group(1)} data-label="{html.escape(next(i, ""))}">', r.group(0))
        t = re.sub(r'<tr>.*?</tr>', rad, t, flags=re.S)
        return '<div class="doc-table">' + t + '</div>'
    return re.sub(r'<table>.*?</table>', en, h, flags=re.S)

for slug, tittel, ingress, (lenke, lnavn, ltekst) in DOK:
    md = open(f'docs/{slug}.md', encoding='utf-8').read()
    kropp = markdown.markdown(md, extensions=['extra', 'sane_lists'])
    kropp = tabeller(kropp)
    toc = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', kropp)
    toc_html = '\n'.join(f'          <li><a href="#{i}">{re.sub(r"^\d+\.\s*", "", t)}</a></li>' for i, t in toc)
    side = f'''<main id="innhold">

  <section class="on-red page-hero" aria-labelledby="side-tittel">
    <div class="ring" style="right:-140px;top:-120px;width:460px;height:460px"></div>
    <div class="container">
      <nav class="crumbs" aria-label="Du er her"><a href="om-klubben.html">Om klubben</a><span aria-hidden="true">/</span><span>{tittel}</span></nav>
      <h1 id="side-tittel">{tittel}</h1>
      <p>{ingress}</p>
      <p class="doc-vedtatt">Vedtatt på årsmøtet 23. mars 2026</p>
    </div>
  </section>

  <div class="container section page-end doc-layout">
    <aside class="doc-toc" aria-label="Innhold">
      <nav>
        <span class="eyebrow">Innhold</span>
        <ol>
{toc_html}
        </ol>
        <p class="muted" style="font-size:14px;margin:0 0 12px">Vedtatt på årsmøtet 23. mars 2026.</p>
        <a class="doc-other" href="{lenke}">Les også: {lnavn} →</a>
      </nav>
    </aside>
    <article class="prose doc">
{kropp}
      <div class="card cta-box" style="margin-top:32px">
        <div><h2>{lnavn}</h2><p class="muted">{ltekst}</p></div>
        <a class="btn btn-red" href="{lenke}">Til {lnavn.lower()}</a>
      </div>
    </article>
  </div>

</main>
'''
    open(f'pages/{slug}.html', 'w', encoding='utf-8').write(side)
    print(slug, len(toc), 'kapitler')
