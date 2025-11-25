import { useState, useCallback } from 'react';

interface GoogleMapsLocation {
  lat: number;
  lng: number;
  address: string;
  formattedAddress: string;
  components: {
    streetNumber?: string;
    route?: string;
    ward?: string;
    district?: string;
    province?: string;
    country?: string;
  };
}

/**
 * Parse Google Maps URL to extract location information
 */
export function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    // Handle different Google Maps URL formats
    // Format 1: https://maps.google.com/?q=lat,lng
    // Format 2: https://www.google.com/maps/place/.../@lat,lng
    // Format 3: https://www.google.com/maps/@lat,lng,zoom

    let lat: number | null = null;
    let lng: number | null = null;

    // Try to extract from @lat,lng format
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      lat = parseFloat(atMatch[1]);
      lng = parseFloat(atMatch[2]);
    }

    // Try to extract from ?q=lat,lng format
    if (!lat || !lng) {
      const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (qMatch) {
        lat = parseFloat(qMatch[1]);
        lng = parseFloat(qMatch[2]);
      }
    }

    // Try to extract from /maps/@lat,lng format
    if (!lat || !lng) {
      const mapsMatch = url.match(/\/maps\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (mapsMatch) {
        lat = parseFloat(mapsMatch[1]);
        lng = parseFloat(mapsMatch[2]);
      }
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }

    return null;
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error);
    return null;
  }
}

/**
 * Hook to handle Google Maps integration
 */
export function useGoogleMaps() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseMapsLink = useCallback(async (url: string): Promise<GoogleMapsLocation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const coords = parseGoogleMapsUrl(url);
      if (!coords) {
        setError('Không thể phân tích link Google Maps. Vui lòng kiểm tra lại.');
        return null;
      }

      // Use Google Geocoding API to get address details
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        // Fallback: return basic location info
        return {
          lat: coords.lat,
          lng: coords.lng,
          address: '',
          formattedAddress: `Vị trí: ${coords.lat}, ${coords.lng}`,
          components: {},
        };
      }

      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&language=vi&key=${apiKey}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = parseAddressComponents(result.address_components);

        return {
          lat: coords.lat,
          lng: coords.lng,
          address: result.formatted_address,
          formattedAddress: result.formatted_address,
          components: addressComponents,
        };
      } else {
        setError('Không tìm thấy địa chỉ tại vị trí này.');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xử lý link Google Maps.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openGoogleMapsPicker = useCallback(() => {
    // Open Google Maps in a new window for user to select location
    const mapsUrl = 'https://www.google.com/maps';
    window.open(mapsUrl, '_blank', 'width=800,height=600');
  }, []);

  return {
    parseMapsLink,
    openGoogleMapsPicker,
    isLoading,
    error,
  };
}

/**
 * Parse Google Geocoding API address components to extract province, district, ward
 * Optimized for Vietnam address format
 */
function parseAddressComponents(components: any[]): {
  streetNumber?: string;
  route?: string;
  ward?: string;
  district?: string;
  province?: string;
  country?: string;
} {
  const result: any = {};

  components.forEach((component) => {
    const types = component.types;

    if (types.includes('street_number')) {
      result.streetNumber = component.long_name;
    }
    if (types.includes('route')) {
      result.route = component.long_name;
    }
    
    // For Vietnam, administrative levels are:
    // level_1: Province/Thành phố
    // level_2: District/Quận/Huyện
    // level_3: Ward/Phường/Xã
    // sublocality_level_1: Ward/Phường (alternative)
    
    if (types.includes('administrative_area_level_3') || types.includes('sublocality_level_1')) {
      result.ward = component.long_name;
    }
    
    if (types.includes('administrative_area_level_2')) {
      result.district = component.long_name;
    }
    
    if (types.includes('administrative_area_level_1')) {
      // Remove common prefixes like "Tỉnh", "Thành phố"
      let provinceName = component.long_name;
      provinceName = provinceName.replace(/^(Tỉnh|Thành phố|TP\.?)\s*/i, '').trim();
      result.province = provinceName;
    }
    
    if (types.includes('country')) {
      result.country = component.long_name;
    }
  });

  // Fallback: try to extract from formatted address if components are missing
  // This is a backup strategy for cases where Google doesn't provide detailed components
  if (!result.province || !result.district) {
    // Try to find in other components
    components.forEach((component) => {
      const types = component.types;
      const name = component.long_name;
      
      // Check if it looks like a province name
      if (!result.province && (name.includes('Nghệ An') || name.includes('Hà Nội') || name.includes('Hồ Chí Minh') || 
          name.includes('Đà Nẵng') || name.includes('Cần Thơ') || name.includes('An Giang') ||
          name.includes('Bà Rịa') || name.includes('Bắc Giang') || name.includes('Bắc Kạn') ||
          name.includes('Bạc Liêu') || name.includes('Bắc Ninh') || name.includes('Bến Tre') ||
          name.includes('Bình Định') || name.includes('Bình Dương') || name.includes('Bình Phước') ||
          name.includes('Bình Thuận') || name.includes('Cà Mau') || name.includes('Cao Bằng') ||
          name.includes('Đắk Lắk') || name.includes('Đắk Nông') || name.includes('Điện Biên') ||
          name.includes('Đồng Nai') || name.includes('Đồng Tháp') || name.includes('Gia Lai') ||
          name.includes('Hà Giang') || name.includes('Hà Nam') || name.includes('Hà Tĩnh') ||
          name.includes('Hải Dương') || name.includes('Hải Phòng') || name.includes('Hậu Giang') ||
          name.includes('Hòa Bình') || name.includes('Hưng Yên') || name.includes('Khánh Hòa') ||
          name.includes('Kiên Giang') || name.includes('Kon Tum') || name.includes('Lai Châu') ||
          name.includes('Lâm Đồng') || name.includes('Lạng Sơn') || name.includes('Lào Cai') ||
          name.includes('Long An') || name.includes('Nam Định') || name.includes('Ninh Bình') ||
          name.includes('Ninh Thuận') || name.includes('Phú Thọ') || name.includes('Phú Yên') ||
          name.includes('Quảng Bình') || name.includes('Quảng Nam') || name.includes('Quảng Ngãi') ||
          name.includes('Quảng Ninh') || name.includes('Quảng Trị') || name.includes('Sóc Trăng') ||
          name.includes('Sơn La') || name.includes('Tây Ninh') || name.includes('Thái Bình') ||
          name.includes('Thái Nguyên') || name.includes('Thanh Hóa') || name.includes('Thừa Thiên') ||
          name.includes('Tiền Giang') || name.includes('Trà Vinh') || name.includes('Tuyên Quang') ||
          name.includes('Vĩnh Long') || name.includes('Vĩnh Phúc') || name.includes('Yên Bái'))) {
        result.province = name.replace(/^(Tỉnh|Thành phố|TP\.?)\s*/i, '').trim();
      }
    });
  }

  return result;
}

