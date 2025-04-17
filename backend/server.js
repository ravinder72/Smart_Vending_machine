import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const AIO_USERNAME = process.env.AIO_USERNAME;
const AIO_KEY = process.env.AIO_KEY;
const AIO_BASE_URL = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds`;

const apiUrl = process.env.VITE_FRONTEND_URL;
  app.use(bodyParser.json());

// Logging middleware (Move to the top)
app.use((req, res, next) => {
    console.log(`Received ${req.method} request on ${req.url} with body:`, req.body);
    next();
  });

  

// Middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", apiUrl );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

// Global variable to store the latest stock data
let latestStock = {};

// Endpoint to receive updates from Pipeworks
app.post("/api/data", (req, res) => {
  const { command, value } = req.body;
  
  if (!command || !value) {
    return res.status(400).json({ status: "error", message: "Missing 'command' or 'value' field" });
  }

  console.log(`Received command: ${command}`);
  console.log(`Received value: ${value}`);

  // Reset latestStock to an empty object before updating it
  latestStock = {}; 

  // Process value string into an array
  const items = value.split(",").map(entry => {
    const [itemId, quantity] = entry.split("-").map(Number);
    return { itemId, quantity };
  });

  // Update stock data
  items.forEach(({ itemId, quantity }) => {
    latestStock[itemId] = quantity;
  });

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

// Fix Favicon Issue (Stops 500 Errors)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Enable CORS Preflight Requests
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", apiUrl );
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      return res.status(204).end();
    }
    next();
  });

// Send data to a specific feed
async function sendToAdafruit(feed, value) {
  try {
    const res = await axios.post(`${AIO_BASE_URL}/${feed}/data`, {
      value
    }, {
      headers: {
        'X-AIO-Key': AIO_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log("✅ Sent to Adafruit:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Error sending to Adafruit:", err.response?.data || err.message);
    throw err;
  }
}

// Get latest data from a specific feed
async function getFromAdafruit(feed) {
  try {
    const res = await axios.get(`${AIO_BASE_URL}/${feed}/data?limit=1`, {
      headers: {
        'X-AIO-Key': AIO_KEY
      }
    });
    console.log("📥 Latest from Adafruit:", res.data[0]);
    return res.data[0];
  } catch (err) {
    console.error("❌ Error fetching from Adafruit:", err.response?.data || err.message);
    throw err;
  }
}

app.post("/api/adafruit/send", async (req, res) => {
  const { feed, value } = req.body;
  if (!feed || value == null) return res.status(400).json({ error: "Missing feed or value" });

  try {
    const result = await sendToAdafruit(feed, value);
    res.json({ status: "success", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to send to Adafruit" });
  }
});

app.get("/api/adafruit/get/:feed", async (req, res) => {
  const { feed } = req.params;
  try {
    const result = await getFromAdafruit(feed);
    res.json({ status: "success", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Adafruit" });
  }
});

  

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});