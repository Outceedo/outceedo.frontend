import { Helmet } from "react-helmet-async";

/**
 * Site-wide SEO constants. Base URL is sourced from VITE_HOME (the public
 * marketing domain) and falls back to the production host.
 */
const SITE_NAME = "Outceedo";
const BASE_URL = (
  import.meta.env.VITE_HOME || "https://outceedo.com"
).replace(/\/$/, "");
const DEFAULT_IMAGE = `${BASE_URL}/og-default.png`;
const DEFAULT_DESCRIPTION =
  "Outceedo is the sports platform connecting players, experts, teams, sponsors, scouts and fans. Get assessed, get discovered, outdo your sport to succeed.";

interface SeoProps {
  /** Page title; rendered as "{title} · Outceedo" unless it already contains the brand. */
  title: string;
  description?: string;
  /** Path beginning with "/"; combined with the base URL for canonical + og:url. */
  canonicalPath?: string;
  /** Absolute image URL for social cards. */
  image?: string;
  /** When true, emits robots noindex,nofollow (private/auth/error pages). */
  noindex?: boolean;
  type?: "website" | "profile" | "article";
  /** JSON-LD structured data (single object or array). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const buildTitle = (title: string) =>
  title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image = DEFAULT_IMAGE,
  noindex = false,
  type = "website",
  jsonLd,
}: SeoProps) {
  const fullTitle = buildTitle(title);
  const url = canonicalPath
    ? `${BASE_URL}${canonicalPath.startsWith("/") ? "" : "/"}${canonicalPath}`
    : undefined;
  const ldArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}
      <meta
        name="robots"
        content={noindex ? "noindex,nofollow" : "index,follow"}
      />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}
