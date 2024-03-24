// Import necessary modules
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const mongo_login_string = process.env.mongo_login_string;
let randomId = "";

// Connect to MongoDB
mongoose.connect(mongo_login_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Define Schema
const accountSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "user",
  },
});

// Define Model
const Account = mongoose.model("Account", accountSchema);

// CRUD Operations
async function createAccount(username, email, password, role = "user") {
  try {
    const account = new Account({ username, email, password, role });
    const savedAccount = await account.save();
    console.log("Account created:", savedAccount);
  } catch (error) {
    console.error("Error creating account:", error);
  }
}

async function getAccounts() {
  try {
    const accounts = await Account.find();
    console.log("Accounts:", accounts);
    randomId = accounts[0]._id;
  } catch (error) {
    console.error("Error fetching accounts:", error);
  }
}

async function getAccountById(id) {
  try {
    const account = await Account.findById(id);
    console.log("Account:", account);
  } catch (error) {
    console.error("Error fetching account by ID:", error);
  }
}

async function updateAccount(id, newData) {
  try {
    const updatedAccount = await Account.findByIdAndUpdate(id, newData, {
      new: true,
    });
    console.log("Account updated:", updatedAccount);
  } catch (error) {
    console.error("Error updating account:", error);
  }
}

async function deleteAccount(id) {
  try {
    const deletedAccount = await Account.findByIdAndDelete(id);
    console.log("Account deleted:", deletedAccount);
  } catch (error) {
    console.error("Error deleting account:", error);
  }
}

// Usage
async function main() {
  // Create an account
  await createAccount("john_doe", "john@example.com", "password123");

  // Get all accounts
  await getAccounts();

  // Get an account by ID
  await getAccountById(randomId);

  // Update an account
  await updateAccount(randomId, { username: "skere" });

  // Delete an account
  await deleteAccount(randomId);
}
