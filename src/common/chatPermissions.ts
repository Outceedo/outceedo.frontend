/**
 * Role-based chat permissions for Outceedo.
 *
 * Who can message whom (symmetric):
 *   - Player  ↔ Expert, Scout, Team
 *   - Expert  ↔ Player, Team
 *   - Scout   ↔ Player, Team
 *   - Team    ↔ Player, Expert, Scout
 *   - Sponsor : cannot message anyone, and cannot be messaged.
 *   - Fan     : cannot message anyone, and cannot be messaged. (role = "user")
 *
 * Roles used across the app: player | expert | sponsor | scout | team | user(fan).
 */

export type ChatRole =
  | "player"
  | "expert"
  | "scout"
  | "team"
  | "sponsor"
  | "user";

// Allowed recipients keyed by the sender's role.
const CHAT_MATRIX: Record<string, string[]> = {
  player: ["expert", "scout", "team"],
  expert: ["player", "team"],
  scout: ["player", "team"],
  team: ["player", "expert", "scout"],
  sponsor: [],
  user: [],
};

// Roles that have no chat functionality at all (cannot message or be messaged).
export const NO_CHAT_ROLES = ["sponsor", "user", "fan"];

/** Normalise a role string ("fan" → "user", trims/lowercases). */
export const normaliseRole = (role?: string | null): string => {
  const r = (role || "").trim().toLowerCase();
  return r === "fan" ? "user" : r;
};

/** True when `viewerRole` is allowed to start/continue a chat with `targetRole`. */
export function canChat(
  viewerRole?: string | null,
  targetRole?: string | null
): boolean {
  const v = normaliseRole(viewerRole);
  const t = normaliseRole(targetRole);
  if (!v || !t) return false;
  if (NO_CHAT_ROLES.includes(v) || NO_CHAT_ROLES.includes(t)) return false;
  return (CHAT_MATRIX[v] || []).includes(t);
}

/** Convenience: can the currently logged-in user chat with `targetRole`? */
export function meCanChat(targetRole?: string | null): boolean {
  return canChat(localStorage.getItem("role"), targetRole);
}

export default canChat;
