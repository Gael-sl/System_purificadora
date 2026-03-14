import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Pedidos from './pages/Pedidos';
import Rutas from './pages/Rutas';
import Clientes from './pages/Clientes';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Gastos from './pages/Gastos';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={() => { setUser(null); localStorage.removeItem('user'); localStorage.removeItem('token'); }}>
        <Routes>
          <Route path="/" element={user.rol === 'admin' ? <Dashboard /> : <Navigate to="/pedidos" />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/rutas" element={<Rutas />} />
          {user.rol === 'admin' && (
            <>
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/gastos" element={<Gastos />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
