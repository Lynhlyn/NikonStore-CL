'use client';

import { useEffect } from 'react';

export default function GoogleMapsScript() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found. Google Maps features will be limited.');
      return;
    }

    // Check if script already loaded
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=vi`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
}

