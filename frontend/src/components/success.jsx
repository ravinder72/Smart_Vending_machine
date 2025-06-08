import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Success = ({ setCart }) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState("Processing your order...");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const sendToAdafruit = async () => {
      // Double check if component is still mounted before proceeding
      if (!isMounted) return;

      try {
        // Get stored cart data
        const cartData = JSON.parse(sessionStorage.getItem("cartData") || "[]");
        const vendingMachineId = sessionStorage.getItem("vendingMachineId");
        const transactionId = sessionStorage.getItem("transactionId");

        console.log("📦 Retrieved cart data:", cartData);
        console.log("🏪 Vending Machine ID:", vendingMachineId);
        console.log("💳 Transaction ID:", transactionId);

        if (!cartData.length || !vendingMachineId) {
          if (isMounted) {
            setMessage("Error: Missing cart data or vending machine ID");
            setIsProcessing(false);
          }
          return;
        }

        // Prepare item IDs for vending machine
        const itemIds = cartData.map((item) => item.id).join(",");
        console.log("🔢 Item IDs:", itemIds);

        // Use environment variable for backend URL
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/adafruit/send`;

        // Prepare payloads for Adafruit
        const payloads = [
          { feed: "vending-id", value: vendingMachineId },
          { feed: "time-stamp", value: "0" },
          { feed: "amount", value: itemIds },
        ];

        console.log("📡 Sending payloads:", payloads);

        if (isMounted) {
          setMessage("Sending instructions to vending machine...");
        }

        // Send requests sequentially instead of parallel to avoid race conditions
        const responses = [];
        for (const payload of payloads) {
          if (!isMounted) break; // Stop if component unmounted

          console.log(`Sending payload:`, payload);
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          responses.push(response);

          // Small delay between requests to ensure proper ordering
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Check if all requests were successful
        const allSuccessful = responses.every((response) => response.ok);

        if (allSuccessful && isMounted) {
          console.log("✅ All payloads sent successfully to Adafruit");
          setMessage("Payment processed, vending will start soon!");

          // Clear the cart in parent component
          if (setCart) {
            setCart([]);
          }

          // Clear stored data
          sessionStorage.removeItem("cartData");
          sessionStorage.removeItem("vendingMachineId");
          sessionStorage.removeItem("totalAmount");
          sessionStorage.removeItem("transactionId");

          // Auto-redirect to home after 5 seconds
          setTimeout(() => {
            if (isMounted) {
              navigate("/");
            }
          }, 5000);
        } else if (isMounted) {
          throw new Error("Some requests failed");
        }
      } catch (error) {
        console.error("❌ Error sending to Adafruit:", error);
        if (isMounted) {
          setMessage(
            "Payment successful, but vending machine processing failed."
          );
        }
      } finally {
        // Set processing to false after a brief delay
        setTimeout(() => {
          if (isMounted) {
            setIsProcessing(false);
          }
        }, 2000);
      }
    };

    // Send data to Adafruit when component mounts
    sendToAdafruit();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-300 to-blue-400">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96 border-4 border-green-500 text-center">
        <div className="mb-6">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
          ) : (
            <div className="text-green-500 text-6xl mb-4">✅</div>
          )}
        </div>

        <h2 className="text-3xl font-extrabold mb-4 text-green-600">
          {isProcessing ? "Processing..." : "Success!"}
        </h2>

        <p className="text-gray-700 mb-6">{message}</p>

        {!isProcessing && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              You will be redirected to the home page in 5 seconds...
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Success;