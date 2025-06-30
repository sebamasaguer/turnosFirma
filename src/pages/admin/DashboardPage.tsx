import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Users, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAppointments, updateAppointment, Appointment } from '../../lib/apiClient'; // Changed from supabase

// No longer need Database type from supabase if Appointment type from apiClient is sufficient
// type Appointment = Database['public']['Tables']['appointments']['Row'];
// Using Appointment from apiClient

export function DashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // The AuthContext might need to be updated if it relies on Supabase user object directly
    // For now, assuming `user` and `isAdmin` from AuthContext are still valid indicators
    if (user && isAdmin) {
      fetchAppointments();
    }
  }, [user, isAdmin]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments(); // API call
      // The backend already orders by created_at DESC, if different order is needed,
      // backend should support it or sort client-side.
      // For now, assuming the default order from backend is fine or we sort here if necessary.
      // Example client-side sort if backend doesn't sort as required:
      data.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime() || a.appointment_time.localeCompare(b.appointment_time));
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]); // Clear appointments on error or set error state
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      // The API client's updateAppointment might need adjustment if it expects the full object
      // or just the fields to update. Assuming it takes ID and the partial update.
      const updatedApt = await updateAppointment(id, { status: newStatus });
      
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: updatedApt.status } : apt)
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error al actualizar el turno');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = filter === 'all' || apt.status === filter;
    const matchesSearch = 
      (apt.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (apt.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (apt.user_dni?.includes(searchTerm) ?? false);
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando turnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona los turnos de firma digital
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600">Total Turnos</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-gray-600">Pendientes</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                <p className="text-gray-600">Confirmados</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                <p className="text-gray-600">Cancelados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Todos' : getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contacto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Hora</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.user_name}</p>
                        <p className="text-sm text-gray-600">DNI: {appointment.user_dni}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{appointment.user_email}</p>
                        <p className="text-sm text-gray-600">{appointment.user_phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">
                        {format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: es })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(appointment.appointment_date), 'EEEE', { locale: es })}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{appointment.appointment_time}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {appointment.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron turnos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}