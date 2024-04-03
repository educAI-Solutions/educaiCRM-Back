// Import necessary modules
const Account = require("../models/accountModel");

async function createAccount(username, email, password, role = "student") {
  try {
    const account = new Account({ username, email, password, role });
    const savedAccount = await account.save();
    console.log("Account created:", savedAccount);
  } catch (error) {
    console.error("Error creating account:", error);
  }
}

// Update account
async function updateAccount(id, newUsername, newEmail, newPassword, newRole) {
  try {
    const account = await Account.findById(id);
    account.username = newUsername;
    account.email = newEmail;
    account.password = newPassword;
    account.role = newRole;
    const updatedAccount = await account.save();
    console.log("Account updated:", updatedAccount);
  } catch (error) {
    console.error("Error updating account:", error);
  }
}

// deleteAccount
async function deleteAccount(id) {
  try {
    const account = await Account.findByIdAndDelete(id);
    console.log("Account deleted:", account);
  } catch (error) {
    console.error("Error deleting account:", error);
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

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};
