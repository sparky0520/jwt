require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protectedRoutes");
const mongoose = require("mongoose");

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected To MongoDB");
    const PORT = process.env.SERVER_PORT || 8000;
    app.listen(PORT, () => {
      console.log({
        serverArchitecture: process.arch,
        serverURL: `http://localhost:${PORT}`,
      });
    });
  })
  .catch((error) => console.log("Error connecting to mongodb ", error));
