import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { noticeService } from "../apiConfig";

export type NoticePostType =
  | "PLAYER_REQUIRED"
  | "EXPERT_REQUIRED"
  | "SPONSOR"
  | "MATCH"
  | "RESULT"
  | "OTHER";

export type NoticeContactMethod = "EMAIL" | "PHONE" | "IN_APP_MESSAGE" | "NA";
export type NoticeUrgency = "IMMEDIATE" | "THIS_WEEK" | "ONGOING";
export type NoticeVisibility =
  | "PUBLIC"
  | "PRIVATE"
  | "SCOUT"
  | "EXPERT"
  | "SPONSOR"
  | "PLAYER"
  | "TEAM"
  | "FAN";
export type NoticePostedByType =
  | "PLAYER"
  | "EXPERT"
  | "TEAM"
  | "SCOUT"
  | "SPONSOR";

export type NoticeSponsorshipDirection =
  | "SEEKING_SPONSOR"
  | "OFFERING_SPONSORSHIP";

export const APPLICABLE_POST_TYPES: NoticePostType[] = [
  "PLAYER_REQUIRED",
  "EXPERT_REQUIRED",
  "SPONSOR",
];

export interface NoticeApplicationRecord {
  id: string;
  noticeId: string;
  userId: string;
  username: string;
  message?: string | null;
  createdAt: string;
}

export interface Notice {
  id: string;
  postType: NoticePostType;
  title: string;
  description: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  clubOrTeamName?: string | null;
  contactMethod: NoticeContactMethod;
  contactPersonName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  urgency: NoticeUrgency;
  visibility: NoticeVisibility;
  postedByType: NoticePostedByType;
  postedById: string;
  sponsorshipDirection?: NoticeSponsorshipDirection | null;
  createdAt: string;
  updatedAt: string;
  viewerHasApplied?: boolean;
  _count?: { likes?: number; comments?: number; applications?: number };
}

export interface ListNoticesQuery {
  postType?: NoticePostType;
  urgency?: NoticeUrgency;
  visibility?: NoticeVisibility;
  postedByType?: NoticePostedByType;
  postedById?: string;
  sponsorshipDirection?: NoticeSponsorshipDirection;
  city?: string;
  region?: string;
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateNoticePayload {
  postType: NoticePostType;
  title: string;
  description: string;
  city?: string;
  region?: string;
  country?: string;
  clubOrTeamName?: string;
  contactMethod: NoticeContactMethod;
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  urgency: NoticeUrgency;
  visibility?: NoticeVisibility;
  postedByType: NoticePostedByType;
  sponsorshipDirection?: NoticeSponsorshipDirection;
}

export type UpdateNoticePayload = Partial<CreateNoticePayload>;

interface NoticeState {
  data: Notice[];
  total: number;
  page: number;
  limit: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  loadingMore: boolean;
  error: string | null;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null;
}

const initialState: NoticeState = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  status: "idle",
  loadingMore: false,
  error: null,
  createStatus: "idle",
  createError: null,
};

export interface FetchNoticesArg extends ListNoticesQuery {
  append?: boolean;
}

export const fetchNotices = createAsyncThunk(
  "notices/fetchNotices",
  async (arg: FetchNoticesArg = {}, { rejectWithValue, signal }) => {
    try {
      const { append: _append, ...query } = arg;
      const params: Record<string, string | number> = {};
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params[k] = v as any;
      });
      const response = await noticeService.get("/", { params, signal });
      return response.data as {
        data: Notice[];
        total: number;
        page: number;
        limit: number;
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error || "Failed to load notices"
      );
    }
  }
);

export const createNotice = createAsyncThunk(
  "notices/createNotice",
  async (payload: CreateNoticePayload, { rejectWithValue }) => {
    try {
      const response = await noticeService.post("/", payload);
      return response.data as Notice;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error || "Failed to create notice"
      );
    }
  }
);

