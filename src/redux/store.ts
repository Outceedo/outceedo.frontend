// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import modalReducer from "./slicer/modalSlice"; // import your modal reducer
// Import your reducers here
// Example: import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    modal: modalReducer, // user: userReducer,
  },
  // middleware, devTools and other options can be configured here
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for usage throughout your app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
