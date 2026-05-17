import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Komponen untuk otomatis menggerakkan kamera ke lokasi baru
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], map.getZoom());
    }
  }, [coords, map]);
  return null;
}

export default function Pemantauan() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [myLocation, setMyLocation] = useState(null);

  // Ambil data tracking terakhir dari LocalStorage laptop saat pertama kali load
  useEffect(() => {
    const savedData = localStorage.getItem("last_tracking");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setMyLocation(parsed.coords);
      setPhoneNumber(parsed.phone);
    }
  }, []);

  // Logika Tracking Real-time
  useEffect(() => {
    let watchId = null;

    if (isTracking) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newCoords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setMyLocation(newCoords);

            // Simpan data ke LocalStorage laptop
            localStorage.setItem(
              "last_tracking",
              JSON.stringify({
                phone: phoneNumber,
                coords: newCoords,
                timestamp: new Date().toISOString(),
              }),
            );
          },
          (error) => console.error("Error tracking:", error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        );
      } else {
        alert("Browser tidak mendukung GPS");
      }
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, phoneNumber]);

  return (
    <div className="h-screen w-full relative font-sans">
      <MapContainer
        center={myLocation || [-5.1476, 119.4327]}
        zoom={15}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; Google Maps Hybrid"
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        />
        <ZoomControl position="bottomright" />

        {myLocation && (
          <>
            <Marker position={[myLocation.lat, myLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-blue-600">📍 Lokasi HP Aktif</p>
                  <p className="text-xs font-mono">{phoneNumber}</p>
                </div>
              </Popup>
            </Marker>
            <RecenterMap coords={myLocation} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
