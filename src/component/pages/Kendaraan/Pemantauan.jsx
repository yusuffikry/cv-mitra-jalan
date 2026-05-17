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
import { supabase } from "../../../supabaseClient";
let DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

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
  const [isTracking, setIsTracking] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [carsList, setCarsList] = useState([]);
  const [selectedCar, setSelectedCar] = useState("");
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("no_gps, jenis_unit, nomor_plat")
          .not("no_gps", "is", null);

        if (error) throw error;
        setCarsList(data);
      } catch (error) {
        console.error("Gagal mengambil data armada:", error.message);
      }
    };

    fetchCars();
  }, []);
  useEffect(() => {
    let channel = null;

    const fetchLastLocation = async () => {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("latitude, longitude")
          .eq("no_gps", selectedCar)
          .maybeSingle();
        if (error) throw error;
        if (data && data.latitude && data.longitude) {
          setMyLocation({
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
          });
        } else {
          setMyLocation(null);
        }
      } catch (err) {
        console.error("Lokasi awal tidak ditemukan:", err.message);
      }
    };

    if (isTracking && selectedCar) {
      fetchLastLocation();
      channel = supabase
        .channel(`track-car-${selectedCar}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "cars",
            filter: `no_gps=eq.${selectedCar}`,
          },
          (payload) => {
            console.log(
              "Ada perubahan lokasi baru secara real-time:",
              payload.new,
            );
            if (payload.new.latitude && payload.new.longitude) {
              setMyLocation({
                lat: parseFloat(payload.new.latitude),
                lng: parseFloat(payload.new.longitude),
              });
            }
          },
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isTracking, selectedCar]);

  const handleCarChange = (e) => {
    const gpsNumber = e.target.value;
    setSelectedCar(gpsNumber);

    if (gpsNumber) {
      setIsTracking(true);
    } else {
      setIsTracking(false);
      setMyLocation(null);
    }
  };

  const activeCarInfo = carsList.find((car) => car.no_gps === selectedCar);

  return (
    <div className="h-screen w-full relative font-sans">
      {/* Floating Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-xl shadow-lg w-80 border border-gray-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Pilih Armada Kendaraan
        </label>
        <select
          value={selectedCar}
          onChange={handleCarChange}
          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        >
          <option value="">-- Berhenti Melacak --</option>
          {carsList.map((car, index) => (
            <option key={index} value={car.no_gps}>
              {car.jenis_unit} - {car.nomor_plat}
            </option>
          ))}
        </select>

        {isTracking && selectedCar && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 p-2 rounded-md animate-pulse">
            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
            Melacak No. GPS Real-time: {selectedCar}
          </div>
        )}
      </div>

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
                <div className="text-center p-1">
                  <p className="font-bold text-blue-600 text-sm">
                    📍{" "}
                    {activeCarInfo ? activeCarInfo.jenis_unit : "Unit Terpilih"}
                  </p>
                  <p className="text-xs font-semibold text-gray-700">
                    {activeCarInfo ? activeCarInfo.nomor_plat : ""}
                  </p>
                  <span className="inline-block mt-1 text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-500">
                    GPS: {selectedCar}
                  </span>
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
