"use client";

import { useEffect, useId, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CONFIG } from "@/core/constants/game";

type GameMapProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerPosition: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  className?: string;
};

const markerIcon = L.icon(MAP_CONFIG.markerIcon);

export function GameMap({
  latitude,
  longitude,
  zoom = MAP_CONFIG.defaultZoom,
  markerPosition,
  onMapClick,
  className = "",
}: GameMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const instructionsId = useId();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom,
      zoomControl: false,
    });

    L.tileLayer(MAP_CONFIG.tileUrl, {
      attribution: MAP_CONFIG.attribution,
      maxZoom: MAP_CONFIG.maxZoom,
    }).addTo(map);

    L.control.zoom({ position: "bottomright", zoomInTitle: "ขยายแผนที่", zoomOutTitle: "ย่อแผนที่" }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [latitude, longitude, zoom, onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (markerPosition) {
      markerRef.current = L.marker([markerPosition.lat, markerPosition.lng], {
        icon: markerIcon,
        alt: "จุดที่คุณเลือก",
        title: "จุดที่คุณเลือก",
      }).addTo(map);
    }
  }, [markerPosition]);

  function selectCenter() {
    const center = mapRef.current?.getCenter();
    if (center) onMapClick(center.lat, center.lng);
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <p id={instructionsId} className="sr-only">
        ใช้ปุ่มลูกศรเลื่อนแผนที่ ปุ่มบวกหรือลบเพื่อซูม และกด Enter เพื่อปักหมุดตรงกลางแผนที่ หรือใช้ปุ่มปักหมุดกลางแผนที่
      </p>
      <div
        ref={containerRef}
        role="region"
        aria-label="แผนที่เลือกคำตอบ"
        aria-describedby={instructionsId}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && event.key === "Enter") {
            event.preventDefault();
            selectCenter();
          }
        }}
        className="h-full w-full"
      />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-400 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-main px-1 text-sm font-bold text-secondary-light">+</span>
      <button type="button" onClick={selectCenter} className="absolute bottom-6 left-2 z-500 rounded-md border border-surface-border bg-secondary-main px-2 py-2 text-xs font-semibold text-surface-text shadow-lg">
        ปักหมุดกลางแผนที่
      </button>
      <p role="status" className="sr-only">
        {markerPosition ? `เลือกพิกัด ${markerPosition.lat.toFixed(5)}, ${markerPosition.lng.toFixed(5)} แล้ว สามารถส่งคำตอบได้` : "ยังไม่ได้เลือกตำแหน่ง"}
      </p>
    </div>
  );
}
