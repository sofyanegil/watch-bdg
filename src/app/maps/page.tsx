/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import { CCTV } from '@/types';
import L from 'leaflet';
import CardCCTV from '@/components/cards/CardCCTV';
import { getCCTV } from '@/services/api/cctv';

const cctvIcon = new L.Icon({
  iconUrl: '/cctv.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

export default function CCTVMapPage() {
  const [data, setData] = useState<CCTV[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCCTV = async () => {
      setIsLoading(true);

      try {
        const cctvData = await getCCTV();
        setData(cctvData);
      } catch (err) {
        console.error('Error fetching CCTV data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCCTV();
  }, []);
  const defaultCenter: [number, number] = [-6.89, 107.609];

  const createClusterCustomIcon = (cluster: any) => {
    return L.divIcon({
      html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold border-2 border-white shadow-lg">
        <span>${cluster.getChildCount()}</span>
      </div>
    `,
      className: '',
      iconSize: L.point(40, 40, true),
    });
  };

  return (
    <div className="h-max-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-3 md:px-10">
      <h2 className="text-2xl font-bold text-center mb-6">📍 CCTV Live Map</h2>

      {isLoading ? (
        <div className="h-[75vh] w-full bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      ) : (
        <MapContainer center={defaultCenter} zoom={12} maxZoom={18} className="h-[75vh] w-full rounded-lg shadow-lg markercluster-map" scrollWheelZoom>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&amp;copy Crafted by Sofyanegi" />

          <MarkerClusterGroup showCoverageOnHover={true} minClusterSize={5} spiderfyDistanceMultiplier={2} iconCreateFunction={createClusterCustomIcon}>
            {data.map((cctv: CCTV) => (
              <Marker key={cctv.cctv_id} position={[Number(cctv.cctv_lat), Number(cctv.cctv_lng)]} icon={cctvIcon}>
                <Popup minWidth={300} maxWidth={300} position={[Number(cctv.cctv_lat), Number(cctv.cctv_lng)]}>
                  <CardCCTV {...cctv} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      )}
    </div>
  );
}
