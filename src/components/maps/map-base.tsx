"use client";

// Leaflet touches `window` on import, so this module (and every map that uses
// it) is only ever loaded through next/dynamic with `ssr: false`.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { TileLayer, useMap } from "react-leaflet";

/** The lower 48 states, for the default view. */
export const US_BOUNDS: L.LatLngBoundsExpression = [
  [24.4, -125],
  [49.4, -66.9],
];

/** Quarter zoom steps, so a wide, short map can fit the US snugly. */
export const ZOOM_SNAP = 0.25;

/**
 * Re-fits the US once the map has its final size (it can mount before the
 * layout settles, which leaves it zoomed to the wrong area).
 */
export function FitUnitedStates() {
  const map = useMap();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(US_BOUNDS);
    });
    return () => cancelAnimationFrame(frame);
  }, [map]);
  return null;
}

const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * OpenStreetMap tiles (no API key; CARTO's basemaps now require one). They're
 * toned to the site theme with CSS filters on the tile layer (globals.css):
 * muted on ivory, inverted to a dark map in dark mode.
 */
export function ThemedTiles() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <TileLayer
      // className is only read on creation, so re-mount when the theme flips.
      key={dark ? "dark" : "light"}
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution={ATTRIBUTION}
      maxZoom={19}
      className={dark ? "rn-tiles rn-tiles-dark" : "rn-tiles"}
    />
  );
}

/** Small ink dot with a champagne ring (styled in globals.css). */
export const pinIcon = L.divIcon({
  className: "rn-pin",
  html: "<span></span>",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

/** The larger red teardrop for "this property" and the landlord's pin. */
export const focusIcon = L.divIcon({
  className: "rn-pin-focus",
  html: '<svg viewBox="0 0 32 44" aria-hidden="true"><path d="M16 1C7.7 1 1 7.6 1 15.8 1 27 16 43 16 43s15-16 15-27.2C31 7.6 24.3 1 16 1Z"/><circle cx="16" cy="16" r="5.5"/></svg>',
  iconSize: [32, 44],
  iconAnchor: [16, 43],
  popupAnchor: [0, -40],
});

export const roundCoordinate = (value: number) => Math.round(value * 1e6) / 1e6;
