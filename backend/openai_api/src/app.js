const express = require("express");
const app = express();
const openaiRoutes = require("./routes/openaiRoutes");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());

// Routes
app.use("/openai", openaiRoutes);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
