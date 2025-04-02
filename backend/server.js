import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;
const apiUrl = process.env.VITE_FRONTEND_URL;

// Allow frontend to access backend
app.use(cors({ origin: apiUrl }));
app.use(bodyParser.json());

// Global variable to store the latest stock data
let latestStock = {};

// Endpoint to receive updates from Pipeworks
app.post("/api/data", (req, res) => {
  const { value } = req.body;

  if (!value) {
    return res.status(400).json({ status: "error", message: "Missing 'value' field" });
  }

  // Process the value string into an array of objects
  const items = value.split(",").map(entry => {
    const [itemId, quantity] = entry.split("-").map(Number);
    return { itemId, quantity };
  });

  // Update the global stock object based on the received items
  items.forEach(({ itemId, quantity }) => {
    latestStock[itemId] = quantity;
  });

  console.log("Received Items:", items);
  res.json({ status: "success", message: "Update received", items });
});

// Endpoint for the frontend to retrieve the current stock
app.get("/api/data", (req, res) => {
  const items = Object.keys(latestStock).map(key => ({
    itemId: Number(key),
    quantity: latestStock[key]
  }));
  res.json({ status: "success", message: "Data retrieved", items });
});

// Root endpoint to confirm the backend is running
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send("Backend is running");
});

// Logging middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request on ${req.url} with body:`, req.body);
  next();
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
