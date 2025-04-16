import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { userService } from "../apiConfig";

// Define Role type instead of importing from Prisma
type Role = "player" | "expert" | "admin";

// Define types
interface Profile {
  id: string;
  username: string;
  role: Role;
  [key: string]: any; // For additional fields based on role
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  additionalDetails?: string;
  [key: string]: any;
}

interface ExpertService extends Service {
  expertId: string;
  serviceId: string;
  price: number;
  additionalDetails?: string;
}

interface ProfileState {
  currentProfile: Profile | null;
  viewedProfile: Profile | null;
  profiles: {
    data: Profile[];
    page: number;
    limit: number;
    total: number;
  };
  platformServices: Service[];
  expertServices: ExpertService[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProfileState = {
  currentProfile: null,
  viewedProfile: null,
  profiles: {
    data: [],
    page: 1,
    limit: 10,
    total: 0,
  },
  platformServices: [],
  expertServices: [],
  status: "idle",
  error: null,
};

// Helper function to get role from localStorage
const getRoleFromStorage = (): Role | null => {
  const role = localStorage.getItem("role") as Role;
  if (role && ["player", "expert", "admin"].includes(role)) {
    return role;
  }
  return null;
};

// Create profile thunk
export const createProfile = createAsyncThunk(
  "profile/createProfile",
  async (
    { role, profileData }: { role: Role; profileData: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await userService.post("/profile", {
        role,
        profileData,
      });
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create profile"
      );
    }
  }
);

// Update profile thunk
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await userService.patch("/profile", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update profile"
      );
    }
  }
);

// Get profile thunk
export const getProfile = createAsyncThunk(
  "profile/getProfile",
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await userService.get(`/profile/${username}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get profile"
      );
    }
  }
);

// Get profiles thunk
export const getProfiles = createAsyncThunk(
  "profile/getProfiles",
  async (
    { page, limit, userType }: { page: number; limit: number; userType: Role },
    { rejectWithValue }
  ) => {
    try {
      const response = await userService.get("/profiles", {
        params: { page, limit, userType },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get profiles"
      );
    }
  }
);

// Update profile photo thunk
export const updateProfilePhoto = createAsyncThunk(
  "profile/updateProfilePhoto",
  async (photoFile: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);

      const response = await userService.patch("/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update profile photo"
      );
    }
  }
);

// Get platform services thunk
export const getPlatformServices = createAsyncThunk(
  "profile/getPlatformServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.get("/services");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get services"
      );
    }
  }
);

// Add expert service thunk
export const addExpertService = createAsyncThunk(
  "profile/addExpertService",
  async (
    {
      serviceId,
      price,
      additionalDetails,
    }: { serviceId: string; price: number; additionalDetails?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await userService.post(`/profile/service/${serviceId}`, {
        price,
        additionalDetails,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add expert service"
      );
    }
  }
);

// Update expert service thunk
export const updateExpertService = createAsyncThunk(
  "profile/updateExpertService",
  async (
    {
      serviceId,
      price,
      additionalDetails,
    }: { serviceId: string; price?: number; additionalDetails?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await userService.patch(
        `/profile/service/${serviceId}`,
        {
          price,
          additionalDetails,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update expert service"
      );
    }
  }
);

// Delete expert service thunk
export const deleteExpertService = createAsyncThunk(
  "profile/deleteExpertService",
  async (serviceId: string, { rejectWithValue }) => {
    try {
      const response = await userService.delete(
        `/profile/service/${serviceId}`
      );
      return { serviceId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete expert service"
      );
    }
  }
);

// Get expert services thunk
export const getExpertServices = createAsyncThunk(
  "profile/getExpertServices",
  async (expertId: string, { rejectWithValue }) => {
    try {
      const response = await userService.get(
        `/profile/expert/${expertId}/services`
      );
      return { expertId, services: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get expert services"
      );
    }
  }
);

// Create the profile slice
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    resetProfileState: (state) => {
      return initialState;
    },
    resetProfileStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    // Add action to set current profile from localStorage
    setCurrentProfileFromStorage: (state) => {
      const role = getRoleFromStorage();
      if (state.currentProfile && role) {
        state.currentProfile.role = role;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create profile
      .addCase(createProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createProfile.fulfilled,
        (state, action: PayloadAction<Profile>) => {
          state.status = "succeeded";
          state.currentProfile = action.payload;
          // Store role in localStorage
          localStorage.setItem("role", action.payload.role);
        }
      )
      .addCase(createProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<Profile>) => {
          state.status = "succeeded";
          state.currentProfile = action.payload;
          // Update role in localStorage if it changed
          if (action.payload.role) {
            localStorage.setItem("role", action.payload.role);
          }
          // If the viewed profile is the same as the current profile, update it as well
          if (
            state.viewedProfile &&
            state.viewedProfile.id === action.payload.id
          ) {
            state.viewedProfile = action.payload;
          }
        }
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Get profile
      .addCase(getProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        getProfile.fulfilled,
        (state, action: PayloadAction<Profile>) => {
          state.status = "succeeded";
          state.viewedProfile = action.payload;
        }
      )
      .addCase(getProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Get profiles
      .addCase(getProfiles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getProfiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profiles = action.payload;
      })
      .addCase(getProfiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update profile photo
      .addCase(updateProfilePhoto.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateProfilePhoto.fulfilled,
        (state, action: PayloadAction<Profile>) => {
          state.status = "succeeded";
          state.currentProfile = action.payload;
          // If the viewed profile is the same as the current profile, update it as well
          if (
            state.viewedProfile &&
            state.viewedProfile.id === action.payload.id
          ) {
            state.viewedProfile = action.payload;
          }
        }
      )
      .addCase(updateProfilePhoto.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Get platform services
      .addCase(getPlatformServices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        getPlatformServices.fulfilled,
        (state, action: PayloadAction<Service[]>) => {
          state.status = "succeeded";
          state.platformServices = action.payload;
        }
      )
      .addCase(getPlatformServices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Add expert service
      .addCase(addExpertService.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        addExpertService.fulfilled,
        (state, action: PayloadAction<ExpertService>) => {
          state.status = "succeeded";
          state.expertServices.push(action.payload);
        }
      )
      .addCase(addExpertService.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update expert service
      .addCase(updateExpertService.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateExpertService.fulfilled,
        (state, action: PayloadAction<ExpertService>) => {
          state.status = "succeeded";
          const index = state.expertServices.findIndex(
            (service) => service.id === action.payload.id
          );
          if (index !== -1) {
            state.expertServices[index] = action.payload;
          }
        }
      )
      .addCase(updateExpertService.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Delete expert service
      .addCase(deleteExpertService.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteExpertService.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.expertServices = state.expertServices.filter(
          (service) => service.id !== action.payload.serviceId
        );
      })
      .addCase(deleteExpertService.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Get expert services
      .addCase(getExpertServices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getExpertServices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.expertServices = action.payload.services;
      })
      .addCase(getExpertServices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const {
  resetProfileState,
  resetProfileStatus,
  setCurrentProfileFromStorage,
} = profileSlice.actions;

export default profileSlice.reducer;
