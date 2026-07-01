const mongoose = require("mongoose")

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  content: { type: String, required: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
})

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 5000 },
  tag: { type: String, default: "general", enum: ["general", "help", "showoff", "bug", "question"] },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // TTL: auto-delete after 24 hours
})

module.exports = mongoose.model("Post", postSchema)
