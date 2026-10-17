"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GameRoundResult } from "@/core/domain/game";
import { MAP_CONFIG } from "@/core/constants/game";
import { GAME_RESULT_MESSAGES as MESSAGES } from "@/core/constants/game-result";
import styles from "./game-results.module.css";

export function ResultMap({ rounds, showGuesses = true }: { rounds: GameRoundResult[]; showGuesses?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || rounds.length === 0) return;
    const map = L.map(containerRef.current, { zoomControl: false, scrollWheelZoom: false });
    L.tileLayer(MAP_CONFIG.tileUrl, { attribution: MAP_CONFIG.attribution, maxZoom: MAP_CONFIG.maxZoom }).addTo(map);
    L.control.zoom({ position: "bottomright", zoomInTitle: "ขยายแผนที่", zoomOutTitle: "ย่อแผนที่" }).addTo(map);
    const points: L.LatLngTuple[] = [];
    const colors = getComputedStyle(containerRef.current);

    for (const round of rounds) {
      const actual: L.LatLngTuple = [round.location.latitude, round.location.longitude];
      const guess: L.LatLngTuple = [round.guess.latitude, round.guess.longitude];
      points.push(actual);
      const marker = L.marker(actual, {
        icon: L.divIcon({ className: styles.actualMarker, html: String(round.round), iconSize: [36, 36], iconAnchor: [18, 18] }),
        title: `รอบ ${round.round}: ${round.location.name}`,
        alt: `${MESSAGES.actual}: ${round.location.name}`,
      }).addTo(map);
      const tooltip = document.createElement("span");
      tooltip.textContent = round.location.name;
      marker.bindTooltip(tooltip);
      if (showGuesses) {
        points.push(guess);
        L.marker(guess, {
          icon: L.divIcon({ className: styles.guessMarker, html: "●", iconSize: [28, 28], iconAnchor: [14, 14] }),
          title: MESSAGES.guess,
          alt: MESSAGES.guess,
        }).addTo(map);
        L.polyline([actual, guess], { color: colors.getPropertyValue("--color-primary-main").trim(), weight: 3, dashArray: "8 8" }).addTo(map);
      }
    }
    map.fitBounds(points, { padding: [60, 60], maxZoom: 18, animate: false });
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      map.fitBounds(points, { padding: [60, 60], maxZoom: 18, animate: false });
    });
    observer.observe(containerRef.current);
    return () => { observer.disconnect(); map.remove(); };
  }, [rounds, showGuesses]);

  return <div ref={containerRef} role="region" aria-label="แผนที่ผลการทายสถานที่" className="h-full w-full" />;
}
