interface ViewCvButtonProps {
  /** The username whose public CV should open. */
  username?: string | null;
  /** Role segment used to build the shareable CV url (/role/username). */
  role: "player" | "expert" | "scout" | "team" | "sponsor";
  /** Button label. Defaults to "View your CV". */
  label?: string;
  className?: string;
}

/**
 * Opens a member's public CV (/role/username) in a new tab.
 * Rendered as an anchor so it natively opens in a new tab.
 */
export default function ViewCvButton({
  username,
  role,
  label = "View your CV",
  className = "",
}: ViewCvButtonProps) {
  if (!username) return null;
  const href = `/${role}/${username}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 ${className}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 3h6v6" />
        <path d="m10 14 11-11" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
      {label}
    </a>
  );
}
