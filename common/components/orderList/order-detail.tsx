"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/core/shadcn/components/ui/button"
import { Card } from "@/core/shadcn/components/ui/card"
import { Badge } from "@/core/shadcn/components/ui/badge"
import { Separator } from "@/core/shadcn/components/ui/separator"
import Image from "next/image"
import { useGetOrderByIdQuery } from "@/lib/service/modules/orderService"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface OrderDetailProps {
  orderId: number;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();

  const { data: order, isLoading } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Đang tải dữ liệu đơn hàng...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  const products = order.orderDetails?.map((item: any) => ({
    name: item.productName,
    sku: item.sku,
    quantity: item.quantity,
    price: item.finalPrice || item.price || 0,
    image: item.imageUrl || item.image || "/placeholder.svg",
    color: item.colorName || item.color || item.productColor || item.variantColor || "-",
    brand: item.brandName || item.brand || "-",
    size: item.dimensions || item.size || item.productSize || "-",
  })) || [];

  const customer = {
    name: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail,
    address: order.shippingAddress
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 3:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Chờ xác nhận</Badge>;
      case 4:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Đã xác nhận</Badge>;
      case 5:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đang giao</Badge>;
      case 6:
        return <Badge className="bg-green-200 text-green-900 hover:bg-green-200">Hoàn thành</Badge>;
      case 7:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Đã hủy</Badge>;
      case 8:
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Chờ thanh toán</Badge>;
      case 12:
        return <Badge className="bg-red-200 text-red-900 hover:bg-red-200">Giao hàng thất bại</Badge>;
      case 13:
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Đang chuẩn bị hàng</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Không xác định</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const query = new URLSearchParams(window.location.search).toString();
            router.push(`/orders?${query}`);
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold">Chi tiết đơn hàng #{order.trackingNumber}</h1>
          <p className="text-sm text-gray-600">Xem và quản lý các đơn hàng của bạn</p>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
          <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 mb-4">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-center">Tạm tính</div>
          </div>
          {products.map((product: any, index: number) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-4 border-b last:border-b-0"
            >
              <div className="sm:col-span-6 flex items-center gap-3">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {product.sku || "-"}</p>
                  <p className="text-sm text-gray-600">Màu: {product.color || "-"}</p>
                  <p className="text-sm text-gray-600">Thương hiệu: {product.brand || "-"}</p>
                  <p className="text-sm text-gray-600">Kích thước: {product.size || "-"}</p>
                </div>
              </div>
              <div className="sm:col-span-2 sm:text-center">
                <span className="sm:hidden font-medium">Đơn giá: </span>
                {product.price?.toLocaleString("vi-VN")}đ
              </div>
              <div className="sm:col-span-2 sm:text-center">
                <span className="sm:hidden font-medium">Số lượng: </span>
                {product.quantity}
              </div>
              <div className="sm:col-span-2 sm:text-center font-medium">
                <span className="sm:hidden">Tạm tính: </span>
                {(product.price * product.quantity)?.toLocaleString("vi-VN")}đ
              </div>
            </div>
          ))}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">📧 Thông tin khách hàng</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Họ tên: </span>
                <span>{customer.name}</span>
              </div>
              <div>
                <span className="font-medium">SĐT: </span>
                <span>{customer.phone}</span>
              </div>
              <div>
                <span className="font-medium">Email: </span>
                <span>{customer.email}</span>
              </div>
              <div>
                <span className="font-medium">Địa chỉ: </span>
                <span>{customer.address}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{order.orderDetails && order.orderDetails.reduce((sum: number, item: any) => sum + (item.finalPrice || item.price || 0) * item.quantity, 0).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{order.shippingFee?.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá:</span>
                <span>-{order.discount?.toLocaleString("vi-VN")}đ</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span>{(
                  (order.orderDetails && order.orderDetails.reduce((sum: number, item: any) => sum + (item.finalPrice || item.price || 0) * item.quantity, 0) || 0)
                  + (order.shippingFee || 0)
                  - (order.discount || 0)
                ).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Trạng thái:</span>
                {getStatusBadge(order.orderStatus)}
              </div>
            </div>
          </Card>
        </div>

        {order.note && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-yellow-800">Ghi chú đơn hàng</h2>
            </div>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <p className="text-gray-800 font-medium">{order.note}</p>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-gradient-to-br from-slate-50 to-white border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Thông tin thanh toán</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Phương thức</span>
                <span className="text-lg font-semibold text-slate-800">
                  {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 
                    (order.paymentMethod === 'vnpay' || order.paymentMethod === 'bank_transfer') ? 'Chuyển khoản ngân hàng' :
                    order.paymentMethod === 'cash' ? 'Thanh toán tiền mặt' :
                    order.paymentMethod === 'card' ? 'Thẻ tín dụng/ghi nợ' :
                    order.paymentMethod}
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide block">Ngày đặt hàng</span>
                    <span className="text-lg font-semibold text-slate-800">{order.orderDate ? format(new Date(order.orderDate), "dd/MM/yyyy") : ""}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide block">Thời gian</span>
                    <span className="text-lg font-semibold text-slate-800">{order.orderDate ? format(new Date(order.orderDate), "HH:mm") : ""}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

