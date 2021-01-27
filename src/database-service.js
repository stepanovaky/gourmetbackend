require("dotenv").config();
var addYears = require("date-fns/addYears");
const database = require("./database");
const email = require("./nodemailer");
const { format } = require("date-fns");
const item = new database();

const DatabaseService = {
  async writeProductToTable(id, name) {
    const params = {
      TableName: "products",
      Item: {
        "product-id": { N: `${id}` },
        "product-name": { S: `${name}` },
        "warranty-duration": { N: `${0}` },
      },
    };

    item.writeNewData(params);
  },
  async getProductToAddWarranty(id, duration) {
    const params = {
      TableName: "products",
      Key: { "product-id": { N: `${id}` } },
      UpdateExpression: `SET #name =  :value`,
      ExpressionAttributeNames: {
        "#name": "warranty-duration",
      },
      ExpressionAttributeValues: {
        ":value": { N: `${duration}` },
      },
    };
    item.updateData(params);
  },
  async addCustomerRegistration(customer_info) {
    //if customer_info.origin === "amazon",
    //here comes code to check if the item was actually sold on amazon
    //customer_info.amazonOrderId

    const paramsToRead = {
      TableName: "products",
      Key: {
        "product-id": { N: `${customer_info["product-id"]}` },
      },
    };

    const data = await item.getDataSingle(paramsToRead).then((res) => {
      if (
        res.Item["warranty-duration"] &&
        res.Item["warranty-duration"].N > 0
      ) {
        const addAmount = res.Item["warranty-duration"].N;
        const warrantyExp = addYears(new Date(), addAmount).getTime();

        const paramsToWrite = {
          TableName: "warranty",
          Item: {
            "product-id": { N: `${res.Item["product-id"].N}` },
            "product-name": { S: res.Item["product-name"].S },
            "warranty-exp": { S: `${warrantyExp}` },
            "warranty-start": { S: `${new Date().getTime()}` },
            "owner-email": { S: customer_info["owner-email"] },
            "owner-name": { S: customer_info["owner-name"] },
            origin: { S: customer_info["origin"] },
          },
        };
        item.writeNewData(paramsToWrite);
        async function run(customer_info) {
          email.send({
            template: "warranty",
            message: {
              to: customer_info["owner-email"],
            },
            locals: {
              productName: customer_info["product-name"],
              warrantyStart: format(new Date(), "MM/dd/yyyy"),
              warrantyExp: format(
                new Date(parseInt(warrantyExp)),
                "MM/dd/yyyy"
              ),
            },
          });
        }
        run(customer_info);
      } else {
      }
    });

    // if (
    //   data.Item["warranty-duration"] &&
    //   data.Item["warranty-duration"].N > 0
    // ) {
    //   const addAmount = data.Item["warranty-duration"].N;
    //   const warrantyExp = addYears(new Date(), addAmount).getTime();

    //   const paramsToWrite = {
    //     TableName: "warranty",
    //     Item: {
    //       "product-id": { N: data.Item["product-id"].N },
    //       "product-name": { S: data.Item["product-name"].S },
    //       "warranty-exp": { S: `${warrantyExp}` },
    //       "warranty-start": { S: `${new Date().getTime()}` },
    //       "owner-email": { S: customer_info["owner-email"] },
    //       "owner-name": { S: customer_info["owner-name"] },
    //       origin: { S: customer_info["origin"] },
    //     },
    //   };
    //   item.writeNewData(paramsToWrite);
    //   async function run(customer_info) {
    //     email.send({
    //       template: "warranty",
    //       message: {
    //         to: customer_info["owner-email"],
    //       },
    //       locals: {
    //         productName: customer_info["product-name"],
    //         warrantyStart: format(new Date(), "MM/dd/yyyy"),
    //         warrantyExp: format(new Date(parseInt(warrantyExp)), "MM/dd/yyyy"),
    //       },
    //     });
    //   }
    //   run(customer_info);
    // } else {
    // }
  },
  async getAll(table) {
    params = {
      TableName: table,
    };
    const data = item.getBatchData(params);
    return data;
  },
  async getOneProduct(id) {
    const params = {
      TableName: "products",
      Key: {
        "product-id": { N: id },
      },
    };

    const data = await item.getDataSingle(params);
    return data;
  },
  async getOneCustomer(id) {
    const params = {
      TableName: "warranty",
      Key: {
        "owner-email": { S: id },
      },
    };

    const data = await item.getDataSingle(params);
    return data;
  },
};

module.exports = DatabaseService;
