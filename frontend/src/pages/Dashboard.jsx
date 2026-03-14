import { useState, useEffect } from 'react';
import api from '../api';
import { DollarSign, Clock, Truck } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ ventas: 0, pendientes: 0, enRuta: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [ventasRes, pedidosRes] = await Promise.all([
          api.get('/ventas'),
          api.get('/pedidos?zona=gabriel')
        ]);
        
        const hoy = new Date().toDateString();
        const entregadosHoy = pedidosRes.data.filter(
          p => p.estado === 'entregado' && new Date(p.actualizado_en || p.creado_en).toDateString() === hoy
        );
        const totalVentas = entregadosHoy.reduce((acc, p) => acc + (Number(p.cantidad || 0) * 18), 0);

        const pendientes = pedidosRes.data.filter(p => p.estado === 'pendiente').length;
        const enRuta = pedidosRes.data.filter(p => p.estado === 'en_ruta').length;

        setStats({ ventas: totalVentas, pendientes, enRuta });
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Ingresos Hoy</h3>
            <p className="text-2xl font-bold text-slate-800">
              ${stats.ventas.toLocaleString('es-MX')}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Pedidos Pendientes</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.pendientes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">En Ruta</h3>
            <p className="text-2xl font-bold text-slate-800">{stats.enRuta}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
