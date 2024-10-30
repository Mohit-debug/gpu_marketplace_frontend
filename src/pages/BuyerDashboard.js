import React, { useEffect, useState } from "react";
import api from "../api/api";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";

const BuyerDashboard = () => {
  const [bidAmounts, setBidAmounts] = useState({});
  const [sortedGpus, setSortedGpus] = useState({
    highestBid: [],
    userBid: [],
    noBid: []
  });
  const [userId, setUserId] = useState(null);
  const [searchTerms, setSearchTerms] = useState({
    highestBid: "",
    userBid: "",
    noBid: "",
  });
  const [sortOptions, setSortOptions] = useState({
    highestBid: "none",
    userBid: "none",
    noBid: "none",
  });
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
      const { data } = await api.get("/gpus/getallgpubuyer");
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);

      const highestBidGpus = [];
      const userBidGpus = [];
      const noBidGpus = [];

      data.forEach((gpu) => {
        const userBid = gpu.bids.find((bid) => bid.userId._id === decodedToken.id);
        const highestBid = gpu.bids.reduce(
          (maxBid, bid) => (bid.amount > maxBid ? bid.amount : maxBid),
          0
        );

        if (userBid && userBid.amount === highestBid) {
          highestBidGpus.push(gpu);
        } else if (userBid) {
          userBidGpus.push(gpu);
        } else {
          noBidGpus.push(gpu);
        }
      });

      setSortedGpus({
        highestBid: highestBidGpus,
        userBid: userBidGpus,
        noBid: noBidGpus,
      });
    } catch (error) {
      console.error("Error fetching GPUs:", error);
    }
  };

  const placeBid = async (gpuId, amount) => {
    if (!amount) return alert("Please enter a bid amount.");
    try {
      const token = localStorage.getItem("token");
      await api.post(`/gpus/${gpuId}/bid`, { amount }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchGPUs();
      setBidAmounts((prev) => ({ ...prev, [gpuId]: "" }));
    } catch (error) {
      console.error("Failed to place bid:", error);
      alert(`Failed to place bid: ${error.response?.data?.message || "An error occurred."}`);
    }
  };

  const handleSearch = (category, term) => {
    setSearchTerms((prev) => ({ ...prev, [category]: term }));
  };

  const handleSort = (category, option) => {
    setSortOptions((prev) => ({ ...prev, [category]: option }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const applyFiltersAndSort = (gpus = [], category) => {
    let filteredGpus = gpus.filter((gpu) => 
      gpu.name.toLowerCase().includes(searchTerms[category].toLowerCase())
    );
  
    if (sortOptions[category] === "priceAsc") {
      filteredGpus = filteredGpus.sort((a, b) => a.price - b.price);
    } else if (sortOptions[category] === "priceDesc") {
      filteredGpus = filteredGpus.sort((a, b) => b.price - a.price);
    } else if (sortOptions[category] === "bidAsc") {
      filteredGpus = filteredGpus.sort((a, b) => Math.max(0, ...a.bids.map((bid) => bid.amount)) - Math.max(0, ...b.bids.map((bid) => bid.amount)));
    } else if (sortOptions[category] === "bidDesc") {
      filteredGpus = filteredGpus.sort((a, b) => Math.max(0, ...b.bids.map((bid) => bid.amount)) - Math.max(0, ...a.bids.map((bid) => bid.amount)));
    }
    return filteredGpus;
  };

  useEffect(() => {
    fetchGPUs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gradient-to-r from-gray-200 to-gray-400">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
      >
        Logout
      </button>

      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Available GPUs</h1>

      {/* Highest Bid Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">GPUs with Your Highest Bid</h2>
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            placeholder="Search by GPU Name"
            value={searchTerms.highestBid}
            onChange={(e) => handleSearch("highestBid", e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={sortOptions.highestBid}
            onChange={(e) => handleSort("highestBid", e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="none">Sort By</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="bidAsc">Highest Bid: Low to High</option>
            <option value="bidDesc">Highest Bid: High to Low</option>
          </select>
        </div>
        {applyFiltersAndSort(sortedGpus.highestBid, "highestBid").map((gpu) => (
          <div key={gpu._id} className="gpu-card p-5 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold">{gpu.name}</h3>
            <p>{gpu.description}</p>
            <p className="font-bold">Price: ${gpu.price}</p>
            <p className="font-bold">Highest Bid: ${Math.max(0, ...gpu.bids.map((bid) => bid.amount))}</p>
            {gpu.bidStatus === "closed" ? (
              <p>Bidding is closed for this GPU.</p>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Enter your bid"
                  value={bidAmounts[gpu._id] || ""}
                  onChange={(e) =>
                    setBidAmounts((prev) => ({ ...prev, [gpu._id]: e.target.value }))
                  }
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => placeBid(gpu._id, bidAmounts[gpu._id])}
                  className="ml-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Confirm my Bid
                </button>
              </>
            )}
          </div>
        ))}
      </section>

      {/* User Bid Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">GPUs You Have Bid On (Not Highest)</h2>
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            placeholder="Search by GPU Name"
            value={searchTerms.userBid}
            onChange={(e) => handleSearch("userBid", e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={sortOptions.userBid}
            onChange={(e) => handleSort("userBid", e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="none">Sort By</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="bidAsc">Highest Bid: Low to High</option>
            <option value="bidDesc">Highest Bid: High to Low</option>
          </select>
        </div>
        {applyFiltersAndSort(sortedGpus.userBid, "userBid").map((gpu) => (
          <div key={gpu._id} className="gpu-card p-5 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold">{gpu.name}</h3>
            <p>{gpu.description}</p>
            <p className="font-bold">Price: ${gpu.price}</p>
            <p className="font-bold">Highest Bid: ${Math.max(0, ...gpu.bids.map((bid) => bid.amount))}</p>
            <p className="font-bold">Your Bid: ${gpu.bids.find((bid) => bid.userId._id === userId)?.amount || 0}</p>
            {gpu.bidStatus === "closed" ? (
              <p>Bidding is closed for this GPU.</p>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Enter your bid"
                  value={bidAmounts[gpu._id] || ""}
                  onChange={(e) =>
                    setBidAmounts((prev) => ({ ...prev, [gpu._id]: e.target.value }))
                  }
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => placeBid(gpu._id, bidAmounts[gpu._id])}
                  className="ml-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Confirm my Bid
                </button>
              </>
            )}
          </div>
        ))}
      </section>

      {/* No Bid Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">GPUs You Have Not Bid On</h2>
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            placeholder="Search by GPU Name"
            value={searchTerms.noBid}
            onChange={(e) => handleSearch("noBid", e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={sortOptions.noBid}
            onChange={(e) => handleSort("noBid", e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="none">Sort By</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="bidAsc">Highest Bid: Low to High</option>
            <option value="bidDesc">Highest Bid: High to Low</option>
          </select>
        </div>
        {applyFiltersAndSort(sortedGpus.noBid, "noBid").map((gpu) => (
          <div key={gpu._id} className="gpu-card p-5 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold">{gpu.name}</h3>
            <p>{gpu.description}</p>
            <p className="font-bold">Price: ${gpu.price}</p>
            <p className="font-bold">Highest Bid: ${Math.max(0, ...gpu.bids.map((bid) => bid.amount))}</p>
            {gpu.bidStatus === "closed" ? (
              <p>Bidding is closed for this GPU.</p>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Enter your bid"
                  value={bidAmounts[gpu._id] || ""}
                  onChange={(e) =>
                    setBidAmounts((prev) => ({ ...prev, [gpu._id]: e.target.value }))
                  }
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => placeBid(gpu._id, bidAmounts[gpu._id])}
                  className="ml-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Confirm my Bid
                </button>
              </>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default BuyerDashboard;
