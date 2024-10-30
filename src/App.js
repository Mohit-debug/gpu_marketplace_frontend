import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard";
import UpdateGpu from "./pages/UpdateGpu";
import BuyerDashboard from "./pages/BuyerDashboard";
import GPUForm from "./pages/GPUForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/gpus/update/:id" element={<UpdateGpu />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/gpus/new" element={<GPUForm />} />
      </Routes>
    </Router>
  );
}

export default App;
