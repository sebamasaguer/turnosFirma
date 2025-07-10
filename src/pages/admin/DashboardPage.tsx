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
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]); // Holds all fetched appointments for stats
  const [displayedAppointments, setDisplayedAppointments] = useState<Appointment[]>([]); // Holds filtered/searched appointments for table
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Default sort: by appointment_date ascending.
  const [sortBy, setSortBy] = useState<'appointment_date' | 'created_at' | 'user_name' | 'status'>('appointment_date');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');


  // Fetch initial data
  useEffect(() => {
    if (user && isAdmin) {
      loadAppointments();
    }
  }, [user, isAdmin]); // Runs when auth state is confirmed

  // Re-fetch or re-filter data when filter, searchTerm, sortBy, or sortOrder changes
  useEffect(() => {
    if (user && isAdmin) {
      // If backend handles search/filter, call loadAppointments. Otherwise, filter client-side.
      // For now, let's assume backend handles status filter and sorting, client handles search.
      loadAppointments();
    }
  }, [statusFilter, sortBy, sortOrder, user, isAdmin]); // Add user and isAdmin here as well

  // Client-side search, applied after fetching/sorting
   useEffect(() => {
    let filtered = [...allAppointments]; // Start with all appointments fetched according to statusFilter, sortBy, sortOrder

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        (apt.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (apt.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (apt.user_dni?.includes(searchTerm) ?? false)
      );
    }
    setDisplayedAppointments(filtered);
  }, [searchTerm, allAppointments]);


  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter === 'all' ? undefined : statusFilter, // 'all' means no status filter for backend
        sortBy: sortBy,
        order: sortOrder,
      };
      const data = await getAppointments(params);
      setAllAppointments(data || []); // Store all fetched (potentially filtered by status and sorted by backend)
      // Search will be applied to this set by the other useEffect
      // Initial display is all fetched data before search term is applied
      // setDisplayedAppointments(data || []); // This will be handled by the search useEffect
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAllAppointments([]);
      setDisplayedAppointments([]);
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

  // Stats should be calculated based on `allAppointments` before client-side search is applied,
  // but after status filter from backend (if statusFilter is not 'all').
  // For simplicity, if backend filters by status, these stats will reflect that.
  // If we need stats on the *absolute* total irrespective of backend status filter,
  // we'd need another fetch or adjust backend. Assuming current `allAppointments` is fine for stats.
  const stats = {
    total: allAppointments.length, // This reflects count after statusFilter (if not 'all') and sorting from backend
    pending: allAppointments.filter(apt => apt.status === 'pending').length,
    confirmed: allAppointments.filter(apt => apt.status === 'confirmed').length,
    cancelled: allAppointments.filter(apt => apt.status === 'cancelled').length,
  };

  // Helper for table header sorting indicators
  const SortIndicator = ({ column }: { column: typeof sortBy }) => {
    if (sortBy === column) {
      return sortOrder === 'ASC' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    }
    return null;
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    // Data fetching is triggered by useEffect watching sortBy and sortOrder
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
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((statusVal) => (
                <button
                  key={statusVal}
                  onClick={() => setStatusFilter(statusVal)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === statusVal
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {statusVal === 'all' ? 'Todos' : getStatusText(statusVal)}
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
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('user_name')}
                  >
                    Cliente <SortIndicator column="user_name" />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contacto</th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('appointment_date')}
                  >
                    Fecha <SortIndicator column="appointment_date" />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Hora</th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Estado <SortIndicator column="status" />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedAppointments.map((appointment) => (
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
          
          {displayedAppointments.length === 0 && (
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