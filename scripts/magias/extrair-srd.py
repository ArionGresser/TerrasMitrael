"""
Extrai as magias do SRD 5.2.1 (spells.md, em markdown) para um JSON em
inglês, que gerar.py usa junto com a tradução.

Fonte: https://github.com/downfallx/dnd-5e-srd-markdown (spells.md), que
converte o SRD 5.2.1 da Wizards of the Coast, licenciado sob Creative
Commons Attribution 4.0.

Uso:  python3 scripts/magias/extrair-srd.py spells.md srd-5.2.1-magias-en.json
"""
import re,json
import sys
t=open(sys.argv[1] if len(sys.argv)>1 else 'srd-spells.md').read()
start=t.index('## Spell Descriptions')
body=t[start:]
parts=re.split(r'\n#### ',body)[1:]
out=[]
for p in parts:
    lines=p.split('\n')
    name=lines[0].strip()
    rest='\n'.join(lines[1:]).strip()
    m=re.match(r'_(.+?)_\n',rest)
    if not m:
        out[-1]['texto']+='\n\n#### '+name+'\n\n'+rest
        continue
    head=m.group(1)
    rest=rest[m.end():].strip()
    meta={}
    for key in ['Casting Time','Range','Components','Duration']:
        rotulo=key+'?' if key=='Components' else key
        mm=re.search(r'\*\*'+rotulo+r':\*\* (.+)',rest)
        meta[key]=mm.group(1).strip() if mm else None
    sp=re.split(r'\*\*Duration:\*\* .+\n',rest+'\n',1)
    if len(sp)<2:
        out[-1]['texto']+='\n\n#### '+name+'\n\n'+rest
        continue
    desc=sp[1].strip()
    hm=re.match(r'(?:Level (\d) (\w+)|(\w+) Cantrip) \((.+)\)',head)
    if not hm: print('BADHEAD',name,head); continue
    nivel=int(hm.group(1)) if hm.group(1) else 0
    escola=hm.group(2) or hm.group(3)
    classes=[c.strip() for c in hm.group(4).split(',')]
    out.append(dict(name=name,nivel=nivel,escola=escola,classes=classes,tempo=meta['Casting Time'],alcance=meta['Range'],componentes=meta['Components'],duracao=meta['Duration'],texto=desc))
json.dump(out,open(sys.argv[2] if len(sys.argv)>2 else 'srd-spells.json','w'),ensure_ascii=False,indent=1)
print(len(out)); 
import collections
print(collections.Counter(s['nivel'] for s in out))
print(sum(len(s['texto']) for s in out))
