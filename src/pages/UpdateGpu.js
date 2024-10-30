import React, { useEffect, useState } from "react";
import api from "../api/api"; 
import { useNavigate, useParams } from "react-router-dom";

const UpdateGpu = () => {
    const { id } = useParams(); // Get the GPU ID from the URL
    const [gpu, setGpu] = useState({ name: "", description: "", price: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGPU = async () => {
            try {
                const token = localStorage.getItem("token");
                console.log("Fetching GPU with ID:", id); 
                const { data } = await api.get(`/gpus/single/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Fetched GPU data:", data);
                setGpu({
                    name: data.name || "",
                    description: data.description || "",
                    price: data.price || "",
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching GPU:", error.response ? error.response.data : error); 
                setError("Error fetching GPU details.");
                setLoading(false);
            }
        };

        fetchGPU();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGpu((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await api.put(`/gpus/updategpu/${id}`, gpu, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate("/seller-dashboard");
        } catch (error) {
            console.error("Error updating GPU:", error);
            setError("Error updating GPU.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-200 to-yellow-300">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
            <h1 className="text-3xl font-bold text-center text-gray-800">Update GPU Details</h1>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={gpu.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-gray-700">Description:</label>
                <input
                  type="text"
                  name="description"
                  value={gpu.description}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-gray-700">Price:</label>
                <input
                  type="number"
                  name="price"
                  value={gpu.price}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      );
};

export default UpdateGpu;
