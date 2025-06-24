import React from 'react';
import { FileSignature, Shield, Clock, Users, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export function InformationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Información sobre Firma Digital
          </h1>
          <p className="text-xl text-primary-100">
            Todo lo que necesitas saber sobre los certificados de firma digital en Salta
          </p>
        </div>
      </section>

      {/* What is Digital Signature */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Qué es la Firma Digital?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                La firma digital es un mecanismo criptográfico que permite identificar 
                al emisor de un mensaje digital y garantizar que el contenido no ha sido 
                modificado desde su envío.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                En Argentina, la firma digital tiene la misma validez legal que la firma 
                manuscrita según la Ley de Firma Digital N° 25.506, siendo reconocida 
                por todos los organismos públicos y privados del país.
              </p>
              <div className="flex items-center space-x-2 text-accent">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Máxima seguridad jurídica garantizada</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <FileSignature className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Certificado Digital
              </h3>
              <p className="text-gray-600">
                Un archivo electrónico que contiene datos de identificación del titular 
                validados por una Autoridad Certificante licenciada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Beneficios de la Firma Digital
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ahorro de Tiempo
              </h3>
              <p className="text-gray-600">
                Elimina traslados, colas y horarios de oficina. Firma desde cualquier lugar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Máxima Seguridad
              </h3>
              <p className="text-gray-600">
                Tecnología criptográfica que garantiza autenticidad e integridad.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Validez Legal
              </h3>
              <p className="text-gray-600">
                Misma validez que la firma manuscrita según ley nacional 25.506.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-accent-light/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent-light-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reconocimiento Universal
              </h3>
              <p className="text-gray-600">
                Aceptada por todos los organismos públicos y empresas privadas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Trazabilidad
              </h3>
              <p className="text-gray-600">
                Registro completo de fecha, hora y datos del firmante.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Repudio
              </h3>
              <p className="text-gray-600">
                Imposible negar la autoría de un documento firmado digitalmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Requisitos para Obtener tu Certificado
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Documentación Necesaria
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">DNI Argentino Vigente</p>
                    <p className="text-gray-600">Original y fotocopia. Debe estar en condiciones legibles.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Comprobante de Domicilio</p>
                    <p className="text-gray-600">Factura de servicios con antigüedad no mayor a 3 meses.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">CUIT/CUIL</p>
                    <p className="text-gray-600">Constancia de CUIT/CUIL emitida por AFIP.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Email Válido</p>
                    <p className="text-gray-600">Dirección de correo electrónico activa para notificaciones.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Importante</h4>
                  <ul className="text-blue-800 space-y-1">
                    <li>• La presencia del titular es obligatoria para el proceso de validación</li>
                    <li>• Los turnos son únicamente martes y jueves de 9:00 a 13:00 hs</li>
                    <li>• Llegue 15 minutos antes de su turno asignado</li>
                    <li>• El proceso de emisión del certificado toma aproximadamente 30 minutos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Framework */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Marco Legal
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Normativa Vigente
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Ley Nacional N° 25.506 - Ley de Firma Digital
                  </h4>
                  <p className="text-gray-600">
                    Establece la validez jurídica de la firma digital y regula su uso en todo el territorio nacional.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Decreto 724/2006
                  </h4>
                  <p className="text-gray-600">
                    Reglamenta la Ley de Firma Digital y establece los procedimientos técnicos y administrativos.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Resolución Provincial
                  </h4>
                  <p className="text-gray-600">
                    La Provincia de Salta adhiere al sistema nacional de firma digital y reconoce su validez 
                    para todos los trámites provinciales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}