import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  X,
  Search,
  User,
  LogOut,
  Users,
  MapPin,
  Loader2,
} from "lucide-react";
import { FaAngleRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  APPLICABLE_POST_TYPES,
  fetchNotices,
  type Notice,
  type NoticePostType,
  type NoticeUrgency,
  type NoticeVisibility,
} from "@/store/notice-slice";
import CreateNoticeDialog from "./CreateNoticeDialog";
import NoticeDetailDialog from "./NoticeDetailDialog";

interface FilterState {
  postType: "" | NoticePostType;
  urgency: "" | NoticeUrgency;
  visibility: "" | NoticeVisibility;
  city: string;
  country: string;
}

const EMPTY_FILTERS: FilterState = {
  postType: "",
  urgency: "",
  visibility: "",
  city: "",
  country: "",
};

const POST_TYPE_OPTIONS: { value: NoticePostType; label: string }[] = [
  { value: "PLAYER_REQUIRED", label: "Player needed" },
  { value: "EXPERT_REQUIRED", label: "Coach needed" },
  { value: "SPONSOR", label: "Sponsor request" },
  { value: "MATCH", label: "Match" },
  { value: "RESULT", label: "Result" },
  { value: "OTHER", label: "Other" },
];

const URGENCY_OPTIONS: { value: NoticeUrgency; label: string }[] = [
  { value: "IMMEDIATE", label: "Immediate" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "ONGOING", label: "Ongoing" },
];

const VISIBILITY_OPTIONS: { value: NoticeVisibility; label: string }[] = [
  { value: "PUBLIC", label: "Public" },
  { value: "EXPERT", label: "Experts" },
  { value: "SCOUT", label: "Scouts" },
  { value: "PRIVATE", label: "Private" },
  { value: "SPONSOR", label: "Sponsor" },
];

const PAGE_SIZE = 24;

const TYPE_TAG: Record<
  NoticePostType,
  { label: string; bg: string; soft: string; text: string }
