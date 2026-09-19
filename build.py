"""Собирает один самодостаточный HTML из index.html + css + js.
Запуск: python3 tools/build.py  →  dist/moy-shkaf.html"""
import pathlib,re
root=pathlib.Path(__file__).resolve().parent.parent
html=(root/"index.html").read_text(encoding="utf-8")
css=(root/"css/app.css").read_text(encoding="utf-8")
html=html.replace('<link rel="stylesheet" href="css/app.css">',"<style>\n"+css+"\n</style>")
for f in ["js/data.js","js/app.js"]:
    js=(root/f).read_text(encoding="utf-8")
    html=html.replace(f'<script src="{f}"></script>',"<script>\n"+js+"\n</script>")
(root/"dist").mkdir(exist_ok=True)
(root/"dist/moy-shkaf.html").write_text(html,encoding="utf-8")
print("dist/moy-shkaf.html",len(html)//1024,"KB")
