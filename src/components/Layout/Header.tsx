import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileSignature, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FileSignature className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">
              Firma Digital Salta
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-gray-700'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/informacion"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/informacion') ? 'text-primary' : 'text-gray-700'
              }`}
            >
              Información
            </Link>
            <Link
              to="/turnos"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/turnos') ? 'text-primary' : 'text-gray-700'
              }`}
            >
              Reservar Turno
            </Link>
            {user && isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/admin') ? 'text-primary' : 'text-gray-700'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}