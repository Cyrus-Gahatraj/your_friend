import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PersonaModal from "../modals/PersonaModal";
import personaService from "../services/personaService";

const CustomPersonaManager = ({ onPersonaSelect, selectedPersona }) => {
  const [customPersonas, setCustomPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadCustomPersonas();
  }, [showInactive]);

  const loadCustomPersonas = async () => {
    setLoading(true);
    try {
      const response = await personaService.getCustomPersonas(showInactive);
      setCustomPersonas(response.personas);
    } catch (error) {
      console.error("Error loading custom personas:", error);
      toast.error("Failed to load custom personas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePersona = () => {
    setEditingPersona(null);
    setIsModalOpen(true);
  };

  const handleEditPersona = (persona) => {
    setEditingPersona(persona);
    setIsModalOpen(true);
  };

  const handleDeletePersona = async (persona) => {
    if (!window.confirm(`Are you sure you want to delete "${persona.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await personaService.deleteCustomPersona(persona.id);
      toast.success(`${persona.name} has been deleted`);
      loadCustomPersonas();

      // If the deleted persona was selected, deselect it
      if (selectedPersona?.id === persona.id && selectedPersona?.isCustom) {
        onPersonaSelect(null);
      }
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast.error("Failed to delete persona");
    }
  };

  const handleActivatePersona = async (persona) => {
    try {
      await personaService.activateCustomPersona(persona.id);
      toast.success(`${persona.name} has been activated`);
      loadCustomPersonas();
    } catch (error) {
      console.error("Error activating persona:", error);
      toast.error("Failed to activate persona");
    }
  };

  const handlePersonaCreated = (newPersona) => {
    loadCustomPersonas();
  };

  const handlePersonaUpdated = (updatedPersona) => {
    loadCustomPersonas();

    // If the updated persona was selected, update the selection
    if (selectedPersona?.id === updatedPersona.id && selectedPersona?.isCustom) {
      onPersonaSelect({
        id: updatedPersona.id,
        name: updatedPersona.name,
        avatar: updatedPersona.avatar_url || "/avatars/default-custom.png",
        isCustom: true,
      });
    }
  };

  const handlePersonaClick = (persona) => {
    const personaData = {
      id: persona.id,
      name: persona.name,
      avatar: persona.avatar_url || "/avatars/default-custom.png",
      isCustom: true,
    };
    onPersonaSelect(personaData);
  };

  if (loading) {
    return (
      <div className="custom-persona-manager h-full flex flex-col">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading personas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-persona-manager h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            My Custom Friends
          </h3>
          <button
            onClick={handleCreatePersona}
            className="btn-primary text-xs rounded-lg flex items-center gap-1 shadow-sm hover:shadow-md "
            title="Create new custom persona"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New
          </button>
        </div>

        <div className="flex items-center text-xs text-gray-600">
          <label className="flex items-center cursor-pointer hover:text-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2 rounded focus:ring-2 focus:ring-blue-500"
            />
            Show deleted
          </label>
        </div>
      </div>

      {/* Personas List */}
      <div className="flex-1 overflow-y-auto ">
        {customPersonas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 animate-fadeIn">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">No custom personas yet</p>
            <p className="text-xs text-gray-400 mb-4">
              Create your first AI friend to get started
            </p>
            <button
              onClick={handleCreatePersona}
              className="btn-primary text-xs px-4 py-2 shadow-sm"
            >
              Create your first one
            </button>
          </div>
        ) : (
          customPersonas.map((persona) => (
            <div
              key={persona.id}
              className={`group flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 transition-all duration-200 hover-lift animate-slideIn ${
                selectedPersona?.id === persona.id && selectedPersona?.isCustom
                  ? "bg-blue-50 border-blue-100 shadow-sm"
                  : ""
              } ${!persona.is_active ? "opacity-60" : ""}`}
            >
              <div
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => persona.is_active && handlePersonaClick(persona)}
              >
                <div className="relative">
                  <img
                    src={persona.avatar_url || "/avatars/default-custom.png"}
                    alt={persona.name}
                    className="w-10 h-10 rounded-full avatar shadow-sm"
                    onError={(e) => {
                      e.target.src = "/avatars/default-custom.png";
                    }}
                  />
                 
                  {!persona.is_active ? (
                  <div className="absolute inset-0 bg-gray-500 bg-opacity-60 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {persona.name}
                    </p>

                  </div>
                  {persona.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {persona.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!persona.is_active ? (
                  <button
                    onClick={() => handleActivatePersona(persona)}
                    className="text-green-600 hover:bg-green-50 text-xs px-2 py-1 rounded-md transition-colors"
                    title="Activate persona"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditPersona(persona)}
                      className="text-blue-600 hover:bg-blue-50 text-xs px-2 py-1 rounded-md transition-colors"
                      title="Edit persona"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePersona(persona)}
                      className="text-red-600 hover:bg-red-50 text-xs px-2 py-1 rounded-md transition-colors"
                      title="Delete persona"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Persona Modal */}
      <PersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        persona={editingPersona}
        onPersonaCreated={handlePersonaCreated}
        onPersonaUpdated={handlePersonaUpdated}
      />
    </div>
  );
};

export default CustomPersonaManager;