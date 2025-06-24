import React from 'react';
import { MapPin, Phone, Mail, FileSignature } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileSignature className="h-6 w-6" />
              <span className="text-lg font-bold">Firma Digital Salta</span>
            </div>
            <p className="text-primary-100 mb-4">
              Sistema oficial de turnos para firma digital en la Provincia de Salta, Argentina.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-primary-100">
                <MapPin className="h-4 w-4" />
                <span>Salta, Argentina</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-100">
                <Phone className="h-4 w-4" />
                <span>+54 387 XXX-XXXX</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-100">
                <Mail className="h-4 w-4" />
                <span>info@firmadigitalsalta.gob.ar</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Horarios de Atención</h3>
            <div className="space-y-2 text-primary-100">
              <p><strong>Martes y Jueves</strong></p>
              <p>9:00 AM - 1:00 PM</p>
              <p className="text-sm mt-2">
                Los turnos deben reservarse con anticipación a través de este sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-8 text-center">
          <p className="text-primary-200">
            © 2024 Gobierno de la Provincia de Salta. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}