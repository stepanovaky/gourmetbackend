require("dotenv").config();
var addYears = require("date-fns/addYears");
const database = require("./database");

const item = new database();

const DatabaseService = {
  async writeProductToTable(id, name) {
    const params = {
      TableName: "products",
      Item: {
        "product-id": { S: id },
        "product-name": { S: name },
      },
    };

    item.writeNewData(params);
  },
  async getProductToAddWarranty(id, duration) {
    const params = {
      TableName: "products",
      Key: { "product-id": { S: id } },
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

    console.log(customer_info["product-id"]);

    const paramsToRead = {
      TableName: "products",
      Key: {
        "product-id": { S: `${customer_info["product-id"]}` },
      },
    };

    const data = await item.getDataSingle(paramsToRead);

    //add conditional to check if warranty-duration exists
    console.log(data.Item["warranty-duration"].N);
    const addAmount = data.Item["warranty-duration"].N;
    const warrantyExp = addYears(new Date(), addAmount).getTime();

    const paramsToWrite = {
      TableName: "warranty",
      Item: {
        "product-id": { S: data.Item["product-id"].S },
        "product-name": { S: data.Item["product-name"].S },
        "warranty-exp": { S: `${warrantyExp}` },
        "warranty-start": { S: `${new Date().getTime()}` },
        "owner-email": { S: customer_info["owner-email"] },
        "owner-name": { S: customer_info["owner-name"] },
        origin: { S: customer_info["origin"] },
      },
    };
    item.writeNewData(paramsToWrite);
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
        "product-id": { S: id },
      },
    };

    const data = await item.getDataSingle(params);
    return data;
  },
};

customer = {
  "owner-email": "test@gmail.com",
  "owner-name": "test test",
  origin: "shopify",
  "product-name": "thing",
  "product-id": "thing",
};

// DatabaseService.writeProductToTable("boo", "boo");
// DatabaseService.getProductToAddWarranty("boo", 5);
// DatabaseService.addCustomerRegistration(customer);
// const list = async () => {
//   const list1 = await item.getBatchData({ TableName: "products" });
//   const list2 = await item.getBatchData({ TableName: "warranty" });

//   console.log(list1.Items, list2);
// };

// list();

module.exports = DatabaseService;
