import { useState } from 'react';
import api from '../api';
import BrandMark from '../components/BrandMark';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('admin');
  const [error, setError] = useState('');
  const [showChange, setShowChange] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [message, setMessage] = useState('');
  const [changeForm, setChangeForm] = useState({
    username: 'admin',
    rol: 'admin',
    currentPassword: '',
    newPassword: ''
  });
  const [resetForm, setResetForm] = useState({
    username: 'admin',
    rol: 'admin',
    resetKey: '',
    newPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password, rol });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.history.replaceState(null, '', '/');
      onLogin(res.data.user);
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/auth/change-password', changeForm);
      setMessage('Contrasena actualizada.');
      setShowChange(false);
      setChangeForm({ ...changeForm, currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessage('No se pudo cambiar la contrasena.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/auth/reset-password', resetForm);
      setMessage('Contrasena restablecida.');
      setShowReset(false);
      setResetForm({ ...resetForm, resetKey: '', newPassword: '' });
    } catch (err) {
      setMessage('No se pudo restablecer la contrasena.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <BrandMark size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 brand-title">Purificadora Diamante</h1>
            <p className="text-sm text-slate-500">Sistema de Gestion</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
            <select 
              value={rol}
              onChange={e => setRol(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="admin">Administrador</option>
              <option value="repartidor">Usuario</option>
            </select>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-emerald-600 text-sm">{message}</p>}
          
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md hover:shadow-lg mt-2"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={() => setShowChange(true)} className="text-blue-600 hover:underline">Cambiar contrasena</button>
          <button onClick={() => setShowReset(true)} className="text-slate-500 hover:underline">Olvide mi contrasena</button>
        </div>
      </div>

      {showChange && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Cambiar contrasena</h3>
              <button onClick={() => setShowChange(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                <input required type="text" value={changeForm.username} onChange={e => setChangeForm({...changeForm, username: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select value={changeForm.rol} onChange={e => setChangeForm({...changeForm, rol: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="admin">Administrador</option>
                  <option value="repartidor">Usuario</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contrasena actual</label>
                <input required type="password" value={changeForm.currentPassword} onChange={e => setChangeForm({...changeForm, currentPassword: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contrasena</label>
                <input required type="password" value={changeForm.newPassword} onChange={e => setChangeForm({...changeForm, newPassword: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowChange(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Restablecer contrasena</h3>
              <button onClick={() => setShowReset(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                <input required type="text" value={resetForm.username} onChange={e => setResetForm({...resetForm, username: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select value={resetForm.rol} onChange={e => setResetForm({...resetForm, rol: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="admin">Administrador</option>
                  <option value="repartidor">Usuario</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Clave de reseteo</label>
                <input required type="password" value={resetForm.resetKey} onChange={e => setResetForm({...resetForm, resetKey: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contrasena</label>
                <input required type="password" value={resetForm.newPassword} onChange={e => setResetForm({...resetForm, newPassword: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowReset(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
