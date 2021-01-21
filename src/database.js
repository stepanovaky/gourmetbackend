const {
  DynamoDBClient,
  DeleteTableCommand,
  CreateTableCommand,
  ListTablesCommand,
  PutItemCommand,
  UpdateItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");

class House {
  constructor(color) {
    this.color = color;
  }

  getFurniture() {
    return "sofa";
  }
}

const houseObject = new House("red");
const houseObject2 = new House("blue");

console.log(houseObject.color);
console.log(houseObject.getFurniture());

console.log(houseObject2.color);
console.log(houseObject2.getFurniture());

// Set the AWS Region
const REGION = "us-east-1"; //e.g. "us-east-1"

// Set the parameters

// Create DynamoDB service object
const dbclient = new DynamoDBClient({ region: REGION });

class database {
  constructor() {}

  async writeNewData(params) {
    try {
      const data = await dbclient.send(new PutItemCommand(params));
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }

  async updateData(params) {
    try {
      const data = await dbclient.send(new UpdateItemCommand(params));
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }

  async getDataSingle(params) {
    const data = await dbclient.send(new GetItemCommand(params));
    console.log("Success", data);
    return data;
  }

  async getBatchData(/*params? probably include table*/) {
    try {
      const data = await dbclient.send(new ScanCommand(/*params? */));
      return data;
    } catch (err) {
      console.log("Error", err);
    }
  }
}

module.exports = database;
