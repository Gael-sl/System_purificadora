import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Wallet, DollarSign, TrendingUp } from 'lucide-react';

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ concepto: '', categoria: 'insumos', monto: '' });

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Number(value || 0));

  const load = async () => {
    try {
      const [resGastos, resVentas] = await Promise.all([
        api.get('/gastos'),
        api.get('/pedidos')
      ]);
      setGastos(resGastos.data);
      setVentas(resVentas.data.filter(v => v.estado === 'entregado'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gastos', {
        ...form,
        monto: Number(form.monto)
      });
      setShowModal(false);
      setForm({ concepto: '', categoria: 'insumos', monto: '' });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const totalGastos = gastos.reduce((acc, current) => acc + current.monto, 0);
  const precioGarrafon = 18;
  const totalVentas = ventas.reduce((acc, current) => acc + Number(current.cantidad || 0) * precioGarrafon, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Gastos</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Nuevo Gasto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium mb-1">Gastos Totales</p>
          <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(totalGastos)}</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium mb-1">Utilidad Neta</p>
          <h3 className={`text-3xl font-bold ${totalVentas - totalGastos < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatCurrency(totalVentas - totalGastos)}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex items-center gap-2 text-slate-700">
          <Wallet size={18} />
          <h3 className="font-bold">Historial de Gastos</h3>
        </div>
        
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Concepto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gastos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No hay gastos registrados</td>
                </tr>
              ) : (
                gastos.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{g.concepto}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{g.categoria}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(g.creado).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-rose-600">{formatCurrency(g.monto)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {gastos.length === 0 ? (
            <p className="p-6 text-center text-slate-500 text-sm">No hay gastos registrados</p>
          ) : (
            gastos.map(g => (
              <div key={g.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800 mb-1">{g.concepto}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="capitalize bg-slate-100 px-2 py-0.5 rounded-md">{g.categoria}</span>
                    <span>{new Date(g.creado).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg shrink-0">
                  {formatCurrency(g.monto)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Nuevo Gasto</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Concepto</label>
                <input required type="text" value={form.concepto} onChange={e => setForm({...form, concepto: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="insumos">Insumos</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="transporte">Transporte</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto (MXN)</label>
                <input required type="number" step="0.01" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
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
