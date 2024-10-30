import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const [myGPUs, setMyGPUs] = useState([]);
  const [otherGPUs, setOtherGPUs] = useState([]);
  const [searchTerms, setSearchTerms] = useState({ myGPUs: "", otherGPUs: "" });
  const [sortOptions, setSortOptions] = useState({ myGPUs: "", otherGPUs: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login if no token
    } else {
      fetchGPUs();
    }

    // Set up a session check interval
    const sessionCheckInterval = setInterval(() => {
      const tokenExpiration = checkTokenExpiration(token);
      if (tokenExpiration) {
        handleLogout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(sessionCheckInterval);

  }, [navigate]);

  const checkTokenExpiration = (token) => {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = decodedToken.iat * 1000 + 30 * 60 * 1000; // 30 minutes
    return Date.now() > expirationTime;
  };

  const fetchGPUs = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get("/gpus/getallgpu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyGPUs(data.myGPUs);
      setOtherGPUs(data.otherGPUs);
    } catch (error) {
      console.error("Error fetching GPUs:", error);
    }
  };

  const toggleBidStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.patch(`/gpus/toggleBidStatus/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Bidding is now ${data.gpu.bidStatus}`);
      fetchGPUs();
    } catch (error) {
      console.error("Error toggling bid status:", error);
    }
  };

  const deleteGPU = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/gpus/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGPUs();
    } catch (error) {
      console.error("Error deleting GPU:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const applyFiltersAndSort = (gpus, category) => {
    let filteredGpus = gpus.filter((gpu) =>
      gpu.name.toLowerCase().includes(searchTerms[category].toLowerCase())
    );

    if (sortOptions[category] === "priceAsc") {
      filteredGpus = filteredGpus.sort((a, b) => a.price - b.price);
    } else if (sortOptions[category] === "priceDesc") {
      filteredGpus = filteredGpus.sort((a, b) => b.price - a.price);
    } else if (sortOptions[category] === "bidAsc") {
      filteredGpus = filteredGpus.sort(
        (a, b) =>
          Math.max(0, ...a.bids.map((bid) => bid.amount)) -
          Math.max(0, ...b.bids.map((bid) => bid.amount))
      );
    } else if (sortOptions[category] === "bidDesc") {
      filteredGpus = filteredGpus.sort(
        (a, b) =>
          Math.max(0, ...b.bids.map((bid) => bid.amount)) -
          Math.max(0, ...a.bids.map((bid) => bid.amount))
      );
    }
    return filteredGpus;
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gradient-to-r from-gray-100 to-gray-300">
      <button 
        onClick={handleLogout} 
        className="absolute top-4 right-4 px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
      >
        Logout
      </button>

      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">My GPUs</h1>
      <button 
        onClick={() => navigate("/gpus/new")} 
        className="mb-4 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Create New GPU
      </button>
      
      <div className="flex items-center mb-4 space-x-4">
        <input
          type="text"
          placeholder="Search My GPUs"
          value={searchTerms.myGPUs}
          onChange={(e) =>
            setSearchTerms({ ...searchTerms, myGPUs: e.target.value })
          }
          className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          onChange={(e) =>
            setSortOptions({ ...sortOptions, myGPUs: e.target.value })
          }
          value={sortOptions.myGPUs}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Sort By</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="bidAsc">Highest Bid: Low to High</option>
          <option value="bidDesc">Highest Bid: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {applyFiltersAndSort(myGPUs, "myGPUs").map((gpu) => (
          <div key={gpu._id} className="gpu-card p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold">{gpu.name} - <em>{gpu.bidStatus}</em></h3>
            <p>{gpu.description}</p>
            <p className="font-bold">Price: ${gpu.price}</p>
            <h4 className="font-bold">Bids:</h4>
            {gpu.bids.length > 0 ? (
              <ul>
                {gpu.bids.map((bid) => (
                  <li key={bid.userId._id}>
                    <strong>User:</strong> {bid.userId.username} <br />
                    <strong>Bid Amount:</strong> ${bid.amount}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bids placed yet.</p>
            )}
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => deleteGPU(gpu._id)} 
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
              <button 
                onClick={() => navigate(`/gpus/update/${gpu._id}`)} 
                className="px-4 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
              >
                Update
              </button>
              <button 
                onClick={() => toggleBidStatus(gpu._id)} 
                className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
              >
                {gpu.bidStatus === "Open" ? "Close Bidding" : "Open Bidding"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Other GPUs</h1>
      
      <div className="flex items-center mb-4 space-x-4">
        <input
          type="text"
          placeholder="Search Other GPUs"
          value={searchTerms.otherGPUs}
          onChange={(e) =>
            setSearchTerms({ ...searchTerms, otherGPUs: e.target.value })
          }
          className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          onChange={(e) =>
            setSortOptions({ ...sortOptions, otherGPUs: e.target.value })
          }
          value={sortOptions.otherGPUs}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Sort By</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="bidAsc">Highest Bid: Low to High</option>
          <option value="bidDesc">Highest Bid: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applyFiltersAndSort(otherGPUs, "otherGPUs").map((gpu) => (
          <div key={gpu._id} className="gpu-card p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold">{gpu.name}</h3>
            <p>{gpu.description}</p>
            <p className="font-bold">Price: ${gpu.price}</p>
            <h4 className="font-bold">Bids:</h4>
            {gpu.bids.length > 0 ? (
              <ul>
                {gpu.bids.map((bid) => (
                  <li key={bid.userId._id}>
                    <strong>User:</strong> {bid.userId.username} <br />
                    <strong>Bid Amount:</strong> ${bid.amount}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bids placed yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerDashboard;
