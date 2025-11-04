import { useState, useEffect, useRef } from "react";
import personaService from "../services/personaService";

const ChatMessages = ({ messages, selectedPersona, setMessages }) => {
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState({});
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Load chat history when persona changes
  useEffect(() => {
    if (selectedPersona && !historyLoaded[selectedPersona.id]) {
      loadChatHistory();
    }
  }, [selectedPersona]);

  // Scroll to bottom when messages or persona changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedPersona]);

  const loadChatHistory = async () => {
    if (!selectedPersona) return;

    setLoading(true);
    try {
      let history;
      if (selectedPersona.isCustom) {
        history = await personaService.getChatHistory(null, selectedPersona.id);
      } else {
        history = await personaService.getChatHistory(
          selectedPersona.name,
          null
        );
      }

      // Convert history format to match local messages format
      const formattedMessages = history.history.map((msg) => ({
        sender: msg.from === "AI" ? selectedPersona.name : "You",
        text: msg.content,
        timestamp: msg.timestamp,
      }));
      setMessages((prev) => ({
        ...prev,
        [selectedPersona.id]: formattedMessages,
      }));

      setHistoryLoaded((prev) => ({
        ...prev,
        [selectedPersona.id]: true,
      }));
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Don't show error to user for history loading - just continue with empty chat
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !messages[selectedPersona?.id]?.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading conversation...</p>
          <p className="text-gray-400 text-sm mt-1">
            Retrieving your chat history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Welcome message for empty chat */}
        {(!messages[selectedPersona?.id] ||
          messages[selectedPersona?.id].length === 0) &&
          !loading && (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Say hello to {selectedPersona?.name} to begin your chat.
                They're excited to talk with you!
              </p>
            </div>
          )}

        {/* Messages */}
        {(messages[selectedPersona?.id] || []).map((msg, i) => {
          const isUser = msg.sender === "You";
          const showTimestamp =
            i === 0 ||
            i === messages[selectedPersona?.id].length - 1 ||
            (i > 0 &&
              messages[selectedPersona?.id][i - 1].sender !== msg.sender);

          return (
            <div key={i} className="animate-slideIn">
              {/* Message bubble */}
              <div
                className={`flex items-end gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar for AI messages */}
                {!isUser && (
                  <div className="flex-shrink-0 mb-1">
                    <img
                      src={
                        selectedPersona?.avatar ||
                        "/avatars/default-custom.png"
                      }
                      alt={selectedPersona?.name}
                      className="w-8 h-8 rounded-full avatar shadow-sm"
                    />
                  </div>
                )}

                {/* Message content */}
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg group ${
                    isUser ? "items-end" : "items-start"
                  } flex flex-col`}
                >
                  <div
                    className={`message-bubble transition-all duration-200 hover:shadow-md ${
                      isUser ? "message-bubble-user" : "message-bubble-ai"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  </div>

                  {/* Timestamp */}
                  {showTimestamp && msg.timestamp && (
                    <p
                      className={`text-xs text-gray-400 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isUser ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  )}
                </div>

                {/* Spacing for user messages */}
                {isUser && <div className="flex-shrink-0 w-8"></div>}
              </div>
            </div>
          );
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;