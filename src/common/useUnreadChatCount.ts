import { useCallback, useEffect, useState } from "react";
import axios from "axios";

/**
 * Polls the chat service and reports how many items need the user's attention:
 *  - incoming pending requests (someone wants to chat), plus
 *  - unread messages in accepted conversations (sent by the other party after
 *    the viewer's last-seen timestamp).
 *
 * Used to render the red badge on the "Messages" button in the headers.
 * No sockets — refresh-based, like the chat drawer itself.
 */

const CHAT_BASE = `${import.meta.env.VITE_PORT}/api/v1/other/chats`;

const chatApi = axios.create({ baseURL: CHAT_BASE });
chatApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

interface ChatMessage {
  sender: string;
  timestamp: string;
}

interface ChatViewer {
  username: string;
  party: "home" | "away" | null;
  canRespond: boolean;
}

interface Chat {
  status: "pending" | "accepted" | "rejected";
  msgs: ChatMessage[];
  lastSeenByHome?: string | null;
  lastSeenByAway?: string | null;
  viewer: ChatViewer;
}

const unreadInChat = (c: Chat): number => {
  if (c.status !== "accepted") return 0;
  const myLastSeen =
    c.viewer.party === "home" ? c.lastSeenByHome : c.lastSeenByAway;
  const seenMs = myLastSeen ? new Date(myLastSeen).getTime() : 0;
  return c.msgs.filter(
    (m) =>
      m.sender !== c.viewer.username &&
      new Date(m.timestamp).getTime() > seenMs
  ).length;
};

const POLL_MS = 30000;

export function useUnreadChatCount() {
  const me = localStorage.getItem("username") || "";
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!me) return;
    try {
      const res = await chatApi.get("/", { params: { username: me } });
      const chats: Chat[] = res.data?.chats || [];
      const requests = chats.filter(
        (c) => c.status === "pending" && c.viewer.canRespond
      ).length;
      const unread = chats.reduce((sum, c) => sum + unreadInChat(c), 0);
      setCount(requests + unread);
    } catch {
      /* leave the previous count on transient failures */
    }
  }, [me]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return { count, refresh };
}

export default useUnreadChatCount;
