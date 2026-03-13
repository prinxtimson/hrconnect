import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { socket } from "./lib/socket";
import ChatBot, { useMessages } from "react-chatbotify";

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const App = () => {
  const [sessionId] = useState(crypto.randomUUID());
  //const { injectMessage } = useMessages();
  const [isHumanAgent, setIsHumanAgent] = useState(false);
  const formRef = useRef({});

  // simple helper to update form
  const updateForm = (patch) => {
    Object.assign(formRef.current, patch);
  };

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, []);

  useEffect(() => {
    if (isHumanAgent) {
      socket.connect();
      socket.on("connect", () => {
        socket.emit("escalate", sessionId);
        console.log("Connected to socket server");
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [isHumanAgent]);

  function lowercaseFirstLetter(str) {
    if (!str || typeof str !== "string") {
      return ""; // Handle empty or non-string inputs gracefully
    }
    str = str.replaceAll(" ", "");
    str = str.replace("/Paternity", "");
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

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
        const urlRegex = /https?:\/\/[^\s]+/;

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
              ?.payload?.fields.options.listValue.values.map(
                (val) => val.stringValue,
              ) || [];

          data
            .filter((val) => val.message == "text")
            .map((msg) => {
              botResponse = botResponse + `${msg.text.text[0]}\n`;
            });

          if (urlRegex.test(botResponse)) {
            let txt = botResponse.match(urlRegex);
            let txt2 = botResponse.replace(txt, "");
            await params.injectMessage(
              <div
                className="rcb-bot-message rcb-bot-message-entry"
                style={{
                  backgroundColor: "rgb(73, 29, 141)",
                  color: "rgb(255, 255, 255)",
                  maxWidth: "65%",
                }}
              >
                <span>{txt2}</span>{" "}
                <a href={`${txt}`} target="_blank">
                  {txt}
                </a>
              </div>,
            );
          } else {
            await params.injectMessage(botResponse);
          }

          return optionsArr;
        } catch (error) {
          console.error("Chat Error:", error);
          await params.injectMessage(
            "Sorry, I'm having trouble connecting to the chat service.",
          );
          return [];
        }
      },
      function: (params) => {
        if (params.userInput == "Submit Leave Request") {
          updateForm({ user: user.$id, status: "pending" });
        }

        if (params.userInput.match("Escalate")) {
          setIsHumanAgent(true);
        }
      },
      path: (params) => {
        if (
          params.userInput.toLowerCase().match("annual leave") &&
          params.prevPath == "loop"
        )
          return "leave_balance";
        if (
          params.userInput.toLowerCase().match("sick leave") &&
          params.prevPath == "loop"
        )
          return "leave_balance";
        if (
          params.userInput.toLowerCase().match("maternity/paternity leave") &&
          params.prevPath == "loop"
        )
          return "leave_balance";
        if (params.userInput == "Submit Leave Request") return "book_leave";
        if (params.userInput.match("Escalate")) return "human_handover";
        return "loop";
      },
    },
    leave_balance: {
      message: async (params) => {
        const userMessage = lowercaseFirstLetter(params.userInput);
        let botResponse = "";

        try {
          const { rows } = await searchLeaveBalance({
            userId: user.$id,
            leaveType: userMessage,
          });
          rows.map((row) => {
            botResponse =
              botResponse +
              `You have ${row.balanceDays} days ${params.userInput} left for the year.\n`;
          });

          return botResponse;
        } catch (error) {
          console.error("Chat Error:", error);
          return "Sorry, I'm having trouble connecting to the chat service.";
        }
      },
      options: (params) => [`Submit Leave Request`, "Return to Main Menu"],
      function: (params) => {
        if (params.userInput == `Submit Leave Request`) {
          updateForm({ user: user.$id, status: "pending" });
        }
      },
      path: (params) => {
        if (params.userInput == `Submit Leave Request`) return "book_leave";
        return "loop";
      },
    },
    book_leave: {
      message: "Please select from the category below",
      options: ["Annual Leave", "Sick Leave", "Maternity/Paternity Leave"],
      function: (params) =>
        updateForm({ leaveType: lowercaseFirstLetter(params.userInput) }),
      path: (params) => {
        if (params.userInput.toLowerCase().match("annual leave"))
          return "ask_start";
        if (params.userInput.toLowerCase().match("sick leave"))
          return "ask_start";
        if (params.userInput.toLowerCase().match("maternity/paternity leave"))
          return "ask_start";
        return "loop";
      },
    },
    ask_start: {
      message: "Please enter your start date (Format: YYYY-MM-DD)",
      function: (params) => updateForm({ startDate: params.userInput }),
      path: async (params) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.userInput)) {
          await params.injectMessage(
            "Invalid date, please re-enter your start date",
          );
          return;
        }
        const date = new Date(params.userInput);
        if (isNaN(date.getTime())) {
          await params.injectMessage(
            "Invalid date, please re-enter your start date",
          );
          return;
        }
        return "ask_end";
      },
    },
    ask_end: {
      message: "Please enter your end date (Format: YYYY-MM-DD)",
      function: (params) => updateForm({ endDate: params.userInput }),
      path: async (params) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.userInput)) {
          await params.injectMessage(
            "Invalid date, please re-enter your end date",
          );
          return;
        }
        const date = new Date(params.userInput);
        if (isNaN(date.getTime())) {
          await params.injectMessage(
            "Invalid date, please re-enter your end date",
          );
          return;
        }
        return "submit_leave";
      },
    },
    submit_leave: {
      message: async () => {
        const form = formRef.current;
        try {
          await submitLeaveApplication(form);
          return "Leave application submitted successfully";
        } catch (error) {
          console.error("Chat Error:", error);
          return "Sorry, I'm having trouble connecting to the chat service.";
        }
      },
      options: ["Leave Management", "Return to Main Menu"],
      path: "loop",
    },
    human_handover: {
      message: async (params) => {
        socket.on("agent_connected", async (msg) => {
          console.log("agent_connected");
          await params.injectMessage("Connected to an agent.. ");
        });

        socket.on("new_message", async (data) => {
          await params.injectMessage(data.message.text);
        });
      },
      function: (params) => {
        console.log("human handover");
        socket.emit("send_message", {
          id: Date.now().toString(),
          sessionId,
          text: params.userInput,
          sender: "user",
          timestamp: new Date(),
        });
      },
      path: "human_handover",
    },
    // human_chat: {
    //   message: async (params) => {
    //     socket.emit("user_message", {
    //       sessionId,
    //       message: params.userInput,
    //       sender: "user",
    //     });

    //     socket.on("new_message", async (msg) => {
    //       await params.injectMessage(msg.text);
    //     });
    //   },
    //   path: "human_chat",
    // },
    unknown_input: {
      message: "I didn't get that. Can you say it again?",
      options: ["Escalate", "Return to Main Menu"],
      path: (params) => {
        if (params.userInput.match("Escalate")) return "human_handover";
        return "loop";
      },
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
      {isAuthenticated && <ChatBot flow={flow} settings={settings} />}
    </div>
  );
};

export default App;
