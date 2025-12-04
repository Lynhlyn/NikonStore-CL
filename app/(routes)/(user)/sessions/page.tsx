'use client'

import React from 'react'
import SessionManagement from '@/common/components/personal/SessionManagement'

const SessionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Quản lý phiên đăng nhập</h1>
          <p className="text-gray-600">Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn</p>
        </div>
        <SessionManagement />
      </div>
    </div>
  )
}

export default SessionsPage

