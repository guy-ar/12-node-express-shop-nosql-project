require('dotenv').config();
console.log("Environment variables loaded:", process.env.MONGODB_URI ? "MONGODB_URI exists" : "MONGODB_URI missing");

const client = {
  resendApiKey: process.env.RESEND_API_KEY,
  mongoDbConnectionString: process.env.MONGODB_URI,
  csrfSecret: process.env.CSRF_PROTECTION_SECRET,
  cookieParserSecret: process.env.COOKIE_PARSER_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  gmailApiKey: process.env.GOOGLE_API_KEY,
  gmailApiUser: process.env.GOOGLE_API_USER,
  serverUrl: process.env.SERVER_URL,
  serverPort: process.env.SERVER_PORT

};

module.exports = client;