import { useState, useEffect } from 'react';
import api from '../api';
import { Users, Plus, Search, MapPin, Edit2, Trash2 } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '', lat: '', lng: '' });

  const load = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clientes/${editingId}`, form);
        setMessage('Cliente actualizado correctamente');
      } else {
        await api.post('/clientes', form);
        setMessage('Cliente agregado correctamente');
      }
      setTimeout(() => setMessage(''), 3000);
      setShowModal(false);
      setEditingId(null);
      setForm({ nombre: '', telefono: '', direccion: '', lat: '', lng: '' });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      nombre: c.nombre || '',
      telefono: c.telefono || '',
      direccion: c.direccion || '',
      lat: c.lat || '',
      lng: c.lng || ''
    });
    setShowModal(true);
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/clientes/${deleteId}`);
      setMessage('Cliente eliminado correctamente');
      setTimeout(() => setMessage(''), 3000);
      setShowConfirm(false);
      setDeleteId(null);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-3 rounded-xl shadow-sm animate-fade-in flex items-center justify-between">
          <span className="font-medium text-sm">{message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-400 hover:text-emerald-700">&times;</button>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <button onClick={() => {
          setEditingId(null);
          setForm({ nombre: '', telefono: '', direccion: '', lat: '', lng: '' });
          setShowModal(true);
        }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Dirección</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    {c.nombre}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{c.telefono}</td>
                  <td className="px-6 py-4 text-slate-600">{c.direccion}</td>
                  <td className="px-6 py-4">
                    {c.lat && c.lng ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium">
                        <MapPin size={12} /> Mapeado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-xs font-medium">
                        Sin mapa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => openDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {filtered.map(c => (
            <div key={c.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{c.nombre}</h4>
                    {c.telefono && <p className="text-sm text-slate-500">{c.telefono}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => openDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex-1 mr-2">
                  {c.direccion}
                </div>
                <div className="shrink-0 mb-1">
                  {c.lat && c.lng ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-medium border border-emerald-100">
                      <MapPin size={12} /> Map
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-lg text-xs font-medium border border-slate-200">
                      Sin map
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="p-6 text-center text-slate-500 text-sm">No hay clientes registrados</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Nuevo Cliente</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono (Opcional)</label>
                <input type="tel" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entre calles y referencia</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Entre López y Mateos, casa color amarillo"
                  value={form.direccion}
                  onChange={e => setForm({...form, direccion: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitud (Opcional)</label>
                  <input type="number" step="any" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitud (Opcional)</label>
                  <input type="number" step="any" value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar cliente?</h3>
            <p className="text-slate-500 mb-6">Esta acción no se puede deshacer. Los pedidos asociados a este cliente podrian perder su referencia.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
