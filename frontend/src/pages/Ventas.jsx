import { useState, useEffect } from 'react';
import api from '../api';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [total, setTotal] = useState(0);
  const precioGarrafon = 18;
  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Number(value || 0));

  const load = async () => {
    try {
      const pRes = await api.get('/pedidos');
      const entregados = (pRes.data || []).filter(p => p.estado === 'entregado');
      setVentas(entregados);
      setTotal(entregados.reduce((sum, v) => sum + Number(v.cantidad || 0) * precioGarrafon, 0));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Ventas</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={16} />
          <span>Hoy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <DollarSign size={24} />
            </div>
            <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
              <TrendingUp size={14} /> +12%
            </span>
          </div>
          <p className="text-emerald-50 font-medium mb-1">Ingresos Totales</p>
          <h3 className="text-3xl font-bold">{formatCurrency(total)}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-slate-500 font-medium mb-1">Ventas Realizadas</p>
          <h3 className="text-3xl font-bold text-slate-800">{ventas.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Historial de Ventas</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID Venta</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No hay ventas registradas</td>
                </tr>
              ) : (
                ventas.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">#{v.id}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(v.creado || v.creado_en).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-600">Cliente #{v.cliente_id}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(Number(v.cantidad || 0) * precioGarrafon)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {ventas.length === 0 ? (
            <p className="p-6 text-center text-slate-500 text-sm">No hay ventas registradas</p>
          ) : (
            ventas.map(v => (
              <div key={v.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">#{v.id}</span>
                    <span className="text-xs text-slate-500">Cliente #{v.cliente_id}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(v.creado || v.creado_en).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  {formatCurrency(Number(v.cantidad || 0) * precioGarrafon)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
