import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Heart,
  Send,
  User2,
  Users,
  Loader2,
  Pencil,
  Trash2,
  Save,
  X,
  Briefcase,
  Check,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  APPLICABLE_POST_TYPES,
  deleteNotice,
  fetchNoticeApplications,
  toggleNoticeApplication,
  toggleNoticeLike,
  updateNotice,
  type Notice,
  type NoticeApplicationRecord,
  type NoticeContactMethod,
  type NoticePostType,
  type NoticeUrgency,
  type NoticeVisibility,
  type UpdateNoticePayload,
} from "@/store/notice-slice";
import { noticeService } from "@/store/apiConfig";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: Notice | null;
}

interface Comment {
  id: string;
  noticeId: string;
  userId: string;
  content: string;
  createdAt: string;
}

const POST_TYPE_LABEL: Record<string, string> = {
  PLAYER_REQUIRED: "Player needed",
  EXPERT_REQUIRED: "Coach needed",
  SPONSOR: "Sponsor request",
  MATCH: "Match announcement",
  RESULT: "Match result",
  OTHER: "Other",
};

const URGENCY_LABEL: Record<string, string> = {
  IMMEDIATE: "Immediate",
  THIS_WEEK: "This week",
  ONGOING: "Ongoing",
};

const POST_TYPE_OPTIONS: { value: NoticePostType; label: string }[] = [
  { value: "PLAYER_REQUIRED", label: "Player needed" },
  { value: "EXPERT_REQUIRED", label: "Coach needed" },
  { value: "SPONSOR", label: "Sponsor request" },
  { value: "MATCH", label: "Match announcement" },
  { value: "RESULT", label: "Match result" },
  { value: "OTHER", label: "Other" },
];

const URGENCY_OPTIONS: { value: NoticeUrgency; label: string }[] = [
  { value: "IMMEDIATE", label: "Immediate" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "ONGOING", label: "Ongoing" },
];

