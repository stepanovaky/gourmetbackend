/* eslint-disable no-undef */
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const {
  GMAIL_SENDER_EMAIL,
  GMAIL_SENDER_PASSWORD,
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
  GMAIL_REFRESH_TOKEN
} = require('./config');

const oAuth2Client = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

const sendEmail = async (to, subject, text) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: 'OAuth2',
        user: GMAIL_SENDER_EMAIL,
        pass: GMAIL_SENDER_PASSWORD,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: accessToken
      }
    });
    const mailOptions = {
      from: GMAIL_SENDER_PASSWORD,
      to,
      subject,
      text
    };
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log(error, "test");
  }
}

module.exports = sendEmail;