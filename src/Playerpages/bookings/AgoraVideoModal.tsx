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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "System",
      message: "Initializing secure connection...",
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

  const myUIDRef = useRef<number | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [uid: string]: HTMLDivElement | null }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const callStartTime = useRef<number>(0);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  const initializeAgora = async () => {
    if (!agora || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setIsConnecting(true);
    setConnectionError(null);

    try {
      addChatMessage("System", "Connecting to meeting...", false);

      await requestPermissions();

      const agoraClient = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      agoraClient.on(
        "connection-state-change",
        (curState, revState, reason) => {
          if (curState === "CONNECTED") {
            setConnectionError(null);
            addChatMessage("System", "Successfully connected!", false);
          } else if (
            curState === "DISCONNECTED" &&
            reason === "NETWORK_ERROR"
          ) {
            setNetworkStatus("poor");
            setConnectionError("Network connection lost. Reconnecting...");
          }
        }
      );

      agoraClient.on("network-quality", (stats) => {
        if (
          stats.downlinkNetworkQuality >= 4 ||
          stats.uplinkNetworkQuality >= 4
        ) {
          setNetworkStatus("poor");
        } else {
          setNetworkStatus("online");
        }
      });

      agoraClient.on("user-joined", (user) => {
        if (user.uid !== myUIDRef.current) {
          addChatMessage(
            "System",
            `${getUsername(user.uid)} joined the meeting`,
            false
          );
        }
      });

      agoraClient.on("user-left", (user) => {
        if (user.uid !== myUIDRef.current) {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          addChatMessage(
            "System",
            `${getUsername(user.uid)} left the meeting`,
            false
          );
        }
      });

      agoraClient.on("user-published", async (user, mediaType) => {
        if (user.uid === myUIDRef.current) return;

        try {
          await agoraClient.subscribe(user, mediaType);

          setRemoteUsers((prev) => {
            const existingUser = prev.find((u) => u.uid === user.uid);
            if (existingUser) {
              return prev.map((u) =>
                u.uid === user.uid
                  ? {
                      ...u,
                      [mediaType === "video" ? "videoTrack" : "audioTrack"]:
                        user[`${mediaType}Track`],
                      [mediaType === "video" ? "hasVideo" : "hasAudio"]: true,
                    }
                  : u
              );
            } else {
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
          if (
            joinError.code === "INVALID_TOKEN" ||
            joinError.code === "TOKEN_EXPIRED"
          ) {
            setConnectionError(
              "Session token is invalid or expired. Please refresh the page and try again."
            );
            addChatMessage(
              "System",
              "Session token expired. Please refresh the page.",
              false
            );
            return;
          } else if (joinError.code === "UID_CONFLICT") {
            agora.uid = 22952 + Math.floor(Math.random() * 1000);
          } else if (attempt === 2) {
            throw joinError;
          }
        }
      }

      const tracks = [];

      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
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
      addChatMessage("System", "Successfully connected to the meeting!", false);

      setTimeout(() => {
        addChatMessage(
          "You",
          `Hello ${booking.expert.username}! I'm ready for our ${booking.service.service.name} session.`,
          true
        );
      }, 2000);
    } catch (error: any) {
      if (
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

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
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
    myUIDRef.current = null;
    isInitializingRef.current = false;
  };

  const getUsername = (uid: UID): string => {
    if (uid === myUIDRef.current) {
      return "You";
    }
    return booking.expert.username || "Expert";
  };

  const getActualRemoteUsers = () => {
    return remoteUsers.filter((user) => user.uid !== myUIDRef.current);
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

    getActualRemoteUsers().forEach((user) => {
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

    return allParticipants.slice(0, 2);
  };

  const getGridCols = (participantCount: number) => {
    if (participantCount === 1) return "grid-cols-1";
    if (participantCount === 2) return "grid-cols-2";
    return "grid-cols-3";
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
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
        `You ${!isAudioMuted ? "muted" : "unmuted"} your microphone`,
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
        `You ${!isVideoMuted ? "turned off" : "turned on"} your camera`,
        false
      );
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

  if (!isOpen) return null;

  const actualRemoteUsers = getActualRemoteUsers();
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
                  actualRemoteUsers.length > 0 ? "bg-green-400" : "bg-gray-400"
                }`}
              ></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {booking.service.service.name}
              </h3>
              <p className="text-sm text-blue-600 font-medium">
                with {booking.expert.username}
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
              <span className="capitalize">{networkStatus}</span>
            </div>

            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {isConnecting
                ? "Connecting..."
                : isJoined
                ? "Connected"
                : "Disconnected"}
            </div>

            {isJoined && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
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
                Retry
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
              {allParticipants.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-2xl text-blue-500"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Waiting for {booking.expert.username}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Your expert will join the meeting shortly...
                    </p>
                    <div className="mt-3 text-xs text-gray-400">
                      <p>Session: {booking.service.service.name}</p>
                      <p>
                        Time: {booking.startTime} - {booking.endTime}
                      </p>
                      {isJoined && (
                        <p className="text-green-600 mt-2 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-1"
                          />
                          Connected and ready
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
                                  participant.videoTrack.play(ref);
                                }
                              }}
                              className="w-full h-full object-cover"
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
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          You
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
                    {allParticipants.length} participants
                  </span>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  Player View
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
                    className="w-16 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                  />
                  <FontAwesomeIcon
                    icon={faVolumeUp}
                    className="text-gray-500 text-sm"
                  />
                </div>

                <button
                  onClick={onClose}
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
                  <h4 className="font-semibold text-gray-800">Session Chat</h4>
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
                        <p className="text-xs font-medium mb-1 opacity-75">
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
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm"
                    disabled={!isJoined}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isJoined}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-sm"
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

export default PlayerAgoraVideoModal;