const CONTACT_METHODS: { value: NoticeContactMethod; label: string }[] = [
  { value: "IN_APP_MESSAGE", label: "In-app message" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
];

const VISIBILITIES: { value: NoticeVisibility; label: string }[] = [
  { value: "PUBLIC", label: "Public — everyone" },
  { value: "EXPERT", label: "Experts only" },
  { value: "SCOUT", label: "Scouts only" },
  { value: "PRIVATE", label: "Private — only me" },
];

interface EditFormState {
  postType: NoticePostType;
  title: string;
  description: string;
  city: string;
  region: string;
  country: string;
  clubOrTeamName: string;
  contactMethod: NoticeContactMethod;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  urgency: NoticeUrgency;
  visibility: NoticeVisibility;
}

const buildFormFromNotice = (n: Notice): EditFormState => ({
  postType: n.postType,
  title: n.title,
  description: n.description,
  city: n.city ?? "",
  region: n.region ?? "",
  country: n.country ?? "",
  clubOrTeamName: n.clubOrTeamName ?? "",
  contactMethod: n.contactMethod,
  contactPersonName: n.contactPersonName ?? "",
  contactEmail: n.contactEmail ?? "",
  contactPhone: n.contactPhone ?? "",
  urgency: n.urgency,
  visibility: n.visibility,
});

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isValidPhone = (s: string) => /^\+?[0-9\s().-]{6,30}$/.test(s.trim());

const ContactIcon = ({ method }: { method: string }) => {
  if (method === "EMAIL") return <Mail className="h-4 w-4" />;
  if (method === "PHONE") return <Phone className="h-4 w-4" />;
  return <MessageSquare className="h-4 w-4" />;
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

const NoticeDetailDialog: React.FC<Props> = ({ open, onOpenChange, notice }) => {
  const dispatch = useAppDispatch();
  const stored = useAppSelector((s) =>
    notice ? s.notices.data.find((n) => n.id === notice.id) : null
  );
  const current = stored || notice;

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const myUserId = useMemo(
    () =>
      typeof window !== "undefined" ? localStorage.getItem("userId") : null,
    [open]
  );
  const isOwner = !!current && !!myUserId && current.postedById === myUserId;
  const isApplicable =
    !!current && APPLICABLE_POST_TYPES.includes(current.postType);

  const [applicants, setApplicants] = useState<NoticeApplicationRecord[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyMessageOpen, setApplyMessageOpen] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const applicationCount = current?._count?.applications ?? 0;

  useEffect(() => {
    if (!open || !current) {
      setComments([]);
      setCommentText("");
      setEditing(false);
      setEditForm(null);
      setConfirmDelete(false);
      setApplicants([]);
      setHasApplied(false);
      setApplyMessage("");
      setApplyMessageOpen(false);
      setConfirmWithdraw(false);
      return;
    }
    let cancelled = false;
    setCommentLoading(true);
    noticeService
      .get(`/${current.id}/comments`)
      .then((r) => {
        if (!cancelled) setComments(r.data);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setCommentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, current?.id]);

  useEffect(() => {
    if (!open || !current || !isApplicable) {
      setApplicants([]);
      setHasApplied(false);
      return;
    }
    // For everyone, source the truth from the notice payload — the backend
    // sets viewerHasApplied based on the JWT subject.
    setHasApplied(!!current.viewerHasApplied);

    if (!isOwner) return;

    setApplicantsLoading(true);
    dispatch(fetchNoticeApplications(current.id))
      .then((result) => {
        if (fetchNoticeApplications.fulfilled.match(result)) {
          setApplicants(result.payload);
        }
      })
      .finally(() => setApplicantsLoading(false));
  }, [
    open,
    current?.id,
    current?.viewerHasApplied,
    isApplicable,
    isOwner,
    dispatch,
  ]);

  const handleLike = async () => {
    if (!current) return;
    setLiking(true);
    await dispatch(toggleNoticeLike(current.id));
    setLiking(false);
  };

  const handleApply = async () => {
    if (!current) return;
    setApplying(true);
    const result = await dispatch(
      toggleNoticeApplication({
        noticeId: current.id,
        message: hasApplied ? undefined : applyMessage,
      })
    );
    setApplying(false);
    if (toggleNoticeApplication.fulfilled.match(result)) {
      setHasApplied(result.payload.applied);
      setApplyMessage("");
      setApplyMessageOpen(false);
      setConfirmWithdraw(false);
      toast.success(result.payload.applied ? "Application sent" : "Application withdrawn");
      if (isOwner) {
        const refresh = await dispatch(fetchNoticeApplications(current.id));
        if (fetchNoticeApplications.fulfilled.match(refresh)) {
          setApplicants(refresh.payload);
        }
      }
    } else {
      toast.error((result.payload as string) || "Failed to apply");
    }
  };

  const handleStartEdit = () => {
    if (!current) return;
    setEditForm(buildFormFromNotice(current));
    setEditing(true);
    setConfirmDelete(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (!current || !editForm) return;
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (editForm.contactMethod === "EMAIL") {
      if (!editForm.contactEmail.trim()) {
        toast.error("Please enter an email address");
        return;
      }
      if (!isValidEmail(editForm.contactEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }
    if (editForm.contactMethod === "PHONE") {
      if (!editForm.contactPhone.trim()) {
        toast.error("Please enter a phone number");
        return;
      }
      if (!isValidPhone(editForm.contactPhone)) {
        toast.error("Please enter a valid phone number");
        return;
      }
    }
    const original = buildFormFromNotice(current);
    const patch: UpdateNoticePayload = {};
    (Object.keys(editForm) as (keyof EditFormState)[]).forEach((k) => {
      const next = editForm[k];
      const prev = original[k];
      if (next !== prev) {
        // Send empty optional strings as undefined so backend doesn't reject empty text
        const optional = [
          "city",
          "region",
          "country",
          "clubOrTeamName",
          "contactPersonName",
          "contactEmail",
          "contactPhone",
        ].includes(k);
        if (optional && (next as string).trim() === "") {
          (patch as any)[k] = undefined;
        } else if (typeof next === "string") {
          (patch as any)[k] = next.trim();
        } else {
          (patch as any)[k] = next;
        }
      }
    });
    if (Object.keys(patch).length === 0) {
      setEditing(false);
      return;
    }
    setSavingEdit(true);
    const result = await dispatch(updateNotice({ id: current.id, data: patch }));
    setSavingEdit(false);
    if (updateNotice.fulfilled.match(result)) {
      toast.success("Notice updated");
      setEditing(false);
      setEditForm(null);
    } else {
      toast.error((result.payload as string) || "Failed to update notice");
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    setDeletingNotice(true);
    const result = await dispatch(deleteNotice(current.id));
    setDeletingNotice(false);
    if (deleteNotice.fulfilled.match(result)) {
      toast.success("Notice deleted");
      onOpenChange(false);
    } else {
      toast.error((result.payload as string) || "Failed to delete notice");
      setConfirmDelete(false);
    }
  };

  const handleAddComment = async () => {
    if (!current || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const r = await noticeService.post(`/${current.id}/comments`, {
        content: commentText.trim(),
      });
      setComments((prev) => [r.data, ...prev]);
      setCommentText("");
      toast.success("Comment posted");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!current) return null;

  const location = [current.city, current.region, current.country]
    .filter(Boolean)
    .join(", ");
  const likeCount = current._count?.likes ?? 0;
  const commentCount = comments.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-stone-800 text-white text-[10px] font-bold tracking-widest rounded-full px-2.5 py-1">
              {POST_TYPE_LABEL[current.postType] || current.postType}
            </span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border border-amber-200">
              {URGENCY_LABEL[current.urgency] || current.urgency}
            </span>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border border-slate-200">
              {current.visibility}
            </span>
            {current.postType === "SPONSOR" && current.sponsorshipDirection && (
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border ${
                  current.sponsorshipDirection === "OFFERING_SPONSORSHIP"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {current.sponsorshipDirection === "OFFERING_SPONSORSHIP"
                  ? "Offering"
                  : "Seeking"}
              </span>
            )}
            {isOwner && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border border-emerald-200">
                Yours
              </span>
            )}
          </div>
          <DialogTitle className="text-2xl leading-snug">
            {editing ? "Edit notice" : current.title}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(current.createdAt)}
            </span>
            {current.postedByType && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Posted as {current.postedByType.toLowerCase()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {isOwner && !editing && (
          <div className="flex items-center justify-end gap-2 -mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="text-stone-700"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
            {!confirmDelete ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2 py-1">
                <span className="text-xs text-red-700">Delete this notice?</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-gray-600"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deletingNotice}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                  disabled={deletingNotice}
                >
                  {deletingNotice ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {editing && editForm && (
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select
                  value={editForm.postType}
                  onValueChange={(v) =>
                    setEditForm((f) =>
                      f ? { ...f, postType: v as NoticePostType } : f
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Urgency *</Label>
                <Select
                  value={editForm.urgency}
                  onValueChange={(v) =>
                    setEditForm((f) =>
                      f ? { ...f, urgency: v as NoticeUrgency } : f
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                maxLength={120}
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => (f ? { ...f, title: e.target.value } : f))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Description *</Label>
              <Textarea
                id="edit-desc"
                rows={5}
                maxLength={5000}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) =>
                    f ? { ...f, description: e.target.value } : f
                  )
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-club">Club / team name</Label>
              <Input
                id="edit-club"
                value={editForm.clubOrTeamName}
                onChange={(e) =>
                  setEditForm((f) =>
                    f ? { ...f, clubOrTeamName: e.target.value } : f
                  )
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, city: e.target.value } : f
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Region</Label>
                <Input
                  value={editForm.region}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, region: e.target.value } : f
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={editForm.country}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, country: e.target.value } : f
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact method *</Label>
                <Select
                  value={editForm.contactMethod}
                  onValueChange={(v) =>
                    setEditForm((f) =>
                      f
                        ? { ...f, contactMethod: v as NoticeContactMethod }
                        : f
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_METHODS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Contact person</Label>
                <Input
                  value={editForm.contactPersonName}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, contactPersonName: e.target.value } : f
                    )
                  }
                />
              </div>
            </div>

            {editForm.contactMethod === "EMAIL" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-contact-email">Email address *</Label>
                <Input
                  id="edit-contact-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={120}
                  value={editForm.contactEmail}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, contactEmail: e.target.value } : f
                    )
                  }
                />
              </div>
            )}

            {editForm.contactMethod === "PHONE" && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-contact-phone">Phone number *</Label>
                <Input
                  id="edit-contact-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+44 20 7946 0958"
                  maxLength={40}
                  value={editForm.contactPhone}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, contactPhone: e.target.value } : f
                    )
                  }
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select
                value={editForm.visibility}
                onValueChange={(v) =>
                  setEditForm((f) =>
                    f ? { ...f, visibility: v as NoticeVisibility } : f
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITIES.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={savingEdit}
              >
                <X className="h-4 w-4 mr-1.5" /> Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="bg-red-600 hover:bg-red-700"
              >
                {savingEdit ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        )}

        {!editing && (
        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {current.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {current.clubOrTeamName && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">
                  Club / Team
                </p>
                <p className="font-semibold text-gray-800">
                  {current.clubOrTeamName}
                </p>
              </div>
            )}
            {location && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Location
                </p>
                <p className="font-semibold text-gray-800">{location}</p>
              </div>
            )}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5 flex items-center gap-1">
                <ContactIcon method={current.contactMethod} /> Contact
              </p>
              <p className="font-semibold text-gray-800 capitalize">
                {current.contactMethod.replace("_", " ").toLowerCase()}
              </p>
              {current.contactMethod === "EMAIL" && current.contactEmail && (
                <a
                  href={`mailto:${current.contactEmail}`}
                  className="text-xs text-red-600 hover:underline break-all"
                >
                  {current.contactEmail}
                </a>
              )}
              {current.contactMethod === "PHONE" && current.contactPhone && (
                <a
                  href={`tel:${current.contactPhone.replace(/[^+0-9]/g, "")}`}
                  className="text-xs text-red-600 hover:underline"
                >
                  {current.contactPhone}
                </a>
              )}
            </div>
            {current.contactPersonName && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5 flex items-center gap-1">
                  <User2 className="h-3 w-3" /> Contact person
                </p>
                <p className="font-semibold text-gray-800">
                  {current.contactPersonName}
                </p>
              </div>
            )}
          </div>

          {/* Engagement bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-b border-gray-200 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={liking}
              className="text-gray-700 hover:text-rose-600"
            >
              <Heart className="h-4 w-4 mr-1.5" />
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </Button>
            <span className="inline-flex items-center text-sm text-gray-600 px-3">
              <MessageSquare className="h-4 w-4 mr-1.5" />
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </span>
            {isApplicable && (
              <span className="inline-flex items-center text-sm text-gray-600 px-3">
                <Briefcase className="h-4 w-4 mr-1.5" />
                {applicationCount}{" "}
                {applicationCount === 1 ? "applicant" : "applicants"}
              </span>
            )}
          </div>

          {/* Apply CTA — non-owner, applicable notice */}
          {isApplicable && !isOwner && myUserId && (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-2">
              {!applyMessageOpen && !hasApplied && (
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setApplyMessageOpen(true)}
                >
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  {current.postType === "SPONSOR"
                    ? current.sponsorshipDirection === "OFFERING_SPONSORSHIP"
                      ? "Apply for sponsorship"
                      : "Offer sponsorship"
                    : current.postType === "EXPERT_REQUIRED"
                      ? "Apply as coach"
                      : "Apply as player"}
                </Button>
              )}
              {applyMessageOpen && !hasApplied && (
                <>
                  <Textarea
                    rows={3}
                    placeholder="Optional — add a short message for the poster"
                    value={applyMessage}
                    maxLength={2000}
                    onChange={(e) => setApplyMessage(e.target.value)}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setApplyMessageOpen(false);
                        setApplyMessage("");
                      }}
                      disabled={applying}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApply}
                      disabled={applying}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {applying ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1.5" />
                      )}
                      Confirm application
                    </Button>
                  </div>
                </>
              )}
              {hasApplied && !confirmWithdraw && (
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center text-sm text-emerald-700 font-medium">
                    <Check className="h-4 w-4 mr-1.5" />
                    You've applied
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmWithdraw(true)}
                    disabled={applying}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Withdraw application
                  </Button>
                </div>
              )}
              {hasApplied && confirmWithdraw && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-red-700">
                    Withdraw your application?
                  </p>
                  <p className="text-xs text-red-700/80">
                    The poster will no longer see you in the applicants list.
                    You can re-apply later.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmWithdraw(false)}
                      disabled={applying}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApply}
                      disabled={applying}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {applying ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : null}
                      Yes, withdraw
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applicants list — owner only */}
          {isApplicable && isOwner && (
            <div className="rounded-lg border border-stone-200 bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800 inline-flex items-center">
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  Applicants ({applicationCount})
                </p>
                <span className="text-[10px] uppercase tracking-wider text-gray-500">
                  Visible only to you
                </span>
              </div>
              {applicantsLoading && (
                <p className="text-xs text-gray-500">Loading applicants…</p>
              )}
              {!applicantsLoading && applicants.length === 0 && (
                <p className="text-xs text-gray-500">
                  No one has applied yet.
                </p>
              )}
              <ul className="divide-y divide-stone-100">
                {applicants.map((a) => (
                  <li key={a.id} className="py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-800 text-sm">
                        @{a.username}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatDate(a.createdAt)}
                      </span>
                    </div>
                    {a.message && (
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                        {a.message}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comments */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                rows={2}
                value={commentText}
                placeholder="Add a comment…"
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={2000}
              />
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
                className="bg-red-600 hover:bg-red-700 self-end"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {commentLoading && (
              <p className="text-xs text-gray-500">Loading comments…</p>
            )}

            {!commentLoading && comments.length === 0 && (
              <p className="text-xs text-gray-500">
                No comments yet. Be the first to reply.
              </p>
            )}

            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg bg-stone-50 border border-stone-200 p-3"
                >
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {c.content}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {formatDate(c.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeDetailDialog;
