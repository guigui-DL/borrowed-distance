from pathlib import Path
p=Path(__file__).resolve().parent
engine=(p/'three.module.js').read_text()
start=engine.rfind('export { ')
exports=engine[start+9:engine.rfind(' };')].strip()
parts=[]
for x in exports.split(','):
    x=x.strip()
    if ' as ' in x:
        a,b=x.split(' as ');parts.append(f'{b}:{a}')
    else:parts.append(x)
engine='const THREE = (()=>{\n'+engine[:start]+'\nreturn {'+','.join(parts)+'};\n})();'
shell=(p/'shell.html').read_text()
html=shell.replace('/* ENGINE */',engine).replace('/* GAME */',(p/'game.js').read_text().replace('/* EXPANSION */',(p/'expansion.js').read_text()).replace('/* GUIDANCE */',(p/'guidance.js').read_text()).replace('/* PRACTICE */',(p/'practice.js').read_text()).replace('/* ART */',(p/'art.js').read_text()).replace('/* MONOCHROME */',(p/'monochrome.js').read_text()).replace('/* CAMPAIGN */',(p/'campaign.js').read_text()))
(p.parent/'dist').mkdir(exist_ok=True)
(p.parent/'dist'/'index.html').write_text(html)
(p.parent/'index.html').write_text(html)
print(f'Built {len(html.encode()):,} bytes; all scripts inline.')
