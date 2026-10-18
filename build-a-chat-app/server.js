import http from "http";
import fs from "fs";
import { WebSocketServer } from "ws";

const PORT = 3001;

// 1. HTTP server serving public/index.html
const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

// 2. WebSocketServer attached to the HTTP server
const wss = new WebSocketServer({ server });

// 3. Connection listener
wss.on("connection", (socket, req) => {
  // Parse username from query string
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username"
  );

  // Broadcast join message to all clients
  broadcast({ type: "system", text: `${username} joined` });

  // 4. Message listener
  socket.on("message", (data) => {
    const { username, text } = JSON.parse(data);
    broadcast({ type: "chat", username, text });
  });

  // 5. Close listener
  socket.on("close", () => {
    broadcast({ type: "system", text: `${username} left` });
  });
});

// Helper: send JSON to every connected client
function broadcast(message) {
  const json = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(json);
    }
  }
}

// 6. Start the server
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});