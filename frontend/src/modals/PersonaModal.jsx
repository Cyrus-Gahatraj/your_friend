import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import personaService from "../services/personaService";

const PersonaModal = ({
  isOpen,
  onClose,
  personaToEdit = null,
  onPersonaCreated,
  onPersonaUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    system_prompt: "",
    description: "",
    avatar_url: "",
    example_messages: [{ input: "", output: "" }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Initialize form data when modal opens or persona changes
  useEffect(() => {
    if (isOpen) {
      if (personaToEdit) {
        setFormData({
          name: personaToEdit.name || "",
          system_prompt: personaToEdit.system_prompt || "",
          description: personaToEdit.description || "",
          avatar_url: personaToEdit.avatar_url || "",
          example_messages:
            personaToEdit.example_messages?.length > 0
              ? personaToEdit.example_messages
              : [{ input: "", output: "" }],
        });
        setAvatarPreview(personaToEdit.avatar_url || "");
      } else {
        setFormData({
          name: "",
          system_prompt: "",
          description: "",
          avatar_url: "",
          example_messages: [{ input: "", output: "" }],
        });
        setAvatarPreview("");
        setAvatarFile(null);
      }
      setErrors({});
    }
  }, [isOpen, personaToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleExampleMessageChange = (index, field, value) => {
    const newExampleMessages = [...formData.example_messages];
    newExampleMessages[index][field] = value;
    setFormData(prev => ({
      ...prev,
      example_messages: newExampleMessages,
    }));
  };

  const addExampleMessage = () => {
    if (formData.example_messages.length < 20) {
      setFormData((prev) => ({
        ...prev,
        example_messages: [...prev.example_messages, { input: "", output: "" }],
      }));
    }
  };

  const removeExampleMessage = (index) => {
    if (formData.example_messages.length > 1) {
      const newExampleMessages = formData.example_messages.filter(
        (_, i) => i !== index,
      );
      setFormData((prev) => ({
        ...prev,
        example_messages: newExampleMessages,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be 50 characters or less";
    }

    if (!formData.system_prompt.trim()) {
      newErrors.system_prompt = "System prompt is required";
    } else if (formData.system_prompt.length < 10) {
      newErrors.system_prompt = "System prompt must be at least 10 characters";
    } else if (formData.system_prompt.length > 2000) {
      newErrors.system_prompt = "System prompt must be 2000 characters or less";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    // Validate example messages
    formData.example_messages.forEach((msg, index) => {
      if (msg.input.trim() && !msg.output.trim()) {
        newErrors[`example_output_${index}`] =
          "Output is required when input is provided";
      }
      if (!msg.input.trim() && msg.output.trim()) {
        newErrors[`example_input_${index}`] =
          "Input is required when output is provided";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      console.log("Auth token available:", !!token);

      if (!token) {
        toast.error(
          "You must be logged in to create personas. Please log in again.",
        );
        return;
      }
      
      // Filter out empty example messages
      const filteredExampleMessages = formData.example_messages.filter(
        (msg) => msg.input.trim() && msg.output.trim(),
      );

      const submitData = {
        name: formData.name.trim(),
        system_prompt: formData.system_prompt.trim(),
        description: formData.description ? formData.description.trim() : null,
        example_messages: filteredExampleMessages,
      };
      
      console.log("=== PERSONA CREATION DEBUG ===");
      console.log(
        "Submitting persona data:",
        JSON.stringify(submitData, null, 2),
      );

      let result;
      if (personaToEdit) {
        console.log("Updating persona with ID:", personaToEdit.id);
        result = await personaService.updateCustomPersona(
          personaToEdit.id,
          submitData,
          avatarFile
        );
        console.log("Update result:", result);
        toast.success("Custom persona updated successfully!");
        onPersonaUpdated?.(result);
      } else {
        console.log("Creating new persona...");
        result = await personaService.createCustomPersona(
          submitData,
          avatarFile
        );
        console.log("Create result:", result);
        toast.success("Custom persona created successfully!");
        onPersonaCreated?.(result);
      }

      onClose();
    } catch (error) {
      console.error("=== PERSONA CREATION ERROR ===");
      console.error("Full error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      
      if (error.code === "NETWORK_ERROR" || error.message.includes("Network Error")) {
        toast.error("Network error. Please check your connection and try again.");
      } else if (error.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      } else if (error.response?.status === 422) {
        toast.error("Please check your input and try again");
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to save custom persona. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden card-elevated animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {personaToEdit
                  ? "Edit Your Friend"
                  : "Create Your Own Friend"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {personaToEdit
                  ? "Update your friend's Persona"
                  : "Design your perfect AI Persona"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Avatar Upload Section - Centered */}
            <div className="flex flex-col items-center space-y-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Avatar Image
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Optional
                </span>
              </label>

              <div className="flex flex-col items-center gap-4 w-full max-w-md">
                {/* Avatar Preview */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* File Upload Button */}
                <label className="w-full max-w-xs">
                  <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                    <svg
                      className="w-8 h-8 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-600 text-center group-hover:text-blue-600 transition-colors">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-500 transition-colors">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Persona Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={50}
                className={`input text-lg ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Enter persona name (e.g., My Creative Assistant)"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
                <p className="text-gray-400 text-xs ml-auto">
                  {formData.name.length}/50 characters
                </p>
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                Description
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Optional
                </span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={500}
                rows={2}
                className={`input resize-none ${errors.description ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Brief description of your persona's role or purpose"
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
                <p className="text-gray-400 text-xs ml-auto">
                  {formData.description?.length || 0}/500 characters
                </p>
              </div>
            </div>

            {/* System Prompt Field */}
            <div className="space-y-2">
              <label
                htmlFor="system_prompt"
                className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Personality & Behavior *
              </label>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Pro tip: Use #USERNAME to reference the user's name
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Be specific about personality traits, communication style, and areas of expertise
                    </p>
                  </div>
                </div>
              </div>
              <textarea
                id="system_prompt"
                name="system_prompt"
                value={formData.system_prompt}
                onChange={handleInputChange}
                rows={8}
                maxLength={2000}
                className={`input resize-none font-mono text-sm ${errors.system_prompt ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="You are [Name], a [role/personality] AI assistant for #USERNAME. You are [personality traits]. You respond in [communication style] and specialize in [areas of expertise]. You always [behavioral patterns]."
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                {errors.system_prompt && (
                  <p className="text-red-500 text-sm">{errors.system_prompt}</p>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <div
                    className={`w-2 h-2 rounded-full ${formData.system_prompt.length > 1800 ? "bg-red-500" : formData.system_prompt.length > 1500 ? "bg-yellow-500" : "bg-green-500"}`}
                  ></div>
                  <p className="text-gray-500 text-sm">
                    {formData.system_prompt.length}/2000 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Example Messages */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  Example Conversations
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Optional
                  </span>
                </label>
                <button
                  type="button"
                  onClick={addExampleMessage}
                  disabled={formData.example_messages.length >= 20 || isSubmitting}
                  className="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Example
                </button>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {formData.example_messages.map((msg, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover-lift">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200">
                        Example {index + 1}
                      </span>
                      {formData.example_messages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExampleMessage(index)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                          disabled={isSubmitting}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          User says:
                        </label>
                        <input
                          type="text"
                          value={msg.input}
                          onChange={(e) =>
                            handleExampleMessageChange(index, "input", e.target.value)
                          }
                          maxLength={500}
                          className={`input text-sm ${errors[`example_input_${index}`] ? "border-red-500 focus:ring-red-500" : ""}`}
                          placeholder="What the user might say..."
                          disabled={isSubmitting}
                        />
                        {errors[`example_input_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`example_input_${index}`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          AI responds:
                        </label>
                        <input
                          type="text"
                          value={msg.output}
                          onChange={(e) =>
                            handleExampleMessageChange(index, "output", e.target.value)
                          }
                          maxLength={1000}
                          className={`input text-sm ${errors[`example_output_${index}`] ? "border-red-500 focus:ring-red-500" : ""}`}
                          placeholder="How your persona should respond..."
                          disabled={isSubmitting}
                        />
                        {errors[`example_output_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`example_output_${index}`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-8 py-3 text-base rounded-xl"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary px-8 py-3 text-base rounded-xl flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            )}
            {isSubmitting
              ? "Creating..."
              : personaToEdit
                ? "Update Persona"
                : "Create Persona"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaModal;