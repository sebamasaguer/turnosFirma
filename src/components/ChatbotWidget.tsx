import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    // Replace with your actual WhatsApp number
    const phoneNumber = '5493876543210';
    const message = encodeURIComponent('Hola, necesito información sobre turnos para firma digital');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleTelegramClick = () => {
    // Replace with your actual Telegram bot username
    const botUsername = 'firmadigitalsaltabot';
    window.open(`https://t.me/${botUsername}`, '_blank');
  };

  const handleWebhookChat = () => {
    // This would integrate with your n8n webhook
    // For demo purposes, we'll show an alert
    alert('Integración con chatbot n8n - configurar webhook URL');
  };

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-accent hover:bg-accent/90 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Chat Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
          <div className="bg-primary text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Asistente Virtual</h3>
            <p className="text-sm text-primary-100">
              ¿Necesitas ayuda con tu turno?
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            <p className="text-gray-600 text-sm">
              Comunícate con nosotros a través de:
            </p>
            
            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <div className="bg-green-500 text-white p-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-green-700">WhatsApp</p>
                <p className="text-sm text-green-600">Chat directo</p>
              </div>
              <ExternalLink className="h-4 w-4 text-green-600" />
            </button>

            <button
              onClick={handleTelegramClick}
              className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="bg-blue-500 text-white p-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-blue-700">Telegram</p>
                <p className="text-sm text-blue-600">Bot automático</p>
              </div>
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </button>

            <button
              onClick={handleWebhookChat}
              className="w-full flex items-center space-x-3 p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg border border-secondary-200 transition-colors"
            >
              <div className="bg-secondary text-white p-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-secondary-700">Chat Web</p>
                <p className="text-sm text-secondary-600">Asistente online</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
}