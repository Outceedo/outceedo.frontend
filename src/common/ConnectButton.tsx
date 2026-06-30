import React, { useState } from "react";
import axios from "axios";
import { UserPlus, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import Chat from "@/common/chat";
import { meCanChat } from "@/common/chatPermissions";

/**
 * "Connect & Chat" button shown on profile view pages. Sends a chat request to
 * the viewed user and pops a modal explaining how to follow up (via the
 * Messages button in the header — track / withdraw / chat once accepted).
 */

const CHAT_BASE = `${import.meta.env.VITE_PORT}/api/v1/other/chats`;
const chatApi = axios.create({ baseURL: CHAT_BASE });
chatApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

type Result = "sent" | "exists" | "accepted" | "rejected" | "error";

interface Props {
  /** Username of the profile being viewed. */
  username?: string | null;
  /** Role of the profile being viewed — used to enforce chat permissions. */
  targetRole?: string | null;
  className?: string;
  label?: string;
}

const ConnectButton: React.FC<Props> = ({
  username,
  targetRole,
  className,
  label = "Connect & Chat",
}) => {
  const me = localStorage.getItem("username") || "";
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [rejectedAsRequester, setRejectedAsRequester] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  // Hide on your own profile or when the username isn't known yet.
  if (!username || username === me) return null;
  // Hide when chat between the two roles isn't permitted (sponsors/fans never
  // chat; only the allowed role pairs may message each other).
  if (!meCanChat(targetRole)) return null;

  const sendRequest = async () => {
    setLoading(true);
    try {
      const res = await chatApi.post("/request", { home: me, away: username });
      const status = res.data?.chat?.status;
      const created = res.data?.created;
      const isRequester = res.data?.chat?.viewer?.isRequester;
      if (status === "rejected") {
        setRejectedAsRequester(!!isRequester);
        setResult("rejected");
      } else if (status === "accepted") setResult("accepted");
      else if (created) setResult("sent");
      else setResult("exists");
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "Failed to send request");
      setResult("error");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const titles: Record<Result, string> = {
    sent: "Request sent!",
    exists: "Request already pending",
    accepted: "You're connected",
    rejected: "Request declined",
    error: "Something went wrong",
  };

  const bodies: Record<Result, React.ReactNode> = {
    sent: (
      <>
        Your chat request to <b>@{username}</b> has been sent. You'll be able to
        message them once they accept it.
      </>
    ),
    exists: (
      <>
        You already have a pending request with <b>@{username}</b>. You can
        track it or withdraw it from your messages.
      </>
    ),
    accepted: (
      <>
        You're already connected with <b>@{username}</b>. Open your messages to
        start chatting.
      </>
    ),
    rejected: rejectedAsRequester ? (
      <>
        Your chat request to <b>@{username}</b> was declined. You can't send
        another request.
      </>
    ) : (
      <>
        You previously declined a request from <b>@{username}</b>.
      </>
    ),
    error: <>{errorMsg}</>,
  };

  const isNegative = result === "error" || result === "rejected";

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className={
          className ??
          "inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
        }
      >
        <UserPlus size={16} />
        {label}
      </button>

      {/* Confirm send-request modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onClick={() => !loading && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <UserPlus className="text-red-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              Send chat request?
            </h3>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to send a chat request to{" "}
              <b>@{username}</b>? They'll be able to chat with you once they
              accept it.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={sendRequest}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <MessageSquare size={15} />
                )}
                Send request
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setResult(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                isNegative ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {isNegative ? (
                <MessageSquare className="text-red-500" />
              ) : (
                <CheckCircle2 className="text-green-600" />
              )}
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {titles[result]}
            </h3>
            <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">
              {bodies[result]}
            </p>
            {!isNegative && (
              <p className="mb-4 text-xs text-gray-400">
                Open the{" "}
                <span className="font-semibold text-red-500">Messages</span>{" "}
                button in the header to track requests, withdraw, or chat once
                accepted.
              </p>
            )}
            {result === "accepted" ? (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                >
                  Got it
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setChatOpen(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  <MessageSquare size={15} />
                  Open messages
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResult(null)}
                className="mt-2 w-full rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      )}

      <Chat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        initialUsername={username ?? undefined}
      />
    </>
  );
};

export default ConnectButton;
