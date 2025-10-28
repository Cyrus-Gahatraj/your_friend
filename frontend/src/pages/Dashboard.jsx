import { useState, useEffect } from "react";
import Header from "../components/Header";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessages from "../components/ChatMessages";
import ChatInputBox from "../components/ChatInputBox";

export default function Dashboard() {
  const [selectedPersona, setSelectedPersona] = useState(null);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved ? JSON.parse(saved) : {};
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          selectedPersona={selectedPersona}
          setSelectedPersona={setSelectedPersona}
        />

        {/* Chat Window */}
        <section className="flex-1 flex flex-col bg-white">
          {selectedPersona ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-300 bg-white">
                <img
                  src={selectedPersona.avatar}
                  alt={selectedPersona.name}
                  className="w-10 h-10 rounded-full"
                />
                <h2 className="text-lg font-semibold">
                  {selectedPersona.name}
                </h2>
              </div>

             {/* Messages */}
              <ChatMessages messages={messages} selectedPersona={selectedPersona}/>

              {/* Input Box */}
              <ChatInputBox input={input} setInput={setInput} selectedPersona={selectedPersona} setMessages={setMessages}/>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a friend to start chatting
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
