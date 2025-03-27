  import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
  import { AxiosError } from "axios";
  import { authService } from "../apiConfig";

  interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
    error: string | null;
  }

  const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
  };

  // Define a type for the thunk API
  interface ThunkApiConfig {
    rejectValue: string;
  }

  // Register User
  export const registerUser = createAsyncThunk<any, any, ThunkApiConfig>(
    "auth/register",
    async (formData, { rejectWithValue }) => {
      try {
        const response = await authService.post("/register", formData);
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        console.error("Error in API call:", error.response?.data);
        return rejectWithValue(
          (error.response?.data as string) || "Registration failed"
        );
      }
    }
  );

  // Login User
  export const loginUser = createAsyncThunk<any, any, ThunkApiConfig>(
    "auth/login",
    async (formData, { rejectWithValue }) => {
      try {
        const response = await authService.post("/login", formData);
        const { token } = response.data;
        if (token) {
          localStorage.setItem("accessToken", token);
          authService.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
        }
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        console.error("Error in API call:", error.response?.data);
        return rejectWithValue(
          (error.response?.data as string) || "Login failed"
        );
      }
    }
  );

  // Verify User
  export const verifyUser = createAsyncThunk<any, any, ThunkApiConfig>(
    "auth/verify",
    async (formData, { rejectWithValue }) => {
      try {
        const response = await authService.patch("/verify-email", formData);
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        console.error("Error in API call:", error.response?.data);
        return rejectWithValue(
          (error.response?.data as string) || "Verification failed"
        );
      }
    }
  );

  // Resend OTP
  export const resendOtp = createAsyncThunk<any, any, ThunkApiConfig>(
    "auth/resendOtp",
    async (formData, { rejectWithValue }) => {
      try {
        const response = await authService.post("/resend-otp", formData);
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        console.error("Error in API call:", error.response?.data);
        return rejectWithValue(
          (error.response?.data as string) || "Resend OTP failed"
        );
      }
    }
  );

  // Change Password
  export const changePassword = createAsyncThunk<any, any, ThunkApiConfig>(
    "auth/changePassword",
    async (formData, { rejectWithValue }) => {
      try {
        const response = await authService.patch("/password", formData);
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        console.error("Error in API call:", error.response?.data);
        return rejectWithValue(
          (error.response?.data as string) || "Change password failed"
        );
      }
    }
  );

  // Validate Token
  export const validateToken = createAsyncThunk<any, void, ThunkApiConfig>(
    "auth/validateToken",
    async (_, { rejectWithValue }) => {
      try {
        const response = await authService.get("/validate");
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        console.error("Error in API call:", error.response?.data);
        localStorage.removeItem("accessToken");
        delete authService.defaults.headers.common["Authorization"];
        return rejectWithValue(
          (error.response?.data as string) || "Token validation failed"
        );
      }
    }
  );

  // Forgot Password
  export const forgotPassword = createAsyncThunk<any, any, ThunkApiConfig>(
    "auth/forgotPassword",
    async (formData, { rejectWithValue }) => {
      try {
        const response = await authService.post("/forgot-password", formData);
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        console.error("Error in API call:", error.response?.data);
        return rejectWithValue(
          (error.response?.data as string) || "Forgot password failed"
        );
      }
    }
  );

  // Validate Reset Token
  export const validateResetToken = createAsyncThunk<any, string, ThunkApiConfig>(
    "auth/validateResetToken",
    async (token, { rejectWithValue }) => {
      try {
        const response = await authService.get(`/reset-password/${token}`);
        return response.data;
      } catch (err) {
        const error = err as AxiosError;
        console.error("Error in API call:", error.response?.data);
        return rejectWithValue(
          (error.response?.data as string) || "Reset token validation failed"
        );
      }
    }
  );

  // Reset Password
  export const resetPassword = createAsyncThunk<
    any,
    { token: string; password: string },
    ThunkApiConfig
  >("auth/resetPassword", async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.post(`/reset-password/${token}`, {
        password,
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error("Error in API call:", error.response?.data);
      return rejectWithValue(
        (error.response?.data as string) || "Reset password failed"
      );
    }
  });

  const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      setUser: (state, action: PayloadAction<{ user: any }>) => {
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.error = null;
      },
      clearError: (state) => {
        state.error = null; // Clear error state
      },
    },
    extraReducers: (builder) => {
      builder
        // Register User
        .addCase(registerUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(registerUser.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })

        // Login User
        .addCase(loginUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(loginUser.rejected, (state, action) => {
          state.isLoading = false;
          state.user = null;
          state.isAuthenticated = false;
          state.error = action.payload as string;
        })

        // Verify User
        .addCase(verifyUser.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(verifyUser.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(verifyUser.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })

        // Resend OTP
        .addCase(resendOtp.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(resendOtp.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(resendOtp.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })

        // Change Password
        .addCase(changePassword.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(changePassword.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(changePassword.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })

        // Validate Token
        .addCase(validateToken.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(validateToken.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(validateToken.rejected, (state, action) => {
          state.isLoading = false;
          state.user = null;
          state.isAuthenticated = false;
          state.error = action.payload as string;
        })

        // Forgot Password
        .addCase(forgotPassword.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(forgotPassword.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(forgotPassword.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })

        // Validate Reset Token
        .addCase(validateResetToken.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(validateResetToken.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(validateResetToken.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })

        // Reset Password
        .addCase(resetPassword.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user || null;
          state.isAuthenticated = !!action.payload.user;
        })
        .addCase(resetPassword.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        });
    },
  });

  // Actions
  export const { setUser, clearError } = authSlice.actions;

  // Reducer
  export default authSlice.reducer;
