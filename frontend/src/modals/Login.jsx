import { useState } from "react";
import BaseModal from "./BaseModal";
import api from "../api";

const Login = ({ open, setOpen }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = "/log-in/";
    try {
      const form = new FormData();
      form.append("username", formData.email);
      form.append("password", formData.password);
      await api.post(endpoint, form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      console.log("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setFormData({ email: "", password: "" });
      setOpen(false);
    }

  };

  return (
    <BaseModal open={open} onClose={() => setOpen(false)} title="Log In">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-800 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-2 mt-4 rounded-lg hover:bg-gray-800 transition"
        >
          Log In
        </button>
      </form>
    </BaseModal>
  );
};

export default Login;
