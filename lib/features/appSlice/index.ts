import { type PayloadAction, createSlice } from "@reduxjs/toolkit"
import type { IAppState } from "./type"

const initialState: IAppState = {
  isLoading: false,
  cartCount: 0,
  currentPage: "home",
  loadingMessage: "",
  error: null,
  customerId: null,
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (!action.payload) {
        state.loadingMessage = ""
        state.error = null
      }
    },
    setLoadingWithMessage: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading
      state.loadingMessage = action.payload.message || ""
      if (!action.payload.isLoading) {
        state.error = null
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
      state.loadingMessage = ""
    },
    clearError: (state) => {
      state.error = null
    },
    setCartCount: (state, action: PayloadAction<number>) => {
      state.cartCount = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload
    },
    incrementCartCount: (state) => {
      state.cartCount += 1
    },
    decrementCartCount: (state) => {
      if (state.cartCount > 0) {
        state.cartCount -= 1
      }
    },
    setCustomerId: (state, action: PayloadAction<number | null>) => {
      state.customerId = action.payload
    },
  },
})

export const { 
  setIsLoading, 
  setLoadingWithMessage,
  setError,
  clearError,
  setCartCount, 
  setCurrentPage, 
  incrementCartCount, 
  decrementCartCount,
  setCustomerId
} = appSlice.actions

export default appSlice.reducer

