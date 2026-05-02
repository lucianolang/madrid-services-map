import React from 'react';
import { LocateFixed } from 'lucide-react';
import { useMap } from 'react-leaflet';

const LocateButton = () => {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className="absolute bottom-24 right-6 z-[1000]">
      <button
        onClick={handleLocate}
        className="bg-white p-4 rounded-full shadow-2xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 text-blue-600"
        title="Mi ubicación"
      >
        <LocateFixed size={20} />
      </button>
    </div>
  );
};

export default LocateButton;
