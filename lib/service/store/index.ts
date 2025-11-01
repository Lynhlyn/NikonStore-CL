import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE
} from "redux-persist"
import { appSlice } from "../../features/appSlice"
import { apiSlice } from "../api"
import storage from "./localStorage"

const rootReducer = combineReducers({
  app: appSlice.reducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
})

const persistConfig = {
  key: "root",
  storage: storage,
  whitelist: ["app"],
  blacklist: ["api"],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
})

const persistor = persistStore(store)

setupListeners(store.dispatch)

export const makeStore = () => store
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
export { persistor, store }

