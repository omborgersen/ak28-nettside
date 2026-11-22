"""Treningstidene ligger i data/treningstider.json (én rad per økt).
Dette skriptet oppdaterer treningsteksten for hvert lag i data/lag.json ut fra den filen,
så tidene bare må endres ett sted.  Bruk:  python tools/bygg_treningstider.py
"""
import json, os
ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DAGER = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

def main():
    t = json.load(open(os.path.join(ROT, 'data', 'treningstider.json'), encoding='utf-8'))
    p = os.path.join(ROT, 'data', 'lag.json')
    lag = json.load(open(p, encoding='utf-8'))
    per = {}
    for o in t['okter']:
        for id in o.get('lag', []):
            per.setdefault(id, []).append(o)
    for l in lag['lag']:
        okter = sorted(per.get(l['id'], []), key=lambda o: (DAGER.index(o['dag']), o['fra']))
        if not okter:
            continue
        # Slå sammen økter med samme dag og tid i flere haller
        grupper = {}
        for o in okter:
            k = (o['dag'], o['fra'], o['til'], bool(o.get('ekstra')))
            grupper.setdefault(k, []).append(o['hall'] + (f" ({o['rom']})" if o.get('rom') else ''))
        deler = [f"{d} {f}–{t}, {' og '.join(h)}" + (' (ekstraøkt)' if e else '')
                 for (d, f, t, e), h in grupper.items()]
        l['trening'] = '. '.join(deler)
    json.dump(lag, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f"{len(t['okter'])} økter. Oppdaterte {len(per)} lag.")

if __name__ == '__main__':
    main()
