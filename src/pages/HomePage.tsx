import React from 'react';
import { Link } from 'react-router-dom';
import { FileSignature, Calendar, Shield, Users, Clock, CheckCircle } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Firma Digital
              <span className="block text-secondary">Provincia de Salta</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Sistema oficial para la obtención de certificados de firma digital. 
              Reserva tu turno de manera fácil y segura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/turnos"
                className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Reservar Turno</span>
              </Link>
              <Link
                to="/informacion"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-white/20"
              >
                Más Información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir la Firma Digital?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La firma digital es la evolución tecnológica que garantiza la autenticidad, 
              integridad y validez legal de tus documentos electrónicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Máxima Seguridad
              </h3>
              <p className="text-gray-600">
                Certificados digitales con validez legal equivalente a la firma manuscrita, 
                respaldados por tecnología de criptografía avanzada.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ahorro de Tiempo
              </h3>
              <p className="text-gray-600">
                Firma documentos desde cualquier lugar, elimina traslados innecesarios 
                y agiliza todos tus trámites oficiales.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Validez Legal
              </h3>
              <p className="text-gray-600">
                Reconocida por ley nacional y provincial, válida para todos los 
                organismos públicos y privados de Argentina.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proceso Simple en 3 Pasos
            </h2>
            <p className="text-xl text-gray-600">
              Obtén tu firma digital de manera rápida y sencilla
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reserva tu Turno
              </h3>
              <p className="text-gray-600">
                Selecciona día y horario disponible. Los turnos son martes y jueves 
                de 9:00 a 13:00 hs.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Asiste con tu Documentación
              </h3>
              <p className="text-gray-600">
                Presenta tu DNI vigente y completa el proceso de validación 
                de identidad presencial.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Recibe tu Certificado
              </h3>
              <p className="text-gray-600">
                Obtén tu certificado digital y comienza a firmar documentos 
                con validez legal inmediata.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para obtener tu Firma Digital?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a miles de salteños que ya utilizan la firma digital 
            para agilizar sus trámites oficiales.
          </p>
          <Link
            to="/turnos"
            className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center space-x-2"
          >
            <Calendar className="h-5 w-5" />
            <span>Reservar mi Turno Ahora</span>
          </Link>
        </div>
      </section>
    </div>
  );
}