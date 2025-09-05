import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID,
  NetworkQuality,
  ConnectionState,
  ConnectionDisconnectedReason,
} from "agora-rtc-sdk-ng";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhone,
  faExpand,
  faCompress,
  faVolumeUp,
  faVolumeDown,
  faUsers,
  faComments,
  faPaperPlane,
  faTimes,
  faExclamationTriangle,
  faRefresh,
  faWifi,
  faCheckCircle,
  faGraduationCap,
  faChalkboardTeacher,
  faClock,
  faSignal,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

interface Booking {
  id: string;
  player: {
    username: string;
    photo: string;
  };
  expert: {
    username: string;
    photo: string;
  };
  service: {
    service: {
      name: string;
    };
  };
  startTime: string;
  endTime: string;
  date: string;
  startAt: string;
  endAt: string;
}

interface Agora {
  channel: string;
  token: string;
  uid: number;
}

interface AgoraVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  agora?: Agora;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
  type?: "system" | "user";
}

interface RemoteUser {
  uid: UID;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
  hasVideo: boolean;
  hasAudio: boolean;
  username?: string;
  photo?: string;
}

interface NetworkStats {
  quality: NetworkQuality;
  rtt: number;
  uplinkLoss: number;
  downlinkLoss: number;
  timestamp: number;
}

interface VideoQuality {
  width: number;
  height: number;
  frameRate: number;
  bitrateMin: number;
  bitrateMax: number;
}

const VIDEO_PROFILES: Record<string, VideoQuality> = {
  "720p": {
    width: 1280,
    height: 720,
    frameRate: 30,
    bitrateMin: 1000,
    bitrateMax: 2000,
  },
  "480p": {
    width: 640,
    height: 480,
    frameRate: 30,
    bitrateMin: 500,
    bitrateMax: 1000,
  },
  "360p": {
    width: 480,
    height: 360,
    frameRate: 24,
    bitrateMin: 200,
    bitrateMax: 500,
  },
};

