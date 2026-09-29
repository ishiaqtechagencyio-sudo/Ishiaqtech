#!/bin/sh
# Bundle index.html + style.css + app.js into one shareable file: cascade.html
cd "$(dirname "$0")"
python3 - <<'PY'
h=open('index.html').read()
h=h.replace('<link rel="stylesheet" href="style.css">','<style>'+open('style.css').read()+'</style>')
h=h.replace('<script src="config.js"></script>','<script>'+open('config.js').read()+'</script>')
h=h.replace('<script src="app.js"></script>','<script>'+open('app.js').read().replace('</script>','<\\/script>')+'</script>')
open('cascade.html','w').write(h)
PY
