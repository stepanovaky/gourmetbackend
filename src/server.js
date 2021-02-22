/* eslint-disable no-undef */
const app = require("./app");
const { PORT } = require("./config");
const connectDB = require('./mongo');

connectDB();

app.listen(PORT, () => {
  console.log(` ${new Date()} Server listening at http://localhost:${PORT}`);
});