const useAgoraConnection = (agora?: Agora) => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const isInitializingRef = useRef(false);
  const myUIDRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const createAgoraClient = useCallback(() => {
    try {
      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });
      return client;
    } catch (error) {
      console.error("Failed to create Agora client:", error);
      throw error;
    }
  }, []);

  const startStatsMonitoring = useCallback((client: IAgoraRTCClient) => {
    if (statsIntervalRef.current) return;

    statsIntervalRef.current = setInterval(async () => {
      try {
        const stats = await client.getRTCStats();
        setNetworkStats({
          quality: 1,
          rtt: stats.RTT || 0,
          uplinkLoss: stats.OutgoingAvailableBandwidth || 0,
          downlinkLoss: stats.RecvBitrate || 0,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.warn("Failed to get RTC stats:", error);
      }
    }, 5000);
  }, []);

  const stopStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  const handleAutoReconnect = useCallback(async () => {
    if (!agora || reconnectAttempts >= 3) {
      setConnectionError(
        "Maximum reconnection attempts reached. Please refresh the page."
      );
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
    setConnectionError(
      `Connection lost. Reconnecting in ${Math.ceil(delay / 1000)}s...`
    );

    reconnectTimeoutRef.current = setTimeout(async () => {
      setReconnectAttempts((prev) => prev + 1);
      setIsConnecting(true);

      try {
        if (client) {
          await client.leave();
        }

        const newClient = createAgoraClient();
        await newClient.join(
          import.meta.env.VITE_AGORA_APP_ID,
          agora.channel,
          agora.token,
          agora.uid
        );

        setClient(newClient);
        setIsJoined(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        startStatsMonitoring(newClient);
      } catch (error: any) {
        console.error("Reconnection failed:", error);
        handleAutoReconnect();
      } finally {
        setIsConnecting(false);
      }
    }, delay);
  }, [
    agora,
    reconnectAttempts,
    client,
    createAgoraClient,
    startStatsMonitoring,
  ]);

  const cleanup = useCallback(async () => {
    isInitializingRef.current = false;
    setIsConnecting(false);
    setIsJoined(false);
    setConnectionError(null);
    setReconnectAttempts(0);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopStatsMonitoring();

    if (client) {
      try {
        await client.leave();
      } catch (error) {
        console.warn("Error leaving client:", error);
      }
      setClient(null);
    }

    myUIDRef.current = null;
  }, [client, stopStatsMonitoring]);

  return {
    client,
    setClient,
    isJoined,
    setIsJoined,
    isConnecting,
    setIsConnecting,
    connectionError,
    setConnectionError,
    networkStats,
    myUIDRef,
    isInitializingRef,
    createAgoraClient,
    startStatsMonitoring,
    handleAutoReconnect,
    cleanup,
  };
};

const useLocalTracks = () => {
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [currentVideoQuality, setCurrentVideoQuality] =
    useState<string>("720p");
  const [hasPermissions, setHasPermissions] = useState(false);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermissions(true);
      return true;
    } catch (error) {
      console.error("Permission denied:", error);
      setHasPermissions(false);
      return false;
    }
  }, []);

  const createLocalTracks = useCallback(async () => {
    const tracks: (ICameraVideoTrack | IMicrophoneAudioTrack)[] = [];

    try {
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      tracks.push(audioTrack);
      setLocalAudioTrack(audioTrack);
    } catch (error) {
      console.error("Failed to create audio track:", error);
    }

    try {
      const profile = VIDEO_PROFILES[currentVideoQuality];
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: profile.width,
          height: profile.height,
          frameRate: profile.frameRate,
          bitrateMin: profile.bitrateMin,
          bitrateMax: profile.bitrateMax,
        },
      });
      tracks.push(videoTrack);
      setLocalVideoTrack(videoTrack);
    } catch (error) {
      console.error("Failed to create video track:", error);
    }

    return tracks;
  }, [currentVideoQuality]);

  const toggleAudio = useCallback(async () => {
    if (!localAudioTrack) return isAudioMuted;

    try {
      await localAudioTrack.setEnabled(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
      return !isAudioMuted;
    } catch (error) {
      console.error("Failed to toggle audio:", error);
      return isAudioMuted;
    }
  }, [localAudioTrack, isAudioMuted]);

  const toggleVideo = useCallback(async () => {
    if (!localVideoTrack) return isVideoMuted;

    try {
      await localVideoTrack.setEnabled(isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
      return !isVideoMuted;
    } catch (error) {
      console.error("Failed to toggle video:", error);
      return isVideoMuted;
    }
  }, [localVideoTrack, isVideoMuted]);

  const changeVideoQuality = useCallback(
    async (quality: string) => {
      if (!localVideoTrack || !VIDEO_PROFILES[quality]) return;

      try {
        const profile = VIDEO_PROFILES[quality];
        await localVideoTrack.setEncoderConfiguration({
          width: profile.width,
          height: profile.height,
          frameRate: profile.frameRate,
          bitrateMin: profile.bitrateMin,
          bitrateMax: profile.bitrateMax,
        });
        setCurrentVideoQuality(quality);
      } catch (error) {
        console.error("Failed to change video quality:", error);
      }
    },
    [localVideoTrack]
  );

  const cleanup = useCallback(async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }

    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
      setLocalVideoTrack(null);
    }

    setIsAudioMuted(false);
    setIsVideoMuted(false);
  }, [localAudioTrack, localVideoTrack]);

  return {
    localVideoTrack,
    localAudioTrack,
    isAudioMuted,
    isVideoMuted,
    currentVideoQuality,
    hasPermissions,
    requestPermissions,
    createLocalTracks,
    toggleAudio,
    toggleVideo,
    changeVideoQuality,
    cleanup,
  };
};

