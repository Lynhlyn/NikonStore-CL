"use client"

import createWebStorage from "redux-persist/lib/storage/createWebStorage"

interface NoopStorageReturnType {
  getItem: (_key: string) => Promise<null>
  setItem: (_key: string, value: string) => Promise<string>
  removeItem: (_key: string) => Promise<void>
}

const createNoopStorage = (): NoopStorageReturnType => {
  return {
    getItem(): Promise<null> {
      return Promise.resolve(null)
    },
    setItem(_, value: string): Promise<string> {
      return Promise.resolve(value)
    },
    removeItem(): Promise<void> {
      return Promise.resolve()
    },
  }
}

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage()

export default storage

