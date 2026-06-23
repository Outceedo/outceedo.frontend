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
  Users,
  Heart,
  Sparkles,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
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

const BIO_WORD_LIMIT = 100;

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

const SectionTitle: React.FC<{ kicker?: string; children: React.ReactNode }> = ({
  kicker,
  children,
}) => (
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
}> = ({ icon, label, value }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

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
  const cvRef = useRef<HTMLDivElement>(null);

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
  const showFoot = isPlayer || isExpert;

  const displayName = isTeam
    ? profile.teamName || `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
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
    if (isTeam) return profile.teamType ? `Team` : "Team";
    if (isSponsor)
      return profile.sponsorType ? ` Sponsor` : "Sponsor";
    if (isScout) return "Scout";
    if (isExpert) return profile.profession || "Expert";
    if (isPlayer) return profile.position || "Player";
    return profile.profession || "Member";
  })();



  const photoSrc = photoBase64 || profile.photo || "";
  const locationStr = [profile.city, profile.country].filter(Boolean).join(", ");

  const socials = profile.socialLinks || {};
  const socialList = [
    { key: "linkedin", url: socials.linkedin, icon: <Linkedin size={16} /> },
    { key: "twitter", url: socials.twitter, icon: <Twitter size={16} /> },
    { key: "facebook", url: socials.facebook, icon: <Facebook size={16} /> },
    { key: "instagram", url: socials.instagram, icon: <Instagram size={16} /> },
  ].filter((s) => s.url);

  const certificates = (profile.documents || []).filter(
    (d) => d.type === "certificate",
  );
  const awards = (profile.documents || []).filter((d) => d.type === "award");

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
    // Force the bio into its trimmed (300-word) state for the PDF and hide the
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
      saveAs(
        blob,
        `${displayName.replace(/\s+/g, "_") || "outceedo"}_CV.pdf`,
      );
    } catch (e) {
      console.error("Failed to generate PDF", e);
    } finally {
      setCapturing(false);
      setDownloading(false);
    }
  };

  /* ------------------- Role-aware detail rows (sidebar) ------------------- */
  const detailRows = (
    <>
      <DetailRow icon={<Mail size={16} />} label="Email" value={profile.email} />
      <DetailRow
        icon={<Phone size={16} />}
        label="Phone"
        value={profile.mobile_number}
      />
      <DetailRow
        icon={<MapPin size={16} />}
        label="Location"
        value={locationStr}
      />
      <DetailRow
        icon={<Briefcase size={16} />}
        label="Sport"
        value={profile.sport}
      />
      <DetailRow icon={<Users size={16} />} label="Club" value={profile.club} />
      {!isTeam && (
        <>
          <DetailRow
            icon={<UserIcon size={16} />}
            label="Gender"
            value={profile.gender}
          />
          <DetailRow
            icon={<CalendarDays size={16} />}
            label="Age"
            value={profile.age ? `${profile.age} yrs` : undefined}
          />
          <DetailRow
            icon={<Ruler size={16} />}
            label="Height"
            value={profile.height ? `${profile.height} cm` : undefined}
          />
          <DetailRow
            icon={<Weight size={16} />}
            label="Weight"
            value={profile.weight ? `${profile.weight} kg` : undefined}
          />
        </>
      )}
      {isPlayer && (
        <DetailRow
          icon={<Target size={16} />}
          label="Position"
          value={profile.position}
        />
      )}
      {showFoot && (
        <DetailRow
          icon={<Footprints size={16} />}
          label="Preferred Foot"
          value={prettyFoot(profile.foot)}
        />
      )}
      {/* Expert + Scout only */}
      {showExpertScout && (
        <>
          <DetailRow
            icon={<Award size={16} />}
            label="Certification"
            value={profile.certificationLevel?.trim()}
          />
          <DetailRow
            icon={<Clock size={16} />}
            label="Response Time"
            value={profile.responseTime ? `${profile.responseTime} mins` : undefined}
          />
          <DetailRow
            icon={<MapPin size={16} />}
            label="Travel Limit"
            value={profile.travelLimit ? `${profile.travelLimit} km` : undefined}
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

  /* ============================== Render ============================== */
  return (
    <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
      <Navbar />

      {/* Action bar */}
      <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
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
              <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:h-36 sm:w-36">
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

              <div className="flex-1 text-center sm:text-left">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                  {roleLabel}
                </div>
                <h1
                  className="text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-5xl"
                  style={{ color: NAVY }}
                >
                  {displayName}
                </h1>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {profile.club && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700">
                      <Users size={13} className="text-red-500" /> {profile.club}
                    </span>
                  )}
                  {locationStr && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700">
                      <MapPin size={13} className="text-red-500" /> {locationStr}
                    </span>
                  )}
                  {profile.sport && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700">
                      <Briefcase size={13} className="text-red-500" />{" "}
                      {profile.sport}
                    </span>
                  )}
                </div>
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
                      <Chip key={i} icon={<Heart size={13} className="text-red-500" />}>
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      {profile.services.map((service) => {
                        const info = getServiceInfo(service.serviceId);
                        return (
                          <div
                            key={service.id}
                            className="rounded-2xl border border-gray-100 p-5 transition-shadow hover:shadow-lg"
                            style={{ backgroundColor: IVORY }}
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                                style={{ backgroundColor: NAVY }}
                              >
                                {info.icon}
                              </div>
                              <h3 className="text-sm font-black text-gray-900">
                                {info.name}
                              </h3>
                            </div>
                            {service.additionalDetails?.description && (
                              <p className="mb-3 text-xs text-gray-500">
                                {service.additionalDetails.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between border-t border-gray-200/70 pt-3">
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Price
                              </span>
                              <span className="text-xl font-black text-red-500">
                                {profile.currency || "$"}
                                {service.price}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

              {/* Certifications & Awards */}
              {(certificates.length > 0 || awards.length > 0) && (
                <section>
                  <SectionTitle kicker="Credentials">
                    Certifications
                  </SectionTitle>
                  <div className="space-y-3">
                    {[...certificates, ...awards].map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4"
                        style={{ backgroundColor: IVORY }}
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
                          {doc.type === "award" ? (
                            <Award size={18} />
                          ) : (
                            <FileText size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500">
                            {[doc.issuedBy, doc.issuedDate]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {doc.description && (
                            <p className="mt-1 text-xs text-gray-500">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
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
    </div>
  );
}
