require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const helmet = require("helmet");
const { NODE_ENV } = require("./config");
var { graphqlHTTP } = require("express-graphql");
const schema = require("./schema");
const Product = require("./models/Product");
const Warranty = require("./models/Warranty");
// const fetch = require("./database-service");

const app = express();
const jsonParser = express.json();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
// app.use(helmet()); TURN ON FOR PRODUCTION!!!!!!!!!!!!!!!!!!

// const corsOptions = {
//   origin: [
//     "https://muscled-store.myshopify.com",
//     "https://e036ba913686.ngrok.io",
//   ],
//   optionsSuccessStatus: 200,
// };

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(
  "/graphql",
  jsonParser,
  cors(),
  graphqlHTTP((req) => ({
    schema: schema,
    graphiql: true,
    pretty: true,
  }))
);

app.post("/api/product", jsonParser, async (req, res, next) => {
  res.status(200).json({ message: "product went through" });
  DatabaseService.writeProductToTable(req.body.id, req.body.title);
});

app.post("/api/shopify/order", jsonParser, async (req, res) => {
  res.status(200).json({ message: "order went through" });
  req.body.line_items.map(async (item) => {
    if (req.body.customer.email !== null) {
      const customer = req.body.customer;
      const product = await Product.findOne({ productId: item.product_id });
      if (product && customer) {
        const warrantyStart = new Date();
        const warrantyExp = new Date(
          warrantyStart.getFullYear() + product.warrantyDuration,
          warrantyStart.getMonth(),
          warrantyStart.getDate()
        );
        const data = {
          ownerEmail: customer.email,
          ownerName: `${customer.first_name} ${customer.last_name}`,
          origin: 'Shopify',
          approval: 'approved',
          productId: item.product_id,
          productName: item.title,
          amazonOrderId: req.body.id,
          warrantyStart,
          warrantyExp
        };
        const warranty = new Warranty(data);
        await warranty.save();
      }
    }
  });
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
