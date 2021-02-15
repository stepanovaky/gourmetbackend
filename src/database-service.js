/* eslint-disable no-undef */
require("dotenv").config();
var addYears = require("date-fns/addYears");
// eslint-disable-next-line no-undef
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

     await item.getDataSingle(paramsToRead).then((res) => {
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
            approval: { S: customer_info["approval"] },
            amazonOrderId: {
              S: customer_info["amazon-order-id"]
                ? customer_info["amazon-order-id"]
                : "none",
            },
          },
        };
        console.log(paramsToWrite);
        item.writeNewData(paramsToWrite);
        if (customer_info["approval"] === "approved") {
          // eslint-disable-next-line no-inner-declarations
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
          run()
        } else if (customer_info["approval"] === "pending") {
          //send email to inform customer of pending warranty registration
        }
      // eslint-disable-next-line no-empty
      } else {
      }
    });
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
  async approveWarranty(exp, id) {
    //code to retrieve warranty information first to figure out where to send email
    const params = {
      TableName: "warranty",
      key: {
        "product-id": { N: `${id}` },
        "warranty-exp": { S: exp },
      },
      UpdateExpression: "SET #name =  :value",
      ExpressionAttributeNames: {
        "#name:": "approval",
      },
      ExpressionAttributeValues: {
        ":value": { S: "approved" },
      },
    };

    item.approveWarranty(params);
    //code to send email for approval
  },
  async deleteWarranty(exp, id) {
    //retrieve warranty info first to figure out where to send email
    const params = {
      TableName: "warranty",
      key: {
        "product-id": { N: `${id}` },
        "warranty-exp": { S: exp },
      },
    };
    item.deleteWarranty(params);
    //code to send email for deletion
    //probably have to retrieve warranty info
  },
};

// DatabaseService.writeProductToTable(6090272899222, "Y Peeler");

// async function get() {
//   const item = await DatabaseService.getAll("products");
//   console.log(item);
//   console.log(item.Items[1]);
// }

// get();

module.exports = DatabaseService;
