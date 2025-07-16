import React, { useState, useEffect, useRef } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID,
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
  faDesktop,
  faUsers,
  faComments,
  faPaperPlane,
  faTimes,
  faExclamationTriangle,
  faRefresh,
  faWifi,
  faClose,
  faCheckCircle,
  faGraduationCap,
  faChalkboardTeacher,
  faClock,
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
}

interface RemoteUser {
  uid: UID;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
  hasVideo: boolean;
  hasAudio: boolean;
}

const PlayerAgoraVideoModal: React.FC<AgoraVideoModalProps> = ({
  isOpen,
  onClose,
  booking,
  agora,
}) => {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "System",
      message: "Welcome to your learning session! Initializing connection...",
      timestamp: new Date(),
      isOwn: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [volume, setVolume] = useState(50);
  const [networkStatus, setNetworkStatus] = useState<
    "online" | "offline" | "poor"
  >("online");
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isMessageSending, setIsMessageSending] = useState(false);

  const myUIDRef = useRef<number | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const waitingLocalVideoRef = useRef<HTMLDivElement>(null); // New ref for waiting screen video
  const remoteVideoRefs = useRef<{ [uid: string]: HTMLDivElement | null }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const callStartTime = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (isOpen && agora && !isInitializingRef.current) {
      initializeAgora();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, agora]);

  useEffect(() => {
    if (isJoined && !durationInterval.current) {
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
  }, [isJoined]);

  // Effect to play local video in waiting screen when available
  useEffect(() => {
    if (
      localVideoTrack &&
      !isVideoMuted &&
      waitingLocalVideoRef.current &&
      remoteUsers.length === 0
    ) {
      localVideoTrack.play(waitingLocalVideoRef.current);
    }
  }, [localVideoTrack, isVideoMuted, remoteUsers.length]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus("online");
      if (connectionError?.includes("offline")) {
        setConnectionError(null);
        addChatMessage("System", "Network restored. Reconnecting...", false);
        if (agora && !isJoined && !isInitializingRef.current) {
          setTimeout(() => initializeAgora(), 1000);
        }
      }
    };

    const handleOffline = () => {
      setNetworkStatus("offline");
      setConnectionError(
        "You are offline. Please check your internet connection."
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [connectionError, agora, isJoined]);

  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(volume);
      }
    });
  }, [volume, remoteUsers]);

  const initializeAgora = async () => {
    if (!agora || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);

    try {
      addChatMessage("System", "Connecting to your learning session...", false);

      await requestPermissions();

      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      // Add stream-message event handler for chat functionality
      agoraClient.on("stream-message", (uid, stream) => {
        try {
          const decoder = new TextDecoder();
          const messageString = decoder.decode(stream);
          const messageData = JSON.parse(messageString);

          if (messageData.type === "chat" && uid !== myUIDRef.current) {
            addChatMessage(messageData.sender, messageData.message, false);
          }
        } catch (error) {
          console.error("Error parsing chat message:", error);
        }
      });

      agoraClient.on("user-published", async (user, mediaType) => {
        if (user.uid === myUIDRef.current) return;

        try {
          await agoraClient.subscribe(user, mediaType);

          setRemoteUsers((prevUsers) => {
            const existingUserIndex = prevUsers.findIndex(
              (u) => u.uid === user.uid
            );

            if (existingUserIndex !== -1) {
              const updatedUsers = [...prevUsers];
              updatedUsers[existingUserIndex] = {
                ...updatedUsers[existingUserIndex],
                [mediaType === "video" ? "videoTrack" : "audioTrack"]:
                  user[`${mediaType}Track`],
                [mediaType === "video" ? "hasVideo" : "hasAudio"]: true,
              };
              return updatedUsers;
            } else {
              return [
                ...prevUsers,
                {
                  uid: user.uid,
                  videoTrack:
                    mediaType === "video" ? user.videoTrack : undefined,
                  audioTrack:
                    mediaType === "audio" ? user.audioTrack : undefined,
                  hasVideo: mediaType === "video",
                  hasAudio: mediaType === "audio",
                },
              ];
            }
          });

          if (mediaType === "video" && user.videoTrack) {
            setTimeout(() => {
              const remoteVideoContainer =
                remoteVideoRefs.current[user.uid.toString()];
              if (remoteVideoContainer) {
                user.videoTrack.play(remoteVideoContainer);
              }
            }, 100);
          }

          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
            user.audioTrack.setVolume(volume);
          }

          const username = getUsername(user.uid);
          addChatMessage(
            "System",
            `${username} ${
              mediaType === "video" ? "turned on camera" : "joined with audio"
            }`,
            false
          );
        } catch (error) {
          console.error("Error subscribing to user:", error);
        }
      });

      agoraClient.on("user-unpublished", (user, mediaType) => {
        if (user.uid === myUIDRef.current) return;

        setRemoteUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.uid === user.uid
              ? {
                  ...u,
                  [mediaType === "video" ? "videoTrack" : "audioTrack"]:
                    undefined,
                  [mediaType === "video" ? "hasVideo" : "hasAudio"]: false,
                }
              : u
          )
        );

        const username = getUsername(user.uid);
        addChatMessage(
          "System",
          `${username} ${
            mediaType === "video" ? "turned off camera" : "muted microphone"
          }`,
          false
        );
      });

      agoraClient.on("user-joined", (user) => {
        if (user.uid !== myUIDRef.current) {
          const username = getUsername(user.uid);
          addChatMessage("System", `${username} joined the session`, false);

          if (username === booking.expert.username) {
            setTimeout(() => {
              addChatMessage(
                booking.expert.username,
                `Hello ${booking.player.username}! I'm here to help you with ${booking.service.service.name}. Let's get started!`,
                false
              );
            }, 1500);
          }
        }
      });

      agoraClient.on("user-left", (user) => {
        if (user.uid !== myUIDRef.current) {
          setRemoteUsers((prevUsers) =>
            prevUsers.filter((u) => u.uid !== user.uid)
          );
          const username = getUsername(user.uid);
          addChatMessage("System", `${username} left the session`, false);
        }
      });

      agoraClient.on(
        "connection-state-change",
        (curState, revState, reason) => {
          if (curState === "CONNECTED") {
            setConnectionError(null);
            addChatMessage(
              "System",
              "Successfully connected to your learning session!",
              false
            );
          } else if (
            curState === "DISCONNECTED" &&
            reason === "NETWORK_ERROR"
          ) {
            setNetworkStatus("poor");
            setConnectionError("Network connection lost. Reconnecting...");
            addChatMessage(
              "System",
              "Connection interrupted. Attempting to reconnect...",
              false
            );
          }
        }
      );

      agoraClient.on("network-quality", (stats) => {
        const downlink = stats.downlinkNetworkQuality;
        const uplink = stats.uplinkNetworkQuality;

        if (downlink >= 4 || uplink >= 4) {
          setNetworkStatus("poor");
          if (downlink >= 5 || uplink >= 5) {
            addChatMessage("System", "Poor network quality detected.", false);
          }
        } else {
          setNetworkStatus("online");
        }
      });

      setClient(agoraClient);

      let joinSuccess = false;
      let currentUID = agora.uid;

      for (let attempt = 0; attempt < 3 && !joinSuccess; attempt++) {
        try {
          const uid = await agoraClient.join(
            import.meta.env.VITE_AGORA_APP_ID,
            agora.channel,
            agora.token,
            currentUID
          );

          myUIDRef.current = uid as number;
          joinSuccess = true;
        } catch (joinError: any) {
          if (
            joinError.code === "INVALID_TOKEN" ||
            joinError.code === "TOKEN_EXPIRED"
          ) {
            setConnectionError(
              "Session token is invalid or expired. Please refresh the page and get a new session link."
            );
            addChatMessage(
              "System",
              "Session token expired. Please refresh the page and try again.",
              false
            );
            return;
          } else if (joinError.code === "UID_CONFLICT") {
            currentUID = 22951 + Math.floor(Math.random() * 1000);
          } else if (attempt === 2) {
            throw joinError;
          }
        }
      }

      const tracks = [];

      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
          AEC: true,
          AGC: true,
          ANS: true,
        });
        tracks.push(audioTrack);
        setLocalAudioTrack(audioTrack);
      } catch (audioError) {
        addChatMessage(
          "System",
          "Microphone access denied. Audio disabled.",
          false
        );
      }

      try {
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: "720p_1",
          optimizationMode: "detail",
        });
        tracks.push(videoTrack);
        setLocalVideoTrack(videoTrack);

        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
      } catch (videoError) {
        addChatMessage(
          "System",
          "Camera access denied. Video disabled.",
          false
        );
      }

      if (tracks.length > 0) {
        await agoraClient.publish(tracks);
      }

      setIsJoined(true);
      setIsConnecting(false);
      addChatMessage(
        "System",
        "Connected successfully! Waiting for your expert to join...",
        false
      );

      setTimeout(() => {
        addChatMessage(
          "You",
          `Hello! I'm ready for our ${booking.service.service.name} session. Looking forward to learning!`,
          true
        );
      }, 2000);
    } catch (error: any) {
      if (error.code === "INVALID_VENDOR_KEY") {
        setConnectionError("Invalid App ID. Please contact support.");
      } else if (error.code === "TOKEN_EXPIRED") {
        setConnectionError(
          "Session expired. Please refresh and get a new session link."
        );
      } else if (error.code === "INVALID_TOKEN") {
        setConnectionError("Invalid session token. Please contact support.");
      } else if (
        error.message?.includes("token") ||
        error.message?.includes("TOKEN")
      ) {
        setConnectionError(
          "Session token is invalid or expired. Please refresh the page and get a new session link."
        );
      } else {
        setConnectionError(
          `Connection failed: ${error.message || "Unknown error"}`
        );
      }

      setIsConnecting(false);
      addChatMessage(
        "System",
        "Connection failed. Please check your session link and try again.",
        false
      );
    } finally {
      isInitializingRef.current = false;
    }
  };

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });

      stream.getTracks().forEach((track) => track.stop());
      setHasPermissions(true);
    } catch (error) {
      setHasPermissions(false);
    }
  };

  const cleanup = async () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    if (client) {
      try {
        const tracksToUnpublish = [];

        if (localAudioTrack) {
          tracksToUnpublish.push(localAudioTrack);
        }

        if (localVideoTrack) {
          tracksToUnpublish.push(localVideoTrack);
        }

        if (tracksToUnpublish.length > 0) {
          await client.unpublish(tracksToUnpublish);
        }

        await client.leave();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    }

    if (localAudioTrack) {
      try {
        localAudioTrack.stop();
        localAudioTrack.close();
      } catch (error) {
        console.error("Error stopping audio track:", error);
      }
      setLocalAudioTrack(null);
    }

    if (localVideoTrack) {
      try {
        localVideoTrack.stop();
        localVideoTrack.close();
      } catch (error) {
        console.error("Error stopping video track:", error);
      }
      setLocalVideoTrack(null);
    }

    remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        try {
          user.audioTrack.stop();
        } catch (error) {
          console.error("Error stopping remote audio track:", error);
        }
      }
      if (user.videoTrack) {
        try {
          user.videoTrack.stop();
        } catch (error) {
          console.error("Error stopping remote video track:", error);
        }
      }
    });

    setClient(null);
    setRemoteUsers([]);
    setIsJoined(false);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setConnectionError(null);
    setIsConnecting(false);
    setIsMessageSending(false);

    myUIDRef.current = null;
    isInitializingRef.current = false;
  };

  const getUsername = (uid: UID): string => {
    if (uid === myUIDRef.current) {
      return "You";
    }
    return booking.expert.username || "Expert";
  };

  const getAllParticipants = () => {
    const allParticipants = [];

    allParticipants.push({
      uid: myUIDRef.current || 0,
      isLocal: true,
      username: "You",
      hasVideo: !isVideoMuted && !!localVideoTrack,
      hasAudio: !isAudioMuted && !!localAudioTrack,
      photo: booking.player.photo,
    });

    remoteUsers.forEach((user) => {
      allParticipants.push({
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

    return allParticipants;
  };

  const getGridCols = (participantCount: number) => {
    if (participantCount === 1) return "grid-cols-1";
    if (participantCount === 2) return "grid-cols-2";
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

  const toggleAudio = async () => {
    if (!localAudioTrack || !client) return;

    try {
      if (!isAudioMuted) {
        // Currently unmuted, so mute by unpublishing
        await client.unpublish([localAudioTrack]);
        setIsAudioMuted(true);
        addChatMessage("System", "You muted your microphone", false);
      } else {
        // Currently muted, so unmute by publishing
        await client.publish([localAudioTrack]);
        setIsAudioMuted(false);
        addChatMessage("System", "You unmuted your microphone", false);
      }
    } catch (error) {
      // Fallback to setEnabled method
      try {
        await localAudioTrack.setEnabled(isAudioMuted);
        setIsAudioMuted(!isAudioMuted);
        addChatMessage(
          "System",
          `You ${isAudioMuted ? "unmuted" : "muted"} your microphone`,
          false
        );
      } catch (fallbackError) {
        addChatMessage("System", "Failed to toggle microphone", false);
      }
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrack || !client) return;

    try {
      if (!isVideoMuted) {
        // Currently unmuted, so mute by unpublishing
        await client.unpublish([localVideoTrack]);
        setIsVideoMuted(true);
        addChatMessage("System", "You turned off your camera", false);
      } else {
        // Currently muted, so unmute by publishing
        await client.publish([localVideoTrack]);
        setIsVideoMuted(false);
        addChatMessage("System", "You turned on your camera", false);

        // Re-play video in waiting screen if no remote users
        if (remoteUsers.length === 0 && waitingLocalVideoRef.current) {
          setTimeout(() => {
            localVideoTrack.play(waitingLocalVideoRef.current!);
          }, 100);
        }
      }
    } catch (error) {
      // Fallback to setEnabled method
      try {
        await localVideoTrack.setEnabled(isVideoMuted);
        setIsVideoMuted(!isVideoMuted);
        addChatMessage(
          "System",
          `You ${isVideoMuted ? "turned on" : "turned off"} your camera`,
          false
        );

        // Re-play video in waiting screen if no remote users and video is being turned on
        if (
          isVideoMuted &&
          remoteUsers.length === 0 &&
          waitingLocalVideoRef.current
        ) {
          setTimeout(() => {
            localVideoTrack.play(waitingLocalVideoRef.current!);
          }, 100);
        }
      } catch (fallbackError) {
        addChatMessage("System", "Failed to toggle camera", false);
      }
    }
  };

  const addChatMessage = (sender: string, message: string, isOwn: boolean) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender,
      message,
      timestamp: new Date(),
      isOwn,
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !client || !isJoined || isMessageSending) return;

    const messageToSend = newMessage.trim();
    setIsMessageSending(true);

    try {
      const messageData = {
        type: "chat",
        sender: booking.player.username,
        message: messageToSend,
        timestamp: Date.now(),
        uid: myUIDRef.current,
      };

      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(JSON.stringify(messageData));

      await client.sendStreamMessage(messageBuffer);

      // Only add to local chat if successfully sent
      addChatMessage("You", messageToSend, true);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      addChatMessage(
        "System",
        "Failed to send message. Please try again.",
        false
      );
    } finally {
      setIsMessageSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
    addChatMessage(
      "System",
      "Session ended. Thank you for learning with us!",
      false
    );

    setTimeout(() => {
      cleanup();
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  const allParticipants = getAllParticipants();

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
                  remoteUsers.length > 0 ? "bg-green-400" : "bg-gray-400"
                }`}
              ></div>
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
                icon={networkStatus === "offline" ? faClose : faWifi}
              />
              <span className="capitalize font-medium">{networkStatus}</span>
            </div>

            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
              {isConnecting
                ? "Connecting..."
                : isJoined
                ? "Connected"
                : "Disconnected"}
            </div>

            {isJoined && (
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 rounded-xl bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-sm border border-blue-100 text-sm"
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

        {connectionError && (
          <div className="p-3 bg-red-50 border-b border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span className="font-medium">{connectionError}</span>
              </div>
              <button
                onClick={retryConnection}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors"
              >
                <FontAwesomeIcon icon={faRefresh} className="mr-1" />
                Retry Connection
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
              {remoteUsers.length === 0 ? (
                /* Waiting screen with local video */
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {/* Show local video if available and not muted */}
                  {localVideoTrack && !isVideoMuted ? (
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
                        {(!localAudioTrack || isAudioMuted) && (
                          <FontAwesomeIcon
                            icon={faMicrophoneSlash}
                            className="text-red-400"
                          />
                        )}
                      </div>
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Preview
                      </div>
                    </div>
                  ) : (
                    /* Fallback when no video or camera is off */
                    <div className="w-80 h-60 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                      <div className="text-center">
                        <img
                          src={booking.player.photo}
                          alt={booking.player.username}
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-white shadow-lg"
                        />
                        <p className="text-sm text-gray-700 font-medium">
                          {!localVideoTrack
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

                    {/* Meeting details */}
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
                            {booking.startTime} - {booking.endTime}
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
                        {isJoined && (
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
                /* Grid view when expert has joined */
                <div
                  className={`w-full h-full grid ${getGridCols(
                    allParticipants.length
                  )} gap-4 auto-rows-fr`}
                >
                  {allParticipants.map((participant) => (
                    <div
                      key={participant.uid}
                      className="relative bg-black rounded-xl overflow-hidden shadow-lg"
                    >
                      {participant.isLocal ? (
                        <div
                          ref={localVideoRef}
                          className="w-full h-full relative bg-gradient-to-br from-blue-200 to-indigo-200"
                        >
                          {(isVideoMuted || !localVideoTrack) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                              <div className="text-center">
                                <img
                                  src={participant.photo}
                                  alt={participant.username}
                                  className="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-white shadow-lg"
                                />
                                <p className="text-sm text-white font-medium">
                                  {!localVideoTrack
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
                                remoteVideoRefs.current[
                                  participant.uid.toString()
                                ] = ref;
                                if (ref && participant.videoTrack) {
                                  setTimeout(() => {
                                    participant.videoTrack.play(ref);
                                  }, 100);
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
                                  Expert camera is off
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

                      {participant.isLocal ? (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          You (Student)
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          Expert
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
                    {allParticipants.length} participant
                    {allParticipants.length !== 1 ? "s" : ""}
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
                  onClick={toggleAudio}
                  disabled={!localAudioTrack}
                  className={`w-12 h-12 rounded-full transition-all duration-200 shadow-lg ${
                    isAudioMuted || !localAudioTrack
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon
                    icon={
                      isAudioMuted || !localAudioTrack
                        ? faMicrophoneSlash
                        : faMicrophone
                    }
                  />
                </button>

                <button
                  onClick={toggleVideo}
                  disabled={!localVideoTrack}
                  className={`w-12 h-12 rounded-full transition-all duration-200 shadow-lg ${
                    isVideoMuted || !localVideoTrack
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon
                    icon={
                      isVideoMuted || !localVideoTrack ? faVideoSlash : faVideo
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
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-16 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume}%, #E5E7EB ${volume}%, #E5E7EB 100%)`,
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
                {chatMessages.map((msg) => (
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
                          : msg.sender === "System"
                          ? "bg-gray-200 text-gray-700 rounded-bl-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {!msg.isOwn && msg.sender !== "System" && (
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
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question or share your thoughts..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                    disabled={!isJoined || isMessageSending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={
                      !newMessage.trim() || !isJoined || isMessageSending
                    }
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-sm"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                  </button>
                </div>
                {isMessageSending && (
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
