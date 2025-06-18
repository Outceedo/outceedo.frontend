import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { userService } from "../apiConfig";

type Role = "player" | "expert" | "admin";

interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

interface Document {
  [key: string]: any;
}

interface Upload {
  [key: string]: any;
}

interface Review {
  [key: string]: any;
}

interface Profile {
  id: string;
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  age?: number | null;
  birthYear?: number | null;
  gender?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  height?: number | null;
  weight?: number | null;
  profession?: string | null;
  subProfession?: string | null;
  bio?: string | null;
  photo?: string | null;
  language?: string[] | null;
  company?: string | null;
  club?: string | null;
  address?: string | null;
  socialLinks?: SocialLinks | null;
  interests?: string[] | null;
  certificates?: Array<{ name: string; organization: string }> | null;
  awards?: string[] | null;
  experience?: string | null;
  responseTime?: string | null;
  travelLimit?: string | null;
  certificationLevel?: string | null;
  skills?: string[] | null;
  budgetRange?: string | null;
  sponsorType?: string | null;
  sponsorshipCountryPreferred?: string | null;
  sponsorshipType?: string | null;
  sport?: string | null;
  skinColor?: string | null;
  companyLink?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  documents?: Document[] | null;
  uploads?: Upload[] | null;
  reviewsReceived?: Review[] | null;
  services?: any[];
  [key: string]: any;
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

const getRoleFromStorage = (): Role | null => {
  const role = localStorage.getItem("role") as Role;
  if (role && ["player", "expert", "admin"].includes(role)) {
    return role;
  }
  return null;
};

const getUsernameFromStorage = (): string | null => {
  const username = localStorage.getItem("username");
  return username;
};

const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

export const createProfile = createAsyncThunk(
  "profile/createProfile",
  async (
    { role, profileData }: { role: Role; profileData: any },
    { rejectWithValue }
  ) => {
    try {
      const username = getUsernameFromStorage();
      const token = getAuthToken();

      if (!username) {
        return rejectWithValue("No username found");
      }

      const response = await userService.post(
        `/profile/${username}`,
        {
          role,
          profileData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create profile"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (data: any, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await userService.patch("/profile", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update profile"
      );
    }
  }
);

export const getProfile = createAsyncThunk(
  "profile/getProfile",
  async (username: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await userService.get(`/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get profile"
      );
    }
  }
);

export const getProfiles = createAsyncThunk(
  "profile/getProfiles",
  async (
    { page, limit, userType }: { page: number; limit: number; userType: Role },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      const response = await userService.get("/profiles", {
        params: { page, limit, userType },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get profiles"
      );
    }
  }
);

export const updateProfilePhoto = createAsyncThunk(
  "profile/updateProfilePhoto",
  async (photoFile: File, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("photo", photoFile);

      const response = await userService.patch("/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
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

export const getPlatformServices = createAsyncThunk(
  "profile/getPlatformServices",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await userService.get("/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get services"
      );
    }
  }
);

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
      const token = getAuthToken();
      const response = await userService.post(
        `/profile/service/${serviceId}`,
        {
          price,
          additionalDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add expert service"
      );
    }
  }
);

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
      const token = getAuthToken();
      const response = await userService.patch(
        `/profile/service/${serviceId}`,
        {
          price,
          additionalDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

export const deleteExpertService = createAsyncThunk(
  "profile/deleteExpertService",
  async (serviceId: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await userService.delete(
        `/profile/service/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { serviceId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete expert service"
      );
    }
  }
);

export const getExpertServices = createAsyncThunk(
  "profile/getExpertServices",
  async (expertId: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await userService.get(
        `/profile/expert/${expertId}/services`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { expertId, services: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to get expert services"
      );
    }
  }
);

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
    setCurrentProfileFromStorage: (state) => {
      const role = getRoleFromStorage();
      if (state.currentProfile && role) {
        state.currentProfile.role = role;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createProfile.fulfilled,
        (state, action: PayloadAction<Profile>) => {
          state.status = "succeeded";
          state.currentProfile = action.payload;
          localStorage.setItem("role", action.payload.role);
        }
      )
      .addCase(createProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<Profile>) => {
          state.status = "succeeded";
          state.currentProfile = action.payload;
          if (action.payload.role) {
            localStorage.setItem("role", action.payload.role);
          }
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
      .addCase(getProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        getProfile.fulfilled,
        (state, action: PayloadAction<Profile>) => {
          state.status = "succeeded";
          state.viewedProfile = action.payload;
          const currentUsername = localStorage.getItem("username");
          if (currentUsername && action.payload.username === currentUsername) {
            state.currentProfile = action.payload;
          }
        }
      )
      .addCase(getProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
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
      .addCase(updateProfilePhoto.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateProfilePhoto.fulfilled,
        (state, action: PayloadAction<Profile>) => {
          state.status = "succeeded";
          state.currentProfile = action.payload;
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
