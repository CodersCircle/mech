const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

// Health check route (Render needs this)
app.get("/", (req, res) => {
    res.status(200).send("Realtime Server Running");
});

// Create HTTP server
const server = http.createServer(app);

// IMPORTANT: attach socket AFTER server exists
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
});

let onlineWorkers = {};

io.on("connection", (socket) => {
    console.log("Worker connected:", socket.id);

    // worker online
    socket.on("worker-online", (workerId) => {
        onlineWorkers[workerId] = socket.id;
        console.log("Worker online:", workerId);
    });

    // new booking event
    socket.on("new-booking", (bookingData) => {
        console.log("Booking received:", bookingData);

        Object.values(onlineWorkers).forEach((workerSocket) => {
            io.to(workerSocket).emit("booking-request", bookingData);
        });
    });

    // accept booking
    socket.on("accept-booking", (data) => {
        io.emit("booking-accepted", data);
    });

    // disconnect
    socket.on("disconnect", () => {
        for (let id in onlineWorkers) {
            if (onlineWorkers[id] === socket.id) {
                delete onlineWorkers[id];
            }
        }
        console.log("Worker disconnected");
    });
});

// Render dynamic port
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log("Server started on port " + PORT);
});