> = {
  PLAYER_REQUIRED: {
    label: "PLAYER",
    bg: "bg-rose-500",
    soft: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
  },
  EXPERT_REQUIRED: {
    label: "COACH",
    bg: "bg-violet-500",
    soft: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
  },
  SPONSOR: {
    label: "SPONSOR",
    bg: "bg-amber-500",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  MATCH: {
    label: "MATCH",
    bg: "bg-sky-500",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
  },
  RESULT: {
    label: "RESULT",
    bg: "bg-emerald-500",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  OTHER: {
    label: "INFO",
    bg: "bg-slate-500",
    soft: "bg-slate-100 dark:bg-slate-700",
    text: "text-slate-600 dark:text-slate-300",
  },
};

const URGENCY_BADGE: Record<NoticeUrgency, string> = {
  IMMEDIATE: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20",
  THIS_WEEK: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20",
  ONGOING: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
};

interface SlipProps {
  notice: Notice;
  onReadMore: (notice: Notice) => void;
}

function NoticeSlip({ notice, onReadMore }: SlipProps) {
  const tag = TYPE_TAG[notice.postType] || TYPE_TAG.OTHER;
  const location = [notice.city, notice.region, notice.country]
    .filter(Boolean)
    .join(", ");
  const isApplicable = APPLICABLE_POST_TYPES.includes(notice.postType);
  const applicants = notice._count?.applications ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onReadMore(notice)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onReadMore(notice);
        }
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gray-200 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
    >
      {/* Colored accent strip — encodes the post type */}
      <div className={`h-1.5 w-full ${tag.bg}`} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${tag.soft} ${tag.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tag.bg}`} />
            {tag.label}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${URGENCY_BADGE[notice.urgency]}`}
          >
            {notice.urgency.replace("_", " ").toLowerCase()}
          </span>
        </div>

        {/* Title + description */}
        <div className="flex flex-col gap-1.5">
          <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-gray-900 dark:text-white">
            {notice.title}
          </h3>
          <p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {notice.description}
          </p>
        </div>

        {/* Location */}
        {(location || notice.clubOrTeamName) && (
          <p className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="line-clamp-1">
              {notice.clubOrTeamName && (
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {notice.clubOrTeamName}
                </span>
              )}
              {notice.clubOrTeamName && location && <span> · </span>}
              {location}
            </span>
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {isApplicable && (
              <span className="inline-flex items-center text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                <Users className="mr-1 h-3.5 w-3.5 text-gray-400" />
                {applicants} {applicants === 1 ? "applicant" : "applicants"}
              </span>
            )}
            {notice.postType === "SPONSOR" && notice.sponsorshipDirection && (
              <span className="rounded-full border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:border-slate-600 dark:text-gray-400">
                {notice.sponsorshipDirection === "OFFERING_SPONSORSHIP"
                  ? "Offering"
                  : "Seeking"}
              </span>
            )}
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-red-600 transition-all group-hover:text-red-700 dark:text-red-400">
            Read More
            <FaAngleRight className="ml-0.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Feed() {
  const dispatch = useAppDispatch();
  const {
    data: notices,
    status,
    error,
    total,
    loadingMore,
  } = useAppSelector((s) => s.notices);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  // Bumped on clear to force-remount the Select dropdowns. Radix Select goes
  // uncontrolled when value is undefined, so it keeps showing the last pick;
  // remounting is the reliable way to reset them back to the placeholder.
  const [resetKey, setResetKey] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const currentFetchRef = useRef<{ abort?: () => void } | null>(null);

  const myUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, showOnlyMine, myUserId]);

  // Abort any in-flight fetch so a stale page-N append can't land after a fresh
  // page-1 replace triggered by a filter change.
  useEffect(() => {
    currentFetchRef.current?.abort?.();
    currentFetchRef.current = dispatch(
      fetchNotices({
        ...(filters.postType && { postType: filters.postType }),
        ...(filters.urgency && { urgency: filters.urgency }),
        ...(filters.visibility && { visibility: filters.visibility }),
        ...(filters.city && { city: filters.city }),
        ...(filters.country && { country: filters.country }),
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(showOnlyMine && myUserId ? { postedById: myUserId } : {}),
        page,
        limit: PAGE_SIZE,
        append: page > 1,
      }),
    ) as unknown as { abort?: () => void };
  }, [dispatch, debouncedSearch, filters, showOnlyMine, myUserId, page]);

  useEffect(() => {
    if (status !== "succeeded") return;
    if (loadingMore) return;
    if (notices.length >= total) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [status, loadingMore, notices.length, total]);

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    notices.forEach((n) => n.city && set.add(n.city));
    return Array.from(set).sort();
  }, [notices]);

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    notices.forEach((n) => n.country && set.add(n.country));
    return Array.from(set).sort();
  }, [notices]);

  const hasActiveFilters =
    !!searchQuery || Object.values(filters).some((v) => v !== "");

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters(EMPTY_FILTERS);
    setResetKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-screen-2xl mx-auto">
        {/* Search */}
        <div className="mb-4">
          <div className="relative w-full bg-white dark:bg-slate-600 rounded-lg">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search notices by title, description, club…"
              className="pl-9 w-full bg-white dark:bg-slate-700 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters + actions */}
        <div className="w-full mb-6 sm:mb-8 flex flex-col xl:flex-row xl:items-start gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 pt-1 flex-1">
            <Select
              key={`postType-${resetKey}`}
              value={filters.postType || undefined}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  postType: (v as NoticePostType) || "",
                }))
              }
            >
              <SelectTrigger className="w-full bg-white dark:bg-slate-600 border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              key={`urgency-${resetKey}`}
              value={filters.urgency || undefined}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  urgency: (v as NoticeUrgency) || "",
                }))
              }
            >
              <SelectTrigger className="w-full bg-white dark:bg-slate-600 border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              key={`visibility-${resetKey}`}
              value={filters.visibility || undefined}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  visibility: (v as NoticeVisibility) || "",
                }))
              }
            >
              <SelectTrigger className="w-full bg-white dark:bg-slate-600 border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              key={`city-${resetKey}`}
              value={filters.city || undefined}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, city: v || "" }))
              }
            >
              <SelectTrigger className="w-full bg-white dark:bg-slate-600 border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.length > 0 ? (
                  cityOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none" disabled>
                    No cities yet
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select
              key={`country-${resetKey}`}
              value={filters.country || undefined}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, country: v || "" }))
              }
            >
              <SelectTrigger className="w-full bg-white dark:bg-slate-600 border border-gray-200 rounded-xl min-h-[48px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.length > 0 ? (
                  countryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none" disabled>
                    No countries yet
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <div className="w-full flex items-center">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full flex items-center justify-center gap-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 rounded-xl min-h-[48px]"
                >
                  <X size={16} /> Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Action buttons — sit beside the filters on wide screens */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 sm:pt-1">
            <Button
              onClick={() => setShowOnlyMine((v) => !v)}
              variant={showOnlyMine ? "default" : "outline"}
              className={
                (showOnlyMine
                  ? "bg-stone-800 hover:bg-stone-900 text-white"
                  : "border-stone-300 text-stone-700 hover:bg-stone-100") +
                " font-semibold rounded-xl min-h-[48px] w-full sm:w-auto"
              }
              disabled={!myUserId}
              title={
                !myUserId
                  ? "Sign in to view your notices"
                  : showOnlyMine
                    ? "Showing only your notices"
                    : "Show only notices you created"
              }
            >
              {!showOnlyMine ? (
                <User className="h-4 w-4 mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {showOnlyMine ? "Back to all Notices" : "My Notices"}
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl min-h-[48px] w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Notice
            </Button>
          </div>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="flex justify-center items-center h-32 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-16 sm:w-16 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Error */}
        {status === "failed" && error && (
          <div className="text-center p-4 sm:p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            <p className="text-base sm:text-lg font-semibold">
              Failed to load notices
            </p>
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Empty */}
        {status === "succeeded" && notices.length === 0 && (
          <div className="text-center p-6 sm:p-10">
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
              {showOnlyMine
                ? "You haven't posted any notices yet. Click Create Notice to get started."
                : "No notices match your criteria. Be the first to post one!"}
            </p>
          </div>
        )}

        {/* Grid */}
        {status === "succeeded" && notices.length > 0 && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            {notices.map((notice) => (
              <NoticeSlip
                key={notice.id}
                notice={notice}
                onReadMore={setSelectedNotice}
              />
            ))}
          </div>
          {notices.length < total && (
            <div
              ref={sentinelRef}
              className="h-12 mt-10 flex items-center justify-center"
            >
              {loadingMore && (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              )}
            </div>
          )}
          {notices.length >= total && total > PAGE_SIZE && (
            <p className="text-center text-xs text-gray-400 mt-10">
              You've reached the end.
            </p>
          )}
          </>
        )}
      </div>

      <CreateNoticeDialog open={createOpen} onOpenChange={setCreateOpen} />
      <NoticeDetailDialog
        open={selectedNotice !== null}
        onOpenChange={(o) => !o && setSelectedNotice(null)}
        notice={selectedNotice}
      />
    </div>
  );
}

export default Feed;
