import { useState, useEffect } from 'react';

const GHN_TOKEN = process.env.NEXT_PUBLIC_GHN_TOKEN || '8dc73a54-6395-11f0-af19-a658c04ccb4e';

interface UseAddressToIdsProps {
  provinceName?: string;
  districtName?: string;
  wardName?: string;
}

export function useAddressToIds({
  provinceName,
  districtName,
  wardName,
}: UseAddressToIdsProps) {
  const [toDistrictId, setToDistrictId] = useState<number | null>(null);
  const [toWardCode, setToWardCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIds() {
      if (!provinceName || !districtName || !wardName) {
        setToDistrictId(null);
        setToWardCode(null);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const provinceRes = await fetch(
          'https://online-gateway.ghn.vn/shiip/public-api/master-data/province',
          {
            headers: { token: GHN_TOKEN },
          }
        );
        const provinceData = await provinceRes.json();
        const province = provinceData.data.find(
          (p: any) =>
            p.ProvinceName.toLowerCase().includes(provinceName.toLowerCase()) ||
            (p.NameExtension &&
              p.NameExtension.some((ext: string) =>
                ext.toLowerCase().includes(provinceName.toLowerCase())
              ))
        );
        if (!province) throw new Error('Không tìm thấy tỉnh/thành');
        const provinceId = province.ProvinceID;

        const districtRes = await fetch(
          'https://online-gateway.ghn.vn/shiip/public-api/master-data/district',
          {
            method: 'POST',
            headers: { token: GHN_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ province_id: provinceId }),
          }
        );
        const districtData = await districtRes.json();
        const district = districtData.data.find((d: any) =>
          d.DistrictName.toLowerCase().includes(districtName.toLowerCase())
        );
        if (!district) throw new Error('Không tìm thấy quận/huyện');
        const districtId = district.DistrictID;
        setToDistrictId(districtId);

        const wardRes = await fetch(
          'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward',
          {
            method: 'POST',
            headers: { token: GHN_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ district_id: districtId }),
          }
        );
        const wardData = await wardRes.json();
        const ward = wardData.data.find((w: any) =>
          w.WardName.toLowerCase().includes(wardName.toLowerCase())
        );
        if (!ward) throw new Error('Không tìm thấy phường/xã');
        setToWardCode(ward.WardCode);
      } catch (err: any) {
        setToDistrictId(null);
        setToWardCode(null);
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setIsLoading(false);
      }
    }
    fetchIds();
  }, [provinceName, districtName, wardName]);

  return { toDistrictId, toWardCode, isLoading, error };
}

