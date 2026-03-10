import { motion, AnimatePresence } from "motion/react";
import { User, Bot, ChevronDown, Loader2, Send, Headset } from "lucide-react";

const ChatBot = ({
  messages,
  handleToggleIsOpen,
  isLoading,
  messagesEndRef,
  handleSend,
  input,
  setInput,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        y: 20,
        transformOrigin: "bottom right",
      }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden z-50 max-sm:w-[calc(100vw-3rem)] max-sm:h-[calc(100vh-8rem)]"
    >
      {/* Header */}
      <div className="p-4 bg-[#6a008e] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Assistant</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                Online
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleToggleIsOpen}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-2 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === "user" ? "bg-white border border-[#6a008e] text-[#6a008e]" : "bg-[#6a008e] text-white"}`}
              >
                {msg.sender === "user" ? (
                  <User size={14} />
                ) : msg.sender === "bot" ? (
                  <Bot size={14} />
                ) : msg.sender === "agent" ? (
                  <Headset size={14} />
                ) : null}
              </div>
              {msg.sender === "system" ? (
                <div className="p-3 text-sm w-full text-center bg-transparent italic text-slate-400">
                  {msg.text.join("")}
                </div>
              ) : (
                <div className="space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-whitesmoke border border-neutral-200 text-neutral-800 rounded-tr-none shadow-sm"
                        : "bg-[#6a008e] text-white rounded-tl-none"
                    }`}
                  >
                    {msg.text.map((val, ind) => (
                      <p
                        key={ind}
                        className="whitespace-pre-wrap leading-relaxed"
                      >
                        {val}
                      </p>
                    ))}
                  </div>
                  <div
                    className={`text-[10px] text-neutral-400 px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.source && (
                      <span className="ml-2 italic">via {msg.source}</span>
                    )}
                  </div>

                  {msg.custom_payloads.length > 0 && (
                    <div className="flex gap-0 md:gap-2 flex-wrap">
                      {msg.custom_payloads.map((val, ind) => (
                        <span
                          key={ind}
                          className="chip cursor-pointer border border-[#6a008e] shadow-lg hover:bg-gray-200 text-[#6a008e] font-semibold"
                          onClick={() => handleSend(val.stringValue)}
                        >
                          <span className="text-xs md:text-md">
                            {val.stringValue}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-[#6a008e] border border-[#6a008e] text-white flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-[#6a008e] border border-neutral-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 size={16} className="animate-spin text-neutral-400" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 bg-white border-t border-neutral-100 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#6a008e] transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-neutral-900 text-white p-2 rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
};

export default ChatBot;
