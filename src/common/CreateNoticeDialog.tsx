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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  UserPlus,
  GraduationCap,
  Handshake,
  Trophy,
  Megaphone,
  HeartHandshake,
  Search,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createNotice,
  resetCreateState,
  type CreateNoticePayload,
  type NoticeContactMethod,
  type NoticePostType,
  type NoticePostedByType,
  type NoticeSponsorshipDirection,
  type NoticeUrgency,
  type NoticeVisibility,
} from "@/store/notice-slice";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PostTypeOption = {
  value: NoticePostType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const POST_TYPES: PostTypeOption[] = [
  {
    value: "PLAYER_REQUIRED",
    label: "Player needed",
    description: "Looking for a player to join your team or trial",
    icon: UserPlus,
    accent: "from-rose-100 to-rose-50 border-rose-200",
  },
  {
    value: "EXPERT_REQUIRED",
    label: "Coach needed",
    description: "Looking for a coach, trainer, scout, or expert",
    icon: GraduationCap,
    accent: "from-violet-100 to-violet-50 border-violet-200",
  },
  {
    value: "SPONSOR",
    label: "Sponsor request",
    description: "Seeking sponsorship or sponsor partnerships",
    icon: Handshake,
    accent: "from-amber-100 to-amber-50 border-amber-200",
  },
  {
    value: "MATCH",
    label: "Match announcement",
    description: "Announce an upcoming match or fixture",
    icon: Megaphone,
    accent: "from-sky-100 to-sky-50 border-sky-200",
  },
  {
    value: "RESULT",
    label: "Match Results update",
    description: "Share the result of a recently played match",
    icon: Trophy,
    accent: "from-emerald-100 to-emerald-50 border-emerald-200",
  },
];

const URGENCIES: { value: NoticeUrgency; label: string }[] = [
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

const ROLE_TO_POSTED_BY: Record<string, NoticePostedByType> = {
  player: "PLAYER",
  expert: "EXPERT",
  team: "TEAM",
  scout: "SCOUT",
  sponsor: "SPONSOR",
};

interface FormState {
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

type FormErrors = Partial<
  Record<"title" | "description" | "contactEmail" | "contactPhone", string>
>;

const emptyForm: FormState = {
  title: "",
  description: "",
  city: "",
  region: "",
  country: "",
  clubOrTeamName: "",
  contactMethod: "IN_APP_MESSAGE",
  contactPersonName: "",
  contactEmail: "",
  contactPhone: "",
  urgency: "ONGOING",
  visibility: "PUBLIC",
};

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isValidPhone = (s: string) => /^\+?[0-9\s().-]{6,30}$/.test(s.trim());

const CreateNoticeDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const { createStatus, createError } = useAppSelector((s) => s.notices);

  const [step, setStep] = useState<"choose" | "sponsor-direction" | "fill">(
    "choose"
  );
  const [postType, setPostType] = useState<NoticePostType | null>(null);
  const [sponsorshipDirection, setSponsorshipDirection] =
    useState<NoticeSponsorshipDirection | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as keyof FormErrors];
      return next;
    });
  };

  const postedByType: NoticePostedByType = useMemo(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase();
    return ROLE_TO_POSTED_BY[role] || "PLAYER";
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStep("choose");
      setPostType(null);
      setSponsorshipDirection(null);
      setForm(emptyForm);
      setErrors({});
      dispatch(resetCreateState());
    }
  }, [open, dispatch]);

  const fieldsForType = (type: NoticePostType) => {
    const base = {
      showLocation: true,
      showClubOrTeamName: true,
      showContact: true,
      titleHint: "Title",
      descriptionHint: "Description",
    };
    if (type === "PLAYER_REQUIRED") {
      return {
        ...base,
        titleHint: "Position / role you need (e.g., Striker U-18)",
        descriptionHint:
          "What you're looking for: skill level, age range, availability, trial process…",
      };
    }
    if (type === "EXPERT_REQUIRED") {
      return {
        ...base,
        titleHint: "Type of expert (e.g., Goalkeeping Coach)",
        descriptionHint:
          "Specialism, certifications expected, availability, compensation…",
      };
    }
    if (type === "SPONSOR") {
      if (sponsorshipDirection === "OFFERING_SPONSORSHIP") {
        return {
          ...base,
          titleHint: "Sponsorship offer title (e.g., Boot deal — U-21 strikers)",
          descriptionHint:
            "Who you'll sponsor (sport, level, region), what you offer (cash / kit / equipment), application criteria, deadlines…",
        };
      }
      return {
        ...base,
        titleHint: "Sponsorship request (e.g., Need kit sponsor for U-18 squad)",
        descriptionHint:
          "Who you are, what you're seeking (cash / kit / equipment / travel), exposure on offer, audience, timeframe…",
      };
    }
    if (type === "MATCH") {
      return {
        ...base,
        titleHint: "Match title (e.g., Arsenal vs Spurs)",
        descriptionHint:
          "Date, kick-off, competition, ticket info, anything fans should know…",
      };
    }
    return {
      ...base,
      titleHint: "Result headline (e.g., Arsenal 3 – 1 Spurs)",
      descriptionHint:
        "Goalscorers, key moments, competition / matchday, attendance…",
    };
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.description.trim())
      next.description = "Description is required";
    if (form.contactMethod === "EMAIL") {
      if (!form.contactEmail.trim()) {
        next.contactEmail = "Email address is required";
      } else if (!isValidEmail(form.contactEmail)) {
        next.contactEmail = "Enter a valid email address";
      }
    }
    if (form.contactMethod === "PHONE") {
      if (!form.contactPhone.trim()) {
        next.contactPhone = "Phone number is required";
      } else if (!isValidPhone(form.contactPhone)) {
        next.contactPhone = "Enter a valid phone number";
      }
    }
    return next;
  };

  const handleSubmit = async () => {
    if (!postType) return;
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    const payload: CreateNoticePayload = {
      postType,
      title: form.title.trim(),
      description: form.description.trim(),
      contactMethod: form.contactMethod,
      urgency: form.urgency,
      visibility: form.visibility,
      postedByType,
      ...(form.city.trim() && { city: form.city.trim() }),
      ...(form.region.trim() && { region: form.region.trim() }),
      ...(form.country.trim() && { country: form.country.trim() }),
      ...(form.clubOrTeamName.trim() && {
        clubOrTeamName: form.clubOrTeamName.trim(),
      }),
      ...(form.contactPersonName.trim() && {
        contactPersonName: form.contactPersonName.trim(),
      }),
      ...(form.contactMethod === "EMAIL" &&
        form.contactEmail.trim() && {
          contactEmail: form.contactEmail.trim(),
        }),
      ...(form.contactMethod === "PHONE" &&
        form.contactPhone.trim() && {
          contactPhone: form.contactPhone.trim(),
        }),
      ...(postType === "SPONSOR" && sponsorshipDirection
        ? { sponsorshipDirection }
        : {}),
    };
    const result = await dispatch(createNotice(payload));
    if (createNotice.fulfilled.match(result)) {
      toast.success("Notice posted");
      onOpenChange(false);
    }
  };

  const fields = postType ? fieldsForType(postType) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                What do you want to post?
              </DialogTitle>
              <DialogDescription>
                Pick a notice type — we'll only ask for the fields that matter.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {POST_TYPES.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPostType(opt.value);
                      if (opt.value === "SPONSOR") {
                        setStep("sponsor-direction");
                      } else {
                        setStep("fill");
                      }
                    }}
                    className={`text-left rounded-xl border bg-gradient-to-br ${opt.accent} p-4 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white/70 p-2 shadow-sm">
                        <Icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {opt.label}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === "sponsor-direction" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setStep("choose");
                    setPostType(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-2xl">
                  Sponsorship — which side?
                </DialogTitle>
              </div>
              <DialogDescription>
                Are you looking for a sponsor, or are you offering sponsorship?
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => {
                  setSponsorshipDirection("SEEKING_SPONSOR");
                  setStep("fill");
                }}
                className="text-left rounded-xl border bg-gradient-to-br from-amber-100 to-amber-50 border-amber-200 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white/70 p-2 shadow-sm">
                    <Search className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Seeking sponsorship
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      You're a player / team / event looking for a brand or
                      sponsor to back you.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSponsorshipDirection("OFFERING_SPONSORSHIP");
                  setStep("fill");
                }}
                className="text-left rounded-xl border bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white/70 p-2 shadow-sm">
                    <HeartHandshake className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Offering sponsorship
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      You're a sponsor / brand offering support to athletes,
                      teams, or events.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === "fill" && postType && fields && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    setStep(
                      postType === "SPONSOR" ? "sponsor-direction" : "choose"
                    )
                  }
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-xl">
                  {POST_TYPES.find((p) => p.value === postType)?.label}
                  {postType === "SPONSOR" && sponsorshipDirection && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ·{" "}
                      {sponsorshipDirection === "SEEKING_SPONSOR"
                        ? "Seeking"
                        : "Offering"}
                    </span>
                  )}
                </DialogTitle>
              </div>
              <DialogDescription>
                Fill in the details below. Required fields are marked with *.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="notice-title">{fields.titleHint} *</Label>
                <Input
                  id="notice-title"
                  value={form.title}
                  maxLength={120}
                  aria-invalid={!!errors.title}
                  className={
                    errors.title
                      ? "border-red-500 focus-visible:ring-red-500"
                      : undefined
                  }
                  onChange={(e) => setField("title", e.target.value)}
                />
                {errors.title && (
                  <p className="text-xs text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notice-desc">{fields.descriptionHint} *</Label>
                <Textarea
                  id="notice-desc"
                  rows={5}
                  maxLength={5000}
                  value={form.description}
                  aria-invalid={!!errors.description}
                  className={
                    errors.description
                      ? "border-red-500 focus-visible:ring-red-500"
                      : undefined
                  }
                  onChange={(e) => setField("description", e.target.value)}
                />
                {errors.description && (
                  <p className="text-xs text-red-600">{errors.description}</p>
                )}
              </div>

              {fields.showClubOrTeamName && (
                <div className="space-y-1.5">
                  <Label htmlFor="notice-club">Club / team name</Label>
                  <Input
                    id="notice-club"
                    value={form.clubOrTeamName}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        clubOrTeamName: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {fields.showLocation && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="notice-city">City</Label>
                    <Input
                      id="notice-city"
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notice-region">Region</Label>
                    <Input
                      id="notice-region"
                      value={form.region}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, region: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notice-country">Country</Label>
                    <Input
                      id="notice-country"
                      value={form.country}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, country: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}

              {fields.showContact && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Contact method *</Label>
                      <Select
                        value={form.contactMethod}
                        onValueChange={(v) => {
                          setForm((f) => ({
                            ...f,
                            contactMethod: v as NoticeContactMethod,
                          }));
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.contactEmail;
                            delete next.contactPhone;
                            return next;
                          });
                        }}
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
                      <Label htmlFor="notice-contact-person">
                        Contact person
                      </Label>
                      <Input
                        id="notice-contact-person"
                        value={form.contactPersonName}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            contactPersonName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {form.contactMethod === "EMAIL" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="notice-contact-email">
                        Email address *
                      </Label>
                      <Input
                        id="notice-contact-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={form.contactEmail}
                        maxLength={120}
                        aria-invalid={!!errors.contactEmail}
                        className={
                          errors.contactEmail
                            ? "border-red-500 focus-visible:ring-red-500"
                            : undefined
                        }
                        onChange={(e) =>
                          setField("contactEmail", e.target.value)
                        }
                      />
                      {errors.contactEmail && (
                        <p className="text-xs text-red-600">
                          {errors.contactEmail}
                        </p>
                      )}
                    </div>
                  )}

                  {form.contactMethod === "PHONE" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="notice-contact-phone">
                        Phone number *
                      </Label>
                      <Input
                        id="notice-contact-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+44 20 7946 0958"
                        value={form.contactPhone}
                        maxLength={40}
                        aria-invalid={!!errors.contactPhone}
                        className={
                          errors.contactPhone
                            ? "border-red-500 focus-visible:ring-red-500"
                            : undefined
                        }
                        onChange={(e) =>
                          setField("contactPhone", e.target.value)
                        }
                      />
                      {errors.contactPhone && (
                        <p className="text-xs text-red-600">
                          {errors.contactPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Urgency *</Label>
                  <Select
                    value={form.urgency}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, urgency: v as NoticeUrgency }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCIES.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Visibility</Label>
                  <Select
                    value={form.visibility}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        visibility: v as NoticeVisibility,
                      }))
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
              </div>

              {createError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {createError}
                </p>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createStatus === "loading"}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createStatus === "loading"}
                className="bg-red-600 hover:bg-red-700"
              >
                {createStatus === "loading" && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Post Notice
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoticeDialog;
