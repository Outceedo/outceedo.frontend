import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface SubscriptionState {
  isActive: boolean;
  planId: string | null;
  expiryDate: string | null;
  planName: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  isActive: false,
  planId: null,
  expiryDate: null,
  planName: null,
  loading: false,
  error: null,
};

export const fetchSubscriptionStatus = createAsyncThunk(
  "subscription/fetchStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_PORT}/api/v1/subscription/status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch subscription status"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    resetSubscription: (state) => {
      state.isActive = false;
      state.planId = null;
      state.expiryDate = null;
      state.planName = null;
      state.loading = false;
      state.error = null;
    },
    updateSubscriptionStatus: (
      state,
      action: PayloadAction<{
        isActive: boolean;
        planId: string;
        expiryDate: string;
        planName: string;
      }>
    ) => {
      state.isActive = action.payload.isActive;
      state.planId = action.payload.planId;
      state.expiryDate = action.payload.expiryDate;
      state.planName = action.payload.planName;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isActive = action.payload.isActive;
        state.planId = action.payload.planId;
        state.expiryDate = action.payload.expiryDate;
        state.planName = action.payload.planName;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSubscriptionError,
  resetSubscription,
  updateSubscriptionStatus,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
