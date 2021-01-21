require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const helmet = require("helmet");
const { NODE_ENV } = require("./config");
var { graphqlHTTP } = require("express-graphql");
const schema = require("./schema");
const fetch = require("./database-service");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
// app.use(helmet()); TURN ON FOR PRODUCTION!!!!!!!!!!!!!!!!!!

const corsOptions = {
  origin: "https://muscled-store.myshopify.com",
  optionsSuccessStatus: 200,
};

app.use(
  "/graphql",
  cors(corsOptions),
  graphqlHTTP({
    schema: schema,
    graphiql: true,
    pretty: true,
  })
);

// app.get("/test", async (req, res, next) => {
//   console.log(req);
// });

const jsonParser = express.json();

app.post("/test", jsonParser, async (req, res, next) => {
  // const thing = await JSON.parse(req.body);
  console.log(req.body);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
