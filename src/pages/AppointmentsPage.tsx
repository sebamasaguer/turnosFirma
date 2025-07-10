import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CreditCard } from 'lucide-react';
import { format, addDays, isTuesday, isThursday } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAppointments, createAppointment, Appointment } from '../lib/apiClient';

interface TimeSlot {
import { es } from 'date-fns/locale';

interface TimeSlot {
  time: string;
  available: boolean;
}

export function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'
  ];

  const getAvailableDates = () => {
    const dates = [];
    let currentDate = new Date();
    
    for (let i = 0; i < 60; i++) {
      const date = addDays(currentDate, i);
      if (isTuesday(date) || isThursday(date)) {
        dates.push(date);
      }
    }
    
    return dates.slice(0, 8); // Show next 8 available dates
  };

  const checkAvailableSlots = async (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setAvailableSlots(timeSlots.map(time => ({ time, available: false }))); // Reset and show loading if desired

    try {
      // Fetch only confirmed appointments for the selected date
      const confirmedAppointmentsOnDate = await getAppointments({
        appointment_date: dateString,
        status: 'confirmed', // Fetch only confirmed appointments
      });

      const occupiedTimes = confirmedAppointmentsOnDate.map(apt => apt.appointment_time);

      const slots = timeSlots.map(time => ({
        time,
        available: !occupiedTimes.includes(time)
      }));

      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      // Mark all as unavailable on error, and maybe show a message to the user
      setAvailableSlots(timeSlots.map(time => ({ time, available: false })));
      alert('No se pudieron cargar los horarios disponibles. Intente más tarde.');
    }
  };

  useEffect(() => {
    if (selectedDate) {
      checkAvailableSlots(selectedDate);
      setSelectedTime(''); // Reset selected time when date changes
    } else {
      setAvailableSlots([]); // Clear slots if no date is selected
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona fecha y horario');
      return;
    }

    setLoading(true);

    try {
      await createAppointment({
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
        user_dni: formData.dni,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        // status: 'pending' // Backend should default this or be explicitly set if API requires
      });

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', dni: '' });
      setSelectedDate(null);
      setSelectedTime('');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al reservar el turno. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Turno Reservado!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu turno ha sido reservado exitosamente. Recibirás una confirmación por email.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reservar Otro Turno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Reservar Turno
          </h1>
          <p className="text-xl text-gray-600">
            Selecciona fecha y horario para tu certificado de firma digital
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Date Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Seleccionar Fecha
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getAvailableDates().map((date) => (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="font-semibold">
                      {format(date, 'dd/MM', { locale: es })}
                    </div>
                    <div className="text-sm">
                      {format(date, 'EEEE', { locale: es })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Seleccionar Horario
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        selectedTime === slot.time
                          ? 'bg-primary text-white border-primary'
                          : slot.available
                          ? 'bg-white hover:bg-gray-50 border-gray-200'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                      {!slot.available && (
                        <div className="text-xs mt-1">Ocupado</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="12345678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="+54 387 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTime}
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Reservando...' : 'Confirmar Turno'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}