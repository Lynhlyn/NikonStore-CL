'use client'

import React, { useState } from 'react'
import { useGetSessionsQuery, useRevokeSessionMutation } from '@/lib/service/modules/authService'
import { SessionResponse } from '@/lib/service/modules/authService/type'
import { tokenManager } from '@/common/utils/tokenManager'
import { toast } from 'sonner'
import Loader from '@/components/common/Loader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const SessionManagement: React.FC = () => {
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const refreshToken = tokenManager.getRefreshToken()
  const { data: sessions, isLoading, refetch } = useGetSessionsQuery(
    { refreshToken: refreshToken || '' },
    { skip: !refreshToken }
  )

  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation()

  const handleDeleteClick = (tokenId: number) => {
    setSessionToDelete(tokenId)
    setShowConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return

    const sessionToDeleteObj = sessions?.find((s) => s.tokenId === sessionToDelete)
    const isCurrentSession = sessionToDeleteObj?.isCurrent

    try {
      await revokeSession({ tokenId: sessionToDelete }).unwrap()
      toast.success('Đã xóa phiên đăng nhập thành công')
      setShowConfirm(false)
      setSessionToDelete(null)
      
      if (isCurrentSession) {
        setTimeout(() => {
          tokenManager.clearTokens()
          window.location.href = '/login'
        }, 1000)
      } else {
        refetch()
      }
    } catch (error: unknown) {
      const err = error as { data?: { error?: string; message?: string }; message?: string; status?: number }
      console.error('Error revoking session:', err)
      toast.error(err?.data?.message || err?.message || 'Xóa phiên đăng nhập thất bại')
    }
  }

  const handleCancelDelete = () => {
    setShowConfirm(false)
    setSessionToDelete(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDeviceInfo = (session: SessionResponse | undefined) => {
    if (!session) return 'Thiết bị không xác định'
    
    const parts: string[] = []
    if (session.deviceName && session.deviceName !== 'Unknown Device') {
      parts.push(session.deviceName)
    }
    if (session.browserName && session.browserName !== 'Unknown') {
      parts.push(session.browserName)
    }
    if (session.deviceType && session.deviceType !== 'Unknown') {
      parts.push(session.deviceType)
    }

    if (parts.length === 0) {
      return 'Thiết bị không xác định'
    }

    return parts.join(' - ')
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center py-8">
          <Loader />
        </div>
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quản lý phiên đăng nhập</h3>
        <p className="text-gray-600">Không có phiên đăng nhập nào đang hoạt động</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quản lý phiên đăng nhập</h3>
      <p className="text-sm text-gray-600 mb-6">
        Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn. Bạn có thể xóa bất kỳ phiên đăng nhập nào để buộc đăng nhập lại.
      </p>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.tokenId}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-medium text-gray-900">{formatDeviceInfo(session)}</h4>
                {session.isCurrent && (
                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Phiên hiện tại
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Đăng nhập lúc: {formatDate(session.createdAt)}</p>
                {session.ipAddress && <p>IP: {session.ipAddress}</p>}
              </div>
            </div>
            {!session.isCurrent && (
              <button
                onClick={() => handleDeleteClick(session.tokenId)}
                disabled={isRevoking}
                className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xóa
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Xác nhận xóa phiên đăng nhập"
        message="Bạn có chắc chắn muốn xóa phiên đăng nhập này không?"
        warningMessage={sessionToDelete && sessions?.find((s) => s.tokenId === sessionToDelete)?.isCurrent 
          ? 'Đây là phiên đăng nhập hiện tại. Bạn sẽ bị đăng xuất sau khi xóa.'
          : undefined}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isRevoking}
        variant="danger"
      />
    </div>
  )
}

export default SessionManagement

