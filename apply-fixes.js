const fs = require('fs');
const path = require('path');

function fixPedidos() {
  const file = path.join(__dirname, 'frontend/src/pages/Pedidos.jsx');
  let p = fs.readFileSync(file, 'utf8');

  // Add cancelId state
  if (!p.includes('const [cancelId, setCancelId]')) {
    p = p.replace('const [deleteId, setDeleteId] = useState(null);', 'const [deleteId, setDeleteId] = useState(null);\n  const [cancelId, setCancelId] = useState(null);');
  }

  // Replace cancelarPedido
  p = p.replace(
    /const cancelarPedido = async \(id\) => \{[\s\S]*?console\.error\("Error al cancelar pedido", e\);\s*\}\s*\};/,
    `const cancelarPedido = (id) => setCancelId(id);\n\n  const confirmCancel = async () => {\n    if(!cancelId) return;\n    try {\n      await api.post(\`/pedidos/\${cancelId}/state\`, { estado: 'cancelado' });\n      setCancelId(null);\n      load();\n    } catch (e) {\n      console.error("Error al cancelar pedido", e);\n    }\n  };`
  );

  const deleteModalStr = `{deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Eliminar pedido</h3>
            <p className="text-slate-600 mb-6">¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Mantener</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}`;

  const cancelModalStr = `{cancelId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <XCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Cancelar pedido</h3>
            <p className="text-slate-600 mb-6">¿Seguro que deseas cancelar este pedido?</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">No</button>
              <button onClick={confirmCancel} className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700">Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}`;

  if (!p.includes('{cancelId && (')) {
    p = p.replace(deleteModalStr, cancelModalStr + '\n\n      ' + deleteModalStr);
  }

  // Backup replacement if the literal string above doesn't match perfectly
  if (!p.includes('cancelId &&')) {
    p = p.replace(/\{deleteId && \([\s\S]*?\}\)\}/, match => cancelModalStr + '\n\n      ' + match);
  }

  fs.writeFileSync(file, p, 'utf8');
}

function fixRutas() {
  const file = path.join(__dirname, 'frontend/src/pages/Rutas.jsx');
  let r = fs.readFileSync(file, 'utf8');

  // Fix: filter missing coords to exclude Eventuals
  r = r.replace(
      /const itemsNoMap = parsedItems\.filter\(i => !i\.lat \|\| !i\.lng\);/,
      `const plainItemsNoMap = parsedItems.filter(i => (!i.lat || !i.lng) && !i.cliente?.nombre.includes('📌'));\n      const eventualItems = parsedItems.filter(i => i.cliente?.nombre.includes('📌'));`
  );
  r = r.replace(/setMissingCoords\(itemsNoMap\.length\);/, `setMissingCoords(plainItemsNoMap.length);`);
  r = r.replace(/setRuta\(\[\.\.\.\(optRes\.data\.route \|\| itemsMap\), \.\.\.itemsNoMap\]\);/, `setRuta([...(optRes.data.route || itemsMap), ...eventualItems, ...plainItemsNoMap]);`);
  r = r.replace(/setRuta\(itemsNoMap\);/, `setRuta([...eventualItems, ...plainItemsNoMap]);`);

  // Fix desktop rendering of list
  r = r.replace(
    /ruta\.filter\(p => p\.lat && p\.lng\)\.map\(\(p, i\) => \(\s*<div key=\{p\.id\} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">\s*<div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">/g,
    `ruta.filter(p => (p.lat && p.lng) || p.cliente?.nombre.includes('📌')).map((p, i) => {
                const isEv = p.cliente?.nombre.includes('📌');
                return (
                <div key={p.id} className={\`flex items-center gap-4 p-3 rounded-xl border \${isEv ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}\`}>
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 \${isEv ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}\`}>`
  );

  // Fix mobile rendering of list
  r = r.replace(
    /ruta\.filter\(p => p\.lat && p\.lng\)\.map\(\(p, i\) => \(\s*<div key=\{p\.id\} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">\s*<div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">/g,
    `ruta.filter(p => (p.lat && p.lng) || p.cliente?.nombre.includes('📌')).map((p, i) => {
                    const isEv = p.cliente?.nombre.includes('📌');
                    return (
                    <div key={p.id} className={\`flex items-center gap-3 p-3 rounded-xl border \${isEv ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}\`}>
                      <div className={\`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 \${isEv ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}\`}>`
  );

  // Close the open brackets from mapping functions
  r = r.replace(/<\/div>\s*\)\)\s*\)/g, '</div>\n                );\n              })\n            )');

  fs.writeFileSync(file, r, 'utf8');
}

fixPedidos();
fixRutas();
console.log("Done");