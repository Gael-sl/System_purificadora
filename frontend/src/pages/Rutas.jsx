import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';
import L from 'leaflet';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Rutas() {
  const [user, setUser] = useState(null);
  const [ruta, setRuta] = useState([]);
  const [geometry, setGeometry] = useState([]);
  const [missingCoords, setMissingCoords] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [base, setBase] = useState({ lat: 25.6638889, lng: -108.638333, label: 'Base', address: '' });
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [watchId, setWatchId] = useState(null);

  const baseIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconSize: [26, 42],
    iconAnchor: [13, 42],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    className: 'base-marker'
  });

  const pedidoIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  });

  const carIcon = L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;background:#0ea5e9;border:3px solid #ffffff;border-radius:9999px;box-shadow:0 0 0 2px rgba(14,165,233,0.35);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const RecenterOnPosition = ({ pos, active }) => {
    const map = useMap();
    useEffect(() => {
      if (active && pos) {
        const zoom = Math.max(map.getZoom(), 15);
        map.flyTo([pos.lat, pos.lng], zoom, { animate: true, duration: 0.5 });
      }
    }, [active, pos, map]);
    return null;
  };

  const load = async () => {
    try {
      const baseRes = await api.get('/base');
      if (baseRes.data?.lat && baseRes.data?.lng) {
        setBase({
          lat: baseRes.data.lat,
          lng: baseRes.data.lng,
          label: baseRes.data.label || 'Base',
          address: baseRes.data.address || ''
        });
      }

      const [pRes, cRes] = await Promise.all([
        api.get('/pedidos?zona=gabriel'),
        api.get('/clientes')
      ]);
      
      const pendientes = pRes.data.filter(p => p.estado !== 'entregado');
      
      const parsedItems = pendientes.map(p => {
        let c = cRes.data.find(x => x.id === p.cliente_id);
        if (!c) {
          const notas = p.notas || '';
          if (notas.includes('📌 Pedido Eventual:')) {
            const parts = notas.split('|')[0].replace('📌 Pedido Eventual:', '').split('- Dir:');
            c = { nombre: `📌 ${parts[0]?.trim() || 'Cliente Eventual'}`, direccion: parts[1]?.trim() || 'Ver notas' };
          } else {
            c = { nombre: 'Cliente Eventual', direccion: notas || 'Sin dirección' };
          }
        }
        return { id: p.id, lat: c?.lat, lng: c?.lng, cliente: c, cantidad: p.cantidad };
      });

      const itemsMap = parsedItems.filter(i => i.lat && i.lng);
      const plainItemsNoMap = parsedItems.filter(i => (!i.lat || !i.lng) && !i.cliente?.nombre.includes('📌'));
      const eventualItems = parsedItems.filter(i => i.cliente?.nombre.includes('📌'));

      setMissingCoords(plainItemsNoMap.length);
      setClientes(cRes.data);

      if (itemsMap.length > 0) {
        const optRes = await api.post('/rutas/optimize', { items: itemsMap });
        setRuta([...(optRes.data.route || itemsMap), ...eventualItems, ...plainItemsNoMap]);
        const geoCoords = optRes.data.geometry || [];
        // geometry is GeoJSON lon/lat, convert to lat/lng pairs
        const latLngGeometry = geoCoords.map(([lng, lat]) => [lat, lng]);
        setGeometry(latLngGeometry);
      } else {
        setRuta([...eventualItems, ...plainItemsNoMap]);
        setGeometry([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation?.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalizacion no disponible en este dispositivo.');
      return;
    }
    setGeoError('');
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setGeoError(err.message || 'No se pudo obtener ubicacion.');
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    setWatchId(id);
    setTracking(true);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation?.clearWatch(watchId);
    }
    setWatchId(null);
    setTracking(false);
  };

  const positions = geometry.length > 1
    ? geometry
    : [[base.lat, base.lng], ...ruta.filter(p => p.lat && p.lng).map(p => [p.lat, p.lng])];

  const baseResLabel = (b) => b.address ? b.address : 'Base';

  return (
    <div className="h-full flex flex-col pt-4 lg:pt-0">
      <div className="flex justify-between items-center px-4 lg:px-0 mb-2 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Rutas de Entrega</h1>
        {user?.rol === 'repartidor' && (
          <div className="flex items-center gap-3">
            {geoError && <span className="text-xs text-amber-700">{geoError}</span>}
            {!tracking ? (
              <button onClick={startTracking} className="text-sm text-white bg-emerald-600 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700">
                Iniciar recorrido
              </button>
            ) : (
              <button onClick={stopTracking} className="text-sm text-white bg-rose-600 px-3 py-1.5 rounded-lg font-medium hover:bg-rose-700">
                Detener
              </button>
            )}
          </div>
        )}
      </div>

      <div className="hidden lg:grid grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-0">
          <MapContainer center={[base.lat, base.lng]} key={`${base.lat}-${base.lng}-desktop`} zoom={14} style={{ height: '100%', width: '100%' }}>
            <RecenterOnPosition pos={position} active={tracking} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            />
            <Marker position={[base.lat, base.lng]} icon={baseIcon}>
              <Popup>{base.label} · {baseResLabel(base)}</Popup>
            </Marker>
            {position && (
              <Marker position={[position.lat, position.lng]} icon={carIcon}>
                <Popup>Repartidor en ruta</Popup>
              </Marker>
            )}
            {ruta.filter(p => p.lat && p.lng).map((p, i) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={pedidoIcon}>
                <Popup>{i + 1}. {p.cliente?.nombre} · {p.cantidad || 0} garrafones</Popup>
              </Marker>
            ))}
            {positions.length > 1 && <Polyline positions={positions} color="#2563eb" weight={4} opacity={0.7} />}
          </MapContainer>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="font-semibold text-slate-800">Ruta Sugerida</h3>
            <button onClick={load} className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">
              Recalcular
            </button>
          </div>

          {missingCoords > 0 && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 shrink-0">
              {missingCoords} pedido(s) sin coordenadas. Revisa la dirección del cliente.
            </div>
          )}
          
          <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
            {ruta.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No hay pedidos pendientes</p>
            ) : (
              ruta.filter(p => (p.lat && p.lng) || p.cliente?.nombre.includes('📌')).map((p, i) => {
                const isEv = p.cliente?.nombre.includes('📌');
                return (
                <div key={p.id} className={`flex items-center gap-4 p-3 rounded-xl border ${isEv ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isEv ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{p.cliente?.nombre}</div>
                    <div className="text-xs text-slate-500">{p.cliente?.direccion}</div>
                    <div className="text-xs text-slate-500">Garrafones: {p.cantidad || 0}</div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden flex flex-col flex-1 relative -mx-4 pb-0 shadow-inner overflow-hidden">
        <div className="relative z-0 flex-1 w-full min-h-[50vh]">
          <MapContainer center={[base.lat, base.lng]} key={`${base.lat}-${base.lng}-mobile`} zoom={14} style={{ height: '100%', width: '100%' }}>
            <RecenterOnPosition pos={position} active={tracking} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            />
            <Marker position={[base.lat, base.lng]} icon={baseIcon}>
              <Popup>{base.label} · {baseResLabel(base)}</Popup>
            </Marker>
            {position && (
              <Marker position={[position.lat, position.lng]} icon={carIcon}>
                <Popup>Repartidor en ruta</Popup>
              </Marker>
            )}
            {ruta.filter(p => p.lat && p.lng).map((p, i) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={pedidoIcon}>
                <Popup>{i + 1}. {p.cliente?.nombre} · {p.cantidad || 0} garrafones</Popup>
              </Marker>
            ))}
            {positions.length > 1 && <Polyline positions={positions} color="#2563eb" weight={4} opacity={0.7} />}
          </MapContainer>
        </div>

        <div className="bg-white px-4 pt-3 pb-2 flex flex-col shrink-0 h-[170px] z-10 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] rounded-t-xl relative border-t border-slate-200">
          <div className="flex justify-center mb-1 shrink-0">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
          </div>
          <div className="flex items-center justify-between mb-2 shrink-0">
            <h3 className="font-semibold text-slate-800">Ruta sugerida</h3>
            <button onClick={load} className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">
              Recalcular
            </button>
          </div>

          {missingCoords > 0 && (
            <div className="mb-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2 shrink-0">
              {missingCoords} pedido(s) sin coordenadas.
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {ruta.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-2">No hay pedidos pendientes</p>
            ) : (
              <div className="space-y-2">
                {ruta.filter(p => (p.lat && p.lng) || p.cliente?.nombre.includes('📌')).map((p, i) => {
                    const isEv = p.cliente?.nombre.includes('📌');
                    return (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isEv ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isEv ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm leading-tight">{p.cliente?.nombre}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.cliente?.direccion}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Garrafones: <span className="font-semibold">{p.cantidad || 0}</span></div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
