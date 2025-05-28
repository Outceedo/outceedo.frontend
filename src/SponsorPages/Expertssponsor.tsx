import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios"; // Import axios

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import profile from "../assets/images/avatar.png";

import {
  faStar,
  faCamera,
  faVideo,
  faUpload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProfile } from "../store/profile-slice";
import { MoveLeft } from "lucide-react";
import Expertreviews from "./expertreviews";
import Mediaview from "@/Pages/Media/MediaView";
import ExpertProfileView from "@/Pages/Expert/Expertview";

const icons = [
  { icon: faLinkedin, color: "#0077B5", link: "https://www.linkedin.com" },
  { icon: faFacebook, color: "#3b5998", link: "https://www.facebook.com" },
  { icon: faInstagram, color: "#E1306C", link: "https://www.instagram.com" },
  { icon: faXTwitter, color: "#1DA1F2", link: "https://www.twitter.com" },
];

interface MediaItem {
  id: number | string;
  type: "photo" | "video";
  url: string;
  src: string;
  title: string;
}

interface Review {
  id: number | string;
  name: string;
  date: string;
  comment: string;
}

interface Service {
  id: number | string;
  serviceId?: string;
  name: string;
  description?: string;
  additionalDetails?: string;
  price: string | number;
  isActive?: boolean;
}

interface Certificate {
  id: string;
  title: string;
  issuedBy?: string;
  issuedDate?: string;
  imageUrl?: string;
  type: string;
  description?: string;
}

interface MediaUploadResponse {
  id: string;
  title: string;
  url: string;
  type: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = "details" | "media" | "reviews" | "services";

const SponserExperts = () => {
  return <ExpertProfileView />;
};

export default SponserExperts;
