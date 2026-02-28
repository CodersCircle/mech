const express = require("express");

const app = express();

/* health route */
app.get("/", (req, res) => {
    res.send("SERVER IS ALIVE");
});

/* VERY IMPORTANT */
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port:", PORT);
});