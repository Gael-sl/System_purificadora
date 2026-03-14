const fs = require('fs');
const path = require('path');

function fixFile(file) {
  let p = fs.readFileSync(file, 'utf8');
  p = p.replace(/ðŸ“Œ/g,'📌');
  p = p.replace(/direcciÃ³n/g,'dirección');
  p = p.replace(/recepciÃ³n/g,'recepción');
  if(file.includes('Pedidos.jsx')) {
    p = p.replace(/\{pedidos\.map/g, '{[...pedidos].sort((a,b)=>b.id-a.id).map');
  }
  fs.writeFileSync(file, p, 'utf8');
  console.log('Fixed', file);
}

fixFile(path.join(__dirname, 'frontend/src/pages/Pedidos.jsx'));
fixFile(path.join(__dirname, 'frontend/src/pages/Rutas.jsx'));
