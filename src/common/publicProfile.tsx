import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  MapPin,
  Award,
  Briefcase,
  User as UserIcon,
  Globe,
  Languages,
  ArrowLeft,
  Play,
  Video,
  Target,
  Dumbbell,
  Mail,
  Phone,
  Clock,
  Footprints,
  Ruler,
  Weight,
  CalendarDays,
  Building2,
  Wallet,
  Link2,
  ShieldCheck,
  FileText,
  Download,
  Share2,
  X,
  Users,
  Heart,
  Sparkles,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  MessageSquare,
  UserPlus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../Pages/Home/Navbar";
import axios from "axios";
import { toPng } from "html-to-image";
import {
  pdf,
  Document as PDFDocument,
  Page,
  Image as PDFImage,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import outceedoLogo from "@/assets/images/outceedologo.png";
import logoSmall from "@/assets/images/logosmall.png";
import Seo from "@/components/seo/Seo";
import { meCanChat, normaliseRole, NO_CHAT_ROLES } from "@/common/chatPermissions";

const SITE_BASE = (
  import.meta.env.VITE_HOME || "https://outceedo.com"
).replace(/\/$/, "");

/** Trim text to a max character length for use in a meta description. */
const trimChars = (text: string, max = 155) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + "…";
};

/* ----------------------------- Theme palette ----------------------------- */
// primary  -> white      #ffffff
// secondary-> red        #ef4444 / #dc2626
// third    -> ivory      #FAF7EF
// accent   -> navy       #0E1B33
const IVORY = "#FAF7EF";
const NAVY = "#0E1B33";

/* ------------------------------- Interfaces ------------------------------- */
interface ServiceAdditionalDetails {
  duration?: string;
  description?: string;
}

interface Service {
  id: string;
  serviceId: string;
  price: number;
  additionalDetails?: ServiceAdditionalDetails | null;
}

interface DocumentItem {
  id: string;
  title?: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  type?: string;
  description?: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  reviewer?: {
    id?: string;
    username?: string;
    photo?: string | null;
  } | null;
}

interface Profile {
  id: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  mobile_number?: string;
  photo?: string;
  age?: number;
  gender?: string;
  birthYear?: number;
  city?: string;
  country?: string;
  address?: string;
  bio?: string;
  profession?: string;
  position?: string;
  foot?: string;
  playerLevel?: string;
  nationality?: string;
  specialization?: string;
  experience?: string;
  certificationLevel?: string;
  company?: string;
  companyLink?: string;
  sport?: string;
  language?: string[];
  skills?: string[];
  interests?: string[];
  club?: string;
  height?: number;
  weight?: number;
  responseTime?: string;
  travelLimit?: string;
  services?: Service[];
  documents?: DocumentItem[];
  socialLinks?: {
    twitter?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    youtube?: string | null;
  };
  // sponsor
  sponsorType?: string | null;
  budgetRange?: string | null;
  sponsorshipType?: string | null;
  sponsorshipCountryPreferred?: string | null;
  currency?: string | null;
  // team
  teamName?: string | null;
  teamType?: string | null;
  teamCategory?: string | null;
  // reviews
  reviewsReceived?: Review[];
}

const SERVICE_NAMES: Record<string, { name: string; icon: React.ReactNode }> = {
  "1": { name: "Recorded Video Assessment", icon: <Play size={18} /> },
  "2": { name: "Online Training", icon: <Video size={18} /> },
  "3": { name: "On Ground Assessment", icon: <Target size={18} /> },
};

const getServiceInfo = (serviceId: string) =>
  SERVICE_NAMES[serviceId] || {
    name: "On Ground Training",
    icon: <Dumbbell size={18} />,
  };

const BIO_WORD_LIMIT = 50;

/**
 * Ensure an external link is absolute. Stored social links often omit the
 * protocol (e.g. "instagram.com/foo"), which the browser would otherwise
 * resolve relative to the current origin.
 */
const normalizeUrl = (url?: string | null): string | undefined => {
  const trimmed = (url || "").trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

/** Trim text to a maximum number of words, appending an ellipsis when cut. */
const trimWords = (text: string, limit: number) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return { text: text.trim(), truncated: false };
  return { text: words.slice(0, limit).join(" ") + " …", truncated: true };
};

const prettyFoot = (foot?: string) => {
  if (!foot) return "";
  return foot
    .replace(/_/g, " ")
    .replace(/\bfoot\b/i, "Foot")
    .replace(/^\w/, (c) => c.toUpperCase());
};

