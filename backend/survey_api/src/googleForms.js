// googleForms.js
const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const oAuth2Client = new OAuth2(
  "your_client_id",
  "your_client_secret",
  "your_redirect_url"
);

oAuth2Client.setCredentials({
  refresh_token: "your_refresh_token",
});

const forms = google.forms({ version: "v1", auth: oAuth2Client });

const createForm = async (title, description) => {
  const form = {
    title: title,
    description: description,
    items: [
      {
        questionItem: {
          question: {
            required: true,
            textQuestion: {},
            title: "Sample Question",
          },
        },
      },
    ],
  };

  const res = await forms.forms.create({ requestBody: form });
  return res.data;
};

module.exports = { createForm };
