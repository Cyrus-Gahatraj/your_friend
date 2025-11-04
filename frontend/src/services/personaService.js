import api from "../api.jsx";

export const personaService = {
  // Get all custom personas for the current user
  async getCustomPersonas(includeInactive = false) {
    try {
      const response = await api.get("/personas/", {
        params: { include_inactive: includeInactive },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching custom personas:", error);
      throw error;
    }
  },

  // Get a specific custom persona by ID
  async getCustomPersona(personaId) {
    try {
      const response = await api.get(`/personas/${personaId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching custom persona:", error);
      throw error;
    }
  },

  // Create a new custom persona
  async createCustomPersona(personaData) {
    try {
      console.log("=== PERSONA SERVICE DEBUG ===");
      console.log(
        "personaService.createCustomPersona called with:",
        JSON.stringify(personaData, null, 2),
      );
      console.log("Sending request to:", "/personas/");

      // Check authentication token
      const token = localStorage.getItem("access_token");
      console.log("Auth token available:", !!token);
      console.log(
        "Token preview:",
        token ? `${token.substring(0, 20)}...` : "null",
      );

      // Log request details
      console.log("API base URL:", api.defaults.baseURL);
      console.log("Request headers will include Authorization:", !!token);

      const response = await api.post("/personas/", personaData);

      console.log("=== SUCCESS RESPONSE ===");
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      console.log("Response data:", JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      console.error("=== PERSONA SERVICE ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response statusText:", error.response.statusText);
        console.error("Response headers:", error.response.headers);
        console.error(
          "Response data:",
          JSON.stringify(error.response.data, null, 2),
        );
      } else if (error.request) {
        console.error("Request was made but no response received:");
        console.error("Request details:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }

      console.error("Request config:", error.config);
      console.error("Data being sent:", JSON.stringify(personaData, null, 2));

      throw error;
    }
  },

  // Update an existing custom persona
  async updateCustomPersona(personaId, personaData) {
    try {
      console.log(
        "personaService.updateCustomPersona called with ID:",
        personaId,
      );
      console.log("personaService.updateCustomPersona data:", personaData);

      const response = await api.put(`/personas/${personaId}`, personaData);
      console.log("personaService.updateCustomPersona response:", response);

      return response.data;
    } catch (error) {
      console.error("Error updating custom persona:", error);
      console.error("Error response:", error.response);
      throw error;
    }
  },

  // Delete (soft delete) a custom persona
  async deleteCustomPersona(personaId) {
    try {
      const response = await api.delete(`/personas/${personaId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting custom persona:", error);
      throw error;
    }
  },

  // Activate a previously deleted custom persona
  async activateCustomPersona(personaId) {
    try {
      const response = await api.post(`/personas/${personaId}/activate`);
      return response.data;
    } catch (error) {
      console.error("Error activating custom persona:", error);
      throw error;
    }
  },

  // Send message to AI (with custom persona support)
  async sendMessage(message, persona = null, customPersonaId = null) {
    try {
      const params = {};
      if (customPersonaId) {
        params.custom_persona_id = customPersonaId;
      }

      const response = await api.post(
        "/ai/chat",
        {
          message,
          persona: persona || "Alice", // fallback to default
        },
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Get chat history (with custom persona support)
  async getChatHistory(
    persona = null,
    customPersonaId = null,
    sessionId = null,
  ) {
    try {
      const params = {};
      if (customPersonaId) {
        params.custom_persona_id = customPersonaId;
      }
      if (persona) {
        params.persona = persona;
      }
      if (sessionId) {
        params.session_id = sessionId;
      }

      const response = await api.get("/ai/history", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  },
};

export default personaService;
