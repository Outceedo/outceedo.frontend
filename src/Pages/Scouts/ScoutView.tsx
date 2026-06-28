import React, { useEffect, useState } from "react";
import axios from "axios";
import ViewCvButton from "@/components/ViewCvButton";
import ConnectButton from "@/common/ConnectButton";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faStar as faStarSolid,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { MoveLeft } from "lucide-react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import profile from "../../assets/images/avatar.png";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfile } from "../../store/profile-slice";
import Mediaview from "@/Pages/Media/MediaView";
import Reviewview from "../Reviews/Reviewview";
import ExpertProfiledetails from "../Expert/ExpertProfiledetails";

interface ScoutService {
  id: string;
  scoutId: string;
  title: string;
  description: string | null;
  price: number;
  requiresScheduling: boolean;
  timezone: string | null;
}

const socialIconsConfig = [
  { key: "linkedin", icon: faLinkedin, color: "#0077B5" },
  { key: "facebook", icon: faFacebook, color: "#3b5998" },
  { key: "instagram", icon: faInstagram, color: "#E1306C" },
  { key: "twitter", icon: faXTwitter, color: "#1DA1F2" },
  { key: "youtube", icon: faYoutube, color: "#FF0000" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Zurich",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Jerusalem",
  "Asia/Riyadh",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Kuala_Lumpur",
  "Asia/Jakarta",
  "Asia/Manila",
  "Asia/Karachi",
  "Asia/Kathmandu",
  "Asia/Colombo",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "Pacific/Auckland",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Africa/Nairobi",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Pacific/Fiji",
  "Pacific/Guam",
];

type TabType = "details" | "services" | "media" | "reviews";

const StarRating: React.FC<{ avg: number; total?: number }> = ({
  avg,
  total = 5,
}) => {
  const fullStars = Math.floor(avg);
  const hasHalfStar = avg - fullStars >= 0.25 && avg - fullStars < 0.75;
  const emptyStars = total - fullStars - (hasHalfStar ? 1 : 0);
  return (
    <span>
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStarSolid}
          className="text-yellow-400 text-xl"
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon
          icon={faStarHalfAlt}
          className="text-yellow-400 text-xl"
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={farStar}
          className="text-xl text-yellow-400"
        />
      ))}
    </span>
  );
};

const ScoutView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [services, setServices] = useState<ScoutService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // booking modal state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState<ScoutService | null>(
    null,
  );
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStart, setBookingStart] = useState("");
  const [bookingEnd, setBookingEnd] = useState("");
  const [bookingDescription, setBookingDescription] = useState("");
  const [bookingTz, setBookingTz] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { viewedProfile, status, error } = useAppSelector(
    (state) => state.profile,
  );

  const API_BASE = `${import.meta.env.VITE_PORT}/api/v1`;

  const authHeaders = (extra: Record<string, string> = {}) => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    ...extra,
  });

  useEffect(() => {
    const scoutUsername = localStorage.getItem("viewscoutusername");
    if (scoutUsername) {
      dispatch(getProfile(scoutUsername));
    } else {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (status === "succeeded" || status === "failed") {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const loadServices = async () => {
      if (!viewedProfile?.id) return;
      setServicesLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/user/scout-services/scout/${viewedProfile.id}`,
          { headers: authHeaders() },
        );
        setServices(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load scout services:", err);
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, [viewedProfile?.id]);

  const scoutData = viewedProfile
    ? {
        id: viewedProfile.id,
        username: viewedProfile.username,
        name:
          `${viewedProfile.firstName || ""} ${
            viewedProfile.lastName || ""
          }`.trim() || viewedProfile.username,
        profession: viewedProfile.profession || "Scout",
        location:
          viewedProfile.city && viewedProfile.country
            ? `${viewedProfile.city}, ${viewedProfile.country}`
            : viewedProfile.city || viewedProfile.country || "Not specified",
        responseTime: viewedProfile.responseTime || "N/A",
        travelLimit: viewedProfile.travelLimit || "N/A",
        certificationLevel: viewedProfile.certificationLevel || "N/A",
        specialization: viewedProfile.specialization || "Not specified",
        nationality: viewedProfile.nationality || "Not specified",
        profileImage: viewedProfile.photo || null,
        socialLinks: viewedProfile.socialLinks || {},
        about: viewedProfile.bio || "",
        skills: viewedProfile.skills || [],
        certificates:
          viewedProfile.documents
            ?.filter((d: any) => d.type === "certificate")
            .map((c: any) => ({
              id: c.id,
              title: c.title,
              issuedBy: c.issuedBy,
              issuedDate: c.issuedDate,
              imageUrl: c.imageUrl,
              type: c.type,
              description: c.description || "",
            })) || [],
        awards:
          viewedProfile.documents
            ?.filter((d: any) => d.type === "award")
            .map((a: any) => ({
              id: a.id,
              title: a.title,
              issuedBy: a.issuedBy,
              issuedDate: a.issuedDate,
              imageUrl: a.imageUrl,
              type: a.type,
              description: a.description || "",
            })) || [],
        reviewsReceived: viewedProfile.reviewsReceived,
        language: viewedProfile.language,
        club: viewedProfile.club,
      }
    : null;

  const reviewsArray = viewedProfile?.reviewsReceived || [];
  const totalReviews = reviewsArray.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : reviewsArray.reduce((s: number, r: any) => s + (r.rating || 0), 0) /
        totalReviews;

  const openBooking = (service: ScoutService) => {
    const role = localStorage.getItem("role");
    if (role !== "player" && role !== "team") {
      Swal.fire({
        icon: "info",
        title: "Only players and teams can book scouts",
      });
      return;
    }
    setBookingService(service);
    setBookingDate("");
    setBookingStart("");
    setBookingEnd("");
    setBookingDescription("");
    setBookingOpen(true);
  };

  const submitBooking = async () => {
    if (!bookingService || !viewedProfile?.id) return;
    const needsSchedule = bookingService.requiresScheduling;
    if (needsSchedule && (!bookingDate || !bookingStart || !bookingEnd)) {
      Swal.fire({ icon: "error", title: "Pick a date and time" });
      return;
    }
    const playerId = localStorage.getItem("userId");
    if (!playerId) {
      Swal.fire({ icon: "error", title: "Please log in first" });
      return;
    }
    setBookingSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        playerId,
        scoutId: viewedProfile.id,
        serviceId: bookingService.id,
        description: bookingDescription || undefined,
      };
      if (needsSchedule) {
        payload.date = bookingDate;
        payload.startTime = bookingStart;
        payload.endTime = bookingEnd;
        payload.timezone = bookingTz;
        // The scout's timezone is fixed by the service; it is sent only as a
        // fallback — the server uses the service's configured timezone.
        payload.expertTimeZone = bookingService.timezone || undefined;
      }
      await axios.post(`${API_BASE}/booking/scout`, payload, {
        headers: authHeaders({ "Content-Type": "application/json" }),
      });
      Swal.fire({
        icon: "success",
        title: "Booking requested",
        text: "The scout will review and confirm your booking.",
        timer: 2500,
        showConfirmButton: false,
      });
      setBookingOpen(false);
      const role = localStorage.getItem("role");
      navigate(role === "team" ? "/team/bookings" : "/player/mybooking");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Booking failed",
        text:
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message,
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  if (status === "failed" || !scoutData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-900 dark:text-white">
        <h2 className="text-2xl font-semibold mb-4">
          Failed to load scout profile
        </h2>
        <p className="mb-6">{error || "Scout not found"}</p>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl sm:text-3xl font-bold cursor-pointer"
        >
          <MoveLeft />
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div className="flex-1 md:pr-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-5 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold dark:text-white mb-2 sm:mb-0">
              {scoutData.name}
            </h1>
            <div className="ml-0 sm:ml-10 flex gap-3 sm:gap-4 mt-2 sm:mt-0">
              {socialIconsConfig.map((item, index) => {
                const link =
                  (scoutData.socialLinks as Record<string, string>)?.[
                    item.key
                  ] || "";
                const hasLink = link && link.trim() !== "";
                if (hasLink) {
                  return (
                    <a
                      key={index}
                      href={
                        link.startsWith("http")
                          ? link
                          : `https://${link.replace(/^\/+/, "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white text-lg sm:text-xl shadow-lg"
                      style={{
                        background:
                          item.icon === faInstagram
                            ? "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)"
                            : item.color,
                      }}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                    </a>
                  );
                }
                return (
                  <div
                    key={index}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-gray-400 text-lg sm:text-xl bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                    title="Not provided"
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                );
              })}
            </div>
            <ViewCvButton
              role="scout"
              username={scoutData.username}
              label="View CV"
              className="mt-2 sm:mt-0 sm:ml-auto"
            />
          </div>

          <div className="mb-4 sm:mb-6">
            <ConnectButton username={scoutData.username} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-4 sm:mb-6">
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Profession
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {scoutData.profession}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Club
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {scoutData.club || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Languages
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {(scoutData.language?.length || 0) > 0
                  ? (scoutData.language as string[]).slice(0, 3).join(", ")
                  : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Location
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {scoutData.location}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Certification Level
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {scoutData.certificationLevel}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Response Time
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {scoutData.responseTime} mins
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Specialization
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {scoutData.specialization}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-white text-xs sm:text-sm">
                Nationality
              </p>
              <p className="font-semibold dark:text-white text-sm sm:text-base">
                {scoutData.nationality}
              </p>
            </div>
          </div>
        </div>

        <div className="w-32 h-32 sm:w-1/3 sm:h-auto md:w-1/3 lg:w-1/4 rounded-lg overflow-hidden mx-auto md:mx-auto flex md:justify-center">
          <img
            src={scoutData.profileImage || profile}
            alt={scoutData.name}
            className="w-full h-full aspect-square object-cover rounded-lg shadow-md"
          />
        </div>
      </div>

      <div className="border-t border-b py-4 sm:py-6 mb-6 sm:mb-8">
        <div className="flex flex-wrap justify-around items-center gap-4">
          <div className="flex items-center gap-2">
            <StarRating avg={avgRating} />
            <span className="text-gray-500 text-sm">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-500"> ({avgRating.toFixed(1)}/5)</span>
          </div>
          <div className="text-center">
            <p className="text-red-500 text-2xl sm:text-3xl font-bold">
              {services.length}
            </p>
            <p className="text-gray-500 text-xs sm:text-base">
              Services Offered
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 sm:mb-8 border-b">
        <div className="flex space-x-4 sm:space-x-6 overflow-x-auto">
          {(["details", "services", "media", "reviews"] as TabType[]).map(
            (tab) => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setActiveTab(tab)}
                className={`pb-2 rounded-none text-sm sm:text-base capitalize transition-none whitespace-nowrap ${
                  activeTab === tab
                    ? "text-red-500 border-b-2 border-red-500 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </Button>
            ),
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        {activeTab === "details" && (
          <ExpertProfiledetails expertData={scoutData as any} />
        )}
        {activeTab === "services" && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Services Offered
            </h2>
            {servicesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-red-600 rounded-full" />
              </div>
            ) : services.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                This scout hasn't listed any services yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {service.title}
                        </h3>
                        <span className="font-bold mt-2 sm:mt-0 text-red-600">
                          £{service.price}
                        </span>
                      </div>
                      <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        {service.description || "No description provided"}
                      </p>
                      <Button
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => openBooking(service)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "media" && <Mediaview Data={viewedProfile} />}
        {activeTab === "reviews" && (
          <div className="flex flex-col items-center">
            <Reviewview Data={scoutData as any} />
          </div>
        )}
      </div>

      {/* Booking modal */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Book scout service</DialogTitle>
            <DialogDescription>
              {bookingService?.title} — £{bookingService?.price}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {bookingService?.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {bookingService.description}
              </p>
            )}

            {bookingService?.requiresScheduling && (
              <>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Start time</label>
                    <Input
                      type="time"
                      value={bookingStart}
                      onChange={(e) => setBookingStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End time</label>
                    <Input
                      type="time"
                      value={bookingEnd}
                      onChange={(e) => setBookingEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Your timezone</label>
                    <Select value={bookingTz} onValueChange={setBookingTz}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Scout timezone
                    </label>
                    <div className="flex h-9 items-center rounded-md border bg-gray-50 dark:bg-gray-700 px-3 text-sm text-gray-700 dark:text-gray-200">
                      {bookingService?.timezone || "Not specified"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Set by the scout — you can't change this.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between rounded-md border bg-gray-50 dark:bg-gray-700 px-3 py-2">
              <span className="text-sm font-medium">Price</span>
              <span className="text-lg font-bold text-red-600">
                £{bookingService?.price ?? 0}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              This is the fixed price set by the scout — you pay exactly this
              amount.
            </p>

            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={bookingDescription}
                onChange={(e) => setBookingDescription(e.target.value)}
                placeholder="Anything the scout should know about this booking"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookingOpen(false)}
              disabled={bookingSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={submitBooking}
              disabled={bookingSubmitting}
            >
              {bookingSubmitting ? "Submitting…" : "Request booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScoutView;
