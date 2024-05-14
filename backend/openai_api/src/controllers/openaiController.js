const OpenAI = require("openai-api");
const dotenv = require("dotenv");
dotenv.config();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Controller function for generating text
const generateText = async (req, res) => {
  messages = req.body.messages;
  console.log(messages);
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k-0613",
      messages: messages,
      temperature: 0.7,
    });

    console.log(completion.choices[0]);

    res.json({ text: completion.choices[0] });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
};

module.exports = {
  generateText,
};
