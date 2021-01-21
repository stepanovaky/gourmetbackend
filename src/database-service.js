require("dotenv").config();

const database = require("./database");

// Set the AWS Region
const REGION = "us-east-1"; //e.g. "us-east-1"

// Set the parameters

// Create DynamoDB service object
// const dbclient = new DynamoDBClient({ region: REGION });

const DatabaseService = {
  //Add product to table 'products'
  async writeProductToTable(id, name) {
    const params = {
      TableName: "products",
      Item: {
        product_id: { S: id },
        product_name: { S: name },
      },
    };
    database.writeNewData(params);
  },
  async getProductToAddWarranty(id, duration) {
    const params = {
      TableName: "products",
      Key: { product_id: id },
      UpdateExpression: "ADD #name :value",
      ExpressionAttributeNames: {
        "#name": "warranty-duration",
      },
      ExpressionAttributeValues: {
        ":value": `${duration}`,
        //{N :/= duration}
        //new AttributeValue{N = duration}
      },
    };
    database.updateData(params);
  },
  async addCustomerRegistration(customer_info) {
    //if customer_info.bought_from === "amazon",
    //here comes code to check if the item was actually sold on amazon

    //
    const paramsToRead = {
      TableName: "products",
      Key: {
        product_id: { S: id },
      },
      ProjectionExpression: "product_id",
    };

    const data = database.getDataSingle(paramsToRead);
    //get item-name
    //get item-id
    //get item-warranty-duration

    const name = data.item - name; //so they'd stop striking out name

    const paramsToWrite = {
      TableName: "warranty",
      Item: {
        product_id: { S: id },
        product_name: { S: name },
        warranty_exp: {
          /*S:*/
          /*new date plus add item-warranty-duration years */
        },
        warranty_start: { S: new Date().getTime() },
        //owner_email
        //owner_name
        //bought_from
        //warranty_duration
        //waranty_start
      },
    };
    database.writeNewData(paramsToWrite);
  },
  async getAllWarranties() {
    const data = getBatchData(/*params?*/);
    //code to display data
  },
};

module.exports = DatabaseService;
