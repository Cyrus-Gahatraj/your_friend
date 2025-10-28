const ChatHeader = ({selectedPersona}) => {
    return (
      <div className="flex items-center gap-3 p-4 border-b border-gray-300 bg-white">
        <img
          src={selectedPersona.avatar}
          alt={selectedPersona.name}
          className="w-10 h-10 rounded-full"
        />
        <h2 className="text-lg font-semibold">{selectedPersona.name}</h2>
      </div>
    );
}

export default ChatHeader;