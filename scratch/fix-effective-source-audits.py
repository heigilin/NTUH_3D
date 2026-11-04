from pathlib import Path
for name in ['audit-all-ward-spaces.cjs','check-floor-source-review.cjs']:
 p=Path('scratch')/name;t=p.read_text(encoding='utf-8')
 expr='ctx.window.WardSourceTraces.plans' if name.startswith('audit') else 'WardSourceTraces.plans'
 mark='for(const plan of '+expr+')'
 # Source modules can override the same ward. The final registered definition
 # is the one applied to the displayed room model.
 replacement='for(const plan of [...new Map('+expr+'.map(p=>[[p.building,p.floor,p.ward].join(\"/\"),p])).values()])'
 t=t.replace(mark,replacement);p.write_text(t,encoding='utf-8')
