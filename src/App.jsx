import React, { useState } from 'react';
import MapComponent from './components/Map';
import ServiceModal from './components/ServiceModal';
import { Navigation } from 'lucide-react';

function App() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 pointer-events-auto border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Navigation size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Madrid Servicios</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fuentes y Aseos Públicos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Map */}
      <main className="w-full h-full">
        <MapComponent onSelectService={setSelectedService} />
      </main>

      {/* Modal */}
      <ServiceModal 
        service={selectedService} 
        onClose={() => setSelectedService(null)} 
      />

      {/* Quick Legend/Filter (Floating) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <span className="text-sm font-medium text-gray-700">Fuentes</span>
        </div>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="text-sm font-medium text-gray-700">Aseos</span>
        </div>
      </div>
    </div>
  );
}

export default App;
