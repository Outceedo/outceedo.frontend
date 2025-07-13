import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import profileReducer from "../store/profile-slice";
import subscriptionReducer from "./plans-slice/index";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    subscription: subscriptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
