import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const GPUForm = () => {
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Retrieve token from local storage
      const token = localStorage.getItem("token");
      
      // Send the request with Authorization header
      await api.post("/gpus/creategpu", form, {
        headers: {
          Authorization: `Bearer ${token}`,  // token is passed
        },
      });
      navigate("/seller-dashboard");
    } catch (error) {
      console.error("Failed to create GPU listing:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-200 to-green-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">Create GPU</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="GPU Name"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          ></textarea>
          <input
            type="number"
            name="price"
            placeholder="Price"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="w-full py-3 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default GPUForm;
