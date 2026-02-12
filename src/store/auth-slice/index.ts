import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { authService } from "../apiConfig";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  registrationSuccess: boolean;
  error: string | null;
  resetPasswordLoading: boolean;
  resetPasswordError: string | null;
  resetPasswordSuccess: boolean;
  emailSent: boolean;
  forgotPasswordError: string | null;
  tokenValidationInProgress: boolean;
}

const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

const initialUser =
  token && username
    ? {
        username,
        role,
        id: localStorage.getItem("userId") || undefined,
        email: localStorage.getItem("email") || undefined,
        firstName: localStorage.getItem("firstName") || undefined,
        lastName: localStorage.getItem("lastName") || undefined,
      }
    : null;

const initialState: AuthState = {
  isAuthenticated: !!token,
  isLoading: false,

  user: initialUser,
  registrationSuccess: false,
  error: null,
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
  emailSent: false,
  forgotPasswordError: null,
  tokenValidationInProgress: !!token, // Track validation status
};

if (token) {
  authService.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

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
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        // Store complete user data in localStorage
        if (user) {
          localStorage.setItem("username", user.username || "");
          localStorage.setItem("role", user.role || "");
          if (user.id) localStorage.setItem("userId", user.id);
          if (user.email) localStorage.setItem("email", user.email);
          if (user.firstName) localStorage.setItem("firstName", user.firstName);
          if (user.lastName) localStorage.setItem("lastName", user.lastName);
        }
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
export const verifyEmail = createAsyncThunk<any, any, ThunkApiConfig>(
  "auth/verifyEmail",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authService.patch("/verify-email", formData);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error("Error in API call:", error.response?.data);
      return rejectWithValue(
        (error.response?.data as string) || "Email verification failed"
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
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }

      authService.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const username = localStorage.getItem("username");
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");
      const email = localStorage.getItem("email");
      const firstName = localStorage.getItem("firstName");
      const lastName = localStorage.getItem("lastName");

      if (username && role) {
        dispatch(
          setUser({
            user: {
              username,
              role,
              id: userId,
              email,
              firstName,
              lastName,
            },
          })
        );
      }

      const response = await authService.get("/validate");

      if (response.data && response.data.user) {
        const user = response.data.user;
        localStorage.setItem("username", user.username || "");
        localStorage.setItem("role", user.role || "");
        if (user.id) localStorage.setItem("userId", user.id);
        if (user.email) localStorage.setItem("email", user.email);
        if (user.firstName) localStorage.setItem("firstName", user.firstName);
        if (user.lastName) localStorage.setItem("lastName", user.lastName);
      }

      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error("Error in API call:", error.response?.data);

      const status = error.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        delete authService.defaults.headers.common["Authorization"];
      }

      return rejectWithValue(
        (error.response?.data as string) || "Token validation failed"
      );
    }
  }
);

export const reconstructUserFromStorage = createAsyncThunk<
  any,
  void,
  ThunkApiConfig
>("auth/reconstructUserFromStorage", async (_, { dispatch }) => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("email");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  if (token) {
    authService.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return {
      user: {
        username,
        role,
        id: userId,
        email,
        firstName,
        lastName,
      },
    };
  }

  return { user: null };
});

// Forgot Password
export const forgotPassword = createAsyncThunk<any, any, ThunkApiConfig>(
  "auth/forgotPassword",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authService.post("/forgot-password", formData);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      console.error("Error in API call:", error.response?.data);
      const errorMessage = error.response?.data?.error || "Forgot password failed";
      return rejectWithValue(errorMessage);
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

// Logout
export const logout = createAsyncThunk<void, void>("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
  delete authService.defaults.headers.common["Authorization"];
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
    clearRegistrationState: (state) => {
      state.registrationSuccess = false;
    },
    initializeFromLocalStorage: (state) => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");
      const email = localStorage.getItem("email");
      const firstName = localStorage.getItem("firstName");
      const lastName = localStorage.getItem("lastName");

      if (token) {
        authService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        state.isAuthenticated = true;
        state.user = {
          username,
          role,
          id: userId || undefined,
          email: email || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        };
      } else {
        state.isAuthenticated = false;
        state.user = null;
      }
    },
    clearAuth: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("email");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      delete authService.defaults.headers.common["Authorization"];

      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
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
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.registrationSuccess = false;
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
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
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
        state.tokenValidationInProgress = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokenValidationInProgress = false;
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.isLoading = false;
        state.tokenValidationInProgress = false;

        const errorMsg = action.payload as string;
        if (
          errorMsg &&
          (errorMsg.includes("unauthorized") ||
            errorMsg.includes("Unauthorized") ||
            errorMsg.includes("token") ||
            errorMsg.includes("Token") ||
            errorMsg.includes("auth") ||
            errorMsg.includes("Auth"))
        ) {
          state.user = null;
          state.isAuthenticated = false;
          state.error = errorMsg;
        } else {
          state.error = errorMsg;
        }
      })

      .addCase(reconstructUserFromStorage.fulfilled, (state, action) => {
        if (action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(reconstructUserFromStorage.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.emailSent = false;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.emailSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.forgotPasswordError = action.payload as string;
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
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload as string;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

// Actions
export const {
  setUser,
  clearError,
  clearRegistrationState,
  initializeFromLocalStorage,
  clearAuth,
} = authSlice.actions;

// Reducer
export default authSlice.reducer;
