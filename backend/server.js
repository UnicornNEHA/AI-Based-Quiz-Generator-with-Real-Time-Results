const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

app.use("/api/quizzes", require("./routes/quizRoutes"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