export const updateNotice = createAsyncThunk(
  "notices/updateNotice",
  async (
    args: { id: string; data: UpdateNoticePayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await noticeService.patch(`/${args.id}`, args.data);
      return response.data as Notice;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to update notice"
      );
    }
  }
);

export const deleteNotice = createAsyncThunk(
  "notices/deleteNotice",
  async (id: string, { rejectWithValue }) => {
    try {
      await noticeService.delete(`/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to delete notice"
      );
    }
  }
);

export const toggleNoticeLike = createAsyncThunk(
  "notices/toggleLike",
  async (noticeId: string, { rejectWithValue }) => {
    try {
      const response = await noticeService.post(`/${noticeId}/like`);
      return { noticeId, ...response.data } as {
        noticeId: string;
        liked: boolean;
        likeCount: number;
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error || "Failed to toggle like"
      );
    }
  }
);

export const toggleNoticeApplication = createAsyncThunk(
  "notices/toggleApplication",
  async (
    args: { noticeId: string; message?: string },
    { rejectWithValue }
  ) => {
    try {
      const body = args.message?.trim() ? { message: args.message.trim() } : {};
      const response = await noticeService.post(
        `/${args.noticeId}/apply`,
        body
      );
      return { noticeId: args.noticeId, ...response.data } as {
        noticeId: string;
        applied: boolean;
        applicationCount: number;
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to apply"
      );
    }
  }
);

export const fetchNoticeApplications = createAsyncThunk(
  "notices/fetchApplications",
  async (noticeId: string, { rejectWithValue }) => {
    try {
      const response = await noticeService.get(`/${noticeId}/applications`);
      return response.data as NoticeApplicationRecord[];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to load applicants"
      );
    }
  }
);

const noticeSlice = createSlice({
  name: "notices",
  initialState,
  reducers: {
    resetCreateState: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotices.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.loadingMore = true;
        } else {
          state.status = "loading";
        }
        state.error = null;
      })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loadingMore = false;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        if (action.meta.arg?.append) {
          const existing = new Set(state.data.map((n) => n.id));
          const fresh = action.payload.data.filter((n) => !existing.has(n.id));
          state.data = [...state.data, ...fresh];
        } else {
          state.data = action.payload.data;
        }
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.loadingMore = false;
        // Ignore aborted fetches (filter changed mid-flight) — don't surface as error.
        if (action.meta.aborted) return;
        if (!action.meta.arg?.append) {
          state.status = "failed";
        }
        state.error = (action.payload as string) || "Failed to load notices";
      })
      .addCase(createNotice.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createNotice.fulfilled, (state, action: PayloadAction<Notice>) => {
        state.createStatus = "succeeded";
        state.data = [action.payload, ...state.data];
        state.total += 1;
      })
      .addCase(createNotice.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError =
          (action.payload as string) || "Failed to create notice";
      })
      .addCase(updateNotice.fulfilled, (state, action: PayloadAction<Notice>) => {
        const idx = state.data.findIndex((n) => n.id === action.payload.id);
        if (idx !== -1) {
          state.data[idx] = { ...state.data[idx], ...action.payload };
        }
      })
      .addCase(deleteNotice.fulfilled, (state, action: PayloadAction<string>) => {
        state.data = state.data.filter((n) => n.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(toggleNoticeLike.fulfilled, (state, action) => {
        const target = state.data.find((n) => n.id === action.payload.noticeId);
        if (target) {
          target._count = {
            ...(target._count || {}),
            likes: action.payload.likeCount,
          };
        }
      })
      .addCase(toggleNoticeApplication.fulfilled, (state, action) => {
        const target = state.data.find((n) => n.id === action.payload.noticeId);
        if (target) {
          target._count = {
            ...(target._count || {}),
            applications: action.payload.applicationCount,
          };
          target.viewerHasApplied = action.payload.applied;
        }
      });
  },
});

export const { resetCreateState } = noticeSlice.actions;
export default noticeSlice.reducer;
