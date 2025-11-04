import { useState, useEffect } from "react";
import Header from "../components/Header";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessages from "../components/ChatMessages";
import ChatInputBox from "../components/ChatInputBox";
import ChatHeader from "../components/ChatHeader";
import CustomPersonaManager from "../components/CustomPersonaManager";

export default function Dashboard() {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showPersonaManager, setShowPersonaManager] = useState(false);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved ? JSON.parse(saved) : {};
  });
  
  const handlePersonaSelect = (persona) => {
    setSelectedPersona(persona);
    setShowPersonaManager(false);
  };

  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  // Close mobile sidebar when persona is selected
  useEffect(() => {
    if (selectedPersona) {
      setIsMobileSidebarOpen(false);
    }
  }, [selectedPersona]);

  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex flex-col overflow-hidden">
      <Header
        onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        selectedPersona={selectedPersona}
        onShowPersonaManager={() => setShowPersonaManager(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            fixed lg:static
            z-50 lg:z-auto
            w-80
            h-full
            transition-transform duration-300 ease-in-out
            flex-shrink-0
          `}
        >
          <ChatSidebar
            selectedPersona={selectedPersona}
            setSelectedPersona={setSelectedPersona}
            onClose={() => setIsMobileSidebarOpen(false)}
            onShowPersonaManager={() => setShowPersonaManager(true)}
          />
        </div>

        {/* Main Chat Area */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
          {showPersonaManager ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Manage Custom Personas
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Create and manage your custom AI friends
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPersonaManager(false)}
                    className="btn-secondary flex items-center gap-2"
                  >
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Chat
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <CustomPersonaManager
                  onPersonaSelect={handlePersonaSelect}
                  selectedPersona={selectedPersona}
                />
              </div>
            </div>
          ) : selectedPersona ? (
            <>
              <ChatHeader selectedPersona={selectedPersona} />
              <ChatMessages
                messages={messages}
                selectedPersona={selectedPersona}
                setMessages={setMessages}
              />
              <div className="border-t border-gray-200 bg-white">
                <ChatInputBox
                  input={input}
                  setInput={setInput}
                  selectedPersona={selectedPersona}
                  setMessages={setMessages}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-blue-600"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Your Friend
                </h3>
                <p className="text-gray-500 mb-6">
                  Choose an AI friend from the sidebar to start an engaging conversation
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="lg:hidden btn-primary px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Choose a Friend
                  </button>
                  <button
                    onClick={() => setShowPersonaManager(true)}
                    className="btn-secondary px-6 py-3"
                  >
                    Manage Custom Personas
                  </button>
                </div>
                <div className="hidden lg:flex items-center justify-center text-sm text-gray-400 mt-4">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"
                    />
                  </svg>
                  Select a friend from the sidebar to begin
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}