"use client";

import { useState } from "react";
import { MapContainer, Marker, useMapEvents } from "react-leaflet";
import { FitUnitedStates, focusIcon, roundCoordinate, ThemedTiles, US_BOUNDS, ZOOM_SNAP } from "@/components/maps/map-base";

export type Coordinates = { latitude: number; longitude: number };

function ClickToPlace({ onChange }: { onChange: (value: Coordinates) => void }) {
  useMapEvents({
    click: (event) =>
      onChange({ latitude: roundCoordinate(event.latlng.lat), longitude: roundCoordinate(event.latlng.lng) }),
  });
  return null;
}

/** Click anywhere to drop the pin; drag it to fine-tune. */
export default function LocationPickerMap({
  value,
  onChange,
}: {
  value: Coordinates | null;
  onChange: (value: Coordinates) => void;
}) {
  // The view is only set on mount: the saved pin up close, otherwise the whole US.
  const [initialValue] = useState(value);
  return (
    <MapContainer
      {...(initialValue
        ? { center: [initialValue.latitude, initialValue.longitude] as [number, number], zoom: 15 }
        : { bounds: US_BOUNDS })}
      minZoom={3}
      zoomSnap={ZOOM_SNAP}
      // Zoom with the buttons, double-click or pinch, so scrolling the form never gets stuck here.
      scrollWheelZoom={false}
      className="size-full cursor-crosshair"
    >
      <ThemedTiles />
      {!initialValue && <FitUnitedStates />}
      <ClickToPlace onChange={onChange} />
      {value && (
        <Marker
          position={[value.latitude, value.longitude]}
          icon={focusIcon}
          draggable
          title="Property location (drag to move)"
          alt="Property location"
          eventHandlers={{
            dragend: (event) => {
              const { lat, lng } = event.target.getLatLng();
              onChange({ latitude: roundCoordinate(lat), longitude: roundCoordinate(lng) });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
