import React from 'react';
import { X, MapPin, ExternalLink, Droplets, User } from 'lucide-react';

const ServiceModal = ({ service, onClose }) => {
  if (!service) return null;

  const { properties, geometry, type: serviceType } = service;
  const lat = geometry.coordinates[1];
  const lng = geometry.coordinates[0];

  const title = serviceType === 'fountain' ? 'Fuente de Agua' : 'Aseo Público';
  const name = properties.DIRECCION || properties.NOMBRE || 'Sin nombre';
  const district = properties.DISTRITO || 'Desconocido';
  const description = properties.DESC_CLASI || properties.OBSERVACIONES || '';

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="relative h-32 bg-blue-600 flex items-center justify-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="bg-white p-4 rounded-full shadow-lg">
            {serviceType === 'fountain' ? (
              <Droplets className="text-blue-600" size={32} />
            ) : (
              <User className="text-blue-600" size={32} />
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
              serviceType === 'fountain' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            }`}>
              {title}
            </span>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <div className="flex items-center text-gray-500 mt-1">
              <MapPin size={14} className="mr-1" />
              <span className="text-sm">{district}</span>
            </div>
          </div>

          {description && (
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {description}
            </p>
          )}

          <button
            onClick={openInMaps}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
          >
            <ExternalLink size={18} />
            Cómo llegar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
