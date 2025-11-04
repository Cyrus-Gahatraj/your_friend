import personasData from "../data/personas.json";

const ChatSidebar = ({ selectedPersona, setSelectedPersona, onClose, onShowPersonaManager }) => {
 
  const handlePersonaSelect = (persona) => {
    setSelectedPersona(persona);
  };

  const isPersonaSelected = (persona, isCustom = false) => {
    if (!selectedPersona) return false;
    if (isCustom && selectedPersona.isCustom) {
      return selectedPersona.id === persona.id;
    }
    if (!isCustom && !selectedPersona.isCustom) {
      return selectedPersona.id === persona.id;
    }
    return false;
  };


  return (
    <aside className="w-80 h-full border-r bg-white border-gray-200 flex flex-col shadow-sm overflow-y-auto">

      {/* Default Personas Section */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Friends</h3>
          <button
            onClick={onShowPersonaManager}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage
          </button>
        </div>
      </div>
      <div className="max-h-full overflow-y-auto">
        {personasData.personas.map((persona) => (
          <div
            key={persona.id}
            onClick={() => handlePersonaSelect({ ...persona, isCustom: false })}
            className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 border-b border-gray-50 hover-lift ${
              isPersonaSelected(persona, false)
                ? "bg-blue-50 border-blue-100 shadow-sm"
                : ""
            }`}
          >
            <div className="relative">
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-12 h-12 rounded-full avatar shadow-sm"
                onError={(e) => {
                  e.target.src = "/avatars/default.png";
                }}
              />
 
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {persona.name}
              </p>
              <p className="text-xs text-gray-500">AI Assistant</p>
            </div>
            {isPersonaSelected(persona, false) && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ChatSidebar;
