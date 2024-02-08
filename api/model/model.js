const mongoose = require("mongoose");

// const dataSchema = new mongoose.Schema({
//   name: {
//     required: true,
//     type: String,
//   },
//   age: {
//     required: true,
//     type: Number,
//   },
// });

// module.exports = mongoose.model("Data", dataSchema);

const transactionSchema = new mongoose.Schema({
  gameAddress: {
    type: String,
    required: true,
  },
  startedBy: {
    type: String,
    required: true,
  },
  player2: {
    type: String,
    required: true,
  },
  player1Played: {
    type: Boolean,
    required: true,
  },
  player2Played: {
    type: Boolean,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  lastAction: {
    type: Date,
    required: true,
  },
  solved: {
    type: Boolean,
    required: true,
  },
});

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   transactions: [transactionSchema],
// });

module.exports = mongoose.model("Transaction", transactionSchema);
