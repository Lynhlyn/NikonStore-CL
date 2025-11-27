'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/core/shadcn/components/ui/button';
import { MapPin, Link2, ExternalLink, X, Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/common/hooks/useGoogleMaps';
import { toast } from 'sonner';

interface GoogleMapsAddressPickerProps {
  onAddressSelected: (address: {
    detailedAddress: string;
    province: string;
    district: string;
    ward: string;
  }) => void;
  onProvinceSelected?: (provinceName: string) => void;
  onDistrictSelected?: (districtName: string) => void;
  onWardSelected?: (wardName: string) => void;
}

export default function GoogleMapsAddressPicker({
  onAddressSelected,
  onProvinceSelected,
  onDistrictSelected,
  onWardSelected,
}: GoogleMapsAddressPickerProps) {
  const [mapsLink, setMapsLink] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { parseMapsLink, openGoogleMapsPicker, isLoading, error } = useGoogleMaps();

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    const initAutocomplete = () => {
      if (
        typeof window !== 'undefined' &&
        window.google &&
        window.google.maps &&
        window.google.maps.places &&
        autocompleteRef.current &&
        !autocompleteInstanceRef.current
      ) {
        try {
          const autocomplete = new window.google.maps.places.Autocomplete(
            autocompleteRef.current,
            {
              componentRestrictions: { country: 'vn' },
              fields: ['formatted_address', 'address_components', 'geometry'],
              types: ['address'],
            }
          );

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.address_components) {
              handlePlaceSelected(place);
            }
          });

          autocompleteInstanceRef.current = autocomplete;
        } catch (error) {
          console.error('Error initializing Google Maps Autocomplete:', error);
        }
      }
    };

    initAutocomplete();

    const timeout = setTimeout(initAutocomplete, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components || !place.geometry) return;

    const components = parseAddressComponents(place.address_components);
    const streetNumber = components.streetNumber || '';
    const route = components.route || '';
    const detailedAddress = [streetNumber, route].filter(Boolean).join(' ');

    onAddressSelected({
      detailedAddress: detailedAddress || place.formatted_address || '',
      province: components.province || '',
      district: components.district || '',
      ward: components.ward || '',
    });

    if (components.province && onProvinceSelected) {
      onProvinceSelected(components.province);
    }
    if (components.district && onDistrictSelected) {
      onDistrictSelected(components.district);
    }
    if (components.ward && onWardSelected) {
      onWardSelected(components.ward);
    }

    toast.success('Đã chọn địa chỉ từ Google Maps!');
  };

  const parseAddressComponents = (components: google.maps.places.PlaceComponent[]) => {
    const result: any = {};

    components.forEach((component) => {
      const types = component.types;

      if (types.includes('street_number')) {
        result.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        result.route = component.long_name;
      }
      if (types.includes('sublocality_level_1') || types.includes('ward')) {
        result.ward = component.long_name;
      }
      if (types.includes('administrative_area_level_2') || types.includes('district')) {
        result.district = component.long_name;
      }
      if (types.includes('administrative_area_level_1') || types.includes('province')) {
        result.province = component.long_name;
      }
    });

    return result;
  };

  const handleParseLink = async () => {
    if (!mapsLink.trim()) {
      toast.error('Vui lòng nhập link Google Maps');
      return;
    }

    const location = await parseMapsLink(mapsLink);
    if (location) {
      const components = location.components;
      const streetNumber = components.streetNumber || '';
      const route = components.route || '';
      const detailedAddress = [streetNumber, route].filter(Boolean).join(' ');

      onAddressSelected({
        detailedAddress: detailedAddress || location.formattedAddress,
        province: components.province || '',
        district: components.district || '',
        ward: components.ward || '',
      });

      if (components.province && onProvinceSelected) {
        onProvinceSelected(components.province);
      }
      if (components.district && onDistrictSelected) {
        onDistrictSelected(components.district);
      }
      if (components.ward && onWardSelected) {
        onWardSelected(components.ward);
      }

      setMapsLink('');
      setShowLinkInput(false);
      toast.success('Đã lấy địa chỉ từ Google Maps!');
    } else if (error) {
      toast.error(error);
    }
  };

  const handleOpenMaps = () => {
    openGoogleMapsPicker();
    toast.info('Đã mở Google Maps. Sau khi chọn vị trí, hãy copy link và dán vào đây.');
    setShowLinkInput(true);
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium text-gray-900">Chọn địa chỉ từ Google Maps</h4>
      </div>

      <div className="space-y-3">
        {/* Google Places Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm địa chỉ
          </label>
          <div className="relative">
            <input
              ref={autocompleteRef}
              type="text"
              placeholder="Nhập địa chỉ hoặc tên địa điểm..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Gợi ý: Nhập tên đường, địa điểm hoặc địa chỉ cụ thể
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">hoặc</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Link Input */}
        {showLinkInput ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Dán link Google Maps
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mapsLink}
                onChange={(e) => setMapsLink(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="button"
                onClick={handleParseLink}
                disabled={isLoading || !mapsLink.trim()}
                size="sm"
                className="bg-[#ff8600] "
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLinkInput(false);
                  setMapsLink('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenMaps}
            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Mở Google Maps để chọn vị trí
          </Button>
        )}
      </div>
    </div>
  );
}

