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
  faPlay,
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
  agora: {
    channel: string;
    token: string;
    uid: number;
  };
  startTime: string;
  endTime: string;
  date: string;
}

interface AgoraVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
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

const AgoraVideoModal: React.FC<AgoraVideoModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  // Agora states
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  // UI states
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
      message: "Welcome to the expert session! Connecting to the meeting...",
      timestamp: new Date(),
      isOwn: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [volume, setVolume] = useState(50);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [uid: string]: HTMLDivElement | null }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const callStartTime = useRef<number>(0);

  // Initialize Agora client
  useEffect(() => {
    if (isOpen && booking?.agora) {
      initializeAgora();
    }

    return () => {
      cleanupAgora();
    };
  }, [isOpen, booking]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isJoined) {
      callStartTime.current = Date.now();
      interval = setInterval(() => {
        setCallDuration(
          Math.floor((Date.now() - callStartTime.current) / 1000)
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isJoined]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const initializeAgora = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Create Agora client
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setClient(agoraClient);

      // Set up event handlers
      agoraClient.on("user-published", handleUserPublished);
      agoraClient.on("user-unpublished", handleUserUnpublished);
      agoraClient.on("user-joined", handleUserJoined);
      agoraClient.on("user-left", handleUserLeft);

      // Join the channel
      await agoraClient.join(
        import.meta.env.VITE_AGORA_APP_ID,
        booking.agora.channel,
        booking.agora.token,
        booking.agora.uid
      );

      // Create and publish local tracks
      const [microphoneTrack, cameraTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "high_quality_stereo",
        }),
        AgoraRTC.createCameraVideoTrack({
          encoderConfig: "720p_1",
        }),
      ]);

      setLocalAudioTrack(microphoneTrack);
      setLocalVideoTrack(cameraTrack);

      // Play local video
      if (localVideoRef.current) {
        cameraTrack.play(localVideoRef.current);
      }

      // Publish tracks
      await agoraClient.publish([microphoneTrack, cameraTrack]);

      setIsJoined(true);
      setIsConnecting(false);

      // Add success message
      addChatMessage(
        "System",
        "Successfully connected to the meeting! Ready to start the expert session.",
        false
      );

      // Welcome message to player
      setTimeout(() => {
        addChatMessage(
          "You",
          `Hello ${booking.player.username}! Welcome to our ${booking.service.service.name} session. I'm here to help you today.`,
          true
        );
      }, 2000);
    } catch (error) {
      console.error("Failed to initialize Agora:", error);
      setConnectionError("Failed to connect to the meeting. Please try again.");
      setIsConnecting(false);
      addChatMessage(
        "System",
        "Connection failed. Please check your internet connection and try again.",
        false
      );
    }
  };

  const handleUserJoined = (user: any) => {
    console.log("User joined:", user.uid);
    const username = getUsername(user.uid);
    addChatMessage("System", `${username} joined the meeting`, false);

    // Send welcome message when player joins
    if (username === booking.player.username) {
      setTimeout(() => {
        addChatMessage(
          "You",
          "Great! I can see you've joined. Let's begin our session.",
          true
        );
      }, 1000);
    }
  };

  const handleUserLeft = (user: any) => {
    console.log("User left:", user.uid);
    const username = getUsername(user.uid);
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    addChatMessage("System", `${username} left the meeting`, false);
  };

  const handleUserPublished = async (
    user: any,
    mediaType: "video" | "audio"
  ) => {
    if (!client) return;

    try {
      await client.subscribe(user, mediaType);

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
              videoTrack: mediaType === "video" ? user.videoTrack : undefined,
              audioTrack: mediaType === "audio" ? user.audioTrack : undefined,
              hasVideo: mediaType === "video",
              hasAudio: mediaType === "audio",
            },
          ];
        }
      });

      // Play remote tracks
      if (mediaType === "video" && user.videoTrack) {
        const remoteVideoContainer = remoteVideoRefs.current[user.uid];
        if (remoteVideoContainer) {
          user.videoTrack.play(remoteVideoContainer);
        }
      }

      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
        // Apply current volume setting
        user.audioTrack.setVolume(volume);
      }

      // Notify about media changes
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
      console.error(`Error subscribing to ${mediaType}:`, error);
    }
  };

  const handleUserUnpublished = (user: any, mediaType: "video" | "audio") => {
    setRemoteUsers((prev) =>
      prev.map((u) =>
        u.uid === user.uid
          ? {
              ...u,
              [mediaType === "video" ? "videoTrack" : "audioTrack"]: undefined,
              [mediaType === "video" ? "hasVideo" : "hasAudio"]: false,
            }
          : u
      )
    );
  };

  const getUsername = (uid: UID): string => {
    if (uid === booking.agora.uid) {
      return "You";
    }
    return booking.player.username || "Player";
  };

  const cleanupAgora = async () => {
    try {
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (client) {
        await client.leave();
        client.removeAllListeners();
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }

    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setClient(null);
    setRemoteUsers([]);
    setIsJoined(false);
    setCallDuration(0);
    setIsRecording(false);
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

  const toggleScreenShare = async () => {
    if (!client) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: "1080p_1",
        });

        // Replace camera track with screen track
        if (localVideoTrack) {
          await client.unpublish(localVideoTrack);
          localVideoTrack.stop();
          localVideoTrack.close();
        }

        await client.publish(screenTrack);
        setLocalVideoTrack(screenTrack as any);
        setIsScreenSharing(true);

        // Play screen share in local video
        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current);
        }

        addChatMessage("System", "You started sharing your screen", false);
      } else {
        // Stop screen sharing and return to camera
        if (localVideoTrack) {
          await client.unpublish(localVideoTrack);
          localVideoTrack.stop();
          localVideoTrack.close();
        }

        const cameraTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: "720p_1",
        });
        await client.publish(cameraTrack);
        setLocalVideoTrack(cameraTrack);
        setIsScreenSharing(false);

        // Play camera in local video
        if (localVideoRef.current) {
          cameraTrack.play(localVideoRef.current);
        }

        addChatMessage("System", "You stopped sharing your screen", false);
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      addChatMessage(
        "System",
        "Failed to toggle screen sharing. Please try again.",
        false
      );
    }
  };

  const toggleRecording = async () => {
    // In a real implementation, you would start/stop recording here
    setIsRecording(!isRecording);
    addChatMessage(
      "System",
      `Session recording ${!isRecording ? "started" : "stopped"}`,
      false
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Apply volume to remote audio tracks
    remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        user.audioTrack.setVolume(newVolume);
      }
    });
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

      // In a real app, you'd send this through Agora RTM or your own messaging service
      // For demo, simulate player response occasionally
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const responses = [
            "Thank you for the explanation!",
            "That makes sense.",
            "Could you show me that again?",
            "I understand now.",
            "This is very helpful.",
          ];
          const randomResponse =
            responses[Math.floor(Math.random() * responses.length)];
          addChatMessage(booking.player.username, randomResponse, false);
        }, 2000 + Math.random() * 3000);
      }
    }
  };

  const handleEndCall = async () => {
    // Save session notes or send summary
    if (sessionNotes.trim()) {
      console.log("Session notes:", sessionNotes);
      // In a real app, save these notes to the backend
    }

    await cleanupAgora();
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSessionProgress = () => {
    const [startHours, startMinutes] = booking.startTime.split(":").map(Number);
    const [endHours, endMinutes] = booking.endTime.split(":").map(Number);

    const sessionDurationMinutes =
      endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    const sessionDurationSeconds = sessionDurationMinutes * 60;

    if (sessionDurationSeconds <= 0) return 0;

    const progress = (callDuration / sessionDurationSeconds) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (!isOpen) return null;

  const sessionProgress = getSessionProgress();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className={`${
          isFullscreen
            ? "w-screen h-screen"
            : "w-[95vw] h-[90vh] max-w-7xl rounded-2xl shadow-2xl"
        } bg-white overflow-hidden flex flex-col`}
        ref={modalRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={booking.player.photo}
                alt={booking.player.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-green-200 shadow-sm"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  remoteUsers.length > 0 ? "bg-green-400" : "bg-gray-400"
                }`}
              ></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                Expert Session: {booking.service.service.name}
              </h3>
              <p className="text-sm text-green-600 font-medium">
                with {booking.player.username}
              </p>
              {sessionProgress > 0 && (
                <div className="mt-1 flex items-center space-x-2">
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${sessionProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(sessionProgress)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isJoined && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <FontAwesomeIcon icon={faStopwatch} className="text-xs" />
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}

            {isRecording && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <FontAwesomeIcon icon={faRecordVinyl} className="text-xs" />
                <span>Recording</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 rounded-xl bg-white text-green-600 hover:bg-green-50 transition-colors shadow-sm border border-green-100"
              >
                <FontAwesomeIcon icon={faComments} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white text-green-600 hover:bg-green-50 transition-colors shadow-sm border border-green-100"
              >
                <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white text-gray-500 hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {(isConnecting || connectionError) && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            {isConnecting && (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-blue-700 font-medium">
                  Connecting to expert session...
                </span>
              </div>
            )}
            {connectionError && (
              <div className="flex items-center space-x-3 text-red-600">
                <FontAwesomeIcon icon={faPhone} />
                <span className="font-medium">{connectionError}</span>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex bg-gray-50">
          {/* Video Area */}
          <div
            className={`${
              showChat ? "flex-1" : "w-full"
            } flex flex-col relative`}
          >
            {/* Remote Video */}
            <div className="flex-1 relative bg-gradient-to-br from-green-100 to-emerald-100">
              {remoteUsers.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-6">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-3xl text-green-500"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Waiting for {booking.player.username}
                    </h3>
                    <p className="text-gray-500">
                      Your student will join the session shortly...
                    </p>
                    <div className="mt-4 text-sm text-gray-400">
                      <p>Session: {booking.service.service.name}</p>
                      <p>
                        Time: {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full grid grid-cols-1 gap-2">
                  {remoteUsers.map((user) => (
                    <div
                      key={user.uid}
                      className="relative bg-black rounded-lg overflow-hidden"
                    >
                      <div
                        ref={(el) => {
                          remoteVideoRefs.current[user.uid.toString()] = el;
                          if (el && user.videoTrack) {
                            user.videoTrack.play(el);
                          }
                        }}
                        className="w-full h-full"
                      />
                      {!user.hasVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                          <div className="text-center">
                            <img
                              src={booking.player.photo}
                              alt={booking.player.username}
                              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                            />
                            <h3 className="text-lg font-semibold text-gray-700">
                              {getUsername(user.uid)}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Camera is off
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm flex items-center space-x-2">
                        <span>{getUsername(user.uid)}</span>
                        {!user.hasAudio && (
                          <FontAwesomeIcon
                            icon={faMicrophoneSlash}
                            className="text-red-400 text-xs"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Local Video (Picture in Picture) */}
              <div className="absolute bottom-6 right-6 w-56 h-40 bg-white rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <div
                  ref={localVideoRef}
                  className="w-full h-full relative bg-gradient-to-br from-green-200 to-emerald-200"
                >
                  {isVideoMuted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                      <div className="text-center">
                        <FontAwesomeIcon
                          icon={faVideoSlash}
                          className="text-2xl text-white mb-2"
                        />
                        <p className="text-sm text-white font-medium">
                          Camera Off
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                  <span>You {isScreenSharing && "(Screen)"}</span>
                  {isAudioMuted && (
                    <FontAwesomeIcon
                      icon={faMicrophoneSlash}
                      className="text-red-400"
                    />
                  )}
                </div>
              </div>

              {/* Participants Count & Status */}
              <div className="absolute top-6 left-6">
                <div className="bg-white bg-opacity-90 backdrop-blur text-gray-700 px-4 py-2 rounded-full shadow-lg border border-green-100">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="mr-2 text-green-500"
                  />
                  <span className="font-medium">
                    {remoteUsers.length + 1} participants
                  </span>
                </div>
              </div>

              {/* Expert Badge */}
              <div className="absolute top-6 right-6">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  Expert Mode
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                {/* Audio Toggle */}
                <button
                  onClick={toggleAudio}
                  disabled={!localAudioTrack}
                  className={`w-14 h-14 rounded-full transition-all duration-200 shadow-lg ${
                    isAudioMuted
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon
                    icon={isAudioMuted ? faMicrophoneSlash : faMicrophone}
                  />
                </button>

                {/* Video Toggle */}
                <button
                  onClick={toggleVideo}
                  disabled={!localVideoTrack}
                  className={`w-14 h-14 rounded-full transition-all duration-200 shadow-lg ${
                    isVideoMuted
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon
                    icon={isVideoMuted ? faVideoSlash : faVideo}
                  />
                </button>

                {/* Screen Share */}
                <button
                  onClick={toggleScreenShare}
                  disabled={!client || !isJoined}
                  className={`w-14 h-14 rounded-full transition-all duration-200 shadow-lg ${
                    isScreenSharing
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon icon={faDesktop} />
                </button>

                {/* Recording Toggle */}
                <button
                  onClick={toggleRecording}
                  disabled={!isJoined}
                  className={`w-14 h-14 rounded-full transition-all duration-200 shadow-lg ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon
                    icon={isRecording ? faPause : faRecordVinyl}
                  />
                </button>

                {/* Volume Control */}
                <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-lg border-2 border-gray-200">
                  <FontAwesomeIcon
                    icon={faVolumeDown}
                    className="text-gray-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) =>
                      handleVolumeChange(parseInt(e.target.value))
                    }
                    className="w-20 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #10B981 0%, #10B981 ${volume}%, #E5E7EB ${volume}%, #E5E7EB 100%)`,
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faVolumeUp}
                    className="text-gray-500"
                  />
                </div>

                {/* End Call */}
                <button
                  onClick={handleEndCall}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg"
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="transform rotate-135"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 text-lg">
                    Session Chat
                  </h4>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-1 rounded-lg text-gray-500 hover:bg-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                        msg.isOwn
                          ? "bg-green-500 text-white rounded-br-sm"
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
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className="text-xs opacity-75 mt-2">
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

              {/* Session Notes */}
              <div className="p-4 border-t border-gray-200 bg-green-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Notes
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add notes about this session..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-3">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl transition-colors shadow-sm"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
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

export default AgoraVideoModal;
