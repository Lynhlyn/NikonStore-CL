'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MapPin, CreditCard, Package, Edit3, Plus, Gift } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFetchCustomerByIdQuery } from '@/lib/service/modules/customerService';
import type { ShippingAddress } from '@/lib/service/modules/customerService/type';
import {
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
} from '@/lib/service/modules/ghnService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/shadcn/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Button } from '@/core/shadcn/components/ui/button';
import { useCalculateShippingFeeMutation } from '@/lib/service/modules/orderService';
import VoucherSelectionModal from '@/common/components/VoucherSelectionModal/VoucherSelectionModal';

interface Step2CustomerInfoProps {
  items: any[];
  subtotal: number;
  onFormDataChange: (data: CustomerFormData) => void;
  onShippingFeeChange: (fee: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface CustomerFormData {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  provinceId: number | null;
  districtId: number | null;
  wardCode: string | null;
  detailedAddress: string;
  notes: string;
  paymentMethod: string;
  voucherId: number | null;
  discount: number | null;
}

export default function Step2CustomerInfo({
  items,
  subtotal,
  onFormDataChange,
  onShippingFeeChange,
  onNext,
  onBack,
}: Step2CustomerInfoProps) {
  const router = useRouter();
  const { customerId } = useAuth();
  const [calculateShippingFee] = useCalculateShippingFeeMutation();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const { data: customerData, isLoading: isCustomerLoading } =
    useFetchCustomerByIdQuery(customerId!, {
      skip: !customerId,
    });

  const shippingAddresses = customerData?.data?.shippingAddresses || [];
  const currentAddress =
    selectedAddressId !== null && selectedAddressId >= 0
      ? shippingAddresses[selectedAddressId]
      : undefined;

  const [formData, setFormData] = useState<CustomerFormData>({
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    provinceId: null,
    districtId: null,
    wardCode: null,
    detailedAddress: '',
    notes: '',
    paymentMethod: 'cod',
    voucherId: null,
    discount: null,
  });

  const { data: provincesData, isLoading: provincesLoading } =
    useGetProvincesQuery();
  const { data: districtsData, isLoading: districtsLoading } =
    useGetDistrictsQuery(formData.provinceId!, {
      skip: !formData.provinceId,
    });
  const { data: wardsData, isLoading: wardsLoading } = useGetWardsQuery(
    formData.districtId!,
    {
      skip: !formData.districtId,
    }
  );

  const provinces = useMemo(
    () =>
      provincesData?.data?.map((p) => ({
        id: p.ProvinceID,
        name: p.ProvinceName,
        value: p.ProvinceID,
        label: p.ProvinceName,
      })) || [],
    [provincesData?.data]
  );

  const districts = useMemo(
    () =>
      districtsData?.data?.map((d) => ({
        id: d.DistrictID,
        name: d.DistrictName,
        value: d.DistrictID,
        label: d.DistrictName,
      })) || [],
    [districtsData?.data]
  );

  const wards = useMemo(
    () =>
      wardsData?.data?.map((w) => ({
        id: w.WardCode,
        name: w.WardName,
        value: w.WardCode,
        label: w.WardName,
      })) || [],
    [wardsData?.data]
  );

  const selectedProvince = provinces.find(
    (p) => p.value === formData.provinceId
  );
  const selectedDistrict = districts.find(
    (d) => d.value === formData.districtId
  );
  const selectedWard = wards.find((w) => w.value === formData.wardCode);

  const selectedProvinceName = useMemo(
    () => selectedProvince?.name || null,
    [selectedProvince?.name, formData.provinceId]
  );

  const prevFormDataRef = useRef<CustomerFormData | null>(null);
  const onShippingFeeChangeRef = useRef(onShippingFeeChange);
  const prevShippingFeeRef = useRef<number | null>(null);
  const hasLoadedDefaultAddressRef = useRef(false);

  useEffect(() => {
    onShippingFeeChangeRef.current = onShippingFeeChange;
  }, [onShippingFeeChange]);

  useEffect(() => {
    const hasChanged =
      !prevFormDataRef.current ||
      prevFormDataRef.current.recipientName !== formData.recipientName ||
      prevFormDataRef.current.recipientPhone !== formData.recipientPhone ||
      prevFormDataRef.current.recipientEmail !== formData.recipientEmail ||
      prevFormDataRef.current.provinceId !== formData.provinceId ||
      prevFormDataRef.current.districtId !== formData.districtId ||
      prevFormDataRef.current.wardCode !== formData.wardCode ||
      prevFormDataRef.current.detailedAddress !== formData.detailedAddress ||
      prevFormDataRef.current.notes !== formData.notes ||
      prevFormDataRef.current.paymentMethod !== formData.paymentMethod ||
      prevFormDataRef.current.voucherId !== formData.voucherId ||
      prevFormDataRef.current.discount !== formData.discount;

    if (hasChanged) {
      prevFormDataRef.current = { ...formData };
      const timeoutId = setTimeout(() => {
        onFormDataChange(formData);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [
    formData.recipientName,
    formData.recipientPhone,
    formData.recipientEmail,
    formData.provinceId,
    formData.districtId,
    formData.wardCode,
    formData.detailedAddress,
    formData.notes,
    formData.paymentMethod,
    formData.voucherId,
    formData.discount,
    formData,
    onFormDataChange,
  ]);

  useEffect(() => {
    const calculateFee = async () => {
      if (
        !formData.districtId ||
        !formData.wardCode ||
        !selectedProvinceName ||
        items.length === 0
      ) {
        if (!districtsLoading && !wardsLoading) {
          const newFee = 0;
          if (prevShippingFeeRef.current !== newFee) {
            setShippingFee(newFee);
            onShippingFeeChangeRef.current(newFee);
            prevShippingFeeRef.current = newFee;
          }
        }
        return;
      }

      if (districtsLoading || wardsLoading) {
        return;
      }

      setIsCalculatingShipping(true);
      try {
        const totalWeight = items.reduce(
          (sum, item) => sum + (item.quantity * 0.5),
          0.5
        );

        const feeResponse = await calculateShippingFee({
          toDistrictId: formData.districtId,
          toWardCode: formData.wardCode,
          toProvinceName: selectedProvinceName,
          weightKg: totalWeight,
          length: 25,
          width: 20,
          height: 10,
        }).unwrap();

        let newFee: number;
        if (feeResponse.error) {
          console.error('Shipping fee error:', feeResponse.error);
          newFee = 30000;
        } else if (feeResponse.shippingFee !== undefined && feeResponse.shippingFee !== null) {
          newFee = feeResponse.shippingFee;
        } else if (feeResponse.total !== undefined && feeResponse.total !== null) {
          newFee = feeResponse.total;
        } else {
          newFee = 30000;
        }

        if (prevShippingFeeRef.current !== newFee) {
          setShippingFee(newFee);
          onShippingFeeChangeRef.current(newFee);
          prevShippingFeeRef.current = newFee;
        }
      } catch (error) {
        console.error('Error calculating shipping fee:', error);
        const newFee = 30000;
        if (prevShippingFeeRef.current !== newFee) {
          setShippingFee(newFee);
          onShippingFeeChangeRef.current(newFee);
          prevShippingFeeRef.current = newFee;
        }
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    const timeoutId = setTimeout(calculateFee, 500);
    return () => clearTimeout(timeoutId);
  }, [
    formData.districtId,
    formData.wardCode,
    selectedProvinceName,
    items,
    districtsLoading,
    wardsLoading,
    calculateShippingFee,
  ]);

  useEffect(() => {
    if (
      customerData?.data &&
      shippingAddresses.length > 0 &&
      provinces.length > 0 &&
      !hasLoadedDefaultAddressRef.current
    ) {
      const defaultIdx = shippingAddresses.findIndex(
        (addr) => addr.isDefault
      );
      const addressToLoad =
        defaultIdx !== -1
          ? shippingAddresses[defaultIdx]
          : shippingAddresses[0];
      const addressIdx = defaultIdx !== -1 ? defaultIdx : 0;
      setSelectedAddressId(addressIdx);
      setUseSavedAddress(true);
      hasLoadedDefaultAddressRef.current = true;
      loadAddressToForm(addressToLoad);
    }
  }, [customerData?.data, shippingAddresses, provinces.length]);

  const loadAddressToForm = (address: ShippingAddress) => {
    if (provinces.length > 0) {
      const province = provinces.find((p) =>
        p.name.toLowerCase().includes(address.province.toLowerCase()) ||
        address.province.toLowerCase().includes(p.name.toLowerCase())
      );
      if (province) {
        setFormData((prev) => ({
          ...prev,
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhoneNumber,
          recipientEmail: customerData?.data?.email || '',
          detailedAddress: address.detailedAddress,
          provinceId: province.value,
          districtId: null,
          wardCode: null,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhoneNumber,
          recipientEmail: customerData?.data?.email || '',
          detailedAddress: address.detailedAddress,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhoneNumber,
        recipientEmail: customerData?.data?.email || '',
        detailedAddress: address.detailedAddress,
      }));
    }
  };

  useEffect(() => {
    if (
      useSavedAddress &&
      currentAddress &&
      formData.provinceId &&
      districts.length > 0
    ) {
      const district = districts.find((d) =>
        d.name.toLowerCase().includes(currentAddress.district.toLowerCase()) ||
        currentAddress.district.toLowerCase().includes(d.name.toLowerCase())
      );
      if (district) {
        setFormData((prev) => ({ ...prev, districtId: district.value }));
      }
    }
  }, [formData.provinceId, districts, useSavedAddress, currentAddress]);

  useEffect(() => {
    if (
      useSavedAddress &&
      currentAddress &&
      formData.districtId &&
      wards.length > 0
    ) {
      const ward = wards.find((w) =>
        w.name.toLowerCase().includes(currentAddress.ward.toLowerCase()) ||
        currentAddress.ward.toLowerCase().includes(w.name.toLowerCase())
      );
      if (ward) {
        setFormData((prev) => ({ ...prev, wardCode: ward.value }));
      }
    }
  }, [formData.districtId, wards, useSavedAddress, currentAddress]);

  const handleInputChange = (field: keyof CustomerFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.recipientName.trim()) {
      toast.error('Vui lòng nhập tên người nhận');
      return false;
    }
    if (!formData.recipientPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!/^[0-9]{10,11}$/.test(formData.recipientPhone.replace(/\s/g, ''))) {
      toast.error('Số điện thoại không hợp lệ');
      return false;
    }
    if (!formData.recipientEmail.trim()) {
      toast.error('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (!formData.provinceId) {
      toast.error('Vui lòng chọn tỉnh/thành phố');
      return false;
    }
    if (!formData.districtId) {
      toast.error('Vui lòng chọn quận/huyện');
      return false;
    }
    if (!formData.wardCode) {
      toast.error('Vui lòng chọn phường/xã');
      return false;
    }
    if (!formData.detailedAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    onNext();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const calculateVoucherDiscount = (voucher: any, orderTotal: number) => {
    if (!voucher || voucher.status !== 'ACTIVE') {
      return 0;
    }
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    if (now < startDate || now > endDate) {
      return 0;
    }
    if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) {
      return 0;
    }
    let discount = 0;
    if (voucher.discountType?.toUpperCase() === 'PERCENTAGE') {
      discount = orderTotal * (voucher.discountValue / 100);
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else if (voucher.discountType?.toUpperCase() === 'FIXED_AMOUNT') {
      discount = voucher.discountValue;
      if (discount > orderTotal) {
        discount = orderTotal;
      }
    }
    return Math.round(discount);
  };

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher) return 0;
    return calculateVoucherDiscount(selectedVoucher, subtotal);
  }, [selectedVoucher, subtotal]);

  useEffect(() => {
    if (selectedVoucher) {
      const discount = calculateVoucherDiscount(selectedVoucher, subtotal);
      setFormData((prev) => ({
        ...prev,
        voucherId: selectedVoucher.id,
        discount: discount,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        voucherId: null,
        discount: null,
      }));
    }
  }, [selectedVoucher, subtotal]);

  const calculateTotal = () => {
    return subtotal + shippingFee - (voucherDiscount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Thông tin giao hàng
          </h2>
        </div>

        <div className="space-y-4">
          {customerId && shippingAddresses.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ đã lưu
                </label>
                <Dialog open={isEditingAddress} onOpenChange={setIsEditingAddress}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      {useSavedAddress ? 'Thay đổi địa chỉ' : 'Chọn địa chỉ'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {shippingAddresses.map((addr, idx) => (
                        <div
                          key={addr.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === idx
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedAddressId(idx);
                            setUseSavedAddress(true);
                            loadAddressToForm(addr);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                selectedAddressId === idx
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedAddressId === idx && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {addr.recipientName}
                                  </span>
                                  {addr.recipientPhoneNumber && (
                                    <span className="text-gray-600">
                                      | {addr.recipientPhoneNumber}
                                    </span>
                                  )}
                                </div>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-700">
                                {addr.detailedAddress}
                              </div>
                              <div className="text-sm text-gray-500">
                                {addr.ward}, {addr.district}, {addr.province}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => router.push('/address')}
                      >
                        <Plus className="h-4 w-4" />
                        Thêm địa chỉ mới
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="flex-1 bg-[#ff8600] "
                          onClick={() => setIsEditingAddress(false)}
                        >
                          Xong
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setIsEditingAddress(false);
                            setUseSavedAddress(false);
                            setFormData((prev) => ({
                              ...prev,
                              recipientName: '',
                              recipientPhone: '',
                              detailedAddress: '',
                              provinceId: null,
                              districtId: null,
                              wardCode: null,
                            }));
                          }}
                        >
                          Nhập mới
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {useSavedAddress && currentAddress && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {currentAddress.recipientName}
                        </span>
                        {currentAddress.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                      {currentAddress.recipientPhoneNumber && (
                        <div className="text-gray-700">
                          SĐT: {currentAddress.recipientPhoneNumber}
                        </div>
                      )}
                      <div className="font-medium text-gray-900">
                        {currentAddress.detailedAddress}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentAddress.ward}, {currentAddress.district},{' '}
                        {currentAddress.province}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(!customerId || !useSavedAddress) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) =>
                    handleInputChange('recipientName', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) =>
                      handleInputChange('recipientPhone', e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) =>
                      handleInputChange('recipientEmail', e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.provinceId?.toString() || ''}
                  onValueChange={(value) => {
                    handleInputChange('provinceId', Number(value));
                    handleInputChange('districtId', null);
                    handleInputChange('wardCode', null);
                  }}
                  disabled={provincesLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem
                        key={province.id}
                        value={province.value.toString()}
                      >
                        {province.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.districtId?.toString() || ''}
                    onValueChange={(value) => {
                      handleInputChange('districtId', Number(value));
                      handleInputChange('wardCode', null);
                    }}
                    disabled={!formData.provinceId || districtsLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem
                          key={district.id}
                          value={district.value.toString()}
                        >
                          {district.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.wardCode || ''}
                    onValueChange={(value) => {
                      handleInputChange('wardCode', value);
                    }}
                    disabled={!formData.districtId || wardsLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn phường/xã" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.value}>
                          {ward.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.detailedAddress}
                  onChange={(e) =>
                    handleInputChange('detailedAddress', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Số nhà, tên đường"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú về đơn hàng..."
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Phương thức thanh toán
          </h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={formData.paymentMethod === 'cod'}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 shrink-0 ${
                formData.paymentMethod === 'cod'
                  ? 'border-blue-600 bg-[#ff8600]'
                  : 'border-gray-300'
              }`}
            >
              {formData.paymentMethod === 'cod' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  Thanh toán khi nhận hàng (COD)
                </div>
                <div className="text-sm text-gray-500">
                  Thanh toán bằng tiền mặt khi nhận hàng
                </div>
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="vnpay"
              checked={formData.paymentMethod === 'vnpay'}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 shrink-0 ${
                formData.paymentMethod === 'vnpay'
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}
            >
              {formData.paymentMethod === 'vnpay' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  Thanh toán trực tuyến
                </div>
                <div className="text-sm text-gray-500">
                  Thanh toán online qua thẻ ATM, Visa, Mastercard
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tóm tắt đơn hàng
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(subtotal)}
            </span>
          </div>
          
          {!selectedVoucher ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-200"
              onClick={() => setIsVoucherModalOpen(true)}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Gift className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">Chọn mã giảm giá</div>
                  <div className="text-sm text-gray-500">Nhấn để xem voucher có sẵn</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-green-800 text-sm">{selectedVoucher.code}</span>
                      <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                        {selectedVoucher.discountType === 'PERCENTAGE' || selectedVoucher.discountType === 'percentage'
                          ? `-${selectedVoucher.discountValue}%`
                          : `-${formatCurrency(selectedVoucher.discountValue)}`
                        }
                      </span>
                    </div>
                    <div className="text-xs text-green-700">
                      Tiết kiệm {formatCurrency(voucherDiscount)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-green-700 hover:text-green-800 hover:bg-green-100"
                    onClick={() => setIsVoucherModalOpen(true)}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Đổi
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setSelectedVoucher(null)}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Bỏ
                  </Button>
                </div>
              </div>
            </div>
          )}

          {voucherDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Giảm giá:</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(voucherDiscount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className="font-medium text-gray-900">
              {isCalculatingShipping ||
              districtsLoading ||
              wardsLoading
                ? 'Đang tính...'
                : formatCurrency(shippingFee)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                Tổng cộng:
              </span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>

      <VoucherSelectionModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSelectVoucher={(voucher) => setSelectedVoucher(voucher)}
        selectedVoucherId={selectedVoucher?.id}
        subtotal={subtotal}
      />

      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 py-4 rounded-xl"
        >
          Quay lại
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 bg-[#ff8600]  text-white font-semibold py-4 rounded-xl"
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}