const useRemoteUsers = () => {
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [volume, setVolume] = useState(50);
  const remoteVideoRefs = useRef<{ [uid: string]: HTMLDivElement | null }>({});

  const addRemoteUser = useCallback(
    (
      uid: UID,
      mediaType: "video" | "audio",
      track: IRemoteVideoTrack | IRemoteAudioTrack
    ) => {
      setRemoteUsers((prev) => {
        const existingIndex = prev.findIndex((user) => user.uid === uid);

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            [mediaType === "video" ? "videoTrack" : "audioTrack"]: track,
            [mediaType === "video" ? "hasVideo" : "hasAudio"]: true,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              uid,
              videoTrack:
                mediaType === "video"
                  ? (track as IRemoteVideoTrack)
                  : undefined,
              audioTrack:
                mediaType === "audio"
                  ? (track as IRemoteAudioTrack)
                  : undefined,
              hasVideo: mediaType === "video",
              hasAudio: mediaType === "audio",
            },
          ];
        }
      });

      if (mediaType === "audio") {
        const audioTrack = track as IRemoteAudioTrack;
        audioTrack.play();
        audioTrack.setVolume(volume);
      }
    },
    [volume]
  );

  const removeRemoteUser = useCallback(
    (uid: UID, mediaType?: "video" | "audio") => {
      setRemoteUsers((prev) => {
        if (mediaType) {
          return prev.map((user) =>
            user.uid === uid
              ? {
                  ...user,
                  [mediaType === "video" ? "videoTrack" : "audioTrack"]:
                    undefined,
                  [mediaType === "video" ? "hasVideo" : "hasAudio"]: false,
                }
              : user
          );
        } else {
          return prev.filter((user) => user.uid !== uid);
        }
      });
    },
    []
  );

  const playRemoteVideo = useCallback(
    (uid: UID, videoTrack: IRemoteVideoTrack) => {
      const container = remoteVideoRefs.current[uid.toString()];
      if (container && videoTrack) {
        setTimeout(() => {
          try {
            videoTrack.play(container);
          } catch (error) {
            console.error("Failed to play remote video:", error);
          }
        }, 100);
      }
    },
    []
  );

  const updateVolume = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      remoteUsers.forEach((user) => {
        if (user.audioTrack) {
          user.audioTrack.setVolume(newVolume);
        }
      });
    },
    [remoteUsers]
  );

  const cleanup = useCallback(() => {
    remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        try {
          user.audioTrack.stop();
        } catch (error) {
          console.warn("Error stopping remote audio:", error);
        }
      }
      if (user.videoTrack) {
        try {
          user.videoTrack.stop();
        } catch (error) {
          console.warn("Error stopping remote video:", error);
        }
      }
    });

    setRemoteUsers([]);
    remoteVideoRefs.current = {};
  }, [remoteUsers]);

  return {
    remoteUsers,
    volume,
    remoteVideoRefs,
    addRemoteUser,
    removeRemoteUser,
    playRemoteVideo,
    updateVolume,
    cleanup,
  };
};

const useChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMessageSending, setIsMessageSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addChatMessage = useCallback(
    (
      sender: string,
      message: string,
      isOwn: boolean,
      type: "system" | "user" = "user"
    ) => {
      const newMsg: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        sender,
        message,
        timestamp: new Date(),
        isOwn,
        type,
      };
      setChatMessages((prev) => [...prev, newMsg]);
    },
    []
  );

  const sendMessage = useCallback(
    async (client: IAgoraRTCClient | null, senderName: string) => {
      if (!newMessage.trim() || !client || isMessageSending) return false;

      const messageToSend = newMessage.trim();
      setIsMessageSending(true);

      try {
        const messageData = {
          type: "chat",
          sender: senderName,
          message: messageToSend,
          timestamp: Date.now(),
        };

        const encoder = new TextEncoder();
        const messageBuffer = encoder.encode(JSON.stringify(messageData));

        await client.sendStreamMessage(messageBuffer);
        addChatMessage("You", messageToSend, true);
        setNewMessage("");
        return true;
      } catch (error) {
        console.error("Failed to send message:", error);
        addChatMessage("You", messageToSend, true);
        setNewMessage("");
        return true;
      } finally {
        setIsMessageSending(false);
      }
    },
    [newMessage, isMessageSending, addChatMessage]
  );

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return {
    chatMessages,
    newMessage,
    setNewMessage,
    isMessageSending,
    chatEndRef,
    addChatMessage,
    sendMessage,
  };
};

