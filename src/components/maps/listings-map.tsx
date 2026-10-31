"use client";

import "leaflet.markercluster/dist/MarkerCluster.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet.markercluster";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import { FitUnitedStates, focusIcon, pinIcon, ThemedTiles, US_BOUNDS, ZOOM_SNAP } from "@/components/maps/map-base";
import { formatCurrency } from "@/lib/format";
import imageLoader from "@/lib/image-loader";
import { formatLocation } from "@/lib/us-states";
import type { MapProperty } from "@/types";

const FOCUS_ZOOM = 6;

/** Popup body for another listing, built as DOM (Leaflet popups aren't React). */
function popupContent(pin: MapProperty, navigate: (href: string) => void) {
  const href = `/properties/${pin.id}`;
  const root = document.createElement("div");
  root.className = "rn-popup-card";
  if (pin.image) {
    const image = document.createElement("img");
    image.src = imageLoader({ src: pin.image, width: 480, quality: 70 });
    image.alt = "";
    image.loading = "lazy";
    root.append(image);
  }
  const title = document.createElement("p");
  title.className = "rn-popup-title";
  title.textContent = pin.title;
  const meta = document.createElement("p");
  meta.className = "rn-popup-meta";
  meta.textContent = `${formatCurrency(pin.rentAmount)}/mo · ${formatLocation(pin.city, pin.division)}`;
  const link = document.createElement("a");
  link.className = "rn-popup-link";
  link.href = href;
  link.textContent = "View";
  // Client-side navigation instead of a full reload.
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    navigate(href);
  });
  root.append(title, meta, link);
  return root;
}

/** Every other listing as a small pin, grouped into clusters when zoomed out. */
function ClusterLayer({ pins }: { pins: MapProperty[] }) {
  const map = useMap();
  const router = useRouter();

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 48,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          className: "rn-cluster",
          html: `<span>${cluster.getChildCount()}</span>`,
          iconSize: [38, 38],
        }),
    });
    for (const pin of pins) {
      const marker = L.marker([pin.latitude, pin.longitude], { icon: pinIcon, title: pin.title, alt: pin.title });
      marker.bindPopup(() => popupContent(pin, (href) => router.push(href)), {
        className: "rn-popup",
        minWidth: 220,
        maxWidth: 240,
      });
      group.addLayer(marker);
    }
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [map, pins, router]);

  return null;
}

/** Starts on the whole US, then glides in to this property (instantly under reduced motion). */
function FocusView({ focus }: { focus: MapProperty | null }) {
  const map = useMap();

  useEffect(() => {
    if (!focus) return;
    const target: L.LatLngTuple = [focus.latitude, focus.longitude];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.setView(target, FOCUS_ZOOM);
      return;
    }
    const timer = window.setTimeout(() => map.flyTo(target, FOCUS_ZOOM, { duration: 1.4 }), 400);
    return () => window.clearTimeout(timer);
  }, [map, focus]);

  return null;
}

/**
 * The US with every listing (clustered) and, when given, this property as a
 * larger red pin with its popup open. Used on the details page and in its
 * full-screen dialog.
 */
export default function ListingsMap({
  pins,
  focus,
  scrollWheelZoom = false,
}: {
  pins: MapProperty[];
  focus: MapProperty | null;
  /** Off inside the page (so scrolling past doesn't zoom), on in the dialog. */
  scrollWheelZoom?: boolean;
}) {
  const others = focus ? pins.filter((pin) => pin.id !== focus.id) : pins;

  return (
    <MapContainer bounds={US_BOUNDS} minZoom={3} zoomSnap={ZOOM_SNAP} scrollWheelZoom={scrollWheelZoom} className="size-full">
      <ThemedTiles />
      <FitUnitedStates />
      <ClusterLayer pins={others} />
      {focus && (
        <Marker
          position={[focus.latitude, focus.longitude]}
          icon={focusIcon}
          zIndexOffset={1000}
          title={focus.title}
          alt={focus.title}
          eventHandlers={{ add: (event) => event.target.openPopup() }}
        >
          <Popup className="rn-popup" autoPan={false}>
            <div className="rn-popup-card">
              <p className="rn-popup-eyebrow">This home</p>
              <p className="rn-popup-title">{focus.title}</p>
              <p className="rn-popup-meta">{formatLocation(focus.city, focus.division)}</p>
            </div>
          </Popup>
        </Marker>
      )}
      <FocusView focus={focus} />
    </MapContainer>
  );
}
