const fs = require('fs');
const file = 'c:/Users/gaela/OneDrive/Documentos/Sistema_Purificadora/frontend/src/pages/Pedidos.jsx';
let p = fs.readFileSync(file, 'utf8');

const cancelModal = `{cancelId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <XCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Cancelar Pedido</h3>
            <p className="text-slate-500 mb-6">¿Seguro que deseas cancelar este pedido?</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)} className="flex-1 px-4 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                No
              </button>
              <button onClick={confirmCancel} className="flex-1 px-4 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId &&`;

if (!p.includes('Cancelar Pedido')) {
  p = p.replace('{deleteId &&', cancelModal);
  fs.writeFileSync(file, p, 'utf8');
}
