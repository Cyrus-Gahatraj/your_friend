import { useState } from "react";
import { useAuth } from "../context/Auth";
import personaService from "../services/personaService";

const ChatInputBox = ({ input, setInput, selectedPersona, setMessages }) => {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // If you need typing indicator

  const handleSend = async () => {
    if (!input.trim() || !selectedPersona) return;

    const userMsg = {
      sender: "You",
      text: input.trim(),
      timestamp: new Date().toISOString(), // Added timestamp for consistency
    };

    // Update messages with user message
    setMessages((prev) => ({
      ...prev,
      [selectedPersona.id]: [...(prev[selectedPersona.id] || []), userMsg],
    }));
    setInput("");
    setIsSending(true);

    try {
      let res;
      if (selectedPersona.isCustom) {
        // Use custom persona
        res = await personaService.sendMessage(
          input,
          null, // no default persona
          selectedPersona.id, // custom persona ID
        );
      } else {
        // Use default persona
        res = await personaService.sendMessage(
          input,
          selectedPersona.name, // default persona name
          null, // no custom persona ID
        );
      }
      console.log(res);

      const aiMsg = {
        sender: selectedPersona.name,
        text: res.ai_response || "No response received.",
        timestamp: new Date().toISOString(),
      };

      // Update messages with AI response
      setMessages((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), aiMsg],
      }));
    } catch (err) {
      console.error("Chat send error:", err);
      const errorMsg = {
        sender: "System",
        text: "⚠️ Failed to get response from server.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), errorMsg],
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          {/* Input container */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all duration-200 shadow-sm hover:shadow-md">

              {/* Input field */}
              <textarea
                rows={1}
                placeholder={`Message ${selectedPersona?.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                className="flex-1 px-4 py-3 bg-transparent border-0 outline-none resize-none max-h-32 placeholder-gray-500 disabled:opacity-50"
                style={{
                  minHeight: "24px",
                  lineHeight: "24px",
                }}
              />

              {/* Character count (when approaching limit) */}
              {input.length > 900 && (
                <div
                  className={`px-2 text-xs ${input.length > 1000 ? "text-red-500" : "text-yellow-500"}`}
                >
                  {input.length}/1000
                </div>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className={`m-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-sm ${
                  input.trim() && !isSending
                    ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                title={isSending ? "Sending..." : "Send message"}
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Typing indicator - remove if not needed */}
            {isTyping && (
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span>{selectedPersona?.name} is typing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Input hints */}
        <div className="flex items-center justify-between mt-2 px-2 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ChatInputBox;