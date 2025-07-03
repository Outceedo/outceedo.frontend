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
  faStopwatch,
  faRecordVinyl,
  faPause,
  faExclamationTriangle,
  faRefresh,
  faWifi,
  faClose,
  faCheckCircle,
  faClock,
  faGraduationCap,
  faChalkboardTeacher,
  faStar,
  faFileAlt,
  faPlay,
  faStop,
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
  agora: Agora;
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

const ExpertAgoraVideoModal: React.FC<AgoraVideoModalProps> = ({
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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "System",
      message:
        "Welcome to the expert session! Initializing secure connection...",
      timestamp: new Date(),
      isOwn: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [volume, setVolume] = useState(50);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [networkStatus, setNetworkStatus] = useState<
    "online" | "offline" | "poor"
  >("online");
  const [hasPermissions, setHasPermissions] = useState(false);
  const [sessionStartTime] = useState("2025-07-03 08:31:04");

  const myUIDRef = useRef<number | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
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
        addChatMessage(
          "System",
          "Expert network restored. Reconnecting...",
          false
        );
        if (agora && !isJoined && !isInitializingRef.current) {
          setTimeout(() => initializeAgora(), 1000);
        }
      }
    };

    const handleOffline = () => {
      setNetworkStatus("offline");
      setConnectionError(
        "Expert is offline. Please check your internet connection."
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [connectionError, agora, isJoined]);

  const initializeAgora = async () => {
    if (!agora || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);

    try {
      addChatMessage("System", "Connecting to expert session...", false);

      await requestPermissions();

      const agoraClient = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
        clientRoleOptions: {
          level: 1,
        },
      });

      agoraClient.on(
        "connection-state-change",
        (curState, revState, reason) => {
          if (curState === "CONNECTED") {
            setConnectionError(null);
            addChatMessage(
              "System",
              "Expert session successfully established!",
              false
            );
          } else if (
            curState === "DISCONNECTED" &&
            reason === "NETWORK_ERROR"
          ) {
            setNetworkStatus("poor");
            setConnectionError(
              "Expert network connection lost. Reconnecting..."
            );
            addChatMessage(
              "System",
              "Expert connection interrupted. Attempting to reconnect...",
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
            addChatMessage(
              "System",
              "Poor network quality detected. This may affect teaching quality.",
              false
            );
          }
        } else {
          setNetworkStatus("online");
        }
      });

      agoraClient.on("user-joined", (user) => {
        if (user.uid !== myUIDRef.current) {
          const username = getUsername(user.uid);
          addChatMessage(
            "System",
            `${username} joined the expert session`,
            false
          );

          if (username === booking.player.username) {
            setTimeout(() => {
              addChatMessage(
                "You",
                "Great! I can see you've joined. Let's begin our expert session and make this a productive learning experience.",
                true
              );
            }, 1000);
          }
        }
      });

      agoraClient.on("user-left", (user) => {
        if (user.uid !== myUIDRef.current) {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          const username = getUsername(user.uid);
          addChatMessage(
            "System",
            `${username} left the expert session`,
            false
          );

          if (sessionNotes.trim()) {
            addChatMessage("System", "Session notes auto-saved.", false);
          }
        }
      });

      agoraClient.on("user-published", async (user, mediaType) => {
        if (user.uid === myUIDRef.current) return;

        try {
          await agoraClient.subscribe(user, mediaType);

          setRemoteUsers((prev) => {
            const existingUserIndex = prev.findIndex((u) => u.uid === user.uid);

            if (existingUserIndex !== -1) {
              const updatedUsers = [...prev];
              updatedUsers[existingUserIndex] = {
                ...updatedUsers[existingUserIndex],
                [mediaType === "video" ? "videoTrack" : "audioTrack"]:
                  user[`${mediaType}Track`],
                [mediaType === "video" ? "hasVideo" : "hasAudio"]: true,
              };
              return updatedUsers;
            } else {
              if (prev.length < 1) {
                return [
                  ...prev,
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
              return prev;
            }
          });

          if (mediaType === "video" && user.videoTrack) {
            const remoteVideoContainer =
              remoteVideoRefs.current[user.uid.toString()];
            if (remoteVideoContainer) {
              user.videoTrack.play(remoteVideoContainer);
            }
          }

          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
            user.audioTrack.setVolume(volume);
          }

          const username = getUsername(user.uid);
          if (mediaType === "video") {
            addChatMessage(
              "System",
              `${username} ${
                user.videoTrack ? "turned on" : "turned off"
              } their camera`,
              false
            );
          }
        } catch (error) {
          // Silent error handling
        }
      });

      agoraClient.on("user-unpublished", (user, mediaType) => {
        if (user.uid === myUIDRef.current) return;

        setRemoteUsers((prev) =>
          prev.map((u) =>
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
            mediaType === "video"
              ? "turned off their camera"
              : "muted their microphone"
          }`,
          false
        );
      });

      setClient(agoraClient);

      let joinSuccess = false;

      for (let attempt = 0; attempt < 3 && !joinSuccess; attempt++) {
        try {
          await agoraClient.join(
            import.meta.env.VITE_AGORA_APP_ID,
            agora.channel,
            agora.token,
            agora.uid
          );

          joinSuccess = true;
          myUIDRef.current = agora.uid;
        } catch (joinError: any) {
          if (joinError.code === "UID_CONFLICT") {
            agora.uid = 22951 + Math.floor(Math.random() * 1000);
          } else if (attempt === 2) {
            throw joinError;
          }
        }
      }

      const tracks = [];

      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "high_quality_stereo",
          AEC: true,
          AGC: true,
          ANS: true,
        });
        tracks.push(audioTrack);
        setLocalAudioTrack(audioTrack);
      } catch (audioError) {
        addChatMessage(
          "System",
          "Expert microphone access denied. Audio teaching disabled.",
          false
        );
      }

      try {
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: "1080p_1",
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
          "Expert camera access denied. Video teaching disabled.",
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
        "Expert session successfully established! Ready to teach.",
        false
      );

      setTimeout(() => {
        addChatMessage(
          "You",
          `Hello ${booking.player.username}! Welcome to our ${booking.service.service.name} session. I'm here to provide expert guidance and help you achieve your learning goals today.`,
          true
        );
      }, 2000);
    } catch (error: any) {
      if (error.message?.includes("Invalid Agora App ID")) {
        setConnectionError(
          "Expert session configuration error. Please contact support."
        );
      } else if (error.message?.includes("TOKEN_EXPIRED")) {
        setConnectionError(
          "Expert session expired. Please refresh and rejoin."
        );
      } else {
        setConnectionError(
          `Expert connection failed: ${error.message || "Unknown error"}`
        );
      }

      setIsConnecting(false);
      addChatMessage(
        "System",
        "Expert connection failed. Please try again.",
        false
      );
    } finally {
      isInitializingRef.current = false;
    }
  };

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
      });
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

    if (client) {
      try {
        await client.leave();
      } catch (error) {
        // Silent error handling
      }
      setClient(null);
    }

    setRemoteUsers([]);
    setIsJoined(false);
    setIsRecording(false);
    myUIDRef.current = null;
    isInitializingRef.current = false;
  };

  const getUsername = (uid: UID): string => {
    if (uid === myUIDRef.current) {
      return "You";
    }
    return booking.player.username || "Student";
  };

  const getAllParticipants = () => {
    const allParticipants = [];

    allParticipants.push({
      uid: myUIDRef.current || 0,
      isLocal: true,
      username: "Expert",
      hasVideo: !isVideoMuted && !!localVideoTrack,
      hasAudio: !isAudioMuted && !!localAudioTrack,
      photo: booking.expert.photo,
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
        photo: booking.player.photo,
      });
    });

    return allParticipants.slice(0, 2);
  };

  const getGridCols = (participantCount: number) => {
    if (participantCount === 1) return "grid-cols-1";
    return "grid-cols-2";
  };

  const getSessionProgress = () => {
    const [startHours, startMinutes] = booking.startTime.split(":").map(Number);
    const [endHours, endMinutes] = booking.endTime.split(":").map(Number);

    let sessionDurationMinutes =
      endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

    if (sessionDurationMinutes <= 0) {
      sessionDurationMinutes += 24 * 60;
    }

    const sessionDurationSeconds = sessionDurationMinutes * 60;

    if (sessionDurationSeconds <= 0) return 0;

    const progress = (callDuration / sessionDurationSeconds) * 100;
    return Math.min(Math.max(progress, 0), 100);
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
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
      addChatMessage(
        "System",
        `Expert ${!isAudioMuted ? "muted" : "unmuted"} microphone`,
        false
      );
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
      addChatMessage(
        "System",
        `Expert ${!isVideoMuted ? "turned off" : "turned on"} camera`,
        false
      );
    }
  };

  const toggleScreenShare = async () => {
    if (!client) return;

    try {
      if (!isScreenSharing) {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: "1080p_1",
          optimizationMode: "detail",
        });

        if (localVideoTrack) {
          await client.unpublish(localVideoTrack);
          localVideoTrack.stop();
          localVideoTrack.close();
        }

        await client.publish(screenTrack);
        setIsScreenSharing(true);

        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current);
        }

        addChatMessage(
          "System",
          "Expert started sharing screen for teaching",
          false
        );

        screenTrack.on("track-ended", async () => {
          await client.unpublish(screenTrack);
          screenTrack.stop();
          screenTrack.close();
          setIsScreenSharing(false);
          addChatMessage("System", "Expert stopped screen sharing", false);

          try {
            const cameraTrack = await AgoraRTC.createCameraVideoTrack({
              encoderConfig: "1080p_1",
              optimizationMode: "detail",
            });

            await client.publish(cameraTrack);
            setLocalVideoTrack(cameraTrack);

            if (localVideoRef.current) {
              cameraTrack.play(localVideoRef.current);
            }
          } catch (error) {
            // Silent error handling
          }
        });
      }
    } catch (error) {
      addChatMessage("System", "Failed to start expert screen sharing", false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    const action = !isRecording ? "started" : "stopped";
    addChatMessage("System", `Expert session recording ${action}`, false);

    if (!isRecording) {
      // Start recording logic
    } else {
      // Stop recording logic
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

  const sendMessage = () => {
    if (newMessage.trim()) {
      addChatMessage("You", newMessage, true);
      setNewMessage("");

      if (Math.random() > 0.7) {
        setTimeout(() => {
          const responses = [
            "Thank you for the explanation!",
            "That makes perfect sense now.",
            "Could you show me that technique again?",
            "I understand the concept better now.",
            "This is very helpful, thank you!",
            "Great teaching method!",
            "I appreciate your patience.",
            "That clarifies everything!",
          ];
          const randomResponse =
            responses[Math.floor(Math.random() * responses.length)];
          addChatMessage(booking.player.username, randomResponse, false);
        }, 2000 + Math.random() * 3000);
      }
    }
  };

  const handleEndCall = () => {
    if (sessionNotes.trim()) {
      

      addChatMessage(
        "System",
        "Expert session notes and data saved successfully.",
        false
      );
    }

    addChatMessage(
      "System",
      "Expert session completed. Thank you for teaching!",
      false
    );

    setTimeout(() => {
      onClose();
    }, 1000);
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

  if (!isOpen) return null;

  const allParticipants = getAllParticipants();
  const sessionProgress = getSessionProgress();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className={`${
          isFullscreen
            ? "w-screen h-screen"
            : "w-[95vw] h-[90vh] max-w-7xl rounded-2xl shadow-2xl"
        } bg-white overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={booking.player.photo}
                alt={booking.player.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-green-200 shadow-sm"
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
                  icon={faChalkboardTeacher}
                  className="mr-2 text-green-600"
                />
                Expert Session: {booking.service.service.name}
              </h3>
              <p className="text-sm text-green-600 font-medium flex items-center">
                <FontAwesomeIcon icon={faGraduationCap} className="mr-1" />
                Teaching {booking.player.username}
              </p>
              {sessionProgress > 0 && (
                <div className="mt-1 flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${sessionProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {Math.round(sessionProgress)}% complete
                  </span>
                </div>
              )}
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
                ? "Expert Ready"
                : "Disconnected"}
            </div>

            {isJoined && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <FontAwesomeIcon icon={faStopwatch} className="text-xs" />
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}

            {isRecording && (
              <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <FontAwesomeIcon icon={faRecordVinyl} className="text-xs" />
                <span>Recording</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 rounded-xl bg-white text-green-600 hover:bg-green-50 transition-colors shadow-sm border border-green-100 text-sm"
              >
                <FontAwesomeIcon icon={faComments} />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-white text-green-600 hover:bg-green-50 transition-colors shadow-sm border border-green-100 text-sm"
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
                Retry Expert Connection
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
            <div className="flex-1 relative bg-gradient-to-br from-green-100 to-emerald-100 p-4">
              {allParticipants.length === 1 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="text-3xl text-green-500"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Waiting for {booking.player.username}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">
                      Your student will join the expert session shortly...
                    </p>
                    <div className="mt-3 text-xs text-gray-400">
                      <p className="flex items-center justify-center mb-1">
                        <FontAwesomeIcon
                          icon={faChalkboardTeacher}
                          className="mr-2"
                        />
                        Expert Session: {booking.service.service.name}
                      </p>
                      <p className="flex items-center justify-center mb-1">
                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                        Time: {booking.startTime} - {booking.endTime}
                      </p>

                      {isJoined && (
                        <p className="text-green-600 mt-2 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-1"
                          />
                          Expert connected and ready to teach
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
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
                          className="w-full h-full relative bg-gradient-to-br from-green-200 to-emerald-200"
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
                                    ? "Expert Camera Access Denied"
                                    : "Expert Camera Off"}
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
                                  participant.videoTrack.play(ref);
                                }
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                              <div className="text-center">
                                <img
                                  src={participant.photo}
                                  alt={participant.username}
                                  className="w-16 h-16 rounded-full mx-auto mb-2 border-3 border-white shadow-lg"
                                />
                                <p className="text-sm text-gray-700 font-medium">
                                  Student camera is off
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
                              ? faChalkboardTeacher
                              : faGraduationCap
                          }
                          className={
                            participant.isLocal
                              ? "text-green-400"
                              : "text-blue-400"
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

                      {participant.isLocal && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          Expert {isScreenSharing && "(Screen)"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="absolute top-4 left-4">
                <div className="bg-white bg-opacity-90 backdrop-blur text-gray-700 px-3 py-2 rounded-full shadow-lg border border-green-100 text-sm">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="mr-2 text-green-500"
                  />
                  <span className="font-medium">
                    {allParticipants.length} participants
                  </span>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2">
                  <FontAwesomeIcon icon={faStar} />
                  <span>Expert Mode</span>
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

                <button
                  onClick={toggleScreenShare}
                  disabled={!isJoined}
                  className={`w-12 h-12 rounded-full transition-all duration-200 shadow-lg ${
                    isScreenSharing
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon icon={faDesktop} />
                </button>

                <button
                  onClick={toggleRecording}
                  disabled={!isJoined}
                  className={`w-12 h-12 rounded-full transition-all duration-200 shadow-lg ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon icon={isRecording ? faStop : faPlay} />
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
                    className="w-16 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #10B981 0%, #10B981 ${volume}%, #E5E7EB ${volume}%, #E5E7EB 100%)`,
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
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FontAwesomeIcon
                      icon={faComments}
                      className="mr-2 text-green-600"
                    />
                    Expert Session Chat
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
                          ? "bg-green-500 text-white rounded-br-sm"
                          : msg.sender === "System"
                          ? "bg-gray-200 text-gray-700 rounded-bl-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {!msg.isOwn && msg.sender !== "System" && (
                        <p className="text-xs font-medium mb-1 opacity-75 flex items-center">
                          <FontAwesomeIcon
                            icon={faGraduationCap}
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

              <div className="p-3 border-t border-gray-200 bg-green-50">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className="mr-2 text-green-600"
                  />
                  Expert Session Notes
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add notes about this expert session, student progress, key points covered..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                  rows={3}
                />
               
              </div>

              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Send expert guidance to student..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-sm"
                    disabled={!isJoined}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isJoined}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-sm"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertAgoraVideoModal;
