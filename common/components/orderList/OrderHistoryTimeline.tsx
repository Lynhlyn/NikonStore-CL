"use client"

import { Badge } from "@/core/shadcn/components/ui/badge"
import { Card } from "@/core/shadcn/components/ui/card"
import { Clock, User, CheckCircle2, Circle, XCircle, Loader2 } from "lucide-react"
import { useSearchOrderHistoryQuery } from "@/lib/service/modules/orderService"

interface IOrderHistoryTimelineProps {
  trackingNumber: string
}

const getStatusLabel = (status: number | null) => {
  if (status === null) return 'Không xác định'
  const statusMap: { [key: number]: string } = {
    3: 'Chờ xác nhận',
    4: 'Đã xác nhận',
    5: 'Đang giao hàng',
    6: 'Đã hoàn thành',
    7: 'Đã hủy',
    8: 'Chờ thanh toán',
    12: 'Giao hàng thất bại',
    13: 'Đang chuẩn bị hàng'
  }
  return statusMap[status] || 'Không xác định'
}

const getStatusColor = (status: number | null) => {
  if (status === null) return 'bg-gray-50 text-gray-700 border-gray-200'
  return (
    status === 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
      status === 4 ? 'bg-blue-50 text-blue-700 border-blue-200' :
        status === 5 ? 'bg-orange-50 text-orange-700 border-orange-200' :
          status === 6 ? 'bg-green-50 text-green-700 border-green-200' :
            status === 7 ? 'bg-red-50 text-red-700 border-red-200' :
              status === 8 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                status === 12 ? 'bg-red-50 text-red-700 border-red-200' :
                  status === 13 ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
  )
}

const getStatusIcon = (status: number | null) => {
  if (status === null) return <Circle className="h-5 w-5" />
  if (status === 6) return <CheckCircle2 className="h-5 w-5" />
  if (status === 7 || status === 12) return <XCircle className="h-5 w-5" />
  return <Circle className="h-5 w-5" />
}

const getChangeByTypeLabel = (changeByType: string | null | undefined) => {
  if (!changeByType) return 'Hệ thống'
  const typeMap: { [key: string]: string } = {
    'staff': 'Nhân viên',
    'admin': 'Quản lý',
    'customer': 'Khách hàng',
    'system': 'Hệ thống',
    'STAFF': 'Nhân viên',
    'ADMIN': 'Quản lý',
    'CUSTOMER': 'Khách hàng',
    'SYSTEM': 'Hệ thống'
  }
  return typeMap[changeByType] || changeByType
}

export function OrderHistoryTimeline({ trackingNumber }: IOrderHistoryTimelineProps) {
  const { data: historyResponse, isLoading } = useSearchOrderHistoryQuery({
    trackingNumber,
    size: 100,
    page: 0,
  }, {
    skip: !trackingNumber,
    refetchOnMountOrArgChange: true,
  })

  const histories = historyResponse?.data || []

  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Đang tải lịch sử...</span>
        </div>
      </Card>
    )
  }

  if (histories.length === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold">Lịch sử thay đổi đơn hàng</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có lịch sử thay đổi nào</p>
        </div>
      </Card>
    )
  }

  const sortedHistories = [...histories].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Lịch sử thay đổi đơn hàng</h3>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-purple-300 to-purple-200"></div>
        
        <div className="space-y-6">
          {sortedHistories.map((history: any, index: number) => {
            const isLast = index === sortedHistories.length - 1
            const statusAfterColor = getStatusColor(history.statusAfter)
            const statusBeforeColor = history.statusBefore ? getStatusColor(history.statusBefore) : ''
            
            return (
              <div key={index} className="relative flex gap-4">
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${
                  history.statusAfter === 6 ? 'bg-green-500' :
                  history.statusAfter === 7 || history.statusAfter === 12 ? 'bg-red-500' :
                  'bg-purple-500'
                }`}>
                  {getStatusIcon(history.statusAfter)}
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current"></div>
                </div>
                
                <div className="flex-1 pb-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {history.statusBefore && (
                            <>
                              <Badge className={`${statusBeforeColor} border font-medium px-2.5 py-0.5 text-xs`}>
                                {getStatusLabel(history.statusBefore)}
                              </Badge>
                              <span className="text-gray-400">→</span>
                            </>
                          )}
                          <Badge className={`${statusAfterColor} border font-medium px-2.5 py-0.5 text-xs`}>
                            {getStatusLabel(history.statusAfter)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{history.notes}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(history.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Thay đổi bởi: <span className="font-medium text-gray-700">{history.changeByName || 'Hệ thống'}</span>
                      </span>
                      {history.changeByType && (
                        <span className="text-xs text-gray-400">({getChangeByTypeLabel(history.changeByType)})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

