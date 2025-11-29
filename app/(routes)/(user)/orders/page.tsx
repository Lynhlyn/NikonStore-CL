"use client"

import { OrderList } from "@/common/components/orderList/order-list" 

export default function OrderManagement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <OrderList onSelectOrder={() => {}} />
    </div>
  )
}

