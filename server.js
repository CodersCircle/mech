const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

/* health route */
app.get("/", (req, res) => {
    res.send("Realtime Server Running");
});

/* IMPORTANT: start express FIRST */
const PORT = process.env.PORT || 10000;
const server = http.createServer(app);

/* attach socket AFTER server exists */
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

let onlineWorkers = {};

/* socket connection */
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // worker online
    socket.on("worker-online", (workerId) => {
        onlineWorkers[workerId] = socket.id;
        console.log("Worker online:", workerId);
    });

    // booking broadcast
    socket.on("new-booking", (booking) => {
        console.log("Booking received:", booking);

        Object.values(onlineWorkers).forEach((workerSocket) => {
            io.to(workerSocket).emit("booking-request", booking);
        });
    });

    socket.on("disconnect", () => {
        for (let id in onlineWorkers) {
            if (onlineWorkers[id] === socket.id) {
                delete onlineWorkers[id];
            }
        }
        console.log("Client disconnected:", socket.id);
    });
});

/* NOW start server */
server.listen(PORT, "0.0.0.0", () => {
    console.log("Realtime server started on port:", PORT);
});