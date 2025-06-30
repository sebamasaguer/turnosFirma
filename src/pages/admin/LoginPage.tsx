import React, { useState } from 'react';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // const [loading, setLoading] = useState(false); // Local loading state, AuthContext also has one
  // const [loginSuccess, setLoginSuccess] = useState(false); // No longer needed, rely on user from AuthContext
  const { user, signIn, loading: authLoading } = useAuth(); // Use loading from AuthContext

  // If user is already logged in (e.g. token found and validated by AuthContext), redirect to dashboard
  if (user) {
    // return <DashboardPage />; // This was causing a direct render, better to navigate
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // setLoading(true); // Use authLoading from context

    try {
      await signIn(email, password); // signIn now updates user in AuthContext
      // setLoginSuccess(true); // No longer needed, user state in AuthContext will trigger re-render/redirect
      // Navigation will happen due to the `if (user)` check above after context updates
    } catch (err: any) {
      // The signIn function in AuthContext should throw an error that we can catch here.
      // It might be a generic error or a specific one from the API.
      setError(err.message || 'Credenciales inválidas. Por favor verifica tu email y contraseña.');
    } finally {
      // setLoading(false); // Managed by AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Acceso Administrativo
          </h2>
          <p className="mt-2 text-gray-600">
            Ingresa tus credenciales para acceder al panel de administración
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="admin@firmadigitalsalta.gob.ar"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            ¿Problemas para acceder?{' '}
            <a href="mailto:soporte@firmadigitalsalta.gob.ar" className="text-primary hover:underline">
              Contactar soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}