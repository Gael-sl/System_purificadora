import { useState, useEffect } from 'react';
import api from '../api';
import { Package, Plus, AlertCircle } from 'lucide-react';

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ item: '', stock: '', precio: '', umbral: '' });
  const isGarrafon = (name) => (name || '').toLowerCase().includes('garrafon');

  const load = async () => {
    try {
      const res = await api.get('/inventario');
      setItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/inventario/${editingId}`, {
          ...form,
          stock: Number(form.stock),
          precio: Number(form.precio),
          umbral: Number(form.umbral)
        });
      } else {
        await api.post('/inventario', {
          ...form,
          stock: Number(form.stock),
          precio: Number(form.precio),
          umbral: Number(form.umbral)
        });
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ item: '', stock: '', precio: '', umbral: '' });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      item: item.item || '',
      stock: item.stock ?? '',
      precio: item.precio ?? '',
      umbral: item.umbral ?? ''
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={24} />
              </div>
              {item.stock < item.umbral && (
                <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  <AlertCircle size={14} /> Stock Bajo
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{item.item}</h3>
            <div className="flex items-end justify-between mt-4">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Stock Disponible</p>
                <p className="text-2xl font-bold text-slate-800">{item.stock} <span className="text-sm font-normal text-slate-500">uds</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-medium mb-1">
                  {isGarrafon(item.item) ? 'Precio venta' : 'Costo'}
                </p>
                <p className="text-lg font-bold text-emerald-600">${Number(item.precio || 0).toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => openEdit(item)}
              className="mt-4 w-full text-sm bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium hover:bg-slate-100"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-2xl leading-none pb-1"
              >
                &times;
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                <input required type="text" value={form.item} onChange={e => setForm({...form, item: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad Inicial</label>
                  <input required type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Costo ($)</label>
                  <input required type="number" step="0.01" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Umbral de Stock Bajo</label>
                <input required type="number" value={form.umbral} onChange={e => setForm({...form, umbral: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
