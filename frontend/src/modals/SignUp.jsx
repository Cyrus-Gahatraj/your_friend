import {  useState } from "react";
import BaseModal from "./BaseModal";
import api from "../api";
import { toast } from "react-toastify";

const SignUp = ({ open, setOpen }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    country: "",
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
    const endpoint = '/sign-up/'
    try {
       await api.post(endpoint, formData);
       toast.success("Successfull signup. You can log-in now!");
    } catch(error) {
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred during signup. Please check your details and try again.";
        toast.error(`Error: ${errorMessage}`);
    } finally {
        setFormData({
            email: "",
            username: "",
            password: "",
            country: ""
        })
        setOpen(false);
    }
  };


  return (
    <BaseModal open={open} onClose={() => setOpen(false)} title="Sign Up">
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
              Username
            </label>
            <input
              name="username"
              type="text"
              value={formData.username}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-800 focus:outline-none text-gray-700"
            >
              <option value="">Select Country</option>
              <option value="Nepal">Nepal</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
              <option value="USA">USA</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Sign Up
          </button>
        </form>
    </BaseModal>
  );
};

export default SignUp;
