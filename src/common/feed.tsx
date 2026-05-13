import { useEffect, useMemo, useRef, useState } from "react";
import {
  Paperclip,
  Plus,
  X,
  Search,
  User,
  LogOut,
  Briefcase,
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

const PIN_COLORS = [
  "#e74c3c",
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
];

const PAPER_BGS = [
  "from-yellow-100 to-yellow-200",
  "from-slate-50 to-gray-100",
  "from-orange-50 to-orange-100",
];

const ROTATIONS = [-2.5, 1.5, -1.8, 2.2, -1.2, 1.8, -2.8, 1.2, -0.8];

const PAGE_SIZE = 24;

const TYPE_TAG: Record<NoticePostType, { label: string; bg: string }> = {
  PLAYER_REQUIRED: { label: "PLAYER", bg: "bg-rose-500" },
  EXPERT_REQUIRED: { label: "COACH", bg: "bg-violet-500" },
  SPONSOR: { label: "SPONSOR", bg: "bg-amber-500" },
  MATCH: { label: "MATCH", bg: "bg-sky-500" },
  RESULT: { label: "RESULT", bg: "bg-emerald-500" },
  OTHER: { label: "INFO", bg: "bg-slate-500" },
};

const URGENCY_BADGE: Record<NoticeUrgency, string> = {
  IMMEDIATE: "bg-red-100 text-red-700 border-red-200",
  THIS_WEEK: "bg-amber-100 text-amber-700 border-amber-200",
  ONGOING: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const Clip = ({ color }: { color: string }) => (
  <div className="absolute -top-4 left-4 z-20 -rotate-12 drop-shadow">
    <Paperclip size={32} strokeWidth={2.2} color={color} />
  </div>
);

interface SlipProps {
  notice: Notice;
  pinColor: string;
  paperBg: string;
  lined: boolean;
  onReadMore: (notice: Notice) => void;
}

function NoticeSlip({
  notice,
  pinColor,
  paperBg,
  lined,
  onReadMore,
}: SlipProps) {
  const tag = TYPE_TAG[notice.postType] || TYPE_TAG.OTHER;
  const location = [notice.city, notice.region, notice.country]
    .filter(Boolean)
    .join(", ");

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
      className={`relative bg-gradient-to-br ${paperBg} rounded-sm pt-10 px-5 pb-5 min-h-[11rem] flex flex-col gap-3 shadow-[2px_4px_12px_rgba(0,0,0,0.08)] border border-black/5 w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2`}
    >
      <Clip color={pinColor} />

      {lined && (
        <div
          className="absolute inset-0 rounded-sm pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, rgba(59, 130, 246, 0.15) 28px)",
            backgroundPositionY: 48,
          }}
        />
      )}

      <div className="flex items-center gap-2 self-start">
        <span
          className={`${tag.bg} text-white text-[10px] font-bold tracking-widest rounded-full px-2.5 py-1 shadow-sm`}
        >
          {tag.label}
        </span>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border ${URGENCY_BADGE[notice.urgency]}`}
        >
          {notice.urgency.replace("_", " ").toLowerCase()}
        </span>
      </div>

      <div className="relative z-10 flex flex-col gap-1.5">
        <p className="text-base font-extrabold text-gray-800 leading-snug tracking-tight line-clamp-2">
          {notice.title}
        </p>
        <p className="text-sm font-medium text-gray-600 whitespace-pre-line leading-relaxed line-clamp-4">
          {notice.description}
        </p>
        {(location || notice.clubOrTeamName) && (
          <p className="text-xs text-gray-500 mt-1">
            {notice.clubOrTeamName && (
              <span className="font-semibold">{notice.clubOrTeamName}</span>
            )}
            {notice.clubOrTeamName && location && <span> • </span>}
            {location && <span>{location}</span>}
          </p>
        )}
        {APPLICABLE_POST_TYPES.includes(notice.postType) && (
          <p className="text-[11px] font-semibold text-stone-700 inline-flex items-center mt-1">
            <Briefcase className="h-3 w-3 mr-1" />
            {notice._count?.applications ?? 0}{" "}
            {(notice._count?.applications ?? 0) === 1
              ? "applicant"
              : "applicants"}
            {notice.postType === "SPONSOR" && notice.sponsorshipDirection && (
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider rounded-full px-1.5 py-0.5 border border-stone-300 text-stone-600">
                {notice.sponsorshipDirection === "OFFERING_SPONSORSHIP"
                  ? "Offering"
                  : "Seeking"}
              </span>
            )}
          </p>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReadMore(notice);
          }}
          className="self-end mt-1 inline-flex items-center text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
        >
          Read More <FaAngleRight className="ml-0.5" />
        </button>
      </div>

      <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-black/5 to-transparent rounded-br-sm pointer-events-none" />
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

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    postType: "",
    urgency: "",
    visibility: "",
    city: "",
    country: "",
  });

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
    setFilters({
      postType: "",
      urgency: "",
      visibility: "",
      city: "",
      country: "",
    });
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header — action buttons on the top-right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 mb-6">
          <Button
            onClick={() => setShowOnlyMine((v) => !v)}
            variant={showOnlyMine ? "default" : "outline"}
            className={
              showOnlyMine
                ? "bg-stone-800 hover:bg-stone-900 text-white font-semibold w-full sm:w-auto"
                : "border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold w-full sm:w-auto"
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
            className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create Notice
          </Button>
        </div>

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

        {/* Filters */}
        <div className="w-full mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 pt-1">
            <Select
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14 items-start">
            {notices.map((notice, i) => {
              const pinColor = PIN_COLORS[i % PIN_COLORS.length];
              const paperBg = PAPER_BGS[i % PAPER_BGS.length];
              const lined = i % 4 === 3;
              const rotation = ROTATIONS[i % ROTATIONS.length];
              const isHovered = hoveredId === notice.id;
              return (
                <div
                  key={notice.id}
                  onMouseEnter={() => setHoveredId(notice.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="transition-all duration-300 ease-out"
                  style={{
                    transform: isHovered
                      ? "rotate(0deg) scale(1.05) translateY(-4px)"
                      : `rotate(${rotation}deg)`,
                    zIndex: isHovered ? 50 : 1,
                  }}
                >
                  <div
                    className={`h-full transition-shadow duration-300 ${isHovered ? "shadow-2xl" : ""}`}
                  >
                    <NoticeSlip
                      notice={notice}
                      pinColor={pinColor}
                      paperBg={paperBg}
                      lined={lined}
                      onReadMore={setSelectedNotice}
                    />
                  </div>
                </div>
              );
            })}
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
