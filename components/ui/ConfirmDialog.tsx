'use client'

import React from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  warningMessage?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  warningMessage,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger'
}) => {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      title: 'text-red-600',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      title: 'text-yellow-600',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      title: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className={`text-lg font-semibold mb-4 text-center ${styles.title}`}>
          {title}
        </h3>
        <div className="mb-6 text-center text-gray-700">
          <p className="mb-2">
            {message}
          </p>
          {warningMessage && (
            <p className="text-sm text-red-600 font-medium">
              ⚠️ {warningMessage}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-400 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