const PlayerAgoraVideoModal: React.FC<AgoraVideoModalProps> = ({
  isOpen,
  onClose,
  booking,
  agora,
}) => {
  const agoraConnection = useAgoraConnection(agora);
  const localTracks = useLocalTracks();
  const remoteUsers = useRemoteUsers();
  const chat = useChat();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [networkStatus, setNetworkStatus] = useState<
    "online" | "offline" | "poor"
  >("online");
  const [localVideoContainer, setLocalVideoContainer] = useState<
    "waiting" | "grid" | null
  >(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const waitingLocalVideoRef = useRef<HTMLDivElement>(null);
  const callStartTime = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const initializeAgora = useCallback(async () => {
    if (!agora || agoraConnection.isInitializingRef.current) {
      return;
    }

    console.log("Initializing Agora with:", {
      appId: import.meta.env.VITE_AGORA_APP_ID,
      channel: agora.channel,
      token: agora.token ? "present" : "missing",
      uid: agora.uid,
    });

    agoraConnection.isInitializingRef.current = true;
    agoraConnection.setIsConnecting(true);
    agoraConnection.setConnectionError(null);

    try {
      if (!import.meta.env.VITE_AGORA_APP_ID) {
        throw new Error("Agora App ID is not configured");
      }

      const hasPermission = await localTracks.requestPermissions();
      if (!hasPermission) {
        throw new Error("Camera and microphone permissions are required");
      }

      const agoraClient = agoraConnection.createAgoraClient();
      setupAgoraEventHandlers(agoraClient);

      let joinSuccess = false;
      let currentUID = agora.uid;

      for (let attempt = 0; attempt < 3 && !joinSuccess; attempt++) {
        try {
          console.log(`Join attempt ${attempt + 1} with UID:`, currentUID);

          const uid = await agoraClient.join(
            import.meta.env.VITE_AGORA_APP_ID,
            agora.channel,
            agora.token || null,
            currentUID
          );

          console.log("Successfully joined with UID:", uid);
          agoraConnection.myUIDRef.current = uid as number;
          joinSuccess = true;
        } catch (joinError: any) {
          console.error(`Join attempt ${attempt + 1} failed:`, joinError);

          if (
            joinError.code === "INVALID_TOKEN" ||
            joinError.code === "TOKEN_EXPIRED"
          ) {
            agoraConnection.setConnectionError(
              "Session token is invalid or expired. Please refresh the page."
            );
            return;
          } else if (joinError.code === "UID_CONFLICT") {
            currentUID = Math.floor(Math.random() * 1000000);
            console.log("UID conflict, trying with new UID:", currentUID);
          } else if (attempt === 2) {
            throw joinError;
          }
        }
      }

      const tracks = await localTracks.createLocalTracks();
      if (tracks.length > 0) {
        console.log(
          "Publishing tracks:",
          tracks.map((t) => t.trackMediaType)
        );
        await agoraClient.publish(tracks);
      }

      agoraConnection.setClient(agoraClient);
      agoraConnection.setIsJoined(true);
      agoraConnection.setIsConnecting(false);
      agoraConnection.startStatsMonitoring(agoraClient);

      console.log("Agora initialization completed successfully");
    } catch (error: any) {
      console.error("Failed to initialize Agora:", error);
      agoraConnection.setConnectionError(
        error.message || "Failed to connect. Please try again."
      );
      agoraConnection.setIsConnecting(false);
    } finally {
      agoraConnection.isInitializingRef.current = false;
    }
  }, [agora, agoraConnection, localTracks]);

  const setupAgoraEventHandlers = useCallback(
    (client: IAgoraRTCClient) => {
      client.on("user-published", async (user, mediaType) => {
        if (user.uid === agoraConnection.myUIDRef.current) return;

        try {
          await client.subscribe(user, mediaType);

          if (mediaType === "video" && user.videoTrack) {
            try {
              await client.setRemoteVideoStreamType(user.uid, 1);
            } catch (streamError) {
              console.warn("Failed to set low stream:", streamError);
            }
            remoteUsers.playRemoteVideo(user.uid, user.videoTrack);
          }

          remoteUsers.addRemoteUser(
            user.uid,
            mediaType,
            user[`${mediaType}Track`]!
          );
        } catch (error) {
          console.error("Error subscribing to user:", error);
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (user.uid === agoraConnection.myUIDRef.current) return;
        remoteUsers.removeRemoteUser(user.uid, mediaType);
      });

      client.on("user-joined", (user) => {
        if (user.uid !== agoraConnection.myUIDRef.current) {
          console.log("User joined:", user.uid);
        }
      });

      client.on("user-left", (user) => {
        if (user.uid !== agoraConnection.myUIDRef.current) {
          remoteUsers.removeRemoteUser(user.uid);
          console.log("User left:", user.uid);
        }
      });

      client.on(
        "connection-state-change",
        (
          curState: ConnectionState,
          revState: ConnectionState,
          reason?: ConnectionDisconnectedReason
        ) => {
          console.log("Connection state change:", {
            curState,
            revState,
            reason,
          });

          if (curState === "CONNECTED") {
            agoraConnection.setConnectionError(null);
            setNetworkStatus("online");
          } else if (curState === "DISCONNECTED") {
            if (reason === "NETWORK_ERROR") {
              setNetworkStatus("poor");
              agoraConnection.handleAutoReconnect();
            }
          }
        }
      );

      client.on("network-quality", (stats) => {
        const quality = Math.max(
          stats.downlinkNetworkQuality,
          stats.uplinkNetworkQuality
        );

        if (quality >= 4) {
          setNetworkStatus("poor");
          if (quality >= 5 && localTracks.currentVideoQuality !== "360p") {
            localTracks.changeVideoQuality("360p");
          }
        } else {
          setNetworkStatus("online");
        }
      });

      client.on("stream-message", (uid, stream) => {
        try {
          const decoder = new TextDecoder();
          const messageString = decoder.decode(stream);
          const messageData = JSON.parse(messageString);

          if (
            messageData.type === "chat" &&
            uid !== agoraConnection.myUIDRef.current
          ) {
            chat.addChatMessage(messageData.sender, messageData.message, false);
          }
        } catch (error) {
          console.error("Error parsing chat message:", error);
        }
      });

      client.on("exception", (evt) => {
        console.warn("Agora exception:", evt);
        if (evt.code === "NETWORK_ERROR") {
          setNetworkStatus("poor");
        }
      });
    },
    [agoraConnection, remoteUsers, chat, localTracks]
  );

  useEffect(() => {
    if (!localTracks.localVideoTrack || localTracks.isVideoMuted) return;

    const shouldShowInWaiting = remoteUsers.remoteUsers.length === 0;
    const targetContainer = shouldShowInWaiting
      ? waitingLocalVideoRef.current
      : localVideoRef.current;
    const expectedContainer = shouldShowInWaiting ? "waiting" : "grid";

    if (targetContainer && localVideoContainer !== expectedContainer) {
      try {
        const playVideo = () => {
          if (targetContainer && localTracks.localVideoTrack) {
            localTracks.localVideoTrack.play(targetContainer);
            setLocalVideoContainer(expectedContainer);
          }
        };

        setTimeout(playVideo, 100);
      } catch (error) {
        console.error("Failed to play local video:", error);
      }
    }
  }, [
    localTracks.localVideoTrack,
    localTracks.isVideoMuted,
    remoteUsers.remoteUsers.length,
    localVideoContainer,
  ]);

  useEffect(() => {
    if (agoraConnection.isJoined && !durationInterval.current) {
      callStartTime.current = Date.now();
      durationInterval.current = setInterval(() => {
        setCallDuration(
          Math.floor((Date.now() - callStartTime.current) / 1000)
        );
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    };
  }, [agoraConnection.isJoined]);

  useEffect(() => {
    if (isOpen && agora && !agoraConnection.isInitializingRef.current) {
      initializeAgora();
    }

    return () => {
      if (!isOpen) {
        cleanup();
      }
    };
  }, [isOpen, agora, initializeAgora]);

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus("online");
      if (agoraConnection.connectionError?.includes("offline")) {
        agoraConnection.setConnectionError(null);
        if (agora && !agoraConnection.isJoined) {
          setTimeout(() => initializeAgora(), 1000);
        }
      }
    };

    const handleOffline = () => {
      setNetworkStatus("offline");
      agoraConnection.setConnectionError(
        "You are offline. Please check your internet connection."
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [agora, agoraConnection, initializeAgora]);

  const cleanup = useCallback(async () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    await Promise.all([
      agoraConnection.cleanup(),
      localTracks.cleanup(),
      remoteUsers.cleanup(),
    ]);

    setLocalVideoContainer(null);
    setCallDuration(0);
  }, [agoraConnection, localTracks, remoteUsers]);

  const getUsername = useCallback(
    (uid: UID): string => {
      if (uid === agoraConnection.myUIDRef.current) {
        return "You";
      }
      return booking.expert.username || "Expert";
    },
    [agoraConnection.myUIDRef, booking]
  );

  const getAllParticipants = useMemo(() => {
    const participants = [];

    participants.push({
      uid: agoraConnection.myUIDRef.current || 0,
      isLocal: true,
      username: "You",
      hasVideo: !localTracks.isVideoMuted && !!localTracks.localVideoTrack,
      hasAudio: !localTracks.isAudioMuted && !!localTracks.localAudioTrack,
      videoTrack: localTracks.localVideoTrack ?? undefined,
      audioTrack: localTracks.localAudioTrack ?? undefined,
      photo: booking.player.photo,
    });

    remoteUsers.remoteUsers.forEach((user) => {
      participants.push({
        uid: user.uid,
        isLocal: false,
        username: getUsername(user.uid),
        hasVideo: user.hasVideo,
        hasAudio: user.hasAudio,
        videoTrack: user.videoTrack,
        audioTrack: user.audioTrack,
        photo: booking.expert.photo,
      });
    });

    return participants;
  }, [
    agoraConnection.myUIDRef,
    localTracks,
    remoteUsers.remoteUsers,
    booking,
    getUsername,
  ]);

  const getGridCols = (participantCount: number) => {
    if (participantCount === 1) return "grid-cols-1";
    if (participantCount === 2) return "grid-cols-2";
    if (participantCount <= 4) return "grid-cols-2";
    return "grid-cols-3";
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleToggleAudio = async () => {
    await localTracks.toggleAudio();
  };

  const handleToggleVideo = async () => {
    await localTracks.toggleVideo();
  };

  const handleSendMessage = () => {
    chat.sendMessage(agoraConnection.client, booking.player.username);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const retryConnection = () => {
    cleanup();
    setTimeout(() => {
      if (agora) {
        initializeAgora();
      }
    }, 1000);
  };

  const handleEndCall = () => {
    setTimeout(() => {
      cleanup();
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className={`${
          isFullscreen
            ? "w-screen h-screen"
            : "w-[95vw] h-[90vh] max-w-7xl rounded-2xl shadow-2xl"
        } bg-white overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={booking.expert.photo}
                alt={booking.expert.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 shadow-sm"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  remoteUsers.remoteUsers.length > 0
                    ? "bg-green-400"
                    : "bg-gray-400"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg flex items-center">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="mr-2 text-blue-600"
                />
                Learning Session: {booking.service.service.name}
              </h3>
              <p className="text-sm text-blue-600 font-medium flex items-center">
                <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-1" />
                with Expert {booking.expert.username}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1 text-xs ${
                networkStatus === "offline"
                  ? "text-red-500"
                  : networkStatus === "poor"
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              <FontAwesomeIcon
                icon={
                  networkStatus === "offline"
                    ? faSignal
                    : networkStatus === "poor"
                    ? faExclamationTriangle
                    : faWifi
                }
              />
              <span className="capitalize font-medium">{networkStatus}</span>
            </div>

            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium flex items-center space-x-1">
              {agoraConnection.isConnecting && (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              )}
              <span>
                {agoraConnection.isConnecting
                  ? "Connecting..."
                  : agoraConnection.isJoined
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>

            {agoraConnection.isJoined && (
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-xl transition-colors shadow-sm border text-sm ${
                  showChat
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-blue-600 hover:bg-blue-50 border-blue-100"
                }`}
              >
                <FontAwesomeIcon icon={faComments} />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-sm border border-blue-100 text-sm"
              >
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white text-gray-500 hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 text-sm"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        </div>

        {agoraConnection.connectionError && (
          <div className="p-3 bg-red-50 border-b border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span className="font-medium">
                  {agoraConnection.connectionError}
                </span>
              </div>
              <button
                onClick={retryConnection}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors flex items-center space-x-1"
              >
                <FontAwesomeIcon icon={faRefresh} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 flex bg-gray-50 overflow-hidden">
          <div
            className={`${
              showChat ? "flex-1" : "w-full"
            } flex flex-col relative`}
          >
            <div className="flex-1 relative bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
              {remoteUsers.remoteUsers.length === 0 ? (
                <div className="w-full h-full flex gap-24 items-center justify-center">
                  {localTracks.localVideoTrack && !localTracks.isVideoMuted ? (
                    <div className="w-80 h-60 bg-black rounded-xl overflow-hidden shadow-lg mb-6 relative">
                      <div
                        ref={waitingLocalVideoRef}
                        className="w-full h-full"
                      />
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
                        <FontAwesomeIcon
                          icon={faGraduationCap}
                          className="text-blue-400"
                        />
                        <span className="font-medium">You (Student)</span>
                        {(!localTracks.localAudioTrack ||
                          localTracks.isAudioMuted) && (
                          <FontAwesomeIcon
                            icon={faMicrophoneSlash}
                            className="text-red-400"
                          />
                        )}
                      </div>
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Preview
                      </div>
                      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-xs">
                        Quality: {localTracks.currentVideoQuality}
                      </div>
                    </div>
                  ) : (
                    <div className="w-80 h-60 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                      <div className="text-center">
                        <img
                          src={booking.player.photo}
                          alt={booking.player.username}
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-white shadow-lg"
                        />
                        <p className="text-sm text-gray-700 font-medium">
                          {!localTracks.localVideoTrack
                            ? "Camera Access Denied"
                            : "Camera Off"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon
                        icon={faChalkboardTeacher}
                        className="text-3xl text-blue-500"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Waiting for {booking.expert.username}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Your expert will join the learning session shortly...
                    </p>

                    <div className="bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 max-w-md mx-auto shadow-lg">
                      <div className="text-xs text-gray-600 space-y-2">
                        <p className="flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faGraduationCap}
                            className="mr-2 text-blue-500"
                          />
                          <span className="font-medium">Session:</span>
                          <span className="ml-1">
                            {booking.service.service.name}
                          </span>
                        </p>
                        <p className="flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="mr-2 text-green-500"
                          />
                          <span className="font-medium">Time:</span>
                          <span className="ml-1">
                            {new Date(booking.startAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" - "}
                            {new Date(booking.endAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                        <p className="flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faChalkboardTeacher}
                            className="mr-2 text-purple-500"
                          />
                          <span className="font-medium">Expert:</span>
                          <span className="ml-1">
                            {booking.expert.username}
                          </span>
                        </p>
                        {agoraConnection.isJoined && (
                          <p className="text-blue-600 mt-3 flex items-center justify-center font-medium">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="mr-1"
                            />
                            Connected and ready to learn
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`w-full h-full grid ${getGridCols(
                    getAllParticipants.length
                  )} gap-4 auto-rows-fr`}
                >
                  {getAllParticipants.map((participant) => (
                    <div
                      key={participant.uid}
                      className="relative bg-black rounded-xl overflow-hidden shadow-lg"
                    >
                      {participant.isLocal ? (
                        <div
                          ref={localVideoRef}
                          className="w-full h-full relative bg-gradient-to-br from-blue-200 to-indigo-200"
                        >
                          {(localTracks.isVideoMuted ||
                            !localTracks.localVideoTrack) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                              <div className="text-center">
                                <img
                                  src={participant.photo}
                                  alt={participant.username}
                                  className="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-white shadow-lg"
                                />
                                <p className="text-sm text-white font-medium">
                                  {!localTracks.localVideoTrack
                                    ? "Camera Access Denied"
                                    : "Camera Off"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full relative">
                          {participant.hasVideo && participant.videoTrack ? (
                            <div
                              ref={(ref) => {
                                remoteUsers.remoteVideoRefs.current[
                                  participant.uid.toString()
                                ] = ref;
                                if (ref && participant.videoTrack) {
                                  remoteUsers.playRemoteVideo(
                                    participant.uid,
                                    participant.videoTrack
                                  );
                                }
                              }}
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                              <div className="text-center">
                                <img
                                  src={participant.photo}
                                  alt={participant.username}
                                  className="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-white shadow-lg"
                                />
                                <p className="text-sm text-gray-700 font-medium">
                                  Camera is off
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
                        <FontAwesomeIcon
                          icon={
                            participant.isLocal
                              ? faGraduationCap
                              : faChalkboardTeacher
                          }
                          className={
                            participant.isLocal
                              ? "text-blue-400"
                              : "text-green-400"
                          }
                        />
                        <span className="font-medium">
                          {participant.username}
                        </span>
                        {!participant.hasAudio && (
                          <FontAwesomeIcon
                            icon={faMicrophoneSlash}
                            className="text-red-400"
                          />
                        )}
                      </div>

                      <div
                        className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${
                          participant.isLocal
                            ? "bg-blue-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {participant.isLocal ? "You (Student)" : "Expert"}
                      </div>

                      {participant.isLocal &&
                        localTracks.localVideoTrack &&
                        !localTracks.isVideoMuted && (
                          <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-xs">
                            {localTracks.currentVideoQuality}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              <div className="absolute top-4 left-4">
                <div className="bg-white bg-opacity-90 backdrop-blur text-gray-700 px-3 py-2 rounded-full shadow-lg border border-blue-100 text-sm">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="mr-2 text-blue-500"
                  />
                  <span className="font-medium">
                    {getAllParticipants.length} participant
                    {getAllParticipants.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  <span>Student View</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleToggleAudio}
                  disabled={!localTracks.localAudioTrack}
                  className={`w-12 h-12 rounded-full transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    localTracks.isAudioMuted || !localTracks.localAudioTrack
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      localTracks.isAudioMuted || !localTracks.localAudioTrack
                        ? faMicrophoneSlash
                        : faMicrophone
                    }
                  />
                </button>

                <button
                  onClick={handleToggleVideo}
                  disabled={!localTracks.localVideoTrack}
                  className={`w-12 h-12 rounded-full transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    localTracks.isVideoMuted || !localTracks.localVideoTrack
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      localTracks.isVideoMuted || !localTracks.localVideoTrack
                        ? faVideoSlash
                        : faVideo
                    }
                  />
                </button>

                <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 shadow-lg border-2 border-gray-200">
                  <FontAwesomeIcon
                    icon={faVolumeDown}
                    className="text-gray-500 text-sm"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={remoteUsers.volume}
                    onChange={(e) =>
                      remoteUsers.updateVolume(parseInt(e.target.value))
                    }
                    className="w-16 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${remoteUsers.volume}%, #E5E7EB ${remoteUsers.volume}%, #E5E7EB 100%)`,
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faVolumeUp}
                    className="text-gray-500 text-sm"
                  />
                </div>

                <button
                  onClick={handleEndCall}
                  className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg"
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="transform rotate-135"
                  />
                </button>
              </div>
            </div>
          </div>

          {showChat && (
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FontAwesomeIcon
                      icon={faComments}
                      className="mr-2 text-blue-600"
                    />
                    Learning Session Chat
                  </h4>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-1 rounded-lg text-gray-500 hover:bg-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50">
                {chat.chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-2xl shadow-sm text-sm ${
                        msg.isOwn
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : msg.type === "system"
                          ? "bg-gray-200 text-gray-700 rounded-bl-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {!msg.isOwn && msg.type !== "system" && (
                        <p className="text-xs font-medium mb-1 opacity-75 flex items-center">
                          <FontAwesomeIcon
                            icon={faChalkboardTeacher}
                            className="mr-1"
                          />
                          {msg.sender}
                        </p>
                      )}
                      <p className="leading-relaxed">{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chat.chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    value={chat.newMessage}
                    onChange={(e) => chat.setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question or share your thoughts..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                    disabled={
                      !agoraConnection.isJoined || chat.isMessageSending
                    }
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      !chat.newMessage.trim() ||
                      !agoraConnection.isJoined ||
                      chat.isMessageSending
                    }
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-sm disabled:cursor-not-allowed"
                  >
                    {chat.isMessageSending ? (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin text-sm"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faPaperPlane}
                        className="text-sm"
                      />
                    )}
                  </button>
                </div>
                {chat.isMessageSending && (
                  <p className="text-xs text-gray-500 mt-1">Sending...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerAgoraVideoModal;
