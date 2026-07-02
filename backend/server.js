// Load environment variables from .env file
require("dotenv").config()

// Core imports
const express = require("express")
const cors = require("cors")

// Required for Socket.IO (Express alone is not enough)
const http = require("http")
const { Server } = require("socket.io")

// Route imports
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const problemRoutes = require("./routes/problemRoutes")
const submissionRoutes = require("./routes/submissionRoutes")
const adminRoutes = require("./routes/adminRoutes")
const postRoutes = require("./routes/postRoutes")

// DB connection
const connectDB = require("./config/db")

// Socket handler
const handleSockets = require("./socket/roomSocket")

// Initialize express app
const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" })) // increased limit for admin problem uploads

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/problems", problemRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/posts", postRoutes)

// Basic test route
app.get("/", (req, res) => {
  res.send("CodeBattle API running")
})

/*
  We create an HTTP server manually instead of using app.listen()
  because Socket.IO needs access to the raw HTTP server
*/
const server = http.createServer(app)

/*
  Initialize Socket.IO
  - allows real-time communication
  - CORS set to allow frontend connection
*/
const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

/*
  Attach all socket logic (rooms, joins, chat, etc.)
*/
handleSockets(io)

// Start server
const PORT = process.env.PORT || 5001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})