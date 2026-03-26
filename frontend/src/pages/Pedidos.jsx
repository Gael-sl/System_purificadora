import { useState, useEffect } from 'react';
import api from '../api';
import { Package, CheckCircle, Clock, Truck, Plus, XCircle, Trash2 } from 'lucide-react';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isFastOrder, setIsFastOrder] = useState(false);
  const [form, setForm] = useState({ cliente_id: '', cantidad: '', notas: '', telefono: '', fastName: '', fastAddress: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [cancelId, setCancelId] = useState(null);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/pedidos?zona=gabriel'),
        api.get('/clientes?zona=gabriel')
      ]);
      setPedidos(pRes.data);
      setClientes(cRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const cambiarEstado = async (id, estado) => {
    try {
      await api.post(`/pedidos/${id}/state`, { estado });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const cancelarPedido = (id) => setCancelId(id);

  const confirmCancel = async () => {
    if(!cancelId) return;
    try {
      await api.post(`/pedidos/${cancelId}/state`, { estado: 'cancelado' });
      setCancelId(null);
      load();
    } catch (e) {
      console.error("Error al cancelar pedido", e);
    }
  };

  const confirmDelete = async () => {
    if(!deleteId) return;
    try {
      await api.delete(`/pedidos/${deleteId}`);
      setDeleteId(null);
      load();
    } catch (e) {
      console.error("Error al eliminar pedido", e);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      let finalNotas = form.notas;
      let finalClienteId = form.cliente_id;
      
      if (isFastOrder) {
        finalClienteId = '';
        const baseNota = `📌 Pedido Eventual: ${form.fastName} - Dir: ${form.fastAddress}`;
        finalNotas = finalNotas ? `${baseNota} | ${finalNotas}` : baseNota;
      }

      const notasConTel = finalNotas
        ? `${finalNotas} | Tel entrega: ${form.telefono}`
        : `Tel entrega: ${form.telefono}`;

      await api.post('/pedidos', {
        cliente_id: finalClienteId ? Number(finalClienteId) : null,
        cantidad: Number(form.cantidad),
        notas: notasConTel,
        total: Number(form.cantidad) * 18 // Precio por garrafon
      });
      setShowModal(false);
      setForm({ cliente_id: '', cantidad: '', notas: '', telefono: '', fastName: '', fastAddress: '' });
      setIsFastOrder(false);
    } catch (error) {
      console.error(error);
      alert('Error al guardar el pedido eventual.');
    }
  };

  const getCliente = (id, notas = '') => {
    if (!id) {
      // Extraer datos de las notas para pedidos eventuales si es posible
      const notaStr = notas || '';
      const isEventual = notaStr.includes('📌 Pedido Eventual:');
      if (isEventual) {
        const parts = notaStr.split('|')[0].replace('📌 Pedido Eventual:', '').split('- Dir:');
        const nombre = parts[0]?.trim() || "Cliente Eventual";
        const direccion = parts[1]?.trim() || "Ver detalles en notas";
        return { nombre: `📌 ${nombre}`, direccion };
      }
      return { nombre: "Cliente Eventual", direccion: notaStr || 'Sin dirección registrada' };
    }
    return clientes.find(c => c.id === id) || { nombre: "Cliente Desconocido", direccion: "Sin dirección" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Nuevo Pedido
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="lg:hidden p-4 space-y-3">
          {[...pedidos].sort((a,b)=>b.id-a.id).map(p => {
            const c = getCliente(p.cliente_id, p.notas);
            return (
              <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-slate-800">#{p.id}</div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    p.estado === 'pendiente' ? 'bg-slate-100 text-slate-600' :
                    p.estado === 'en_ruta' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {p.estado === 'pendiente' && <Clock size={12} />}
                    {p.estado === 'en_ruta' && <Truck size={12} />}
                    {p.estado === 'entregado' && <CheckCircle size={12} />}
                    {p.estado.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-800">{c.nombre}</div>
                <div className="text-xs text-slate-500 mb-3">{c.direccion}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">Cant.: <span className="font-semibold">{p.cantidad}</span></div>
                  <div className="flex items-center gap-2">
                    {p.estado === 'pendiente' && (
                      <button onClick={() => cambiarEstado(p.id, 'en_ruta')} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">
                        Enviar
                      </button>
                    )}
                    {(p.estado === 'pendiente' || p.estado === 'en_ruta') && (
                      <button onClick={() => cancelarPedido(p.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100">
                        Cancelar
                      </button>
                    )}
                    {p.estado === 'en_ruta' && (
                      <button onClick={() => cambiarEstado(p.id, 'entregado')} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100">
                        Entregado
                      </button>
                    )}
                    {p.estado === 'cancelado' && (
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50" title="Eliminar Pedido" >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <table className="w-full text-left border-collapse hidden lg:table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">ID</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Cliente</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Cant.</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Estado</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Acción</th>
            </tr>
          </thead>
          <tbody>
            {[...pedidos].sort((a,b)=>b.id-a.id).map(p => {
              const c = getCliente(p.cliente_id, p.notas);
              return (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-600">#{p.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{c.nombre}</div>
                    <div className="text-xs text-slate-500">{c.direccion}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-800">{p.cantidad}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      p.estado === 'pendiente' ? 'bg-slate-100 text-slate-600' :
                      p.estado === 'en_ruta' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {p.estado === 'pendiente' && <Clock size={12} />}
                      {p.estado === 'en_ruta' && <Truck size={12} />}
                      {p.estado === 'entregado' && <CheckCircle size={12} />}
                      {p.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                        {p.estado === 'pendiente' && (
                          <button onClick={() => cambiarEstado(p.id, 'en_ruta')} className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">
                            Enviar
                          </button>
                        )}
                        {(p.estado === 'pendiente' || p.estado === 'en_ruta') && (
                          <button onClick={() => cancelarPedido(p.id)} className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100">
                            Cancelar
                          </button>
                        )}
                        {p.estado === 'en_ruta' && (
                          <button onClick={() => cambiarEstado(p.id, 'entregado')} className="text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100">
                            Entregado
                          </button>
                        )}
                        {p.estado === 'cancelado' && (
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50" title="Eliminar Pedido" >
                            <Trash2 size={18} />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Nuevo Pedido</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-2xl leading-none pb-1"
              >
                &times;
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center space-x-2 cursor-pointer bg-amber-50 p-3 rounded-xl border border-amber-100 w-full hover:bg-amber-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFastOrder}
                    onChange={(e) => {
                      setIsFastOrder(e.target.checked);
                      if (e.target.checked) setForm({ ...form, cliente_id: '' });
                    }}
                    className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-amber-800">📌 Pedido Eventual (Escribir datos sin registrar)</span>
                </label>
              </div>

              {!isFastOrder ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <select required={!isFastOrder} value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-xl border border-amber-200 bg-white shadow-sm">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Cliente</label>
                    <input required={isFastOrder} value={form.fastName} onChange={e => setForm({...form, fastName: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none bg-white" placeholder="Ej. Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Exacta</label>
                    <input required={isFastOrder} value={form.fastAddress} onChange={e => setForm({...form, fastAddress: e.target.value})} type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none bg-white" placeholder="Ej. Calle 123 col. Centro" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad (Garrafones)</label>
                <input required type="number" min="1" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono de entrega</label>
                <input required type="tel" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas (Opcional)</label>
                <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" rows="3"></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelId && (
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

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar Pedido?</h3>
            <p className="text-slate-500 mb-6">Esta acción borrará el pedido permanentemente del registro.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)} 
                className="flex-1 px-4 py-2 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                No, conservar
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 px-4 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
