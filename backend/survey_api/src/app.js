// index.js
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("./db");
const Survey = require("./models/survey");
const { createForm } = require("./googleForms");

const app = express();
app.use(bodyParser.json());

app.post("/createSurvey", async (req, res) => {
  const { userId, title, description } = req.body;

  try {
    // You should validate the userId against your CRM here if needed.

    const googleForm = await createForm(title, description);

    const survey = new Survey({
      title,
      description,
      googleFormId: googleForm.formId,
      userId, // Associate the survey with the user
    });

    await survey.save();
    res.status(201).send(survey);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
