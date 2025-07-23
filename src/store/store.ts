import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import profileReducer from "../store/profile-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    // Add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
