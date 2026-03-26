import { useState } from 'react';
import { X, Lock, Key, Check, AlertCircle } from 'lucide-react';
import api from '../api';

export default function AdminSettingsModal({ onClose, user }) {
  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'recovery'
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [recoveryForm, setRecoveryForm] = useState({
    newKey: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/auth/change-password', {
        username: user.username, // Asumiendo que el objeto user tiene username
        rol: user.rol,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña. Verifica tu contraseña actual.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryKeyChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/auth/admin/update-key', {
        newKey: recoveryForm.newKey
      });
      setMessage({ type: 'success', text: 'Clave de recuperación actualizada correctamente' });
      setRecoveryForm({ newKey: '' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al actualizar la clave de recuperación' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Configuración de Administrador</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Contraseña
          </button>
          <button
            onClick={() => { setActiveTab('recovery'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'recovery' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Clave de Recuperación
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          {activeTab === 'password' ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ingrese su contraseña actual"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ingrese nueva contraseña"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Confirme nueva contraseña"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Procesando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecoveryKeyChange} className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm mb-4">
                Esta clave se utiliza para restablecer contraseñas olvidadas. Manténgala segura.
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Clave de Recuperación</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={recoveryForm.newKey}
                    onChange={(e) => setRecoveryForm({ ...recoveryForm, newKey: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ingrese nueva clave"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Procesando...' : 'Actualizar Clave'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}