import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Perbaikan icon default Leaflet yang sering tidak muncul di React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Pemantauan() {
  // Data dummy koordinat (bisa kamu ganti dengan data dari Supabase nanti)
  const [locations] = useState([
    {
      id: 1,
      name: "Universitas Hasanuddin",
      lat: -5.1377585,
      lng: 119.4886592,
      type: "Kampus",
    },
    {
      id: 2,
      name: "Armada DT-01",
      lat: -5.155,
      lng: 119.445,
      type: "Kendaraan",
    },
    { id: 3, name: "Proyek A", lat: -5.1333, lng: 119.4125, type: "Project" },
  ]);

  return (
    <div className="h-screen w-full relative">
      {/* Overlay Header agar tetap terlihat di atas peta */}
      <div className="absolute top-4 left-14 z-[1000] bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <h1 className="font-bold text-gray-800 text-lg">
          Pemantauan Lokasi GPS Kendaraan
        </h1>
      </div>

      <MapContainer
        center={[-5.1476, 119.4327]} // Koordinat tengah (Makassar)
        zoom={13}
        zoomControl={false}
        className="h-full w-full"
      >
        {/* Pilih Style Peta: OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <ZoomControl position="bottomright" />

        {/* Menampilkan semua simbol/marker */}
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold border-b mb-1">{loc.name}</h3>
                <p className="text-xs text-gray-600">Kategori: {loc.type}</p>
                <button className="mt-2 text-[10px] bg-blue-600 text-white px-2 py-1 rounded">
                  Detail Lokasi
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend / Info Panel */}
      <div className="absolute bottom-10 left-4 z-[1000] bg-white p-4 rounded-xl shadow-lg w-64 border border-gray-100">
        <h4 className="text-sm font-bold mb-2">Status Lokasi</h4>
        <div className="space-y-2">
          <div className="flex items-center text-xs">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span>{locations.length} Titik Terpantau</span>
          </div>
          <div className="text-[10px] text-gray-400">
            Terakhir diperbarui: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
