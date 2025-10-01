import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';
import darkBlueStyle from './store/map/style/dark_blue.json';
import type { StyleSpecification } from 'maplibre-gl';

function patchStyleHost(style: unknown): StyleSpecification {
  const host = window.location.origin;
  // 깊은 복사 (불변성 보장)
  const patched = JSON.parse(JSON.stringify(style));
  if (typeof patched.glyphs === 'string') {
    patched.glyphs = patched.glyphs.replace('{UI_SERVER_HOSTNAME}', host);
  }
  if (typeof patched.sprite === 'string') {
    patched.sprite = patched.sprite.replace('{UI_SERVER_HOSTNAME}', host);
  }
  return patched as StyleSpecification;
}


function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        pitch: 60,
        style: patchStyleHost(darkBlueStyle.style) as StyleSpecification,
        center: [127.024612, 37.532600], // 서울 중심 좌표
        zoom: 11,
        attributionControl: false
      });
    }

    mapRef.current?.on("load", () => {
      mapRef.current?.on("click", (e) => {
        // 클릭 시 동작
        console.log("지도 클릭!", e.lngLat);
        console.log(mapRef.current?.getZoom());
        const layer = mapRef.current?.queryRenderedFeatures(e.point)
        console.info(layer)
      });
    });
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-7xl h-screen flex items-center justify-center bg-background text-foreground">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

export default App