const prettyLevel = (level?: string) => {
  if (!level) return "";
  const map: Record<string, string> = {
    grassroots: "Grassroots",
    academy: "Academy",
    semi_pro: "Semi-Pro",
    professional: "Professional",
  };
  return map[level] || level;
};

/* ----------------- Convert remote image to base64 (CORS safe) ------------- */
const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  if (!imageUrl) return "";
  try {
    const response = await fetch(imageUrl, {
      mode: "cors",
      credentials: "omit",
      cache: "no-cache",
    });
    if (response.ok) {
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    /* fall through */
  }
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.95));
        } catch {
          resolve("");
        }
      } else resolve("");
    };
    img.onerror = () => resolve("");
    const sep = imageUrl.includes("?") ? "&" : "?";
    img.src = `${imageUrl}${sep}t=${Date.now()}`;
  });
};

/* ----------------------------- PDF wrapper -------------------------------- */
const pdfStyles = StyleSheet.create({
  page: { padding: 0, backgroundColor: "#ffffff" },
  full: { width: "100%", height: "100%", objectFit: "cover" },
});

const CvPdf: React.FC<{ image: string; width: number; height: number }> = ({
  image,
  width,
  height,
}) => (
  <PDFDocument>
    <Page size={[width, height]} style={pdfStyles.page}>
      <View style={pdfStyles.full}>
        <PDFImage src={image} style={pdfStyles.full} />
      </View>
    </Page>
  </PDFDocument>
);

/* ------------------------ Small presentational bits ----------------------- */
const Chip: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700">
    {icon}
    {children}
  </span>
);

const SectionTitle: React.FC<{
  kicker?: string;
  children: React.ReactNode;
}> = ({ kicker, children }) => (
  <div className="mb-5">
    {kicker && (
      <div className="mb-2 inline-flex items-center gap-2 text-red-500 font-black tracking-[0.3em] uppercase text-[10px]">
        <span className="h-[2px] w-8 bg-red-500" />
        {kicker}
      </div>
    )}
    <h2 className="text-2xl font-black tracking-tighter text-gray-900 uppercase italic">
      {children}
    </h2>
  </div>
);

