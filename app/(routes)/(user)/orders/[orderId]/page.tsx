"use client"

import { useRouter, useParams } from "next/navigation";
import { OrderDetail } from "@/common/components/orderList/order-detail";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  let orderId: number = 0;
  if (params?.orderId) {
    if (Array.isArray(params.orderId)) {
      orderId = Number(params.orderId[0]);
    } else {
      orderId = Number(params.orderId);
    }
  }

  return (
    <OrderDetail orderId={orderId} />
  );
}

