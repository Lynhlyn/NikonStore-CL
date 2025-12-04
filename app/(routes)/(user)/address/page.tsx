'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  useFetchAddressesByCustomerQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from '@/lib/service/modules/addressService';
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
import { Plus, MapPin, Edit2, Trash2, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '@/lib/service/modules/addressService/type';
import Loader from '@/components/common/Loader';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address;
  customerId: number;
  onSuccess: () => void;
}

const AddressModal = ({ isOpen, onClose, address, customerId, onSuccess }: AddressModalProps) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhoneNumber: '',
    province: '',
    district: '',
    ward: '',
    detailedAddress: '',
    isDefault: false,
  });

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  const { data: provincesData } = useGetProvincesQuery();
  const { data: districtsData } = useGetDistrictsQuery(selectedProvinceId!, {
    skip: !selectedProvinceId,
  });
  const { data: wardsData } = useGetWardsQuery(selectedDistrictId!, {
    skip: !selectedDistrictId,
  });

  const provinces = useMemo(() => {
    return provincesData?.data?.map((p) => ({
      id: p.ProvinceID,
      name: p.ProvinceName,
      value: p.ProvinceID,
    })) || [];
  }, [provincesData?.data]);

  const districts = useMemo(() => {
    return districtsData?.data?.map((d) => ({
      id: d.DistrictID,
      name: d.DistrictName,
      value: d.DistrictID,
    })) || [];
  }, [districtsData?.data]);

  const wards = useMemo(() => {
    return wardsData?.data?.map((w) => ({
      id: w.WardCode,
      name: w.WardName,
      value: w.WardCode,
    })) || [];
  }, [wardsData?.data]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (address) {
      setFormData({
        recipientName: address.recipientName,
        recipientPhoneNumber: address.recipientPhoneNumber,
        province: address.province,
        district: address.district,
        ward: address.ward,
        detailedAddress: address.detailedAddress,
        isDefault: address.isDefault,
      });
      const province = provinces.find((p) => p.name === address.province);
      if (province) setSelectedProvinceId(province.value);
    } else {
      setFormData({
        recipientName: '',
        recipientPhoneNumber: '',
        province: '',
        district: '',
        ward: '',
        detailedAddress: '',
        isDefault: false,
      });
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
      setSelectedWardCode(null);
    }
    setErrors({});
  }, [address, isOpen, provinces]);

  useEffect(() => {
    if (selectedProvinceId && formData.province) {
      const district = districts.find((d) => d.name === formData.district);
      if (district) setSelectedDistrictId(district.value);
    }
  }, [selectedProvinceId, districts, formData.district]);

  useEffect(() => {
    if (selectedDistrictId && formData.ward) {
      const ward = wards.find((w) => w.name === formData.ward);
      if (ward) setSelectedWardCode(ward.value);
    }
  }, [selectedDistrictId, wards, formData.ward]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Họ và tên là bắt buộc';
    }

    if (!formData.recipientPhoneNumber.trim()) {
      newErrors.recipientPhoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.recipientPhoneNumber.trim())) {
      newErrors.recipientPhoneNumber = 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0';
    }

    if (!selectedProvinceId || !formData.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    }

    if (!selectedDistrictId || !formData.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }

    if (!selectedWardCode || !formData.ward) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }

    if (!formData.detailedAddress.trim()) {
      newErrors.detailedAddress = 'Địa chỉ chi tiết là bắt buộc';
    } else if (formData.detailedAddress.trim().length < 5) {
      newErrors.detailedAddress = 'Địa chỉ chi tiết phải có ít nhất 5 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const selectedProvince = provinces.find((p) => p.value === selectedProvinceId);
      const selectedDistrict = districts.find((d) => d.value === selectedDistrictId);
      const selectedWard = wards.find((w) => w.value === selectedWardCode);

      if (address) {
        const updateData: UpdateAddressRequest = {
          recipientName: formData.recipientName,
          recipientPhoneNumber: formData.recipientPhoneNumber,
          province: selectedProvince?.name || formData.province,
          district: selectedDistrict?.name || formData.district,
          ward: selectedWard?.name || formData.ward,
          detailedAddress: formData.detailedAddress,
          isDefault: formData.isDefault,
        };
        await updateAddress({ id: address.id, body: updateData }).unwrap();
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        const createData: CreateAddressRequest = {
          customerId,
          recipientName: formData.recipientName,
          recipientPhoneNumber: formData.recipientPhoneNumber,
          province: selectedProvince?.name || '',
          district: selectedDistrict?.name || '',
          ward: selectedWard?.name || '',
          detailedAddress: formData.detailedAddress,
          isDefault: formData.isDefault,
        };
        await createAddress(createData).unwrap();
        toast.success('Thêm địa chỉ thành công!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên người nhận <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập họ và tên"
            />
            {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.recipientPhoneNumber}
              onChange={(e) => setFormData({ ...formData, recipientPhoneNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0123456789"
            />
            {errors.recipientPhoneNumber && <p className="text-red-500 text-sm mt-1">{errors.recipientPhoneNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedProvinceId?.toString() || ''}
              onValueChange={(value) => {
                const province = provinces.find((p) => p.value.toString() === value);
                setSelectedProvinceId(Number(value));
                setFormData({ ...formData, province: province?.name || '' });
                setSelectedDistrictId(null);
                setSelectedWardCode(null);
                setFormData((prev) => ({ ...prev, district: '', ward: '' }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.id} value={province.value.toString()}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedDistrictId?.toString() || ''}
                onValueChange={(value) => {
                  const district = districts.find((d) => d.value.toString() === value);
                  setSelectedDistrictId(Number(value));
                  setFormData({ ...formData, district: district?.name || '' });
                  setSelectedWardCode(null);
                  setFormData((prev) => ({ ...prev, ward: '' }));
                }}
                disabled={!selectedProvinceId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn quận/huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.value.toString()}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedWardCode || ''}
                onValueChange={(value) => {
                  const ward = wards.find((w) => w.value === value);
                  setSelectedWardCode(value);
                  setFormData({ ...formData, ward: ward?.name || '' });
                }}
                disabled={!selectedDistrictId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn phường/xã" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.value}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.detailedAddress}
              onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Số nhà, tên đường"
            />
            {errors.detailedAddress && <p className="text-red-500 text-sm mt-1">{errors.detailedAddress}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Đang xử lý...' : address ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function AddressPage() {
  const { customerId } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);

  const {
    data: addressesData,
    isLoading,
    refetch,
  } = useFetchAddressesByCustomerQuery(customerId!, {
    skip: !customerId,
  });

  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();

  const addresses = addressesData?.data || [];

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (address: Address) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;

    try {
      await deleteAddress({ id: address.id, customerId: customerId! }).unwrap();
      toast.success('Xóa địa chỉ thành công!');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Xóa địa chỉ thất bại');
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress({ customerId: customerId!, addressId: address.id }).unwrap();
      toast.success('Đặt địa chỉ mặc định thành công!');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Đặt địa chỉ mặc định thất bại');
    }
  };

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Vui lòng đăng nhập để quản lý địa chỉ</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý địa chỉ</h1>
              <p className="text-gray-600 mt-2">Thêm, chỉnh sửa và quản lý địa chỉ giao hàng của bạn</p>
            </div>
            <Button onClick={handleAddNew} className="bg-[#ff8600] ">
              <Plus className="w-5 h-5 mr-2" />
              Thêm địa chỉ mới
            </Button>
          </div>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
            <p className="text-gray-600 mb-6">Thêm địa chỉ đầu tiên để bắt đầu mua sắm</p>
            <Button onClick={handleAddNew} className="bg-[#ff8600] ">
              <Plus className="w-5 h-5 mr-2" />
              Thêm địa chỉ mới
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                  address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {address.isDefault && (
                      <span className="px-2 py-1 bg-[#ff8600] text-white text-xs font-medium rounded">
                        Mặc định
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900">{address.recipientName}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p>
                    <span className="font-medium">SĐT:</span> {address.recipientPhoneNumber}
                  </p>
                  <p>
                    <span className="font-medium">Địa chỉ:</span> {address.detailedAddress}
                  </p>
                  <p className="text-gray-600">
                    {address.ward}, {address.district}, {address.province}
                  </p>
                </div>

                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address)}
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Đặt làm mặc định
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <AddressModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAddress(undefined);
          }}
          address={editingAddress}
          customerId={customerId}
          onSuccess={() => {
            refetch();
          }}
        />
      </div>
    </div>
  );
}