const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  multiline?: boolean;
}> = ({ icon, label, value, multiline }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center gap-3 py-4.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <p
          className={`${
            multiline ? "break-words" : "truncate"
          } text-sm font-semibold text-gray-900`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

/** Compact credential card; clicking it opens the doc in the preview modal. */
const CredentialCard: React.FC<{
  doc: DocumentItem;
  fallbackIcon: React.ReactNode;
  onView: (doc: DocumentItem) => void;
}> = ({ doc, fallbackIcon, onView }) => (
  <button
    type="button"
    onClick={() => onView(doc)}
    className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition-shadow hover:shadow-md"
    style={{ backgroundColor: IVORY }}
  >
    {doc.imageUrl ? (
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-gray-200">
        <img
          src={doc.imageUrl}
          alt={doc.title || "credential"}
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
        />
      </div>
    ) : (
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-red-500">
        {fallbackIcon}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-gray-900">{doc.title}</p>
      {(doc.issuedBy || doc.issuedDate) && (
        <p className="truncate text-xs text-gray-500">
          {[doc.issuedBy, doc.issuedDate].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  </button>
);

/* ================================ Component =============================== */
export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [imgLoading, setImgLoading] = useState(true);
  const cvRef = useRef<HTMLDivElement>(null);

  // Connect & Chat flow
  type ConnectStage =
    | "confirm"
    | "sent"
    | "exists"
    | "accepted"
    | "rejected"
    | "error"
    | "login";
  const [connectStage, setConnectStage] = useState<ConnectStage | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [rejectedAsRequester, setRejectedAsRequester] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError("No username provided");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_PORT}/api/v1/user/profile/${username}`,
        );
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  // Preload the profile photo as base64 so PDF capture keeps the image.
  useEffect(() => {
    if (profile?.photo) {
      convertImageToBase64(profile.photo).then(setPhotoBase64);
    }
  }, [profile?.photo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Seo title="Loading profile" noindex />
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-red-500" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white">
        <Seo title="Profile Not Found" noindex />
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="mb-4 text-3xl font-black text-gray-900">
            Profile Not Found
          </h1>
          <p className="mb-8 text-gray-500">{error || "User does not exist"}</p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-red-500"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* ----------------------------- Derived data ---------------------------- */
  const role = (profile.role || "").toLowerCase();
  const isPlayer = role === "player";
  const isExpert = role === "expert";
  const isScout = role === "scout";
  const isSponsor = role === "sponsor";
  const isTeam = role === "team";

  const showExpertScout = isExpert || isScout;

  // Whether to show the Connect & Chat button. Sponsors/fans can never be
  // messaged, so the button is always hidden for them. For everyone else: a
  // logged-in viewer only sees it when their role may message this role; a
  // logged-out viewer still sees it (the click prompts them to log in).
  const canConnect = (() => {
    if (NO_CHAT_ROLES.includes(normaliseRole(role))) return false;
    if (!localStorage.getItem("token")) return true;
    return meCanChat(role);
  })();

  const displayName = isTeam
    ? profile.teamName ||
      `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
      profile.username ||
      "Outceedo Member";

  const roleLabel = (() => {
    if (isTeam) return profile.teamType ? `${profile.teamType} Team` : "Team";
    if (isSponsor)
      return profile.sponsorType ? `${profile.sponsorType} Sponsor` : "Sponsor";
    if (isScout) return "Scout";
    if (isExpert) return profile.profession || "Expert";
    if (isPlayer) return profile.position || "Player";
    return profile.profession || "Member";
  })();

  const roleLabel2 = (() => {
    if (isTeam) return  "Team";
    if (isSponsor) return "Sponsor";
    if (isScout) return "Scout";
    if (isExpert) return "Expert";
    if (isPlayer) return "Player";
    return profile.profession || "Member";
  })();

  const photoSrc = photoBase64 || profile.photo || "";
  const locationStr = [profile.city, profile.country]
    .filter(Boolean)
    .join(", ");
  const locationNode = locationStr ? (
    <>
      {profile.city && <span className="block">{profile.city},</span>}
      {profile.country && <span className="block">{profile.country}</span>}
    </>
  ) : undefined;

  const socials = profile.socialLinks || {};
  const socialList = [
    { key: "linkedin", url: normalizeUrl(socials.linkedin), icon: <Linkedin size={16} /> },
    { key: "twitter", url: normalizeUrl(socials.twitter), icon: <Twitter size={16} /> },
    { key: "facebook", url: normalizeUrl(socials.facebook), icon: <Facebook size={16} /> },
    { key: "instagram", url: normalizeUrl(socials.instagram), icon: <Instagram size={16} /> },
    { key: "youtube", url: normalizeUrl(socials.youtube), icon: <Youtube size={16} /> },
  ].filter((s) => s.url);

  const certificates = (profile.documents || []).filter(
    (d) => d.type === "certificate",
  );
  const awards = (profile.documents || []).filter((d) => d.type === "award");

  const reviews = profile.reviewsReceived || [];
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
      : 0;

  /* --------------------------- Connect & Chat ---------------------------- */
  const targetUsername = profile.username || username || "";
  const myUsername = localStorage.getItem("username") || "";
  const isOwnProfile = !!myUsername && myUsername === targetUsername;

  const handleConnectClick = () => {
    const token = localStorage.getItem("token");
    if (!token || !myUsername) {
      setConnectStage("login");
      return;
    }
    setConnectStage("confirm");
  };

  const sendChatRequest = async () => {
    setConnecting(true);
    setConnectError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_PORT}/api/v1/other/chats/request`,
        { home: myUsername, away: targetUsername },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const status = res.data?.chat?.status;
      const created = res.data?.created;
      const isRequester = res.data?.chat?.viewer?.isRequester;
      if (status === "rejected") {
        setRejectedAsRequester(!!isRequester);
        setConnectStage("rejected");
      } else if (status === "accepted") setConnectStage("accepted");
      else if (created) setConnectStage("sent");
      else setConnectStage("exists");
    } catch (e: any) {
      setConnectError(e?.response?.data?.message || "Failed to send request");
      setConnectStage("error");
    } finally {
      setConnecting(false);
    }
  };

  // Open the logged-in user's dashboard in a new tab with the chat drawer open.
  const openMessages = () => {
    const myRole = (localStorage.getItem("role") || "").toLowerCase();
    setConnectStage(null);
    if (myRole) window.open(`/${myRole}/profile?openChat=1`, "_blank");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${displayName} · Outceedo`,
      text: `Check out ${displayName}'s profile on Outceedo`,
      url,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(url);
        alert("Profile link copied to clipboard!");
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleDownloadPdf = async () => {
    if (!cvRef.current) return;
    setDownloading(true);
    // Force the bio into its trimmed (100-word) state for the PDF and hide the
    // read-more toggle, regardless of how it's expanded on screen.
    setCapturing(true);
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    try {
      const node = cvRef.current;
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        includeQueryParams: true,
        backgroundColor: "#ffffff",
      });
      const blob = await pdf(
        <CvPdf image={dataUrl} width={width} height={height} />,
      ).toBlob();
      saveAs(blob, `${displayName.replace(/\s+/g, "_") || "outceedo"}_CV.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF", e);
    } finally {
      setCapturing(false);
      setDownloading(false);
    }
  };

  /* ------------------- Role-aware header chips (below name) ------------------- */
  const headerChips: { icon: React.ReactNode; value?: string }[] = (() => {
    if (isPlayer)
      return [
        { icon: <Briefcase size={13} className="text-red-500" />, value: profile.sport },
        { icon: <Target size={13} className="text-red-500" />, value: profile.position },
        { icon: <Footprints size={13} className="text-red-500" />, value: prettyFoot(profile.foot) },
        { icon: <CalendarDays size={13} className="text-red-500" />, value: profile.age ? `${profile.age} yrs` : undefined },
      ];
    if (isExpert)
      return [
        { icon: <Briefcase size={13} className="text-red-500" />, value: profile.sport },
        { icon: <Award size={13} className="text-red-500" />, value: profile.certificationLevel?.trim() },
        { icon: <Target size={13} className="text-red-500" />, value: profile.position },
        { icon: <Sparkles size={13} className="text-red-500" />, value: profile.experience },
      ];
    if (isScout)
      return [
        { icon: <Briefcase size={13} className="text-red-500" />, value: profile.sport },
        { icon: <Award size={13} className="text-red-500" />, value: profile.certificationLevel?.trim() },
        { icon: <Sparkles size={13} className="text-red-500" />, value: profile.experience },
      ];
    return [
      { icon: <Users size={13} className="text-red-500" />, value: profile.club },
      { icon: <MapPin size={13} className="text-red-500" />, value: locationStr },
      { icon: <Briefcase size={13} className="text-red-500" />, value: profile.sport },
    ];
  })().filter((c) => c.value);

  /* ------------------- Role-aware detail rows (sidebar) ------------------- */
  const detailRows = (
    <>
      {/* Player only */}
      {isPlayer && (
        <>
          <DetailRow
            icon={<Award size={16} />}
            label="Playing Level"
            value={prettyLevel(profile.playerLevel)}
          />
          <DetailRow
            icon={<Users size={16} />}
            label="Club"
            value={profile.club}
          />
          <DetailRow
            icon={<MapPin size={16} />}
            label="Location"
            value={locationNode}
            multiline
          />
          <DetailRow
            icon={<UserIcon size={16} />}
            label="Gender"
            value={profile.gender}
          />
          <DetailRow
            icon={<Weight size={16} />}
            label="Weight"
            value={profile.weight ? `${profile.weight} kg` : undefined}
          />
          <DetailRow
            icon={<Ruler size={16} />}
            label="Height"
            value={profile.height ? `${profile.height} cm` : undefined}
          />
        </>
      )}
      {/* Expert + Scout only */}
      {showExpertScout && (
        <>
          <DetailRow
            icon={<Users size={16} />}
            label="Club"
            value={profile.club}
          />
          <DetailRow
            icon={<Sparkles size={16} />}
            label="Specialisation"
            value={profile.specialization}
          />
          <DetailRow
            icon={<Globe size={16} />}
            label="Nationality"
            value={profile.nationality}
          />
          <DetailRow
            icon={<MapPin size={16} />}
            label="Location"
            value={locationNode}
            multiline
          />
          <DetailRow
            icon={<Clock size={16} />}
            label="Response Time"
            value={
              profile.responseTime ? `${profile.responseTime} mins` : undefined
            }
          />
        </>
      )}
      {/* Sponsor + Team: general rows */}
      {(isSponsor || isTeam) && (
        <>
          <DetailRow
            icon={<MapPin size={16} />}
            label="Location"
            value={locationNode}
            multiline
          />
          <DetailRow
            icon={<Briefcase size={16} />}
            label="Sport"
            value={profile.sport}
          />
          <DetailRow
            icon={<Users size={16} />}
            label="Club"
            value={profile.club}
          />
        </>
      )}
      {/* Team only */}
      {isTeam && (
        <>
          <DetailRow
            icon={<ShieldCheck size={16} />}
            label="Team Type"
            value={profile.teamType}
          />
          <DetailRow
            icon={<Award size={16} />}
            label="Category"
            value={profile.teamCategory}
          />
        </>
      )}
      {/* Sponsor only */}
      {isSponsor && (
        <>
          <DetailRow
            icon={<Building2 size={16} />}
            label="Company"
            value={profile.company}
          />
          <DetailRow
            icon={<ShieldCheck size={16} />}
            label="Sponsor Type"
            value={profile.sponsorType}
          />
          <DetailRow
            icon={<Wallet size={16} />}
            label="Budget Range"
            value={
              profile.budgetRange
                ? `${profile.currency ? profile.currency + " " : ""}${profile.budgetRange}`
                : undefined
            }
          />
          <DetailRow
            icon={<Sparkles size={16} />}
            label="Sponsorship Type"
            value={profile.sponsorshipType}
          />
          <DetailRow
            icon={<Globe size={16} />}
            label="Preferred Country"
            value={profile.sponsorshipCountryPreferred}
          />
          {profile.companyLink && (
            <DetailRow
              icon={<Link2 size={16} />}
              label="Website"
              value={
                <a
                  href={profile.companyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-300 hover:text-red-200"
                >
                  Visit
                </a>
              }
            />
          )}
        </>
      )}
    </>
  );

  /* ------------------------------ SEO meta ------------------------------ */
  const profileUsername = profile.username || username || "";
  const canonicalPath = role
    ? `/${role}/${profileUsername}`
    : `/${profileUsername}`;
  const seoTitle = `${displayName} · ${roleLabel2}`;
  const seoDescription = profile.bio
    ? trimChars(profile.bio)
    : `${displayName} — ${roleLabel2}${locationStr ? ` based in ${locationStr}` : ""} on Outceedo.`;
  const sameAs = socialList.map((s) => s.url as string);
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": isTeam ? "SportsTeam" : "Person",
    name: displayName,
    url: `${SITE_BASE}${canonicalPath}`,
    ...(profile.photo ? { image: profile.photo } : {}),
    ...(profile.bio ? { description: trimChars(profile.bio, 300) } : {}),
    ...(profile.sport ? { sport: profile.sport } : {}),
    ...(!isTeam ? { jobTitle: roleLabel2} : {}),
    ...(locationStr
      ? { homeLocation: { "@type": "Place", name: locationStr } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(avgRating.toFixed(1)),
            reviewCount,
            bestRating: 5,
          },
        }
      : {}),
  };

  /* ============================== Render ============================== */
  return (
    <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        image={profile.photo || undefined}
        type="profile"
        jsonLd={profileJsonLd}
      />
      {/* <Navbar /> */}

      {/* Action bar */}
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              location.key === "default" ? navigate("/") : navigate(-1)
            }
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Share2 size={15} /> Share
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-red-500/25 transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              <Download size={15} />
              {downloading ? "Preparing…" : "Download CV"}
            </button>
          </div>
        </div>
      </div>

      {/* ====================== The CV card (also captured) ===================== */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          ref={cvRef}
          className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_-20px_rgba(14,27,51,0.25)]"
        >
          {/* Header band */}
          <div
            className="relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10"
            style={{ backgroundColor: IVORY }}
          >
            <div className="pointer-events-none absolute -right-1 top-1/2 -translate-y-1/2 select-none text-[120px] font-black italic leading-none tracking-tighter text-black/[0.035] sm:text-[180px]">
              {roleLabel2.split(" ")[0].toUpperCase()}
            </div>
            <div className="absolute left-0 top-0 h-full w-1.5 bg-red-500" />

            <div className="relative flex flex-col items-center gap-7 sm:flex-row sm:items-center">
              <div className="flex flex-shrink-0 flex-col items-center gap-3">
                <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:h-36 sm:w-36">
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={displayName}
                      crossOrigin="anonymous"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <UserIcon size={56} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                  {roleLabel2}
                </div>
                <h1
                  className="text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-5xl"
                  style={{ color: NAVY }}
                >
                  {displayName}
                </h1>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {headerChips.map((chip, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700"
                    >
                      {chip.icon} {chip.value}
                    </span>
                  ))}
                </div>

                {!isOwnProfile && !capturing && canConnect && (
                  <div
                    data-html2canvas-ignore="true"
                    className="mt-5 flex justify-center sm:justify-start"
                  >
                    <button
                      onClick={handleConnectClick}
                      className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-600"
                    >
                      <MessageSquare size={16} /> Connect &amp; Chat
                    </button>
                  </div>
                )}
              </div>

              {/* Outceedo brand mark (top-right) */}
              <img
                src={outceedoLogo}
                alt="Outceedo"
                crossOrigin="anonymous"
                className="absolute right-6 top-6 hidden h-11 object-contain sm:block"
              />
            </div>
          </div>

          {/* Body: sidebar + main */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
            {/* Sidebar */}
            <aside
              className="border-r border-gray-100 px-6 py-7 sm:px-8"
              style={{ backgroundColor: IVORY }}
            >
              <h3 className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                Details
              </h3>
              <div className="divide-y divide-gray-200/60">{detailRows}</div>

              {/* Languages */}
              {profile.language && profile.language.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                    <Languages size={13} /> Languages
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.language.map((lang, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Socials */}
              {socialList.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                    Connect
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {socialList.map((s) => (
                      <a
                        key={s.key}
                        href={s.url as string}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-red-500 hover:text-white"
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Main column */}
            <main className="space-y-10 px-6 py-9 sm:px-10">
              {/* About */}
              {profile.bio &&
                (() => {
                  const { text: bioTrimmed, truncated } = trimWords(
                    profile.bio,
                    BIO_WORD_LIMIT,
                  );
                  // For the PDF (capturing) always show the trimmed version.
                  const expanded = showFullBio && !capturing;
                  return (
                    <section>
                      <SectionTitle kicker="Profile">About</SectionTitle>
                      <p className="whitespace-pre-line border-l-4 border-red-500 pl-5 text-[15px] leading-relaxed text-gray-600">
                        {expanded ? profile.bio.trim() : bioTrimmed}
                      </p>
                      {truncated && !capturing && (
                        <button
                          onClick={() => setShowFullBio((v) => !v)}
                          className="ml-5 mt-3 text-xs font-black uppercase tracking-widest text-red-500 transition-colors hover:text-red-600"
                        >
                          {expanded ? "Read less" : "Read more"}
                        </button>
                      )}
                    </section>
                  );
                })()}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <section>
                  <SectionTitle kicker="Strengths">Skills</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <section>
                  <SectionTitle kicker="Off the pitch">Interests</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((it, i) => (
                      <Chip
                        key={i}
                        icon={<Heart size={13} className="text-red-500" />}
                      >
                        {it}
                      </Chip>
                    ))}
                  </div>
                </section>
              )}

              {/* Services (expert + scout) */}
              {showExpertScout &&
                profile.services &&
                profile.services.length > 0 && (
                  <section>
                    <SectionTitle kicker="Available">Services</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {profile.services.map((service) => {
                        const info = getServiceInfo(service.serviceId);
                        return (
                          <span
                            key={service.id}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700"
                          >
                            <span className="text-red-500">{info.icon}</span>
                            {info.name}
                          </span>
                        );
                      })}
                    </div>
                  </section>
                )}

              {/* Awards */}
              {awards.length > 0 && (
                <section>
                  <SectionTitle kicker="Achievements">Awards</SectionTitle>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {awards.map((doc) => (
                      <CredentialCard
                        key={doc.id}
                        doc={doc}
                        fallbackIcon={<Award size={28} />}
                        onView={(d) => { setImgLoading(true); setPreviewDoc(d); }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {certificates.length > 0 && (
                <section>
                  <SectionTitle kicker="Credentials">
                    Certifications
                  </SectionTitle>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {certificates.map((doc) => (
                      <CredentialCard
                        key={doc.id}
                        doc={doc}
                        fallbackIcon={<FileText size={28} />}
                        onView={(d) => { setImgLoading(true); setPreviewDoc(d); }}
                      />
                    ))}
                  </div>
                </section>
              )}

            </main>
          </div>

          {/* Footer with small logo bottom-right */}
          <div
            className="flex items-center justify-between px-6 py-4 sm:px-10"
            style={{ backgroundColor: IVORY }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">
              Outdo your sport to succeed
            </p>
            <img
              src={logoSmall}
              alt="Outceedo"
              crossOrigin="anonymous"
              className="h-7 w-7 object-contain"
            />
          </div>
        </motion.div>
      </div>

      {/* Credential preview modal (rendered outside the captured CV card) */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewDoc(null)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl shadow-2xl"
            style={{ backgroundColor: IVORY }}
            onClick={(e) => e.stopPropagation()}
          >
            {previewDoc.imageUrl ? (
              <div className="relative flex min-h-[220px] w-full items-center justify-center bg-white">
                {imgLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-red-500" />
                  </div>
                )}
                <img
                  src={previewDoc.imageUrl}
                  alt={previewDoc.title || "credential"}
                  crossOrigin="anonymous"
                  onLoad={() => setImgLoading(false)}
                  onError={() => setImgLoading(false)}
                  className={`max-h-[60vh] w-full object-contain transition-opacity duration-300 ${
                    imgLoading ? "opacity-0" : "opacity-100"
                  }`}
                />
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-red-500">
                {previewDoc.type === "award" ? (
                  <Award size={56} />
                ) : (
                  <FileText size={56} />
                )}
              </div>
            )}
            <div className="p-5">
              {previewDoc.type && (
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {previewDoc.type === "award" ? (
                    <Award size={12} />
                  ) : (
                    <FileText size={12} />
                  )}
                  {previewDoc.type}
                </span>
              )}
              <h3 className="text-xl font-black text-gray-900">
                {previewDoc.title}
              </h3>
              {(previewDoc.issuedBy || previewDoc.issuedDate) && (
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  {[previewDoc.issuedBy, previewDoc.issuedDate]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {previewDoc.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {previewDoc.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect & Chat modal */}
      {connectStage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConnectStage(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {connectStage === "confirm" ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <UserPlus className="text-red-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  Send chat request?
                </h3>
                <p className="mb-5 text-sm text-gray-600">
                  Send a chat request to <b>@{targetUsername}</b>? They'll be
                  able to chat with you once they accept it.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConnectStage(null)}
                    disabled={connecting}
                    className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendChatRequest}
                    disabled={connecting}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    {connecting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <MessageSquare size={15} />
                    )}
                    Send request
                  </button>
                </div>
              </>
            ) : connectStage === "login" ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <MessageSquare className="text-red-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  Login to chat
                </h3>
                <p className="mb-5 text-sm text-gray-600">
                  Log in to Outceedo to send a chat request. Once logged in, open
                  your messages and wait for the request to be accepted — then
                  you can chat.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConnectStage(null)}
                    className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Login
                  </button>
                </div>
              </>
            ) : connectStage === "error" ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <MessageSquare className="text-red-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  Something went wrong
                </h3>
                <p className="mb-5 text-sm text-gray-600">{connectError}</p>
                <button
                  onClick={() => setConnectStage(null)}
                  className="w-full rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Got it
                </button>
              </>
            ) : connectStage === "rejected" ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <MessageSquare className="text-red-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  Request declined
                </h3>
                <p className="mb-5 text-sm text-gray-600">
                  {rejectedAsRequester ? (
                    <>
                      Your chat request to <b>@{targetUsername}</b> was declined.
                      You can't send another request.
                    </>
                  ) : (
                    <>
                      You previously declined a request from{" "}
                      <b>@{targetUsername}</b>.
                    </>
                  )}
                </p>
                <button
                  onClick={() => setConnectStage(null)}
                  className="w-full rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Got it
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {connectStage === "accepted"
                    ? "You're connected"
                    : connectStage === "exists"
                      ? "Request already pending"
                      : "Request sent!"}
                </h3>
                <p className="mb-1 text-sm text-gray-600">
                  {connectStage === "accepted" ? (
                    <>
                      You're already connected with <b>@{targetUsername}</b>.
                      Open your messages to start chatting.
                    </>
                  ) : connectStage === "exists" ? (
                    <>
                      You already have a pending request with{" "}
                      <b>@{targetUsername}</b>. Track it from your messages.
                    </>
                  ) : (
                    <>
                      Your chat request to <b>@{targetUsername}</b> has been
                      sent.
                    </>
                  )}
                </p>
                <p className="mb-4 text-xs text-gray-400">
                  Open your messages and wait for the request to be accepted —
                  then you can chat.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConnectStage(null)}
                    className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    Got it
                  </button>
                  <button
                    onClick={openMessages}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    <MessageSquare size={15} />
                    Open messages
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
