// Import necessary modules
const Account = require("../models/accountModel");

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

// Usage
async function main() {
  // Create an account
  await createAccount("john_doe", "john@example.com", "password123");

  // Get all accounts
  await getAccounts();

  // Get an account by ID
  await getAccountById(randomId);
}

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
};
