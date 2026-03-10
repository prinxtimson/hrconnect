import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { Bot, MessageSquare, Send, User } from "lucide-react";
import MainContainer from "../../layouts/MainContainer";

const socket = io();

const index = () => {
  const toastRef = useRef(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("agent_join");

    socket.on("active_sessions", (sessions) => {
      setActiveSessions(
        sessions.map((s) => ({
          ...s,
          messages: s.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        })),
      );
    });

    socket.on("agent_transfer_requested", (data) => {
      // In a real app, we'd fetch the session details. For now, we wait for the next message or refresh.
      console.log("New transfer requested:", data.sessionId);
    });

    socket.on("new_message", (data) => {
      setActiveSessions((prev) =>
        prev.map((s) => {
          if (s.sessionId === data.sessionId) {
            return {
              ...s,
              messages: [
                ...s.messages,
                {
                  ...data.message,
                  timestamp: new Date(data.message.timestamp),
                },
              ],
            };
          }
          return s;
        }),
      );
    });

    socket.on("bot_response", (msg) => {
      // If the agent themselves sent it, it will come back here via the room broadcast
      // We handle it by updating the active sessions
      setActiveSessions((prev) =>
        prev.map((s) => {
          // We don't have the sessionId in the bot_response event easily here without room logic
          // But for this demo, we can assume the server broadcasts to the room
          return s;
        }),
      );
    });

    return () => {
      socket.off("active_sessions");
      socket.off("agent_transfer_requested");
      socket.off("new_message");
      socket.off("bot_response");
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedSessionId, activeSessions]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedSessionId) return;

    socket.emit("agent_message", {
      sessionId: selectedSessionId,
      message: input,
    });

    // Optimistically update UI
    setActiveSessions((prev) =>
      prev.map((s) => {
        if (s.sessionId === selectedSessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                id: Date.now().toString(),
                text: input,
                sender: "bot",
                timestamp: new Date(),
                source: "Human Agent",
              },
            ],
          };
        }
        return s;
      }),
    );

    setInput("");
  };

  const selectedSession = activeSessions.find(
    (s) => s.sessionId === selectedSessionId,
  );

  return (
    <MainContainer toast={toastRef}>
      <div className="h-full flex flex-col ">
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-neutral-200 flex flex-col">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
              <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                <MessageSquare size={18} /> Active Chats
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeSessions.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-sm italic">
                  No active human requests
                </div>
              ) : (
                activeSessions.map((session) => (
                  <button
                    key={session.sessionId}
                    onClick={() => setSelectedSessionId(session.sessionId)}
                    className={`w-full p-4 text-left border-b border-neutral-100 transition-colors hover:bg-neutral-50 ${
                      selectedSessionId === session.sessionId
                        ? "bg-emerald-50 border-l-4 border-l-emerald-500"
                        : ""
                    }`}
                  >
                    <div className="font-medium text-sm text-neutral-900 truncate">
                      Session: {session.sessionId.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-neutral-500 truncate mt-1">
                      {session.messages[session.messages.length - 1]?.text}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedSession ? (
              <>
                <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">
                        User Session
                      </h3>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                        ID: {selectedSession.sessionId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/30">
                  {selectedSession.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[70%] ${msg.sender === "user" ? "flex-row" : "flex-row-reverse"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === "user" ? "bg-white border border-neutral-200 text-neutral-600" : "bg-emerald-600 text-white"}`}
                        >
                          {msg.sender === "user" ? (
                            <User size={14} />
                          ) : (
                            <Bot size={14} />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`p-3 rounded-2xl text-sm shadow-sm ${
                              msg.sender === "user"
                                ? "bg-white border border-neutral-200 text-neutral-800 rounded-tl-none"
                                : "bg-emerald-600 text-white rounded-tr-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div
                            className={`text-[10px] text-neutral-400 px-1 ${msg.sender === "user" ? "text-left" : "text-right"}`}
                          >
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {msg.source && (
                              <span className="ml-2 italic">
                                via {msg.source}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-neutral-200 bg-white flex gap-3"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response as a human agent..."
                    className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
                  >
                    <Send size={18} /> Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 space-y-4">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
                  <MessageSquare size={40} className="text-neutral-200" />
                </div>
                <p className="text-sm font-medium">
                  Select a session to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default index;
