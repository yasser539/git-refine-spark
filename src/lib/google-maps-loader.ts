// Google Maps API Loader Utility
// This utility prevents multiple Google Maps API script loads

declare global {
  interface Window {
  google: any;
    initMap: () => void;
  }
}

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsAPI = (apiKey: string): Promise<void> => {
  // If already loaded, return immediately
  if (isLoaded && (window as any).google?.maps) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    // Wait for existing script to load
    return new Promise((resolve, reject) => {
      const checkGoogleMaps = () => {
  if ((window as any).google?.maps) {
          isLoaded = true;
          isLoading = false;
          resolve();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    });
  }

  // Start loading
  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    try {
  const script = document.createElement('script');
  // Request Arabic localization and Saudi region so map UI and labels appear in Arabic
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ar&region=SA&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';
      
      script.onerror = () => {
        isLoading = false;
        loadPromise = null;
        reject(new Error('Failed to load Google Maps SDK'));
      };

      // Define callback function
      window.initMap = () => {
        setTimeout(() => {
          if ((window as any).google?.maps) {
            isLoaded = true;
            isLoading = false;
            resolve();
          } else {
            isLoading = false;
            loadPromise = null;
            reject(new Error('Failed to initialize Google Maps SDK'));
          }
        }, 100);
      };

      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      loadPromise = null;
      reject(error);
    }
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && !!((window as any).google?.maps);
}; 