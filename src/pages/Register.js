import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "buyer" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      alert("Registration successful!");
      navigate("/"); 
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-green-200 to-blue-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            name="role"
            onChange={handleChange}
            required
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
          <button
            type="submit"
            className="w-full py-3 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Register
          </button>
        </form>
        <button
          onClick={() => navigate("/")}
          className="w-full py-2 text-green-600 bg-transparent border border-green-600 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Register;
