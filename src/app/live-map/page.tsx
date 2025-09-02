"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { supabase } from "../../lib/supabase";
import { loadGoogleMapsAPI } from "../../lib/google-maps-loader";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { RefreshCw } from "lucide-react";

// تعريف TypeScript لـ Google Maps
declare global {
  interface Window {
  google: any;
    initMap: () => void;
  }
}

// Google Maps API Key - استبدل هذا بمفتاحك الحقيقي
// يمكنك الحصول على مفتاح مجاني من: https://console.cloud.google.com/
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";
// Use env token if provided; fallback to user's shared public token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoieWFzc2VyMjAzMCIsImEiOiJjbWYxM3NrYTcxdmQzMmtxeTkybmRhdHh5In0.vfwk7MBLnKu2MxYZoFG0DQ";
const HAS_GOOGLE_KEY = !!(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY');

interface Driver {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  status: "متاح" | "في مهمة" | "غير متاح";
  currentOrder?: string;
  rating: number;
  lastUpdate: string;
  img?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  orderId?: string;
  status: "في انتظار" | "قيد التوصيل" | "تم التوصيل";
  address: string;
}

interface Order {
  id: string;
  customerId: string;
  driverId?: string;
  status: "جديد" | "قيد التوصيل" | "تم التوصيل" | "ملغي";
  items: string[];
  total: number;
  createdAt: string;
}

export default function LiveMap() {
  // refs and state
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapProvider, setMapProvider] = useState<"mapbox" | "google" | "leaflet">(
    MAPBOX_TOKEN ? "mapbox" : (HAS_GOOGLE_KEY ? "google" : "leaflet")
  );

  // Default center: Jeddah (not Riyadh)
  const mapCenter = { lat: 21.4894, lng: 39.2460 };
  const zoom = 12;

  // logging helpers
  const DEBUG_LOGS = false;
  const toMessage = (err: any, fallback: string) => {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    const m = err?.message || err?.error?.message || err?.msg || err?.code || '';
    return m || fallback;
  };
  const log = {
    error: (...args: any[]) => { if (DEBUG_LOGS) console.error(...args); },
    warn: (...args: any[]) => { if (DEBUG_LOGS) console.warn(...args); },
    info: (...args: any[]) => { if (DEBUG_LOGS) console.info(...args); },
  };

  // Fallback: load Leaflet from CDN when both Mapbox/Google are unavailable
  const loadLeaflet = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const win = window as any;
        if (win.L && typeof win.L.map === 'function') {
          resolve();
          return;
        }
        // CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        // JS
        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.onload = () => {
            resolve();
          };
          script.onerror = () => reject(new Error('Failed to load Leaflet'));
          document.body.appendChild(script);
        } else {
          // wait a tick for existing script
          setTimeout(() => resolve(), 50);
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  // helper to try mock server first
  const MOCK_BASE = process.env.NEXT_PUBLIC_MOCK_BASE || 'http://localhost:4000';
  const tryFetchJson = async (url: string, timeoutMs = 1500): Promise<any> => {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error('timeout')), timeoutMs);
      fetch(url)
        .then(r => {
          if (!r.ok) throw new Error(`status ${r.status}`);
          return r.json();
        })
        .then(d => {
          clearTimeout(id);
          resolve(d);
        })
        .catch(err => {
          clearTimeout(id);
          reject(err);
        });
    });
  };

  // fetch data (mock first, then Supabase fallback)
  const fetchData = async () => {
  setLoading(true);
  setError(null);
  const warnings: string[] = [];

    // Try mock backend first
    try {
      const [drv, cust] = await Promise.all([
        tryFetchJson(`${MOCK_BASE}/drivers`),
        tryFetchJson(`${MOCK_BASE}/customers`),
      ]);

      const driversData: Driver[] = (drv || []).map((d: any) => ({
        id: String(d.id),
        name: d.name,
        phone: '',
        lat: Array.isArray(d.coords) ? d.coords[1] : mapCenter.lat,
        lng: Array.isArray(d.coords) ? d.coords[0] : mapCenter.lng,
        status: 'متاح',
        currentOrder: undefined,
        rating: 4.7,
        lastUpdate: new Date().toLocaleString('ar-SA'),
        img: d.img,
      }));

      const customersMap: Customer[] = (cust || []).map((c: any) => ({
        id: String(c.id),
        name: c.name,
        phone: '',
        lat: Array.isArray(c.coords) ? c.coords[1] : mapCenter.lat,
        lng: Array.isArray(c.coords) ? c.coords[0] : mapCenter.lng,
        orderId: undefined,
        status: 'في انتظار',
        address: '',
      }));

      setDrivers(driversData);
      setCustomers(customersMap);
      setOrders([]);
      setLoading(false);
      setError(null);
      return; // success with mock; skip Supabase
    } catch (mockErr) {
      console.warn('Mock server not available, falling back to Supabase…');
    }

    // Employees
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'deliverer')
      .eq('status', 'active');
    if (employeesError) {
      if ((employeesError as any).code === '42P01') {
        // table missing: ignore silently
      } else {
        const msg = toMessage(employeesError, 'فشل جلب الموظفين');
        log.error('fetch employees:', msg);
        warnings.push(`الموصلون: ${msg}`);
      }
    }
      const driversData: Driver[] = (employeesData || []).map((emp: any) => ({
      id: emp.id,
      name: emp.name,
      phone: emp.phone,
        lat: mapCenter.lat + (Math.random() - 0.5) * 0.04,
        lng: mapCenter.lng + (Math.random() - 0.5) * 0.04,
      status: emp.status === 'active' ? 'متاح' : 'غير متاح',
      currentOrder: undefined,
      rating: 4.6,
      lastUpdate: new Date(emp.updated_at).toLocaleString('ar-SA')
    }));

    // Customers
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true);
    if (customersError) {
      if ((customersError as any).code === '42P01') {
        // table missing: ignore silently
      } else {
        const msg = toMessage(customersError, 'فشل جلب العملاء');
        log.error('fetch customers:', msg);
        warnings.push(`العملاء: ${msg}`);
      }
    }
      const customersMap: Customer[] = (customersData || []).map((cust: any) => ({
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
        lat: mapCenter.lat + (Math.random() - 0.5) * 0.04,
        lng: mapCenter.lng + (Math.random() - 0.5) * 0.04,
      orderId: undefined,
      status: 'في انتظار',
      address: cust.address
    }));

    // Orders (optional)
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (ordersError) {
      if ((ordersError as any).code === '42P01') {
        // table missing: ignore silently
      } else {
        const msg = toMessage(ordersError, 'فشل جلب الطلبات');
        log.error('fetch orders:', msg);
        warnings.push(`الطلبات: ${msg}`);
      }
    }
    const ordersMap: Order[] = (ordersData || []).map((o: any) => ({
      id: o.id,
      customerId: o.customer_id,
      driverId: o.deliverer_id,
      status: o.status === 'out_for_delivery' ? 'قيد التوصيل' : o.status === 'delivered' ? 'تم التوصيل' : o.status === 'cancelled' ? 'ملغي' : 'جديد',
      items: Array.isArray(o.items) ? o.items : [],
      total: Number(o.total_amount || 0),
      createdAt: new Date(o.created_at).toLocaleString('ar-SA')
    }));

    setDrivers(driversData);
    setCustomers(customersMap);
    setOrders(ordersMap);
  setLoading(false);
  // keep UI clean unless there is a real error
  setError(warnings.length ? warnings.join(' — ') : null);
  };

  // map init helpers
  const addMarkers = () => {
    if (!mapInstanceRef.current) return;
    // clear
    markersRef.current.forEach(m => {
      if (m?.remove) m.remove();
      if (m?.setMap) m.setMap(null);
    });
    markersRef.current = [];

  // drivers
    drivers.forEach(d => {
      // Mapbox: photo marker with blue border + popup
      if (mapProvider === 'mapbox') {
        const el = document.createElement('div');
        el.style.width = '44px';
        el.style.height = '44px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid #1D4ED8'; // blue-700
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        if (d.img) el.style.backgroundImage = `url("${d.img}")`;
        const marker = new (mapboxgl as any).Marker({ element: el })
          .setLngLat([d.lng, d.lat])
          .setPopup(new (mapboxgl as any).Popup({ offset: 16 }).setText(d.name))
          .addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      } else if (mapProvider === 'leaflet') {
        const L = (window as any).L;
        const url = createDriverCircleSVG(d.img);
        const icon = L.icon({ iconUrl: url, iconSize: [44, 44], iconAnchor: [22, 22] });
        const marker = L.marker([d.lat, d.lng], { icon }).addTo(mapInstanceRef.current);
        marker.bindPopup(d.name);
        markersRef.current.push(marker);
      } else {
        const url = createDriverCircleSVG(d.img);
        const marker = new (window as any).google.maps.Marker({
          position: { lat: d.lat, lng: d.lng },
          map: mapInstanceRef.current,
          icon: { url, scaledSize: new (window as any).google.maps.Size(44, 44), anchor: new (window as any).google.maps.Point(22, 22) }
        });
        const iw = new (window as any).google.maps.InfoWindow({ content: `<div style="font-family: sans-serif">${d.name}</div>` });
        marker.addListener('click', () => iw.open({ anchor: marker, map: mapInstanceRef.current }));
        markersRef.current.push(marker);
      }
    });

    // customers
    customers.forEach(c => {
      if (mapProvider === 'mapbox') {
        const marker = new (mapboxgl as any).Marker({ color: 'red' })
          .setLngLat([c.lng, c.lat])
          .setPopup(new (mapboxgl as any).Popup({ offset: 12 }).setText(c.name))
          .addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      } else if (mapProvider === 'leaflet') {
        const L = (window as any).L;
        const url = createRedDotSVG();
        const icon = L.icon({ iconUrl: url, iconSize: [20, 20], iconAnchor: [10, 10] });
        const marker = L.marker([c.lat, c.lng], { icon }).addTo(mapInstanceRef.current);
        marker.bindPopup(c.name);
        markersRef.current.push(marker);
      } else {
        const marker = new (window as any).google.maps.Marker({ position: { lat: c.lat, lng: c.lng }, map: mapInstanceRef.current });
        const iw = new (window as any).google.maps.InfoWindow({ content: `<div style="font-family: sans-serif">${c.name}</div>` });
        marker.addListener('click', () => iw.open({ anchor: marker, map: mapInstanceRef.current }));
        markersRef.current.push(marker);
      }
    });

    // Auto-fit bounds to all markers (drivers + customers)
    const points = [
      ...drivers.map(d => [d.lng, d.lat] as [number, number]),
      ...customers.map(c => [c.lng, c.lat] as [number, number])
    ];
    if (points.length > 0) {
      try {
        if (mapProvider === 'mapbox') {
          const bounds = points.reduce((b, p) => b.extend(p as any), new (mapboxgl as any).LngLatBounds(points[0], points[0]));
          mapInstanceRef.current.fitBounds(bounds, { padding: 100, maxZoom: 14, duration: 600 });
        } else if (mapProvider === 'leaflet') {
          const L = (window as any).L;
          const bounds = L.latLngBounds(points.map(p => [p[1], p[0]]));
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
          const bounds = new (window as any).google.maps.LatLngBounds();
          points.forEach(p => bounds.extend({ lat: p[1], lng: p[0] }));
          mapInstanceRef.current.fitBounds(bounds);
          // limit extreme zoom-in
          const listener = (window as any).google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
            if (mapInstanceRef.current.getZoom() > 14) mapInstanceRef.current.setZoom(14);
          });
        }
      } catch {}
    } else {
      // fallback center to Jeddah
      try {
        if (mapProvider === 'mapbox') {
          mapInstanceRef.current.setCenter([mapCenter.lng, mapCenter.lat]);
          mapInstanceRef.current.setZoom(12);
        } else if (mapProvider === 'leaflet') {
          mapInstanceRef.current.setView([mapCenter.lat, mapCenter.lng], 12);
        } else {
          mapInstanceRef.current.setCenter(mapCenter);
          mapInstanceRef.current.setZoom(12);
        }
      } catch {}
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapProvider) return;
    const waitForRef = async (retries = 10) => {
      let count = retries;
      while (count-- > 0) {
        if (mapRef.current) return true;
        await new Promise(r => setTimeout(r, 16)); // ~1 frame
      }
      return !!mapRef.current;
    };
  const init = async () => {
      try {
        if (mapProvider === 'mapbox') {
          if (!MAPBOX_TOKEN) throw new Error('Mapbox token is missing');
          (mapboxgl as any).accessToken = MAPBOX_TOKEN;
          const ok = await waitForRef();
          if (!ok || !mapRef.current) throw new Error('Map container not found');
          const map = new (mapboxgl as any).Map({
            container: mapRef.current,
            // Use the provided custom style
            style: 'mapbox://styles/yasser2030/cmf15su7z00c501pl4r29cvvw',
            center: [mapCenter.lng, mapCenter.lat],
            zoom
          });
          mapInstanceRef.current = map;
          setIsMapLoaded(true);
          try {
            // Enable RTL text rendering for Arabic
            (mapboxgl as any).setRTLTextPlugin(
              'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
              undefined,
              true
            );
          } catch {}
          map.on('load', () => {
            try {
              // Set Mapbox basemap language to Arabic (v3 API)
              if ((map as any).setConfigProperty) {
                (map as any).setConfigProperty('basemap', 'language', 'ar');
              }
            } catch {}
            addMarkers();
          });
          map.on('error', (e: any) => {
            log.error('Mapbox error:', toMessage(e, 'Mapbox error'));
            setMapError(toMessage(e, 'فشل في تحميل خريطة Mapbox'));
          });
  } else if (mapProvider === 'google') {
          await loadGoogleMapsAPI(GOOGLE_MAPS_API_KEY);
          const ok = await waitForRef();
          if (!ok || !mapRef.current) throw new Error('Map container not found');
          const map = new (window as any).google.maps.Map(mapRef.current, {
            center: mapCenter,
            zoom,
            mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP,
          });
          mapInstanceRef.current = map;
          setIsMapLoaded(true);
          addMarkers();
        } else if (mapProvider === 'leaflet') {
          await loadLeaflet();
          const ok = await waitForRef();
          if (!ok || !mapRef.current) throw new Error('Map container not found');
          const L = (window as any).L;
          const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], zoom);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          mapInstanceRef.current = map;
          setIsMapLoaded(true);
          addMarkers();
        }
      } catch (e: any) {
        log.error('Error loading map provider:', toMessage(e, 'provider error'));
        if (mapProvider === 'mapbox') {
          setMapProvider(HAS_GOOGLE_KEY ? 'google' : 'leaflet');
          return;
        }
        if (mapProvider === 'google') {
          setMapProvider('leaflet');
          return;
        }
        setMapError(toMessage(e, 'فشل في تحميل الخريطة'));
      }
    };
    init();
    // cleanup previous map instance when provider changes
    return () => {
      try {
        if (mapInstanceRef.current) {
          if (mapProvider === 'mapbox' && mapInstanceRef.current.remove) {
            mapInstanceRef.current.remove();
          } else if (mapProvider === 'leaflet' && mapInstanceRef.current.remove) {
            mapInstanceRef.current.remove();
          } else if (mapProvider === 'google') {
            // Google Maps cleanup: detach reference
            mapInstanceRef.current = null;
          }
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapProvider]);

  useEffect(() => {
    if (isMapLoaded) addMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers, customers, isMapLoaded, mapProvider]);

  const createDriverCircleSVG = (imgUrl?: string) => {
    // circular photo with blue border
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'>
        <defs>
          <clipPath id='clip'>
            <circle cx='22' cy='22' r='19' />
          </clipPath>
        </defs>
        <circle cx='22' cy='22' r='21' fill='white'/>
        <circle cx='22' cy='22' r='21' fill='none' stroke='#1D4ED8' stroke-width='3'/>
        ${imgUrl ? `<image href='${imgUrl}' x='3' y='3' width='38' height='38' clip-path='url(#clip)' preserveAspectRatio='xMidYMid slice'/>` : ''}
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const createRedDotSVG = () => {
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'>
        <circle cx='10' cy='10' r='9' fill='#EF4444' stroke='white' stroke-width='2'/>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const createHTMLMarker = (dataUrl: string) => {
    const el = document.createElement('div');
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.backgroundImage = `url(${dataUrl})`;
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    return el;
  };

  return (
    <Layout fullBleed>
      <div className="relative w-full" style={{ height: 'calc(100vh - 4rem)' }}>
        <div ref={mapRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}
      </div>
    </Layout>
  );
}