import { useEffect, useRef, useState } from 'react';
import { Button } from './components/ui/button';
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
  const [contourVisible, setContourVisible] = useState(false);

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
      // 최초 등고선 레이어 상태 반영
      if (mapRef.current) {
        mapRef.current.setLayoutProperty(
          "contour_line_3d",
          "visibility",
          contourVisible ? "visible" : "none"
        );
      }
    });
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // contourVisible은 의존성에서 제외 (토글은 별도 useEffect에서 처리)
    // eslint-disable-next-line
  }, []);

  // contourVisible이 바뀔 때마다 레이어 visibility 토글
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      mapRef.current.setLayoutProperty(
        "contour_line_3d",
        "visibility",
        contourVisible ? "visible" : "none"
      );
    }
  }, [contourVisible]);

  return (
    <div className="w-7xl h-screen flex items-center justify-center bg-background text-foreground relative">
      <Button
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-800 transition"
        onClick={() => setContourVisible((v) => !v)}
      >
        {contourVisible ? '등고선 숨기기' : '등고선 보기'}
      </Button>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

export default App
