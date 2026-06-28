import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchSubscriptionStatus } from "@/store/plans-slice";
import {
  X,
  Search,
  Send,
  RefreshCw,
  ArrowLeft,
  Check,
  Ban,
  Loader2,
  MessageSquarePlus,
  ShieldOff,
  Tag,
  CalendarClock,
  Crown,
} from "lucide-react";

/* --------------------------------- Theme --------------------------------- */
// Matches the publicProfile palette: ivory surface, navy text, red accent.
const IVORY = "#FAF7EF";
const NAVY = "#0E1B33";

/* --------------------------------- Types --------------------------------- */
interface ChatMessage {
  sender: string;
  receiver: string;
  msg: string;
  timestamp: string;
  service?: unknown;
}

interface ChatViewer {
  username: string;
  party: "home" | "away" | null;
  isRequester: boolean;
  canRespond: boolean;
  canChat: boolean;
  pending: boolean;
  rejected: boolean;
  blockedByMe: boolean;
  blockedByOther: boolean;
}

interface Chat {
  chatId: string;
  home: string;
  away: string;
  homeAccept: boolean;
  awayAccept: boolean;
  status: "pending" | "accepted" | "rejected";
  msgs: ChatMessage[];
  lastSeenByHome?: string | null;
  lastSeenByAway?: string | null;
  createdAt: string;
  updatedAt: string;
  viewer: ChatViewer;
}

interface SearchProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  photo?: string | null;
  role?: string;
  city?: string;
  country?: string;
}

// A booking shared between the two chat users, taggable via "@".
interface BookingTag {
  id: string;
  serviceName: string;
  date: string;
  status?: string;
  providerType?: string;
  price?: number;
}

// Message limits for free (non-premium) users.
const FREE_MSG_LIMIT = 5;
const FREE_MSG_LIMIT_WITH_BOOKING = 15;

// Block sharing of contact details / links inside chat messages.
const CONTACT_PATTERNS = {
  email: /[^\s@]+@[^\s@]+\.[^\s@]{2,}/,
  url: /(https?:\/\/|www\.)\S+|\b[a-z0-9][a-z0-9-]*\.(com|net|org|io|in|co|uk|us|info|biz|app|dev|me|gg|tv|xyz)\b/i,
  phone: /(?:\+?\d[\s.-]?){7,}/,
};
const violatesContactRule = (text: string) =>
  CONTACT_PATTERNS.email.test(text) ||
  CONTACT_PATTERNS.url.test(text) ||
  CONTACT_PATTERNS.phone.test(text);

interface ChatProps {
  open: boolean;
  onClose: () => void;
  /** Optionally open straight into a conversation with this username. */
  initialUsername?: string;
  /** Optional service reference attached to the first message (service query). */
  initialService?: unknown;
}

/* ------------------------------- API setup ------------------------------- */
const CHAT_BASE = `${import.meta.env.VITE_PORT}/api/v1/other/chats`;
const USER_BASE = `${import.meta.env.VITE_PORT}/api/v1/user`;
const BOOKING_BASE = `${import.meta.env.VITE_PORT}/api/v1/booking`;

const chatApi = axios.create({ baseURL: CHAT_BASE });
const userApi = axios.create({ baseURL: USER_BASE });
const bookingApi = axios.create({ baseURL: BOOKING_BASE });
chatApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});
userApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});
bookingApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

/* ------------------------------ Helpers ---------------------------------- */
const otherParty = (chat: Chat) =>
  chat.viewer.party === "home" ? chat.away : chat.home;

// The OTHER party's last-seen timestamp (shown under their name in the header).
const otherLastSeen = (chat: Chat) =>
  chat.viewer.party === "home" ? chat.lastSeenByAway : chat.lastSeenByHome;

// Number of messages from the other party that the viewer hasn't seen yet.
const unreadCountFor = (chat: Chat): number => {
  if (chat.status !== "accepted") return 0;
  const mine =
    chat.viewer.party === "home" ? chat.lastSeenByHome : chat.lastSeenByAway;
  const seenMs = mine ? new Date(mine).getTime() : 0;
  return chat.msgs.filter(
    (m) =>
      m.sender !== chat.viewer.username &&
      new Date(m.timestamp).getTime() > seenMs
  ).length;
};

