"use client"

import React, { useEffect } from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { persistor, store } from "../service/store"
import { useAppDispatch } from "../hooks/redux"
import { setCustomerId } from "../features/appSlice"
import { getCustomerIdFromToken } from "../service/modules/tokenService"

interface ProvidersProps {
  children: React.ReactNode
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const customerId = getCustomerIdFromToken()
    if (customerId) {
      dispatch(setCustomerId(customerId))
    }
  }, [dispatch])

  return <>{children}</>
}

export function ReduxProvider({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-600">Đang tải...</div>
          </div>
        } 
        persistor={persistor}
      >
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </PersistGate>
    </Provider>
  )
}
