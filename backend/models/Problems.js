const mongoose = require("mongoose")

const problemSchema = new mongoose.Schema({

  title: String,

  description: String,

  difficulty: String,

  tags: [String],

  examples: [
    {
      input: String,
      output: String,
      explanation: String
    }
  ],

  constraints: [String],

  testCases: [
    {
      input: String,
      output: String
    }
  ],

  boilerplate: {
    cpp: String,
    python: String,
    javascript: String
  }

})

module.exports = mongoose.model("Problem", problemSchema)