"""Fjerner .html fra interne lenker i alle sidene, så adressene blir f.eks. ak28.no/klubbhuset.
GitHub Pages svarer på både /klubbhuset og /klubbhuset.html, så gamle lenker virker fortsatt.
Kjøres etter build.py og bygg_nyheter.py (også automatisk i GitHub-jobben)."""
import glob, os, re
ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MØNSTER = re.compile(r'href="([a-z0-9][a-z0-9-]*)\.html((?:[?#][^"]*)?)"')

def rens(m):
    navn, rest = m.group(1), m.group(2)
    return f'href="{"/" if navn == "index" else navn}{rest}"'

endret = 0
for fil in glob.glob(os.path.join(ROT, '*.html')):
    s = open(fil, encoding='utf-8').read()
    ny = MØNSTER.sub(rens, s)
    if ny != s:
        open(fil, 'w', encoding='utf-8').write(ny)
        endret += 1
print(f'Rensket lenker i {endret} sider.')
