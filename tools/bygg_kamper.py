"""Lager data/kamper.json fra en Excel-eksport av klubbens terminliste i TurneringsAdmin.

Bruk:  python tools/bygg_kamper.py kamper.xlsx

Eksporten fra TurneringsAdmin inneholder også navn på dommere og funksjonærer.
Disse tas IKKE med – bare dato, tid, lag, resultat, hall og serie havner på nettsiden.
Ikke legg selve Excel-filen i repoet (den er offentlig).
"""
import datetime as dt
import json
import os
import re
import sys

import openpyxl

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AK = re.compile(r'^\s*AK ?28\b', re.I)


def lag_for(serie):
    """Finner hvilke lag på lagsiden kampen hører til, ut fra serienavnet.
    Klassen i håndball er alderen spillerne fyller i 2026 (J15 = født 2011)."""
    s = serie.lower()
    if '2. divisjon menn' in s:
        return ['msr'], 'Menn senior'
    if '4. divisjon menn' in s:
        return ['m4'], 'Menn 4. div'
    if '4. divisjon kvinner' in s or 'nm senior kvinner' in s:
        return ['ks2'], 'Kvinner senior'
    m = re.match(r'(gutter|jenter|blandet)\s+(\d+)', s)
    if m:
        kjonn, alder = m.group(1), int(m.group(2))
        aar = 2026 - alder
        if kjonn == 'blandet':
            return [f'g{aar}', f'j{aar}'], f'Blandet {aar}'
        return [f'{kjonn[0]}{aar}'], f'{"Gutter" if kjonn == "gutter" else "Jenter"} {aar}'
    return [], serie


def rens(s):
    s = re.sub(r'\s+', ' ', str(s or '')).strip()
    return re.sub(r'^AK 28\b', 'AK28', s)


def main(fil):
    ws = openpyxl.load_workbook(fil, read_only=True, data_only=True).worksheets[0]
    rader = ws.iter_rows(values_only=True)
    hode = [str(h or '').strip() for h in next(rader)]
    kamper = []
    for r in rader:
        d = dict(zip(hode, r))
        hj, bo = str(d.get('Hjemmelag') or ''), str(d.get('Bortelag') or '')
        if not (AK.match(hj) or AK.match(bo)):
            continue  # kamper AK28 bare arrangerer
        dato = d.get('Dato')
        if isinstance(dato, dt.datetime):
            dato = dato.date()
        elif isinstance(dato, str):
            dato = dt.datetime.strptime(dato.strip()[:10], '%d.%m.%Y').date()
        if not dato:
            continue
        serie = re.sub(r'\s+', ' ', str(d.get('Turnering') or '')).strip()
        lag, klasse = lag_for(serie)
        h, b = d.get('H'), d.get('B')
        kamper.append({
            'dato': dato.isoformat(),
            'tid': str(d.get('Tid') or '').strip()[:5],
            'hjemme': rens(hj),
            'borte': rens(bo),
            'resultat': f'{h}–{b}' if h is not None and b is not None else '',
            'hall': re.sub(r'\s+', ' ', str(d.get('Bane') or '')).strip(),
            'serie': serie,
            'klasse': klasse,
            'lag': lag,
            'hjemmekamp': bool(AK.match(hj)),
        })
    kamper.sort(key=lambda k: (k['dato'], k['tid']))
    ut = {'oppdatert': dt.date.today().isoformat(), 'kilde': 'TurneringsAdmin', 'kamper': kamper}
    with open(os.path.join(ROT, 'data', 'kamper.json'), 'w', encoding='utf-8') as f:
        json.dump(ut, f, ensure_ascii=False, indent=1)
    print(f'{len(kamper)} AK28-kamper fra {kamper[0]["dato"]} til {kamper[-1]["dato"]}.')
    uten = sorted({k['serie'] for k in kamper if not k['lag']})
    if uten:
        print('Fant ikke lag for:', uten)


if __name__ == '__main__':
    main(sys.argv[1])
