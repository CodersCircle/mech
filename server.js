const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let onlineWorkers = {};

// worker connects
io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("worker-online", (workerId) => {
        onlineWorkers[workerId] = socket.id;
        console.log("Worker online:", workerId);
    });

    socket.on("disconnect", () => {
        for (let id in onlineWorkers) {
            if (onlineWorkers[id] === socket.id) {
                delete onlineWorkers[id];
            }
        }
    });

    socket.on("new-booking", (bookingData) => {
        Object.values(onlineWorkers).forEach((workerSocket) => {
            io.to(workerSocket).emit("booking-request", bookingData);
        });
    });

    socket.on("accept-booking", (data) => {
        io.emit("booking-accepted", data);
    });
});

app.get("/", (req, res) => {
    res.send("Realtime Server Running");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
