const ChatMessages = ({ messages, selectedPersona }) => {

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {(messages[selectedPersona?.id] || []).map(
        ( msg, i ) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2  rounded-3xl max-w-xs ${
                msg.sender === "You"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
              <div className="text-[10px] text-right"></div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ChatMessages;
