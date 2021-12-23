const mongoose = require("mongoose");
const dateFormat = require('../utils/dateFormat');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: "Enter a name for transaction"
    },
    value: {
        type: Number,
        required: "Enter an amount"
    },
    date: {
        type: Date,
        default: Date.now,
        get: (createdAtVal) => dateFormat(createdAtVal)
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;