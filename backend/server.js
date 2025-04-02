import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from 'path';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const apiUrl = process.env.VITE_FRONTEND_URL;
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: apiUrl
}));
app.use(bodyParser.json());

let latestStock = {};

wss.on('connection', (ws) => {
    console.log('New client connected');
  
    // Optionally send the current stock data to the newly connected client
    ws.send(JSON.stringify({ status: "success", message: "Current stock data", items: latestStock }));
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

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
  
    // Broadcast the updated stock data to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ status: "success", message: "Stock updated", items }));
      }
    });
  
    res.json({ status: "success", message: "Update received", items });
  });
  
  

    // Serve an HTML file for the root route
    app.get('/', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.send('<h1>Backend is running</h1>');
      });
      

  app.get("/api/data", (req, res) => {
    const items = Object.keys(latestStock).map(key => ({
      itemId: Number(key),
      quantity: latestStock[key]
    }));
    res.json({ status: "success", message: "Data retrieved", items });
  });
  
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
  
  app.use((req, res, next) => {
    console.log(`Received ${req.method} request on ${req.url} with body:`, req.body);
    next();
  });
  