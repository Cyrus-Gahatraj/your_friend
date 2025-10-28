import api from "../api";
import { useAuth } from "../context/Auth";

const ChatInputBox = ({ input, setInput, selectedPersona, setMessages }) => {
  const { auth } = useAuth();

  const handleSend = async () => {
    if (!input.trim() || !selectedPersona) return;

    const userMsg = {
      sender: "You",
      text: input.trim(),
    };


    setMessages((prev) => ({
      ...prev,
      [selectedPersona.id]: [...(prev[selectedPersona.id] || []), userMsg],
    }));
    setInput("");

    try {
      const res = await api.post(
        "/ai/chat",
        {
          message: input,
          persona: selectedPersona.name,
        },
        {
          headers: { Authorization: `Bearer ${auth.access}` },
        }
      );
      console.log(res)

      const aiMsg = {
        sender: selectedPersona.name,
        text: res.data.ai_response || "No response received.",
      };

      setMessages((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), aiMsg],
      }));
      
    } catch (err) {
      console.error("Chat send error:", err);
      const errorMsg = {
        sender: "System",
        text: "⚠️ Failed to get response from server.",
      };
      setMessages((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), errorMsg],
      }));
    }
  };

  return (
    <div className="p-5 flex items-center gap-3 border-t border-gray-200">
      <input
        type="text"
        placeholder={`Message ${selectedPersona.name}...`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleSend}
        className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInputBox;
