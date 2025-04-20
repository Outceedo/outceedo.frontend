import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { userService } from "../apiConfig";
import { RootState } from "../store";

// Define Role type instead of importing from Prisma
type Role = "player" | "expert" | "admin";

// Define types
interface Profile {
  id: string;
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  phone?: string;
  country?: string;
  city?: string;
  height?: number;
  weight?: number;
  profession?: string;
  subProfession?: string;
  bio?: string;
  photo?: string;
  language?: string[];
  company?: string;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  interests?: string[];
  certificates?: Array<{ name: string; organization: string }>;
  awards?: string[];
  experience?: string;
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

// Helper function to get username from localStorage
const getUsernameFromStorage = (): string | null => {
  const username = localStorage.getItem("username");
  return username;
};

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Helper function to check if a profile is complete
const isProfileComplete = (profile: Profile | null): boolean => {
  if (!profile) return false;

  // Define required fields for player profile
  if (profile.role === "player") {
    const requiredFields = [
      "firstName",
      "lastName",
      "age",
      "gender",

      "country",
      "city",
      "height",
      "weight",
      "profession",
      "subProfession",
    ];

    return requiredFields.every(
      (field) =>
        profile[field] !== undefined &&
        profile[field] !== null &&
        profile[field] !== ""
    );
  }

  // Define required fields for expert profile
  if (profile.role === "expert") {
    const requiredFields = [
      "firstName",
      "lastName",
      "age",
      "gender",

      "country",
      "city",
      "profession",
      "subProfession",
    ];

    return requiredFields.every(
      (field) =>
        profile[field] !== undefined &&
        profile[field] !== null &&
        profile[field] !== ""
    );
  }

  return false;
};

// Debug function to log profile completion status
const logProfileStatus = (profile: Profile | null): void => {
  if (!profile) {
    console.log("Profile completion check: No profile found");
    return;
  }

  const role = profile.role;
  const requiredFields =
    role === "player"
      ? [
          "firstName",
          "lastName",
          "age",
          "gender",

          "country",
          "city",
          "height",
          "weight",
          "profession",
          "subProfession",
        ]
      : [
          "firstName",
          "lastName",
          "age",
          "gender",

          "country",
          "city",
          "profession",
          "subProfession",
        ];

  const missingFields = requiredFields.filter(
    (field) =>
      profile[field] === undefined ||
      profile[field] === null ||
      profile[field] === ""
  );

  console.log(`Profile completion check for ${role}:`, {
    isComplete: missingFields.length === 0,
    missingFields,
    profile,
  });
};

// Check profile completion and determine redirect
export const checkProfileCompletion = createAsyncThunk(
  "profile/checkProfileCompletion",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { user } = state.auth;

    if (!user || !user.username) {
      console.log("No user found in auth state, redirecting to login");
      return { redirect: "/login" };
    }

    try {
      console.log("Checking profile completion for:", user.username);

      // Try to fetch the profile using the username
      const resultAction = await dispatch(getProfile(user.username));

      if (getProfile.fulfilled.match(resultAction)) {
        const fetchedProfile = resultAction.payload;

        // Log profile status for debugging
        logProfileStatus(fetchedProfile);

        // Store profile data in localStorage to prefill form if redirected to details form
        if (fetchedProfile) {
          // Store the profile data in local storage for form prefilling
          localStorage.setItem("profileData", JSON.stringify(fetchedProfile));
        }

        if (!fetchedProfile || !isProfileComplete(fetchedProfile)) {
          console.log("Profile is incomplete, redirecting to details form");
          return { redirect: "/details-form" };
        } else {
          console.log("Profile is complete, redirecting to dashboard");
          // Profile is complete, redirect based on role
          if (fetchedProfile.role === "player") {
            return { redirect: "/player/dashboard" };
          } else if (fetchedProfile.role === "expert") {
            return { redirect: "/expert/dashboard" };
          } else {
            return { redirect: "/home" };
          }
        }
      } else {
        console.log("Failed to fetch profile, redirecting to details form");
        return { redirect: "/details-form" };
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      return { redirect: "/details-form" };
    }
  }
);

// Create profile thunk
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

// Update profile thunk
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

// Get profile thunk
export const getProfile = createAsyncThunk(
  "profile/getProfile",
  async (username: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      console.log(`Fetching profile for username: ${username}`);
      const response = await userService.get(`/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Profile fetch response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Profile fetch error:", error.response?.data || error);
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

// Update profile photo thunk
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

// Get platform services thunk
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
      const token = getAuthToken();
      // The serviceId is passed as a URL parameter
      const response = await userService.post(
        `/profile/service/${serviceId}`,
        {
          price, // Price is required in the body
          additionalDetails, // Optional additional details
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
      const token = getAuthToken();
      const response = await userService.patch(
        `/profile/service/${serviceId}`,
        {
          price, // Price might be optional in update
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

// Delete expert service thunk
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

// Get expert services thunk
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

          // If this is the current user's profile, also update currentProfile
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

      // Check profile completion
      .addCase(checkProfileCompletion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkProfileCompletion.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(checkProfileCompletion.rejected, (state, action) => {
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