const initialsOf = (name: string) =>
  (name || "?").slice(0, 2).toUpperCase();

const fmtTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Avatar: React.FC<{ name: string; photo?: string | null; size?: number }> = ({
  name,
  photo,
  size = 40,
}) => (
  <div
    className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-100 text-xs font-bold text-red-600"
    style={{ width: size, height: size }}
  >
    {photo ? (
      <img src={photo} alt={name} className="h-full w-full object-cover" />
    ) : (
      initialsOf(name)
    )}
  </div>
);

/* =============================== Component ================================ */
const Chat: React.FC<ChatProps> = ({
  open,
  onClose,
  initialUsername,
  initialService,
}) => {
  const me = localStorage.getItem("username") || "";
  const dispatch = useDispatch<AppDispatch>();
  const isPremium = useSelector(
    (state: RootState) => state.subscription.isActive
  );

  const [tab, setTab] = useState<"chats" | "requests">("chats");
  const [conversations, setConversations] = useState<Chat[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  // Resolved avatars/names for conversation partners (keyed by username).
  const [profileMap, setProfileMap] = useState<Record<string, SearchProfile>>(
    {}
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProfile[]>([]);
  const [searching, setSearching] = useState(false);
  // Person we're about to send a chat request to (confirmation modal).
  const [confirmTarget, setConfirmTarget] = useState<SearchProfile | null>(null);
  // Confirmation for accept / reject / withdraw of a request.
  const [confirmAction, setConfirmAction] = useState<{
    kind: "accept" | "reject" | "withdraw";
    chatId: string;
    name: string;
  } | null>(null);
  // Warning shown above the composer when a message breaks the contact rule.
  const [msgWarning, setMsgWarning] = useState<string | null>(null);

  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  // Bookings shared with the active chat partner + the one currently tagged.
  const [bookings, setBookings] = useState<BookingTag[]>([]);
  const [taggedBooking, setTaggedBooking] = useState<BookingTag | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ----------------------------- Data loaders ---------------------------- */
  const fetchConversations = useCallback(async () => {
    if (!me) return;
    setLoadingList(true);
    try {
      const res = await chatApi.get("/", { params: { username: me } });
      setConversations(res.data?.chats || []);
    } catch {
      setError("Failed to load conversations");
    } finally {
      setLoadingList(false);
    }
  }, [me]);

  const openChat = useCallback(
    async (chatId: string) => {
      setError(null);
      setBusy(true);
      try {
        const res = await chatApi.get(`/${chatId}`, {
          params: { username: me },
        });
        setActiveChat(res.data?.chat || null);
      } catch {
        setError("Failed to open conversation");
      } finally {
        setBusy(false);
      }
    },
    [me]
  );

  const refreshActive = useCallback(() => {
    if (activeChat) openChat(activeChat.chatId);
    else fetchConversations();
  }, [activeChat, openChat, fetchConversations]);

  /* ------------------------------- Actions ------------------------------- */
  const startChat = async (username: string, service?: unknown) => {
    if (!me || username === me) return;
    setError(null);
    setBusy(true);
    try {
      const res = await chatApi.post("/request", {
        home: me,
        away: username,
        service,
      });
      const chat: Chat = res.data?.chat;
      setSearchTerm("");
      setSearchResults([]);
      await fetchConversations();
      if (chat) setActiveChat(chat);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to start chat");
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async () => {
    if (!activeChat || !messageInput.trim()) return;
    // Don't allow sharing phone numbers, emails or links — except for experts
    // and sponsors (or when the other party is one), who are unrestricted.
    if (!limitExempt && violatesContactRule(messageInput)) {
      setMsgWarning(
        "For your safety, sharing phone numbers, emails or links isn't allowed in chat."
      );
      setMessageInput("");
      setTaggedBooking(null);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await chatApi.post(`/${activeChat.chatId}/messages`, {
        sender: me,
        msg: messageInput.trim(),
        ...(taggedBooking ? { service: taggedBooking } : {}),
      });
      setActiveChat(res.data?.chat || activeChat);
      setMessageInput("");
      setTaggedBooking(null);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const withdrawRequest = async (chatId: string) => {
    setBusy(true);
    setError(null);
    try {
      await chatApi.post(`/${chatId}/withdraw`, { username: me });
      setActiveChat(null);
      await fetchConversations();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to withdraw request");
    } finally {
      setBusy(false);
    }
  };

  const respond = async (chatId: string, action: "accept" | "reject") => {
    setBusy(true);
    setError(null);
    try {
      const res = await chatApi.post(`/${chatId}/${action}`, { username: me });
      setActiveChat(res.data?.chat || null);
      await fetchConversations();
    } catch (e: any) {
      setError(e.response?.data?.message || `Failed to ${action}`);
    } finally {
      setBusy(false);
    }
  };

  // Run the action the user just confirmed (accept / reject / withdraw).
  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    const { kind, chatId } = confirmAction;
    setConfirmAction(null);
    if (kind === "withdraw") await withdrawRequest(chatId);
    else await respond(chatId, kind);
  };

  const toggleBlock = async (chatId: string, block: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const res = await chatApi.post(
        `/${chatId}/${block ? "block" : "unblock"}`,
        { username: me }
      );
      setActiveChat(res.data?.chat || null);
      await fetchConversations();
    } catch (e: any) {
      setError(e.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------- Effects ------------------------------- */
  // Load conversations + refresh premium status whenever the drawer opens.
  useEffect(() => {
    if (open) {
      fetchConversations();
      dispatch(fetchSubscriptionStatus());
    }
  }, [open, fetchConversations, dispatch]);

  // Resolve avatars/names for any conversation partners we don't have yet.
  useEffect(() => {
    const names = Array.from(
      new Set(conversations.map(otherParty).filter(Boolean))
    ).filter((n) => !profileMap[n]);
    if (!names.length) return;
    userApi
      .get("/profiles/by-usernames", {
        params: { usernames: names.join(",") },
      })
      .then((res) => {
        const next: Record<string, SearchProfile> = {};
        (res.data?.users || []).forEach((u: SearchProfile) => {
          next[u.username] = u;
        });
        setProfileMap((prev) => ({ ...prev, ...next }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  // Open directly into a conversation if requested (e.g. service query).
  useEffect(() => {
    if (open && initialUsername) {
      startChat(initialUsername, initialService);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialUsername]);

  // Debounced username search.
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await userApi.get("/profiles/chat-search", {
          params: { q: term, limit: 10 },
        });
        setSearchResults(res.data?.users || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Auto-scroll messages to bottom.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.msgs?.length, activeChat?.chatId]);

  // When entering a conversation, load any bookings shared with that partner
  // (for the "@" tag picker) and reset the previously tagged booking.
  useEffect(() => {
    setTaggedBooking(null);
    setBookings([]);
    if (!activeChat || !me) return;
    const partner = otherParty(activeChat);
    bookingApi
      .get("/by-usernames", { params: { userA: me, userB: partner } })
      .then((res) => setBookings(res.data?.bookings || []))
      .catch(() => setBookings([]));
  }, [activeChat?.chatId, me]);

  /* ----------------------------- Derived lists --------------------------- */
  const acceptedChats = conversations.filter(
    (c) => c.status === "accepted"
  );
  const pendingChats = conversations.filter((c) => c.status === "pending");
  const rejectedChats = conversations.filter((c) => c.status === "rejected");
  const incomingRequests = pendingChats.filter((c) => c.viewer.canRespond);
  // Requests tab shows pending (incoming + outgoing) plus rejected ones so the
  // sender is informed their request was declined.
  const requestChats = [...pendingChats, ...rejectedChats];

  /* ----------------------- Message limit (free users) -------------------- */
  // Experts and sponsors (on either side of the chat) are never rate-limited.
  const EXEMPT_ROLES = ["expert", "sponsor"];
  const myRole = (localStorage.getItem("role") || "").toLowerCase();
  const partnerRole = activeChat
    ? (profileMap[otherParty(activeChat)]?.role || "").toLowerCase()
    : "";
  const limitExempt =
    EXEMPT_ROLES.includes(myRole) || EXEMPT_ROLES.includes(partnerRole);

  const hasBooking = bookings.length > 0;
  const msgLimit =
    isPremium || limitExempt
      ? Infinity
      : hasBooking
      ? FREE_MSG_LIMIT_WITH_BOOKING
      : FREE_MSG_LIMIT;
  const sentByMe = activeChat
    ? activeChat.msgs.filter((m) => m.sender === me).length
    : 0;
  const limitReached = !isPremium && !limitExempt && sentByMe >= msgLimit;

  /* ------------------------------- Render -------------------------------- */
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slider panel */}
      <aside
        style={{ backgroundColor: IVORY }}
        className={`fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col shadow-2xl transition-transform duration-300 dark:bg-gray-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
          <div className="flex min-w-0 items-center gap-2">
            {activeChat && (
              <button
                onClick={() => setActiveChat(null)}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            {activeChat ? (
              <>
                <Avatar
                  name={otherParty(activeChat)}
                  photo={profileMap[otherParty(activeChat)]?.photo}
                  size={38}
                />
                <div className="min-w-0">
                  <h2
                    style={{ color: NAVY }}
                    className="truncate text-base font-bold dark:text-white"
                  >
                    {otherParty(activeChat)}
                  </h2>
                  {otherLastSeen(activeChat) && (
                    <p className="truncate text-[11px] text-gray-600">
                      last seen {fmtTime(otherLastSeen(activeChat) ?? undefined)}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <h2
                style={{ color: NAVY }}
                className="text-lg font-bold dark:text-white"
              >
                Messages
              </h2>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            {activeChat &&
              (activeChat.viewer.blockedByMe ? (
                <button
                  onClick={() => toggleBlock(activeChat.chatId, false)}
                  disabled={busy}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
                  aria-label="Unblock user"
                  title="Unblock user"
                >
                  <ShieldOff size={18} />
                </button>
              ) : !activeChat.viewer.pending &&
                !activeChat.viewer.rejected &&
                !activeChat.viewer.blockedByOther ? (
                <button
                  onClick={() => toggleBlock(activeChat.chatId, true)}
                  disabled={busy}
                  className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-gray-800"
                  aria-label="Block user"
                  title="Block user"
                >
                  <Ban size={18} />
                </button>
              ) : null)}
            <button
              onClick={refreshActive}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
        )}

        {/* ------------------------- Conversation view ------------------------ */}
        {activeChat ? (
          <ConversationView
            chat={activeChat}
            me={me}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSend={sendMessage}
            sending={sending}
            busy={busy}
            onRespond={(chatId, action) =>
              setConfirmAction({
                kind: action,
                chatId,
                name: otherParty(activeChat),
              })
            }
            onToggleBlock={toggleBlock}
            messagesEndRef={messagesEndRef}
            bookings={bookings}
            taggedBooking={taggedBooking}
            setTaggedBooking={setTaggedBooking}
            isPremium={isPremium}
            limitExempt={limitExempt}
            sentByMe={sentByMe}
            msgLimit={msgLimit}
            limitReached={limitReached}
            msgWarning={msgWarning}
            setMsgWarning={setMsgWarning}
            onWithdraw={(chatId) =>
              setConfirmAction({
                kind: "withdraw",
                chatId,
                name: otherParty(activeChat),
              })
            }
          />
        ) : (
          /* ---------------------------- List view --------------------------- */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search */}
            <div className="border-b p-3 dark:border-gray-700">
              <div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                <Search size={16} className="text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search people by username or name"
                  className="w-full bg-transparent text-sm outline-none dark:text-white"
                />
                {searching && (
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                )}
              </div>

              {/* Instruction */}
              <p className="mt-1.5 px-1 text-[12px] leading-snug text-gray-600">
                Search for a person and send a chat request. You can start
                chatting once they accept it.
              </p>

              {/* Search results */}
              {searchTerm.trim() && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border dark:border-gray-700">
                  {searchResults.length === 0 && !searching ? (
                    <p className="p-3 text-center text-sm text-gray-400">
                      No people found
                    </p>
                  ) : (
                    searchResults.map((p) => (
                      <div
                        key={p.id}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left"
                      >
                        <Avatar name={p.username} photo={p.photo} size={36} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {`${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                              p.username}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            @{p.username}
                            {p.role ? ` · ${p.role}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => setConfirmTarget(p)}
                          disabled={busy || p.username === me}
                          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          <MessageSquarePlus size={14} />
                          Send request
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700">
              {(["chats", "requests"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                    tab === t
                      ? "border-b-2 border-red-500 text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "requests"
                    ? `Requests${
                        incomingRequests.length
                          ? ` (${incomingRequests.length})`
                          : ""
                      }`
                    : "Chats"}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loadingList ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-red-500" />
                </div>
              ) : tab === "chats" ? (
                acceptedChats.length === 0 ? (
                  <EmptyState text="No conversations yet. Search someone to start chatting." />
                ) : (
                  acceptedChats.map((c) => (
                    <ChatListItem
                      key={c.chatId}
                      chat={c}
                      onClick={() => openChat(c.chatId)}
                      photo={profileMap[otherParty(c)]?.photo}
                      unread={unreadCountFor(c)}
                    />
                  ))
                )
              ) : requestChats.length === 0 ? (
                <EmptyState text="No pending requests." />
              ) : (
                requestChats.map((c) => (
                  <ChatListItem
                    key={c.chatId}
                    chat={c}
                    onClick={() => openChat(c.chatId)}
                    photo={profileMap[otherParty(c)]?.photo}
                    badge={
                      c.status === "rejected"
                        ? c.viewer.isRequester
                          ? "Declined"
                          : "You declined"
                        : c.viewer.canRespond
                          ? "Wants to chat"
                          : "Request sent"
                    }
                    onWithdraw={
                      c.status === "pending" &&
                      c.viewer.isRequester &&
                      !c.viewer.canRespond
                        ? () =>
                            setConfirmAction({
                              kind: "withdraw",
                              chatId: c.chatId,
                              name: otherParty(c),
                            })
                        : undefined
                    }
                    busy={busy}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Confirm send-request modal */}
        {confirmTarget && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-800">
              <div className="mb-3 flex items-center gap-3">
                <Avatar
                  name={confirmTarget.username}
                  photo={confirmTarget.photo}
                  size={40}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                    {`${confirmTarget.firstName || ""} ${
                      confirmTarget.lastName || ""
                    }`.trim() || confirmTarget.username}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    @{confirmTarget.username}
                  </p>
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Send a chat request to{" "}
                <span className="font-semibold">@{confirmTarget.username}</span>?
                They'll be able to chat with you once they accept.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmTarget(null)}
                  disabled={busy}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const username = confirmTarget.username;
                    setConfirmTarget(null);
                    startChat(username);
                  }}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  <MessageSquarePlus size={14} />
                  Send request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm accept / reject / withdraw modal */}
        {confirmAction && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-800">
              <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                {confirmAction.kind === "accept"
                  ? "Accept request?"
                  : confirmAction.kind === "reject"
                    ? "Reject request?"
                    : "Withdraw request?"}
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                {confirmAction.kind === "accept" ? (
                  <>
                    Accept the chat request from{" "}
                    <span className="font-semibold">
                      @{confirmAction.name}
                    </span>
                    ? You'll be able to message each other.
                  </>
                ) : confirmAction.kind === "reject" ? (
                  <>
                    Reject the chat request from{" "}
                    <span className="font-semibold">
                      @{confirmAction.name}
                    </span>
                    ? They won't be able to message you.
                  </>
                ) : (
                  <>
                    Withdraw your chat request to{" "}
                    <span className="font-semibold">
                      @{confirmAction.name}
                    </span>
                    ?
                  </>
                )}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={busy}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={runConfirmedAction}
                  disabled={busy}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 ${
                    confirmAction.kind === "accept"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {confirmAction.kind === "accept"
                    ? "Accept"
                    : confirmAction.kind === "reject"
                      ? "Reject"
                      : "Withdraw"}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

/* ----------------------------- Sub-components ----------------------------- */
const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <p className="px-6 py-10 text-center text-sm text-gray-400">{text}</p>
);

const ChatListItem: React.FC<{
  chat: Chat;
  onClick: () => void;
  badge?: string;
  photo?: string | null;
  unread?: number;
  onWithdraw?: () => void;
  busy?: boolean;
}> = ({ chat, onClick, badge, photo, unread = 0, onWithdraw, busy }) => {
  const name = otherParty(chat);
  const last = chat.msgs[chat.msgs.length - 1];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="flex w-full cursor-pointer items-center gap-3 border-b px-4 py-3 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
    >
      <Avatar name={name} photo={photo} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate ${
              unread > 0
                ? "font-bold text-gray-900"
                : "font-semibold text-gray-900"
            } dark:text-white`}
          >
            {name}
          </p>
          {last && (
            <span className="flex-shrink-0 text-[10px] text-gray-400">
              {fmtTime(last.timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={`truncate text-xs ${
              unread > 0 ? "font-semibold text-gray-700" : "text-gray-500"
            }`}
          >
            {badge ? (
              <span className="font-medium text-red-500">{badge}</span>
            ) : last ? (
              `${last.sender === chat.viewer.username ? "You: " : ""}${last.msg}`
            ) : (
              "No messages yet"
            )}
          </p>
          {unread > 0 && (
            <span className="flex h-[18px] min-w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
      {onWithdraw && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWithdraw();
          }}
          disabled={busy}
          className="flex-shrink-0 rounded-lg border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-600 hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
        >
          Withdraw
        </button>
      )}
    </div>
  );
};

const ConversationView: React.FC<{
  chat: Chat;
  me: string;
  messageInput: string;
  setMessageInput: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  busy: boolean;
  onRespond: (chatId: string, action: "accept" | "reject") => void;
  onToggleBlock: (chatId: string, block: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  bookings: BookingTag[];
  taggedBooking: BookingTag | null;
  setTaggedBooking: (b: BookingTag | null) => void;
  isPremium: boolean;
  limitExempt: boolean;
  sentByMe: number;
  msgLimit: number;
  limitReached: boolean;
  msgWarning: string | null;
  setMsgWarning: (v: string | null) => void;
  onWithdraw: (chatId: string) => void;
}> = ({
  chat,
  me,
  messageInput,
  setMessageInput,
  onSend,
  sending,
  busy,
  onRespond,
  onToggleBlock,
  messagesEndRef,
  bookings,
  taggedBooking,
  setTaggedBooking,
  isPremium,
  limitExempt,
  sentByMe,
  msgLimit,
  limitReached,
  msgWarning,
  setMsgWarning,
  onWithdraw,
}) => {
  const v = chat.viewer;

  // Booking tag picker: opens via the tag button (shows all) or by typing "@".
  const [menuOpen, setMenuOpen] = useState(false);
  const atMatch = /@(\w*)$/.exec(messageInput);
  const showBookingMenu = (!!atMatch || menuOpen) && bookings.length > 0;
  const bookingQuery = (atMatch?.[1] || "").toLowerCase();
  const filteredBookings = bookings.filter((b) =>
    b.serviceName.toLowerCase().includes(bookingQuery)
  );

  const pickBooking = (b: BookingTag) => {
    setTaggedBooking(b);
    setMessageInput(messageInput.replace(/@(\w*)$/, ""));
    setMenuOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Fixed message-limit banner (free users only; experts/sponsors exempt) */}
      {!isPremium && !limitExempt && (
        <div
          className={`flex flex-shrink-0 items-center justify-center gap-1.5 border-b px-4 py-1.5 text-xs font-semibold ${
            limitReached
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-700"
          } dark:border-gray-700`}
        >
          <Crown size={13} />
          {limitReached
            ? `Message limit reached (${msgLimit}). Upgrade for unlimited.`
            : `Free plan · ${sentByMe}/${msgLimit} messages used`}
        </div>
      )}

      {/* Messages */}
      <div
        style={{ backgroundColor: IVORY }}
        className="flex-1 space-y-2 overflow-y-auto p-4 dark:bg-gray-950"
      >
        {chat.msgs.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            No messages yet.
          </p>
        ) : (
          chat.msgs.map((m, i) => {
            const mine = m.sender === me;
            return (
              <div
                key={i}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-[14px] font-medium ${
                    mine
                      ? "rounded-br-sm bg-red-500 text-white"
                      : "rounded-bl-sm bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  {m.service != null && (
                    <span
                      className={`mb-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        mine
                          ? "bg-red-400/40 text-white"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <Tag size={10} />
                      {typeof m.service === "object" && m.service !== null
                        ? `${
                            (m.service as BookingTag).serviceName || "Service"
                          }${
                            (m.service as BookingTag).date
                              ? ` · ${fmtTime((m.service as BookingTag).date)}`
                              : ""
                          }`
                        : "Service query"}
                    </span>
                  )}
                  <p className="whitespace-pre-line break-words">{m.msg}</p>
                  <span
                    className={`mt-1 block text-[10px] ${
                      mine ? "text-red-100" : "text-gray-600"
                    }`}
                  >
                    {fmtTime(m.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Status / footer */}
      {v.rejected ? (
        <div className="border-t bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">
          {v.isRequester
            ? "Your chat request was rejected."
            : "You rejected this chat request."}
        </div>
      ) : v.canRespond ? (
        <div className="flex items-center gap-2 border-t p-3 dark:border-gray-700">
          <button
            disabled={busy}
            onClick={() => onRespond(chat.chatId, "accept")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            <Check size={16} /> Accept
          </button>
          <button
            disabled={busy}
            onClick={() => onRespond(chat.chatId, "reject")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-200 py-2.5 font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-60"
          >
            <X size={16} /> Reject
          </button>
        </div>
      ) : v.pending ? (
        <div className="flex flex-col items-center gap-2 border-t bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">
          <span>Request sent. Waiting for {otherParty(chat)} to accept.</span>
          {v.isRequester && (
            <button
              disabled={busy}
              onClick={() => onWithdraw(chat.chatId)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300"
            >
              Withdraw request
            </button>
          )}
        </div>
      ) : v.blockedByMe ? (
        <div className="flex items-center justify-between gap-2 border-t bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
          <span className="text-sm text-gray-500">You blocked this user.</span>
          <button
            disabled={busy}
            onClick={() => onToggleBlock(chat.chatId, false)}
            className="flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-60"
          >
            <ShieldOff size={15} /> Unblock
          </button>
        </div>
      ) : v.blockedByOther ? (
        <div className="border-t bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">
          You can no longer message this user.
        </div>
      ) : limitReached ? (
        <div className="border-t bg-red-50 p-4 text-center text-sm font-medium text-red-600 dark:border-gray-700">
          You've reached your {msgLimit}-message limit on the free plan.
          Upgrade to premium to keep chatting.
        </div>
      ) : (
        /* Open conversation -> composer */
        <div className="relative border-t p-3 dark:border-gray-700">
          {/* Contact-rule warning (shown above the writing area) */}
          {msgWarning && (
            <div className="mb-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              <Ban size={14} className="mt-0.5 flex-shrink-0" />
              <span>{msgWarning}</span>
            </div>
          )}
          {/* "@" booking tag drop-up */}
          {showBookingMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-1 max-h-56 overflow-y-auto rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <p className="border-b px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:border-gray-700">
                Tag a booking
              </p>
              {filteredBookings.length === 0 ? (
                <p className="px-3 py-3 text-center text-xs text-gray-400">
                  No matching bookings
                </p>
              ) : (
                filteredBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => pickBooking(b)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-gray-700"
                  >
                    <Tag size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">
                        {b.serviceName}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-gray-400">
                        <CalendarClock size={11} />
                        {fmtTime(b.date)}
                        {b.status ? ` · ${b.status}` : ""}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Selected booking tag chip (above the writing area) */}
          {taggedBooking && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800">
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-red-600">
                <Tag size={12} className="flex-shrink-0" />
                <span className="truncate">
                  {taggedBooking.serviceName} · {fmtTime(taggedBooking.date)}
                </span>
              </span>
              <button
                onClick={() => setTaggedBooking(null)}
                className="flex-shrink-0 rounded-full p-0.5 text-red-400 hover:bg-red-100 hover:text-red-600"
                aria-label="Remove tag"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            {bookings.length > 0 && (
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border transition-colors dark:border-gray-700 ${
                  showBookingMenu
                    ? "border-red-400 bg-red-50 text-red-600"
                    : "text-red-500 hover:bg-red-50"
                }`}
                aria-label="Tag a service"
                title="Tag a service"
              >
                <Tag size={18} />
              </button>
            )}
            <textarea
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                if (msgWarning) setMsgWarning(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !showBookingMenu) {
                  e.preventDefault();
                  onSend();
                }
              }}
              rows={1}
              placeholder="Type a message…"
              className="max-h-28 flex-1 resize-none rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={onSend}
              disabled={sending || !messageInput.trim()}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              aria-label="Send"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          {bookings.length > 0 && (
            <p className="mt-1 px-1 text-[11px] text-gray-400">
              Use <span className="font-semibold text-red-500">@</span> if
              tagging any service
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
