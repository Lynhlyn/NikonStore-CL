'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, CreditCard, Package, CheckCircle2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  useCreateOrderMutation,
  useCalculateShippingFeeMutation,
} from '@/lib/service/modules/orderService';
import { useEmailVerification } from '@/common/hooks/useEmailVerification';
import EmailVerificationModal from '@/common/components/EmailVerificationModal/EmailVerificationModal';
import type { CreateOrderRequest } from '@/lib/service/modules/orderService/type';
import { getCookie } from '@/common/utils/cartUtils';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/service/store';
import { fetchCart } from '@/lib/service/modules/cartService';
import { getCustomerIdFromToken } from '@/lib/service/modules/tokenService';
import { checkoutSchema, type CheckoutFormData } from './schemas/checkoutSchema';
import {
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
} from '@/lib/service/modules/ghnService';
import { useFetchCustomerByIdQuery } from '@/lib/service/modules/customerService';
import type { ShippingAddress } from '@/lib/service/modules/customerService/type';
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
import { Edit3, Plus, MapIcon } from 'lucide-react';
import Loader from '@/components/common/Loader';

interface CheckoutItem {
  cartDetailId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  productDetailId: number;
}


export default function CheckoutForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { customerId } = useAuth();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [calculateShippingFee] = useCalculateShippingFeeMutation();
  const { sendVerificationEmail } = useEmailVerification();
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [pendingOrderData, setPendingOrderData] = useState<CreateOrderRequest | null>(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [useSavedAddress, setUseSavedAddress] = useState(false);

  const { data: customerData, isLoading: isCustomerLoading } =
    useFetchCustomerByIdQuery(customerId!, {
      skip: !customerId,
    });

  const shippingAddresses =
    customerData?.data?.shippingAddresses || [];
  const currentAddress = shippingAddresses[selectedAddressId || 0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: yupResolver(checkoutSchema) as any,
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      recipientName: '',
      recipientPhone: '',
      recipientEmail: '',
      provinceId: null,
      districtId: null,
      wardCode: null,
      detailedAddress: '',
      notes: null,
      paymentMethod: 'cod',
    },
  });

  const formData = watch();

  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

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

  const provinces =
    provincesData?.data?.map((p) => ({
      id: p.ProvinceID,
      name: p.ProvinceName,
      value: p.ProvinceID,
      label: p.ProvinceName,
    })) || [];

  const districts =
    districtsData?.data?.map((d) => ({
      id: d.DistrictID,
      name: d.DistrictName,
      value: d.DistrictID,
      label: d.DistrictName,
    })) || [];

  const wards =
    wardsData?.data?.map((w) => ({
      id: w.WardCode,
      name: w.WardName,
      value: w.WardCode,
      label: w.WardName,
    })) || [];

  const selectedProvince = provinces.find(
    (p) => p.value === formData.provinceId
  );
  const selectedDistrict = districts.find(
    (d) => d.value === formData.districtId
  );
  const selectedWard = wards.find((w) => w.value === formData.wardCode);

  useEffect(() => {
    const calculateFee = async () => {
      if (
        !formData.districtId ||
        !formData.wardCode ||
        checkoutItems.length === 0 ||
        districtsLoading ||
        wardsLoading
      ) {
        setShippingFee(0);
        return;
      }

      setIsCalculatingShipping(true);
      try {
        const totalWeight = checkoutItems.reduce(
          (sum, item) => sum + (item.quantity * 0.5),
          0.5
        );

        const feeResponse = await calculateShippingFee({
          toDistrictId: formData.districtId,
          toWardCode: formData.wardCode,
          toProvinceName: selectedProvince?.name,
          weightKg: totalWeight,
          length: 25,
          width: 20,
          height: 10,
        }).unwrap();

        if (feeResponse.error) {
          console.error('Shipping fee error:', feeResponse.error);
          setShippingFee(30000);
        } else if (feeResponse.shippingFee !== undefined && feeResponse.shippingFee !== null) {
          setShippingFee(feeResponse.shippingFee);
        } else if (feeResponse.total !== undefined && feeResponse.total !== null) {
          setShippingFee(feeResponse.total);
        } else {
          setShippingFee(30000);
        }
      } catch (error) {
        console.error('Error calculating shipping fee:', error);
        setShippingFee(30000);
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    const timeoutId = setTimeout(calculateFee, 500);
    return () => clearTimeout(timeoutId);
  }, [
    formData.districtId,
    formData.wardCode,
    selectedProvince?.name,
    checkoutItems,
    districtsLoading,
    wardsLoading,
    calculateShippingFee,
  ]);

  useEffect(() => {
    const items = localStorage.getItem('checkoutItems');
    const total = localStorage.getItem('checkoutTotal');

    if (items && total) {
      try {
        const parsedItems = JSON.parse(items);
        const parsedTotal = Number.parseFloat(total);
        setCheckoutItems(parsedItems);
        setCheckoutTotal(parsedTotal);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (
      customerData?.data &&
      shippingAddresses.length > 0 &&
      provinces.length > 0
    ) {
      const defaultIdx = shippingAddresses.findIndex(
        (addr) => addr.isDefault
      );
      const addressToLoad =
        defaultIdx !== -1
          ? shippingAddresses[defaultIdx]
          : shippingAddresses[0];
      setSelectedAddressId(defaultIdx !== -1 ? defaultIdx : 0);
      setUseSavedAddress(true);
      loadAddressToForm(addressToLoad);
    }
  }, [customerData, provinces]);

  const loadAddressToForm = (address: ShippingAddress) => {
    setValue('recipientName', address.recipientName);
    setValue('recipientPhone', address.recipientPhoneNumber);
    setValue('recipientEmail', customerData?.data?.email || '');
    setValue('detailedAddress', address.detailedAddress);

    if (provinces.length > 0) {
      const province = provinces.find((p) =>
        p.name.toLowerCase().includes(address.province.toLowerCase()) ||
        address.province.toLowerCase().includes(p.name.toLowerCase())
      );
      if (province) {
        setValue('provinceId', province.value);
      }
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
        setValue('districtId', district.value);
      }
    }
  }, [formData.provinceId, districts, useSavedAddress, currentAddress, setValue]);

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
        setValue('wardCode', ward.value);
      }
    }
  }, [formData.districtId, wards, useSavedAddress, currentAddress, setValue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const calculateTotal = () => {
    return checkoutTotal + shippingFee;
  };

  const getClientIp = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '127.0.0.1';
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return '127.0.0.1';
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (checkoutItems.length === 0) {
      toast.error('Không có sản phẩm nào để đặt hàng');
      return;
    }

    const email = customerId ? customerData?.data?.email || data.recipientEmail : data.recipientEmail;
    const customerName = data.recipientName;

    const shippingAddress = [
      data.detailedAddress,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ]
      .filter(Boolean)
      .join(', ');

    const ipAddress = await getClientIp();

    const orderData: CreateOrderRequest = {
      customerId: customerId || null,
      cookieId: customerId ? null : getCookie('cookieId') || null,
      cartItems: checkoutItems.map((item) => ({
        cartdetailId: item.cartDetailId,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod: data.paymentMethod.toUpperCase(),
      voucherId: null,
      discount: null,
      notes: data.notes || null,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      recipientEmail: data.recipientEmail,
      shippingFee: shippingFee,
      orderType: 'ONLINE',
      toDistrictId: data.districtId || undefined,
      toWardCode: data.wardCode || undefined,
      ipAddress: ipAddress,
    };

    setPendingOrderData(orderData);
    setVerificationEmail(email);

    try {
      await sendVerificationEmail({
        email,
        customerName,
      });
      setShowVerificationModal(true);
    } catch (error: any) {
      toast.error('Không thể gửi email xác thực. Vui lòng thử lại.');
    }
  };

  const handlePlaceOrder = handleSubmit(onSubmit);

  const handleVerificationSuccess = async () => {
    if (!pendingOrderData) return;

    try {
      const order = await createOrder(pendingOrderData).unwrap();

      localStorage.setItem('orderData', JSON.stringify(order));
      localStorage.removeItem('checkoutItems');
      localStorage.removeItem('checkoutTotal');

      const customerIdForCart = customerId || getCustomerIdFromToken();
      const cookieId = getCookie('cookieId');
      
      if (customerIdForCart || cookieId) {
        dispatch(fetchCart({
          customerId: customerIdForCart || undefined,
          cookieId: cookieId || undefined,
        }));
      }

      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        router.push('/checkout/confirmation');
      }
    } catch (error: any) {
      console.error('Place order error:', error);
      const errorMessage =
        error.data?.message ||
        error.message ||
        'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    }
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={handleBackToCart}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại giỏ hàng</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất thông tin để đặt hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                                  setValue('recipientName', '');
                                  setValue('recipientPhone', '');
                                  setValue('detailedAddress', '');
                                  setValue('provinceId', null);
                                  setValue('districtId', null);
                                  setValue('wardCode', null);
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
                        {...register('recipientName')}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.recipientName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {errors.recipientName && (
                        <p className="mt-1 text-sm text-red-500">{errors.recipientName.message}</p>
                      )}
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('recipientPhone')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.recipientPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0123456789"
                    />
                    {errors.recipientPhone && (
                      <p className="mt-1 text-sm text-red-500">{errors.recipientPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('recipientEmail')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.recipientEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                    />
                    {errors.recipientEmail && (
                      <p className="mt-1 text-sm text-red-500">{errors.recipientEmail.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="provinceId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() || ''}
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          setValue('districtId', null);
                          setValue('wardCode', null);
                        }}
                        disabled={provincesLoading}
                      >
                        <SelectTrigger className={`w-full ${
                          errors.provinceId ? 'border-red-500' : ''
                        }`}>
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
                    )}
                  />
                  {errors.provinceId && (
                    <p className="mt-1 text-sm text-red-500">{errors.provinceId.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="districtId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                            setValue('wardCode', null);
                          }}
                          disabled={!formData.provinceId || districtsLoading}
                        >
                          <SelectTrigger className={`w-full ${
                            errors.districtId ? 'border-red-500' : ''
                          }`}>
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
                      )}
                    />
                    {errors.districtId && (
                      <p className="mt-1 text-sm text-red-500">{errors.districtId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="wardCode"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          disabled={!formData.districtId || wardsLoading}
                        >
                          <SelectTrigger className={`w-full ${
                            errors.wardCode ? 'border-red-500' : ''
                          }`}>
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
                      )}
                    />
                    {errors.wardCode && (
                      <p className="mt-1 text-sm text-red-500">{errors.wardCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('detailedAddress')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.detailedAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Số nhà, tên đường"
                  />
                  {errors.detailedAddress && (
                    <p className="mt-1 text-sm text-red-500">{errors.detailedAddress.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.notes ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ghi chú về đơn hàng..."
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>
                  )}
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
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        value="cod"
                        checked={field.value === 'cod'}
                        onChange={() => field.onChange('cod')}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 shrink-0 ${
                          field.value === 'cod'
                            ? 'border-blue-600 bg-[#ff8600]'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'cod' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  )}
                />
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        value="vnpay"
                        checked={field.value === 'vnpay'}
                        onChange={() => field.onChange('vnpay')}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 shrink-0 ${
                          field.value === 'vnpay'
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {field.value === 'vnpay' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  )}
                />
              </div>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-500">{errors.paymentMethod.message}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Đơn hàng của bạn
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {checkoutItems.map((item) => (
                  <div key={item.cartDetailId} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Số lượng: {item.quantity}
                      </p>
                      <div className="mt-1">
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {(item as any).discount > 0 && (
                          <>
                            <p className="text-xs text-gray-400 line-through">
                              {formatCurrency((item.price + (item as any).discount) * item.quantity)}
                            </p>
                            <p className="text-xs text-red-600 font-semibold">
                              Tiết kiệm: {formatCurrency((item as any).discount * item.quantity)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(checkoutTotal)}
                  </span>
                </div>
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

              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full mt-6 bg-[#ff8600]  text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Đặt hàng</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với các điều khoản và điều kiện
                của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>

      <EmailVerificationModal
        isOpen={showVerificationModal}
        email={verificationEmail}
        customerName={formData.recipientName || ''}
        onClose={() => setShowVerificationModal(false)}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
}

