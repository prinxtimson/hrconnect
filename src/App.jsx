import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ChatBot from "react-chatbotify";

import "./App.css";

import { getCurrentUser } from "./features/auth/authSlice";

import GuestRoute from "./utils/GuestRoute";
import AuthRoute from "./utils/AuthRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { searchLeaveBalance } from "./lib/appwrite";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const App = () => {
  const [sessionId] = useState(crypto.randomUUID());

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, []);

  const flow = {
    start: {
      message:
        "Hi! I'm Emily, HR Connect AI virtual assistant. How can I assist you?",
      path: "loop",
    },
    loop: {
      message: "",
      options: async (params) => {
        const userMessage = params.userInput;
        let botResponse = "";

        try {
          const response = await fetch(`${API_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage, sessionId }),
          });

          const data = await response.json();
          if (data.error) return data.error;
          let optionsArr =
            data
              .find((val) => val.message == "payload")
              ?.payload?.fields?.options.listValue.values.map(
                (val) => val.stringValue,
              ) || [];

          data
            .filter((val) => val.message == "text")
            .map((msg) => {
              botResponse = botResponse + `${msg.text.text[0]}\n`;
            });

          await params.injectMessage(botResponse);

          return optionsArr;
        } catch (error) {
          console.error("Chat Error:", error);
          await params.injectMessage(
            "Sorry, I'm having trouble connecting to the chat service.",
          );
          return [];
        }
      },
      path: (params) => {
        if (params.userInput === "Annual leave") return "leave_balance";
        if (params.userInput === "Sick Leave") return "leave_balance";
        if (params.userInput === "Maternity/Paternity Leave")
          return "leave_balance";
        return "loop";
      },
    },
    leave_balance: {
      message: async (params) => {
        const userMessage = params.userInput;
        let botResponse = "";

        try {
          const { rows } = await searchLeaveBalance({
            userId: user.id,
            leaveType: userMessage,
          });
          rows.map((row) => {
            botResponse =
              botResponse +
              `You have ${row.balanceDays} days ${userMessage} left for the year.\n`;
          });

          return botResponse;
        } catch (error) {
          console.error("Chat Error:", error);
          return "Sorry, I'm having trouble connecting to the chat service.";
        }
      },
      options: (params) => [
        `Book your ${params.userInput}`,
        "Return to the main menu",
      ],
      path: "loop",
    },
  };

  const settings = {
    general: {
      showIcon: false,
    },
    header: {
      title: (
        <div className="flex items-center gap-2">
          <span className="font-semibold">HR Connect</span>
        </div>
      ),
      showAvatar: true,
    },
    botBubble: {
      simStream: true,
      showAvatar: true,
    },
    userBubble: {
      showAvatar: true,
      avatar: "/images/no_img.png",
    },
    chatButton: {
      icon: "/images/bot_img.avif",
    },
    chatWindow: {
      showScrollbar: true,
    },
    theme: {
      primaryColor: "#6a008e",
      //secondaryColor: "#059669",
    },
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
        </Routes>
      </Router>
      {isAuthenticated && <ChatBot flow={flow} settings={settings} />}
    </div>
  );
};

export default App;
