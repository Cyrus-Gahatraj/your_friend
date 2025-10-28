import personasData from "../data/personas.json";

const ChatSidebar = ({ selectedPersona, setSelectedPersona }) => {
  return (
    <aside className="w-1/7 border-r bg-white overflow-y-auto border-gray-300">

      {personasData.personas.map((persona) => (
        <div
          key={persona.id}
          onClick={() => setSelectedPersona(persona)}
          className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition ${
            selectedPersona?.id === persona.id ? "bg-gray-100" : ""
          }`}
        >
          <img
            src={persona.avatar}
            alt={persona.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{persona.name}</p>

          </div>
        </div>
      ))}
    </aside>
  );
};

export default ChatSidebar;
