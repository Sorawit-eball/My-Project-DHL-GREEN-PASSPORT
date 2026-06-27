
import { ArrowLeft, Search, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom icons
const currentLocIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #00aaff; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const dhlIcon = L.divIcon({
  className: 'dhl-marker',
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background-color: #ffcc00; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid white;">
    <span style="color: #d40511; font-weight: 900; font-style: italic; font-size: 11px; font-family: sans-serif; transform: rotate(45deg);">DHL</span>
  </div>`,
  iconSize: [36, 40],
  iconAnchor: [18, 40]
});

export default function MapPage() {
  const navigate = useNavigate();
  // Location roughly around Phaya Thai, Bangkok
  const center: [number, number] = [13.766, 100.534]; 

  const dhlLocations: [number, number][] = [
    [13.754, 100.540], // Near Central World
    [13.755, 100.543], // Near Makasan
    [13.770, 100.530],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: '#ffcc00', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1000, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowLeft size={24} cursor="pointer" onClick={() => navigate(-1)} />
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>จุดรับพัสดุ DHL</h2>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Search size={20} color="#d40511" />
          <input 
            type="text" 
            placeholder="ค้นหาจุดรับพัสดุ..." 
            defaultValue="33 ซอย วัดมะกอก, พญาไท, กรุงเทพมหานคร,"
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: '#333' }}
          />
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={center} icon={currentLocIcon}>
            <Popup>คุณอยู่ที่นี่</Popup>
          </Marker>
          
          {dhlLocations.map((pos, idx) => (
            <Marker key={idx} position={pos} icon={dhlIcon}>
              <Popup>DHL Service Point</Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* GPS Button */}
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: '#fff', width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 1000, cursor: 'pointer' }}>
          <Crosshair size={28} color="#000" />
        </div>
      </div>
    </div>
  );
}
