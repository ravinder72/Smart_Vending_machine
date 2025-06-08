import React, { useState, useEffect } from "react";
import axios from "axios";

const Payment = () => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    amount: "",
  });

  // Load cart data from sessionStorage on component mount
  useEffect(() => {
    const storedAmount = sessionStorage.getItem("totalAmount");
    if (storedAmount) {
      setFormData((prev) => ({
        ...prev,
        amount: storedAmount,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const transactionId = "T" + Date.now();
    const data = {
      ...formData,
      MUID: "MUID" + Date.now(),
      transactionId: transactionId,
    };

    // Store transaction ID for success page
    sessionStorage.setItem("transactionId", transactionId);

    try {
      // Use environment variable or fallback to localhost:3000
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      let res = await axios.post(`${backendUrl}/order`, data);

      if (res.data && res.data.data.instrumentResponse.redirectInfo.url) {
        window.location.href =
          res.data.data.instrumentResponse.redirectInfo.url;
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment processing failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-purple-400">
      <form
        onSubmit={handlePayment}
        className="bg-white p-8 rounded-lg shadow-2xl w-96 border-4 border-blue-500 transform transition-all duration-300 hover:scale-105"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-600">
          Payment Form
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">
            Phone Number
          </label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Amount (Rs)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
            readOnly
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md hover:shadow-lg"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
};

export default Payment;
