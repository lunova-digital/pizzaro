"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Pin icon using div — no image file required
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;background:#e84c1e;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -26],
});

export interface AddressResult {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface MapPickerProps {
  center: [number, number];
  onLocationSelect: (lat: number, lng: number, address: AddressResult) => void;
}

async function reverseGeocode(lat: number, lng: number): Promise<AddressResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const a = data.address ?? {};
    return {
      street: [a.house_number, a.road].filter(Boolean).join(" ") || a.pedestrian || "",
      city: a.city || a.town || a.village || a.county || "",
      state: a.state || "",
      zipCode: a.postcode || "",
    };
  } catch {
    return { street: "", city: "", state: "", zipCode: "" };
  }
}

// Flies the map to a new center whenever the prop changes
function FlyController({ target }: { target: [number, number] }) {
  const map = useMap();
  const prev = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!prev.current || prev.current[0] !== target[0] || prev.current[1] !== target[1]) {
      map.flyTo(target, 16, { duration: 0.8 });
      prev.current = target;
    }
  }, [target, map]);
  return null;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ center, onLocationSelect }: MapPickerProps) {
  const [markerPos, setMarkerPos] = useState<[number, number]>(center);

  // When center prop changes (e.g. geolocation), move the marker there too
  useEffect(() => {
    setMarkerPos(center);
  }, [center]);

  const handlePlace = useCallback(
    async (lat: number, lng: number) => {
      setMarkerPos([lat, lng]);
      const address = await reverseGeocode(lat, lng);
      onLocationSelect(lat, lng, address);
    },
    [onLocationSelect]
  );

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "260px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyController target={markerPos} />
      <ClickHandler onClick={handlePlace} />
      <Marker
        position={markerPos}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend(e) {
            const { lat, lng } = e.target.getLatLng();
            handlePlace(lat, lng);
          },
        }}
      />
    </MapContainer>
  );
}
