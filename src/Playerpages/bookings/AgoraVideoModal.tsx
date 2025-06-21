import React, { useState, useEffect, useRef } from "react";
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
  faCog,
  faDesktop,
  faUsers,
  faComments,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: string;
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

const AgoraVideoModal: React.FC<AgoraVideoModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [volume, setVolume] = useState(50);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const screenTrackRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentUser = localStorage.getItem("userId") || "22951a3363";

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  useEffect(() => {
    if (isOpen && booking.agora) {
      initializeAgora();
    }
    return () => {
      cleanupAgora();
    };
  }, [isOpen, booking]);

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

  const initializeAgora = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        try {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            setRemoteUsers((prev) => {
              const existing = prev.find((u) => u.uid === user.uid);
              if (existing) {
                return prev.map((u) =>
                  u.uid === user.uid
                    ? { ...u, hasVideo: true, videoTrack: user.videoTrack }
                    : u
                );
              }
              return [
                ...prev,
                {
                  uid: user.uid,
                  hasVideo: true,
                  hasAudio: false,
                  videoTrack: user.videoTrack,
                  audioTrack: null,
                },
              ];
            });

            if (remoteVideoRef.current) {
              user.videoTrack.play(remoteVideoRef.current);
            }
          }

          if (mediaType === "audio") {
            setRemoteUsers((prev) => {
              const existing = prev.find((u) => u.uid === user.uid);
              if (existing) {
                return prev.map((u) =>
                  u.uid === user.uid
                    ? { ...u, hasAudio: true, audioTrack: user.audioTrack }
                    : u
                );
              }
              return [
                ...prev,
                {
                  uid: user.uid,
                  hasVideo: false,
                  hasAudio: true,
                  videoTrack: null,
                  audioTrack: user.audioTrack,
                },
              ];
            });

            user.audioTrack.setVolume(volume);
            user.audioTrack.play();
          }
        } catch (error) {
          console.error("Error subscribing to user:", error);
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          setRemoteUsers((prev) =>
            prev.map((u) =>
              u.uid === user.uid
                ? { ...u, hasVideo: false, videoTrack: null }
                : u
            )
          );
        }
        if (mediaType === "audio") {
          setRemoteUsers((prev) =>
            prev.map((u) =>
              u.uid === user.uid
                ? { ...u, hasAudio: false, audioTrack: null }
                : u
            )
          );
        }
      });

      client.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        booking.agora.channel,
        booking.agora.token,
        booking.agora.uid
      );

      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
        }),
        AgoraRTC.createCameraVideoTrack({
          encoderConfig: "720p_1",
        }),
      ]);

      localAudioTrackRef.current = audioTrack;
      localVideoTrackRef.current = videoTrack;

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await client.publish([audioTrack, videoTrack]);

      setIsConnected(true);
      setIsConnecting(false);

      addChatMessage("System", "Connected to the meeting", false);
    } catch (error) {
      console.error("Failed to initialize Agora:", error);
      setConnectionError("Failed to connect to the meeting. Please try again.");
      setIsConnecting(false);
    }
  };

  const cleanupAgora = async () => {
    if (agoraClientRef.current) {
      try {
        if (localAudioTrackRef.current) {
          localAudioTrackRef.current.close();
        }
        if (localVideoTrackRef.current) {
          localVideoTrackRef.current.close();
        }
        if (screenTrackRef.current) {
          screenTrackRef.current.close();
        }
        await agoraClientRef.current.leave();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    }
    setIsConnected(false);
    setRemoteUsers([]);
    setCallDuration(0);
  };

  const toggleAudio = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setMuted(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setMuted(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const toggleScreenShare = async () => {
    if (!agoraClientRef.current) return;

    try {
      if (!isScreenSharing) {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: "1080p_1",
        });

        screenTrackRef.current = screenTrack;

        if (localVideoTrackRef.current) {
          await agoraClientRef.current.unpublish(localVideoTrackRef.current);
        }

        await agoraClientRef.current.publish(screenTrack);

        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current);
        }

        setIsScreenSharing(true);
        addChatMessage("System", "Screen sharing started", false);

        screenTrack.on("track-ended", () => {
          stopScreenShare();
        });
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  const stopScreenShare = async () => {
    if (screenTrackRef.current && agoraClientRef.current) {
      try {
        await agoraClientRef.current.unpublish(screenTrackRef.current);
        screenTrackRef.current.close();
        screenTrackRef.current = null;

        if (localVideoTrackRef.current) {
          await agoraClientRef.current.publish(localVideoTrackRef.current);
          if (localVideoRef.current) {
            localVideoTrackRef.current.play(localVideoRef.current);
          }
        }

        setIsScreenSharing(false);
        addChatMessage("System", "Screen sharing stopped", false);
      } catch (error) {
        console.error("Error stopping screen share:", error);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
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
    }
  };

  const handleEndCall = async () => {
    await cleanupAgora();
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isFullscreen
            ? "w-screen h-screen max-w-none max-h-none"
            : "max-w-6xl max-h-[90vh]"
        } p-0 overflow-hidden`}
        ref={modalRef}
      >
        <div className="flex flex-col h-full bg-gray-900 text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <img
                src={booking.expert.photo}
                alt={booking.expert.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">
                  {booking.service.service.name}
                </h3>
                <p className="text-sm text-gray-300">
                  with {booking.expert.username}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected && (
                <Badge className="bg-green-600 text-white">
                  {formatDuration(callDuration)}
                </Badge>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                  className="text-white hover:bg-gray-700"
                >
                  <FontAwesomeIcon icon={faComments} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-gray-700"
                >
                  <FontAwesomeIcon
                    icon={isFullscreen ? faCompress : faExpand}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          {(isConnecting || connectionError) && (
            <div className="p-4 bg-blue-900 border-b border-gray-700">
              {isConnecting && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting to meeting...</span>
                </div>
              )}
              {connectionError && (
                <div className="flex items-center space-x-2 text-red-300">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>{connectionError}</span>
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Video Area */}
            <div
              className={`${
                showChat ? "flex-1" : "w-full"
              } flex flex-col relative`}
            >
              {/* Remote Video */}
              <div className="flex-1 relative bg-black">
                <div
                  ref={remoteVideoRef}
                  className="w-full h-full flex items-center justify-center"
                >
                  {remoteUsers.length === 0 ? (
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faUsers} className="text-2xl" />
                      </div>
                      <p className="text-gray-300">
                        Waiting for {booking.expert.username} to join...
                      </p>
                    </div>
                  ) : (
                    remoteUsers.map(
                      (user) =>
                        !user.hasVideo && (
                          <div key={user.uid} className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center mx-auto mb-4">
                              <FontAwesomeIcon
                                icon={faVideo}
                                className="text-2xl"
                              />
                            </div>
                            <p className="text-gray-300">
                              {booking.expert.username}
                            </p>
                          </div>
                        )
                    )
                  )}
                </div>

                {/* Local Video (Picture in Picture) */}
                <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
                  <div ref={localVideoRef} className="w-full h-full relative">
                    {isVideoMuted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                        <FontAwesomeIcon
                          icon={faVideoSlash}
                          className="text-2xl text-gray-400"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Participants Count */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-black bg-opacity-50 text-white">
                    <FontAwesomeIcon icon={faUsers} className="mr-2" />
                    {remoteUsers.length + 1} participants
                  </Badge>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex items-center justify-center space-x-4">
                  {/* Audio Toggle */}
                  <Button
                    onClick={toggleAudio}
                    className={`w-12 h-12 rounded-full ${
                      isAudioMuted
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isAudioMuted ? faMicrophoneSlash : faMicrophone}
                    />
                  </Button>

                  {/* Video Toggle */}
                  <Button
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full ${
                      isVideoMuted
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isVideoMuted ? faVideoSlash : faVideo}
                    />
                  </Button>

                  {/* Screen Share */}
                  <Button
                    onClick={toggleScreenShare}
                    className={`w-12 h-12 rounded-full ${
                      isScreenSharing
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon icon={faDesktop} />
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon
                      icon={faVolumeDown}
                      className="text-gray-400"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) =>
                        handleVolumeChange(parseInt(e.target.value))
                      }
                      className="w-20 slider"
                    />
                    <FontAwesomeIcon
                      icon={faVolumeUp}
                      className="text-gray-400"
                    />
                  </div>

                  {/* End Call */}
                  <Button
                    onClick={handleEndCall}
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700"
                  >
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="transform rotate-135"
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700">
                  <h4 className="font-semibold">Meeting Chat</h4>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.isOwn
                            ? "bg-blue-600 text-white"
                            : msg.sender === "System"
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {!msg.isOwn && msg.sender !== "System" && (
                          <p className="text-xs text-gray-300 mb-1">
                            {msg.sender}
                          </p>
                        )}
                        <p className="text-sm">{msg.message}</p>
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

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgoraVideoModal;
