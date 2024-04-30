const Contact = require("../models/contactModel");

exports.createContact = async (req, res) => {
  try {
    const { id, name, subject, content } = req.body;

    const contact = new Contact({
      sender: id,
      name,
      subject,
      content,
    });

    await contact.save();

    res.status(201).json({ success: true, contact });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
