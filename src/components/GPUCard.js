import React from "react";

const GPUCard = ({ gpu }) => (
  <div className="gpu-card">
    <h3>{gpu.name}</h3>
    <p>{gpu.description}</p>
    <p>Price: ${gpu.price}</p>
  </div>
);

export default GPUCard;
