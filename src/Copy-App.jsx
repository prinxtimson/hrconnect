import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import "./App.css";

import { getCurrentUser } from "./features/auth/authSlice";
import { searchLeaveBalance, submitLeaveApplication } from "./lib/appwrite";

import GuestRoute from "./utils/GuestRoute";
import AuthRoute from "./utils/AuthRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import LeaveManagement from "./pages/LeaveManagement";
import ChatAgent from "./pages/ChatAgent";
import { AnimatePresence } from "motion/react";
import ChatBot from "./components/ChatBot";
import { MessageCircle, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const socket = io();

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(crypto.randomUUID());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: [
        "Hi! I'm Emily, HR Connect AI virtual assistant. How can I assist you?",
      ],
      sender: "bot",
      intent: null,
      custom_payloads: [],
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackCount, setFallbackCount] = useState(0);
  const [prevIntent, setPrevIntent] = useState("welcome");
  const [sessionState, setSessionState] = useState("BOT");
  const [pendingMedia, setPendingMedia] = useState(null);
  const [fileError, setFileError] = useState(null);
  const messagesEndRef = useRef(null);
  const formRef = useRef({});
  const fileInputRef = useRef(null);

  // simple helper to update form
  const updateForm = (patch) => {
    Object.assign(formRef.current, patch);
  };

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
    let uid = localStorage.getItem("chat_session_id");
    if (!uid) {
      uid = uuidv4();
      localStorage.setItem("chat_session_id", uid);
    }
    setSessionId(uid);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    socket.emit("join_session", sessionId);

    socket.on("agent_response", (msg) => {
      setMessages((prev) => [
        ...prev,
        { ...msg, timestamp: new Date(msg.timestamp) },
      ]);
      setIsLoading(false);
    });

    return () => {
      socket.off("agent_response");
    };
  }, [sessionId]);

  function lowercaseFirstLetter(str) {
    if (!str || typeof str !== "string") {
      return ""; // Handle empty or non-string inputs gracefully
    }
    str = str.replaceAll(" ", "");
    str = str.replace("/Paternity", "");
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  const handleSend = async (payload) => {
    if (!payload.trim() || isLoading) return;

    let count = fallbackCount;

    const userMessage = {
      id: `temp-${Date.now()}`,
      text: [payload],
      sender: "user",
      intent: null,
      custom_payloads: [],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (sessionState === "BOT") {
      try {
        if (prevIntent == "leave_balance_intent") {
          const { rows } = await searchLeaveBalance({
            userId: user.$id,
            leaveType: lowercaseFirstLetter(payload),
          });

          const botMessage = {
            id: `bot-${Date.now()}`,
            text: rows.map(
              (row) =>
                `You have ${row.balanceDays} days ${payload} left for the year.`,
            ),
            sender: "bot",
            custom_payloads: [],
            intent: null,
            timestamp: new Date(),
          };
          setPrevIntent("");
          setMessages((prev) => [...prev, botMessage]);
        } else if (prevIntent == "") {
        } else {
          if (prevIntent == "book_leave_intent") {
          }
          const response = await fetch(`${API_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: payload, sessionId }),
          });

          const data = await response.json();
          const intent = data.intent.displayName;

          if (intent == "Default Fallback Intent") {
            count++;
            setFallbackCount(count);
          } else {
            setFallbackCount(0);
          }

          setPrevIntent(intent);

          const botMessage = {
            id: `bot-${Date.now()}`,
            text: data.fulfillmentMessages
              .filter((val) => val.message == "text")
              ?.map((val) => val.text.text)
              ?.flat() || [
              "I apologize, but I encountered an error. Please try again.",
            ],
            sender: "bot",
            custom_payloads:
              data.fulfillmentMessages.find((val) => val.message == "payload")
                ?.payload?.fields.options.listValue.values || [],
            intent: data?.intent?.displayName || null,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);

          if (intent == "book_leave_intent_end_date") {
            const form = formRef.current;
            await submitLeaveApplication(form);
          }
        }
      } catch (error) {
        console.error("Chat Error:", error);
        const errorMessage = {
          id: `error-${Date.now()}`,
          text: ["Sorry, I encountered an error. Please try again."],
          custom_payloads: [],
          sender: "bot",
          intent: null,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        if (sessionState !== "ESCALATING") {
          if (count > 1) {
            const botMessage = {
              id: `bot-${Date.now()}`,
              text: ["Would you like to try again or speak to a live agent?"],
              sender: "bot",
              custom_payloads: ["Try Again"],
              intent: null,
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
          }
          setIsLoading(false);
        }
      }
    } else if (sessionState === "LIVE_AGENT") {
      // const agentMessage = {
      //   id: `agent-${Date.now()}`,
      //   text: data.response || [
      //     "I apologize, but I encountered an error. Please try again.",
      //   ],
      //   sender: "agent",
      //   custom_payloads: data.custom_payloads,
      //   intent: data.intent.displayName || null,
      //   timestamp: new Date(),
      // };

      // setMessages((prev) => [...prev, agentMessage]);
      socket.emit("user_message", { sessionId, message: payload });
    }
  };

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route path="/password">
            <Route
              path="forgot"
              element={
                <GuestRoute>
                  <ForgotPassword />
                </GuestRoute>
              }
            />
            <Route
              path="reset"
              element={
                <GuestRoute>
                  <ResetPassword />
                </GuestRoute>
              }
            />
          </Route>
          <Route path="/dashboard">
            <Route
              path=""
              element={
                <AuthRoute>
                  <Dashboard />
                </AuthRoute>
              }
            />
            <Route
              path="leave-management"
              element={
                <AuthRoute>
                  <LeaveManagement />
                </AuthRoute>
              }
            />
            <Route
              path="chat-agent"
              element={
                <AuthRoute>
                  <ChatAgent />
                </AuthRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
      {isAuthenticated && (
        <button
          id="chat-toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#6a008e] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 z-50"
        >
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      )}
      <AnimatePresence>
        {isOpen && (
          <ChatBot
            messages={messages}
            handleToggleIsOpen={() => setIsOpen(!isOpen)}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
