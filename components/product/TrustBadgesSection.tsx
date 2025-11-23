"use client"

import { Shield, Truck, RotateCcw, Award } from "lucide-react"

const badges = [
  {
    icon: Shield,
    title: "Bảo hành chính hãng",
    description: "Bảo hành 12 tháng",
  },
  {
    icon: Truck,
    title: "Miễn phí vận chuyển",
    description: "Cho đơn hàng từ 500k",
  },
  {
    icon: RotateCcw,
    title: "Đổi trả dễ dàng",
    description: "Trong vòng 7 ngày",
  },
  {
    icon: Award,
    title: "Chất lượng đảm bảo",
    description: "100% chính hãng",
  },
]

export default function TrustBadgesSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <div
            key={index}
            className="flex flex-col items-center text-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-2">
              <Icon className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">
              {badge.title}
            </h4>
            <p className="text-xs text-gray-600">{badge.description}</p>
          </div>
        )
      })}
    </div>
  )
}

