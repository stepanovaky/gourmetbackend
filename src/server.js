const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, () => {
  console.log(` ${new Date()} Server listening at http://localhost${PORT}`);
});
